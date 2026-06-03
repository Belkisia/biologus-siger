
CREATE TABLE public.mtrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  coleta_id uuid REFERENCES public.coletas(id) ON DELETE SET NULL,
  numero text NOT NULL,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  gerador text,
  transportador text,
  destinador text,
  classe_ibama text,
  codigo_residuo text,
  descricao_residuo text NOT NULL,
  quantidade numeric(14,3) NOT NULL DEFAULT 0,
  unidade text NOT NULL DEFAULT 'kg',
  acondicionamento text,
  tecnologia_destinacao text,
  status text NOT NULL DEFAULT 'emitido',
  url_documento text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  mtr_id uuid NOT NULL REFERENCES public.mtrs(id) ON DELETE CASCADE,
  numero text NOT NULL,
  data_destinacao date NOT NULL,
  tecnologia text,
  destinador text,
  quantidade_destinada numeric(14,3),
  url_documento text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mtrs TO authenticated;
GRANT ALL ON public.mtrs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cdfs TO authenticated;
GRANT ALL ON public.cdfs TO service_role;

ALTER TABLE public.mtrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage mtrs" ON public.mtrs FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners manage cdfs" ON public.cdfs FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER tg_mtrs_updated BEFORE UPDATE ON public.mtrs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_cdfs_updated BEFORE UPDATE ON public.cdfs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_mtrs_owner ON public.mtrs(owner_id);
CREATE INDEX idx_mtrs_cliente ON public.mtrs(cliente_id);
CREATE INDEX idx_mtrs_coleta ON public.mtrs(coleta_id);
CREATE INDEX idx_cdfs_mtr ON public.cdfs(mtr_id);
CREATE INDEX idx_cdfs_owner ON public.cdfs(owner_id);
