-- Adiciona registro do peso na DESCARGA (quando o caminhao descarrega
-- no destino final), separado do peso na COLETA (ja existia, campo
-- "quantidade", preenchido ao dar baixa no MTR).
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente.

ALTER TABLE public.mtrs ADD COLUMN IF NOT EXISTS peso_descarga numeric(12,3);
ALTER TABLE public.mtrs ADD COLUMN IF NOT EXISTS data_descarga date;
