
-- 1) RLS policies on signatario_otps (deny all client access; service role only)
ALTER TABLE public.signatario_otps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.signatario_otps FROM anon, authenticated;
GRANT ALL ON public.signatario_otps TO service_role;
CREATE POLICY "service_role manages otps"
  ON public.signatario_otps FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2) Fix mutable search_path on email queue helper functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 3) Revoke EXECUTE on SECURITY DEFINER functions from anon (and limit where possible)
-- has_role and current_cliente_id must remain callable by authenticated (used in RLS).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_cliente_id() FROM PUBLIC, anon;

-- Email queue + cron helpers: only service_role should invoke
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- Notification generator: only service_role / cron
REVOKE EXECUTE ON FUNCTION public.gerar_notificacoes_vencimento() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_notificacoes_vencimento() TO service_role;

-- handle_new_user is a trigger function on auth.users; clients should never call it
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
