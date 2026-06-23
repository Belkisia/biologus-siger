-- Tabela de rotas cadastradas no sistema
CREATE TABLE public.rotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  nome text NOT NULL,
  codigo text NOT NULL, -- ex: centro_aeroporto, rio_verde
  semana text NOT NULL, -- S1, S2, S3, S4, Semanal, Quinzenal
  dias_semana text[], -- ['seg','qua','sex']
  duracao_dias integer NOT NULL DEFAULT 1,
  carro text, -- A ou B
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clientes vinculados a cada rota
CREATE TABLE public.rota_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  rota_id uuid NOT NULL REFERENCES public.rotas(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0, -- sequência na rota
  frequencia text NOT NULL DEFAULT 'semanal', -- semanal, quinzenal, mensal
  semanas_ativas text[], -- ['s1','s2','s3','s4'] ou null = todas
  dia_preferencial text, -- seg, ter, qua, qui, sex
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rota_id, cliente_id)
);

-- Adiciona rota_id em coletas para rastrear qual rota gerou a coleta
ALTER TABLE public.coletas ADD COLUMN IF NOT EXISTS rota_id uuid REFERENCES public.rotas(id) ON DELETE SET NULL;
ALTER TABLE public.coletas ADD COLUMN IF NOT EXISTS rota_codigo text;

-- RLS
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rota_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_rotas" ON public.rotas
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_all_rota_clientes" ON public.rota_clientes
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rotas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rota_clientes TO authenticated;

-- Índices
CREATE INDEX idx_rotas_owner ON public.rotas(owner_id);
CREATE INDEX idx_rota_clientes_rota ON public.rota_clientes(rota_id);
CREATE INDEX idx_rota_clientes_cliente ON public.rota_clientes(cliente_id);
CREATE INDEX idx_coletas_rota ON public.coletas(rota_id);
