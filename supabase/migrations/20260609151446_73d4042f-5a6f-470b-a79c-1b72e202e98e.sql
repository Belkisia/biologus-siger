ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS frequencia_coleta text,
  ADD COLUMN IF NOT EXISTS grupos_residuos text,
  ADD COLUMN IF NOT EXISTS limite_kg numeric,
  ADD COLUMN IF NOT EXISTS valor_excedente numeric,
  ADD COLUMN IF NOT EXISTS vigencia_anos text;