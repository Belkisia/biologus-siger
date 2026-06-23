# Regras de Negócio

## Autenticação
- Login via Supabase Auth (email/senha + Google OAuth).
- Sessão persistida em `localStorage`; refresh automático.
- Layout `_authenticated/route.tsx` (ssr:false) redireciona anônimos para `/auth`.
- Cada server fn valida JWT em `requireSupabaseAuth`.

## Permissões (RBAC)
Enum `app_role`: `admin`, `gestor`, `operacional`, `financeiro`, `cliente`.
- Verificação: `public.has_role(auth.uid(), 'admin')` (SECURITY DEFINER, evita recursão RLS).
- Trigger `handle_new_user` atribui papel `operacional` por padrão.
- Roles ficam em `user_roles` separada — **nunca** em `profiles` (proteção contra privilege escalation).

## Clientes
- CNPJ/CPF únicos por `owner_id`.
- Cadastro express disponível dentro do fluxo de contrato.
- Documentos versionados (`cliente_documento_versoes`); apenas a versão ativa fica em `cliente_documentos`.

## Contratos
- Apenas modelo ativo "Padrão 2026" pode ser usado para novos contratos.
- Render obrigatório via HTML do modelo (não montagem manual).
- Validação: **proibido salvar** se sobrarem placeholders `{{...}}` sem valor.
- Variáveis monetárias formatadas em BRL; datas em DD/MM/AAAA.
- Reajuste anual: regra removida do template a pedido do contratante.
- PDF gerado server-side com pdf-lib a partir do `conteudo_html`.

## Propostas
- Itens com preço unitário × quantidade; total recalculado server-side.
- Conversão proposta → contrato preserva cliente, itens e valores; dispara render completo (sem prévia simplificada).

## Financeiro
- Faturas com status: `pendente`, `pago`, `vencida`, `cancelada`.
- Cálculo de vencimento: data emissão + prazo do contrato.
- Conciliação OFX: parser em `src/lib/ofx-parser.ts` → `extrato_lancamentos` → casamento manual com faturas.
- Notificação automática de fatura a vencer (≤7 dias) ou vencida via `gerar_notificacoes_vencimento()`.

## Operacional (resíduos)
- **Coletas** → geram **MTR** (Manifesto) → finalizam em **CDF** (Certificado).
- **Licenças**: notificação 30 dias antes do vencimento; prioridade `alta` se ≤15 dias ou vencida.

## Assinatura eletrônica simples (MP 2.200-2/2001 art. 10 §2º)
- OTP de 6 dígitos por e-mail, hash SHA-256, válido por 10 min.
- Máx 5 tentativas por OTP; máx 3 OTPs em 10 min (rate-limit).
- Expiração padrão do link: 30 dias.
- Hash SHA-256 do PDF original armazenado como prova de integridade.
- Código curto de verificação público em `/validar/:codigo`.
- Trilha imutável em `signatario_eventos` (append-only): link_aberto, otp_solicitado, otp_validado, documento_visualizado, assinado, recusado.
- PDF assinado contém página de averbação com QR Code, IP, user-agent, data UTC, base legal.

## E-mails transacionais
- Fila `pgmq` (`enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`).
- Log em `email_send_log` (status: pending/sent/failed).
- `suppressed_emails` bloqueia destinatários com bounce/complaint.
- Templates React Email com brand Biólogus Ambiental.

## IA (geração de propostas)
- Endpoint protegido por `requireSupabaseAuth`.
- Modelo configurado em `src/lib/ai-gateway.server.ts` (OpenAI-compatible).
- Sem persistência de prompts sensíveis.

## Dashboard
- Agregações server-side a cada acesso (sem cache).
- Restringe linhas por `owner_id = auth.uid()` via RLS.

## Portal do cliente
- Rota `/portal` restrita: `current_cliente_id()` retorna o `clientes.id` cujo `user_id = auth.uid()`.
- Cliente só enxerga seus próprios contratos, faturas, coletas, documentos.
