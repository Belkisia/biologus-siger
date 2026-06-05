
CREATE TABLE public.cliente_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'geral',
  descricao TEXT,
  versao_atual INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  tamanho_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cliente_documentos_cliente ON public.cliente_documentos(cliente_id);
CREATE INDEX idx_cliente_documentos_owner ON public.cliente_documentos(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cliente_documentos TO authenticated;
GRANT ALL ON public.cliente_documentos TO service_role;
ALTER TABLE public.cliente_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage cliente_documentos" ON public.cliente_documentos
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Cliente vê seus documentos" ON public.cliente_documentos
  FOR SELECT TO authenticated
  USING (cliente_id = public.current_cliente_id());

CREATE TRIGGER trg_cliente_documentos_updated_at
  BEFORE UPDATE ON public.cliente_documentos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.cliente_documento_versoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  documento_id UUID NOT NULL REFERENCES public.cliente_documentos(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  tamanho_bytes BIGINT,
  nome_arquivo TEXT,
  acao TEXT NOT NULL DEFAULT 'upload',
  nota TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (documento_id, versao)
);
CREATE INDEX idx_cliente_doc_versoes_doc ON public.cliente_documento_versoes(documento_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cliente_documento_versoes TO authenticated;
GRANT ALL ON public.cliente_documento_versoes TO service_role;
ALTER TABLE public.cliente_documento_versoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage doc versoes" ON public.cliente_documento_versoes
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Cliente vê versões dos seus documentos" ON public.cliente_documento_versoes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.cliente_documentos d
    WHERE d.id = documento_id AND d.cliente_id = public.current_cliente_id()
  ));
