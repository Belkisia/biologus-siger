import{m as k,r as N,W as K,n as D,s as x,o as C,t as u,j as e,B as v,I as l,C as I}from"./index-SrNJSOtv.js";import{L as t}from"./label-shk9w6Xh.js";import{T as J}from"./textarea-DmMWLK-i.js";import{S as f,a as h,d as y,b as g,c as b}from"./select-DT1NLpIu.js";import{D as H,e as Y,a as W,b as X,c as Z,d as ee}from"./dialog-DoQyGQAH.js";import{T as se,a as ae,b as O,c as r,d as ie,e as n}from"./table-t-z4td1T.js";import{D as de,O as te}from"./document-upload-DQuschQa.js";import{P as oe}from"./plus-k_VH9eiv.js";import{L as M}from"./loader-circle-BnsdLd19.js";import{S as le}from"./search-BXTvUO8n.js";import{F as re}from"./file-text-CMtfKwr9.js";import{P as ne}from"./printer-BF962B8N.js";import{T as ce}from"./trash-2-ivFTMZi6.js";import"./index-CDnB_Qaz.js";import"./index-CBiCXTmg.js";import"./index-BVK116FX.js";import"./index-BfrXtyOl.js";import"./index-CEbvykiG.js";import"./index-D19oZPj9.js";import"./index-CosGcCBA.js";import"./index-CgXvJ-ni.js";import"./check-Cz7XR8CC.js";import"./index-DNx8zBeD.js";import"./index-BbLIjLYs.js";import"./upload-CRUQTtM3.js";import"./external-link-B2urcW7S.js";const j={emitido:{label:"Emitido",color:"bg-blue-100 text-blue-800"},em_transporte:{label:"Em Transporte",color:"bg-amber-100 text-amber-800"},recebido:{label:"Recebido",color:"bg-purple-100 text-purple-800"},destinado:{label:"Destinado",color:"bg-green-100 text-green-800"},cancelado:{label:"Cancelado",color:"bg-red-100 text-red-800"}},me=["Classe I — Perigoso","Classe IIA — Não inerte","Classe IIB — Inerte"],pe=["Aterro Industrial","Incineração","Co-processamento","Reciclagem","Compostagem","Autoclavagem","Tratamento Químico"];function xe(d){const m=window.open("","_blank");if(!m)return;const o=d.clientes,_=new Date(d.data_emissao+"T12:00:00").toLocaleDateString("pt-BR");m.document.write(`<!DOCTYPE html><html><head><title>MTR ${d.numero}</title>
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
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
    .field{margin-bottom:0}
    .field-label{font-size:9px;text-transform:uppercase;color:#777;letter-spacing:.5px;margin-bottom:1px}
    .field-value{font-size:11px;font-weight:600;border-bottom:1px solid #ddd;padding-bottom:2px;min-height:16px}
    .residuo-table{width:100%;border-collapse:collapse;margin-top:6px;font-size:10px}
    .residuo-table th{background:#f0f0f0;border:1px solid #ccc;padding:4px 6px;text-align:center}
    .residuo-table td{border:1px solid #ccc;padding:4px 6px;text-align:center}
    .cert-text{font-size:10px;font-style:italic;color:#333;border:1px solid #ddd;padding:8px;border-radius:3px;margin-bottom:14px;background:#fafafa}
    .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}
    .ass-box{border:1px solid #000;padding:12px;border-radius:3px;text-align:center}
    .ass-title{font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2px}
    .ass-name{font-size:10px;color:#555;margin-bottom:24px}
    .ass-line{border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555}
    .footer{margin-top:16px;border-top:1px solid #ddd;padding-top:8px;font-size:9px;color:#999;text-align:center}
    @media print{body{padding:10px}@page{margin:1cm}}
  </style>
  </head><body>
  <div class="header">
    <div><div class="logo">BIOLOGUS AMBIENTAL</div><div class="logo-sub">Gestão de Resíduos de Saúde</div></div>
    <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${d.numero} &nbsp;|&nbsp; ${_}</div></div>
  </div>

  <div class="section">
    <div class="section-title">Gerador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">${o?.razao_social??"—"}</div></div>
        <div class="field"><div class="field-label">Nome Fantasia</div><div class="field-value">${o?.fantasia??"—"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">${o?.cnpj??"—"}</div></div>
        <div class="field"><div class="field-label">Responsável / Telefone</div><div class="field-value">&nbsp;</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">${o?.logradouro??"—"}${o?.cidade?`, ${o.cidade}`:""}</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Descrição do(s) Resíduo(s)</div>
    <div class="section-body">
      <table class="residuo-table">
        <thead><tr>
          <th>Caracterização (Nome)</th><th>Estado Físico</th><th>Classif. / Código</th>
          <th>Código ONU</th><th>Nº Risco</th><th>Acondic.</th><th>Qtde</th><th>Un.</th>
        </tr></thead>
        <tbody><tr>
          <td style="text-align:left">${d.descricao_residuo}</td>
          <td>SÓLIDO</td>
          <td>${d.classe_ibama??"RESÍDUO DE SAÚDE"}</td>
          <td>2814</td><td>6.2</td>
          <td>${d.acondicionamento??"BOMBONA"}</td>
          <td>${d.quantidade>0?d.quantidade:""}</td>
          <td>${d.unidade}</td>
        </tr></tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Transportador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Nome</div><div class="field-value">${d.transportador??"ATIVA COMERCIAL COMERCIO E SERVICOS LTDA"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">51.480.805/0001-10</div></div>
        <div class="field"><div class="field-label">Placa do Veículo</div><div class="field-value">&nbsp;</div></div>
        <div class="field"><div class="field-label">Condutor</div><div class="field-value">&nbsp;</div></div>
        <div class="field"><div class="field-label">Tipo de Transporte</div><div class="field-value">BAÚ</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">(62) 3299-6483</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">RUA JOSE GOMES BAYLAO, 794 - CONJ MORADA NOVA, Goiânia - GO</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Receptor Final</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">B-GREEN GESTAO AMBIENTAL S.A.</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">01.568.077/0006-30</div></div>
        <div class="field"><div class="field-label">Responsável</div><div class="field-value">&nbsp;</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">&nbsp;</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">SETOR INDUSTRIAL DA CEILANDIA QI 21 LOTE 51/53/55 — CEILANDIA — Brasília - DF — CEP 72265-210</div></div>
      </div>
    </div>
  </div>

  <div class="cert-text">
    Eu, por meio deste manifesto, declaro que os resíduos acima listados estão integralmente descritos pelo nome, classificados, embalados e rotulados seguindo as normas vigentes e estão sob todos os aspectos em condições adequadas para transporte de acordo com os regulamentos nacionais e internacionais vigentes.
  </div>

  <div class="section">
    <div class="section-title">Conferência</div>
    <div class="section-body">
      <div class="assinaturas">
        <div class="ass-box">
          <div class="ass-title">Gerador</div>
          <div class="ass-name">${o?.fantasia??o?.razao_social??""}</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
        <div class="ass-box">
          <div class="ass-title">Transportador</div>
          <div class="ass-name">ATIVA COMERCIAL COMERCIO E SERVICOS LTDA</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">Biologus Ambiental — biologus.sisgr.com — Impresso em ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}</div>
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`),m.document.close()}function $e(){const d=k(),[m,o]=N.useState(!1),[_,R]=N.useState(null),[T,L]=N.useState(""),[A,B]=N.useState("todos"),{user:F}=K.useRouteContext(),{data:w=[]}=D({queryKey:["clientes-select"],queryFn:async()=>{const{data:s}=await x.from("clientes").select("id, razao_social, fantasia").order("razao_social",{ascending:!0});return s??[]}}),{data:p=[],isLoading:z}=D({queryKey:["mtrs"],queryFn:async()=>{const{data:s,error:a}=await x.from("mtrs").select("*, clientes(razao_social, fantasia, logradouro, cidade, cnpj)").order("data_emissao",{ascending:!1});if(a)throw a;return s}}),E=p.filter(s=>{const a=T.toLowerCase(),i=!T||s.numero.toLowerCase().includes(a)||(s.clientes?.razao_social??"").toLowerCase().includes(a)||(s.clientes?.fantasia??"").toLowerCase().includes(a),c=A==="todos"||s.status===A;return i&&c}),S=C({mutationFn:async s=>{const{error:a}=await x.from("mtrs").insert([{...s,owner_id:F.id}]);if(a)throw a},onSuccess:()=>{d.invalidateQueries({queryKey:["mtrs"]}),u.success("MTR registrado"),R(null),o(!1)},onError:s=>u.error(s.message)}),q=C({mutationFn:async({id:s,status:a})=>{const{error:i}=await x.from("mtrs").update({status:a}).eq("id",s);if(i)throw i},onSuccess:()=>d.invalidateQueries({queryKey:["mtrs"]})}),$=C({mutationFn:async s=>{const{error:a}=await x.from("mtrs").delete().eq("id",s);if(a)throw a},onSuccess:()=>{d.invalidateQueries({queryKey:["mtrs"]}),u.success("MTR removido")},onError:s=>u.error(s.message)}),P=s=>{s.preventDefault();const a=new FormData(s.currentTarget),i={};if(a.forEach((c,Q)=>{c!==""&&(i[Q]=c)}),!i.cliente_id||!i.numero||!i.descricao_residuo)return u.error("Preencha cliente, número e descrição");i.quantidade&&(i.quantidade=Number(i.quantidade)),i.url_documento=_,S.mutate(i)},V=p.reduce((s,a)=>s+(a.unidade==="kg"?Number(a.quantidade):0),0),U=p.filter(s=>s.status==="destinado").length,G=p.filter(s=>["emitido","em_transporte"].includes(s.status)).length;return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-foreground",children:"MTR — Manifesto de Transporte de Resíduos"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Rastreabilidade legal do gerador ao destino final."})]}),e.jsxs(H,{open:m,onOpenChange:o,children:[e.jsx(Y,{asChild:!0,children:e.jsxs(v,{disabled:w.length===0,children:[e.jsx(oe,{className:"h-4 w-4 mr-2"}),"Novo MTR"]})}),e.jsxs(W,{className:"max-w-3xl max-h-[90vh] overflow-y-auto",children:[e.jsx(X,{children:e.jsx(Z,{children:"Registrar MTR"})}),e.jsxs("form",{onSubmit:P,className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{children:"Cliente (Gerador) *"}),e.jsxs(f,{name:"cliente_id",required:!0,children:[e.jsx(h,{children:e.jsx(y,{placeholder:"Selecione"})}),e.jsx(g,{children:w.map(s=>e.jsx(b,{value:s.id,children:s.fantasia||s.razao_social},s.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"numero",children:"Nº MTR *"}),e.jsx(l,{id:"numero",name:"numero",required:!0,placeholder:"MTR-2026-0001"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"data_emissao",children:"Data de emissão"}),e.jsx(l,{id:"data_emissao",name:"data_emissao",type:"date",defaultValue:new Date().toISOString().slice(0,10)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{children:"Classe IBAMA"}),e.jsxs(f,{name:"classe_ibama",children:[e.jsx(h,{children:e.jsx(y,{placeholder:"Selecione"})}),e.jsx(g,{children:me.map(s=>e.jsx(b,{value:s,children:s},s))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"codigo_residuo",children:"Código IBAMA"}),e.jsx(l,{id:"codigo_residuo",name:"codigo_residuo",placeholder:"ex.: 180103"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"acondicionamento",children:"Acondicionamento"}),e.jsx(l,{id:"acondicionamento",name:"acondicionamento",defaultValue:"BOMBONA"})]}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(t,{htmlFor:"descricao_residuo",children:"Descrição do resíduo *"}),e.jsx(l,{id:"descricao_residuo",name:"descricao_residuo",required:!0,defaultValue:"GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"quantidade",children:"Quantidade"}),e.jsx(l,{id:"quantidade",name:"quantidade",type:"number",step:"0.001"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{children:"Unidade"}),e.jsxs(f,{name:"unidade",defaultValue:"kg",children:[e.jsx(h,{children:e.jsx(y,{})}),e.jsx(g,{children:["kg","ton","L","m3","un"].map(s=>e.jsx(b,{value:s,children:s},s))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"transportador",children:"Transportador"}),e.jsx(l,{id:"transportador",name:"transportador",defaultValue:"ATIVA COMERCIAL COMERCIO E SERVICOS LTDA"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"destinador",children:"Destinador"}),e.jsx(l,{id:"destinador",name:"destinador",defaultValue:"ECO INCINERAR GESTAO AMBIENTAL LTDA"})]}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(t,{children:"Tecnologia de destinação"}),e.jsxs(f,{name:"tecnologia_destinacao",defaultValue:"Incineração",children:[e.jsx(h,{children:e.jsx(y,{})}),e.jsx(g,{children:pe.map(s=>e.jsx(b,{value:s,children:s},s))})]})]}),e.jsx("div",{className:"space-y-2 md:col-span-2",children:e.jsx(de,{folder:"mtrs",value:_,onChange:R,label:"Documento (PDF)"})}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(t,{htmlFor:"observacoes",children:"Observações"}),e.jsx(J,{id:"observacoes",name:"observacoes",rows:2})]})]}),e.jsxs(ee,{children:[e.jsx(v,{type:"button",variant:"ghost",onClick:()=>o(!1),children:"Cancelar"}),e.jsxs(v,{type:"submit",disabled:S.isPending,children:[S.isPending&&e.jsx(M,{className:"h-4 w-4 mr-2 animate-spin"}),"Registrar"]})]})]})]})]})]}),e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[{label:"Total de MTRs",val:p.length,color:"text-foreground"},{label:"Em aberto",val:G,color:"text-amber-600"},{label:"Destinados",val:U,color:"text-green-600"},{label:"Volume (kg)",val:V.toLocaleString("pt-BR"),color:"text-primary"}].map(s=>e.jsxs(I,{className:"p-4",children:[e.jsx("p",{className:"text-xs text-muted-foreground uppercase tracking-wider",children:s.label}),e.jsx("p",{className:`text-2xl font-bold mt-1 ${s.color}`,children:s.val})]},s.label))}),e.jsxs("div",{className:"flex gap-3 flex-wrap items-center",children:[e.jsxs("div",{className:"relative flex-1 min-w-48",children:[e.jsx(le,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}),e.jsx(l,{placeholder:"Buscar MTR ou cliente...",value:T,onChange:s=>L(s.target.value),className:"pl-9"})]}),e.jsx("div",{className:"flex gap-1",children:["todos",...Object.keys(j)].map(s=>e.jsx("button",{onClick:()=>B(s),className:`text-xs px-3 py-1.5 rounded-full border transition-colors ${A===s?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:border-primary/40"}`,children:s==="todos"?"Todos":j[s]?.label},s))})]}),e.jsx(I,{children:z?e.jsx("div",{className:"py-12 text-center",children:e.jsx(M,{className:"h-6 w-6 mx-auto animate-spin text-muted-foreground"})}):E.length===0?e.jsxs("div",{className:"py-16 text-center",children:[e.jsx(re,{className:"h-10 w-10 mx-auto text-muted-foreground/40"}),e.jsx("p",{className:"mt-3 text-sm text-muted-foreground",children:"Nenhum MTR encontrado."})]}):e.jsxs(se,{children:[e.jsx(ae,{children:e.jsxs(O,{children:[e.jsx(r,{children:"Nº MTR"}),e.jsx(r,{children:"Emissão"}),e.jsx(r,{children:"Gerador"}),e.jsx(r,{children:"Resíduo"}),e.jsx(r,{children:"Qtd."}),e.jsx(r,{children:"Status"}),e.jsx(r,{className:"w-28"})]})}),e.jsx(ie,{children:E.map(s=>{const a=j[s.status]??j.emitido;return e.jsxs(O,{children:[e.jsx(n,{className:"font-medium",children:s.numero}),e.jsx(n,{className:"text-sm",children:new Date(s.data_emissao+"T12:00:00").toLocaleDateString("pt-BR")}),e.jsx(n,{className:"text-sm",children:s.clientes?.fantasia??s.clientes?.razao_social??"—"}),e.jsxs(n,{children:[e.jsx("div",{className:"text-sm truncate max-w-48",children:s.descricao_residuo}),s.classe_ibama&&e.jsx("div",{className:"text-xs text-muted-foreground",children:s.classe_ibama})]}),e.jsx(n,{className:"text-sm whitespace-nowrap font-semibold",children:Number(s.quantidade)>0?`${Number(s.quantidade)} ${s.unidade}`:"—"}),e.jsx(n,{children:e.jsxs(f,{value:s.status,onValueChange:i=>q.mutate({id:s.id,status:i}),children:[e.jsx(h,{className:"w-36 h-7 border-0 p-0",children:e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${a.color}`,children:a.label})}),e.jsx(g,{children:Object.entries(j).map(([i,c])=>e.jsx(b,{value:i,children:c.label},i))})]})}),e.jsx(n,{children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(v,{variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>xe(s),title:"Imprimir MTR",children:e.jsx(ne,{className:"h-4 w-4"})}),e.jsx(te,{path:s.url_documento}),e.jsx(v,{variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>{confirm(`Remover MTR ${s.numero}?`)&&$.mutate(s.id)},children:e.jsx(ce,{className:"h-4 w-4 text-destructive"})})]})})]},s.id)})})]})})]})}export{$e as component};
