-- Cria a tabela `faturas`, que o código já usa (tela Financeiro) mas que
-- nunca foi de fato criada no banco de dados.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente: pode ser executado mais de uma vez sem erro.

CREATE TABLE IF NOT EXISTS public.faturas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    contrato_id uuid,
    numero text NOT NULL,
    competencia text NOT NULL,
    data_emissao date DEFAULT CURRENT_DATE NOT NULL,
    data_vencimento date NOT NULL,
    valor numeric(14,2) DEFAULT 0 NOT NULL,
    valor_pago numeric(14,2),
    data_pagamento date,
    forma_pagamento text,
    status text DEFAULT 'pendente'::text NOT NULL,
    descricao text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.faturas
  DROP CONSTRAINT IF EXISTS faturas_pkey;
ALTER TABLE public.faturas
  ADD CONSTRAINT faturas_pkey PRIMARY KEY (id);

ALTER TABLE public.faturas
  DROP CONSTRAINT IF EXISTS faturas_owner_id_fkey;
ALTER TABLE public.faturas
  ADD CONSTRAINT faturas_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.faturas
  DROP CONSTRAINT IF EXISTS faturas_cliente_id_fkey;
ALTER TABLE public.faturas
  ADD CONSTRAINT faturas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;

-- Sem FK para "contratos": essa tabela não existe neste banco.
-- contrato_id fica como uuid solto, sem vínculo, por enquanto.

-- Segurança em nível de linha (mesmo padrão usado nas outras tabelas do sistema)
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage faturas" ON public.faturas;
CREATE POLICY "Owners manage faturas" ON public.faturas
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Agora sim, a coluna que liga o boletim de medição à fatura gerada
ALTER TABLE public.boletins_medicao
  ADD COLUMN IF NOT EXISTS fatura_id uuid REFERENCES public.faturas(id);
