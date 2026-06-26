import{J as T,r,s as B,j as e,I as G,B as $,t as u}from"./index-c7npkDPE.js";import{L as j}from"./label-Cr-0mCUd.js";import{S,a as y,d as A,b as E,c as d}from"./select-DdUdFMCt.js";import{u as F}from"./auth-middleware-BbgA0O3y.js";import{a as k}from"./pgrss.functions-DMbAJMCI.js";import{E as J}from"./eye-DUS36hhq.js";import{P as H}from"./printer-lPxReO6H.js";import{L as X}from"./loader-circle-Yl3if1Bh.js";import{S as Q}from"./save-D6tl8HLw.js";import"./index-CefGEete.js";import"./index-wZI6b6dx.js";import"./index-DlIHGqgl.js";import"./index-Bj746wUg.js";import"./index-D_xv62f4.js";import"./index-B-Rx1iQQ.js";import"./index-BxCiUtGa.js";import"./index-MmF9WpW5.js";import"./check-Da0a8lAl.js";const C={nome:"Bio Logus Soluções Ambientais",cnpj:"26.484.921/0001-60",endereco:"Rua dos Ferroviários Qd 01 Lt 05, Parque Industrial João Brás 2, Goiânia-GO, CEP 74.483-115"};function O(c){return c.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}function q(c){const _=Math.floor(c),p=Math.round((c-_)*100),f=["","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"],b=["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"],P=["","cem","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"];function n(s){return s===0?"":s===100?"cem":s<20?f[s]:s<100?b[Math.floor(s/10)]+(s%10?" e "+f[s%10]:""):P[Math.floor(s/100)]+(s%100?" e "+n(s%100):"")}function N(s){if(s===0)return"zero";if(s<1e3)return n(s);const m=Math.floor(s/1e3),x=s%1e3,g=m===1?"mil":n(m)+" mil";return x===0?g:g+(x<100?" e ":", ")+n(x)}const h=`${N(_)} ${_===1?"real":"reais"}`;if(p===0)return h;const v=`${n(p)} ${p===1?"centavo":"centavos"}`;return`${h} e ${v}`}function ue(){const c=T(),_=F(k),[p,f]=r.useState([]),[b,P]=r.useState(""),[n,N]=r.useState(""),[z,h]=r.useState("30"),[v,s]=r.useState("30"),[m,x]=r.useState("50% no aceite da proposta e 50% na entrega do documento final"),[g,I]=r.useState(!1),[w,M]=r.useState(!1);r.useEffect(()=>{(async()=>{const{data:o}=await B.from("clientes").select("id,razao_social,nome_fantasia,cnpj,endereco,numero,bairro,cidade,estado,cep,email,telefone,responsavel_tecnico,responsavel_financeiro").order("razao_social",{ascending:!0});f(o??[])})()},[]);const a=p.find(o=>o.id===b),t=Number(n.replace(/\./g,"").replace(",","."))||0;function D(){const o=new Date().getFullYear(),i=String(Math.floor(Math.random()*9e3)+1e3);return`PGRSS-${o}-${i}`}function R(o){if(!a)return"";const i=new Date().toLocaleDateString("pt-BR"),l=[a.endereco,a.numero,a.bairro,a.cidade&&a.estado?`${a.cidade}/${a.estado}`:a.cidade,a.cep].filter(Boolean).join(", ");return`
<div style="width:190mm;min-height:277mm;margin:0 auto;padding:10mm 12mm;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.45;box-sizing:border-box">
  <div style="border-bottom:2px solid #0E3D1A;padding-bottom:6px;margin-bottom:10px">
    <div style="font-size:14px;font-weight:800;color:#0E3D1A">${C.nome}</div>
    <div style="font-size:10px;color:#374151">CNPJ: ${C.cnpj} · ${C.endereco}</div>
  </div>
  <div style="text-align:center;margin-bottom:10px">
    <div style="font-size:15px;font-weight:800;color:#0E3D1A">PROPOSTA COMERCIAL Nº ${o}</div>
    <div style="font-size:10px;color:#374151">Data: ${i}</div>
  </div>

  <div style="margin-bottom:8px">
    <div><b>À</b> ${a.razao_social}${a.nome_fantasia?" ("+a.nome_fantasia+")":""}</div>
    <div><b>CNPJ:</b> ${a.cnpj} &nbsp; <b>End.:</b> ${l||"—"}</div>
    <div><b>A/C:</b> ${a.responsavel_tecnico||a.responsavel_financeiro||"Responsável"} &nbsp; <b>Contato:</b> ${a.email||"—"} · ${a.telefone||"—"}</div>
    <div><b>Ref.:</b> Proposta Técnica para Elaboração de PGRSS (Plano de Gerenciamento de Resíduos de Serviços de Saúde)</div>
  </div>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">1. APRESENTAÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">A ${C.nome} é especializada em consultoria ambiental e engenharia de saúde e segurança do trabalho. Apresentamos a seguir nossa proposta para a elaboração do PGRSS, atendendo à Resolução RDC ANVISA nº 222/2018 e demais legislações municipais e estaduais vigentes.</p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">2. ESCOPO DOS SERVIÇOS</b></div>
  <ul style="margin:0 0 8px 16px;padding:0">
    <li><b>Diagnóstico e Classificação:</b> identificação e quantificação dos resíduos (Grupos A, B, C, D e E) conforme a RDC ANVISA nº 222/2018.</li>
    <li><b>Elaboração do Documento (PGRSS):</b> redação do plano detalhando segregação, acondicionamento, identificação, transporte interno, armazenamento e destinação final.</li>
    <li><b>Emissão de ART</b> (Anotação de Responsabilidade Técnica) pelo profissional responsável.</li>
  </ul>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">3. PRAZO DE EXECUÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">O prazo total para a entrega do documento final, impresso e em meio digital (PDF), será de <b>${z} dias úteis</b>, contados a partir da aprovação desta proposta e da disponibilização das informações necessárias pela contratante.</p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">4. INVESTIMENTO</b></div>
  <p style="margin:0 0 8px 0">O valor total para a prestação dos serviços descritos acima é de <b>${O(t)}</b> (${q(t)}).<br/>
    <b>Condições de Pagamento:</b> ${m}.<br/>
    <b>Formas aceitas:</b> Boleto bancário, PIX ou transferência bancária.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">5. VALIDADE DA PROPOSTA</b></div>
  <p style="margin:0 0 8px 0">Esta proposta é válida por <b>${v} dias</b> a partir da data de emissão.</p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">6. RESPONSABILIDADES TÉCNICAS E LEGAIS</b></div>
  <p style="margin:0 0 8px 0;text-align:justify"><b>Da Contratada:</b> emissão de ART e enquadramento às normas da RDC ANVISA nº 222/2018 e CONAMA nº 358/2005.<br/>
    <b>Do Cliente:</b> fornecimento de plantas arquitetônicas (se houver), acesso às instalações e execução das melhorias estruturais propostas no plano.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">7. DE ACORDO / ACEITE</b></div>
  <p style="margin:0 0 10px 0">Para aprovação, por favor, assine este documento e devolva-o por e-mail ou WhatsApp.</p>

  <div style="font-size:11px;line-height:1.9">
    <div><b>De acordo:</b></div>
    <div>Nome: ______________________________________________</div>
    <div>Cargo: ______________________________________________</div>
    <div>Data: ____ / ____ / ______</div>
    <div style="margin-top:14px;border-top:1px solid #111;width:60%;text-align:center;padding-top:4px">Assinatura</div>
  </div>

  <div style="margin-top:10px;font-size:8.5px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;padding-top:4px">
    RDC ANVISA nº 222/2018 · CONAMA nº 358/2005 · Lei nº 12.305/2010 (PNRS)
  </div>
</div>`}function L(){if(!a)return u.error("Selecione um cliente");if(t<=0)return u.error("Informe o valor");const o=R(D()),i=document.createElement("div");i.id="pgrss-print-area",i.innerHTML=o;const l=document.createElement("style");l.id="pgrss-print-style",l.textContent=`@media print {
      body > *:not(#pgrss-print-area) { display: none !important; }
      #pgrss-print-area { display: block !important; }
      @page { size: A4; margin: 0; }
    }
    @media screen { #pgrss-print-area { display: none; } }`,document.head.appendChild(l),document.body.appendChild(i),window.print(),setTimeout(()=>{i.remove(),l.remove()},500)}async function V(){if(!a)return u.error("Selecione um cliente");if(t<=0)return u.error("Informe o valor");I(!0);try{const o=D(),i=R(o),l=await _({data:{cliente_id:a.id,numero:o,validade:new Date(Date.now()+Number(v)*864e5).toISOString().slice(0,10),questionario:{tipo_estabelecimento:"—",area_construida:0,qtd_funcionarios:0,qtd_leitos:0,qtd_salas:0,gera_grupo_a:!1,gera_grupo_b:!1,gera_grupo_c:!1,gera_grupo_d:!1,gera_grupo_e:!1,possui_abrigo_temporario:!1,possui_armazenamento_externo:!1,possui_coleta_especializada:!1,possui_mtr:!1,possui_licenciamento:!1,possui_treinamento:!1,possui_pgrss_vigente:!1,distancia_km:0,qtd_visitas:1,qtd_treinamentos:0,incluir_art:!0,incluir_atualizacao_anual:!1,incluir_consultoria_mensal:!1,meses_consultoria:0,porte:"pequeno",observacoes:m},conteudo_html:i,itens:[{descricao:"Elaboração de PGRSS (Plano de Gerenciamento de Resíduos de Serviços de Saúde)",quantidade:1,unidade:"serv",valor_unitario:t,valor_total:t}],valor_total:t}});u.success("Proposta salva!"),c({to:"/propostas/pgrss/$id",params:{id:l.id}})}catch(o){u.error(o.message??"Erro ao salvar")}finally{I(!1)}}return e.jsxs("div",{className:"max-w-4xl mx-auto p-6 space-y-6",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Nova Proposta PGRSS"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Modelo profissional em folha A4 única."})]}),e.jsxs("section",{className:"border rounded-lg p-4 space-y-3",children:[e.jsx("h2",{className:"font-semibold text-lg",children:"1. Cliente"}),e.jsxs(S,{value:b,onValueChange:P,children:[e.jsx(y,{children:e.jsx(A,{placeholder:"Selecione um cliente"})}),e.jsx(E,{children:p.map(o=>e.jsxs(d,{value:o.id,children:[o.razao_social,o.nome_fantasia?` (${o.nome_fantasia})`:""]},o.id))})]}),a&&e.jsxs("div",{className:"rounded-md bg-green-50 border border-green-200 p-3 text-sm space-y-1",children:[e.jsxs("div",{children:[e.jsx("b",{children:a.razao_social}),a.nome_fantasia&&` — ${a.nome_fantasia}`]}),e.jsxs("div",{children:["CNPJ: ",a.cnpj]}),e.jsx("div",{children:[a.endereco,a.numero,a.bairro,a.cidade&&a.estado?`${a.cidade}/${a.estado}`:a.cidade,a.cep].filter(Boolean).join(", ")}),e.jsxs("div",{children:[a.email||"—"," · ",a.telefone||"—"]}),a.responsavel_tecnico&&e.jsxs("div",{children:["Resp. técnico: ",a.responsavel_tecnico]})]})]}),e.jsxs("section",{className:"border rounded-lg p-4 space-y-3",children:[e.jsx("h2",{className:"font-semibold text-lg",children:"2. Valor do PGRSS"}),e.jsxs("div",{children:[e.jsx(j,{children:"Valor (R$)"}),e.jsx(G,{type:"text",inputMode:"decimal",placeholder:"Ex.: 3500,00",value:n,onChange:o=>N(o.target.value)}),t>0&&e.jsxs("p",{className:"text-xs text-muted-foreground mt-1",children:[O(t)," — ",q(t)]})]})]}),e.jsxs("section",{className:"border rounded-lg p-4 space-y-3",children:[e.jsx("h2",{className:"font-semibold text-lg",children:"3. Condições"}),e.jsxs("div",{className:"grid md:grid-cols-3 gap-3",children:[e.jsxs("div",{children:[e.jsx(j,{children:"Condições de pagamento"}),e.jsxs(S,{value:m,onValueChange:x,children:[e.jsx(y,{children:e.jsx(A,{})}),e.jsxs(E,{children:[e.jsx(d,{value:"50% no aceite da proposta e 50% na entrega do documento final",children:"50% aceite + 50% entrega"}),e.jsx(d,{value:"100% no aceite da proposta",children:"100% no aceite"}),e.jsx(d,{value:"100% na entrega do documento final",children:"100% na entrega"}),e.jsx(d,{value:"3 parcelas iguais (entrada + 2 mensais)",children:"3 parcelas iguais"})]})]})]}),e.jsxs("div",{children:[e.jsx(j,{children:"Prazo de execução (dias úteis)"}),e.jsxs(S,{value:z,onValueChange:h,children:[e.jsx(y,{children:e.jsx(A,{})}),e.jsx(E,{children:["15","20","30","45","60"].map(o=>e.jsxs(d,{value:o,children:[o," dias úteis"]},o))})]})]}),e.jsxs("div",{children:[e.jsx(j,{children:"Validade da proposta (dias)"}),e.jsxs(S,{value:v,onValueChange:s,children:[e.jsx(y,{children:e.jsx(A,{})}),e.jsx(E,{children:["15","30","45","60","90"].map(o=>e.jsxs(d,{value:o,children:[o," dias"]},o))})]})]})]})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs($,{variant:"outline",onClick:()=>M(o=>!o),disabled:!a||t<=0,children:[e.jsx(J,{className:"mr-2 h-4 w-4"}),w?"Ocultar pré-visualização":"Pré-visualizar"]}),e.jsxs($,{variant:"outline",onClick:L,disabled:!a||t<=0,children:[e.jsx(H,{className:"mr-2 h-4 w-4"}),"Imprimir / PDF"]}),e.jsxs($,{onClick:V,disabled:g||!a||t<=0,children:[g?e.jsx(X,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(Q,{className:"mr-2 h-4 w-4"}),"Salvar proposta"]})]}),w&&a&&t>0&&e.jsx("div",{className:"border rounded-lg bg-white overflow-auto",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:R(D())}})})]})}export{ue as component};
