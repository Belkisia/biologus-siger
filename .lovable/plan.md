## Objetivo
Emitir NFS-e reais via Focus NFe a partir das faturas do módulo Financeiro, com acompanhamento de status, PDF e XML.

## Escopo
- Nova aba **Notas Fiscais** no menu Comercial.
- Botão **Emitir NFS-e** na tabela de faturas do Financeiro.
- Cadastro do **emitente** (CNPJ, IM, regime, código de serviço padrão, alíquota ISS, ambiente sandbox/produção).
- Tabela **notas_fiscais** vinculada a `faturas` + `clientes`, com status, número RPS, número da NFS-e, código de verificação, links de PDF/XML e mensagens de erro do provedor.
- Integração real com Focus NFe: envio, consulta de status e cancelamento.

## Passo a passo

1. **Segredo do provedor**
   - Solicitar `FOCUS_NFE_TOKEN` (token da conta Focus NFe).
   - Ambiente controlado por campo do emitente (`homologacao` | `producao`) → base URL `https://homologacao.focusnfe.com.br` ou `https://api.focusnfe.com.br`.

2. **Migração de banco** (uma única migração, com GRANTs + RLS por `owner_id`):
   - `emitente_config` (1 por owner): razao_social, cnpj, inscricao_municipal, regime_tributario, item_lista_servico, codigo_tributario_municipio, aliquota, ambiente, natureza_operacao.
   - `notas_fiscais`: owner_id, fatura_id (FK), cliente_id (FK), ref (uuid usado como chave idempotente no Focus), rps_numero, rps_serie, numero_nfse, codigo_verificacao, status (`rascunho|processando|autorizada|erro|cancelada`), valor_servicos, aliquota, iss_valor, descricao, url_pdf, url_xml, mensagem_erro, payload_envio (jsonb), payload_retorno (jsonb).

3. **Server functions** (`src/lib/nfse.functions.ts`, `nfse.server.ts` para o client HTTP):
   - `emitirNfseDeFatura({ faturaId })` – monta payload a partir da fatura + cliente + emitente, chama `POST /v2/nfse?ref=<uuid>` no Focus NFe (Basic Auth com o token), grava `notas_fiscais` com status `processando`.
   - `consultarNfse({ notaId })` – `GET /v2/nfse/<ref>`, atualiza status/numero/codigo/urls/mensagem_erro.
   - `cancelarNfse({ notaId, justificativa })` – `DELETE /v2/nfse/<ref>`.
   - Middleware `requireSupabaseAuth` em todas.

4. **Rota `/notas-fiscais`** (`src/routes/_authenticated/notas-fiscais.tsx`):
   - Lista com filtros por status, botões *Consultar*, *Baixar PDF*, *Baixar XML*, *Cancelar*.
   - Cabeçalho com aviso quando `emitente_config` estiver incompleto, com link para configurar.
   - Card/diálogo **Configuração do emitente** dentro da mesma tela.

5. **Integração no Financeiro** (`src/routes/_authenticated/financeiro.tsx`):
   - Novo botão de ação na linha da fatura: *Emitir NFS-e* (desabilitado se já existir nota autorizada ou emitente não configurado).
   - Exibe status compacto da NF vinculada (badge).

6. **Sidebar** – adicionar item **Notas Fiscais** no grupo Comercial.

7. **Documentação** – atualizar `docs/FUNCTIONALITIES.md` com a nova aba.

## Detalhes técnicos
- Auth Focus NFe: `Authorization: Basic base64(TOKEN + ":")`.
- Idempotência: usar `ref = notas_fiscais.id` (uuid) na URL.
- Ambiente: campo no emitente decide a base URL em tempo de execução.
- PDF/XML: guardar as URLs devolvidas pelo Focus e abrir em nova aba (Focus hospeda os arquivos autenticados pelo próprio token; para o cliente final, gerar link temporário via server function `baixarNfsePdf` que faz proxy).
- Erros do provedor: relayed status + body; `status='erro'` + `mensagem_erro` preenchido para o usuário ver.

## Fora do escopo (agora)
- NF-e de produto (modelo 55).
- Emissão em lote automática por cron.
- Webhook de retorno do Focus (usaremos polling manual pelo botão *Consultar*; posso adicionar depois).

Confirma que posso seguir e já solicitar o `FOCUS_NFE_TOKEN`?