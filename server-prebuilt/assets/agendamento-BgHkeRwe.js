import{c as K,a6 as de,r as f,j as e,I as O,C as j,m as oe,n as _,s as b,o as R,t as N,B as n,M as le,a as ne,a7 as re}from"./index-C79dVoc5.js";import{L as H}from"./label-SMqCqgwr.js";import{B as k}from"./badge-BXJjPeTV.js";import{D as B,a as P,b as G,c as F,d as q}from"./dialog-C2dG02Lk.js";import{C as ce}from"./checkbox-CiCtaS3y.js";import{C as me}from"./calendar-days-BdiPvs3E.js";import{A as pe}from"./arrow-right-B_wQYgJU.js";import{P as E}from"./printer-DClB3aYH.js";import{P as U}from"./plus-DNe7x8Ap.js";import{F as Q}from"./file-text-DAttRjYz.js";import{U as V}from"./users-Wb_NcrFK.js";import{L as D}from"./loader-circle-CX6n1g3i.js";import{T as xe}from"./trash-2-BHoaxCO1.js";import{S as ve}from"./search-1Lv3CLul.js";import"./index-DOdzMslm.js";import"./index-B-ukldGG.js";import"./index-B43_1VOT.js";import"./index-BUb3P6ca.js";import"./index-BixlJxWi.js";import"./index-D4ksOGzF.js";import"./index-B4Czedmr.js";import"./check-B3CaUHVC.js";const ue=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],fe=K("chevron-left",ue);const ge=[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]],be=K("map",ge),J=[{id:"centro_aeroporto",label:"Centro / Aeroporto",semana:"S1",dias:"Seg–Sex"},{id:"campinas",label:"Campinas e Região",semana:"S1",dias:"2 dias"},{id:"vila_mutirao",label:"Vila Mutirão / Curitiba / Balneário",semana:"S1",dias:"2 dias"},{id:"senador_canedo",label:"Senador Canedo + Bela Vista",semana:"S1",dias:"1 dia"},{id:"nova_veneza",label:"Nova Veneza + Nerópolis",semana:"S1",dias:"1 dia"},{id:"setor_bueno",label:"Setor Bueno + Oeste",semana:"S2",dias:"2 dias"},{id:"setor_sul",label:"Setor Sul",semana:"S2",dias:"1 dia"},{id:"trindade",label:"Trindade",semana:"S2",dias:"1 dia"},{id:"itaberai",label:"Itaberaí",semana:"S2",dias:"2 dias"},{id:"quirinopolis",label:"Quirinópolis + Itumbiara",semana:"S2",dias:"1 dia"},{id:"morrinhos",label:"Morrinhos + Catalão",semana:"S2",dias:"1 dia"},{id:"aparecida",label:"Aparecida de Goiânia",semana:"S3",dias:"2 dias"},{id:"caldas_novas",label:"Caldas Novas",semana:"S3",dias:"1 dia"},{id:"anapolis",label:"Anápolis",semana:"S3",dias:"1 dia"},{id:"abadia_guapo",label:"Abadia / Guapó / Aragoiânia",semana:"S3",dias:"1 dia"},{id:"ipora",label:"Iporá e Região",semana:"S3/S1",dias:"2 dias"},{id:"inhumas",label:"Inhumas / Goianira / Caturaí",semana:"S4",dias:"2 dias"},{id:"vera_cruz",label:"Vera Cruz / Parque Oeste / Santa Rita",semana:"S4",dias:"1 dia"},{id:"brasilia",label:"Brasília",semana:"01/07",dias:"2 dias"},{id:"rio_verde",label:"Rio Verde",semana:"Semanal",dias:"Seg/Qua/Sex"},{id:"veterinaria",label:"Veterinária Quinzenal",semana:"Quinzenal",dias:"1 dia"}],he={S1:"bg-blue-100 text-blue-800",S2:"bg-teal-100 text-teal-800",S3:"bg-amber-100 text-amber-800",S4:"bg-purple-100 text-purple-800","S3/S1":"bg-orange-100 text-orange-800","01/07":"bg-red-100 text-red-800",Semanal:"bg-green-100 text-green-800",Quinzenal:"bg-pink-100 text-pink-800"};function ye(t,l){const c={};l.forEach(s=>{c[s.cliente.id]=s.cliente});const m=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>MTRs em Lote</title><style>*{box-sizing:border-box;margin:0;padding:0}@media print{@page{margin:1cm;size:A4}}</style></head><body>${t.map((s,r)=>{const h=c[s.cliente_id]||{},x=s.data_emissao?new Date(s.data_emissao+"T12:00:00").toLocaleDateString("pt-BR"):"";return`<div style="${r<t.length-1?"page-break-after:always;":""}padding:20px;max-width:800px;margin:0 auto;font-family:Arial,sans-serif;font-size:11px;color:#000">
      <div style="display:flex;justify-content:space-between;border-bottom:3px solid #0D9488;padding-bottom:10px;margin-bottom:14px">
        <div><b style="font-size:18px;color:#0D9488">BIOLOGUS AMBIENTAL</b><br/><span style="font-size:10px;color:#555">Gestão de Resíduos de Saúde</span></div>
        <div style="text-align:center"><b style="font-size:13px;border:2px solid #000;padding:6px 14px;display:inline-block">MANIFESTO DE TRANSPORTE DE RESÍDUOS</b><br/><span style="font-size:11px;color:#555">Nº ${s.numero} | ${x}</span></div>
      </div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Gerador</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Razão Social</div><b>${h.razao_social||""}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">CNPJ</div><b>${h.cnpj||""}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Endereço</div><b>${h.logradouro||""}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Cidade</div><b>${h.cidade||""}</b></div>
      </div></div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Transportador</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Razão Social</div><b>BIO LOGUS AMBIENTAL LTDA - ME</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">CNPJ</div><b>26.484.921/0001-60</b></div>
        <div style="grid-column:span 2"><div style="color:#777;text-transform:uppercase;font-size:9px">Endereço</div><b>RUA DOS FERROVIARIOS, QD 01, LT 05 — PARQUE INDUSTRIAL JOÃO BRÁS 2 — Goiânia - GO</b></div>
      </div></div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Receptor Final</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Razão Social</div><b>B-GREEN GESTAO AMBIENTAL S.A.</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">CNPJ</div><b>01.568.077/0006-30</b></div>
        <div style="grid-column:span 2"><div style="color:#777;text-transform:uppercase;font-size:9px">Endereço</div><b>SETOR INDUSTRIAL DA CEILANDIA QI 21 LOTE 51/53/55 — CEILANDIA — Brasília - DF — CEP 72265-210</b></div>
      </div></div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Resíduos</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Descrição</div><b>${s.descricao_residuo||"GRUPO A, B E INFECTANTES"}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Acondicionamento</div><b>${s.acondicionamento||"BOMBONA"}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Quantidade</div><b>${s.quantidade||"___"} ${s.unidade||"kg"}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Status</div><b>${s.status||"emitido"}</b></div>
      </div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px">
        <div style="border:1px solid #000;padding:10px;text-align:center;font-size:10px"><b>GERADOR</b><div style="margin-top:26px;border-top:1px solid #999;padding-top:4px;color:#555">Assinatura / Carimbo</div></div>
        <div style="border:1px solid #000;padding:10px;text-align:center;font-size:10px"><b>TRANSPORTADOR</b><div style="margin-top:26px;border-top:1px solid #999;padding-top:4px;color:#555">Assinatura / Carimbo</div></div>
      </div>
    </div>`}).join("")}</body></html>`,p=window.open("","_blank");if(!p){alert("Permita popups para este site e tente novamente");return}p.document.write(m),p.document.close(),p.focus(),setTimeout(()=>p.print(),600)}function Ne(t,l){const c=window.open("","_blank");if(!c)return;const v=new Date(t.data_emissao+"T12:00:00").toLocaleDateString("pt-BR");c.document.write(`<!DOCTYPE html><html><head><title>MTR ${t.numero}</title>
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
    <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${t.numero} &nbsp;|&nbsp; ${v}</div></div>
  </div>
  <div class="section">
    <div class="section-title">Gerador (Contratante)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">${l.razao_social||""}</div></div>
        <div><div class="field-label">Nome Fantasia</div><div class="field-value">${l.nome_fantasia||""}</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">${l.cnpj||""}</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">${l.logradouro||""}</div></div>
        <div><div class="field-label">Cidade</div><div class="field-value">${l.cidade||""}</div></div>
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
    <div class="section-title">Receptor Final</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">B-GREEN GESTAO AMBIENTAL S.A.</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">01.568.077/0006-30</div></div>
        <div><div class="field-label">Responsável</div><div class="field-value">&nbsp;</div></div>
        <div><div class="field-label">Telefone</div><div class="field-value">&nbsp;</div></div>
        <div style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">SETOR INDUSTRIAL DA CEILANDIA QI 21 LOTE 51/53/55 — CEILANDIA — Brasília - DF — CEP 72265-210</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Resíduos</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Descrição</div><div class="field-value">${t.descricao_residuo||"GRUPO A, B E INFECTANTES, QUÍMICOS E PERFURO CORTANTES"}</div></div>
        <div><div class="field-label">Acondicionamento</div><div class="field-value">${t.acondicionamento||"BOMBONA"}</div></div>
        <div><div class="field-label">Quantidade</div><div class="field-value">${t.quantidade||"___"} ${t.unidade||"kg"}</div></div>
        <div><div class="field-label">Status</div><div class="field-value">${t.status||"emitido"}</div></div>
      </div>
    </div>
  </div>
  <div class="assinaturas">
    <div class="ass-box"><div class="ass-title">Gerador</div><div class="ass-line">Assinatura / Carimbo</div></div>
    <div class="ass-box"><div class="ass-title">Transportador</div><div class="ass-line">Assinatura / Carimbo</div></div>
  </div>
  <div class="footer">Documento gerado pelo SIGER PRO — Bio Logus Ambiental | ${new Date().toLocaleDateString("pt-BR")}</div>
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`),c.document.close()}function je({rota:t,dataSelecionada:l,onVoltar:c,user:v}){const m=oe(),[p,s]=f.useState(!1),[r,h]=f.useState(""),[x,y]=f.useState([]),[Y,S]=f.useState(!1),[L,W]=f.useState("GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES"),[C,X]=f.useState("lista"),{data:d=[],isLoading:Z}=_({queryKey:["rota-clientes",t.id],queryFn:async()=>{const{data:i}=await b.from("rota_clientes").select("id, ordem, coletado, clientes(id, razao_social, nome_fantasia, logradouro, cidade, cnpj, latitude, longitude)").eq("rota_codigo",t.id).order("ordem");return(i??[]).map(a=>({id:a.id,ordem:a.ordem,coletado:a.coletado??!1,cliente:a.clientes})).filter(a=>a.cliente)}}),{data:u=[]}=_({queryKey:["mtrs-rota",t.id,l],queryFn:async()=>{const i=d.map(o=>o.cliente.id);if(!i.length)return[];const{data:a}=await b.from("mtrs").select("id, numero, cliente_id, status, quantidade, unidade, data_emissao, descricao_residuo, acondicionamento").in("cliente_id",i).eq("data_emissao",l);return a??[]},enabled:d.length>0}),{data:$=[]}=_({queryKey:["clientes-select"],queryFn:async()=>{const{data:i}=await b.from("clientes").select("id, razao_social, nome_fantasia, logradouro, cidade").eq("ativo",!0).order("razao_social",{ascending:!0});return i??[]}}),w=new Set(d.map(i=>i.cliente.id)),A=R({mutationFn:async()=>{const i=x.map((o,g)=>({owner_id:v.id,rota_codigo:t.id,rota_id:null,cliente_id:o,ordem:d.length+g+1,frequencia:"semanal",coletado:!1})),{error:a}=await b.from("rota_clientes").upsert(i,{onConflict:"rota_codigo,cliente_id"});if(a)throw a},onSuccess:()=>{m.invalidateQueries({queryKey:["rota-clientes"]}),N.success(`${x.length} clientes adicionados`),s(!1),y([])},onError:i=>N.error(i.message)}),ee=R({mutationFn:async i=>{const{error:a}=await b.from("rota_clientes").delete().eq("id",i);if(a)throw a},onSuccess:()=>{m.invalidateQueries({queryKey:["rota-clientes"]}),N.success("Cliente removido")}}),ie=R({mutationFn:async({rcId:i,coletado:a})=>{const{error:o}=await b.from("rota_clientes").update({coletado:a}).eq("id",i);if(o)throw o},onSuccess:()=>m.invalidateQueries({queryKey:["rota-clientes"]})}),z=R({mutationFn:async()=>{const i=d.map((o,g)=>({owner_id:v.id,cliente_id:o.cliente.id,numero:`MTR-${l.replace(/-/g,"")}-${String(g+1).padStart(3,"0")}`,data_emissao:l,descricao_residuo:L,quantidade:0,unidade:"kg",acondicionamento:"BOMBONA",status:"emitido",rota_codigo:t.id})),{error:a}=await b.from("mtrs").insert(i);if(a)throw a},onSuccess:()=>{m.invalidateQueries({queryKey:["mtrs-rota"]}),m.invalidateQueries({queryKey:["mtrs"]}),N.success(`${d.length} MTRs criados!`),S(!1)},onError:i=>N.error(i.message)}),ae=()=>{const i=window.open("","_blank");if(!i)return;const a=new Date(l+"T12:00:00").toLocaleDateString("pt-BR");i.document.write(`<!DOCTYPE html><html><head><title>Rota ${t.label}</title>
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
    <h1>${t.label}</h1>
    <div class="sub">Data: ${a} · ${d.length} clientes · Semana ${t.semana}</div>
    <table>
      <thead><tr><th>#</th><th>Cliente</th><th>Endereço</th><th>MTR</th><th>Peso (kg)</th><th>Coletado</th></tr></thead>
      <tbody>
        ${d.map((o,g)=>{const M=u.find(te=>te.cliente_id===o.cliente.id);return`<tr>
            <td>${g+1}</td>
            <td><strong>${o.cliente.nome_fantasia||o.cliente.razao_social}</strong></td>
            <td>${o.cliente.logradouro||"—"}</td>
            <td class="mtr">${M?M.numero:"—"}</td>
            <td></td>
            <td style="text-align:center">${o.coletado?"✓":"□"}</td>
          </tr>`}).join("")}
      </tbody>
    </table>
    <script>window.onload=()=>window.print();<\/script>
    </body></html>`),i.document.close()},se=$.filter(i=>{const a=r.toLowerCase();return!a||(i.nome_fantasia||i.razao_social).toLowerCase().includes(a)||(i.cidade??"").toLowerCase().includes(a)}),T=d.filter(i=>i.coletado).length,I=d.length>0?Math.round(T/d.length*100):0;return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-3 flex-wrap",children:[e.jsxs(n,{variant:"ghost",size:"sm",onClick:c,children:[e.jsx(fe,{className:"h-4 w-4 mr-1"})," Rotas"]}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("h1",{className:"text-xl font-bold flex items-center gap-2",children:[e.jsx(le,{className:"h-5 w-5 text-primary"}),t.label]}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5",children:[new Date(l+"T12:00:00").toLocaleDateString("pt-BR")," · Semana ",t.semana," · ",t.dias]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(n,{variant:"outline",size:"sm",onClick:ae,children:[e.jsx(E,{className:"h-4 w-4 mr-1"})," Imprimir"]}),u.length>0&&e.jsxs(n,{variant:"outline",size:"sm",onClick:()=>ye(u,d),children:[e.jsx(E,{className:"h-4 w-4 mr-1"})," MTRs em lote"]}),e.jsxs(n,{variant:"outline",size:"sm",onClick:()=>s(!0),children:[e.jsx(U,{className:"h-4 w-4 mr-1"})," Clientes"]}),e.jsxs(n,{size:"sm",onClick:()=>S(!0),disabled:d.length===0||u.length>0,children:[e.jsx(Q,{className:"h-4 w-4 mr-1"}),u.length>0?`${u.length} MTRs emitidos`:"Gerar MTRs"]})]})]}),e.jsx("div",{className:"grid grid-cols-4 gap-3",children:[{label:"Clientes",val:d.length,color:"text-primary"},{label:"Coletados",val:T,color:"text-green-600"},{label:"Pendentes",val:d.length-T,color:"text-amber-600"},{label:"MTRs",val:u.length,color:"text-teal-600"}].map(i=>e.jsxs(j,{className:"p-3 text-center",children:[e.jsx("p",{className:`text-2xl font-bold ${i.color}`,children:i.val}),e.jsx("p",{className:"text-xs text-muted-foreground",children:i.label})]},i.label))}),d.length>0&&e.jsxs(j,{className:"p-3",children:[e.jsxs("div",{className:"flex justify-between text-sm mb-1.5",children:[e.jsx("span",{className:"text-muted-foreground",children:"Progresso da coleta"}),e.jsxs("span",{className:"font-bold text-primary",children:[I,"%"]})]}),e.jsx("div",{className:"w-full bg-muted rounded-full h-2.5",children:e.jsx("div",{className:"bg-green-500 h-2.5 rounded-full transition-all",style:{width:`${I}%`}})})]}),e.jsx("div",{className:"flex border-b",children:[{id:"lista",icon:V,label:"Lista"},{id:"mapa",icon:be,label:"Mapa"}].map(i=>e.jsxs("button",{onClick:()=>X(i.id),className:`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${C===i.id?"border-primary text-primary":"border-transparent text-muted-foreground"}`,children:[e.jsx(i.icon,{className:"h-4 w-4"}),i.label]},i.id))}),C==="lista"&&e.jsx(j,{children:Z?e.jsx("div",{className:"py-12 text-center",children:e.jsx(D,{className:"h-5 w-5 animate-spin mx-auto text-muted-foreground"})}):d.length===0?e.jsxs("div",{className:"py-12 text-center",children:[e.jsx(V,{className:"h-10 w-10 mx-auto text-muted-foreground/30 mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nenhum cliente vinculado."}),e.jsxs(n,{size:"sm",className:"mt-3",onClick:()=>s(!0),children:[e.jsx(U,{className:"h-4 w-4 mr-1"})," Adicionar clientes"]})]}):e.jsx("div",{className:"divide-y",children:d.map((i,a)=>{const o=u.find(g=>g.cliente_id===i.cliente.id);return e.jsxs("div",{className:`flex items-center gap-3 px-4 py-3 transition-colors ${i.coletado?"bg-green-50/50":""}`,children:[e.jsx("button",{onClick:()=>ie.mutate({rcId:i.id,coletado:!i.coletado}),className:"flex-shrink-0",children:i.coletado?e.jsx(ne,{className:"h-6 w-6 text-green-500"}):e.jsx(re,{className:"h-6 w-6 text-muted-foreground/30"})}),e.jsx("div",{className:`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i.coletado?"bg-green-500 text-white":"bg-primary text-white"}`,children:a+1}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:`text-sm font-medium truncate ${i.coletado?"line-through text-muted-foreground":""}`,children:i.cliente.nome_fantasia||i.cliente.razao_social}),e.jsxs("p",{className:"text-xs text-muted-foreground truncate",children:[i.cliente.logradouro||"",i.cliente.cidade?` — ${i.cliente.cidade}`:""]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0",children:[o&&e.jsxs(e.Fragment,{children:[e.jsx(k,{variant:"secondary",className:"text-xs",children:o.numero}),e.jsx(n,{variant:"ghost",size:"icon",className:"h-7 w-7",title:"Imprimir MTR",onClick:()=>Ne(o,i.cliente),children:e.jsx(E,{className:"h-3.5 w-3.5 text-primary"})})]}),e.jsx(n,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:()=>ee.mutate(i.id),children:e.jsx(xe,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]},i.id)})})}),C==="mapa"&&e.jsxs(j,{className:"overflow-hidden",children:[e.jsx("div",{id:"mapa-rota",style:{height:420}}),e.jsx("script",{dangerouslySetInnerHTML:{__html:`
            if (typeof L !== 'undefined') {
              const map = L.map('mapa-rota').setView([-16.686, -49.264], 11);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OSM'}).addTo(map);
              const clientes = ${JSON.stringify(d.filter(i=>i.cliente.latitude).map((i,a)=>({lat:i.cliente.latitude,lng:i.cliente.longitude,nome:i.cliente.nome_fantasia||i.cliente.razao_social,coletado:i.coletado,ordem:a+1})))};
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
          `}})]}),e.jsx(B,{open:p,onOpenChange:s,children:e.jsxs(P,{className:"max-w-lg max-h-[90vh] overflow-hidden flex flex-col",children:[e.jsx(G,{children:e.jsxs(F,{children:["Adicionar clientes — ",t.label]})}),e.jsxs("div",{className:"space-y-3 flex-1 overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:"text-sm text-muted-foreground",children:[x.length," selecionado(s)"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(n,{size:"sm",variant:"outline",onClick:()=>y($.map(i=>i.id)),children:"Todos"}),e.jsx(n,{size:"sm",variant:"outline",onClick:()=>y([]),children:"Limpar"})]})]}),e.jsxs("div",{className:"relative",children:[e.jsx(ve,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}),e.jsx(O,{placeholder:"Buscar por nome ou cidade...",value:r,onChange:i=>h(i.target.value),className:"pl-9"})]}),e.jsx("div",{className:"flex-1 overflow-y-auto border rounded-md divide-y",children:se.map(i=>e.jsxs("div",{className:`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 ${w.has(i.id)?"opacity-50":""}`,onClick:()=>{w.has(i.id)||y(a=>a.includes(i.id)?a.filter(o=>o!==i.id):[...a,i.id])},children:[e.jsx(ce,{checked:x.includes(i.id)||w.has(i.id),readOnly:!0}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium truncate",children:i.nome_fantasia||i.razao_social}),e.jsx("p",{className:"text-xs text-muted-foreground",children:i.cidade})]}),w.has(i.id)&&e.jsx(k,{variant:"secondary",className:"text-xs flex-shrink-0",children:"Já na rota"})]},i.id))})]}),e.jsxs(q,{children:[e.jsx(n,{variant:"ghost",onClick:()=>{s(!1),y([])},children:"Cancelar"}),e.jsxs(n,{onClick:()=>A.mutate(),disabled:A.isPending||x.length===0,children:[A.isPending&&e.jsx(D,{className:"h-4 w-4 mr-2 animate-spin"}),"Adicionar ",x.length>0?x.length:""," clientes"]})]})]})}),e.jsx(B,{open:Y,onOpenChange:S,children:e.jsxs(P,{className:"max-w-md",children:[e.jsx(G,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(Q,{className:"h-5 w-5 text-primary"}),"Gerar ",d.length," MTRs em lote"]})}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Será gerado 1 MTR para cada cliente da rota com a data ",e.jsx("strong",{children:new Date(l+"T12:00:00").toLocaleDateString("pt-BR")}),"."]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(H,{children:"Descrição do resíduo"}),e.jsx(O,{value:L,onChange:i=>W(i.target.value)})]}),e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-sm",children:[e.jsx("p",{className:"font-medium",children:"Numeração automática:"}),e.jsxs("p",{className:"text-muted-foreground text-xs mt-0.5",children:["MTR-",l.replace(/-/g,""),"-001 até -",String(d.length).padStart(3,"0")]})]})]}),e.jsxs(q,{children:[e.jsx(n,{variant:"ghost",onClick:()=>S(!1),children:"Cancelar"}),e.jsxs(n,{onClick:()=>z.mutate(),disabled:z.isPending,children:[z.isPending&&e.jsx(D,{className:"h-4 w-4 mr-2 animate-spin"}),"Gerar MTRs"]})]})]})})]})}function Qe(){const{user:t}=de.useRouteContext(),[l,c]=f.useState(()=>new Date().toISOString().slice(0,10)),[v,m]=f.useState(null),p=[...new Set(J.map(s=>s.semana))];return v?e.jsx(je,{rota:v,dataSelecionada:l,onVoltar:()=>m(null),user:t}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold flex items-center gap-2",children:[e.jsx(me,{className:"h-6 w-6 text-primary"})," Agendamento de Rotas"]}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Selecione a rota para visualizar clientes, gerar MTRs e registrar coletas."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(H,{className:"text-sm whitespace-nowrap",children:"Data:"}),e.jsx(O,{type:"date",value:l,onChange:s=>c(s.target.value),className:"w-40"})]})]}),p.map(s=>e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx("span",{className:`text-xs font-semibold px-2 py-0.5 rounded-full ${he[s]??"bg-gray-100 text-gray-800"}`,children:s}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:["Semana ",s]})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",children:J.filter(r=>r.semana===s).map(r=>e.jsx(j,{onClick:()=>m(r),className:"p-4 cursor-pointer transition-all border-2 border-border hover:border-primary hover:shadow-md group",children:e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium text-sm group-hover:text-primary transition-colors",children:r.label}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:r.dias})]}),e.jsx(pe,{className:"h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5"})]})},r.id))})]},s))]})}export{Qe as component};
