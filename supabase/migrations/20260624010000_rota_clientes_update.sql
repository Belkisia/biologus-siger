-- Adicionar campos necessários na rota_clientes
ALTER TABLE public.rota_clientes
  ADD COLUMN IF NOT EXISTS rota_codigo text,
  ADD COLUMN IF NOT EXISTS coletado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_coleta date;

-- Index para busca por rota_codigo
CREATE INDEX IF NOT EXISTS idx_rota_clientes_codigo ON public.rota_clientes(rota_codigo);

-- Adicionar rota_codigo nas mtrs também
ALTER TABLE public.mtrs
  ADD COLUMN IF NOT EXISTS rota_codigo text;
