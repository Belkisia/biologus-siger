-- Insere o modelo oficial de contrato "Bio Logus 2026" (o texto legal
-- completo, com clausulas, fornecido pela Bio Logus) como modelo padrao
-- do sistema (owner_id NULL = disponivel para todos, usado
-- automaticamente ao criar um "Novo contrato" padrao).
-- RODE DEPOIS de 2026-08-12_criar_tabelas_contrato_modelos.sql.
-- Rode no SQL Editor do Supabase.
-- Idempotente: nao duplica se ja existir um modelo com esse nome.

INSERT INTO public.contrato_modelos (owner_id, nome, descricao, conteudo_html, ativo, versao_atual)
SELECT NULL, 'Bio Logus 2026',
  'Contrato de Prestacao de Servico de Coleta, Transporte e Destinacao Final de Residuos de Servicos de Saude -- modelo oficial da Bio Logus Ambiental, com preenchimento automatico dos dados do cliente e da proposta.',
  '<div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#111;max-width:820px;margin:0 auto">

<p style="text-align:center;font-weight:bold;font-size:15px;margin-bottom:4px">CONTRATO DE PRESTAÇÃO DE SERVIÇO DE COLETA, TRANSPORTE E DESTINAÇÃO FINAL DE RESÍDUOS DE SERVIÇOS DE SAÚDE</p>
<p style="text-align:center;font-weight:bold;margin-bottom:20px">Contrato Nº {{CONTRATO_NUMERO}}</p>

<p>Pelo presente instrumento de contrato de um lado, como contratante: <strong>{{CLIENTE_RAZAO_SOCIAL}}</strong>, pessoa física/jurídica de direito privado, inscrita no CNPJ/CPF sob nº <strong>{{CLIENTE_CNPJ}}</strong>, nome fantasia: <strong>{{CLIENTE_NOME_FANTASIA}}</strong>, com sede na {{CLIENTE_ENDERECO}}, {{CLIENTE_CIDADE}}/{{CLIENTE_ESTADO}}, telefone: <strong>{{CLIENTE_TELEFONE}}</strong>, CEP: {{CLIENTE_CEP}}, neste ato representada por: <strong>{{REPRESENTANTE_NOME}}</strong>, com o CPF n°: {{REPRESENTANTE_CPF}}, com o e-mail: {{CLIENTE_EMAIL}} e de outro lado, <strong>{{EMPRESA_RAZAO_SOCIAL}}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob nº {{EMPRESA_CNPJ}}, com sede na {{EMPRESA_ENDERECO}}, doravante simplesmente denominada <strong>Contratada</strong>, ajustam e celebram o presente <strong>Contrato de Prestação De Serviço De Coleta, Transporte e Destinação Final De Resíduos de Serviços de Saúde</strong>, fazendo-o reger-se pelas cláusulas e condições a seguir estipuladas:</p>

<p><strong>Cláusula Primeira: Do Objeto</strong></p>
<p><strong>1.1.</strong> Constitui objeto do presente Contrato a prestação de serviços de coleta, transporte e destinação final de resíduos líquidos e sólidos de saúde, classificados como pertencentes ao {{GRUPOS_RESIDUOS}}, e conforme Resolução CONAMA nº 358/2005 e ANVISA nº 222/18.</p>
<p><strong>1.2.</strong> A coleta e o transporte referem-se a 0 a {{LIMITE_KG}} Kg (zero a {{LIMITE_KG}}) quilos de resíduos {{FREQUENCIA_COLETA}}, que serão pesados na unidade da <strong>Contratante</strong>.</p>
<p><strong>1.3.</strong> A Destinação final será realizada pela empresa Bio Projetos Sustentáveis EIRELI, com CNPJ: 21.317.279/0001-01, localizada no endereço V Secundária, módulo 12, Qd. 43, Dist. Indus. de Luziânia, CEP: 72.832-000, Luziânia - GO.</p>

<p><strong>Cláusula Segunda: Da Forma de Execução</strong></p>
<p><strong>2.1.</strong> A <strong>Contratada</strong> deverá coletar {{FREQUENCIA_COLETA}}, em horário comercial, todos os resíduos líquidos e sólidos de saúde na sede da Contratante, em {{LOCAL_COLETA}}.</p>
<p><strong>2.2.</strong> Caberá à <strong>Contratada</strong> apresentar, no local combinado, com seus empregados devidamente uniformizados e com a devida identificação, utilizando-se de veículos e equipamentos suficientes para a realização dos serviços.</p>

<p><strong>Cláusula Terceira: Do Preço e Forma de Pagamento</strong></p>
<p><strong>3.1.</strong> Pela execução do serviço, objeto deste Contrato, a Contratante pagará à Contratada o valor de {{VALOR_MENSAL}} mensais, referente à coleta de até {{LIMITE_KG}} kg quilos de resíduos coletados, que será pago {{FORMA_PAGAMENTO}}.</p>
<p><strong>3.2.</strong> Por quilos excedidos será cobrado o valor de {{VALOR_EXCEDENTE}} por kg coletado.</p>
<p><strong>3.3.</strong> O pagamento somente será efetuado mediante crédito em conta bancária / boleto bancário de titularidade da Contratada.</p>
<p><strong>3.4.</strong> A Contratada deverá emitir Nota Fiscal de comprovação dos serviços prestados, até sete dias após o valor ter sido creditado.</p>
<p><strong>3.5.</strong> Havendo necessidade de coletas extras, serão cobrados os valores referentes à Cláusula Terceira, itens <strong>3.1</strong> e <strong>3.2</strong>, em horários agendados previamente, conforme disponibilidade do veículo da Contratada.</p>
<p><strong>3.6.</strong> A inadimplência de pagamento da CONTRATANTE acarretará a incidência de multa e juros moratórios de 2% (dois por cento) ao mês, e caso a inadimplência perdure por período superior a 60 (sessenta) dias, esta será encaminhada ao cartório para protesto e execução extrajudicial.</p>
<p><strong>3.7.</strong> A inadimplência pelo período superior a 60 (sessenta) dias desobriga a CONTRATADA de prestar os serviços constantes na Cláusula Primeira, não desobrigando a CONTRATANTE ao pagamento dos meses suspensos.</p>
<p><strong>3.8.</strong> A suspensão dos serviços prestados pela CONTRATADA acarretará também na suspensão da emissão de MTR — Manifesto de Transporte de Resíduos Perigosos — e do Certificado de Destinação Final em nome da CONTRATANTE, documentos exigidos pelo órgão fiscalizador da Vigilância Sanitária para o funcionamento das atividades da CONTRATANTE.</p>

<p><strong>Cláusula Quarta: Da Vigência</strong></p>
<p><strong>4.1.</strong> O presente contrato terá vigência de {{VIGENCIA_ANOS}} ano(s), a partir da sua assinatura ({{VIGENCIA}}), podendo ser renovado automaticamente pelo mesmo período, mediante acordo por escrito entre as partes, com os devidos reajustes legais.</p>

<p><strong>Cláusula Quinta: Das Obrigações da Contratada</strong></p>
<p><strong>5.1.</strong> Caberá à <strong>Contratada</strong>, dentre outras obrigações legais:</p>
<p><strong>a)</strong> Realizar a coleta dos resíduos líquidos e sólidos conforme estabelecido na Cláusula Segunda, item 2.2;</p>
<p><strong>b)</strong> Transportar e dar destinação final aos resíduos coletados na <strong>Contratante</strong>, obedecendo às normas legais e de segurança promovidas pela União, Estado e Município;</p>
<p><strong>c)</strong> Fornecer aos empregados uniforme completo e adequado ao tipo de serviço, com identificação da <strong>Contratada</strong>;</p>
<p><strong>d)</strong> Manter todos os empregados com o esquema de imunização completo, segundo as normas do Ministério do Trabalho, fornecendo adequadamente os EPIs necessários;</p>
<p><strong>e)</strong> Assumir a responsabilidade pela regularização e manutenção de documentos, pagando todos os tributos e encargos Federais, Estaduais e Municipais incidentes sobre a prestação de serviço, apresentando, sempre que solicitado, as certidões de regularidade fiscal, trabalhista e previdenciária;</p>
<p><strong>f)</strong> Observar e fazer cumprir todas as normas legais relativas às atividades desenvolvidas, respondendo integralmente por quaisquer prejuízos ocasionados ao <strong>Contratante</strong> pela inobservância dessas obrigações;</p>
<p><strong>g)</strong> Emitir o Certificado de Tratamento e Disposição Final dos resíduos gerenciados durante o respectivo mês de prestação de serviços, após a comprovação do pagamento pela <strong>Contratante</strong>.</p>

<p><strong>Cláusula Sexta: Das Obrigações da Contratante</strong></p>
<p><strong>6.1.</strong> Caberá à <strong>Contratante</strong>, às suas expensas, dentre outras obrigações legais:</p>
<p><strong>a)</strong> Remunerar pontualmente a <strong>Contratada</strong>, na forma estabelecida na Cláusula Terceira;</p>
<p><strong>b)</strong> Promover as facilidades necessárias para o livre acesso dos profissionais da <strong>Contratada</strong> às suas instalações, desde que devidamente identificados;</p>
<p><strong>c)</strong> Comunicar a <strong>Contratada</strong>, por escrito, caso haja necessidade de alterar os dias da coleta ou de coletas extras;</p>
<p><strong>d)</strong> Declarar o conteúdo dos resíduos efetivamente coletados, que devem estar à disposição da <strong>Contratada</strong> no ato da coleta;</p>
<p><strong>e)</strong> Responsabilizar-se pelos recipientes entregues pela <strong>Contratada</strong> enquanto permanecerem em seu recinto, indenizando-a em caso de perda, roubo ou avarias;</p>
<p><strong>f)</strong> A <strong>Contratante</strong> se compromete a trabalhar em caráter de exclusividade na prestação do serviço objeto deste instrumento com a <strong>Contratada</strong>, nos termos do artigo 711 do Código Civil Brasileiro, sob pena de ação de execução por quantia certa no valor de 12 (doze) vezes o estabelecido na Cláusula 3.1.</p>

<p><strong>Cláusula Sétima: Das Condições Gerais</strong></p>
<p><strong>7.1.</strong> Em decorrência da presente contratação, sob qualquer hipótese, não se presumirá a existência de qualquer vínculo societário e/ou empregatício, ou obrigações de caráter trabalhista e previdenciário entre as partes, por si, seus contratados, prepostos e/ou empregados, cabendo a cada sociedade a exclusividade e responsabilidade por tais obrigações, inclusive nas esferas civil e penal.</p>
<p><strong>7.2.</strong> Cada parte responderá individualmente por quaisquer perdas e danos, materiais ou pessoais, oriundos de suas respectivas ações ou omissões, bem como dos profissionais a si vinculados, sendo de responsabilidade exclusiva e indelegável da parte culpada responder perante terceiros e à parte inocente, nas hipóteses de imperícia, imprudência ou negligência.</p>
<p><strong>7.3.</strong> As partes dão ao presente instrumento o caráter de título executivo extrajudicial, nos termos do artigo 784, inciso III, do Código de Processo Civil/2015. A parte que der causa à rescisão contratual, por infringir qualquer das normas previstas neste instrumento ou a legislação, pagará à outra, em forma de multa contratual, 80% (oitenta por cento) do valor restante do contrato.</p>
<p><strong>7.4.</strong> A tolerância das partes a qualquer infração das condições aqui avençadas não poderá ser interpretada como renúncia ao direito, nem tampouco como alteração contratual.</p>

<p><strong>Cláusula Oitava: Da Rescisão</strong></p>
<p><strong>8.1.</strong> Haverá rescisão contratual se uma das partes descumprir qualquer das cláusulas constantes do presente instrumento.</p>
<p><strong>8.2.</strong> O presente contrato se torna rescindido de pleno direito ao fim da vigência estabelecida na Cláusula Quarta, cabendo às partes comunicar-se por escrito, com 30 (trinta) dias de antecedência, seja pelo fim ou pela continuação do mesmo.</p>

<p><strong>Cláusula Nona: Do Foro</strong></p>
<p><strong>9.1.</strong> As partes elegem o foro da cidade de <strong>Goiânia/GO</strong> como o único competente para o exercício e cumprimento dos direitos e obrigações decorrentes do presente instrumento, renunciando as partes a qualquer outro, por mais privilegiado que seja.</p>

<p>Por estarem, assim, justas e contratadas, as partes assinam o presente instrumento em 02 (duas) vias de igual teor e forma e para o mesmo fim, para que se produzam seus jurídicos e legais efeitos.</p>

<p>Goiânia/GO, {{DATA_CONTRATO}}.</p>

{{BLOCO_ASSINATURA}}

<table style="width:100%;margin-top:32px;font-family:Arial,sans-serif;font-size:12px">
  <tr>
    <td style="width:48%;padding:24px 16px 0">
      Testemunha 1: ______________________________________<br>
      CPF: ______________________________________
    </td>
    <td style="width:4%"></td>
    <td style="width:48%;padding:24px 16px 0">
      Testemunha 2: ______________________________________<br>
      CPF: ______________________________________
    </td>
  </tr>
</table>

</div>',
  true, 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.contrato_modelos WHERE nome = 'Bio Logus 2026' AND owner_id IS NULL
);
