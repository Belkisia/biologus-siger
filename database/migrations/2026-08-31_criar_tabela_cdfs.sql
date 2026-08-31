-- Cria a tabela "cdfs" (Certificados de Destinação Final), que existia
-- no código (tela de menu "Certificados (CDF)" e na baixa de MTR via
-- Agendamento de Rotas) mas nunca tinha sido criada de verdade no banco.
-- Isso fazia a tela "Certificados (CDF)" ficar sempre vazia, e a baixa
-- de MTR na rota falhar silenciosamente ao tentar espelhar o CDF aqui
-- (erro 404 "Could not find the table 'public.cdfs'").
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.cdfs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    mtr_id uuid NOT NULL,
    numero text NOT NULL,
    data_destinacao date NOT NULL,
    tecnologia text,
    destinador text DEFAULT 'B-GREEN GESTAO AMBIENTAL S.A.'::text,
    quantidade_destinada numeric(12,3),
    observacoes text,
    url_documento text,
    enviado boolean DEFAULT false NOT NULL,
    data_envio timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.cdfs DROP CONSTRAINT IF EXISTS cdfs_pkey;
ALTER TABLE public.cdfs ADD CONSTRAINT cdfs_pkey PRIMARY KEY (id);

ALTER TABLE public.cdfs DROP CONSTRAINT IF EXISTS cdfs_owner_id_fkey;
ALTER TABLE public.cdfs
  ADD CONSTRAINT cdfs_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cdfs DROP CONSTRAINT IF EXISTS cdfs_mtr_id_fkey;
ALTER TABLE public.cdfs
  ADD CONSTRAINT cdfs_mtr_id_fkey FOREIGN KEY (mtr_id) REFERENCES public.mtrs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_cdfs_mtr_id ON public.cdfs(mtr_id);

ALTER TABLE public.cdfs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_cdfs" ON public.cdfs;
CREATE POLICY "authenticated_all_cdfs" ON public.cdfs
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Backfill: cria retroativamente um registro em "cdfs" para todo boletim
-- de medição que já tem um CDF gerado (via baixa de MTR na rota), para
-- que os CDFs já emitidos antes desta migração também apareçam na tela.
INSERT INTO public.cdfs (owner_id, mtr_id, numero, data_destinacao, tecnologia, destinador, quantidade_destinada, observacoes, enviado, created_at)
SELECT
    b.owner_id,
    b.mtr_id,
    b.cdf_id,
    b.data_coleta,
    'Incineração',
    'B-GREEN GESTAO AMBIENTAL S.A.',
    b.peso_coletado,
    b.observacoes,
    coalesce(b.cdf_enviado, false),
    b.created_at
FROM public.boletins_medicao b
WHERE b.cdf_id IS NOT NULL
  AND b.mtr_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.cdfs c WHERE c.mtr_id = b.mtr_id AND c.numero = b.cdf_id
  );
