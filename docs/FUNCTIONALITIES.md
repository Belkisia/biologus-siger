# Mapeamento Funcional

## Dashboard (`/dashboard`)
KPIs gerais: receita do mês, contratos ativos, licenças a vencer, MTRs pendentes.

## Clientes (`/clientes`, `/clientes/:id`)
CRUD completo de pessoas físicas/jurídicas. Documentos versionados em
`cliente_documentos` + `cliente_documento_versoes`. Regras: CNPJ único por owner.

## Contratos (`/contratos`, `/modelos-contrato`)
- Modelos com placeholders `{{...}}` (Padrão 2026).
- Geração de PDF a partir de HTML do modelo + dados do cliente.
- Prévia antes de salvar/assinar.
- Envio para assinatura eletrônica (OTP por e-mail).

## Propostas (`/propostas`, `/propostas/nova`)
- Itens precificados, geração de PDF, envio por e-mail.
- Conversão proposta → contrato preserva itens e cliente.
- Assistente IA opcional para descrição de escopo.

## Financeiro (`/financeiro`, `/conciliacao`)
- Faturas com status (pendente/pago/vencida/cancelada).
- Importação OFX (`src/lib/ofx-parser.ts`) → `extrato_lancamentos`.
- Conciliação manual lançamento × fatura.

## Operacional
- **Coletas** (`/coletas`): agendamento e execução.
- **MTR** (`/mtr`): manifesto de transporte de resíduos.
- **CDF** (`/cdf`): certificado de destinação final.
- **Licenças** (`/licencas`): controle de validade + notificações automáticas.

## Relatórios (`/relatorios`)
Exportações CSV/PDF de faturamento, coletas e licenças.

## Usuários (`/usuarios`)
Gestão de papéis via `user_roles` (admin, gestor, operacional, financeiro).
Verificação por `has_role(uuid, app_role)` (SECURITY DEFINER, evita recursão RLS).

## Portal do cliente (`/portal`)
Visualização restrita por cliente autenticado (RLS via `current_cliente_id()`).

## Notificações (`notifications-bell`)
Geradas por `gerar_notificacoes_vencimento()` (cron). Tipos:
licenca_vencendo, licenca_vencida, fatura_vencendo, fatura_vencida.

## Assinatura eletrônica
- `/assinar/:token` (pública): visualiza PDF, solicita OTP, assina.
- `/validar/:codigo` (pública): conferência de autenticidade por terceiros.

## Permissões (resumo)
| Papel        | Acesso |
|--------------|--------|
| admin        | tudo |
| gestor       | leitura/escrita exceto usuários |
| financeiro   | financeiro + leitura de contratos |
| operacional  | coletas, MTR, CDF, licenças |
| cliente      | apenas portal (RLS por current_cliente_id) |
