
CREATE TABLE public.faturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  contrato_id uuid REFERENCES public.contratos(id) ON DELETE SET NULL,
  numero text NOT NULL,
  competencia text NOT NULL,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento date NOT NULL,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  valor_pago numeric(14,2),
  data_pagamento date,
  forma_pagamento text,
  status text NOT NULL DEFAULT 'pendente',
  descricao text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faturas TO authenticated;
GRANT ALL ON public.faturas TO service_role;

ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage faturas" ON public.faturas FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER tg_faturas_updated BEFORE UPDATE ON public.faturas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_faturas_owner ON public.faturas(owner_id);
CREATE INDEX idx_faturas_cliente ON public.faturas(cliente_id);
CREATE INDEX idx_faturas_status ON public.faturas(status);
CREATE INDEX idx_faturas_vencimento ON public.faturas(data_vencimento);
