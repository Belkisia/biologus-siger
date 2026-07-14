-- clientes: colunas faltantes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS fantasia TEXT,
  ADD COLUMN IF NOT EXISTS logradouro TEXT,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

-- mtrs: colunas faltantes
ALTER TABLE public.mtrs
  ADD COLUMN IF NOT EXISTS rota_codigo TEXT,
  ADD COLUMN IF NOT EXISTS assinatura_gerador TEXT,
  ADD COLUMN IF NOT EXISTS assinatura_transportador TEXT,
  ADD COLUMN IF NOT EXISTS data_baixa TIMESTAMPTZ;

-- ============ rotas ============
CREATE TABLE IF NOT EXISTS public.rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  semana TEXT,
  dias_semana TEXT[],
  duracao_dias INTEGER DEFAULT 1,
  carro TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, codigo)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rotas TO authenticated;
GRANT ALL ON public.rotas TO service_role;
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rotas_owner_all" ON public.rotas FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER rotas_set_updated_at BEFORE UPDATE ON public.rotas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ rota_clientes ============
CREATE TABLE IF NOT EXISTS public.rota_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rota_id UUID REFERENCES public.rotas(id) ON DELETE CASCADE,
  rota_codigo TEXT,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 1,
  frequencia TEXT NOT NULL DEFAULT 'semanal',
  coletado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS rota_clientes_rota_cliente_uidx
  ON public.rota_clientes(rota_id, cliente_id) WHERE rota_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS rota_clientes_codigo_cliente_uidx
  ON public.rota_clientes(rota_codigo, cliente_id) WHERE rota_codigo IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rota_clientes TO authenticated;
GRANT ALL ON public.rota_clientes TO service_role;
ALTER TABLE public.rota_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rota_clientes_owner_all" ON public.rota_clientes FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- ============ boletins_medicao ============
CREATE TABLE IF NOT EXISTS public.boletins_medicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mtr_id UUID REFERENCES public.mtrs(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  data_coleta DATE NOT NULL DEFAULT CURRENT_DATE,
  peso_coletado NUMERIC(14,3),
  unidade TEXT,
  nome_responsavel TEXT,
  assinatura_cliente TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  cdf_id TEXT,
  numero TEXT,
  pagamento_confirmado BOOLEAN NOT NULL DEFAULT false,
  cdf_enviado BOOLEAN NOT NULL DEFAULT false,
  data_pagamento TIMESTAMPTZ,
  data_envio_cdf TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS boletins_medicao_data_idx ON public.boletins_medicao(data_coleta);
CREATE INDEX IF NOT EXISTS boletins_medicao_owner_idx ON public.boletins_medicao(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletins_medicao TO authenticated;
GRANT ALL ON public.boletins_medicao TO service_role;
ALTER TABLE public.boletins_medicao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boletins_owner_all" ON public.boletins_medicao FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER boletins_medicao_set_updated_at BEFORE UPDATE ON public.boletins_medicao
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();