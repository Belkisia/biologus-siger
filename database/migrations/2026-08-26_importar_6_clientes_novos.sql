-- Importa os 6 clientes novos da planilha Contratos_Cliente_26-08-26.xls
-- (comparados com a versao de 10-08-26): cadastro, contrato/franquia e
-- vinculo com a rota correta.
-- Rode no SQL Editor do Supabase (yqeibkichwddwfjxjtlf.supabase.co).
-- Idempotente: nao duplica cliente/contrato/vinculo se rodar de novo.

DO $$
DECLARE
  v_owner_id uuid;
  v_cliente_id uuid;
  v_contrato_id uuid;
  r record;
BEGIN
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'comercial@biologusambiental.com.br' LIMIT 1;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Usuario comercial@biologusambiental.com.br nao encontrado em auth.users';
  END IF;

  FOR r IN
    SELECT * FROM (VALUES
  ('PULSAR CENTRO MEDICO E DIAGNOSTICOS LTDA', 'PULSAR CENTRO MEDICO E DIAGNOSTICOS', '63.912.208/0001-29', '(62) 3003-5423', 'contato@laboratoriopulsar.com.br', 'R 45 - PASTOR JUSTO DE MELO, S/N - QUADRAI LOTE 1 TERREO1', 'BOA VISTA', 'Itapuranga', 'GO', '76680-000', 7, 75.0, 8.5, '1084', 'Grupo A, B e E', 'itaberai', '63912208000129'),
  ('TALES DOS SANTOS LOPES - TKAR AUTO SERVICE EXPRESS', 'TKAR AUTO SERVICE EXPRESS', '62.934.212/0001-01', '(62) 9992-53733', 'tkarautoservice@gmail.com', 'AVENIDA RITA CAETANO, 2167 - QUADRA 16, LOTE 20', 'RESIDENCIAL SANTA FE', 'Goiânia', 'GO', '74356-235', 15, 150.0, 8.5, '1162', 'Class I', 'vera_cruz', '62934212000101'),
  ('DROGA PHARMA W S L LTDA', 'DROGA PHARMA', '57.952.809/0001-30', '(62) 9985-39432', 'DrogapharmaWSL@gmail.com', 'AVENIDA VEIGA VALLE, SN - LOTE 10 QUADRA72', 'PARQUE VEIGA JARDIM', 'Aparecida de Goiânia', 'GO', '74954-012', 10, 60.0, 8.5, '1163', 'Grupo A, B e E', 'aparecida', '57952809000130'),
  ('ELMA MORAES LIMA', 'ODONTO CENTER- BOM JARDIM', '428.141.111-91', '(66) 9928-24903', 'odonto.center2020@outlook.com', 'AVENIDA MARIA CLARA DE JESUS, 165', 'CENTRO', 'Bom Jardim de Goiás', 'GO', '76245-000', 5, 85.0, 8.5, '1164', 'Grupo A, B e E', 'ipora', '42814111191'),
  ('IMPERIUM ODONTOLOGIA LTDA', 'IMPERIUM ODONTOLOGIA', '28.364.888/0001-60', '(62) 9842-03281', 'imperiumodontologia@gmail.com', 'RUA JOSE HERMANO, 1253 - QUADRA06 LOTE 18', 'SETOR CAMPINAS', 'Goiânia', 'GO', '74515-030', 10, 90.0, 8.5, '1165', 'Grupo A, B e E', 'campinas', '28364888000160'),
  ('DROGARIA VIEIRA GOMES LTDA', 'DROGARIA SOLUCAO', '04.139.293/0001-43', '(62) 9911-92131', 'drogariasolucao@hotmail.com', 'AVENIDA DAS MANGUEIRAS, S/N - QD-38 LT-01', 'VILA ALZIRA', 'Aparecida de Goiânia', 'GO', '74913-360', 5, 65.0, 8.5, '1167', 'Grupo A, B e E', 'aparecida', '04139293000143')
    ) AS t(razao_social, nome_fantasia, cnpj, telefone, email, endereco, bairro, cidade, estado, cep,
           franquia, valor_mensal, valor_excedente, numero_contrato, grupo_residuo, rota_codigo, cnpj_digits)
  LOOP
    -- Cliente (so cria se nao existir com esse CNPJ)
    SELECT id INTO v_cliente_id FROM public.clientes
      WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = r.cnpj_digits;

    IF v_cliente_id IS NULL THEN
      INSERT INTO public.clientes
        (owner_id, razao_social, nome_fantasia, cnpj, telefone, email, endereco, bairro, cidade, estado, cep,
         peso_franquia, valor_franquia, valor_kg_excedente, status)
      VALUES
        (v_owner_id, r.razao_social, r.nome_fantasia, r.cnpj, r.telefone, r.email, r.endereco, r.bairro,
         r.cidade, r.estado, r.cep, r.franquia, r.valor_mensal, r.valor_excedente, 'ativo')
      RETURNING id INTO v_cliente_id;
    END IF;

    -- Contrato (so cria se esse numero ainda nao existir para esse cliente)
    SELECT id INTO v_contrato_id FROM public.contratos
      WHERE numero = r.numero_contrato AND cliente_id = v_cliente_id;

    IF v_contrato_id IS NULL THEN
      INSERT INTO public.contratos
        (owner_id, cliente_id, numero, status, data_inicio, valor_mensal, grupos_residuos, limite_kg, valor_excedente)
      VALUES
        (v_owner_id, v_cliente_id, r.numero_contrato, 'ativo', CURRENT_DATE, r.valor_mensal, r.grupo_residuo,
         r.franquia, r.valor_excedente)
      RETURNING id INTO v_contrato_id;

      INSERT INTO public.contrato_itens
        (contrato_id, descricao, grupo_residuo, unidade, franquia, preco_unitario, preco_excedente, ordem)
      VALUES
        (v_contrato_id, 'Coleta, transporte e destinação final dos resíduos', r.grupo_residuo, 'kg',
         r.franquia, 0, r.valor_excedente, 0);
    END IF;

    -- Vincula na rota certa (nao duplica se ja estiver la)
    INSERT INTO public.rota_clientes (rota_codigo, cliente_id, ordem, coletado)
    SELECT r.rota_codigo, v_cliente_id,
      (SELECT COALESCE(MAX(ordem), 0) + 1 FROM public.rota_clientes WHERE rota_codigo = r.rota_codigo),
      false
    WHERE NOT EXISTS (
      SELECT 1 FROM public.rota_clientes WHERE rota_codigo = r.rota_codigo AND cliente_id = v_cliente_id
    );
  END LOOP;
END $$;

-- Conferir depois:
-- SELECT razao_social, cidade FROM public.clientes WHERE cnpj IN
--   ('63.912.208/0001-29','62.934.212/0001-01','57.952.809/0001-30','428.141.111-91','28.364.888/0001-60','04.139.293/0001-43');
