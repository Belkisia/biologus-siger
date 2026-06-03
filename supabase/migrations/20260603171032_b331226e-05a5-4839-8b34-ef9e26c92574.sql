
CREATE TABLE public.licencas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL,
  orgao_emissor TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  data_validade DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa',
  escopo TEXT,
  condicionantes TEXT,
  arquivo_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licencas TO authenticated;
GRANT ALL ON public.licencas TO service_role;
ALTER TABLE public.licencas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own licencas" ON public.licencas FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX idx_licencas_owner ON public.licencas(owner_id);
CREATE INDEX idx_licencas_cliente ON public.licencas(cliente_id);
CREATE INDEX idx_licencas_validade ON public.licencas(data_validade);
CREATE INDEX idx_licencas_status ON public.licencas(status);
CREATE TRIGGER trg_licencas_updated_at BEFORE UPDATE ON public.licencas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
