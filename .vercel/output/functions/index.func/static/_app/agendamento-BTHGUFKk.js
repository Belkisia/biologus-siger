import{c as H,a6 as de,r as f,j as e,I as L,C as N,m as ne,n as D,s as b,o as C,t as w,B as c,M as le,a as re,a7 as ce}from"./index-BrfHWNbN.js";import{L as Y}from"./label-BP4VI9Mb.js";import{B as I}from"./badge-qcr61Kso.js";import{D as P,a as G,b as F,c as U,d as q}from"./dialog-DptVFgNO.js";import{C as me}from"./checkbox-xnRpOpBQ.js";import{C as pe}from"./calendar-days-CrP7sXNr.js";import{A as xe}from"./arrow-right-6_db1dFj.js";import{P as O}from"./printer-Bp7FnJUn.js";import{P as Q}from"./plus-Bl6On35d.js";import{F as V}from"./file-text-Bd0yqgQ-.js";import{U as J}from"./users-D1K74RKU.js";import{L as $}from"./loader-circle-CsilHcCW.js";import{T as ve}from"./trash-2-CeX_v2Ht.js";import{S as ue}from"./search-tNl1X13g.js";import"./index-HQIKg-EA.js";import"./index-CbTF3IYQ.js";import"./index-CmdU4lSm.js";import"./index-C9v84wZu.js";import"./index-ZD6yP6W4.js";import"./index-CkmNT4l7.js";import"./index-Ci_Litg3.js";import"./check-C3I0xRnG.js";const ge=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],fe=H("chevron-left",ge);const he=[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]],W=H("map",he),K=[{id:"centro_aeroporto",label:"Centro / Aeroporto",semana:"S1",dias:"Seg–Sex"},{id:"campinas",label:"Campinas e Região",semana:"S1",dias:"2 dias"},{id:"vila_mutirao",label:"Vila Mutirão / Curitiba / Balneário",semana:"S1",dias:"2 dias"},{id:"senador_canedo",label:"Senador Canedo + Bela Vista",semana:"S1",dias:"1 dia"},{id:"nova_veneza",label:"Nova Veneza + Nerópolis",semana:"S1",dias:"1 dia"},{id:"setor_bueno",label:"Setor Bueno + Oeste",semana:"S2",dias:"2 dias"},{id:"setor_sul",label:"Setor Sul",semana:"S2",dias:"1 dia"},{id:"trindade",label:"Trindade",semana:"S2",dias:"1 dia"},{id:"itaberai",label:"Itaberaí",semana:"S2",dias:"2 dias"},{id:"quirinopolis",label:"Quirinópolis + Itumbiara",semana:"S2",dias:"1 dia"},{id:"morrinhos",label:"Morrinhos + Catalão",semana:"S2",dias:"1 dia"},{id:"aparecida",label:"Aparecida de Goiânia",semana:"S3",dias:"2 dias"},{id:"caldas_novas",label:"Caldas Novas",semana:"S3",dias:"1 dia"},{id:"anapolis",label:"Anápolis",semana:"S3",dias:"1 dia"},{id:"abadia_guapo",label:"Abadia / Guapó / Aragoiânia",semana:"S3",dias:"1 dia"},{id:"ipora",label:"Iporá e Região",semana:"S3/S1",dias:"2 dias"},{id:"inhumas",label:"Inhumas / Goianira / Caturaí",semana:"S4",dias:"2 dias"},{id:"vera_cruz",label:"Vera Cruz / Parque Oeste / Santa Rita",semana:"S4",dias:"1 dia"},{id:"brasilia",label:"Brasília",semana:"01/07",dias:"2 dias"},{id:"rio_verde",label:"Rio Verde",semana:"Semanal",dias:"Seg/Qua/Sex"},{id:"veterinaria",label:"Veterinária Quinzenal",semana:"Quinzenal",dias:"1 dia"}],be={S1:"bg-blue-100 text-blue-800",S2:"bg-teal-100 text-teal-800",S3:"bg-amber-100 text-amber-800",S4:"bg-purple-100 text-purple-800","S3/S1":"bg-orange-100 text-orange-800","01/07":"bg-red-100 text-red-800",Semanal:"bg-green-100 text-green-800",Quinzenal:"bg-pink-100 text-pink-800"};function ye(a,d){const x=new W(d.map(r=>[r.cliente.id,r.cliente])),v=a.map((r,u)=>{const m=x.get(r.cliente_id)||{},R=r.data_emissao?new Date(r.data_emissao+"T12:00:00").toLocaleDateString("pt-BR"):new Date().toLocaleDateString("pt-BR");return`<div ${u<a.length-1?'style="page-break-after:always"':""} style="padding:20px;max-width:800px;margin:0 auto;font-family:Arial,sans-serif;font-size:11px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D9488;padding-bottom:12px;margin-bottom:16px">
        <div><div style="font-size:20px;font-weight:bold;color:#0D9488">BIOLOGUS AMBIENTAL</div><div style="font-size:10px;color:#555">Gestão de Resíduos de Saúde</div></div>
        <div><div style="font-size:14px;font-weight:bold;border:2px solid #000;padding:6px 16px;border-radius:4px;text-align:center">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div style="font-size:11px;color:#555;margin-top:4px;text-align:center">Nº ${r.numero} | ${R}</div></div>
      </div>
      <div style="margin-bottom:12px">
        <div style="background:#0D9488;color:white;font-size:10px;font-weight:bold;text-transform:uppercase;padding:4px 8px">Gerador (Contratante)</div>
        <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Razão Social</div><div style="font-weight:600;border-bottom:1px solid #eee;padding-bottom:1px">${m.razao_social||""}</div></div>
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Nome Fantasia</div><div style="font-weight:600;border-bottom:1px solid #eee;padding-bottom:1px">${m.nome_fantasia||""}</div></div>
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">CNPJ</div><div style="font-weight:600;border-bottom:1px solid #eee;padding-bottom:1px">${m.cnpj||""}</div></div>
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Cidade</div><div style="font-weight:600;border-bottom:1px solid #eee;padding-bottom:1px">${m.cidade||""}</div></div>
          <div style="grid-column:span 2"><div style="font-size:9px;color:#777;text-transform:uppercase">Endereço</div><div style="font-weight:600;border-bottom:1px solid #eee;padding-bottom:1px">${m.logradouro||""}</div></div>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <div style="background:#0D9488;color:white;font-size:10px;font-weight:bold;text-transform:uppercase;padding:4px 8px">Transportador (Contratada)</div>
        <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Razão Social</div><div style="font-weight:600;border-bottom:1px solid #eee">BIO LOGUS AMBIENTAL LTDA - ME</div></div>
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">CNPJ</div><div style="font-weight:600;border-bottom:1px solid #eee">26.484.921/0001-60</div></div>
          <div style="grid-column:span 2"><div style="font-size:9px;color:#777;text-transform:uppercase">Endereço</div><div style="font-weight:600;border-bottom:1px solid #eee">RUA DOS FERROVIARIOS, QD 01, LT 05 — PARQUE INDUSTRIAL JOÃO BRÁS 2 — Goiânia - GO</div></div>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <div style="background:#0D9488;color:white;font-size:10px;font-weight:bold;text-transform:uppercase;padding:4px 8px">Resíduos</div>
        <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Descrição</div><div style="font-weight:600;border-bottom:1px solid #eee">${r.descricao_residuo||"GRUPO A, B E INFECTANTES"}</div></div>
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Acondicionamento</div><div style="font-weight:600;border-bottom:1px solid #eee">${r.acondicionamento||"BOMBONA"}</div></div>
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Quantidade</div><div style="font-weight:600;border-bottom:1px solid #eee">${r.quantidade||"___"} ${r.unidade||"kg"}</div></div>
          <div><div style="font-size:9px;color:#777;text-transform:uppercase">Status</div><div style="font-weight:600;border-bottom:1px solid #eee">${r.status||"emitido"}</div></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px">
        <div style="border:1px solid #000;padding:10px;text-align:center"><div style="font-weight:bold;font-size:10px;text-transform:uppercase">Gerador</div><div style="margin-top:28px;border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555">Assinatura / Carimbo</div></div>
        <div style="border:1px solid #000;padding:10px;text-align:center"><div style="font-weight:bold;font-size:10px;text-transform:uppercase">Transportador</div><div style="margin-top:28px;border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555">Assinatura / Carimbo</div></div>
      </div>
      <div style="margin-top:12px;border-top:1px solid #ddd;padding-top:6px;font-size:9px;color:#999;text-align:center">SIGER PRO — Bio Logus Ambiental | ${new Date().toLocaleDateString("pt-BR")}</div>
    </div>`}).join(""),p=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>MTRs em Lote — ${a.length} documentos</title>
  <style>*{box-sizing:border-box;margin:0;padding:0} @media print{@page{margin:1cm;size:A4}}</style>
  </head><body>${v}</body></html>`,y=new Blob([p],{type:"text/html;charset=utf-8"}),n=URL.createObjectURL(y),l=document.createElement("a");l.href=n,l.target="_blank",l.rel="noopener",document.body.appendChild(l),l.click(),document.body.removeChild(l),setTimeout(()=>URL.revokeObjectURL(n),1e4)}function je(a,d){const x=window.open("","_blank");if(!x)return;const v=new Date(a.data_emissao+"T12:00:00").toLocaleDateString("pt-BR");x.document.write(`<!DOCTYPE html><html><head><title>MTR ${a.numero}</title>
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
    <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${a.numero} &nbsp;|&nbsp; ${v}</div></div>
  </div>
  <div class="section">
    <div class="section-title">Gerador (Contratante)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">${d.razao_social||""}</div></div>
        <div><div class="field-label">Nome Fantasia</div><div class="field-value">${d.nome_fantasia||""}</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">${d.cnpj||""}</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">${d.logradouro||""}</div></div>
        <div><div class="field-label">Cidade</div><div class="field-value">${d.cidade||""}</div></div>
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
        <div><div class="field-label">Descrição</div><div class="field-value">${a.descricao_residuo||"GRUPO A, B E INFECTANTES, QUÍMICOS E PERFURO CORTANTES"}</div></div>
        <div><div class="field-label">Acondicionamento</div><div class="field-value">${a.acondicionamento||"BOMBONA"}</div></div>
        <div><div class="field-label">Quantidade</div><div class="field-value">${a.quantidade||"___"} ${a.unidade||"kg"}</div></div>
        <div><div class="field-label">Status</div><div class="field-value">${a.status||"emitido"}</div></div>
      </div>
    </div>
  </div>
  <div class="assinaturas">
    <div class="ass-box"><div class="ass-title">Gerador</div><div class="ass-line">Assinatura / Carimbo</div></div>
    <div class="ass-box"><div class="ass-title">Transportador</div><div class="ass-line">Assinatura / Carimbo</div></div>
  </div>
  <div class="footer">Documento gerado pelo SIGER PRO — Bio Logus Ambiental | ${new Date().toLocaleDateString("pt-BR")}</div>
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`),x.document.close()}function we({rota:a,dataSelecionada:d,onVoltar:x,user:v}){const p=ne(),[y,n]=f.useState(!1),[l,r]=f.useState(""),[u,m]=f.useState([]),[R,j]=f.useState(!1),[E,X]=f.useState("GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES"),[z,Z]=f.useState("lista"),{data:s=[],isLoading:ee}=D({queryKey:["rota-clientes",a.id],queryFn:async()=>{const{data:i}=await b.from("rota_clientes").select("id, ordem, coletado, clientes(id, razao_social, nome_fantasia, logradouro, cidade, cnpj, latitude, longitude)").eq("rota_codigo",a.id).order("ordem");return(i??[]).map(t=>({id:t.id,ordem:t.ordem,coletado:t.coletado??!1,cliente:t.clientes})).filter(t=>t.cliente)}}),{data:g=[]}=D({queryKey:["mtrs-rota",a.id,d],queryFn:async()=>{const i=s.map(o=>o.cliente.id);if(!i.length)return[];const{data:t}=await b.from("mtrs").select("id, numero, cliente_id, status, quantidade, unidade, data_emissao, descricao_residuo, acondicionamento").in("cliente_id",i).eq("data_emissao",d);return t??[]},enabled:s.length>0}),{data:M=[]}=D({queryKey:["clientes-select"],queryFn:async()=>{const{data:i}=await b.from("clientes").select("id, razao_social, nome_fantasia, logradouro, cidade").eq("ativo",!0).order("razao_social",{ascending:!0});return i??[]}}),S=new Set(s.map(i=>i.cliente.id)),_=C({mutationFn:async()=>{const i=u.map((o,h)=>({owner_id:v.id,rota_codigo:a.id,rota_id:null,cliente_id:o,ordem:s.length+h+1,frequencia:"semanal",coletado:!1})),{error:t}=await b.from("rota_clientes").upsert(i,{onConflict:"rota_codigo,cliente_id"});if(t)throw t},onSuccess:()=>{p.invalidateQueries({queryKey:["rota-clientes"]}),w.success(`${u.length} clientes adicionados`),n(!1),m([])},onError:i=>w.error(i.message)}),ie=C({mutationFn:async i=>{const{error:t}=await b.from("rota_clientes").delete().eq("id",i);if(t)throw t},onSuccess:()=>{p.invalidateQueries({queryKey:["rota-clientes"]}),w.success("Cliente removido")}}),te=C({mutationFn:async({rcId:i,coletado:t})=>{const{error:o}=await b.from("rota_clientes").update({coletado:t}).eq("id",i);if(o)throw o},onSuccess:()=>p.invalidateQueries({queryKey:["rota-clientes"]})}),A=C({mutationFn:async()=>{const i=s.map((o,h)=>({owner_id:v.id,cliente_id:o.cliente.id,numero:`MTR-${d.replace(/-/g,"")}-${String(h+1).padStart(3,"0")}`,data_emissao:d,descricao_residuo:E,quantidade:0,unidade:"kg",acondicionamento:"BOMBONA",status:"emitido",rota_codigo:a.id})),{error:t}=await b.from("mtrs").insert(i);if(t)throw t},onSuccess:()=>{p.invalidateQueries({queryKey:["mtrs-rota"]}),p.invalidateQueries({queryKey:["mtrs"]}),w.success(`${s.length} MTRs criados!`),j(!1)},onError:i=>w.error(i.message)}),ae=()=>{const i=window.open("","_blank");if(!i)return;const t=new Date(d+"T12:00:00").toLocaleDateString("pt-BR");i.document.write(`<!DOCTYPE html><html><head><title>Rota ${a.label}</title>
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
    <h1>${a.label}</h1>
    <div class="sub">Data: ${t} · ${s.length} clientes · Semana ${a.semana}</div>
    <table>
      <thead><tr><th>#</th><th>Cliente</th><th>Endereço</th><th>MTR</th><th>Peso (kg)</th><th>Coletado</th></tr></thead>
      <tbody>
        ${s.map((o,h)=>{const B=g.find(oe=>oe.cliente_id===o.cliente.id);return`<tr>
            <td>${h+1}</td>
            <td><strong>${o.cliente.nome_fantasia||o.cliente.razao_social}</strong></td>
            <td>${o.cliente.logradouro||"—"}</td>
            <td class="mtr">${B?B.numero:"—"}</td>
            <td></td>
            <td style="text-align:center">${o.coletado?"✓":"□"}</td>
          </tr>`}).join("")}
      </tbody>
    </table>
    <script>window.onload=()=>window.print();<\/script>
    </body></html>`),i.document.close()},se=M.filter(i=>{const t=l.toLowerCase();return!t||(i.nome_fantasia||i.razao_social).toLowerCase().includes(t)||(i.cidade??"").toLowerCase().includes(t)}),T=s.filter(i=>i.coletado).length,k=s.length>0?Math.round(T/s.length*100):0;return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-3 flex-wrap",children:[e.jsxs(c,{variant:"ghost",size:"sm",onClick:x,children:[e.jsx(fe,{className:"h-4 w-4 mr-1"})," Rotas"]}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("h1",{className:"text-xl font-bold flex items-center gap-2",children:[e.jsx(le,{className:"h-5 w-5 text-primary"}),a.label]}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5",children:[new Date(d+"T12:00:00").toLocaleDateString("pt-BR")," · Semana ",a.semana," · ",a.dias]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(c,{variant:"outline",size:"sm",onClick:ae,children:[e.jsx(O,{className:"h-4 w-4 mr-1"})," Imprimir"]}),g.length>0&&e.jsxs(c,{variant:"outline",size:"sm",onClick:()=>ye(g,s),children:[e.jsx(O,{className:"h-4 w-4 mr-1"})," MTRs em lote"]}),e.jsxs(c,{variant:"outline",size:"sm",onClick:()=>n(!0),children:[e.jsx(Q,{className:"h-4 w-4 mr-1"})," Clientes"]}),e.jsxs(c,{size:"sm",onClick:()=>j(!0),disabled:s.length===0||g.length>0,children:[e.jsx(V,{className:"h-4 w-4 mr-1"}),g.length>0?`${g.length} MTRs emitidos`:"Gerar MTRs"]})]})]}),e.jsx("div",{className:"grid grid-cols-4 gap-3",children:[{label:"Clientes",val:s.length,color:"text-primary"},{label:"Coletados",val:T,color:"text-green-600"},{label:"Pendentes",val:s.length-T,color:"text-amber-600"},{label:"MTRs",val:g.length,color:"text-teal-600"}].map(i=>e.jsxs(N,{className:"p-3 text-center",children:[e.jsx("p",{className:`text-2xl font-bold ${i.color}`,children:i.val}),e.jsx("p",{className:"text-xs text-muted-foreground",children:i.label})]},i.label))}),s.length>0&&e.jsxs(N,{className:"p-3",children:[e.jsxs("div",{className:"flex justify-between text-sm mb-1.5",children:[e.jsx("span",{className:"text-muted-foreground",children:"Progresso da coleta"}),e.jsxs("span",{className:"font-bold text-primary",children:[k,"%"]})]}),e.jsx("div",{className:"w-full bg-muted rounded-full h-2.5",children:e.jsx("div",{className:"bg-green-500 h-2.5 rounded-full transition-all",style:{width:`${k}%`}})})]}),e.jsx("div",{className:"flex border-b",children:[{id:"lista",icon:J,label:"Lista"},{id:"mapa",icon:W,label:"Mapa"}].map(i=>e.jsxs("button",{onClick:()=>Z(i.id),className:`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${z===i.id?"border-primary text-primary":"border-transparent text-muted-foreground"}`,children:[e.jsx(i.icon,{className:"h-4 w-4"}),i.label]},i.id))}),z==="lista"&&e.jsx(N,{children:ee?e.jsx("div",{className:"py-12 text-center",children:e.jsx($,{className:"h-5 w-5 animate-spin mx-auto text-muted-foreground"})}):s.length===0?e.jsxs("div",{className:"py-12 text-center",children:[e.jsx(J,{className:"h-10 w-10 mx-auto text-muted-foreground/30 mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nenhum cliente vinculado."}),e.jsxs(c,{size:"sm",className:"mt-3",onClick:()=>n(!0),children:[e.jsx(Q,{className:"h-4 w-4 mr-1"})," Adicionar clientes"]})]}):e.jsx("div",{className:"divide-y",children:s.map((i,t)=>{const o=g.find(h=>h.cliente_id===i.cliente.id);return e.jsxs("div",{className:`flex items-center gap-3 px-4 py-3 transition-colors ${i.coletado?"bg-green-50/50":""}`,children:[e.jsx("button",{onClick:()=>te.mutate({rcId:i.id,coletado:!i.coletado}),className:"flex-shrink-0",children:i.coletado?e.jsx(re,{className:"h-6 w-6 text-green-500"}):e.jsx(ce,{className:"h-6 w-6 text-muted-foreground/30"})}),e.jsx("div",{className:`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i.coletado?"bg-green-500 text-white":"bg-primary text-white"}`,children:t+1}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:`text-sm font-medium truncate ${i.coletado?"line-through text-muted-foreground":""}`,children:i.cliente.nome_fantasia||i.cliente.razao_social}),e.jsxs("p",{className:"text-xs text-muted-foreground truncate",children:[i.cliente.logradouro||"",i.cliente.cidade?` — ${i.cliente.cidade}`:""]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0",children:[o&&e.jsxs(e.Fragment,{children:[e.jsx(I,{variant:"secondary",className:"text-xs",children:o.numero}),e.jsx(c,{variant:"ghost",size:"icon",className:"h-7 w-7",title:"Imprimir MTR",onClick:()=>je(o,i.cliente),children:e.jsx(O,{className:"h-3.5 w-3.5 text-primary"})})]}),e.jsx(c,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:()=>ie.mutate(i.id),children:e.jsx(ve,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]},i.id)})})}),z==="mapa"&&e.jsxs(N,{className:"overflow-hidden",children:[e.jsx("div",{id:"mapa-rota",style:{height:420}}),e.jsx("script",{dangerouslySetInnerHTML:{__html:`
            if (typeof L !== 'undefined') {
              const map = L.map('mapa-rota').setView([-16.686, -49.264], 11);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OSM'}).addTo(map);
              const clientes = ${JSON.stringify(s.filter(i=>i.cliente.latitude).map((i,t)=>({lat:i.cliente.latitude,lng:i.cliente.longitude,nome:i.cliente.nome_fantasia||i.cliente.razao_social,coletado:i.coletado,ordem:t+1})))};
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
          `}})]}),e.jsx(P,{open:y,onOpenChange:n,children:e.jsxs(G,{className:"max-w-lg max-h-[90vh] overflow-hidden flex flex-col",children:[e.jsx(F,{children:e.jsxs(U,{children:["Adicionar clientes — ",a.label]})}),e.jsxs("div",{className:"space-y-3 flex-1 overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:"text-sm text-muted-foreground",children:[u.length," selecionado(s)"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(c,{size:"sm",variant:"outline",onClick:()=>m(M.map(i=>i.id)),children:"Todos"}),e.jsx(c,{size:"sm",variant:"outline",onClick:()=>m([]),children:"Limpar"})]})]}),e.jsxs("div",{className:"relative",children:[e.jsx(ue,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}),e.jsx(L,{placeholder:"Buscar por nome ou cidade...",value:l,onChange:i=>r(i.target.value),className:"pl-9"})]}),e.jsx("div",{className:"flex-1 overflow-y-auto border rounded-md divide-y",children:se.map(i=>e.jsxs("div",{className:`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 ${S.has(i.id)?"opacity-50":""}`,onClick:()=>{S.has(i.id)||m(t=>t.includes(i.id)?t.filter(o=>o!==i.id):[...t,i.id])},children:[e.jsx(me,{checked:u.includes(i.id)||S.has(i.id),readOnly:!0}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium truncate",children:i.nome_fantasia||i.razao_social}),e.jsx("p",{className:"text-xs text-muted-foreground",children:i.cidade})]}),S.has(i.id)&&e.jsx(I,{variant:"secondary",className:"text-xs flex-shrink-0",children:"Já na rota"})]},i.id))})]}),e.jsxs(q,{children:[e.jsx(c,{variant:"ghost",onClick:()=>{n(!1),m([])},children:"Cancelar"}),e.jsxs(c,{onClick:()=>_.mutate(),disabled:_.isPending||u.length===0,children:[_.isPending&&e.jsx($,{className:"h-4 w-4 mr-2 animate-spin"}),"Adicionar ",u.length>0?u.length:""," clientes"]})]})]})}),e.jsx(P,{open:R,onOpenChange:j,children:e.jsxs(G,{className:"max-w-md",children:[e.jsx(F,{children:e.jsxs(U,{className:"flex items-center gap-2",children:[e.jsx(V,{className:"h-5 w-5 text-primary"}),"Gerar ",s.length," MTRs em lote"]})}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Será gerado 1 MTR para cada cliente da rota com a data ",e.jsx("strong",{children:new Date(d+"T12:00:00").toLocaleDateString("pt-BR")}),"."]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(Y,{children:"Descrição do resíduo"}),e.jsx(L,{value:E,onChange:i=>X(i.target.value)})]}),e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-sm",children:[e.jsx("p",{className:"font-medium",children:"Numeração automática:"}),e.jsxs("p",{className:"text-muted-foreground text-xs mt-0.5",children:["MTR-",d.replace(/-/g,""),"-001 até -",String(s.length).padStart(3,"0")]})]})]}),e.jsxs(q,{children:[e.jsx(c,{variant:"ghost",onClick:()=>j(!1),children:"Cancelar"}),e.jsxs(c,{onClick:()=>A.mutate(),disabled:A.isPending,children:[A.isPending&&e.jsx($,{className:"h-4 w-4 mr-2 animate-spin"}),"Gerar MTRs"]})]})]})})]})}function Qe(){const{user:a}=de.useRouteContext(),[d,x]=f.useState(()=>new Date().toISOString().slice(0,10)),[v,p]=f.useState(null),y=[...new Set(K.map(n=>n.semana))];return v?e.jsx(we,{rota:v,dataSelecionada:d,onVoltar:()=>p(null),user:a}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold flex items-center gap-2",children:[e.jsx(pe,{className:"h-6 w-6 text-primary"})," Agendamento de Rotas"]}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Selecione a rota para visualizar clientes, gerar MTRs e registrar coletas."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Y,{className:"text-sm whitespace-nowrap",children:"Data:"}),e.jsx(L,{type:"date",value:d,onChange:n=>x(n.target.value),className:"w-40"})]})]}),y.map(n=>e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx("span",{className:`text-xs font-semibold px-2 py-0.5 rounded-full ${be[n]??"bg-gray-100 text-gray-800"}`,children:n}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:["Semana ",n]})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",children:K.filter(l=>l.semana===n).map(l=>e.jsx(N,{onClick:()=>p(l),className:"p-4 cursor-pointer transition-all border-2 border-border hover:border-primary hover:shadow-md group",children:e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium text-sm group-hover:text-primary transition-colors",children:l.label}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:l.dias})]}),e.jsx(xe,{className:"h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5"})]})},l.id))})]},n))]})}export{Qe as component};
