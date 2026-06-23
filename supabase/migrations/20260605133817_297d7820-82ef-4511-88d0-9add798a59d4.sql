
-- Contas bancárias
CREATE TABLE public.contas_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  nome TEXT NOT NULL,
  banco TEXT,
  agencia TEXT,
  numero_conta TEXT,
  saldo_inicial NUMERIC(14,2) NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contas_bancarias TO authenticated;
GRANT ALL ON public.contas_bancarias TO service_role;
ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manage contas" ON public.contas_bancarias FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER tg_contas_bancarias_updated BEFORE UPDATE ON public.contas_bancarias
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Lançamentos do extrato (importados via OFX)
CREATE TABLE public.extrato_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  conta_id UUID NOT NULL REFERENCES public.contas_bancarias(id) ON DELETE CASCADE,
  fit_id TEXT,                       -- identificador único do OFX (FITID)
  data_lancamento DATE NOT NULL,
  tipo TEXT NOT NULL,                -- CREDIT / DEBIT
  valor NUMERIC(14,2) NOT NULL,      -- positivo crédito, negativo débito
  descricao TEXT,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente | conciliado | ignorado
  fatura_id UUID REFERENCES public.faturas(id) ON DELETE SET NULL,
  conciliado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conta_id, fit_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.extrato_lancamentos TO authenticated;
GRANT ALL ON public.extrato_lancamentos TO service_role;
ALTER TABLE public.extrato_lancamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manage extrato" ON public.extrato_lancamentos FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER tg_extrato_updated BEFORE UPDATE ON public.extrato_lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_extrato_conta_data ON public.extrato_lancamentos(conta_id, data_lancamento DESC);
CREATE INDEX idx_extrato_status ON public.extrato_lancamentos(status);
