-- Adiciona campo de frequência de coleta em propostas (Mensal, Quinzenal, Semanal, Eventual).
-- Rode este script no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente: pode ser executado mais de uma vez sem erro.

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS frequencia text DEFAULT 'Mensal';
