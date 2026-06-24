-- Adicionar campos de geolocalização e integração se não existirem
ALTER TABLE public.clientes 
  ADD COLUMN IF NOT EXISTS id_integracao text,
  ADD COLUMN IF NOT EXISTS latitude numeric(10,7),
  ADD COLUMN IF NOT EXISTS longitude numeric(10,7),
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS complemento text,
  ADD COLUMN IF NOT EXISTS telefone text;

-- Index para busca por integração
CREATE INDEX IF NOT EXISTS idx_clientes_id_integracao ON public.clientes(id_integracao);
CREATE INDEX IF NOT EXISTS idx_clientes_cidade ON public.clientes(cidade);
CREATE INDEX IF NOT EXISTS idx_clientes_lat_lng ON public.clientes(latitude, longitude);
