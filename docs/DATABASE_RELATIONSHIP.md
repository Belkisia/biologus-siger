# Mapa de Relacionamentos do Banco

Total de tabelas: **27**

## `cdfs`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| mtr_id | uuid | NO |  |
| numero | text | NO |  |
| data_destinacao | date | NO |  |
| tecnologia | text | YES |  |
| destinador | text | YES |  |
| quantidade_destinada | numeric | YES |  |
| url_documento | text | YES |  |
| observacoes | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `cdfs_pkey`: `CREATE UNIQUE INDEX cdfs_pkey ON public.cdfs USING btree (id)`
- `idx_cdfs_mtr`: `CREATE INDEX idx_cdfs_mtr ON public.cdfs USING btree (mtr_id)`
- `idx_cdfs_owner`: `CREATE INDEX idx_cdfs_owner ON public.cdfs USING btree (owner_id)`

**Policies RLS**:

- **Owners manage cdfs** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê seus CDFs** (SELECT, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM mtrs m   WHERE ((m.id = cdfs.mtr_id) AND (m.cliente_id = current_cliente_id()))))`
  - CHECK: ``

---

## `cliente_documento_versoes`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| documento_id | uuid | NO |  |
| owner_id | uuid | NO |  |
| versao | integer | NO |  |
| storage_path | text | NO |  |
| mime_type | text | YES |  |
| tamanho_bytes | bigint | YES |  |
| nome_arquivo | text | YES |  |
| acao | text | NO | 'upload'::text |
| nota | text | YES |  |
| uploaded_by | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `cliente_documento_versoes_pkey`: `CREATE UNIQUE INDEX cliente_documento_versoes_pkey ON public.cliente_documento_versoes USING btree (id)`
- `cliente_documento_versoes_documento_id_versao_key`: `CREATE UNIQUE INDEX cliente_documento_versoes_documento_id_versao_key ON public.cliente_documento_versoes USING btree (documento_id, versao)`
- `idx_cliente_doc_versoes_doc`: `CREATE INDEX idx_cliente_doc_versoes_doc ON public.cliente_documento_versoes USING btree (documento_id)`

**Policies RLS**:

- **Owners manage doc versoes** (ALL, roles=['authenticated'])
  - USING: `(owner_id = auth.uid())`
  - CHECK: `(owner_id = auth.uid())`
- **Cliente vê versões dos seus documentos** (SELECT, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM cliente_documentos d   WHERE ((d.id = cliente_documento_versoes.documento_id) AND (d.cliente_id = current_cliente_id()))))`
  - CHECK: ``

---

## `cliente_documentos`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| cliente_id | uuid | NO |  |
| nome | text | NO |  |
| categoria | text | NO | 'geral'::text |
| descricao | text | YES |  |
| versao_atual | integer | NO | 1 |
| storage_path | text | NO |  |
| mime_type | text | YES |  |
| tamanho_bytes | bigint | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `cliente_documentos_pkey`: `CREATE UNIQUE INDEX cliente_documentos_pkey ON public.cliente_documentos USING btree (id)`
- `idx_cliente_documentos_cliente`: `CREATE INDEX idx_cliente_documentos_cliente ON public.cliente_documentos USING btree (cliente_id)`
- `idx_cliente_documentos_owner`: `CREATE INDEX idx_cliente_documentos_owner ON public.cliente_documentos USING btree (owner_id)`

**Policies RLS**:

- **Owners manage cliente_documentos** (ALL, roles=['authenticated'])
  - USING: `(owner_id = auth.uid())`
  - CHECK: `(owner_id = auth.uid())`
- **Cliente vê seus documentos** (SELECT, roles=['authenticated'])
  - USING: `(cliente_id = current_cliente_id())`
  - CHECK: ``

---

## `clientes`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| razao_social | text | NO |  |
| nome_fantasia | text | YES |  |
| cnpj | text | NO |  |
| inscricao_estadual | text | YES |  |
| inscricao_municipal | text | YES |  |
| cnae | text | YES |  |
| porte | text | YES |  |
| responsavel_tecnico | text | YES |  |
| responsavel_financeiro | text | YES |  |
| responsavel_operacional | text | YES |  |
| telefone | text | YES |  |
| whatsapp | text | YES |  |
| email | text | YES |  |
| cep | text | YES |  |
| endereco | text | YES |  |
| numero | text | YES |  |
| bairro | text | YES |  |
| cidade | text | YES |  |
| estado | text | YES |  |
| latitude | numeric | YES |  |
| longitude | numeric | YES |  |
| status | text | NO | 'ativo'::text |
| observacoes | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| user_id | uuid | YES |  |

**Índices**:

- `clientes_pkey`: `CREATE UNIQUE INDEX clientes_pkey ON public.clientes USING btree (id)`
- `idx_clientes_owner`: `CREATE INDEX idx_clientes_owner ON public.clientes USING btree (owner_id)`
- `idx_clientes_user_id`: `CREATE INDEX idx_clientes_user_id ON public.clientes USING btree (user_id)`

**Policies RLS**:

- **Owners manage clientes** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê seu cadastro** (SELECT, roles=['authenticated'])
  - USING: `(user_id = auth.uid())`
  - CHECK: ``

---

## `coletas`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| cliente_id | uuid | NO |  |
| data_agendada | timestamp with time zone | NO |  |
| horario | text | YES |  |
| tipo_residuo | text | NO |  |
| grupo_residuo | text | YES |  |
| quantidade_prevista | numeric | YES |  |
| unidade | text | YES | 'kg'::text |
| motorista | text | YES |  |
| veiculo | text | YES |  |
| status | text | NO | 'agendada'::text |
| peso_real | numeric | YES |  |
| observacoes | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `coletas_pkey`: `CREATE UNIQUE INDEX coletas_pkey ON public.coletas USING btree (id)`
- `idx_coletas_owner_data`: `CREATE INDEX idx_coletas_owner_data ON public.coletas USING btree (owner_id, data_agendada DESC)`

**Policies RLS**:

- **Owners manage coletas** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê suas coletas** (SELECT, roles=['authenticated'])
  - USING: `(cliente_id = current_cliente_id())`
  - CHECK: ``

---

## `contas_bancarias`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| nome | text | NO |  |
| banco | text | YES |  |
| agencia | text | YES |  |
| numero_conta | text | YES |  |
| saldo_inicial | numeric | NO | 0 |
| ativa | boolean | NO | true |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `contas_bancarias_pkey`: `CREATE UNIQUE INDEX contas_bancarias_pkey ON public.contas_bancarias USING btree (id)`

**Policies RLS**:

- **owner manage contas** (ALL, roles=['public'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`

---

## `contrato_itens`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| contrato_id | uuid | NO |  |
| descricao | text | NO |  |
| grupo_residuo | text | YES |  |
| unidade | text | YES | 'kg'::text |
| preco_unitario | numeric | NO | 0 |
| franquia | numeric | YES |  |
| preco_excedente | numeric | YES |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `contrato_itens_pkey`: `CREATE UNIQUE INDEX contrato_itens_pkey ON public.contrato_itens USING btree (id)`
- `idx_contrato_itens_contrato`: `CREATE INDEX idx_contrato_itens_contrato ON public.contrato_itens USING btree (contrato_id)`

**Policies RLS**:

- **Owners manage contrato_itens** (ALL, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM contratos c   WHERE ((c.id = contrato_itens.contrato_id) AND (c.owner_id = auth.uid()))))`
  - CHECK: `(EXISTS ( SELECT 1    FROM contratos c   WHERE ((c.id = contrato_itens.contrato_id) AND (c.owner_id = auth.uid()))))`

---

## `contrato_modelo_versoes`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| modelo_id | uuid | NO |  |
| versao | integer | NO |  |
| conteudo_html | text | NO |  |
| motivo | text | YES |  |
| alterado_por | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `contrato_modelo_versoes_pkey`: `CREATE UNIQUE INDEX contrato_modelo_versoes_pkey ON public.contrato_modelo_versoes USING btree (id)`
- `contrato_modelo_versoes_modelo_id_versao_key`: `CREATE UNIQUE INDEX contrato_modelo_versoes_modelo_id_versao_key ON public.contrato_modelo_versoes USING btree (modelo_id, versao)`
- `idx_modelo_versoes_modelo`: `CREATE INDEX idx_modelo_versoes_modelo ON public.contrato_modelo_versoes USING btree (modelo_id)`

**Policies RLS**:

- **Ver versões de modelos acessíveis** (SELECT, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM contrato_modelos m   WHERE ((m.id = contrato_modelo_versoes.modelo_id) AND ((m.owner_id IS NULL) OR (m.owner_id = auth.uid())))))`
  - CHECK: ``
- **Criar versões de modelos próprios** (INSERT, roles=['authenticated'])
  - USING: ``
  - CHECK: `(EXISTS ( SELECT 1    FROM contrato_modelos m   WHERE ((m.id = contrato_modelo_versoes.modelo_id) AND (m.owner_id = auth.uid()))))`

---

## `contrato_modelos`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | YES |  |
| nome | text | NO |  |
| descricao | text | YES |  |
| conteudo_html | text | NO | ''::text |
| ativo | boolean | NO | true |
| versao_atual | integer | NO | 1 |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `contrato_modelos_pkey`: `CREATE UNIQUE INDEX contrato_modelos_pkey ON public.contrato_modelos USING btree (id)`
- `idx_contrato_modelos_owner`: `CREATE INDEX idx_contrato_modelos_owner ON public.contrato_modelos USING btree (owner_id)`

**Policies RLS**:

- **Ver modelos próprios e do sistema** (SELECT, roles=['authenticated'])
  - USING: `((owner_id IS NULL) OR (owner_id = auth.uid()))`
  - CHECK: ``
- **Criar modelos próprios** (INSERT, roles=['authenticated'])
  - USING: ``
  - CHECK: `(owner_id = auth.uid())`
- **Editar modelos próprios** (UPDATE, roles=['authenticated'])
  - USING: `(owner_id = auth.uid())`
  - CHECK: `(owner_id = auth.uid())`
- **Excluir modelos próprios** (DELETE, roles=['authenticated'])
  - USING: `(owner_id = auth.uid())`
  - CHECK: ``

---

## `contratos`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| cliente_id | uuid | NO |  |
| numero | text | NO |  |
| objeto | text | YES |  |
| data_inicio | date | NO |  |
| data_fim | date | YES |  |
| valor_mensal | numeric | YES |  |
| indice_reajuste | text | YES |  |
| periodicidade_reajuste | text | YES | 'anual'::text |
| dia_vencimento | integer | YES |  |
| forma_pagamento | text | YES |  |
| observacoes | text | YES |  |
| status | text | NO | 'ativo'::text |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| ultimo_email_status | text | YES |  |
| ultimo_email_em | timestamp with time zone | YES |  |
| ultimo_email_destino | text | YES |  |
| ultimo_email_erro | text | YES |  |
| conteudo_html | text | YES |  |
| modelo_id | uuid | YES |  |

**Índices**:

- `contratos_pkey`: `CREATE UNIQUE INDEX contratos_pkey ON public.contratos USING btree (id)`
- `idx_contratos_owner`: `CREATE INDEX idx_contratos_owner ON public.contratos USING btree (owner_id)`
- `idx_contratos_cliente`: `CREATE INDEX idx_contratos_cliente ON public.contratos USING btree (cliente_id)`
- `idx_contratos_modelo`: `CREATE INDEX idx_contratos_modelo ON public.contratos USING btree (modelo_id)`

**Policies RLS**:

- **Owners manage contratos** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê seus contratos** (SELECT, roles=['authenticated'])
  - USING: `(cliente_id = current_cliente_id())`
  - CHECK: ``

---

## `documento_assinaturas`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| signatario_id | uuid | NO |  |
| documento_tipo | USER-DEFINED | NO |  |
| documento_id | uuid | NO |  |
| hash_documento | text | NO |  |
| codigo_verificacao | text | NO |  |
| rubrica_base64 | text | YES |  |
| pdf_assinado_path | text | YES |  |
| ip | text | YES |  |
| user_agent | text | YES |  |
| geo | jsonb | YES |  |
| assinado_em | timestamp with time zone | NO | now() |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `documento_assinaturas_pkey`: `CREATE UNIQUE INDEX documento_assinaturas_pkey ON public.documento_assinaturas USING btree (id)`
- `documento_assinaturas_signatario_id_key`: `CREATE UNIQUE INDEX documento_assinaturas_signatario_id_key ON public.documento_assinaturas USING btree (signatario_id)`
- `documento_assinaturas_codigo_verificacao_key`: `CREATE UNIQUE INDEX documento_assinaturas_codigo_verificacao_key ON public.documento_assinaturas USING btree (codigo_verificacao)`
- `idx_assin_doc`: `CREATE INDEX idx_assin_doc ON public.documento_assinaturas USING btree (documento_tipo, documento_id)`
- `idx_assin_codigo`: `CREATE INDEX idx_assin_codigo ON public.documento_assinaturas USING btree (codigo_verificacao)`

**Policies RLS**:

- **assin_owner_select** (SELECT, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM signatarios s   WHERE ((s.id = documento_assinaturas.signatario_id) AND (s.owner_id = auth.uid()))))`
  - CHECK: ``

---

## `email_send_log`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| message_id | text | YES |  |
| template_name | text | NO |  |
| recipient_email | text | NO |  |
| status | text | NO |  |
| error_message | text | YES |  |
| metadata | jsonb | YES |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `email_send_log_pkey`: `CREATE UNIQUE INDEX email_send_log_pkey ON public.email_send_log USING btree (id)`
- `idx_email_send_log_created`: `CREATE INDEX idx_email_send_log_created ON public.email_send_log USING btree (created_at DESC)`
- `idx_email_send_log_recipient`: `CREATE INDEX idx_email_send_log_recipient ON public.email_send_log USING btree (recipient_email)`
- `idx_email_send_log_message`: `CREATE INDEX idx_email_send_log_message ON public.email_send_log USING btree (message_id)`
- `idx_email_send_log_message_sent_unique`: `CREATE UNIQUE INDEX idx_email_send_log_message_sent_unique ON public.email_send_log USING btree (message_id) WHERE (status = 'sent'::text)`

**Policies RLS**:

- **Service role can read send log** (SELECT, roles=['public'])
  - USING: `(auth.role() = 'service_role'::text)`
  - CHECK: ``
- **Service role can insert send log** (INSERT, roles=['public'])
  - USING: ``
  - CHECK: `(auth.role() = 'service_role'::text)`
- **Service role can update send log** (UPDATE, roles=['public'])
  - USING: `(auth.role() = 'service_role'::text)`
  - CHECK: `(auth.role() = 'service_role'::text)`

---

## `email_send_state`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | integer | NO | 1 |
| retry_after_until | timestamp with time zone | YES |  |
| batch_size | integer | NO | 10 |
| send_delay_ms | integer | NO | 200 |
| auth_email_ttl_minutes | integer | NO | 15 |
| transactional_email_ttl_minutes | integer | NO | 60 |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `email_send_state_pkey`: `CREATE UNIQUE INDEX email_send_state_pkey ON public.email_send_state USING btree (id)`

**Policies RLS**:

- **Service role can manage send state** (ALL, roles=['public'])
  - USING: `(auth.role() = 'service_role'::text)`
  - CHECK: `(auth.role() = 'service_role'::text)`

---

## `email_unsubscribe_tokens`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| token | text | NO |  |
| email | text | NO |  |
| created_at | timestamp with time zone | NO | now() |
| used_at | timestamp with time zone | YES |  |

**Índices**:

- `email_unsubscribe_tokens_pkey`: `CREATE UNIQUE INDEX email_unsubscribe_tokens_pkey ON public.email_unsubscribe_tokens USING btree (id)`
- `email_unsubscribe_tokens_token_key`: `CREATE UNIQUE INDEX email_unsubscribe_tokens_token_key ON public.email_unsubscribe_tokens USING btree (token)`
- `email_unsubscribe_tokens_email_key`: `CREATE UNIQUE INDEX email_unsubscribe_tokens_email_key ON public.email_unsubscribe_tokens USING btree (email)`
- `idx_unsubscribe_tokens_token`: `CREATE INDEX idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens USING btree (token)`

**Policies RLS**:

- **Service role can read tokens** (SELECT, roles=['public'])
  - USING: `(auth.role() = 'service_role'::text)`
  - CHECK: ``
- **Service role can insert tokens** (INSERT, roles=['public'])
  - USING: ``
  - CHECK: `(auth.role() = 'service_role'::text)`
- **Service role can mark tokens as used** (UPDATE, roles=['public'])
  - USING: `(auth.role() = 'service_role'::text)`
  - CHECK: `(auth.role() = 'service_role'::text)`

---

## `extrato_lancamentos`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| conta_id | uuid | NO |  |
| fit_id | text | YES |  |
| data_lancamento | date | NO |  |
| tipo | text | NO |  |
| valor | numeric | NO |  |
| descricao | text | YES |  |
| memo | text | YES |  |
| status | text | NO | 'pendente'::text |
| fatura_id | uuid | YES |  |
| conciliado_em | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `extrato_lancamentos_pkey`: `CREATE UNIQUE INDEX extrato_lancamentos_pkey ON public.extrato_lancamentos USING btree (id)`
- `extrato_lancamentos_conta_id_fit_id_key`: `CREATE UNIQUE INDEX extrato_lancamentos_conta_id_fit_id_key ON public.extrato_lancamentos USING btree (conta_id, fit_id)`
- `idx_extrato_conta_data`: `CREATE INDEX idx_extrato_conta_data ON public.extrato_lancamentos USING btree (conta_id, data_lancamento DESC)`
- `idx_extrato_status`: `CREATE INDEX idx_extrato_status ON public.extrato_lancamentos USING btree (status)`

**Policies RLS**:

- **owner manage extrato** (ALL, roles=['public'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`

---

## `faturas`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| cliente_id | uuid | NO |  |
| contrato_id | uuid | YES |  |
| numero | text | NO |  |
| competencia | text | NO |  |
| data_emissao | date | NO | CURRENT_DATE |
| data_vencimento | date | NO |  |
| valor | numeric | NO | 0 |
| valor_pago | numeric | YES |  |
| data_pagamento | date | YES |  |
| forma_pagamento | text | YES |  |
| status | text | NO | 'pendente'::text |
| descricao | text | YES |  |
| observacoes | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `faturas_pkey`: `CREATE UNIQUE INDEX faturas_pkey ON public.faturas USING btree (id)`
- `idx_faturas_owner`: `CREATE INDEX idx_faturas_owner ON public.faturas USING btree (owner_id)`
- `idx_faturas_cliente`: `CREATE INDEX idx_faturas_cliente ON public.faturas USING btree (cliente_id)`
- `idx_faturas_status`: `CREATE INDEX idx_faturas_status ON public.faturas USING btree (status)`
- `idx_faturas_vencimento`: `CREATE INDEX idx_faturas_vencimento ON public.faturas USING btree (data_vencimento)`

**Policies RLS**:

- **Owners manage faturas** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê suas faturas** (SELECT, roles=['authenticated'])
  - USING: `(cliente_id = current_cliente_id())`
  - CHECK: ``

---

## `licencas`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| cliente_id | uuid | YES |  |
| numero | text | NO |  |
| tipo | text | NO |  |
| orgao_emissor | text | NO |  |
| data_emissao | date | NO |  |
| data_validade | date | NO |  |
| status | text | NO | 'ativa'::text |
| escopo | text | YES |  |
| condicionantes | text | YES |  |
| arquivo_url | text | YES |  |
| observacoes | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `licencas_pkey`: `CREATE UNIQUE INDEX licencas_pkey ON public.licencas USING btree (id)`
- `idx_licencas_owner`: `CREATE INDEX idx_licencas_owner ON public.licencas USING btree (owner_id)`
- `idx_licencas_cliente`: `CREATE INDEX idx_licencas_cliente ON public.licencas USING btree (cliente_id)`
- `idx_licencas_validade`: `CREATE INDEX idx_licencas_validade ON public.licencas USING btree (data_validade)`
- `idx_licencas_status`: `CREATE INDEX idx_licencas_status ON public.licencas USING btree (status)`

**Policies RLS**:

- **Users manage own licencas** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê suas licencas** (SELECT, roles=['authenticated'])
  - USING: `(cliente_id = current_cliente_id())`
  - CHECK: ``

---

## `mtrs`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| cliente_id | uuid | NO |  |
| coleta_id | uuid | YES |  |
| numero | text | NO |  |
| data_emissao | date | NO | CURRENT_DATE |
| gerador | text | YES |  |
| transportador | text | YES |  |
| destinador | text | YES |  |
| classe_ibama | text | YES |  |
| codigo_residuo | text | YES |  |
| descricao_residuo | text | NO |  |
| quantidade | numeric | NO | 0 |
| unidade | text | NO | 'kg'::text |
| acondicionamento | text | YES |  |
| tecnologia_destinacao | text | YES |  |
| status | text | NO | 'emitido'::text |
| url_documento | text | YES |  |
| observacoes | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `mtrs_pkey`: `CREATE UNIQUE INDEX mtrs_pkey ON public.mtrs USING btree (id)`
- `idx_mtrs_owner`: `CREATE INDEX idx_mtrs_owner ON public.mtrs USING btree (owner_id)`
- `idx_mtrs_cliente`: `CREATE INDEX idx_mtrs_cliente ON public.mtrs USING btree (cliente_id)`
- `idx_mtrs_coleta`: `CREATE INDEX idx_mtrs_coleta ON public.mtrs USING btree (coleta_id)`

**Policies RLS**:

- **Owners manage mtrs** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê seus MTRs** (SELECT, roles=['authenticated'])
  - USING: `(cliente_id = current_cliente_id())`
  - CHECK: ``

---

## `notificacoes`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| tipo | text | NO |  |
| titulo | text | NO |  |
| mensagem | text | YES |  |
| ref_tabela | text | YES |  |
| ref_id | uuid | YES |  |
| lida | boolean | NO | false |
| prioridade | text | NO | 'media'::text |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `notificacoes_pkey`: `CREATE UNIQUE INDEX notificacoes_pkey ON public.notificacoes USING btree (id)`
- `idx_notif_owner`: `CREATE INDEX idx_notif_owner ON public.notificacoes USING btree (owner_id, lida, created_at DESC)`
- `idx_notif_ref`: `CREATE INDEX idx_notif_ref ON public.notificacoes USING btree (ref_tabela, ref_id)`

**Policies RLS**:

- **Owner gerencia suas notificacoes** (ALL, roles=['public'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`

---

## `profiles`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO |  |
| full_name | text | YES |  |
| email | text | YES |  |
| avatar_url | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `profiles_pkey`: `CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)`

**Policies RLS**:

- **Users view own profile** (SELECT, roles=['authenticated'])
  - USING: `(auth.uid() = id)`
  - CHECK: ``
- **Users update own profile** (UPDATE, roles=['authenticated'])
  - USING: `(auth.uid() = id)`
  - CHECK: ``
- **Users insert own profile** (INSERT, roles=['authenticated'])
  - USING: ``
  - CHECK: `(auth.uid() = id)`
- **Admins view all profiles** (SELECT, roles=['authenticated'])
  - USING: `has_role(auth.uid(), 'admin'::app_role)`
  - CHECK: ``

---

## `proposta_itens`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| proposta_id | uuid | NO |  |
| descricao | text | NO |  |
| tipo_residuo | text | YES |  |
| quantidade | numeric | NO | 1 |
| unidade | text | NO | 'kg'::text |
| valor_unitario | numeric | NO | 0 |
| valor_total | numeric | NO | 0 |
| ordem | integer | NO | 0 |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `proposta_itens_pkey`: `CREATE UNIQUE INDEX proposta_itens_pkey ON public.proposta_itens USING btree (id)`
- `idx_proposta_itens_proposta`: `CREATE INDEX idx_proposta_itens_proposta ON public.proposta_itens USING btree (proposta_id)`

**Policies RLS**:

- **Owners manage proposta_itens** (ALL, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = proposta_itens.proposta_id) AND (p.owner_id = auth.uid()))))`
  - CHECK: `(EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = proposta_itens.proposta_id) AND (p.owner_id = auth.uid()))))`
- **Cliente vê itens das suas propostas** (SELECT, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = proposta_itens.proposta_id) AND (p.cliente_id = current_cliente_id()))))`
  - CHECK: ``

---

## `propostas`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| cliente_id | uuid | NO |  |
| numero | text | NO |  |
| data_emissao | date | NO | CURRENT_DATE |
| validade | date | YES |  |
| condicoes_pagamento | text | YES |  |
| prazo_coleta | text | YES |  |
| valor_total | numeric | NO | 0 |
| status | text | NO | 'rascunho'::text |
| observacoes | text | YES |  |
| contrato_id | uuid | YES |  |
| enviada_em | timestamp with time zone | YES |  |
| respondida_em | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `propostas_pkey`: `CREATE UNIQUE INDEX propostas_pkey ON public.propostas USING btree (id)`
- `idx_propostas_owner`: `CREATE INDEX idx_propostas_owner ON public.propostas USING btree (owner_id)`
- `idx_propostas_cliente`: `CREATE INDEX idx_propostas_cliente ON public.propostas USING btree (cliente_id)`

**Policies RLS**:

- **Owners manage propostas** (ALL, roles=['authenticated'])
  - USING: `(auth.uid() = owner_id)`
  - CHECK: `(auth.uid() = owner_id)`
- **Cliente vê suas propostas** (SELECT, roles=['authenticated'])
  - USING: `(cliente_id = current_cliente_id())`
  - CHECK: ``

---

## `signatario_eventos`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| signatario_id | uuid | NO |  |
| evento | text | NO |  |
| ip | text | YES |  |
| user_agent | text | YES |  |
| metadata | jsonb | YES |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `signatario_eventos_pkey`: `CREATE UNIQUE INDEX signatario_eventos_pkey ON public.signatario_eventos USING btree (id)`
- `idx_eventos_sig`: `CREATE INDEX idx_eventos_sig ON public.signatario_eventos USING btree (signatario_id, created_at)`

**Policies RLS**:

- **eventos_owner_select** (SELECT, roles=['authenticated'])
  - USING: `(EXISTS ( SELECT 1    FROM signatarios s   WHERE ((s.id = signatario_eventos.signatario_id) AND (s.owner_id = auth.uid()))))`
  - CHECK: ``

---

## `signatario_otps`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| signatario_id | uuid | NO |  |
| codigo_hash | text | NO |  |
| tentativas | integer | NO | 0 |
| expira_em | timestamp with time zone | NO | (now() + '00:10:00'::interval) |
| usado_em | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `signatario_otps_pkey`: `CREATE UNIQUE INDEX signatario_otps_pkey ON public.signatario_otps USING btree (id)`
- `idx_otps_sig`: `CREATE INDEX idx_otps_sig ON public.signatario_otps USING btree (signatario_id)`

---

## `signatarios`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | NO |  |
| documento_tipo | USER-DEFINED | NO |  |
| documento_id | uuid | NO |  |
| ordem | integer | NO | 1 |
| nome | text | NO |  |
| email | text | NO |  |
| cpf_cnpj | text | YES |  |
| papel | USER-DEFINED | NO | 'contratada'::signatario_papel |
| token | uuid | NO | gen_random_uuid() |
| status | USER-DEFINED | NO | 'pendente'::signatario_status |
| email_enviado_em | timestamp with time zone | YES |  |
| assinado_em | timestamp with time zone | YES |  |
| expira_em | timestamp with time zone | NO | (now() + '30 days'::interval) |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**Índices**:

- `signatarios_pkey`: `CREATE UNIQUE INDEX signatarios_pkey ON public.signatarios USING btree (id)`
- `signatarios_token_key`: `CREATE UNIQUE INDEX signatarios_token_key ON public.signatarios USING btree (token)`
- `idx_signatarios_doc`: `CREATE INDEX idx_signatarios_doc ON public.signatarios USING btree (documento_tipo, documento_id)`
- `idx_signatarios_owner`: `CREATE INDEX idx_signatarios_owner ON public.signatarios USING btree (owner_id)`
- `idx_signatarios_token`: `CREATE INDEX idx_signatarios_token ON public.signatarios USING btree (token)`

**Policies RLS**:

- **owner_select** (SELECT, roles=['authenticated'])
  - USING: `(owner_id = auth.uid())`
  - CHECK: ``
- **owner_insert** (INSERT, roles=['authenticated'])
  - USING: ``
  - CHECK: `(owner_id = auth.uid())`
- **owner_update** (UPDATE, roles=['authenticated'])
  - USING: `(owner_id = auth.uid())`
  - CHECK: ``
- **owner_delete** (DELETE, roles=['authenticated'])
  - USING: `(owner_id = auth.uid())`
  - CHECK: ``

---

## `suppressed_emails`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| email | text | NO |  |
| reason | text | NO |  |
| metadata | jsonb | YES |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `suppressed_emails_pkey`: `CREATE UNIQUE INDEX suppressed_emails_pkey ON public.suppressed_emails USING btree (id)`
- `suppressed_emails_email_key`: `CREATE UNIQUE INDEX suppressed_emails_email_key ON public.suppressed_emails USING btree (email)`
- `idx_suppressed_emails_email`: `CREATE INDEX idx_suppressed_emails_email ON public.suppressed_emails USING btree (email)`

**Policies RLS**:

- **Service role can read suppressed emails** (SELECT, roles=['public'])
  - USING: `(auth.role() = 'service_role'::text)`
  - CHECK: ``
- **Service role can insert suppressed emails** (INSERT, roles=['public'])
  - USING: ``
  - CHECK: `(auth.role() = 'service_role'::text)`

---

## `user_roles`

- **PK**: id

**Colunas**:

| Coluna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO |  |
| role | USER-DEFINED | NO |  |
| created_at | timestamp with time zone | NO | now() |

**Índices**:

- `user_roles_pkey`: `CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id)`
- `user_roles_user_id_role_key`: `CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role)`

**Policies RLS**:

- **Users see own roles** (SELECT, roles=['authenticated'])
  - USING: `(auth.uid() = user_id)`
  - CHECK: ``
- **Admins view all roles** (SELECT, roles=['authenticated'])
  - USING: `(has_role(auth.uid(), 'admin'::app_role) OR (user_id = auth.uid()))`
  - CHECK: ``
- **Admins manage roles** (INSERT, roles=['authenticated'])
  - USING: ``
  - CHECK: `has_role(auth.uid(), 'admin'::app_role)`
- **Admins delete roles** (DELETE, roles=['authenticated'])
  - USING: `has_role(auth.uid(), 'admin'::app_role)`
  - CHECK: ``

---

