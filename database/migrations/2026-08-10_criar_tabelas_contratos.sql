-- Cria as tabelas `contratos` e `contrato_itens`, que o código já usa (aba
-- Contratos, conversão de proposta em contrato, assinatura eletrônica) mas
-- que nunca foram de fato criadas no banco — mesmo caso já visto com a
-- tabela `faturas`.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente: pode ser executado mais de uma vez sem erro.

CREATE TABLE IF NOT EXISTS public.contratos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    numero text NOT NULL,
    objeto text,
    data_inicio date NOT NULL,
    data_fim date,
    valor_mensal numeric(14,2),
    frequencia_coleta text,
    grupos_residuos text,
    limite_kg numeric(14,3),
    valor_excedente numeric(14,2),
    vigencia_anos integer,
    indice_reajuste text,
    periodicidade_reajuste text,
    dia_vencimento integer,
    forma_pagamento text,
    observacoes text,
    status text DEFAULT 'ativo'::text NOT NULL,
    conteudo_html text,
    modelo_id uuid,
    ultimo_email_em timestamp with time zone,
    ultimo_email_destino text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.contratos DROP CONSTRAINT IF EXISTS contratos_pkey;
ALTER TABLE public.contratos ADD CONSTRAINT contratos_pkey PRIMARY KEY (id);

ALTER TABLE public.contratos DROP CONSTRAINT IF EXISTS contratos_owner_id_fkey;
ALTER TABLE public.contratos
  ADD CONSTRAINT contratos_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.contratos DROP CONSTRAINT IF EXISTS contratos_cliente_id_fkey;
ALTER TABLE public.contratos
  ADD CONSTRAINT contratos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage contratos" ON public.contratos;
CREATE POLICY "Owners manage contratos" ON public.contratos
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- =====================================================================
-- contrato_itens
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.contrato_itens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contrato_id uuid NOT NULL,
    descricao text,
    grupo_residuo text,
    unidade text DEFAULT 'kg'::text,
    franquia numeric(14,3),
    preco_unitario numeric(14,4) DEFAULT 0,
    preco_excedente numeric(14,4) DEFAULT 0,
    ordem integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.contrato_itens DROP CONSTRAINT IF EXISTS contrato_itens_pkey;
ALTER TABLE public.contrato_itens ADD CONSTRAINT contrato_itens_pkey PRIMARY KEY (id);

ALTER TABLE public.contrato_itens DROP CONSTRAINT IF EXISTS contrato_itens_contrato_id_fkey;
ALTER TABLE public.contrato_itens
  ADD CONSTRAINT contrato_itens_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE CASCADE;

ALTER TABLE public.contrato_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage contrato_itens" ON public.contrato_itens;
CREATE POLICY "Owners manage contrato_itens" ON public.contrato_itens
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.contratos c WHERE c.id = contrato_itens.contrato_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.contratos c WHERE c.id = contrato_itens.contrato_id AND c.owner_id = auth.uid()));
