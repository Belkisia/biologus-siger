-- Corrige o tipo da coluna vigencia_anos em contratos.
-- O codigo grava valores descritivos como "01 (um)", "0,5 (meio)",
-- "0,25 (tres meses)" -- nunca um numero puro -- entao a coluna precisa
-- ser texto, nao integer.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).

ALTER TABLE public.contratos
  ALTER COLUMN vigencia_anos TYPE text USING vigencia_anos::text;
