-- Cria a tabela "descargas_destino": pesagem UNICA por viagem do
-- caminhao ate a B-Green (normalmente uma vez por semana), com o
-- ticket/nota de pesagem deles -- independente dos MTRs individuais
-- de cada cliente coletado ao longo da semana.
-- Substitui a tentativa anterior de registrar peso por MTR (colunas
-- peso_descarga/data_descarga em mtrs), que nao batia com o fluxo
-- real de trabalho.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.descargas_destino (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    data_descarga date NOT NULL,
    peso_kg numeric(12,3) NOT NULL,
    destinador text DEFAULT 'B-GREEN GESTAO AMBIENTAL S.A.'::text,
    numero_ticket text,
    observacoes text,
    url_ticket text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.descargas_destino DROP CONSTRAINT IF EXISTS descargas_destino_pkey;
ALTER TABLE public.descargas_destino ADD CONSTRAINT descargas_destino_pkey PRIMARY KEY (id);

ALTER TABLE public.descargas_destino DROP CONSTRAINT IF EXISTS descargas_destino_owner_id_fkey;
ALTER TABLE public.descargas_destino
  ADD CONSTRAINT descargas_destino_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.descargas_destino ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_descargas_destino" ON public.descargas_destino;
CREATE POLICY "authenticated_all_descargas_destino" ON public.descargas_destino
  FOR ALL TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Remove as colunas da tentativa anterior (peso por MTR individual),
-- que nao sao mais usadas pelo sistema.
ALTER TABLE public.mtrs DROP COLUMN IF EXISTS peso_descarga;
ALTER TABLE public.mtrs DROP COLUMN IF EXISTS data_descarga;
