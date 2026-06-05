ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS ultimo_email_status TEXT,
  ADD COLUMN IF NOT EXISTS ultimo_email_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ultimo_email_destino TEXT,
  ADD COLUMN IF NOT EXISTS ultimo_email_erro TEXT;