-- Cria a tabela "despesas" (contas a pagar): combustivel, agua,
-- energia, salarios, aluguel etc. -- o lado "saida" do financeiro,
-- que ate agora so tinha "faturas" (entrada).
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.despesas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    descricao text NOT NULL,
    categoria text NOT NULL,
    fornecedor text,
    data_vencimento date NOT NULL,
    data_pagamento date,
    valor numeric(14,2) NOT NULL,
    valor_pago numeric(14,2),
    forma_pagamento text,
    status text DEFAULT 'pendente'::text NOT NULL,
    observacoes text,
    conta_bancaria_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS despesas_pkey;
ALTER TABLE public.despesas ADD CONSTRAINT despesas_pkey PRIMARY KEY (id);

ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS despesas_owner_id_fkey;
ALTER TABLE public.despesas
  ADD CONSTRAINT despesas_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS despesas_conta_bancaria_id_fkey;
ALTER TABLE public.despesas
  ADD CONSTRAINT despesas_conta_bancaria_id_fkey FOREIGN KEY (conta_bancaria_id) REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_despesas" ON public.despesas;
CREATE POLICY "authenticated_all_despesas" ON public.despesas
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
