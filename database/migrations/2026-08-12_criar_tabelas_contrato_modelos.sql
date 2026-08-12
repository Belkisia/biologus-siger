-- Cria as tabelas contrato_modelos e contrato_modelo_versoes, que o
-- codigo ja espera (tela Modelos de Contrato, geracao de novo contrato
-- padrao) mas que nunca foram criadas -- mesmo caso ja visto com
-- faturas, contratos e contrato_itens.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.contrato_modelos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid,
    nome text NOT NULL,
    descricao text,
    conteudo_html text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    versao_atual integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.contrato_modelos DROP CONSTRAINT IF EXISTS contrato_modelos_pkey;
ALTER TABLE public.contrato_modelos ADD CONSTRAINT contrato_modelos_pkey PRIMARY KEY (id);

ALTER TABLE public.contrato_modelos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_contrato_modelos" ON public.contrato_modelos;
CREATE POLICY "authenticated_read_contrato_modelos" ON public.contrato_modelos
  FOR SELECT TO authenticated USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_write_contrato_modelos" ON public.contrato_modelos;
CREATE POLICY "authenticated_write_contrato_modelos" ON public.contrato_modelos
  FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_update_contrato_modelos" ON public.contrato_modelos;
CREATE POLICY "authenticated_update_contrato_modelos" ON public.contrato_modelos
  FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_delete_contrato_modelos" ON public.contrato_modelos;
CREATE POLICY "authenticated_delete_contrato_modelos" ON public.contrato_modelos
  FOR DELETE TO authenticated USING (auth.role() = 'authenticated');


CREATE TABLE IF NOT EXISTS public.contrato_modelo_versoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    modelo_id uuid NOT NULL,
    versao integer NOT NULL,
    conteudo_html text NOT NULL,
    motivo text,
    alterado_por uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.contrato_modelo_versoes DROP CONSTRAINT IF EXISTS contrato_modelo_versoes_pkey;
ALTER TABLE public.contrato_modelo_versoes ADD CONSTRAINT contrato_modelo_versoes_pkey PRIMARY KEY (id);

ALTER TABLE public.contrato_modelo_versoes DROP CONSTRAINT IF EXISTS contrato_modelo_versoes_modelo_id_fkey;
ALTER TABLE public.contrato_modelo_versoes
  ADD CONSTRAINT contrato_modelo_versoes_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.contrato_modelos(id) ON DELETE CASCADE;

ALTER TABLE public.contrato_modelo_versoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_contrato_modelo_versoes" ON public.contrato_modelo_versoes;
CREATE POLICY "authenticated_all_contrato_modelo_versoes" ON public.contrato_modelo_versoes
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
