# Biólogus Ambiental — Sistema de Gestão

Sistema full-stack para gestão de clientes, contratos, propostas, MTRs, CDFs,
licenças ambientais, financeiro, coletas e assinatura eletrônica simples.

## Stack
- **Frontend/Backend unificado**: TanStack Start v1 (React 19 + Vite 7) com SSR
- **Server functions**: `createServerFn` (`@tanstack/react-start`)
- **Banco / Auth / Storage**: Supabase (Postgres + RLS + Storage + Auth)
- **UI**: Tailwind CSS v4 + shadcn/ui + Radix UI
- **Estado/data**: TanStack Query + TanStack Router
- **PDF**: pdf-lib  |  **E-mail**: Resend + React Email  |  **IA**: Lovable AI Gateway / Anthropic
- **Deploy alvo**: Cloudflare Workers (nitro) — funciona também em Node via adapter

## Instalação
```bash
bun install            # ou: npm install / pnpm install
cp .env.example .env   # preencher chaves
bun run dev            # http://localhost:8080
```

## Build de produção
```bash
bun run build
bun run preview
```

## Banco de dados
1. Criar projeto Supabase (ou Postgres 15+).
2. Importar `database/database.sql`:
   ```bash
   psql "$SUPABASE_DB_URL" -f database/database.sql
   ```
3. Aplicar migrations adicionais em `supabase/migrations/` se desejar histórico.
4. Criar buckets de Storage: `documentos`, `propostas` (privados).

## Estrutura de pastas
```
src/
├── routes/                  # File-based routes (TanStack Router)
│   ├── _authenticated/      # Rotas protegidas (gate de auth)
│   ├── api/                 # Server routes HTTP (webhooks)
│   └── __root.tsx
├── components/              # UI (shadcn + customizados)
├── lib/                     # Server functions (*.functions.ts) e helpers
├── integrations/supabase/   # Clients (browser, admin, auth-middleware)
├── hooks/  assets/  styles.css
supabase/                    # config.toml + migrations
database/database.sql        # schema completo exportado
docs/                        # README, ARCHITECTURE, FUNCTIONALITIES
api/openapi.yaml             # endpoints HTTP públicos
```

## Deploy
- **Cloudflare Workers**: `bun run build` gera `.output/` pronto para `wrangler deploy`.
- **Node**: adaptar nitro preset para `node-server` em `vite.config.ts`.
- **Docker**: `docker compose up -d` (ver `docker-compose.yml`).

## Sem dependência da Lovable
- Substitua `@/integrations/lovable` por chamadas diretas `supabase.auth.signInWithOAuth`.
- Variáveis `VITE_*` e `SUPABASE_*` substituem o ambiente injetado pela Lovable Cloud.
- `LOVABLE_API_KEY` é opcional — só usado pelo Lovable AI Gateway; pode-se trocar por OpenAI/Anthropic direto.
