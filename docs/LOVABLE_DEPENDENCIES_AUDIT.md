# Auditoria de Dependências Residuais da Lovable

Varredura por `lovable.dev`, `lovable.ai`, SDKs e gateways proprietários.

## Pacotes npm dependentes

| Pacote | Onde | Substituível por |
|---|---|---|
| `@lovable.dev/vite-tanstack-config` | `vite.config.ts:7` | Config Vite + plugin TanStack Start manual (ver `vite.config.ts` exemplo abaixo) |
| `@lovable.dev/cloud-auth-js` | `src/integrations/lovable/index.ts:3` | Chamar direto `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| `@lovable.dev/email-js` | `src/routes/lovable/email/auth/webhook.ts`, `src/routes/lovable/email/queue/process.ts` | Resend SDK direto (`resend.emails.send`) |
| `@lovable.dev/webhooks-js` | `src/routes/lovable/email/auth/webhook.ts`, `src/routes/lovable/email/suppression.ts` | Verificação HMAC manual (`crypto.createHmac('sha256', secret)`) |

## Endpoint AI Gateway

`src/lib/ai-gateway.server.ts:6` aponta para `https://ai.gateway.lovable.dev/v1`
(OpenAI-compatible). Para portar:
- **OpenAI**: `baseURL: 'https://api.openai.com/v1'` + header `Authorization: Bearer $OPENAI_API_KEY`
- **Anthropic**: usar `@ai-sdk/anthropic`
- **Groq/Together/etc.**: qualquer provider OpenAI-compatible

## Variável `LOVABLE_API_KEY`

Usada por:
- `src/lib/proposta-ai.functions.ts:13` — pode ser renomeada para `AI_API_KEY` apontando a outro gateway.
- `src/routes/lovable/email/**` — endpoints de fila/preview de e-mail; pode-se descartar todo o diretório `src/routes/lovable/email/` se você for usar Resend diretamente.

## Diretórios proprietários

- `src/routes/lovable/` — rotas específicas para a infra de e-mails da Lovable. **Remover** se for substituir por Resend direto.
- `src/integrations/lovable/index.ts` — wrapper OAuth.

## Plano de remoção (caminho rápido)

1. `bun remove @lovable.dev/cloud-auth-js @lovable.dev/email-js @lovable.dev/webhooks-js @lovable.dev/vite-tanstack-config`
2. Substituir `vite.config.ts` por config padrão TanStack Start.
3. Remover `src/integrations/lovable/` e `src/routes/lovable/`.
4. Apontar `src/lib/ai-gateway.server.ts` para OpenAI/Anthropic.
5. Implementar webhook de Auth do Supabase usando Resend + HMAC manual.

Após isso, **zero referências** a `lovable.*` permanecem.
