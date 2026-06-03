
CREATE TABLE public.contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  numero text NOT NULL,
  objeto text,
  data_inicio date NOT NULL,
  data_fim date,
  valor_mensal numeric(14,2),
  indice_reajuste text,
  periodicidade_reajuste text DEFAULT 'anual',
  dia_vencimento int,
  forma_pagamento text,
  observacoes text,
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contrato_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  grupo_residuo text,
  unidade text DEFAULT 'kg',
  preco_unitario numeric(14,4) NOT NULL DEFAULT 0,
  franquia numeric(14,2),
  preco_excedente numeric(14,4),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratos TO authenticated;
GRANT ALL ON public.contratos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contrato_itens TO authenticated;
GRANT ALL ON public.contrato_itens TO service_role;

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage contratos" ON public.contratos
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners manage contrato_itens" ON public.contrato_itens
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.contratos c WHERE c.id = contrato_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.contratos c WHERE c.id = contrato_id AND c.owner_id = auth.uid()));

CREATE TRIGGER tg_contratos_updated BEFORE UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_contratos_owner ON public.contratos(owner_id);
CREATE INDEX idx_contratos_cliente ON public.contratos(cliente_id);
CREATE INDEX idx_contrato_itens_contrato ON public.contrato_itens(contrato_id);
