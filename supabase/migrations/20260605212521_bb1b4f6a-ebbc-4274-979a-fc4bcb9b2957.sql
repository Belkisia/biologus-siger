
-- Enum status
CREATE TYPE public.signatario_status AS ENUM ('pendente','otp_enviado','assinado','recusado','expirado');
CREATE TYPE public.signatario_papel AS ENUM ('contratante','contratada','testemunha');
CREATE TYPE public.documento_tipo AS ENUM ('contrato','proposta');

-- ============ signatarios ============
CREATE TABLE public.signatarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  documento_tipo public.documento_tipo NOT NULL,
  documento_id UUID NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 1,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf_cnpj TEXT,
  papel public.signatario_papel NOT NULL DEFAULT 'contratada',
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status public.signatario_status NOT NULL DEFAULT 'pendente',
  email_enviado_em TIMESTAMPTZ,
  assinado_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signatarios_doc ON public.signatarios(documento_tipo, documento_id);
CREATE INDEX idx_signatarios_owner ON public.signatarios(owner_id);
CREATE INDEX idx_signatarios_token ON public.signatarios(token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.signatarios TO authenticated;
GRANT ALL ON public.signatarios TO service_role;

ALTER TABLE public.signatarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select" ON public.signatarios FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "owner_insert" ON public.signatarios FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner_update" ON public.signatarios FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "owner_delete" ON public.signatarios FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TRIGGER tg_signatarios_updated BEFORE UPDATE ON public.signatarios
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ signatario_otps ============
CREATE TABLE public.signatario_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signatario_id UUID NOT NULL REFERENCES public.signatarios(id) ON DELETE CASCADE,
  codigo_hash TEXT NOT NULL,
  tentativas INTEGER NOT NULL DEFAULT 0,
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  usado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otps_sig ON public.signatario_otps(signatario_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.signatario_otps TO authenticated;
GRANT ALL ON public.signatario_otps TO service_role;

ALTER TABLE public.signatario_otps ENABLE ROW LEVEL SECURITY;
-- nenhuma policy para authenticated: só service_role acessa (server fns públicas)

-- ============ signatario_eventos (auditoria append-only) ============
CREATE TABLE public.signatario_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signatario_id UUID NOT NULL REFERENCES public.signatarios(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eventos_sig ON public.signatario_eventos(signatario_id, created_at);

GRANT SELECT ON public.signatario_eventos TO authenticated;
GRANT ALL ON public.signatario_eventos TO service_role;

ALTER TABLE public.signatario_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eventos_owner_select" ON public.signatario_eventos FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.signatarios s WHERE s.id = signatario_id AND s.owner_id = auth.uid())
);

-- ============ documento_assinaturas ============
CREATE TABLE public.documento_assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signatario_id UUID NOT NULL UNIQUE REFERENCES public.signatarios(id) ON DELETE CASCADE,
  documento_tipo public.documento_tipo NOT NULL,
  documento_id UUID NOT NULL,
  hash_documento TEXT NOT NULL,
  codigo_verificacao TEXT NOT NULL UNIQUE,
  rubrica_base64 TEXT,
  pdf_assinado_path TEXT,
  ip TEXT,
  user_agent TEXT,
  geo JSONB,
  assinado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assin_doc ON public.documento_assinaturas(documento_tipo, documento_id);
CREATE INDEX idx_assin_codigo ON public.documento_assinaturas(codigo_verificacao);

GRANT SELECT ON public.documento_assinaturas TO authenticated;
GRANT ALL ON public.documento_assinaturas TO service_role;

ALTER TABLE public.documento_assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assin_owner_select" ON public.documento_assinaturas FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.signatarios s WHERE s.id = signatario_id AND s.owner_id = auth.uid())
);
