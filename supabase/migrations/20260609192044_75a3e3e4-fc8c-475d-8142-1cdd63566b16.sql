
-- Estende propostas para PGRSS
ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'comercial',
  ADD COLUMN IF NOT EXISTS dados_pgrss jsonb,
  ADD COLUMN IF NOT EXISTS conteudo_html text;

CREATE INDEX IF NOT EXISTS idx_propostas_tipo ON public.propostas(tipo);

-- Tabela de preços configurável (1 conjunto por usuário/owner)
CREATE TABLE IF NOT EXISTS public.pgrss_precos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preco_elaboracao numeric(14,2) NOT NULL DEFAULT 0,
  preco_visita_tecnica numeric(14,2) NOT NULL DEFAULT 0,
  preco_deslocamento_km numeric(14,2) NOT NULL DEFAULT 0,
  preco_art numeric(14,2) NOT NULL DEFAULT 0,
  preco_treinamento numeric(14,2) NOT NULL DEFAULT 0,
  preco_atualizacao_anual numeric(14,2) NOT NULL DEFAULT 0,
  preco_consultoria_mensal numeric(14,2) NOT NULL DEFAULT 0,
  multiplicador_pequeno numeric(6,3) NOT NULL DEFAULT 1.0,
  multiplicador_medio numeric(6,3) NOT NULL DEFAULT 1.5,
  multiplicador_grande numeric(6,3) NOT NULL DEFAULT 2.2,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pgrss_precos TO authenticated;
GRANT ALL ON public.pgrss_precos TO service_role;

ALTER TABLE public.pgrss_precos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage pgrss_precos"
  ON public.pgrss_precos FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER tg_pgrss_precos_updated BEFORE UPDATE ON public.pgrss_precos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
