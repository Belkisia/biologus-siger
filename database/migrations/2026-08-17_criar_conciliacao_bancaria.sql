-- Cria as tabelas de Conciliacao Bancaria (contas_bancarias e
-- extrato_lancamentos), que a tela ja espera no codigo mas nunca
-- existiram no banco -- mesmo padrao ja visto varias vezes.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente.

-- 1) Contas bancarias cadastradas
CREATE TABLE IF NOT EXISTS public.contas_bancarias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    nome text NOT NULL,
    banco text,
    agencia text,
    numero_conta text,
    saldo_inicial numeric(14,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.contas_bancarias DROP CONSTRAINT IF EXISTS contas_bancarias_pkey;
ALTER TABLE public.contas_bancarias ADD CONSTRAINT contas_bancarias_pkey PRIMARY KEY (id);

ALTER TABLE public.contas_bancarias DROP CONSTRAINT IF EXISTS contas_bancarias_owner_id_fkey;
ALTER TABLE public.contas_bancarias
  ADD CONSTRAINT contas_bancarias_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_contas_bancarias" ON public.contas_bancarias;
CREATE POLICY "authenticated_all_contas_bancarias" ON public.contas_bancarias
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 2) Lancamentos do extrato (importados via OFX ou lançados manualmente)
CREATE TABLE IF NOT EXISTS public.extrato_lancamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    conta_id uuid NOT NULL,
    fit_id text,
    data_lancamento date NOT NULL,
    tipo text,
    valor numeric(14,2) NOT NULL,
    descricao text,
    memo text,
    status text DEFAULT 'pendente'::text NOT NULL,
    fatura_id uuid,
    conciliado_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.extrato_lancamentos DROP CONSTRAINT IF EXISTS extrato_lancamentos_pkey;
ALTER TABLE public.extrato_lancamentos ADD CONSTRAINT extrato_lancamentos_pkey PRIMARY KEY (id);

ALTER TABLE public.extrato_lancamentos DROP CONSTRAINT IF EXISTS extrato_lancamentos_owner_id_fkey;
ALTER TABLE public.extrato_lancamentos
  ADD CONSTRAINT extrato_lancamentos_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.extrato_lancamentos DROP CONSTRAINT IF EXISTS extrato_lancamentos_conta_id_fkey;
ALTER TABLE public.extrato_lancamentos
  ADD CONSTRAINT extrato_lancamentos_conta_id_fkey FOREIGN KEY (conta_id) REFERENCES public.contas_bancarias(id) ON DELETE CASCADE;

ALTER TABLE public.extrato_lancamentos DROP CONSTRAINT IF EXISTS extrato_lancamentos_fatura_id_fkey;
ALTER TABLE public.extrato_lancamentos
  ADD CONSTRAINT extrato_lancamentos_fatura_id_fkey FOREIGN KEY (fatura_id) REFERENCES public.faturas(id) ON DELETE SET NULL;

-- Evita duplicar o mesmo lançamento ao reimportar o mesmo OFX (usado no upsert)
ALTER TABLE public.extrato_lancamentos DROP CONSTRAINT IF EXISTS extrato_lancamentos_conta_fitid_key;
ALTER TABLE public.extrato_lancamentos
  ADD CONSTRAINT extrato_lancamentos_conta_fitid_key UNIQUE (conta_id, fit_id);

ALTER TABLE public.extrato_lancamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_extrato_lancamentos" ON public.extrato_lancamentos;
CREATE POLICY "authenticated_all_extrato_lancamentos" ON public.extrato_lancamentos
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
