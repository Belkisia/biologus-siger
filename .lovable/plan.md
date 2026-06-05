# Assinatura Eletrônica Simples — Bio Logus

Implementação 100% gratuita, juridicamente válida entre as partes conforme MP 2.200-2/2001 art. 10, §2º. Sem dependência de API paga (ICP-Brasil, Clicksign, D4Sign). Toda infraestrutura roda no Lovable Cloud.

## 1. Banco de dados (1 migration)

**Tabela `signatarios`** — pessoas que precisam assinar um documento (contrato ou proposta).
- `documento_tipo` ('contrato' | 'proposta'), `documento_id`, `ordem`
- `nome`, `email`, `cpf_cnpj`, `papel` ('contratante' | 'contratada' | 'testemunha')
- `token` (UUID público para o link /assinar/:token)
- `status` ('pendente' | 'otp_enviado' | 'assinado' | 'recusado' | 'expirado')
- `assinado_em`, `expira_em` (30 dias default)

**Tabela `signatario_otps`** — códigos OTP de 6 dígitos.
- `signatario_id`, `codigo_hash` (SHA-256, nunca o código em claro)
- `tentativas` (máx 5), `expira_em` (10 min), `usado_em`

**Tabela `signatario_eventos`** — trilha de auditoria imutável (append-only).
- `signatario_id`, `evento` ('link_aberto' | 'otp_solicitado' | 'otp_validado' | 'documento_visualizado' | 'assinado' | 'recusado')
- `ip`, `user_agent`, `metadata` jsonb, `created_at`

**Tabela `documento_assinaturas`** — registro consolidado da assinatura final.
- `signatario_id`, `documento_tipo`, `documento_id`
- `hash_documento` (SHA-256 do PDF original — prova de integridade)
- `codigo_verificacao` (string curta para validação pública)
- `rubrica_base64` (opcional)
- `pdf_assinado_path` (caminho no bucket `documentos`)
- `ip`, `user_agent`, `geo` jsonb

RLS: tudo restrito a `owner_id` para leitura interna; rotas públicas usam server fns com `supabaseAdmin` validando token.

## 2. Server functions (`src/lib/assinatura.functions.ts`)

Todas via `createServerFn`, usando `supabaseAdmin` (rotas públicas, sem auth):

- `criarSolicitacaoAssinatura({ documento_tipo, documento_id, signatarios[] })` — protegida com `requireSupabaseAuth`. Gera tokens, salva signatários, envia e-mails iniciais.
- `obterSignatarioPorToken({ token })` — pública. Retorna dados do signatário + URL pública do PDF para visualização. Registra evento `link_aberto`.
- `solicitarOTP({ token })` — pública. Gera código de 6 dígitos, salva hash, envia por e-mail. Rate-limit: máx 3 OTPs por 10 min.
- `validarOTP({ token, codigo })` — pública. Compara hash, incrementa tentativas, registra `otp_validado`.
- `confirmarAssinatura({ token, codigo, rubrica_base64?, aceite: true })` — pública. Revalida OTP, gera PDF assinado com página de averbação, salva no storage, marca signatário como `assinado`, registra evento.
- `validarCodigo({ codigo_verificacao })` — pública. Para `/validar/:codigo`. Retorna dados do documento + hash para conferência por terceiros.

## 3. Envio de e-mails

Usar conector **Resend** (gratuito até 3k/mês) via `connector-gateway.lovable.dev/resend`. Dois templates inline:

- **Convite para assinar** — "{Nome}, você foi convidado a assinar o contrato Nº X. [Botão: Assinar agora]" + link `https://app.lovable.app/assinar/:token`.
- **Código OTP** — "Seu código de assinatura é: 123456. Válido por 10 minutos."

Se o usuário não tiver Resend conectado, vou pedir para conectar (ou usar a infra de Lovable Emails — pergunto antes).

## 4. Geração do PDF assinado

Função `gerarPDFAssinado` no servidor:
1. Baixa PDF original do bucket.
2. Calcula SHA-256.
3. Usa `pdf-lib` (Worker-compatível) para anexar uma **página de averbação** ao final contendo:
   - Cabeçalho "Manifesto de Assinatura Eletrônica"
   - Para cada signatário assinado: nome, e-mail, CPF/CNPJ, papel, data/hora UTC, IP, hash do OTP validado, código de verificação
   - Rubrica desenhada (se houver) embutida como imagem
   - QR Code apontando para `/validar/:codigo`
   - Rodapé com base legal: "Assinado eletronicamente conforme MP 2.200-2/2001, art. 10, §2º. Hash SHA-256: …"
4. Salva como `documentos/assinados/{documento_id}.pdf`.

## 5. Páginas públicas (sem auth)

- **`/assinar/:token`** — visualiza PDF embutido (`<iframe>` do signed URL), formulário com: "Li e concordo", canvas para rubrica (lib `react-signature-canvas`), botão "Solicitar código", input de OTP, botão "Assinar". Estados: aguardando OTP, validando, sucesso, recusar.
- **`/validar/:codigo`** — mostra status, hash do documento, lista de signatários e datas. Botão para baixar o PDF assinado.

Ambas ficam fora de `_authenticated/` e usam server fns públicas.

## 6. Integração no fluxo de contratos

Na tela `/contratos` (ou onde fica o contrato hoje):
- Botão **"Enviar para assinatura"** abre diálogo listando signatários (pré-preenche contratante = Bio Logus + contratada = cliente do contrato; permite adicionar testemunhas).
- Cada signatário: nome, e-mail, CPF/CNPJ, papel.
- Ao enviar, chama `criarSolicitacaoAssinatura` e mostra status na tela (pendente / enviado / assinado por X de Y).
- Botão "Reenviar e-mail", "Cancelar assinatura", "Baixar PDF assinado" (quando todos assinaram).

## 7. Cliente novo no contrato

Já tem o seletor de cliente. Adiciono botão **"+ Novo cliente"** ao lado do select, que abre um Sheet com formulário enxuto (razão social, CNPJ, e-mail, telefone, endereço), salva em `clientes` e seleciona automaticamente. Não duplica a tela completa de clientes — é cadastro express só com os campos obrigatórios para o contrato + assinatura.

## Dependências novas

- `pdf-lib` (já é Worker-compatível, manipula PDF no servidor)
- `qrcode` (gera QR Code da URL de validação)
- `react-signature-canvas` (canvas de rubrica no frontend)

## Não fazer agora (fora de escopo)

- ICP-Brasil / certificado digital A1/A3 (pago, fora do "gratuito").
- Múltiplos idiomas.
- App mobile dedicado (a página `/assinar` já é responsiva).
- Notificação por WhatsApp (precisaria Twilio pago).

---

**Antes de codar, preciso de 2 confirmações:**

1. **E-mail:** posso conectar o **Resend** (gratuito 3k/mês, 1 clique) ou prefere usar a infraestrutura de Lovable Emails (precisa domínio próprio configurado com DNS)?
2. **Rubrica desenhada:** incluo o canvas de assinatura desenhada junto com o OTP (mais robusto juridicamente) ou só OTP por simplicidade?