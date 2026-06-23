# Arquitetura do Sistema

## Visão geral
Aplicação isomórfica (SSR + SPA) servida por TanStack Start. Todas as
operações de negócio rodam em **server functions** chamadas via RPC tipado
(`createServerFn`) com middleware de autenticação Supabase
(`requireSupabaseAuth`). Operações administrativas usam `supabaseAdmin`
(service-role, bypass RLS).

```
[Browser React] ⇄ [TanStack Start SSR / Server Fns] ⇄ [Supabase Postgres + Storage + Auth]
                              │
                              ├─ Resend (e-mails)
                              ├─ Lovable AI Gateway / Anthropic (IA)
                              └─ pdf-lib (gera PDFs de contratos/propostas)
```

## Fluxo de autenticação
1. Usuário → `/auth` (email+senha ou Google OAuth via Supabase Auth).
2. Sessão persistida em `localStorage` (cliente browser).
3. Layout `_authenticated/route.tsx` (ssr:false) faz `getUser()` e redireciona se anônimo.
4. Cada chamada a server fn anexa `Authorization: Bearer <access_token>` via `attachSupabaseAuth`.
5. `requireSupabaseAuth` valida claims e injeta `{ supabase, userId }` no contexto.
6. RLS no Postgres restringe linhas por `owner_id = auth.uid()` ou via `has_role()`.

## Fluxo financeiro
- `clientes` → `contratos` → `faturas` → `extrato_lancamentos` (conciliação OFX).
- `contas_bancarias` mantém saldo; `conciliacao.tsx` casa lançamentos com faturas.

## Fluxo operacional (ambiental)
- `propostas` → conversão em `contratos` (Padrão 2026, HTML→PDF via pdf-lib).
- `coletas` registram retirada de resíduos → emissão de `mtrs` (Manifesto de Transporte).
- `cdfs` (Certificado de Destinação Final) fecham o ciclo.
- `licencas` monitoradas com cron `gerar_notificacoes_vencimento()`.

## Assinatura eletrônica simples (MP 2.200-2/2001 art.10 §2º)
`signatarios` → OTP por e-mail (`signatario_otps`, SHA-256) → `documento_assinaturas`
com hash SHA-256 do PDF + trilha em `signatario_eventos`. Página pública `/assinar/:token`.

## Integrações externas
- **Resend**: e-mails transacionais e OTPs (fila `pgmq`).
- **Supabase Storage**: buckets `documentos` e `propostas` (privados, signed URLs).
- **Lovable AI Gateway** (opcional): geração de propostas comerciais.

## Estrutura do banco
Ver `database/database.sql`. Tabelas principais:
profiles, user_roles, clientes, contratos, contrato_modelos, contrato_itens,
propostas, proposta_itens, faturas, contas_bancarias, extrato_lancamentos,
coletas, mtrs, cdfs, licencas, cliente_documentos, signatarios,
signatario_otps, signatario_eventos, documento_assinaturas, notificacoes,
email_send_log, email_send_state, suppressed_emails.
