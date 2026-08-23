-- Atualiza a Clausula 1.3 (Destinacao Final) do modelo "Bio Logus 2026"
-- ja salvo no banco: trocava a empresa antiga (Bio Projetos
-- Sustentaveis EIRELI) pela B-GREEN GESTAO AMBIENTAL S.A., mesma
-- empresa ja usada nos MTRs e CDFs.
-- Rode no SQL Editor do Supabase.
-- Idempotente: so mexe se ainda tiver o texto antigo.

UPDATE public.contrato_modelos
SET conteudo_html = replace(
  conteudo_html,
  'A Destinação final será realizada pela empresa Bio Projetos Sustentáveis EIRELI, com CNPJ: 21.317.279/0001-01, localizada no endereço V Secundária, módulo 12, Qd. 43, Dist. Indus. de Luziânia, CEP: 72.832-000, Luziânia - GO.',
  'A Destinação final será realizada pela empresa B-GREEN GESTÃO AMBIENTAL S.A., com CNPJ: 01.568.077/0006-30, localizada no endereço Setor Industrial da Ceilândia, QI 21, Lote 51/53/55, S/N, Ceilândia, Brasília - DF, CEP: 72.265-210.'
)
WHERE nome = 'Bio Logus 2026'
  AND owner_id IS NULL
  AND conteudo_html LIKE '%Bio Projetos Sustentáveis EIRELI%';
