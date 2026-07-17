import{m as ae,r as f,a5 as ie,n as S,s as v,o as N,t as c,j as e,B as l,I as h,C as A,K as E}from"./index-CcxNVGfZ.js";import{L as m}from"./label-BcdkDoMi.js";import{T as de}from"./textarea-D0-p9aQ9.js";import{S as F,a as R,d as I,b as O,c as z}from"./select-QlNPbdoP.js";import{D as q,e as te,a as L,b as $,c as B,d as k}from"./dialog-BYeekKe3.js";import{T as oe,a as le,b as M,c as r,d as re,e as n}from"./table-CPWBVxDd.js";import{D as ne,O as ce}from"./document-upload-DLD_95zJ.js";import{P as me}from"./plus-CDRqLw_6.js";import{L as P}from"./loader-circle-BmNgqfNV.js";import{S as xe}from"./search-DvhmNulT.js";import{F as ve}from"./file-check-CCP5W9_r.js";import{E as pe}from"./eye-CZh3qvIM.js";import{P as Q}from"./printer-bonc6WxN.js";import{T as ue}from"./trash-2-i6r4TssN.js";import"./index-SZZJ7roG.js";import"./index-U8S-hxkM.js";import"./index-BLANkRwy.js";import"./index-BLQKlGrD.js";import"./index-BMMk2xm_.js";import"./index-B6yumbMj.js";import"./index-Rk2tzlWo.js";import"./index-CnSvDYa1.js";import"./check-c4l3g5-B.js";import"./index-CwUyOi_k.js";import"./index-CbBBvGUB.js";import"./upload-BdrXf2II.js";import"./external-link-DaWZr4RH.js";import"./file-text-ClGro7xL.js";const V=["Aterro Industrial","Incineração","Co-processamento","Reciclagem","Compostagem","Autoclavagem","Tratamento Químico"];function G(a){const p=window.open("","_blank");if(!p)return;const o=a.mtrs?.clientes,i=new Date(a.data_destinacao+"T12:00:00").toLocaleDateString("pt-BR"),x=new Date().toLocaleDateString("pt-BR");p.document.write(`<!DOCTYPE html><html><head><title>CDF ${a.numero}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px;max-width:800px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D9488;padding-bottom:12px;margin-bottom:16px}
    .logo{font-size:20px;font-weight:bold;color:#0D9488}
    .logo-sub{font-size:10px;color:#555;margin-top:2px}
    .cdf-badge{background:#0D9488;color:white;font-size:13px;font-weight:bold;padding:8px 18px;border-radius:4px;text-align:center}
    .cdf-num{font-size:11px;color:#555;margin-top:4px;text-align:center}
    .alert-box{background:#f0fdf4;border:2px solid #0D9488;border-radius:6px;padding:12px 16px;margin-bottom:16px;text-align:center}
    .alert-title{font-size:14px;font-weight:bold;color:#0D9488}
    .alert-sub{font-size:10px;color:#555;margin-top:2px}
    .section{margin-bottom:14px}
    .section-title{background:#0D9488;color:white;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-radius:3px 3px 0 0}
    .section-body{border:1px solid #ccc;border-top:none;padding:10px;border-radius:0 0 3px 3px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
    .field{margin-bottom:0}
    .field-label{font-size:9px;text-transform:uppercase;color:#777;letter-spacing:.5px;margin-bottom:1px}
    .field-value{font-size:11px;font-weight:600;border-bottom:1px solid #ddd;padding-bottom:2px;min-height:16px}
    .residuo-table{width:100%;border-collapse:collapse;margin-top:6px;font-size:10px}
    .residuo-table th{background:#f0f0f0;border:1px solid #ccc;padding:4px 6px;text-align:center}
    .residuo-table td{border:1px solid #ccc;padding:6px;text-align:center}
    .cert-text{font-size:10px;font-style:italic;color:#333;border:1px solid #ddd;padding:8px;border-radius:3px;margin-bottom:14px;background:#fafafa}
    .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}
    .ass-box{border:1px solid #000;padding:12px;border-radius:3px;text-align:center}
    .ass-title{font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2px}
    .ass-name{font-size:10px;color:#555;margin-bottom:32px}
    .ass-line{border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555}
    .highlight{background:#f0fdf4;border:1px solid #86efac;border-radius:4px;padding:10px;margin-bottom:14px}
    .highlight-row{display:flex;justify-content:space-between;align-items:center}
    .hl-item{text-align:center}
    .hl-val{font-size:18px;font-weight:bold;color:#0D9488}
    .hl-label{font-size:9px;color:#555;text-transform:uppercase}
    .footer{margin-top:16px;border-top:1px solid #ddd;padding-top:8px;font-size:9px;color:#999;text-align:center}
    @media print{body{padding:10px}@page{margin:1cm}}
  </style>
  </head><body>

  <div class="header">
    <div>
      <div class="logo">BIOLOGUS AMBIENTAL</div>
      <div class="logo-sub">Gestão de Resíduos de Saúde</div>
    </div>
    <div>
      <div class="cdf-badge">CERTIFICADO DE DESTINAÇÃO FINAL</div>
      <div class="cdf-num">Nº ${a.numero} &nbsp;|&nbsp; ${i}</div>
    </div>
  </div>

  <div class="alert-box">
    <div class="alert-title">✓ Destinação Ambiental Confirmada</div>
    <div class="alert-sub">Este certificado atesta que os resíduos foram destinados de forma ambientalmente adequada conforme legislação vigente.</div>
  </div>

  <div class="highlight">
    <div class="highlight-row">
      <div class="hl-item"><div class="hl-val">${a.quantidade_destinada??"—"} ${a.mtrs?.unidade??"kg"}</div><div class="hl-label">Quantidade destinada</div></div>
      <div class="hl-item"><div class="hl-val">${a.tecnologia??"Incineração"}</div><div class="hl-label">Tecnologia</div></div>
      <div class="hl-item"><div class="hl-val">${i}</div><div class="hl-label">Data de destinação</div></div>
      <div class="hl-item"><div class="hl-val">${a.mtrs?.numero??"—"}</div><div class="hl-label">MTR vinculado</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Gerador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">${o?.razao_social??"—"}</div></div>
        <div class="field"><div class="field-label">Nome Fantasia</div><div class="field-value">${o?.fantasia??"—"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">${o?.cnpj??"—"}</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">&nbsp;</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">${o?.logradouro??"—"}${o?.cidade?`, ${o.cidade}`:""}</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Resíduo Destinado</div>
    <div class="section-body">
      <table class="residuo-table">
        <thead><tr>
          <th>Caracterização</th><th>Classificação</th><th>Acondicionamento</th>
          <th>Quantidade</th><th>Unidade</th><th>Tecnologia</th>
        </tr></thead>
        <tbody><tr>
          <td style="text-align:left">${a.mtrs?.descricao_residuo??"—"}</td>
          <td>${a.mtrs?.classe_ibama??"RESÍDUO DE SAÚDE"}</td>
          <td>${a.mtrs?.acondicionamento??"BOMBONA"}</td>
          <td style="font-weight:bold">${a.quantidade_destinada??"—"}</td>
          <td>${a.mtrs?.unidade??"kg"}</td>
          <td>${a.tecnologia??"Incineração"}</td>
        </tr></tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Transportador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Nome</div><div class="field-value">ATIVA COMERCIAL COMERCIO E SERVICOS LTDA</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">51.480.805/0001-10</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">(62) 3299-6483</div></div>
        <div class="field"><div class="field-label">Tipo de transporte</div><div class="field-value">BAÚ</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Destinador Final</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">${a.destinador??"ECO INCINERAR GESTAO AMBIENTAL LTDA"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">12.018.483/0001-30</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">(62) 9900-5300</div></div>
        <div class="field"><div class="field-label">Tecnologia aplicada</div><div class="field-value">${a.tecnologia??"Incineração"}</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">LOTEAMENTO FLORIDA OURO QUADRA 07 LOTE 08, ZONA INDUSTRIAL, Alexânia - GO, 72930-000</div></div>
      </div>
    </div>
  </div>

  <div class="cert-text">
    Certificamos que os resíduos identificados neste documento foram coletados, transportados e destinados de forma ambientalmente adequada, em conformidade com a Lei Federal nº 12.305/2010 (Política Nacional de Resíduos Sólidos), a RDC ANVISA nº 222/2018 e demais normas aplicáveis.
  </div>

  <div class="section">
    <div class="section-title">Assinaturas</div>
    <div class="section-body">
      <div class="assinaturas">
        <div class="ass-box">
          <div class="ass-title">Gerador</div>
          <div class="ass-name">${o?.fantasia??o?.razao_social??""}</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
        <div class="ass-box">
          <div class="ass-title">Biologus Ambiental</div>
          <div class="ass-name">Responsável Técnico</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
      </div>
    </div>
  </div>

  ${a.observacoes?`<div class="section"><div class="section-title">Observações</div><div class="section-body"><p style="font-size:11px">${a.observacoes}</p></div></div>`:""}

  <div class="footer">
    Biologus Ambiental — biologus.sisgr.com — CDF ${a.numero} — Emitido em ${x}
  </div>
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`),p.document.close()}function Ve(){const a=ae(),[p,o]=f.useState(!1),[i,x]=f.useState(null),[y,w]=f.useState(null),[b,U]=f.useState(""),[j,K]=f.useState("todas"),{user:H}=ie.useRouteContext(),{data:D=[]}=S({queryKey:["mtrs-select-cdf"],queryFn:async()=>{const{data:s}=await v.from("mtrs").select("id, numero, descricao_residuo").order("data_emissao",{ascending:!1});return s??[]}}),{data:u=[],isLoading:J}=S({queryKey:["cdfs"],queryFn:async()=>{const{data:s,error:d}=await v.from("cdfs").select("*, mtrs(numero, descricao_residuo, acondicionamento, unidade, classe_ibama, clientes(razao_social, fantasia, logradouro, cidade, cnpj))").order("data_destinacao",{ascending:!1});if(d)throw d;return s}}),C=u.filter(s=>{const d=b.toLowerCase(),t=!b||s.numero.toLowerCase().includes(d)||(s.mtrs?.clientes?.razao_social??"").toLowerCase().includes(d)||(s.mtrs?.clientes?.fantasia??"").toLowerCase().includes(d)||(s.mtrs?.numero??"").toLowerCase().includes(d),g=j==="todas"||s.tecnologia===j;return t&&g}),_=N({mutationFn:async s=>{const d={...s,owner_id:H.id},{error:t}=await v.from("cdfs").insert(d);if(t)throw t;s.mtr_id&&await v.from("mtrs").update({status:"destinado"}).eq("id",s.mtr_id)},onSuccess:()=>{a.invalidateQueries({queryKey:["cdfs"]}),a.invalidateQueries({queryKey:["mtrs"]}),c.success("CDF emitido"),w(null),o(!1)},onError:s=>c.error(s.message)}),T=N({mutationFn:async s=>{const{error:d}=await v.from("cdfs").update({enviado:!0,data_envio:new Date().toISOString()}).eq("id",s);if(d)throw d},onSuccess:()=>{a.invalidateQueries({queryKey:["cdfs"]}),c.success("CDF marcado como enviado")},onError:s=>c.error(s.message)}),Y=N({mutationFn:async s=>{const{error:d}=await v.from("cdfs").delete().eq("id",s);if(d)throw d},onSuccess:()=>{a.invalidateQueries({queryKey:["cdfs"]}),c.success("CDF removido")},onError:s=>c.error(s.message)}),Z=s=>{s.preventDefault();const d=new FormData(s.currentTarget),t={};if(d.forEach((g,se)=>{g!==""&&(t[se]=g)}),!t.mtr_id||!t.numero||!t.data_destinacao)return c.error("Preencha MTR, número e data de destinação");t.quantidade_destinada&&(t.quantidade_destinada=Number(t.quantidade_destinada)),t.url_documento=y,_.mutate(t)},W=u.filter(s=>s.enviado).length,X=u.filter(s=>!s.enviado).length,ee=u.reduce((s,d)=>s+(d.quantidade_destinada?Number(d.quantidade_destinada):0),0);return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-foreground",children:"CDF — Certificados de Destinação Final"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Comprovação ambiental da destinação adequada dos resíduos."})]}),e.jsxs(q,{open:p,onOpenChange:o,children:[e.jsx(te,{asChild:!0,children:e.jsxs(l,{disabled:D.length===0,children:[e.jsx(me,{className:"h-4 w-4 mr-2"}),"Emitir CDF"]})}),e.jsxs(L,{className:"max-w-2xl max-h-[90vh] overflow-y-auto",children:[e.jsx($,{children:e.jsx(B,{children:"Novo Certificado de Destinação Final"})}),e.jsxs("form",{onSubmit:Z,className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(m,{children:"MTR vinculado *"}),e.jsxs(F,{name:"mtr_id",required:!0,children:[e.jsx(R,{children:e.jsx(I,{placeholder:"Selecione o MTR"})}),e.jsx(O,{children:D.map(s=>e.jsxs(z,{value:s.id,children:[s.numero," — ",s.descricao_residuo]},s.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"numero",children:"Nº CDF *"}),e.jsx(h,{id:"numero",name:"numero",required:!0,placeholder:"CDF-2026-0001"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"data_destinacao",children:"Data de destinação *"}),e.jsx(h,{id:"data_destinacao",name:"data_destinacao",type:"date",required:!0,defaultValue:new Date().toISOString().slice(0,10)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{children:"Tecnologia"}),e.jsxs(F,{name:"tecnologia",defaultValue:"Incineração",children:[e.jsx(R,{children:e.jsx(I,{})}),e.jsx(O,{children:V.map(s=>e.jsx(z,{value:s,children:s},s))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"destinador",children:"Destinador"}),e.jsx(h,{id:"destinador",name:"destinador",defaultValue:"ECO INCINERAR GESTAO AMBIENTAL LTDA"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"quantidade_destinada",children:"Quantidade destinada (kg)"}),e.jsx(h,{id:"quantidade_destinada",name:"quantidade_destinada",type:"number",step:"0.001"})]}),e.jsx("div",{className:"space-y-2 md:col-span-2",children:e.jsx(ne,{folder:"cdfs",value:y,onChange:w,label:"Documento (PDF)"})}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(m,{htmlFor:"observacoes",children:"Observações"}),e.jsx(de,{id:"observacoes",name:"observacoes",rows:2})]})]}),e.jsxs(k,{children:[e.jsx(l,{type:"button",variant:"ghost",onClick:()=>o(!1),children:"Cancelar"}),e.jsxs(l,{type:"submit",disabled:_.isPending,children:[_.isPending&&e.jsx(P,{className:"h-4 w-4 mr-2 animate-spin"}),"Emitir"]})]})]})]})]})]}),e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[{label:"Total de CDFs",val:u.length,color:"text-foreground"},{label:"Pendentes envio",val:X,color:"text-amber-600"},{label:"Enviados",val:W,color:"text-green-600"},{label:"Volume destinado (kg)",val:ee.toLocaleString("pt-BR"),color:"text-primary"}].map(s=>e.jsxs(A,{className:"p-4",children:[e.jsx("p",{className:"text-xs text-muted-foreground uppercase tracking-wider",children:s.label}),e.jsx("p",{className:`text-2xl font-bold mt-1 ${s.color}`,children:s.val})]},s.label))}),e.jsxs("div",{className:"flex gap-3 flex-wrap items-center",children:[e.jsxs("div",{className:"relative flex-1 min-w-48",children:[e.jsx(xe,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}),e.jsx(h,{placeholder:"Buscar CDF, cliente ou MTR...",value:b,onChange:s=>U(s.target.value),className:"pl-9"})]}),e.jsx("div",{className:"flex gap-1 flex-wrap",children:["todas",...V].map(s=>e.jsx("button",{onClick:()=>K(s),className:`text-xs px-3 py-1.5 rounded-full border transition-colors ${j===s?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:border-primary/40"}`,children:s==="todas"?"Todas tecnologias":s},s))})]}),e.jsx(A,{children:J?e.jsx("div",{className:"py-12 text-center",children:e.jsx(P,{className:"h-6 w-6 mx-auto animate-spin text-muted-foreground"})}):C.length===0?e.jsxs("div",{className:"py-16 text-center",children:[e.jsx(ve,{className:"h-10 w-10 mx-auto text-muted-foreground/40"}),e.jsx("p",{className:"mt-3 text-sm text-muted-foreground",children:"Nenhum certificado encontrado."})]}):e.jsxs(oe,{children:[e.jsx(le,{children:e.jsxs(M,{children:[e.jsx(r,{children:"Nº CDF"}),e.jsx(r,{children:"Data"}),e.jsx(r,{children:"Gerador"}),e.jsx(r,{children:"MTR"}),e.jsx(r,{children:"Tecnologia"}),e.jsx(r,{children:"Qtd."}),e.jsx(r,{children:"Status"}),e.jsx(r,{className:"w-32"})]})}),e.jsx(re,{children:C.map(s=>e.jsxs(M,{children:[e.jsx(n,{className:"font-medium",children:s.numero}),e.jsx(n,{className:"text-sm",children:new Date(s.data_destinacao+"T12:00:00").toLocaleDateString("pt-BR")}),e.jsx(n,{className:"text-sm",children:s.mtrs?.clientes?.fantasia??s.mtrs?.clientes?.razao_social??"—"}),e.jsx(n,{className:"text-sm text-muted-foreground",children:s.mtrs?.numero??"—"}),e.jsx(n,{className:"text-sm",children:s.tecnologia??"—"}),e.jsx(n,{className:"text-sm font-semibold whitespace-nowrap",children:s.quantidade_destinada?`${Number(s.quantidade_destinada)} kg`:"—"}),e.jsx(n,{children:s.enviado?e.jsx("span",{className:"text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium",children:"Enviado ✓"}):e.jsx("span",{className:"text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium",children:"Pendente"})}),e.jsx(n,{children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(l,{variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>x(s),title:"Visualizar",children:e.jsx(pe,{className:"h-4 w-4"})}),e.jsx(l,{variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>G(s),title:"Imprimir",children:e.jsx(Q,{className:"h-4 w-4"})}),!s.enviado&&e.jsx(l,{variant:"ghost",size:"icon",className:"h-8 w-8 text-primary",onClick:()=>T.mutate(s.id),title:"Marcar enviado",children:e.jsx(E,{className:"h-4 w-4"})}),e.jsx(ce,{path:s.url_documento}),e.jsx(l,{variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>{confirm(`Remover CDF ${s.numero}?`)&&Y.mutate(s.id)},children:e.jsx(ue,{className:"h-4 w-4 text-destructive"})})]})})]},s.id))})]})}),i&&e.jsx(q,{open:!!i,onOpenChange:()=>x(null),children:e.jsxs(L,{className:"max-w-lg",children:[e.jsx($,{children:e.jsxs(B,{children:["CDF ",i.numero]})}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-sm",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Gerador"}),e.jsx("p",{className:"font-medium",children:i.mtrs?.clientes?.fantasia??i.mtrs?.clientes?.razao_social??"—"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"MTR"}),e.jsx("p",{className:"font-medium",children:i.mtrs?.numero??"—"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Data destinação"}),e.jsx("p",{className:"font-medium",children:new Date(i.data_destinacao+"T12:00:00").toLocaleDateString("pt-BR")})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Quantidade"}),e.jsxs("p",{className:"font-bold text-primary",children:[i.quantidade_destinada??"—"," kg"]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Tecnologia"}),e.jsx("p",{className:"font-medium",children:i.tecnologia??"—"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Destinador"}),e.jsx("p",{className:"font-medium text-xs",children:i.destinador??"Eco Incinerar"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Status envio"}),i.enviado?e.jsxs("span",{className:"text-xs text-green-600 font-medium",children:["Enviado em ",i.data_envio?new Date(i.data_envio).toLocaleDateString("pt-BR"):"—"]}):e.jsx("span",{className:"text-xs text-amber-600 font-medium",children:"Pendente"})]})]}),i.observacoes&&e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Observações"}),e.jsx("p",{className:"text-sm",children:i.observacoes})]})]}),e.jsxs(k,{children:[e.jsxs(l,{variant:"outline",onClick:()=>G(i),children:[e.jsx(Q,{className:"h-4 w-4 mr-2"}),"Imprimir"]}),!i.enviado&&e.jsxs(l,{onClick:()=>{T.mutate(i.id),x(null)},children:[e.jsx(E,{className:"h-4 w-4 mr-2"}),"Marcar enviado"]}),e.jsx(l,{variant:"ghost",onClick:()=>x(null),children:"Fechar"})]})]})})]})}export{Ve as component};
