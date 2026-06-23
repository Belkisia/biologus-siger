# AI Handoff — Resumo Otimizado para Claude / ChatGPT / Cursor / Windsurf

## TL;DR
SaaS B2B de gestão ambiental (Biólogus Ambiental): clientes, contratos com
assinatura eletrônica simples, propostas, financeiro com conciliação OFX,
operação de coletas/MTR/CDF, licenças, portal do cliente.

## Stack (uma frase cada)
- **Framework**: TanStack Start v1 (React 19 + Vite 7, SSR + SPA isomórfico).
- **Backend**: server functions (`createServerFn`) + server routes em `src/routes/api/`.
- **Banco/Auth/Storage**: Supabase (Postgres 15, RLS, Storage privado, Auth com Google OAuth).
- **UI**: Tailwind v4 + shadcn/ui + Radix; tokens semânticos em `src/styles.css`.
- **Dados**: TanStack Query (loaders chamam `ensureQueryData`, componentes usam `useSuspenseQuery`).
- **PDF**: pdf-lib server-side a partir de HTML do modelo.
- **E-mail**: Resend + React Email + fila pgmq.
- **IA**: provedor OpenAI-compatible (Lovable AI Gateway por padrão, trocável).
- **Deploy**: Cloudflare Workers (nitro). Node funciona com adapter alternativo.

## Estrutura
```
src/
  routes/                  # File-based (TanStack Router)
    __root.tsx             # Shell HTML, providers, onAuthStateChange
    _authenticated/        # Layout protegido (ssr:false + gate getUser)
    api/                   # Server routes HTTP
    assinar.$token.tsx     # Pública: assinatura
    validar.$codigo.tsx    # Pública: validação
  lib/                     # *.functions.ts (server fns) e helpers *.server.ts
  integrations/supabase/   # client (browser) + client.server (admin) + auth-middleware + auth-attacher
  components/ui/           # shadcn
supabase/migrations/       # Histórico de schema
database/database.sql      # Schema completo exportado
```

## Convenções obrigatórias
1. Server fn → arquivo `*.functions.ts` em `src/lib/` (NÃO em `src/server/`, bloqueado para client).
2. Helper server-only → `*.server.ts` (idem proteção).
3. Auth: toda server fn de usuário usa `.middleware([requireSupabaseAuth])`.
4. Admin (bypass RLS): importar `supabaseAdmin` **dentro** do handler com `await import(...)`.
5. Variáveis Vite no client (`import.meta.env.VITE_*`), `process.env.*` só no server.
6. Rotas protegidas SEMPRE sob `src/routes/_authenticated/`.
7. Loaders de rotas públicas **não** podem chamar server fns protegidas (quebra prerender).
8. Mutations: TanStack Query `useMutation` + `queryClient.invalidateQueries`.

## Fluxos críticos
- **Assinatura**: `criarSolicitacaoAssinatura` → e-mail com `/assinar/:token` → OTP → `confirmarAssinatura` → PDF averbado com QR para `/validar/:codigo`.
- **Contrato**: cliente + modelo "Padrão 2026" → `renderTemplate(html, vars)` → validação de placeholders → `gerarPDFContrato` (pdf-lib + parser HTML→blocos) → upload em `documentos`.
- **Conciliação**: upload OFX → parser → `extrato_lancamentos` → match manual com `faturas`.

## Banco (resumo)
- 27 tabelas em `public`. Ver `DATABASE_RELATIONSHIP.md` + `ERD.mmd`.
- Funções: `has_role`, `current_cliente_id`, `handle_new_user`, `gerar_notificacoes_vencimento`, `enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`, `tg_set_updated_at`.
- Enum: `app_role` (admin, gestor, operacional, financeiro, cliente).
- RLS habilitado em todas as tabelas de domínio com padrão `owner_id = auth.uid()`.

## Para outras IAs continuarem o projeto
1. Leia `docs/README.md` → `docs/SYSTEM_ARCHITECTURE.md` → `docs/FUNCTIONALITIES.md`.
2. Para mudanças de banco: consulte `docs/DATABASE_RELATIONSHIP.md` + `database/database.sql`.
3. Para mudanças de API: `docs/API_INVENTORY.md` + `api/openapi.yaml`.
4. Para regras: `docs/BUSINESS_RULES.md`.
5. Para segurança: `docs/SECURITY_AUDIT.md`.
6. Para remover acoplamento à Lovable: `docs/LOVABLE_DEPENDENCIES_AUDIT.md`.

## Comandos
```bash
bun install
cp .env.example .env   # preencher
bun run dev            # localhost:8080
bun run build          # gera .output/ (Workers)
docker compose up -d   # app + Postgres com schema importado
```

## O que está fora de escopo
- ICP-Brasil A1/A3 (pago).
- Multi-tenant com RS256 (atual é single-tenant por `owner_id`).
- Notificações WhatsApp / SMS.
