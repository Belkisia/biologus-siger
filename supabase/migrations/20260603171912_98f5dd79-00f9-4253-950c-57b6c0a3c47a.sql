
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('licenca_vencendo','licenca_vencida','fatura_vencendo','fatura_vencida','info')),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  ref_tabela TEXT,
  ref_id UUID,
  lida BOOLEAN NOT NULL DEFAULT false,
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa','media','alta')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner gerencia suas notificacoes"
  ON public.notificacoes FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_notif_owner ON public.notificacoes(owner_id, lida, created_at DESC);
CREATE INDEX idx_notif_ref ON public.notificacoes(ref_tabela, ref_id);

CREATE TRIGGER trg_notif_updated_at
  BEFORE UPDATE ON public.notificacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Função que gera notificações de vencimento (idempotente via ref_tabela+ref_id+tipo do dia)
CREATE OR REPLACE FUNCTION public.gerar_notificacoes_vencimento()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inseridas INTEGER := 0;
BEGIN
  -- Licenças vencendo em <=30 dias
  INSERT INTO public.notificacoes (owner_id, tipo, titulo, mensagem, ref_tabela, ref_id, prioridade)
  SELECT l.owner_id,
         CASE WHEN l.data_validade < CURRENT_DATE THEN 'licenca_vencida' ELSE 'licenca_vencendo' END,
         'Licença ' || COALESCE(l.numero,'(sem número)') || ' - ' || l.tipo,
         'Validade: ' || to_char(l.data_validade,'DD/MM/YYYY'),
         'licencas', l.id,
         CASE WHEN l.data_validade < CURRENT_DATE + INTERVAL '15 days' THEN 'alta' ELSE 'media' END
  FROM public.licencas l
  WHERE l.data_validade <= CURRENT_DATE + INTERVAL '30 days'
    AND l.status <> 'cancelada'
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes n
      WHERE n.ref_tabela='licencas' AND n.ref_id=l.id
        AND n.created_at::date = CURRENT_DATE
    );
  GET DIAGNOSTICS inseridas = ROW_COUNT;

  -- Faturas vencendo em <=7 dias e não pagas
  INSERT INTO public.notificacoes (owner_id, tipo, titulo, mensagem, ref_tabela, ref_id, prioridade)
  SELECT f.owner_id,
         CASE WHEN f.vencimento < CURRENT_DATE THEN 'fatura_vencida' ELSE 'fatura_vencendo' END,
         'Fatura ' || COALESCE(f.numero, f.id::text),
         'Vencimento: ' || to_char(f.vencimento,'DD/MM/YYYY') || ' - R$ ' || to_char(f.valor,'FM999G999G990D00'),
         'faturas', f.id,
         CASE WHEN f.vencimento < CURRENT_DATE THEN 'alta' ELSE 'media' END
  FROM public.faturas f
  WHERE f.vencimento <= CURRENT_DATE + INTERVAL '7 days'
    AND COALESCE(f.pago,false) = false
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes n
      WHERE n.ref_tabela='faturas' AND n.ref_id=f.id
        AND n.created_at::date = CURRENT_DATE
    );

  RETURN inseridas;
END;
$$;

GRANT EXECUTE ON FUNCTION public.gerar_notificacoes_vencimento() TO authenticated, service_role;
