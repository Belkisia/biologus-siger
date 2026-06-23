
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS conteudo_html TEXT,
  ADD COLUMN IF NOT EXISTS modelo_id UUID REFERENCES public.contrato_modelos(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_contratos_modelo ON public.contratos(modelo_id);
