import{c as J,a6 as le,r as u,j as e,I as $,C as N,m as oe,n as T,s as h,o as S,t as j,B as r,M as ne,a as re,a7 as ce}from"./index-CyCVBXGY.js";import{L as K}from"./label-CVq6iyEf.js";import{B as k}from"./badge-D1uPjv0_.js";import{D as I,a as B,b as P,c as F,d as G}from"./dialog-DZxsQ8Om.js";import{C as me}from"./checkbox-CR-MEj8U.js";import{C as pe}from"./calendar-days-Bn-tUqUi.js";import{A as xe}from"./arrow-right-BPNkDsdy.js";import{P as z}from"./printer-HR7x0Yxl.js";import{P as q}from"./plus-CaR07B8z.js";import{F as U}from"./file-text-Dr4XgpRX.js";import{U as Q}from"./users-BAyfTTde.js";import{L as O}from"./loader-circle-NnSvddzx.js";import{T as ve}from"./trash-2-D4iEqwJ6.js";import{S as ue}from"./search-BNw3gUP0.js";import"./index-DebWXczS.js";import"./index-BDg1uF2x.js";import"./index-DSIfNw0p.js";import"./index-TkrkE53t.js";import"./index-CcI6wW9F.js";import"./index-Ba25aWs6.js";import"./index-B7pPRnTq.js";import"./check-B3NpY5Nk.js";const ge=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],fe=J("chevron-left",ge);const he=[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]],H=J("map",he),V=[{id:"centro_aeroporto",label:"Centro / Aeroporto",semana:"S1",dias:"Seg–Sex"},{id:"campinas",label:"Campinas e Região",semana:"S1",dias:"2 dias"},{id:"vila_mutirao",label:"Vila Mutirão / Curitiba / Balneário",semana:"S1",dias:"2 dias"},{id:"senador_canedo",label:"Senador Canedo + Bela Vista",semana:"S1",dias:"1 dia"},{id:"nova_veneza",label:"Nova Veneza + Nerópolis",semana:"S1",dias:"1 dia"},{id:"setor_bueno",label:"Setor Bueno + Oeste",semana:"S2",dias:"2 dias"},{id:"setor_sul",label:"Setor Sul",semana:"S2",dias:"1 dia"},{id:"trindade",label:"Trindade",semana:"S2",dias:"1 dia"},{id:"itaberai",label:"Itaberaí",semana:"S2",dias:"2 dias"},{id:"quirinopolis",label:"Quirinópolis + Itumbiara",semana:"S2",dias:"1 dia"},{id:"morrinhos",label:"Morrinhos + Catalão",semana:"S2",dias:"1 dia"},{id:"aparecida",label:"Aparecida de Goiânia",semana:"S3",dias:"2 dias"},{id:"caldas_novas",label:"Caldas Novas",semana:"S3",dias:"1 dia"},{id:"anapolis",label:"Anápolis",semana:"S3",dias:"1 dia"},{id:"abadia_guapo",label:"Abadia / Guapó / Aragoiânia",semana:"S3",dias:"1 dia"},{id:"ipora",label:"Iporá e Região",semana:"S3/S1",dias:"2 dias"},{id:"inhumas",label:"Inhumas / Goianira / Caturaí",semana:"S4",dias:"2 dias"},{id:"vera_cruz",label:"Vera Cruz / Parque Oeste / Santa Rita",semana:"S4",dias:"1 dia"},{id:"brasilia",label:"Brasília",semana:"01/07",dias:"2 dias"},{id:"rio_verde",label:"Rio Verde",semana:"Semanal",dias:"Seg/Qua/Sex"},{id:"veterinaria",label:"Veterinária Quinzenal",semana:"Quinzenal",dias:"1 dia"}],be={S1:"bg-blue-100 text-blue-800",S2:"bg-teal-100 text-teal-800",S3:"bg-amber-100 text-amber-800",S4:"bg-purple-100 text-purple-800","S3/S1":"bg-orange-100 text-orange-800","01/07":"bg-red-100 text-red-800",Semanal:"bg-green-100 text-green-800",Quinzenal:"bg-pink-100 text-pink-800"};function je(s,o){const c=window.open("","_blank");if(!c)return;const x=new H(o.map(n=>[n.cliente.id,n.cliente])),p=s.map(n=>{const t=x.get(n.cliente_id)||{},m=new Date(n.data_emissao+"T12:00:00").toLocaleDateString("pt-BR");return`
    <div class="mtr-page">
      <div class="header">
        <div><div class="logo">BIOLOGUS AMBIENTAL</div><div class="logo-sub">Gestão de Resíduos de Saúde</div></div>
        <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${n.numero} &nbsp;|&nbsp; ${m}</div></div>
      </div>
      <div class="section">
        <div class="section-title">Gerador (Contratante)</div>
        <div class="section-body">
          <div class="grid2">
            <div><div class="field-label">Razão Social</div><div class="field-value">${t.razao_social||""}</div></div>
            <div><div class="field-label">Nome Fantasia</div><div class="field-value">${t.nome_fantasia||""}</div></div>
            <div><div class="field-label">CNPJ</div><div class="field-value">${t.cnpj||""}</div></div>
            <div><div class="field-label">Endereço</div><div class="field-value">${t.logradouro||""}</div></div>
            <div><div class="field-label">Cidade</div><div class="field-value">${t.cidade||""}</div></div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Transportador (Contratada)</div>
        <div class="section-body">
          <div class="grid2">
            <div><div class="field-label">Razão Social</div><div class="field-value">BIO LOGUS AMBIENTAL LTDA - ME</div></div>
            <div><div class="field-label">CNPJ</div><div class="field-value">26.484.921/0001-60</div></div>
            <div><div class="field-label">Endereço</div><div class="field-value">RUA DOS FERROVIARIOS, QD 01, LT 05 — PARQUE INDUSTRIAL JOÃO BRÁS 2</div></div>
            <div><div class="field-label">Cidade</div><div class="field-value">Goiânia - GO</div></div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Resíduos</div>
        <div class="section-body">
          <div class="grid2">
            <div><div class="field-label">Descrição</div><div class="field-value">${n.descricao_residuo||"GRUPO A, B E INFECTANTES, QUÍMICOS E PERFURO CORTANTES"}</div></div>
            <div><div class="field-label">Acondicionamento</div><div class="field-value">${n.acondicionamento||"BOMBONA"}</div></div>
            <div><div class="field-label">Quantidade</div><div class="field-value">${n.quantidade||"___"} ${n.unidade||"kg"}</div></div>
            <div><div class="field-label">Status</div><div class="field-value">${n.status||"emitido"}</div></div>
          </div>
        </div>
      </div>
      <div class="assinaturas">
        <div class="ass-box"><div class="ass-title">Gerador</div><div class="ass-line">Assinatura / Carimbo</div></div>
        <div class="ass-box"><div class="ass-title">Transportador</div><div class="ass-line">Assinatura / Carimbo</div></div>
      </div>
      <div class="footer">SIGER PRO — Bio Logus Ambiental | ${new Date().toLocaleDateString("pt-BR")}</div>
    </div>`}).join('<div class="page-break"></div>');c.document.write(`<!DOCTYPE html><html><head><title>MTRs em Lote</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:11px;color:#000}
    .mtr-page{padding:20px;max-width:800px;margin:0 auto}
    .page-break{page-break-after:always}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D9488;padding-bottom:12px;margin-bottom:16px}
    .logo{font-size:20px;font-weight:bold;color:#0D9488}
    .logo-sub{font-size:10px;color:#555;margin-top:2px}
    .mtr-title{text-align:center;font-size:15px;font-weight:bold;border:2px solid #000;padding:8px 20px;border-radius:4px}
    .mtr-num{font-size:12px;color:#555;margin-top:4px;text-align:center}
    .section{margin-bottom:14px}
    .section-title{background:#0D9488;color:white;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-radius:3px 3px 0 0}
    .section-body{border:1px solid #ccc;border-top:none;padding:10px;border-radius:0 0 3px 3px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .field-label{font-size:9px;text-transform:uppercase;color:#777;letter-spacing:.5px;margin-bottom:1px}
    .field-value{font-size:11px;font-weight:600;border-bottom:1px solid #ddd;padding-bottom:2px;min-height:16px}
    .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px}
    .ass-box{border:1px solid #000;padding:12px;border-radius:3px;text-align:center}
    .ass-title{font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2px}
    .ass-line{border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555;margin-top:30px}
    .footer{margin-top:16px;border-top:1px solid #ddd;padding-top:8px;font-size:9px;color:#999;text-align:center}
    @media print{.page-break{page-break-after:always} @page{margin:1cm}}
  </style></head><body>
  ${p}
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`),c.document.close()}function Ne(s,o){const c=window.open("","_blank");if(!c)return;const x=new Date(s.data_emissao+"T12:00:00").toLocaleDateString("pt-BR");c.document.write(`<!DOCTYPE html><html><head><title>MTR ${s.numero}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px;max-width:800px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D9488;padding-bottom:12px;margin-bottom:16px}
    .logo{font-size:20px;font-weight:bold;color:#0D9488}
    .logo-sub{font-size:10px;color:#555;margin-top:2px}
    .mtr-title{text-align:center;font-size:15px;font-weight:bold;border:2px solid #000;padding:8px 20px;border-radius:4px}
    .mtr-num{font-size:12px;color:#555;margin-top:4px;text-align:center}
    .section{margin-bottom:14px}
    .section-title{background:#0D9488;color:white;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-radius:3px 3px 0 0}
    .section-body{border:1px solid #ccc;border-top:none;padding:10px;border-radius:0 0 3px 3px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .field-label{font-size:9px;text-transform:uppercase;color:#777;letter-spacing:.5px;margin-bottom:1px}
    .field-value{font-size:11px;font-weight:600;border-bottom:1px solid #ddd;padding-bottom:2px;min-height:16px}
    .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px}
    .ass-box{border:1px solid #000;padding:12px;border-radius:3px;text-align:center}
    .ass-title{font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2px}
    .ass-line{border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555;margin-top:30px}
    .footer{margin-top:16px;border-top:1px solid #ddd;padding-top:8px;font-size:9px;color:#999;text-align:center}
    @media print{body{padding:10px}@page{margin:1cm}}
  </style></head><body>
  <div class="header">
    <div><div class="logo">BIOLOGUS AMBIENTAL</div><div class="logo-sub">Gestão de Resíduos de Saúde</div></div>
    <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${s.numero} &nbsp;|&nbsp; ${x}</div></div>
  </div>
  <div class="section">
    <div class="section-title">Gerador (Contratante)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">${o.razao_social||""}</div></div>
        <div><div class="field-label">Nome Fantasia</div><div class="field-value">${o.nome_fantasia||""}</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">${o.cnpj||""}</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">${o.logradouro||""}</div></div>
        <div><div class="field-label">Cidade</div><div class="field-value">${o.cidade||""}</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Transportador (Contratada)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">BIO LOGUS AMBIENTAL LTDA - ME</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">26.484.921/0001-60</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">RUA DOS FERROVIARIOS, QD 01, LT 05 — PARQUE INDUSTRIAL JOÃO BRÁS 2</div></div>
        <div><div class="field-label">Cidade</div><div class="field-value">Goiânia - GO</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Resíduos</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Descrição</div><div class="field-value">${s.descricao_residuo||"GRUPO A, B E INFECTANTES, QUÍMICOS E PERFURO CORTANTES"}</div></div>
        <div><div class="field-label">Acondicionamento</div><div class="field-value">${s.acondicionamento||"BOMBONA"}</div></div>
        <div><div class="field-label">Quantidade</div><div class="field-value">${s.quantidade||"___"} ${s.unidade||"kg"}</div></div>
        <div><div class="field-label">Status</div><div class="field-value">${s.status||"emitido"}</div></div>
      </div>
    </div>
  </div>
  <div class="assinaturas">
    <div class="ass-box"><div class="ass-title">Gerador</div><div class="ass-line">Assinatura / Carimbo</div></div>
    <div class="ass-box"><div class="ass-title">Transportador</div><div class="ass-line">Assinatura / Carimbo</div></div>
  </div>
  <div class="footer">Documento gerado pelo SIGER PRO — Bio Logus Ambiental | ${new Date().toLocaleDateString("pt-BR")}</div>
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`),c.document.close()}function we({rota:s,dataSelecionada:o,onVoltar:c,user:x}){const p=oe(),[n,t]=u.useState(!1),[m,Y]=u.useState(""),[g,b]=u.useState([]),[W,w]=u.useState(!1),[D,X]=u.useState("GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES"),[C,Z]=u.useState("lista"),{data:d=[],isLoading:ee}=T({queryKey:["rota-clientes",s.id],queryFn:async()=>{const{data:a}=await h.from("rota_clientes").select("id, ordem, coletado, clientes(id, razao_social, nome_fantasia, logradouro, cidade, cnpj, latitude, longitude)").eq("rota_codigo",s.id).order("ordem");return(a??[]).map(i=>({id:i.id,ordem:i.ordem,coletado:i.coletado??!1,cliente:i.clientes})).filter(i=>i.cliente)}}),{data:v=[]}=T({queryKey:["mtrs-rota",s.id,o],queryFn:async()=>{const a=d.map(l=>l.cliente.id);if(!a.length)return[];const{data:i}=await h.from("mtrs").select("id, numero, cliente_id, status, quantidade, unidade, data_emissao, descricao_residuo, acondicionamento").in("cliente_id",a).eq("data_emissao",o);return i??[]},enabled:d.length>0}),{data:E=[]}=T({queryKey:["clientes-select"],queryFn:async()=>{const{data:a}=await h.from("clientes").select("id, razao_social, nome_fantasia, logradouro, cidade").eq("ativo",!0).order("razao_social",{ascending:!0});return a??[]}}),y=new Set(d.map(a=>a.cliente.id)),R=S({mutationFn:async()=>{const a=g.map((l,f)=>({owner_id:x.id,rota_codigo:s.id,rota_id:null,cliente_id:l,ordem:d.length+f+1,frequencia:"semanal",coletado:!1})),{error:i}=await h.from("rota_clientes").upsert(a,{onConflict:"rota_codigo,cliente_id"});if(i)throw i},onSuccess:()=>{p.invalidateQueries({queryKey:["rota-clientes"]}),j.success(`${g.length} clientes adicionados`),t(!1),b([])},onError:a=>j.error(a.message)}),ae=S({mutationFn:async a=>{const{error:i}=await h.from("rota_clientes").delete().eq("id",a);if(i)throw i},onSuccess:()=>{p.invalidateQueries({queryKey:["rota-clientes"]}),j.success("Cliente removido")}}),ie=S({mutationFn:async({rcId:a,coletado:i})=>{const{error:l}=await h.from("rota_clientes").update({coletado:i}).eq("id",a);if(l)throw l},onSuccess:()=>p.invalidateQueries({queryKey:["rota-clientes"]})}),_=S({mutationFn:async()=>{const a=d.map((l,f)=>({owner_id:x.id,cliente_id:l.cliente.id,numero:`MTR-${o.replace(/-/g,"")}-${String(f+1).padStart(3,"0")}`,data_emissao:o,descricao_residuo:D,quantidade:0,unidade:"kg",acondicionamento:"BOMBONA",status:"emitido",rota_codigo:s.id})),{error:i}=await h.from("mtrs").insert(a);if(i)throw i},onSuccess:()=>{p.invalidateQueries({queryKey:["mtrs-rota"]}),p.invalidateQueries({queryKey:["mtrs"]}),j.success(`${d.length} MTRs criados!`),w(!1)},onError:a=>j.error(a.message)}),se=()=>{const a=window.open("","_blank");if(!a)return;const i=new Date(o+"T12:00:00").toLocaleDateString("pt-BR");a.document.write(`<!DOCTYPE html><html><head><title>Rota ${s.label}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;padding:20px}
      h1{font-size:16px;color:#0D9488;margin-bottom:4px}
      .sub{color:#666;font-size:11px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th{background:#f0f0f0;padding:6px 8px;text-align:left;border:1px solid #ccc;font-size:11px}
      td{padding:6px 8px;border:1px solid #ccc;font-size:11px}
      .mtr{color:#0D9488;font-weight:bold}
      @media print{@page{margin:1cm}}
    </style></head><body>
    <h1>${s.label}</h1>
    <div class="sub">Data: ${i} · ${d.length} clientes · Semana ${s.semana}</div>
    <table>
      <thead><tr><th>#</th><th>Cliente</th><th>Endereço</th><th>MTR</th><th>Peso (kg)</th><th>Coletado</th></tr></thead>
      <tbody>
        ${d.map((l,f)=>{const M=v.find(de=>de.cliente_id===l.cliente.id);return`<tr>
            <td>${f+1}</td>
            <td><strong>${l.cliente.nome_fantasia||l.cliente.razao_social}</strong></td>
            <td>${l.cliente.logradouro||"—"}</td>
            <td class="mtr">${M?M.numero:"—"}</td>
            <td></td>
            <td style="text-align:center">${l.coletado?"✓":"□"}</td>
          </tr>`}).join("")}
      </tbody>
    </table>
    <script>window.onload=()=>window.print();<\/script>
    </body></html>`),a.document.close()},te=E.filter(a=>{const i=m.toLowerCase();return!i||(a.nome_fantasia||a.razao_social).toLowerCase().includes(i)||(a.cidade??"").toLowerCase().includes(i)}),A=d.filter(a=>a.coletado).length,L=d.length>0?Math.round(A/d.length*100):0;return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-3 flex-wrap",children:[e.jsxs(r,{variant:"ghost",size:"sm",onClick:c,children:[e.jsx(fe,{className:"h-4 w-4 mr-1"})," Rotas"]}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("h1",{className:"text-xl font-bold flex items-center gap-2",children:[e.jsx(ne,{className:"h-5 w-5 text-primary"}),s.label]}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5",children:[new Date(o+"T12:00:00").toLocaleDateString("pt-BR")," · Semana ",s.semana," · ",s.dias]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(r,{variant:"outline",size:"sm",onClick:se,children:[e.jsx(z,{className:"h-4 w-4 mr-1"})," Imprimir"]}),v.length>0&&e.jsxs(r,{variant:"outline",size:"sm",onClick:()=>je(v,d),children:[e.jsx(z,{className:"h-4 w-4 mr-1"})," MTRs em lote"]}),e.jsxs(r,{variant:"outline",size:"sm",onClick:()=>t(!0),children:[e.jsx(q,{className:"h-4 w-4 mr-1"})," Clientes"]}),e.jsxs(r,{size:"sm",onClick:()=>w(!0),disabled:d.length===0||v.length>0,children:[e.jsx(U,{className:"h-4 w-4 mr-1"}),v.length>0?`${v.length} MTRs emitidos`:"Gerar MTRs"]})]})]}),e.jsx("div",{className:"grid grid-cols-4 gap-3",children:[{label:"Clientes",val:d.length,color:"text-primary"},{label:"Coletados",val:A,color:"text-green-600"},{label:"Pendentes",val:d.length-A,color:"text-amber-600"},{label:"MTRs",val:v.length,color:"text-teal-600"}].map(a=>e.jsxs(N,{className:"p-3 text-center",children:[e.jsx("p",{className:`text-2xl font-bold ${a.color}`,children:a.val}),e.jsx("p",{className:"text-xs text-muted-foreground",children:a.label})]},a.label))}),d.length>0&&e.jsxs(N,{className:"p-3",children:[e.jsxs("div",{className:"flex justify-between text-sm mb-1.5",children:[e.jsx("span",{className:"text-muted-foreground",children:"Progresso da coleta"}),e.jsxs("span",{className:"font-bold text-primary",children:[L,"%"]})]}),e.jsx("div",{className:"w-full bg-muted rounded-full h-2.5",children:e.jsx("div",{className:"bg-green-500 h-2.5 rounded-full transition-all",style:{width:`${L}%`}})})]}),e.jsx("div",{className:"flex border-b",children:[{id:"lista",icon:Q,label:"Lista"},{id:"mapa",icon:H,label:"Mapa"}].map(a=>e.jsxs("button",{onClick:()=>Z(a.id),className:`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${C===a.id?"border-primary text-primary":"border-transparent text-muted-foreground"}`,children:[e.jsx(a.icon,{className:"h-4 w-4"}),a.label]},a.id))}),C==="lista"&&e.jsx(N,{children:ee?e.jsx("div",{className:"py-12 text-center",children:e.jsx(O,{className:"h-5 w-5 animate-spin mx-auto text-muted-foreground"})}):d.length===0?e.jsxs("div",{className:"py-12 text-center",children:[e.jsx(Q,{className:"h-10 w-10 mx-auto text-muted-foreground/30 mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nenhum cliente vinculado."}),e.jsxs(r,{size:"sm",className:"mt-3",onClick:()=>t(!0),children:[e.jsx(q,{className:"h-4 w-4 mr-1"})," Adicionar clientes"]})]}):e.jsx("div",{className:"divide-y",children:d.map((a,i)=>{const l=v.find(f=>f.cliente_id===a.cliente.id);return e.jsxs("div",{className:`flex items-center gap-3 px-4 py-3 transition-colors ${a.coletado?"bg-green-50/50":""}`,children:[e.jsx("button",{onClick:()=>ie.mutate({rcId:a.id,coletado:!a.coletado}),className:"flex-shrink-0",children:a.coletado?e.jsx(re,{className:"h-6 w-6 text-green-500"}):e.jsx(ce,{className:"h-6 w-6 text-muted-foreground/30"})}),e.jsx("div",{className:`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${a.coletado?"bg-green-500 text-white":"bg-primary text-white"}`,children:i+1}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:`text-sm font-medium truncate ${a.coletado?"line-through text-muted-foreground":""}`,children:a.cliente.nome_fantasia||a.cliente.razao_social}),e.jsxs("p",{className:"text-xs text-muted-foreground truncate",children:[a.cliente.logradouro||"",a.cliente.cidade?` — ${a.cliente.cidade}`:""]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0",children:[l&&e.jsxs(e.Fragment,{children:[e.jsx(k,{variant:"secondary",className:"text-xs",children:l.numero}),e.jsx(r,{variant:"ghost",size:"icon",className:"h-7 w-7",title:"Imprimir MTR",onClick:()=>Ne(l,a.cliente),children:e.jsx(z,{className:"h-3.5 w-3.5 text-primary"})})]}),e.jsx(r,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:()=>ae.mutate(a.id),children:e.jsx(ve,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]},a.id)})})}),C==="mapa"&&e.jsxs(N,{className:"overflow-hidden",children:[e.jsx("div",{id:"mapa-rota",style:{height:420}}),e.jsx("script",{dangerouslySetInnerHTML:{__html:`
            if (typeof L !== 'undefined') {
              const map = L.map('mapa-rota').setView([-16.686, -49.264], 11);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OSM'}).addTo(map);
              const clientes = ${JSON.stringify(d.filter(a=>a.cliente.latitude).map((a,i)=>({lat:a.cliente.latitude,lng:a.cliente.longitude,nome:a.cliente.nome_fantasia||a.cliente.razao_social,coletado:a.coletado,ordem:i+1})))};
              clientes.forEach(c => {
                const col = c.coletado ? '#22c55e' : '#0D9488';
                const ic = L.divIcon({className:'',html:\`<div style="background:\${col};color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)">\${c.ordem}</div>\`,iconSize:[26,26],iconAnchor:[13,13]});
                L.marker([c.lat, c.lng], {icon: ic}).addTo(map).bindPopup(\`<b>\${c.nome}</b>\`);
              });
              if (clientes.length) {
                const fg = L.featureGroup(clientes.map(c => L.marker([c.lat, c.lng])));
                map.fitBounds(fg.getBounds().pad(0.15));
              }
            }
          `}})]}),e.jsx(I,{open:n,onOpenChange:t,children:e.jsxs(B,{className:"max-w-lg max-h-[90vh] overflow-hidden flex flex-col",children:[e.jsx(P,{children:e.jsxs(F,{children:["Adicionar clientes — ",s.label]})}),e.jsxs("div",{className:"space-y-3 flex-1 overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:"text-sm text-muted-foreground",children:[g.length," selecionado(s)"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(r,{size:"sm",variant:"outline",onClick:()=>b(E.map(a=>a.id)),children:"Todos"}),e.jsx(r,{size:"sm",variant:"outline",onClick:()=>b([]),children:"Limpar"})]})]}),e.jsxs("div",{className:"relative",children:[e.jsx(ue,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}),e.jsx($,{placeholder:"Buscar por nome ou cidade...",value:m,onChange:a=>Y(a.target.value),className:"pl-9"})]}),e.jsx("div",{className:"flex-1 overflow-y-auto border rounded-md divide-y",children:te.map(a=>e.jsxs("div",{className:`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 ${y.has(a.id)?"opacity-50":""}`,onClick:()=>{y.has(a.id)||b(i=>i.includes(a.id)?i.filter(l=>l!==a.id):[...i,a.id])},children:[e.jsx(me,{checked:g.includes(a.id)||y.has(a.id),readOnly:!0}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium truncate",children:a.nome_fantasia||a.razao_social}),e.jsx("p",{className:"text-xs text-muted-foreground",children:a.cidade})]}),y.has(a.id)&&e.jsx(k,{variant:"secondary",className:"text-xs flex-shrink-0",children:"Já na rota"})]},a.id))})]}),e.jsxs(G,{children:[e.jsx(r,{variant:"ghost",onClick:()=>{t(!1),b([])},children:"Cancelar"}),e.jsxs(r,{onClick:()=>R.mutate(),disabled:R.isPending||g.length===0,children:[R.isPending&&e.jsx(O,{className:"h-4 w-4 mr-2 animate-spin"}),"Adicionar ",g.length>0?g.length:""," clientes"]})]})]})}),e.jsx(I,{open:W,onOpenChange:w,children:e.jsxs(B,{className:"max-w-md",children:[e.jsx(P,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(U,{className:"h-5 w-5 text-primary"}),"Gerar ",d.length," MTRs em lote"]})}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Será gerado 1 MTR para cada cliente da rota com a data ",e.jsx("strong",{children:new Date(o+"T12:00:00").toLocaleDateString("pt-BR")}),"."]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(K,{children:"Descrição do resíduo"}),e.jsx($,{value:D,onChange:a=>X(a.target.value)})]}),e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-sm",children:[e.jsx("p",{className:"font-medium",children:"Numeração automática:"}),e.jsxs("p",{className:"text-muted-foreground text-xs mt-0.5",children:["MTR-",o.replace(/-/g,""),"-001 até -",String(d.length).padStart(3,"0")]})]})]}),e.jsxs(G,{children:[e.jsx(r,{variant:"ghost",onClick:()=>w(!1),children:"Cancelar"}),e.jsxs(r,{onClick:()=>_.mutate(),disabled:_.isPending,children:[_.isPending&&e.jsx(O,{className:"h-4 w-4 mr-2 animate-spin"}),"Gerar MTRs"]})]})]})})]})}function Qe(){const{user:s}=le.useRouteContext(),[o,c]=u.useState(()=>new Date().toISOString().slice(0,10)),[x,p]=u.useState(null),n=[...new Set(V.map(t=>t.semana))];return x?e.jsx(we,{rota:x,dataSelecionada:o,onVoltar:()=>p(null),user:s}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold flex items-center gap-2",children:[e.jsx(pe,{className:"h-6 w-6 text-primary"})," Agendamento de Rotas"]}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Selecione a rota para visualizar clientes, gerar MTRs e registrar coletas."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(K,{className:"text-sm whitespace-nowrap",children:"Data:"}),e.jsx($,{type:"date",value:o,onChange:t=>c(t.target.value),className:"w-40"})]})]}),n.map(t=>e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx("span",{className:`text-xs font-semibold px-2 py-0.5 rounded-full ${be[t]??"bg-gray-100 text-gray-800"}`,children:t}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:["Semana ",t]})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",children:V.filter(m=>m.semana===t).map(m=>e.jsx(N,{onClick:()=>p(m),className:"p-4 cursor-pointer transition-all border-2 border-border hover:border-primary hover:shadow-md group",children:e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium text-sm group-hover:text-primary transition-colors",children:m.label}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:m.dias})]}),e.jsx(xe,{className:"h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5"})]})},m.id))})]},t))]})}export{Qe as component};
