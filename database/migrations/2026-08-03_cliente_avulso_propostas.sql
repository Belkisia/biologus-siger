-- Restaura o suporte a "cliente avulso" em propostas (cliente digitado manualmente,
-- sem precisar estar cadastrado na tabela `clientes`).
-- Rode este script no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente: pode ser executado mais de uma vez sem erro.

ALTER TABLE public.propostas
  ALTER COLUMN cliente_id DROP NOT NULL;

ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS cliente_avulso_nome text,
  ADD COLUMN IF NOT EXISTS cliente_avulso_cnpj text,
  ADD COLUMN IF NOT EXISTS cliente_avulso_cidade text,
  ADD COLUMN IF NOT EXISTS cliente_avulso_estado text,
  ADD COLUMN IF NOT EXISTS cliente_avulso_email text,
  ADD COLUMN IF NOT EXISTS cliente_avulso_telefone text,
  ADD COLUMN IF NOT EXISTS cliente_avulso_endereco text;

-- Garante que toda proposta tenha OU cliente_id OU cliente_avulso_nome
ALTER TABLE public.propostas
  DROP CONSTRAINT IF EXISTS propostas_cliente_check;

ALTER TABLE public.propostas
  ADD CONSTRAINT propostas_cliente_check
  CHECK (cliente_id IS NOT NULL OR cliente_avulso_nome IS NOT NULL);
