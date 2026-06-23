--
-- PostgreSQL database dump
--

\restrict KjEQ2VnMjdMx93RKPru2Ol3GRHuUHYyYOyxX69uMd7OeL3CX5eBIT0QgvU15uz8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = off;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'diretor',
    'financeiro',
    'comercial',
    'operacional',
    'motorista',
    'cliente'
);


--
-- Name: documento_tipo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.documento_tipo AS ENUM (
    'contrato',
    'proposta'
);


--
-- Name: signatario_papel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.signatario_papel AS ENUM (
    'contratante',
    'contratada',
    'testemunha'
);


--
-- Name: signatario_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.signatario_status AS ENUM (
    'pendente',
    'otp_enviado',
    'assinado',
    'recusado',
    'expirado'
);


--
-- Name: current_cliente_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_cliente_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id FROM public.clientes WHERE user_id = auth.uid() LIMIT 1
$$;


--
-- Name: delete_email(text, bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_email(queue_name text, message_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;


--
-- Name: enqueue_email(text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enqueue_email(queue_name text, payload jsonb) RETURNS bigint
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;


--
-- Name: gerar_notificacoes_vencimento(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.gerar_notificacoes_vencimento() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  inseridas INTEGER := 0;
BEGIN
  INSERT INTO public.notificacoes (owner_id, tipo, titulo, mensagem, ref_tabela, ref_id, prioridade)
  SELECT l.owner_id,
         CASE WHEN l.data_validade < CURRENT_DATE THEN 'licenca_vencida' ELSE 'licenca_vencendo' END,
         'Licença ' || COALESCE(l.numero,'(sem número)') || ' - ' || l.tipo,
         'Validade: ' || to_char(l.data_validade,'DD/MM/YYYY'),
         'licencas', l.id,
         CASE WHEN l.data_validade < CURRENT_DATE + INTERVAL '15 days' THEN 'alta' ELSE 'media' END
  FROM public.licencas l
  WHERE l.data_validade <= CURRENT_DATE + INTERVAL '30 days'
    AND l.status <> 'cancelada'
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes n
      WHERE n.ref_tabela='licencas' AND n.ref_id=l.id
        AND n.created_at::date = CURRENT_DATE
    );
  GET DIAGNOSTICS inseridas = ROW_COUNT;

  INSERT INTO public.notificacoes (owner_id, tipo, titulo, mensagem, ref_tabela, ref_id, prioridade)
  SELECT f.owner_id,
         CASE WHEN f.data_vencimento < CURRENT_DATE THEN 'fatura_vencida' ELSE 'fatura_vencendo' END,
         'Fatura ' || COALESCE(f.numero, f.id::text),
         'Vencimento: ' || to_char(f.data_vencimento,'DD/MM/YYYY') || ' - R$ ' || to_char(f.valor,'FM999G999G990D00'),
         'faturas', f.id,
         CASE WHEN f.data_vencimento < CURRENT_DATE THEN 'alta' ELSE 'media' END
  FROM public.faturas f
  WHERE f.data_vencimento <= CURRENT_DATE + INTERVAL '7 days'
    AND COALESCE(f.status,'') NOT IN ('pago','cancelada')
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes n
      WHERE n.ref_tabela='faturas' AND n.ref_id=f.id
        AND n.created_at::date = CURRENT_DATE
    );

  RETURN inseridas;
END;
$_$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operacional');
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;


--
-- Name: move_to_dlq(text, text, bigint, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb) RETURNS bigint
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$$;


--
-- Name: read_email_batch(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer) RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;


--
-- Name: tg_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cdfs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cdfs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    mtr_id uuid NOT NULL,
    numero text NOT NULL,
    data_destinacao date NOT NULL,
    tecnologia text,
    destinador text,
    quantidade_destinada numeric(14,3),
    url_documento text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cliente_documento_versoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente_documento_versoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    documento_id uuid NOT NULL,
    owner_id uuid NOT NULL,
    versao integer NOT NULL,
    storage_path text NOT NULL,
    mime_type text,
    tamanho_bytes bigint,
    nome_arquivo text,
    acao text DEFAULT 'upload'::text NOT NULL,
    nota text,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cliente_documentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente_documentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    nome text NOT NULL,
    categoria text DEFAULT 'geral'::text NOT NULL,
    descricao text,
    versao_atual integer DEFAULT 1 NOT NULL,
    storage_path text NOT NULL,
    mime_type text,
    tamanho_bytes bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    razao_social text NOT NULL,
    nome_fantasia text,
    cnpj text NOT NULL,
    inscricao_estadual text,
    inscricao_municipal text,
    cnae text,
    porte text,
    responsavel_tecnico text,
    responsavel_financeiro text,
    responsavel_operacional text,
    telefone text,
    whatsapp text,
    email text,
    cep text,
    endereco text,
    numero text,
    bairro text,
    cidade text,
    estado text,
    latitude numeric,
    longitude numeric,
    status text DEFAULT 'ativo'::text NOT NULL,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: coletas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coletas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    data_agendada timestamp with time zone NOT NULL,
    horario text,
    tipo_residuo text NOT NULL,
    grupo_residuo text,
    quantidade_prevista numeric,
    unidade text DEFAULT 'kg'::text,
    motorista text,
    veiculo text,
    status text DEFAULT 'agendada'::text NOT NULL,
    peso_real numeric,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contas_bancarias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contas_bancarias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    nome text NOT NULL,
    banco text,
    agencia text,
    numero_conta text,
    saldo_inicial numeric(14,2) DEFAULT 0 NOT NULL,
    ativa boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contrato_itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contrato_itens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contrato_id uuid NOT NULL,
    descricao text NOT NULL,
    grupo_residuo text,
    unidade text DEFAULT 'kg'::text,
    preco_unitario numeric(14,4) DEFAULT 0 NOT NULL,
    franquia numeric(14,2),
    preco_excedente numeric(14,4),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contrato_modelo_versoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contrato_modelo_versoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    modelo_id uuid NOT NULL,
    versao integer NOT NULL,
    conteudo_html text NOT NULL,
    motivo text,
    alterado_por uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contrato_modelos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contrato_modelos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid,
    nome text NOT NULL,
    descricao text,
    conteudo_html text DEFAULT ''::text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    versao_atual integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contratos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contratos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    numero text NOT NULL,
    objeto text,
    data_inicio date NOT NULL,
    data_fim date,
    valor_mensal numeric(14,2),
    indice_reajuste text,
    periodicidade_reajuste text DEFAULT 'anual'::text,
    dia_vencimento integer,
    forma_pagamento text,
    observacoes text,
    status text DEFAULT 'ativo'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    ultimo_email_status text,
    ultimo_email_em timestamp with time zone,
    ultimo_email_destino text,
    ultimo_email_erro text,
    conteudo_html text,
    modelo_id uuid
);


--
-- Name: documento_assinaturas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documento_assinaturas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    signatario_id uuid NOT NULL,
    documento_tipo public.documento_tipo NOT NULL,
    documento_id uuid NOT NULL,
    hash_documento text NOT NULL,
    codigo_verificacao text NOT NULL,
    rubrica_base64 text,
    pdf_assinado_path text,
    ip text,
    user_agent text,
    geo jsonb,
    assinado_em timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_send_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_send_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id text,
    template_name text NOT NULL,
    recipient_email text NOT NULL,
    status text NOT NULL,
    error_message text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_send_log_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'suppressed'::text, 'failed'::text, 'bounced'::text, 'complained'::text, 'dlq'::text])))
);


--
-- Name: email_send_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_send_state (
    id integer DEFAULT 1 NOT NULL,
    retry_after_until timestamp with time zone,
    batch_size integer DEFAULT 10 NOT NULL,
    send_delay_ms integer DEFAULT 200 NOT NULL,
    auth_email_ttl_minutes integer DEFAULT 15 NOT NULL,
    transactional_email_ttl_minutes integer DEFAULT 60 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_send_state_id_check CHECK ((id = 1))
);


--
-- Name: email_unsubscribe_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_unsubscribe_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    used_at timestamp with time zone
);


--
-- Name: extrato_lancamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.extrato_lancamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    conta_id uuid NOT NULL,
    fit_id text,
    data_lancamento date NOT NULL,
    tipo text NOT NULL,
    valor numeric(14,2) NOT NULL,
    descricao text,
    memo text,
    status text DEFAULT 'pendente'::text NOT NULL,
    fatura_id uuid,
    conciliado_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: faturas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faturas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    contrato_id uuid,
    numero text NOT NULL,
    competencia text NOT NULL,
    data_emissao date DEFAULT CURRENT_DATE NOT NULL,
    data_vencimento date NOT NULL,
    valor numeric(14,2) DEFAULT 0 NOT NULL,
    valor_pago numeric(14,2),
    data_pagamento date,
    forma_pagamento text,
    status text DEFAULT 'pendente'::text NOT NULL,
    descricao text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: licencas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.licencas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid,
    numero text NOT NULL,
    tipo text NOT NULL,
    orgao_emissor text NOT NULL,
    data_emissao date NOT NULL,
    data_validade date NOT NULL,
    status text DEFAULT 'ativa'::text NOT NULL,
    escopo text,
    condicionantes text,
    arquivo_url text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mtrs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mtrs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    coleta_id uuid,
    numero text NOT NULL,
    data_emissao date DEFAULT CURRENT_DATE NOT NULL,
    gerador text,
    transportador text,
    destinador text,
    classe_ibama text,
    codigo_residuo text,
    descricao_residuo text NOT NULL,
    quantidade numeric(14,3) DEFAULT 0 NOT NULL,
    unidade text DEFAULT 'kg'::text NOT NULL,
    acondicionamento text,
    tecnologia_destinacao text,
    status text DEFAULT 'emitido'::text NOT NULL,
    url_documento text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notificacoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    tipo text NOT NULL,
    titulo text NOT NULL,
    mensagem text,
    ref_tabela text,
    ref_id uuid,
    lida boolean DEFAULT false NOT NULL,
    prioridade text DEFAULT 'media'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notificacoes_prioridade_check CHECK ((prioridade = ANY (ARRAY['baixa'::text, 'media'::text, 'alta'::text]))),
    CONSTRAINT notificacoes_tipo_check CHECK ((tipo = ANY (ARRAY['licenca_vencendo'::text, 'licenca_vencida'::text, 'fatura_vencendo'::text, 'fatura_vencida'::text, 'info'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: proposta_itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposta_itens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposta_id uuid NOT NULL,
    descricao text NOT NULL,
    tipo_residuo text,
    quantidade numeric(14,3) DEFAULT 1 NOT NULL,
    unidade text DEFAULT 'kg'::text NOT NULL,
    valor_unitario numeric(14,2) DEFAULT 0 NOT NULL,
    valor_total numeric(14,2) DEFAULT 0 NOT NULL,
    ordem integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: propostas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propostas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    numero text NOT NULL,
    data_emissao date DEFAULT CURRENT_DATE NOT NULL,
    validade date,
    condicoes_pagamento text,
    prazo_coleta text,
    valor_total numeric(14,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'rascunho'::text NOT NULL,
    observacoes text,
    contrato_id uuid,
    enviada_em timestamp with time zone,
    respondida_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: signatario_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signatario_eventos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    signatario_id uuid NOT NULL,
    evento text NOT NULL,
    ip text,
    user_agent text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: signatario_otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signatario_otps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    signatario_id uuid NOT NULL,
    codigo_hash text NOT NULL,
    tentativas integer DEFAULT 0 NOT NULL,
    expira_em timestamp with time zone DEFAULT (now() + '00:10:00'::interval) NOT NULL,
    usado_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: signatarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signatarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    documento_tipo public.documento_tipo NOT NULL,
    documento_id uuid NOT NULL,
    ordem integer DEFAULT 1 NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    cpf_cnpj text,
    papel public.signatario_papel DEFAULT 'contratada'::public.signatario_papel NOT NULL,
    token uuid DEFAULT gen_random_uuid() NOT NULL,
    status public.signatario_status DEFAULT 'pendente'::public.signatario_status NOT NULL,
    email_enviado_em timestamp with time zone,
    assinado_em timestamp with time zone,
    expira_em timestamp with time zone DEFAULT (now() + '30 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: suppressed_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppressed_emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    reason text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT suppressed_emails_reason_check CHECK ((reason = ANY (ARRAY['unsubscribe'::text, 'bounce'::text, 'complaint'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cdfs cdfs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cdfs
    ADD CONSTRAINT cdfs_pkey PRIMARY KEY (id);


--
-- Name: cliente_documento_versoes cliente_documento_versoes_documento_id_versao_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documento_versoes
    ADD CONSTRAINT cliente_documento_versoes_documento_id_versao_key UNIQUE (documento_id, versao);


--
-- Name: cliente_documento_versoes cliente_documento_versoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documento_versoes
    ADD CONSTRAINT cliente_documento_versoes_pkey PRIMARY KEY (id);


--
-- Name: cliente_documentos cliente_documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documentos
    ADD CONSTRAINT cliente_documentos_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: coletas coletas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coletas
    ADD CONSTRAINT coletas_pkey PRIMARY KEY (id);


--
-- Name: contas_bancarias contas_bancarias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contas_bancarias
    ADD CONSTRAINT contas_bancarias_pkey PRIMARY KEY (id);


--
-- Name: contrato_itens contrato_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_itens
    ADD CONSTRAINT contrato_itens_pkey PRIMARY KEY (id);


--
-- Name: contrato_modelo_versoes contrato_modelo_versoes_modelo_id_versao_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_modelo_versoes
    ADD CONSTRAINT contrato_modelo_versoes_modelo_id_versao_key UNIQUE (modelo_id, versao);


--
-- Name: contrato_modelo_versoes contrato_modelo_versoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_modelo_versoes
    ADD CONSTRAINT contrato_modelo_versoes_pkey PRIMARY KEY (id);


--
-- Name: contrato_modelos contrato_modelos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_modelos
    ADD CONSTRAINT contrato_modelos_pkey PRIMARY KEY (id);


--
-- Name: contratos contratos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_pkey PRIMARY KEY (id);


--
-- Name: documento_assinaturas documento_assinaturas_codigo_verificacao_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_assinaturas
    ADD CONSTRAINT documento_assinaturas_codigo_verificacao_key UNIQUE (codigo_verificacao);


--
-- Name: documento_assinaturas documento_assinaturas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_assinaturas
    ADD CONSTRAINT documento_assinaturas_pkey PRIMARY KEY (id);


--
-- Name: documento_assinaturas documento_assinaturas_signatario_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_assinaturas
    ADD CONSTRAINT documento_assinaturas_signatario_id_key UNIQUE (signatario_id);


--
-- Name: email_send_log email_send_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_send_log
    ADD CONSTRAINT email_send_log_pkey PRIMARY KEY (id);


--
-- Name: email_send_state email_send_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_send_state
    ADD CONSTRAINT email_send_state_pkey PRIMARY KEY (id);


--
-- Name: email_unsubscribe_tokens email_unsubscribe_tokens_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_unsubscribe_tokens
    ADD CONSTRAINT email_unsubscribe_tokens_email_key UNIQUE (email);


--
-- Name: email_unsubscribe_tokens email_unsubscribe_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_unsubscribe_tokens
    ADD CONSTRAINT email_unsubscribe_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_unsubscribe_tokens email_unsubscribe_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_unsubscribe_tokens
    ADD CONSTRAINT email_unsubscribe_tokens_token_key UNIQUE (token);


--
-- Name: extrato_lancamentos extrato_lancamentos_conta_id_fit_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extrato_lancamentos
    ADD CONSTRAINT extrato_lancamentos_conta_id_fit_id_key UNIQUE (conta_id, fit_id);


--
-- Name: extrato_lancamentos extrato_lancamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extrato_lancamentos
    ADD CONSTRAINT extrato_lancamentos_pkey PRIMARY KEY (id);


--
-- Name: faturas faturas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturas
    ADD CONSTRAINT faturas_pkey PRIMARY KEY (id);


--
-- Name: licencas licencas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencas
    ADD CONSTRAINT licencas_pkey PRIMARY KEY (id);


--
-- Name: mtrs mtrs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mtrs
    ADD CONSTRAINT mtrs_pkey PRIMARY KEY (id);


--
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: proposta_itens proposta_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposta_itens
    ADD CONSTRAINT proposta_itens_pkey PRIMARY KEY (id);


--
-- Name: propostas propostas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_pkey PRIMARY KEY (id);


--
-- Name: signatario_eventos signatario_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatario_eventos
    ADD CONSTRAINT signatario_eventos_pkey PRIMARY KEY (id);


--
-- Name: signatario_otps signatario_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatario_otps
    ADD CONSTRAINT signatario_otps_pkey PRIMARY KEY (id);


--
-- Name: signatarios signatarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatarios
    ADD CONSTRAINT signatarios_pkey PRIMARY KEY (id);


--
-- Name: signatarios signatarios_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatarios
    ADD CONSTRAINT signatarios_token_key UNIQUE (token);


--
-- Name: suppressed_emails suppressed_emails_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppressed_emails
    ADD CONSTRAINT suppressed_emails_email_key UNIQUE (email);


--
-- Name: suppressed_emails suppressed_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppressed_emails
    ADD CONSTRAINT suppressed_emails_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_assin_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assin_codigo ON public.documento_assinaturas USING btree (codigo_verificacao);


--
-- Name: idx_assin_doc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assin_doc ON public.documento_assinaturas USING btree (documento_tipo, documento_id);


--
-- Name: idx_cdfs_mtr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cdfs_mtr ON public.cdfs USING btree (mtr_id);


--
-- Name: idx_cdfs_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cdfs_owner ON public.cdfs USING btree (owner_id);


--
-- Name: idx_cliente_doc_versoes_doc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_doc_versoes_doc ON public.cliente_documento_versoes USING btree (documento_id);


--
-- Name: idx_cliente_documentos_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_documentos_cliente ON public.cliente_documentos USING btree (cliente_id);


--
-- Name: idx_cliente_documentos_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_documentos_owner ON public.cliente_documentos USING btree (owner_id);


--
-- Name: idx_clientes_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clientes_owner ON public.clientes USING btree (owner_id);


--
-- Name: idx_clientes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clientes_user_id ON public.clientes USING btree (user_id);


--
-- Name: idx_coletas_owner_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coletas_owner_data ON public.coletas USING btree (owner_id, data_agendada DESC);


--
-- Name: idx_contrato_itens_contrato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contrato_itens_contrato ON public.contrato_itens USING btree (contrato_id);


--
-- Name: idx_contrato_modelos_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contrato_modelos_owner ON public.contrato_modelos USING btree (owner_id);


--
-- Name: idx_contratos_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contratos_cliente ON public.contratos USING btree (cliente_id);


--
-- Name: idx_contratos_modelo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contratos_modelo ON public.contratos USING btree (modelo_id);


--
-- Name: idx_contratos_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contratos_owner ON public.contratos USING btree (owner_id);


--
-- Name: idx_email_send_log_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_send_log_created ON public.email_send_log USING btree (created_at DESC);


--
-- Name: idx_email_send_log_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_send_log_message ON public.email_send_log USING btree (message_id);


--
-- Name: idx_email_send_log_message_sent_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_email_send_log_message_sent_unique ON public.email_send_log USING btree (message_id) WHERE (status = 'sent'::text);


--
-- Name: idx_email_send_log_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_send_log_recipient ON public.email_send_log USING btree (recipient_email);


--
-- Name: idx_eventos_sig; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_eventos_sig ON public.signatario_eventos USING btree (signatario_id, created_at);


--
-- Name: idx_extrato_conta_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_extrato_conta_data ON public.extrato_lancamentos USING btree (conta_id, data_lancamento DESC);


--
-- Name: idx_extrato_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_extrato_status ON public.extrato_lancamentos USING btree (status);


--
-- Name: idx_faturas_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faturas_cliente ON public.faturas USING btree (cliente_id);


--
-- Name: idx_faturas_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faturas_owner ON public.faturas USING btree (owner_id);


--
-- Name: idx_faturas_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faturas_status ON public.faturas USING btree (status);


--
-- Name: idx_faturas_vencimento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faturas_vencimento ON public.faturas USING btree (data_vencimento);


--
-- Name: idx_licencas_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licencas_cliente ON public.licencas USING btree (cliente_id);


--
-- Name: idx_licencas_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licencas_owner ON public.licencas USING btree (owner_id);


--
-- Name: idx_licencas_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licencas_status ON public.licencas USING btree (status);


--
-- Name: idx_licencas_validade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licencas_validade ON public.licencas USING btree (data_validade);


--
-- Name: idx_modelo_versoes_modelo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modelo_versoes_modelo ON public.contrato_modelo_versoes USING btree (modelo_id);


--
-- Name: idx_mtrs_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mtrs_cliente ON public.mtrs USING btree (cliente_id);


--
-- Name: idx_mtrs_coleta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mtrs_coleta ON public.mtrs USING btree (coleta_id);


--
-- Name: idx_mtrs_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mtrs_owner ON public.mtrs USING btree (owner_id);


--
-- Name: idx_notif_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_owner ON public.notificacoes USING btree (owner_id, lida, created_at DESC);


--
-- Name: idx_notif_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_ref ON public.notificacoes USING btree (ref_tabela, ref_id);


--
-- Name: idx_otps_sig; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otps_sig ON public.signatario_otps USING btree (signatario_id);


--
-- Name: idx_proposta_itens_proposta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposta_itens_proposta ON public.proposta_itens USING btree (proposta_id);


--
-- Name: idx_propostas_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_propostas_cliente ON public.propostas USING btree (cliente_id);


--
-- Name: idx_propostas_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_propostas_owner ON public.propostas USING btree (owner_id);


--
-- Name: idx_signatarios_doc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatarios_doc ON public.signatarios USING btree (documento_tipo, documento_id);


--
-- Name: idx_signatarios_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatarios_owner ON public.signatarios USING btree (owner_id);


--
-- Name: idx_signatarios_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatarios_token ON public.signatarios USING btree (token);


--
-- Name: idx_suppressed_emails_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppressed_emails_email ON public.suppressed_emails USING btree (email);


--
-- Name: idx_unsubscribe_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens USING btree (token);


--
-- Name: cdfs tg_cdfs_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_cdfs_updated BEFORE UPDATE ON public.cdfs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: contas_bancarias tg_contas_bancarias_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_contas_bancarias_updated BEFORE UPDATE ON public.contas_bancarias FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: contrato_modelos tg_contrato_modelos_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_contrato_modelos_updated BEFORE UPDATE ON public.contrato_modelos FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: contratos tg_contratos_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_contratos_updated BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: extrato_lancamentos tg_extrato_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_extrato_updated BEFORE UPDATE ON public.extrato_lancamentos FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: faturas tg_faturas_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_faturas_updated BEFORE UPDATE ON public.faturas FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: mtrs tg_mtrs_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_mtrs_updated BEFORE UPDATE ON public.mtrs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: propostas tg_propostas_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_propostas_updated BEFORE UPDATE ON public.propostas FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: signatarios tg_signatarios_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tg_signatarios_updated BEFORE UPDATE ON public.signatarios FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: cliente_documentos trg_cliente_documentos_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cliente_documentos_updated_at BEFORE UPDATE ON public.cliente_documentos FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: clientes trg_clientes_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: coletas trg_coletas_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_coletas_updated BEFORE UPDATE ON public.coletas FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: licencas trg_licencas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_licencas_updated_at BEFORE UPDATE ON public.licencas FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: notificacoes trg_notif_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notif_updated_at BEFORE UPDATE ON public.notificacoes FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: cdfs cdfs_mtr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cdfs
    ADD CONSTRAINT cdfs_mtr_id_fkey FOREIGN KEY (mtr_id) REFERENCES public.mtrs(id) ON DELETE CASCADE;


--
-- Name: cliente_documento_versoes cliente_documento_versoes_documento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documento_versoes
    ADD CONSTRAINT cliente_documento_versoes_documento_id_fkey FOREIGN KEY (documento_id) REFERENCES public.cliente_documentos(id) ON DELETE CASCADE;


--
-- Name: cliente_documento_versoes cliente_documento_versoes_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documento_versoes
    ADD CONSTRAINT cliente_documento_versoes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: cliente_documento_versoes cliente_documento_versoes_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documento_versoes
    ADD CONSTRAINT cliente_documento_versoes_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: cliente_documentos cliente_documentos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documentos
    ADD CONSTRAINT cliente_documentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: cliente_documentos cliente_documentos_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_documentos
    ADD CONSTRAINT cliente_documentos_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: clientes clientes_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: clientes clientes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: coletas coletas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coletas
    ADD CONSTRAINT coletas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: coletas coletas_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coletas
    ADD CONSTRAINT coletas_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: contrato_itens contrato_itens_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_itens
    ADD CONSTRAINT contrato_itens_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE CASCADE;


--
-- Name: contrato_modelo_versoes contrato_modelo_versoes_alterado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_modelo_versoes
    ADD CONSTRAINT contrato_modelo_versoes_alterado_por_fkey FOREIGN KEY (alterado_por) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: contrato_modelo_versoes contrato_modelo_versoes_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_modelo_versoes
    ADD CONSTRAINT contrato_modelo_versoes_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.contrato_modelos(id) ON DELETE CASCADE;


--
-- Name: contrato_modelos contrato_modelos_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_modelos
    ADD CONSTRAINT contrato_modelos_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: contratos contratos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;


--
-- Name: contratos contratos_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.contrato_modelos(id) ON DELETE SET NULL;


--
-- Name: documento_assinaturas documento_assinaturas_signatario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_assinaturas
    ADD CONSTRAINT documento_assinaturas_signatario_id_fkey FOREIGN KEY (signatario_id) REFERENCES public.signatarios(id) ON DELETE CASCADE;


--
-- Name: extrato_lancamentos extrato_lancamentos_conta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extrato_lancamentos
    ADD CONSTRAINT extrato_lancamentos_conta_id_fkey FOREIGN KEY (conta_id) REFERENCES public.contas_bancarias(id) ON DELETE CASCADE;


--
-- Name: extrato_lancamentos extrato_lancamentos_fatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extrato_lancamentos
    ADD CONSTRAINT extrato_lancamentos_fatura_id_fkey FOREIGN KEY (fatura_id) REFERENCES public.faturas(id) ON DELETE SET NULL;


--
-- Name: faturas faturas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturas
    ADD CONSTRAINT faturas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;


--
-- Name: faturas faturas_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faturas
    ADD CONSTRAINT faturas_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE SET NULL;


--
-- Name: licencas licencas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencas
    ADD CONSTRAINT licencas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;


--
-- Name: licencas licencas_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencas
    ADD CONSTRAINT licencas_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mtrs mtrs_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mtrs
    ADD CONSTRAINT mtrs_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;


--
-- Name: mtrs mtrs_coleta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mtrs
    ADD CONSTRAINT mtrs_coleta_id_fkey FOREIGN KEY (coleta_id) REFERENCES public.coletas(id) ON DELETE SET NULL;


--
-- Name: notificacoes notificacoes_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: proposta_itens proposta_itens_proposta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposta_itens
    ADD CONSTRAINT proposta_itens_proposta_id_fkey FOREIGN KEY (proposta_id) REFERENCES public.propostas(id) ON DELETE CASCADE;


--
-- Name: propostas propostas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;


--
-- Name: propostas propostas_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE SET NULL;


--
-- Name: propostas propostas_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propostas
    ADD CONSTRAINT propostas_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: signatario_eventos signatario_eventos_signatario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatario_eventos
    ADD CONSTRAINT signatario_eventos_signatario_id_fkey FOREIGN KEY (signatario_id) REFERENCES public.signatarios(id) ON DELETE CASCADE;


--
-- Name: signatario_otps signatario_otps_signatario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatario_otps
    ADD CONSTRAINT signatario_otps_signatario_id_fkey FOREIGN KEY (signatario_id) REFERENCES public.signatarios(id) ON DELETE CASCADE;


--
-- Name: signatarios signatarios_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatarios
    ADD CONSTRAINT signatarios_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR (user_id = auth.uid())));


--
-- Name: proposta_itens Cliente vê itens das suas propostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê itens das suas propostas" ON public.proposta_itens FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.propostas p
  WHERE ((p.id = proposta_itens.proposta_id) AND (p.cliente_id = public.current_cliente_id())))));


--
-- Name: clientes Cliente vê seu cadastro; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê seu cadastro" ON public.clientes FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cdfs Cliente vê seus CDFs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê seus CDFs" ON public.cdfs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.mtrs m
  WHERE ((m.id = cdfs.mtr_id) AND (m.cliente_id = public.current_cliente_id())))));


--
-- Name: mtrs Cliente vê seus MTRs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê seus MTRs" ON public.mtrs FOR SELECT TO authenticated USING ((cliente_id = public.current_cliente_id()));


--
-- Name: contratos Cliente vê seus contratos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê seus contratos" ON public.contratos FOR SELECT TO authenticated USING ((cliente_id = public.current_cliente_id()));


--
-- Name: cliente_documentos Cliente vê seus documentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê seus documentos" ON public.cliente_documentos FOR SELECT TO authenticated USING ((cliente_id = public.current_cliente_id()));


--
-- Name: coletas Cliente vê suas coletas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê suas coletas" ON public.coletas FOR SELECT TO authenticated USING ((cliente_id = public.current_cliente_id()));


--
-- Name: faturas Cliente vê suas faturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê suas faturas" ON public.faturas FOR SELECT TO authenticated USING ((cliente_id = public.current_cliente_id()));


--
-- Name: licencas Cliente vê suas licencas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê suas licencas" ON public.licencas FOR SELECT TO authenticated USING ((cliente_id = public.current_cliente_id()));


--
-- Name: propostas Cliente vê suas propostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê suas propostas" ON public.propostas FOR SELECT TO authenticated USING ((cliente_id = public.current_cliente_id()));


--
-- Name: cliente_documento_versoes Cliente vê versões dos seus documentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Cliente vê versões dos seus documentos" ON public.cliente_documento_versoes FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.cliente_documentos d
  WHERE ((d.id = cliente_documento_versoes.documento_id) AND (d.cliente_id = public.current_cliente_id())))));


--
-- Name: contrato_modelos Criar modelos próprios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Criar modelos próprios" ON public.contrato_modelos FOR INSERT TO authenticated WITH CHECK ((owner_id = auth.uid()));


--
-- Name: contrato_modelo_versoes Criar versões de modelos próprios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Criar versões de modelos próprios" ON public.contrato_modelo_versoes FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.contrato_modelos m
  WHERE ((m.id = contrato_modelo_versoes.modelo_id) AND (m.owner_id = auth.uid())))));


--
-- Name: contrato_modelos Editar modelos próprios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Editar modelos próprios" ON public.contrato_modelos FOR UPDATE TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));


--
-- Name: contrato_modelos Excluir modelos próprios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Excluir modelos próprios" ON public.contrato_modelos FOR DELETE TO authenticated USING ((owner_id = auth.uid()));


--
-- Name: notificacoes Owner gerencia suas notificacoes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner gerencia suas notificacoes" ON public.notificacoes USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: cdfs Owners manage cdfs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage cdfs" ON public.cdfs TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: cliente_documentos Owners manage cliente_documentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage cliente_documentos" ON public.cliente_documentos TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));


--
-- Name: clientes Owners manage clientes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage clientes" ON public.clientes TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: coletas Owners manage coletas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage coletas" ON public.coletas TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: contrato_itens Owners manage contrato_itens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage contrato_itens" ON public.contrato_itens TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.contratos c
  WHERE ((c.id = contrato_itens.contrato_id) AND (c.owner_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.contratos c
  WHERE ((c.id = contrato_itens.contrato_id) AND (c.owner_id = auth.uid())))));


--
-- Name: contratos Owners manage contratos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage contratos" ON public.contratos TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: cliente_documento_versoes Owners manage doc versoes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage doc versoes" ON public.cliente_documento_versoes TO authenticated USING ((owner_id = auth.uid())) WITH CHECK ((owner_id = auth.uid()));


--
-- Name: faturas Owners manage faturas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage faturas" ON public.faturas TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: mtrs Owners manage mtrs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage mtrs" ON public.mtrs TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: proposta_itens Owners manage proposta_itens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage proposta_itens" ON public.proposta_itens TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.propostas p
  WHERE ((p.id = proposta_itens.proposta_id) AND (p.owner_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.propostas p
  WHERE ((p.id = proposta_itens.proposta_id) AND (p.owner_id = auth.uid())))));


--
-- Name: propostas Owners manage propostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage propostas" ON public.propostas TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: email_send_log Service role can insert send log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert send log" ON public.email_send_log FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: suppressed_emails Service role can insert suppressed emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert suppressed emails" ON public.suppressed_emails FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: email_unsubscribe_tokens Service role can insert tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert tokens" ON public.email_unsubscribe_tokens FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: email_send_state Service role can manage send state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage send state" ON public.email_send_state USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: email_unsubscribe_tokens Service role can mark tokens as used; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can mark tokens as used" ON public.email_unsubscribe_tokens FOR UPDATE USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: email_send_log Service role can read send log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can read send log" ON public.email_send_log FOR SELECT USING ((auth.role() = 'service_role'::text));


--
-- Name: suppressed_emails Service role can read suppressed emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can read suppressed emails" ON public.suppressed_emails FOR SELECT USING ((auth.role() = 'service_role'::text));


--
-- Name: email_unsubscribe_tokens Service role can read tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can read tokens" ON public.email_unsubscribe_tokens FOR SELECT USING ((auth.role() = 'service_role'::text));


--
-- Name: email_send_log Service role can update send log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can update send log" ON public.email_send_log FOR UPDATE USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: profiles Users insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: licencas Users manage own licencas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own licencas" ON public.licencas TO authenticated USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: user_roles Users see own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: profiles Users view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: contrato_modelos Ver modelos próprios e do sistema; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ver modelos próprios e do sistema" ON public.contrato_modelos FOR SELECT TO authenticated USING (((owner_id IS NULL) OR (owner_id = auth.uid())));


--
-- Name: contrato_modelo_versoes Ver versões de modelos acessíveis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ver versões de modelos acessíveis" ON public.contrato_modelo_versoes FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.contrato_modelos m
  WHERE ((m.id = contrato_modelo_versoes.modelo_id) AND ((m.owner_id IS NULL) OR (m.owner_id = auth.uid()))))));


--
-- Name: documento_assinaturas assin_owner_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assin_owner_select ON public.documento_assinaturas FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.signatarios s
  WHERE ((s.id = documento_assinaturas.signatario_id) AND (s.owner_id = auth.uid())))));


--
-- Name: cdfs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cdfs ENABLE ROW LEVEL SECURITY;

--
-- Name: cliente_documento_versoes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cliente_documento_versoes ENABLE ROW LEVEL SECURITY;

--
-- Name: cliente_documentos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cliente_documentos ENABLE ROW LEVEL SECURITY;

--
-- Name: clientes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

--
-- Name: coletas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coletas ENABLE ROW LEVEL SECURITY;

--
-- Name: contas_bancarias; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;

--
-- Name: contrato_itens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contrato_itens ENABLE ROW LEVEL SECURITY;

--
-- Name: contrato_modelo_versoes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contrato_modelo_versoes ENABLE ROW LEVEL SECURITY;

--
-- Name: contrato_modelos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contrato_modelos ENABLE ROW LEVEL SECURITY;

--
-- Name: contratos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

--
-- Name: documento_assinaturas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documento_assinaturas ENABLE ROW LEVEL SECURITY;

--
-- Name: email_send_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

--
-- Name: email_send_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

--
-- Name: email_unsubscribe_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: signatario_eventos eventos_owner_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY eventos_owner_select ON public.signatario_eventos FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.signatarios s
  WHERE ((s.id = signatario_eventos.signatario_id) AND (s.owner_id = auth.uid())))));


--
-- Name: extrato_lancamentos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.extrato_lancamentos ENABLE ROW LEVEL SECURITY;

--
-- Name: faturas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

--
-- Name: licencas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.licencas ENABLE ROW LEVEL SECURITY;

--
-- Name: mtrs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mtrs ENABLE ROW LEVEL SECURITY;

--
-- Name: notificacoes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

--
-- Name: contas_bancarias owner manage contas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "owner manage contas" ON public.contas_bancarias USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: extrato_lancamentos owner manage extrato; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "owner manage extrato" ON public.extrato_lancamentos USING ((auth.uid() = owner_id)) WITH CHECK ((auth.uid() = owner_id));


--
-- Name: signatarios owner_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY owner_delete ON public.signatarios FOR DELETE TO authenticated USING ((owner_id = auth.uid()));


--
-- Name: signatarios owner_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY owner_insert ON public.signatarios FOR INSERT TO authenticated WITH CHECK ((owner_id = auth.uid()));


--
-- Name: signatarios owner_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY owner_select ON public.signatarios FOR SELECT TO authenticated USING ((owner_id = auth.uid()));


--
-- Name: signatarios owner_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY owner_update ON public.signatarios FOR UPDATE TO authenticated USING ((owner_id = auth.uid()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: proposta_itens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.proposta_itens ENABLE ROW LEVEL SECURITY;

--
-- Name: propostas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;

--
-- Name: signatario_eventos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.signatario_eventos ENABLE ROW LEVEL SECURITY;

--
-- Name: signatario_otps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.signatario_otps ENABLE ROW LEVEL SECURITY;

--
-- Name: signatarios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.signatarios ENABLE ROW LEVEL SECURITY;

--
-- Name: suppressed_emails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict KjEQ2VnMjdMx93RKPru2Ol3GRHuUHYyYOyxX69uMd7OeL3CX5eBIT0QgvU15uz8

