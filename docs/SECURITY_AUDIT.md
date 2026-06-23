# Auditoria de Segurança

## Fluxo de autenticação
1. `/auth` → `supabase.auth.signInWithPassword` ou `signInWithOAuth({ provider: 'google' })`.
2. Supabase retorna JWT (access_token + refresh_token).
3. Persistência: `localStorage` (cliente browser).
4. Refresh: automático via `@supabase/supabase-js` (`autoRefreshToken: true`).
5. `attachSupabaseAuth` (functionMiddleware global em `src/start.ts`) injeta `Authorization: Bearer <jwt>` em **toda** chamada de server fn.
6. `requireSupabaseAuth` (server) valida claims via `supabase.auth.getClaims(token)` e expõe `{ supabase, userId, claims }` no contexto.

## JWT
- Emitido por Supabase Auth (HS256, segredo no Supabase).
- Validação server-side em **toda** server fn protegida.
- Não confiar em `getSession()` para identidade — usar `getUser()`/`getClaims()`.

## RLS (Row Level Security)
- Habilitado em **todas** as tabelas de domínio.
- Padrão de policy:
  ```sql
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid())
  ```
- Verificação de papel: `public.has_role(auth.uid(), 'admin')` (SECURITY DEFINER).
- Portal do cliente: `current_cliente_id()` (SECURITY DEFINER).
- **Service role** (`SUPABASE_SERVICE_ROLE_KEY`) **bypassa** RLS — usado apenas em `src/integrations/supabase/client.server.ts` e nunca exposto ao browser.

## Roles e middleware
- Server fns: `.middleware([requireSupabaseAuth])`.
- Rotas autenticadas: subpasta `src/routes/_authenticated/` (gate `ssr:false` faz `getUser()` antes do `<Outlet />`).
- Server routes públicas em `/api/public/*` (não existem hoje) bypassariam auth do site publicado.

## Webhooks
- `lovable/email/*/webhook`: verificação HMAC via `verifyWebhookRequest` (constant-time compare).
- Recomendação: validar timestamp para impedir replay (já implementado: `stale_timestamp`).

## Segredos
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LOVABLE_API_KEY`, `ANTHROPIC_API_KEY`, `SUPABASE_DB_URL`.
- Client-safe: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Nunca commitar `.env`.

## Storage
- Buckets `documentos` e `propostas` são **privados** (signed URLs gerados sob demanda; TTL curto).

## Vulnerabilidades conhecidas / pendentes
- `npm audit` não executado neste export — rodar `bun audit` (ou `npm audit`) no ambiente alvo.
- Email enumeration: `auth` retorna mensagens genéricas — OK.
- Rate-limit OTP: 3 por 10min implementado; aplicar também ao endpoint de login (delegar ao Supabase Auth).

## Recomendações OWASP Top 10
| Risco | Mitigação atual | Pendência |
|---|---|---|
| A01 Broken Access Control | RLS + `has_role` + roles em tabela separada | Adicionar testes automatizados de RLS |
| A02 Cryptographic Failures | JWT HS256; OTP hash SHA-256; PDF hash SHA-256; HTTPS obrigatório | Considerar JWT RS256 para multi-tenant |
| A03 Injection | Cliente Postgrest tipado (sem SQL cru no client); Zod em todas as `inputValidator` | Auditar SQL bruto em funções (revisar `enqueue_email` etc.) |
| A04 Insecure Design | Modelo de papéis seguro; OTP com rate-limit | — |
| A05 Security Misconfiguration | Service role nunca no client; CORS implícito (mesma origem) | Adicionar CSP no `__root.tsx` |
| A06 Vulnerable Components | Dependências modernas | Rodar `bun audit` mensal |
| A07 Identification/Auth Failures | Supabase Auth gerenciado; refresh token rotativo | Habilitar MFA |
| A08 Software/Data Integrity | Hash SHA-256 do PDF + assinatura averbada | Assinar webhooks de entrada |
| A09 Logging/Monitoring | `signatario_eventos` imutável; `email_send_log` | Centralizar logs (Sentry/Logflare) |
| A10 SSRF | Sem fetch dinâmico de URLs do usuário | — |
