-- ============ emitente_config ============
CREATE TABLE public.emitente_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  inscricao_municipal TEXT NOT NULL,
  inscricao_estadual TEXT,
  regime_tributario TEXT NOT NULL DEFAULT 'simples_nacional',
  optante_simples_nacional BOOLEAN NOT NULL DEFAULT true,
  incentivador_cultural BOOLEAN NOT NULL DEFAULT false,
  item_lista_servico TEXT NOT NULL,
  codigo_tributario_municipio TEXT,
  codigo_cnae TEXT,
  aliquota NUMERIC(6,4) NOT NULL DEFAULT 0,
  iss_retido BOOLEAN NOT NULL DEFAULT false,
  natureza_operacao INTEGER NOT NULL DEFAULT 1,
  ambiente TEXT NOT NULL DEFAULT 'homologacao' CHECK (ambiente IN ('homologacao','producao')),
  endereco_logradouro TEXT,
  endereco_numero TEXT,
  endereco_complemento TEXT,
  endereco_bairro TEXT,
  endereco_cep TEXT,
  endereco_municipio TEXT,
  endereco_uf TEXT,
  endereco_codigo_municipio TEXT,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emitente_config TO authenticated;
GRANT ALL ON public.emitente_config TO service_role;
ALTER TABLE public.emitente_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emitente_owner_all" ON public.emitente_config
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER emitente_config_set_updated_at
  BEFORE UPDATE ON public.emitente_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ notas_fiscais ============
CREATE TABLE public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fatura_id UUID REFERENCES public.faturas(id) ON DELETE SET NULL,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  ref TEXT NOT NULL UNIQUE,
  ambiente TEXT NOT NULL DEFAULT 'homologacao',
  status TEXT NOT NULL DEFAULT 'processando'
    CHECK (status IN ('rascunho','processando','autorizada','erro','cancelada')),
  rps_numero TEXT,
  rps_serie TEXT,
  numero_nfse TEXT,
  codigo_verificacao TEXT,
  data_emissao TIMESTAMPTZ,
  valor_servicos NUMERIC(14,2) NOT NULL,
  aliquota NUMERIC(6,4),
  iss_valor NUMERIC(14,2),
  descricao TEXT NOT NULL,
  url_pdf TEXT,
  url_xml TEXT,
  mensagem_erro TEXT,
  payload_envio JSONB,
  payload_retorno JSONB,
  cancelada_em TIMESTAMPTZ,
  justificativa_cancelamento TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notas_fiscais_owner_idx ON public.notas_fiscais(owner_id);
CREATE INDEX notas_fiscais_fatura_idx ON public.notas_fiscais(fatura_id);
CREATE INDEX notas_fiscais_cliente_idx ON public.notas_fiscais(cliente_id);
CREATE INDEX notas_fiscais_status_idx ON public.notas_fiscais(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_fiscais TO authenticated;
GRANT ALL ON public.notas_fiscais TO service_role;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notas_owner_all" ON public.notas_fiscais
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "notas_cliente_read" ON public.notas_fiscais
  FOR SELECT TO authenticated
  USING (cliente_id = public.current_cliente_id());

CREATE TRIGGER notas_fiscais_set_updated_at
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();