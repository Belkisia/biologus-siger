-- Cadastra o cliente PRO DENT ODONTOLOGIA (G.M. Rios de Sousa), que
-- faltava, cria o contrato/franquia e vincula na rota Aparecida.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente.

DO $$
DECLARE
  v_owner_id uuid;
  v_cliente_id uuid;
  v_contrato_id uuid;
BEGIN
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'comercial@biologusambiental.com.br' LIMIT 1;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Usuario comercial@biologusambiental.com.br nao encontrado em auth.users';
  END IF;

  SELECT id INTO v_cliente_id FROM public.clientes WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = '35722473000187';

  IF v_cliente_id IS NULL THEN
    INSERT INTO public.clientes
      (owner_id, razao_social, nome_fantasia, cnpj, telefone, email, endereco, bairro, cidade, estado, cep,
       peso_franquia, valor_franquia, valor_kg_excedente, status)
    VALUES
      (v_owner_id, 'G. M. RIOS DE SOUSA - PRO DENT ODONTOLOGIA JARDIM TIRADENTES', 'PRO DENT ODONTOLOGIA',
       '35.722.473/0001-87', '(64) 9853-41726', 'prodent.ap@gmail.com',
       'RUA Z 1, SN - QUADRA 17 A LOTE 10 CASA 03', 'JARDIM TIRADENTES', 'Aparecida de Goiânia', 'GO',
       '74961-060', 10, 68.00, 8.50, 'ativo')
    RETURNING id INTO v_cliente_id;
  END IF;

  SELECT id INTO v_contrato_id FROM public.contratos WHERE numero = '1101' AND cliente_id = v_cliente_id;

  IF v_contrato_id IS NULL THEN
    INSERT INTO public.contratos
      (owner_id, cliente_id, numero, status, data_inicio, valor_mensal, grupos_residuos, limite_kg, valor_excedente)
    VALUES
      (v_owner_id, v_cliente_id, '1101', 'ativo', CURRENT_DATE, 68.00, 'Grupo A, B e E', 10, 8.50)
    RETURNING id INTO v_contrato_id;

    INSERT INTO public.contrato_itens
      (contrato_id, descricao, grupo_residuo, unidade, franquia, preco_unitario, preco_excedente, ordem)
    VALUES
      (v_contrato_id, 'Coleta, transporte e destinação final dos resíduos', 'Grupo A, B e E', 'kg', 10, 0, 8.50, 0);
  END IF;

  INSERT INTO public.rota_clientes (rota_codigo, cliente_id, ordem, coletado)
  SELECT 'aparecida', v_cliente_id,
    (SELECT COALESCE(MAX(ordem), 0) + 1 FROM public.rota_clientes WHERE rota_codigo = 'aparecida'),
    false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.rota_clientes WHERE rota_codigo = 'aparecida' AND cliente_id = v_cliente_id
  );
END $$;
