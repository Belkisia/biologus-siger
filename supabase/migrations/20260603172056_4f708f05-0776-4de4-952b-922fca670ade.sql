
CREATE OR REPLACE FUNCTION public.gerar_notificacoes_vencimento()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inseridas INTEGER := 0;
BEGIN
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

  INSERT INTO public.notificacoes (owner_id, tipo, titulo, mensagem, ref_tabela, ref_id, prioridade)
  SELECT f.owner_id,
         CASE WHEN f.data_vencimento < CURRENT_DATE THEN 'fatura_vencida' ELSE 'fatura_vencendo' END,
         'Fatura ' || COALESCE(f.numero, f.id::text),
         'Vencimento: ' || to_char(f.data_vencimento,'DD/MM/YYYY') || ' - R$ ' || to_char(f.valor,'FM999G999G990D00'),
         'faturas', f.id,
         CASE WHEN f.data_vencimento < CURRENT_DATE THEN 'alta' ELSE 'media' END
  FROM public.faturas f
  WHERE f.data_vencimento <= CURRENT_DATE + INTERVAL '7 days'
    AND COALESCE(f.status,'') NOT IN ('pago','cancelada')
    AND NOT EXISTS (
      SELECT 1 FROM public.notificacoes n
      WHERE n.ref_tabela='faturas' AND n.ref_id=f.id
        AND n.created_at::date = CURRENT_DATE
    );

  RETURN inseridas;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.gerar_notificacoes_vencimento() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_notificacoes_vencimento() TO service_role;
