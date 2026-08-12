-- Corrige o modelo "Bio Logus 2026" ja salvo no banco: trocava
-- "{{CLIENTE_CIDADE}}/{{CLIENTE_ESTADO}}" por "{{CLIENTE_CIDADE_ESTADO}}",
-- que evita duplicar/deixar vazio quando o campo Cidade do cliente ja
-- vem com a UF embutida (ex: "Trindade - GO"), ou quando o campo Estado
-- nao foi preenchido separadamente.
-- Rode no SQL Editor do Supabase.
-- Idempotente: so mexe se ainda tiver o padrao antigo.

UPDATE public.contrato_modelos
SET conteudo_html = replace(conteudo_html, '{{CLIENTE_CIDADE}}/{{CLIENTE_ESTADO}}', '{{CLIENTE_CIDADE_ESTADO}}')
WHERE nome = 'Bio Logus 2026'
  AND owner_id IS NULL
  AND conteudo_html LIKE '%{{CLIENTE_CIDADE}}/{{CLIENTE_ESTADO}}%';
