
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);

CREATE OR REPLACE FUNCTION public.current_cliente_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.clientes WHERE user_id = auth.uid() LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.current_cliente_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_cliente_id() TO authenticated, service_role;

CREATE POLICY "Cliente vê seus contratos"
  ON public.contratos FOR SELECT TO authenticated
  USING (cliente_id = public.current_cliente_id());

CREATE POLICY "Cliente vê suas coletas"
  ON public.coletas FOR SELECT TO authenticated
  USING (cliente_id = public.current_cliente_id());

CREATE POLICY "Cliente vê seus MTRs"
  ON public.mtrs FOR SELECT TO authenticated
  USING (cliente_id = public.current_cliente_id());

CREATE POLICY "Cliente vê seus CDFs"
  ON public.cdfs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mtrs m
      WHERE m.id = cdfs.mtr_id AND m.cliente_id = public.current_cliente_id()
    )
  );

CREATE POLICY "Cliente vê suas faturas"
  ON public.faturas FOR SELECT TO authenticated
  USING (cliente_id = public.current_cliente_id());

CREATE POLICY "Cliente vê suas licencas"
  ON public.licencas FOR SELECT TO authenticated
  USING (cliente_id = public.current_cliente_id());

CREATE POLICY "Cliente vê seu cadastro"
  ON public.clientes FOR SELECT TO authenticated
  USING (user_id = auth.uid());
