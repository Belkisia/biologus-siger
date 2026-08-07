-- Corrige o tipo da coluna cdf_id em boletins_medicao.
-- A coluna estava como uuid, mas o app sempre gravou/leu um número legível
-- (ex: "202697834" = ano + 5 dígitos aleatórios, via gerarNumeroCDF()),
-- não um UUID. Isso causava o erro "invalid input syntax for type uuid"
-- ao dar baixa em um MTR.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).

ALTER TABLE public.boletins_medicao
  ALTER COLUMN cdf_id TYPE text USING cdf_id::text;

-- Diagnóstico: MTRs marcados como "baixado" que ficaram sem boletim
-- correspondente (por causa do erro acima interromper o fluxo no meio).
-- Rode esta consulta para ver quais precisam de baixa manual novamente:
--
-- SELECT m.id, m.numero, m.cliente_id, m.data_baixa
-- FROM mtrs m
-- LEFT JOIN boletins_medicao b ON b.mtr_id = m.id
-- WHERE m.status = 'baixado' AND b.id IS NULL;
