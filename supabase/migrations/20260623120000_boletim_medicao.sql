-- Boletim de Medição: registra coleta no campo com peso + assinatura do cliente
CREATE TABLE public.boletins_medicao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  mtr_id uuid NOT NULL REFERENCES public.mtrs(id) ON DELETE RESTRICT,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  data_coleta date NOT NULL DEFAULT CURRENT_DATE,
  peso_coletado numeric(14,3) NOT NULL,
  unidade text NOT NULL DEFAULT 'kg',
  assinatura_cliente text, -- base64 SVG/PNG da assinatura
  nome_responsavel text,   -- quem assinou no cliente
  observacoes text,
  -- Status do ciclo: coletado -> pago -> cdf_emitido -> cdf_enviado
  status text NOT NULL DEFAULT 'coletado',
  -- CDF gerado automaticamente após coleta
  cdf_id uuid REFERENCES public.cdfs(id) ON DELETE SET NULL,
  -- Controle de envio (liberado só após pagamento)
  pagamento_confirmado boolean NOT NULL DEFAULT false,
  data_pagamento timestamptz,
  cdf_enviado boolean NOT NULL DEFAULT false,
  data_envio_cdf timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.boletins_medicao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_boletins" ON public.boletins_medicao
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER boletins_medicao_updated_at
  BEFORE UPDATE ON public.boletins_medicao
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index por data e cliente
CREATE INDEX idx_boletins_data ON public.boletins_medicao(data_coleta DESC);
CREATE INDEX idx_boletins_cliente ON public.boletins_medicao(cliente_id);
CREATE INDEX idx_boletins_status ON public.boletins_medicao(status);
