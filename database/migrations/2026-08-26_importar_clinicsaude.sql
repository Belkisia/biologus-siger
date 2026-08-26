-- Cadastra o cliente CLINICSAUDE (faltava, confirmado por consulta
-- direta), cria o contrato/franquia e vincula na rota Aparecida.
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

  SELECT id INTO v_cliente_id FROM public.clientes WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = '33661370000129';

  IF v_cliente_id IS NULL THEN
    INSERT INTO public.clientes
      (owner_id, razao_social, nome_fantasia, cnpj, telefone, email, endereco, bairro, cidade, estado, cep,
       peso_franquia, valor_franquia, valor_kg_excedente, status)
    VALUES
      (v_owner_id, 'CLINICSAUDE CLINICA MEDICA E ODONTOLOGICA EIRELI', 'CLINICSAUDE', '33.661.370/0001-29',
       '(62) 3588-5052', 'clinicsaude@outlook.com', 'AVENIDA DA IGUALDADE, SN - QUADRA122 LOTE 42 E 44',
       'SETOR GARAVELO', 'Aparecida de Goiânia', 'GO', '74930-530', 10, 70.00, 5.00, 'ativo')
    RETURNING id INTO v_cliente_id;
  END IF;

  SELECT id INTO v_contrato_id FROM public.contratos WHERE numero = '74' AND cliente_id = v_cliente_id;

  IF v_contrato_id IS NULL THEN
    INSERT INTO public.contratos
      (owner_id, cliente_id, numero, status, data_inicio, valor_mensal, grupos_residuos, limite_kg, valor_excedente)
    VALUES
      (v_owner_id, v_cliente_id, '74', 'ativo', CURRENT_DATE, 70.00, 'Grupo A, B e E', 10, 5.00)
    RETURNING id INTO v_contrato_id;

    INSERT INTO public.contrato_itens
      (contrato_id, descricao, grupo_residuo, unidade, franquia, preco_unitario, preco_excedente, ordem)
    VALUES
      (v_contrato_id, 'Coleta, transporte e destinação final dos resíduos', 'Grupo A, B e E', 'kg', 10, 0, 5.00, 0);
  END IF;

  INSERT INTO public.rota_clientes (rota_codigo, cliente_id, ordem, coletado)
  SELECT 'aparecida', v_cliente_id,
    (SELECT COALESCE(MAX(ordem), 0) + 1 FROM public.rota_clientes WHERE rota_codigo = 'aparecida'),
    false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.rota_clientes WHERE rota_codigo = 'aparecida' AND cliente_id = v_cliente_id
  );
END $$;
