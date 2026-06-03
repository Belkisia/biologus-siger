
CREATE TABLE public.propostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  numero text NOT NULL,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  validade date,
  condicoes_pagamento text,
  prazo_coleta text,
  valor_total numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'rascunho',
  observacoes text,
  contrato_id uuid REFERENCES public.contratos(id) ON DELETE SET NULL,
  enviada_em timestamptz,
  respondida_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_propostas_owner ON public.propostas(owner_id);
CREATE INDEX idx_propostas_cliente ON public.propostas(cliente_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.propostas TO authenticated;
GRANT ALL ON public.propostas TO service_role;

ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage propostas" ON public.propostas
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Cliente vê suas propostas" ON public.propostas
  FOR SELECT TO authenticated
  USING (cliente_id = current_cliente_id());

CREATE TRIGGER tg_propostas_updated BEFORE UPDATE ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.proposta_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id uuid NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  tipo_residuo text,
  quantidade numeric(14,3) NOT NULL DEFAULT 1,
  unidade text NOT NULL DEFAULT 'kg',
  valor_unitario numeric(14,2) NOT NULL DEFAULT 0,
  valor_total numeric(14,2) NOT NULL DEFAULT 0,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_proposta_itens_proposta ON public.proposta_itens(proposta_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposta_itens TO authenticated;
GRANT ALL ON public.proposta_itens TO service_role;

ALTER TABLE public.proposta_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage proposta_itens" ON public.proposta_itens
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND p.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND p.owner_id = auth.uid()));

CREATE POLICY "Cliente vê itens das suas propostas" ON public.proposta_itens
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.propostas p WHERE p.id = proposta_id AND p.cliente_id = current_cliente_id()));
