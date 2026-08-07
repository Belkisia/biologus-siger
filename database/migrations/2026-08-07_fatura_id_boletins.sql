-- Liga os boletins de medição (CDF) ao módulo de faturamento.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente: pode ser executado mais de uma vez sem erro.

ALTER TABLE public.boletins_medicao
  ADD COLUMN IF NOT EXISTS fatura_id uuid REFERENCES public.faturas(id);
