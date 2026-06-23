# Inventário de APIs

A API principal usa **server functions** TanStack (`createServerFn`) — chamadas
via RPC POST em `/_serverFn/<id>` automaticamente pelo client. Abaixo, o
inventário por arquivo + as rotas HTTP públicas em `src/routes/api/` e
`src/routes/lovable/`.

## Rotas HTTP públicas

| URL | Método | Auth | Arquivo | Função |
|---|---|---|---|---|
| `/api/anthropic-proxy` | POST | Bearer (Supabase) | `src/routes/api/anthropic-proxy.ts` | Proxy para Claude usado pelo assistente IA |
| `/assinar/$token` | GET | Pública (token UUID) | `src/routes/assinar.$token.tsx` | Página de assinatura eletrônica |
| `/validar/$codigo` | GET | Pública | `src/routes/validar.$codigo.tsx` | Verificação pública de autenticidade |
| `/auth` | GET | Pública | `src/routes/auth.tsx` | Login (email/senha + Google) |
| `/email/unsubscribe` | GET | Pública (token) | `src/routes/email/unsubscribe.ts` | Cancela e-mails transacionais |
| `/unsubscribe` | GET | Pública | `src/routes/unsubscribe.tsx` | Confirmação visual de unsubscribe |
| `/lovable/email/auth/webhook` | POST | HMAC | `src/routes/lovable/email/auth/webhook.ts` | Webhook Supabase Auth → fila pgmq |
| `/lovable/email/auth/preview` | GET/POST | LOVABLE_API_KEY | `src/routes/lovable/email/auth/preview.ts` | Preview de templates de auth |
| `/lovable/email/transactional/send` | POST | LOVABLE_API_KEY | `src/routes/lovable/email/transactional/send.ts` | Envia e-mail transacional via Resend |
| `/lovable/email/transactional/preview` | GET | LOVABLE_API_KEY | `src/routes/lovable/email/transactional/preview.ts` | Preview de transacional |
| `/lovable/email/queue/process` | POST | LOVABLE_API_KEY | `src/routes/lovable/email/queue/process.ts` | Cron: dispara fila pgmq |
| `/lovable/email/suppression` | POST | HMAC | `src/routes/lovable/email/suppression.ts` | Marca bounce/complaint |

## Server functions por domínio

### Clientes (`src/lib/clientes.functions.ts`)
- `listarClientes`, `obterCliente`, `criarCliente`, `atualizarCliente`, `excluirCliente`, `criarClienteExpress`
- **Auth**: `requireSupabaseAuth`. RLS por `owner_id`.

### Contratos (`src/lib/contrato.functions.ts`)
- `listarContratos`, `obterContrato`, `criarContrato`, `atualizarContrato`, `excluirContrato`
- `gerarPDFContrato`, `previewContratoRascunho`
- **Regra**: bloqueia salvamento se houver placeholders `{{...}}` não preenchidos.

### Modelos de contrato (`src/lib/contrato-modelo.functions.ts`)
- `listarModelos`, `salvarModelo`, `obterModeloAtivo`, `renderTemplate`, `buildVars`

### Propostas (`src/lib/proposta-ai.functions.ts` + rota)
- Assistente IA gera descrições; conversão proposta → contrato em `propostas.tsx`.

### Assinaturas (`src/lib/assinatura.functions.ts`, `assinatura-pdf.server.ts`, `assinatura-email.server.ts`)
- `criarSolicitacaoAssinatura`, `obterSignatarioPorToken`, `solicitarOTP`, `validarOTP`, `confirmarAssinatura`, `validarCodigo`
- **Regras**: OTP 6 dígitos, hash SHA-256, max 5 tentativas, expira em 10min; trilha em `signatario_eventos`; PDF averbado com QR Code.

### Exemplo / utilidades
- `src/lib/api/example.functions.ts`

## Convenção de chamada

```ts
import { useServerFn } from '@tanstack/react-start'
import { listarClientes } from '@/lib/clientes.functions'

const fn = useServerFn(listarClientes)
const { data } = useQuery({ queryKey: ['clientes'], queryFn: () => fn() })
```

O `attachSupabaseAuth` (em `src/start.ts`) anexa o Bearer JWT automaticamente.
