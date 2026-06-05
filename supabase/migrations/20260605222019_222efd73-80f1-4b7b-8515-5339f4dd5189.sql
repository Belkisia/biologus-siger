
CREATE TABLE public.contrato_modelos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  conteudo_html TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  versao_atual INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contrato_modelos_owner ON public.contrato_modelos(owner_id);

CREATE TABLE public.contrato_modelo_versoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modelo_id UUID NOT NULL REFERENCES public.contrato_modelos(id) ON DELETE CASCADE,
  versao INT NOT NULL,
  conteudo_html TEXT NOT NULL,
  motivo TEXT,
  alterado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (modelo_id, versao)
);
CREATE INDEX idx_modelo_versoes_modelo ON public.contrato_modelo_versoes(modelo_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contrato_modelos TO authenticated;
GRANT ALL ON public.contrato_modelos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contrato_modelo_versoes TO authenticated;
GRANT ALL ON public.contrato_modelo_versoes TO service_role;

ALTER TABLE public.contrato_modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_modelo_versoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver modelos próprios e do sistema" ON public.contrato_modelos
  FOR SELECT TO authenticated
  USING (owner_id IS NULL OR owner_id = auth.uid());

CREATE POLICY "Criar modelos próprios" ON public.contrato_modelos
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Editar modelos próprios" ON public.contrato_modelos
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Excluir modelos próprios" ON public.contrato_modelos
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Ver versões de modelos acessíveis" ON public.contrato_modelo_versoes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.contrato_modelos m WHERE m.id = modelo_id AND (m.owner_id IS NULL OR m.owner_id = auth.uid())));

CREATE POLICY "Criar versões de modelos próprios" ON public.contrato_modelo_versoes
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.contrato_modelos m WHERE m.id = modelo_id AND m.owner_id = auth.uid()));

CREATE TRIGGER tg_contrato_modelos_updated
BEFORE UPDATE ON public.contrato_modelos
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
