
REVOKE EXECUTE ON FUNCTION public.gerar_notificacoes_vencimento() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_notificacoes_vencimento() TO service_role;
