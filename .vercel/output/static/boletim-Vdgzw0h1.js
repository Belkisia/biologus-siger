import{d as xe,m as Ne,a6 as we,r as x,n as le,s as k,o as W,t as C,j as e,i as q,I as G,B as n,K as v,C as Y,a as ce,y as ye}from"./index-B2G-VtjX.js";import{L as I}from"./label-V3O--Amv.js";import{D as F,a as R,b as z,c as T,d as $}from"./dialog-DGrtIXWe.js";import{T as Ce,a as _e,b as de,c as D,d as Se,e as E}from"./table-CBgGiGh5.js";import{S as ke,a as De,d as Ee,b as Fe,c as Re}from"./select-FxAwzrci.js";import{P as ze}from"./plus-DJ0mSRu-.js";import{F as L}from"./file-check-De5v_Yj-.js";import{D as P}from"./dollar-sign-75Pbviky.js";import{L as me}from"./loader-circle-ekJ9vrgK.js";import{E as pe}from"./eye-DbPNP59r.js";import"./index-Dyuur3Pz.js";import"./index-DKo299xh.js";import"./index-CUBZ28g-.js";import"./index-BGRZDc4d.js";import"./index-BjCnNzGb.js";import"./index-C-cOT8O0.js";import"./index-CxFa7XPK.js";import"./index-ChvtBYe7.js";import"./index-BASZ0WzQ.js";import"./index-BUeUGA3L.js";import"./check-BwDnhAU9.js";const Te=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]],Ae=xe("clipboard-check",Te);const qe=[["path",{d:"M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21",key:"g5wo59"}],["path",{d:"m5.082 11.09 8.828 8.828",key:"1wx5vj"}]],Le=xe("eraser",qe),O={pendente:{label:"Pendente",color:"bg-gray-100 text-gray-700"},coletado:{label:"Coletado",color:"bg-blue-100 text-blue-800"},pago:{label:"Pago",color:"bg-green-100 text-green-800"},cdf_emitido:{label:"CDF Emitido",color:"bg-teal-100 text-teal-800"},cdf_enviado:{label:"CDF Enviado ✓",color:"bg-emerald-100 text-emerald-800"}};function Pe(p){const{numeroCDF:c,numeroMTR:f,dataEmissao:g,periodoInicio:s,periodoFim:u,peso:d,unidade:h,cliente:l}=p,t=i=>i?new Date(i+"T12:00:00").toLocaleDateString("pt-BR"):"—",r=`https://biologus-siger.vercel.app/verificar-cdf/${c}`;return`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>CDF ${c}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;background:#f4f4f4;padding:20px;color:#111}
    .cdf-wrap{background:#fff;border:0.5px solid #d1e8d8;border-radius:14px;overflow:hidden;max-width:720px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .cdf-header{background:#0a2e1a;position:relative;overflow:hidden}
    .header-inner{position:relative;z-index:2;padding:24px 32px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
    .cert-num-block{text-align:right;flex-shrink:0}
    .cert-num-label{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#6bbf85;margin-bottom:2px}
    .cert-num-val{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:#fff;letter-spacing:2px}
    .title-band{background:#155c2b;padding:13px 32px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1e7a3a}
    .cert-title{font-family:'Playfair Display',serif;font-size:19px;color:#fff}
    .period-badge{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:5px 14px;font-size:11px;color:#c8ecd4}
    .mtr-band{background:#f0faf3;border-bottom:0.5px solid #c8e6d0;padding:10px 32px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .mtr-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#6b7280;font-weight:600}
    .mtr-val{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#0a2e1a;letter-spacing:1px}
    .mtr-sep{width:1px;height:18px;background:#c8e6d0}
    .body{padding:22px 32px 24px}
    .declaracao{font-size:12px;color:#4a5568;line-height:1.75;border-left:3px solid #1a6b35;padding:10px 16px;background:#f7fdf9;border-radius:0 8px 8px 0;margin-bottom:22px;font-style:italic}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
    .info-card{border:0.5px solid #c8e6d0;border-radius:10px;padding:14px 16px;background:#f7fdf9}
    .card-label{font-size:8.5px;letter-spacing:2.5px;text-transform:uppercase;color:#1a6b35;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px}
    .card-label::after{content:'';flex:1;height:0.5px;background:#b8ddc4}
    .irow{margin-bottom:7px}.irow:last-child{margin-bottom:0}
    .irow .lbl{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:1px}
    .irow .val{font-size:12px;font-weight:500;color:#111827;line-height:1.3}
    .section-divider{font-size:8.5px;letter-spacing:2.5px;text-transform:uppercase;color:#1a6b35;font-weight:600;display:flex;align-items:center;gap:12px;margin:20px 0 12px}
    .section-divider::before,.section-divider::after{content:'';flex:1;height:0.5px;background:#c8e6d0}
    table.rtable{width:100%;border-collapse:separate;border-spacing:0;font-size:11.5px;border:0.5px solid #c8e6d0;border-radius:10px;overflow:hidden}
    table.rtable th{background:#0a2e1a;color:#7dcf9a;padding:10px 13px;text-align:left;font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500}
    table.rtable td{padding:13px 13px;border-bottom:0.5px solid #e8f4ec;color:#1f2937;vertical-align:middle}
    table.rtable tr:last-child td{border-bottom:none}
    .grupo-tag{display:inline-block;background:#0a2e1a;color:#6bbf85;font-size:10px;padding:4px 11px;border-radius:20px;font-weight:600;letter-spacing:.5px}
    .mtr-tag{display:inline-block;background:#f0faf3;border:0.5px solid #b8ddc4;color:#155c2b;font-size:10px;padding:3px 9px;border-radius:20px;font-weight:600;margin-top:5px;letter-spacing:.5px}
    .qty-big{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1a6b35;line-height:1}
    .qty-kg{font-size:10px;color:#6b7280}
    .footer-sec{margin-top:22px;padding-top:18px;border-top:0.5px solid #c8e6d0;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end}
    .sig-box{border-bottom:1.5px solid #155c2b;height:52px;margin-bottom:6px;display:flex;align-items:center;justify-content:center}
    .sig-lbl{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af}
    .sig-name{font-size:12px;font-weight:600;color:#111827;margin-top:1px}
    .sig-cnpj{font-size:10px;color:#6b7280}
    .qr-block{display:flex;flex-direction:column;align-items:center;gap:6px}
    #qrcode-el{width:72px;height:72px;background:#f0faf3;border:1px solid #b8ddc4;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:4px}
    #qrcode-el canvas,#qrcode-el img{width:64px!important;height:64px!important;display:block}
    .qr-lbl{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;text-align:center}
    .qr-url{font-size:8px;color:#6b7280;text-align:center;max-width:80px;word-break:break-all;margin-top:2px}
    .auth-strip{margin-top:14px;background:#f0faf3;border:0.5px solid #b8ddc4;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px}
    .auth-dot{width:7px;height:7px;border-radius:50%;background:#1a6b35;flex-shrink:0}
    .auth-txt{font-size:10.5px;color:#374151}
    .pg{font-size:10px;color:#9ca3af;text-align:right;margin-top:8px}
    .no-print{display:flex;gap:10px;justify-content:center;margin-top:20px}
    @media print{.no-print{display:none!important}body{background:#fff;padding:0}.cdf-wrap{box-shadow:none;border:none;border-radius:0}@page{margin:1cm;size:A4}}
  </style>
</head>
<body>
<div class="cdf-wrap">
  <div class="cdf-header">
    <div class="header-inner">
      <svg width="230" height="64" viewBox="0 0 230 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" fill="#b8d8f0" opacity="0.9"/>
        <ellipse cx="30" cy="30" rx="8" ry="12" fill="#2eaa4e" opacity="0.85"/>
        <ellipse cx="38" cy="26" rx="5" ry="7" fill="#2eaa4e" opacity="0.7"/>
        <circle cx="32" cy="32" r="26" fill="none" stroke="#2eaa4e" stroke-width="2.5" stroke-dasharray="50 14"/>
        <path d="M14 10 C10 4, 22 2, 24 8 C26 12, 18 16, 14 10Z" fill="#2eaa4e"/>
        <path d="M50 54 C54 60, 42 62, 40 56 C38 52, 46 48, 50 54Z" fill="#2eaa4e"/>
        <text x="68" y="26" font-family="Arial Black, sans-serif" font-size="19" font-weight="900" fill="#2eaa4e" letter-spacing="1">BIO LOGUS</text>
        <text x="68" y="46" font-family="Arial Black, sans-serif" font-size="19" font-weight="900" fill="#f5832a" letter-spacing="1">AMBIENTAL</text>
        <text x="69" y="59" font-family="Arial, sans-serif" font-size="10" fill="#2eaa4e" letter-spacing="0.3">Gerenciamento de Resíduos</text>
      </svg>
      <div class="cert-num-block">
        <div class="cert-num-label">Certificado Nº</div>
        <div class="cert-num-val">${c}</div>
      </div>
    </div>
    <div class="title-band">
      <div class="cert-title">Certificado de Destinação Final</div>
      <div class="period-badge">${t(s)} — ${t(u)}</div>
    </div>
  </div>

  <div class="mtr-band">
    <span class="mtr-label">MTR vinculado</span>
    <div class="mtr-sep"></div>
    <span class="mtr-val">${f}</span>
    <div class="mtr-sep"></div>
    <span class="mtr-label">Data de emissão</span>
    <div class="mtr-sep"></div>
    <span class="mtr-val" style="font-size:13px;color:#374151;font-family:'Inter',sans-serif;font-weight:500;">${t(g)}</span>
  </div>

  <div class="body">
    <p class="declaracao">
      Certificamos ter coletado, transportado os resíduos aqui discriminados para tratamento e disposição final,
      em conformidade com as normas aplicáveis da legislação ambiental, do gerador abaixo identificado.
    </p>

    <div class="two-col">
      <div class="info-card">
        <div class="card-label">Certificador</div>
        <div class="irow"><span class="lbl">Razão Social</span><span class="val">BIO LOGUS AMBIENTAL LTDA</span></div>
        <div class="irow"><span class="lbl">CNPJ</span><span class="val">26.484.921/0001-60</span></div>
        <div class="irow"><span class="lbl">Endereço</span><span class="val">R. Ipora, 258 – Qd. 18 Lt. 12, N. Sra. de Fátima, Goiânia-GO, 74420-290</span></div>
      </div>
      <div class="info-card">
        <div class="card-label">Geradora</div>
        <div class="irow"><span class="lbl">Razão Social</span><span class="val">${l.razao_social}</span></div>
        <div class="irow"><span class="lbl">CNPJ</span><span class="val">${l.cnpj||"—"}</span></div>
        <div class="irow"><span class="lbl">Endereço</span><span class="val">${l.logradouro||"—"}${l.cidade?`, ${l.cidade}`:""}</span></div>
      </div>
    </div>

    <div class="section-divider">Resíduos coletados</div>

    <table class="rtable">
      <thead>
        <tr>
          <th>Transportadora</th>
          <th>Receptor Final</th>
          <th>Resíduo</th>
          <th style="text-align:center">Qtd.</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-weight:600;font-size:11.5px;margin-bottom:2px;">BIO LOGUS AMBIENTAL EIRELI</div>
            <div style="font-size:10px;color:#6b7280;">CNPJ: 26.484.921/0001-60</div>
          </td>
          <td>
            <div style="font-weight:600;font-size:11.5px;margin-bottom:2px;">B-GREEN GESTÃO AMBIENTAL S.A.</div>
            <div style="font-size:10px;color:#6b7280;">CNPJ: 01.568.077/0006-30</div>
          </td>
          <td>
            <span class="grupo-tag">GRUPO A, B, E</span>
            <div><span class="mtr-tag">${f}</span></div>
          </td>
          <td style="text-align:center">
            <div class="qty-big">${String(d).replace(".",",")}</div>
            <div class="qty-kg">${h}</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="footer-sec">
      <div>
        <div class="sig-box">
          <svg width="130" height="42" viewBox="0 0 130 42">
            <path d="M8 32 C18 12, 28 38, 44 22 C56 10, 68 34, 85 24 C96 17, 108 30, 122 26"
                  fill="none" stroke="#155c2b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="sig-lbl">Assinatura do certificador</div>
        <div class="sig-name">BIO LOGUS AMBIENTAL LTDA</div>
        <div class="sig-cnpj">CNPJ: 26.484.921/0001-60</div>
      </div>
      <div class="qr-block">
        <div id="qrcode-el"></div>
        <div class="qr-lbl">Verificar<br>autenticidade</div>
        <div class="qr-url">biologus-siger.vercel.app/verificar-cdf/${c}</div>
      </div>
    </div>

    <div class="auth-strip">
      <div class="auth-dot"></div>
      <div class="auth-txt">Escaneie o QR Code para verificar a autenticidade deste certificado.</div>
    </div>

    <div class="pg">PÁG. 1</div>
  </div>
</div>

<div class="no-print">
  <button onclick="window.print()" style="background:#0a2e1a;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Inter,sans-serif">
    🖨️ Imprimir / Salvar PDF
  </button>
  <button onclick="window.close()" style="background:#f0faf3;color:#155c2b;border:1px solid #b8ddc4;padding:10px 24px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Inter,sans-serif">
    Fechar
  </button>
</div>

<script>
  new QRCode(document.getElementById("qrcode-el"), {
    text: "${r}",
    width: 64, height: 64,
    colorDark: "#0a2e1a",
    colorLight: "#f0faf3",
    correctLevel: QRCode.CorrectLevel.M
  });
<\/script>
</body>
</html>`}function Oe(p){const c=Pe(p),f=new Blob([c],{type:"text/html;charset=utf-8"});return URL.createObjectURL(f)}function Ie(p,c){const f=c.valor_franquia||0,g=c.peso_franquia||0,s=c.valor_kg_excedente||0,u=Math.max(0,p-g),d=u*s,h=f+d;return{valorBase:f,pesoExcedente:u,valorExcedente:d,valorTotal:h}}function $e(p){return p==="ativa"?{nome:"Ativa Comercial Comercio e Servicos Ltda",fantasia:"Ativa Comercial",cnpj:"51.480.805/0001-10",inscricaoMunicipal:"6247989",endereco:"Rua José Gomes Bailão, 794 - SALA 02 - Lote: 02 - Quadra: 65",cidade:"Goiânia - GO",cep:"74423-342",telefone:"(62)3299-6483",email:"universocontabilidade.fiscal2@gmail.com",regime:"Simples Nacional",aliquotaISSQN:2.92}:{nome:"Bio Logus Ambiental Ltda",fantasia:"Bio Logus Ambiental",cnpj:"26.484.921/0001-60",inscricaoMunicipal:"4322584",endereco:"Rua dos Ferroviarios, 00 - Lote: 05 - Quadra: 01",cidade:"Goiânia - GO",cep:"74483-115",telefone:"(62)3299-6483",email:"universocontabilidade.pessoal@gmail.com",regime:"Lucro Presumido",aliquotaISSQN:5}}function Be({onChange:p}){const c=x.useRef(null),f=x.useRef(!1),g=x.useRef({x:0,y:0}),s=(t,r)=>{const i=r.getBoundingClientRect(),b=r.width/i.width,B=r.height/i.height;return"touches"in t?{x:(t.touches[0].clientX-i.left)*b,y:(t.touches[0].clientY-i.top)*B}:{x:(t.clientX-i.left)*b,y:(t.clientY-i.top)*B}},u=t=>{t.preventDefault();const r=c.current;r&&(f.current=!0,g.current=s(t,r))},d=t=>{if(t.preventDefault(),!f.current)return;const r=c.current;if(!r)return;const i=r.getContext("2d");if(!i)return;const b=s(t,r);i.beginPath(),i.moveTo(g.current.x,g.current.y),i.lineTo(b.x,b.y),i.strokeStyle="#0D9488",i.lineWidth=2.5,i.lineCap="round",i.lineJoin="round",i.stroke(),g.current=b},h=t=>{t.preventDefault(),f.current=!1;const r=c.current;r&&p(r.toDataURL("image/png"))},l=()=>{const t=c.current;if(!t)return;const r=t.getContext("2d");r&&(r.clearRect(0,0,t.width,t.height),p(""))};return e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(I,{className:"text-sm font-medium",children:"Assinatura do responsável"}),e.jsxs(n,{type:"button",variant:"ghost",size:"sm",onClick:l,className:"h-7 text-xs gap-1",children:[e.jsx(Le,{className:"h-3 w-3"})," Limpar"]})]}),e.jsx("div",{className:"border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20 touch-none",children:e.jsx("canvas",{ref:c,width:600,height:160,className:"w-full h-32 cursor-crosshair",onMouseDown:u,onMouseMove:d,onMouseUp:h,onMouseLeave:h,onTouchStart:u,onTouchMove:d,onTouchEnd:h})}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Assine acima com o dedo ou mouse"}),openEnvio&&e.jsx(F,{open:!!openEnvio,onOpenChange:t=>!t&&setOpenEnvio(null),children:e.jsxs(R,{className:"max-w-sm",children:[e.jsx(z,{children:e.jsxs(T,{className:"flex items-center gap-2",children:[e.jsx(v,{className:"h-5 w-5 text-primary"}),"Enviar CDF — ",openEnvio.numero||openEnvio.cdf_id]})}),e.jsxs("div",{className:"space-y-3 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Cliente: ",e.jsx("strong",{children:openEnvio.clientes?.nome_fantasia||openEnvio.clientes?.razao_social})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Escolha como enviar o certificado:"}),e.jsxs("div",{className:"grid gap-3",children:[e.jsxs(n,{className:"w-full gap-2 bg-green-500 hover:bg-green-600",onClick:()=>enviarWhatsApp(openEnvio),children:[e.jsx(v,{className:"h-4 w-4"}),"Enviar por WhatsApp",openEnvio.clientes?.telefone&&e.jsxs("span",{className:"text-xs opacity-80",children:["(",openEnvio.clientes.telefone,")"]})]}),e.jsxs(n,{variant:"outline",className:"w-full gap-2",onClick:()=>enviarEmail(openEnvio),children:[e.jsx(v,{className:"h-4 w-4"}),"Enviar por E-mail",openEnvio.clientes?.email&&e.jsxs("span",{className:"text-xs text-muted-foreground",children:["(",openEnvio.clientes.email,")"]})]})]})]}),e.jsx($,{children:e.jsx(n,{variant:"ghost",onClick:()=>setOpenEnvio(null),children:"Cancelar"})})]})})]})}function ca(){const p=Ne(),{user:c}=we.useRouteContext(),[f,g]=x.useState(!1),[s,u]=x.useState(null),[d,h]=x.useState(null),[l,t]=x.useState(null),[r,i]=x.useState(null),[b,B]=x.useState("todos"),[M,ue]=x.useState(()=>new Date().toISOString().slice(0,10)),[j,X]=x.useState(null),[A,Z]=x.useState(""),[ee,ae]=x.useState(""),[se,te]=x.useState(""),[fe,oe]=x.useState(""),{data:V=[]}=le({queryKey:["mtrs-abertos"],queryFn:async()=>{const{data:a}=await k.from("mtrs").select("id, numero, descricao_residuo, cliente_id, quantidade, unidade, clientes(razao_social, nome_fantasia)").in("status",["emitido","em_transporte"]).order("data_emissao",{ascending:!1});return a??[]}}),{data:_=[],isLoading:ge}=le({queryKey:["boletins",M],queryFn:async()=>{const{data:a}=await k.from("boletins_medicao").select("*, mtrs(numero, descricao_residuo, data_emissao, data_baixa), clientes(razao_social, nome_fantasia, logradouro, cidade, cnpj, email, telefone, valor_franquia, peso_franquia, valor_kg_excedente, inscricao_municipal, transportadora)").eq("data_coleta",M).order("created_at",{ascending:!1});return a??[]}}),ie=b==="todos"?_:_.filter(a=>a.status===b),ne=a=>{const o=a.numero||a.cdf_id||`CDF-${a.data_coleta?.replace(/-/g,"")||new Date().toISOString().slice(0,10).replace(/-/g,"")}-${a.mtrs?.numero?.replace(/[^0-9]/g,"").slice(-4)||"0001"}`,m=new Date().toISOString().split("T")[0],S={razao_social:a.clientes?.razao_social||"—",nome_fantasia:a.clientes?.nome_fantasia,logradouro:a.clientes?.logradouro,cidade:a.clientes?.cidade,cnpj:a.clientes?.cnpj},w=Oe({numeroCDF:o,numeroMTR:a.mtrs?.numero||"—",dataEmissao:a.data_coleta||m,periodoInicio:a.mtrs?.data_emissao||a.data_coleta||m,periodoFim:a.mtrs?.data_baixa||a.data_coleta||m,peso:a.peso_coletado,unidade:a.unidade||"kg",cliente:S});h({blobUrl:w,numeroCDF:o})},J=W({mutationFn:async()=>{if(!j||!A)throw new Error("Preencha o peso");const a=crypto.randomUUID(),{error:o}=await k.from("boletins_medicao").insert([{owner_id:c.id,mtr_id:j.id,cliente_id:j.cliente_id,data_coleta:M,peso_coletado:Number(A),unidade:j.unidade||"kg",nome_responsavel:ee||null,assinatura_cliente:fe||null,observacoes:se||null,status:"cdf_emitido",cdf_id:a,numero:a,pagamento_confirmado:!1,cdf_enviado:!1}]);if(o)throw o;await k.from("mtrs").update({status:"destinado",quantidade:Number(A)}).eq("id",j.id)},onSuccess:()=>{p.invalidateQueries({queryKey:["boletins"]}),p.invalidateQueries({queryKey:["mtrs-abertos"]}),C.success("Coleta registrada — CDF gerado!"),g(!1),X(null),Z(""),ae(""),te(""),oe("")},onError:a=>C.error(a.message)}),K=W({mutationFn:async a=>{const{error:o}=await k.from("boletins_medicao").update({pagamento_confirmado:!0,status:"pago",data_pagamento:new Date().toISOString()}).eq("id",a);if(o)throw o},onSuccess:()=>{p.invalidateQueries({queryKey:["boletins"]}),C.success("Pagamento confirmado — CDF liberado para envio")},onError:a=>C.error(a.message)}),re=async a=>{const{error:o}=await k.from("boletins_medicao").update({cdf_enviado:!0,status:"cdf_enviado",data_envio_cdf:new Date().toISOString()}).eq("id",a.id);if(o)throw o;p.invalidateQueries({queryKey:["boletins"]})},he=async a=>{await re(a);const o=a.clientes?.nome_fantasia||a.clientes?.razao_social||"",m=a.numero||a.cdf_id||"",S=a.clientes?.telefone?.replace(/\D/g,"")||"",w=encodeURIComponent(`Olá ${o}! Segue o Certificado de Destinação Final Nº ${m} referente à coleta de resíduos realizada em ${new Date(a.data_coleta+"T12:00:00").toLocaleDateString("pt-BR")}.

Peso coletado: ${a.peso_coletado} ${a.unidade}

Qualquer dúvida, estamos à disposição.

Biologus Ambiental
(62) 3558-2791`),N=S?`https://wa.me/55${S}?text=${w}`:`https://wa.me/?text=${w}`;window.open(N,"_blank"),C.success("CDF marcado como enviado via WhatsApp"),t(null)},ve=async a=>{await re(a);const o=a.clientes?.nome_fantasia||a.clientes?.razao_social||"",m=a.numero||a.cdf_id||"",S=a.clientes?.email||"",w=encodeURIComponent(`Certificado de Destinação Final Nº ${m} - Biologus Ambiental`),N=encodeURIComponent(`Prezado(a) ${o},

Segue o Certificado de Destinação Final Nº ${m} referente à coleta de resíduos realizada em ${new Date(a.data_coleta+"T12:00:00").toLocaleDateString("pt-BR")}.

Peso coletado: ${a.peso_coletado} ${a.unidade}

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Biologus Ambiental
(62) 3558-2791
comercial@biologusambiental.com.br`);window.open(`mailto:${S}?subject=${w}&body=${N}`,"_blank"),C.success("CDF marcado como enviado via E-mail"),t(null)},H=W({mutationFn:async a=>{t(a)},onError:a=>C.error(a.message)}),U={total:_.length,coletados:_.filter(a=>a.status==="cdf_emitido").length,aguardandoPagamento:_.filter(a=>!a.pagamento_confirmado&&a.status!=="cdf_enviado").length,enviados:_.filter(a=>a.cdf_enviado).length};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold text-foreground flex items-center gap-2",children:[e.jsx(q,{className:"h-6 w-6 text-primary"})," Boletim de Medição"]}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Registre o peso coletado e a assinatura do cliente. O CDF é gerado automaticamente."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(G,{type:"date",value:M,onChange:a=>ue(a.target.value),className:"w-40"}),e.jsxs(n,{onClick:()=>g(!0),disabled:V.length===0,children:[e.jsx(ze,{className:"h-4 w-4 mr-1"})," Nova coleta"]})]})]}),e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[{label:"Total do dia",val:U.total,icon:Ae,color:"text-primary"},{label:"CDF gerado",val:U.coletados,icon:L,color:"text-teal-600"},{label:"Aguard. pagamento",val:U.aguardandoPagamento,icon:P,color:"text-amber-600"},{label:"CDF enviado",val:U.enviados,icon:v,color:"text-emerald-600"}].map(a=>e.jsx(Y,{className:"p-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-2xl font-bold",children:a.val}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:a.label})]}),e.jsx(a.icon,{className:`h-6 w-6 ${a.color}`})]})},a.label))}),e.jsx(Y,{className:"p-4 bg-muted/30",children:e.jsxs("div",{className:"flex items-center gap-2 flex-wrap text-xs text-muted-foreground",children:[e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(q,{className:"h-3.5 w-3.5 text-blue-500"})," Peso + Assinatura"]}),e.jsx("span",{children:"→"}),e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(L,{className:"h-3.5 w-3.5 text-teal-500"})," CDF gerado auto"]}),e.jsx("span",{children:"→"}),e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(P,{className:"h-3.5 w-3.5 text-amber-500"})," Confirmar pagamento"]}),e.jsx("span",{children:"→"}),e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(v,{className:"h-3.5 w-3.5 text-emerald-500"})," Enviar CDF ao cliente"]})]})}),e.jsx("div",{className:"flex gap-2 flex-wrap",children:["todos","cdf_emitido","pago","cdf_enviado"].map(a=>e.jsx("button",{onClick:()=>B(a),className:`text-xs px-3 py-1.5 rounded-full border transition-colors ${b===a?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:border-primary/40"}`,children:a==="todos"?`Todos (${_.length})`:O[a]?.label},a))}),e.jsx(Y,{children:ge?e.jsx("div",{className:"py-16 text-center",children:e.jsx(me,{className:"h-6 w-6 mx-auto animate-spin text-muted-foreground"})}):ie.length===0?e.jsxs("div",{className:"py-16 text-center",children:[e.jsx(q,{className:"h-10 w-10 mx-auto text-muted-foreground/30 mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nenhum boletim para esta data."})]}):e.jsxs(Ce,{children:[e.jsx(_e,{children:e.jsxs(de,{children:[e.jsx(D,{children:"Cliente"}),e.jsx(D,{children:"MTR"}),e.jsx(D,{children:"Peso"}),e.jsx(D,{children:"Assinatura"}),e.jsx(D,{children:"Status"}),e.jsx(D,{className:"text-right",children:"Ações"})]})}),e.jsx(Se,{children:ie.map(a=>e.jsxs(de,{children:[e.jsx(E,{className:"font-medium text-sm",children:a.clientes?.nome_fantasia||a.clientes?.razao_social||"—"}),e.jsx(E,{className:"text-sm text-muted-foreground",children:a.mtrs?.numero??"—"}),e.jsxs(E,{className:"text-sm font-semibold",children:[a.peso_coletado," ",a.unidade]}),e.jsx(E,{children:a.assinatura_cliente?e.jsxs("span",{className:"flex items-center gap-1 text-xs text-green-600",children:[e.jsx(ce,{className:"h-3.5 w-3.5"})," Assinado"]}):e.jsx("span",{className:"text-xs text-muted-foreground",children:"Sem assinatura"})}),e.jsx(E,{children:e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${O[a.status]?.color??"bg-gray-100 text-gray-700"}`,children:O[a.status]?.label??a.status})}),e.jsx(E,{children:e.jsxs("div",{className:"flex items-center justify-end gap-1",children:[e.jsx(n,{variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>u(a),children:e.jsx(pe,{className:"h-4 w-4"})}),!a.pagamento_confirmado&&e.jsxs(n,{size:"sm",variant:"outline",className:"h-8 text-xs gap-1 text-amber-700 border-amber-300 hover:bg-amber-50",onClick:()=>K.mutate(a.id),disabled:K.isPending,children:[e.jsx(P,{className:"h-3.5 w-3.5"})," Confirmar pgto"]}),e.jsxs(n,{size:"sm",variant:"outline",className:"h-8 text-xs gap-1 text-teal-700 border-teal-300 hover:bg-teal-50",onClick:()=>ne(a),children:[e.jsx(L,{className:"h-3.5 w-3.5"})," Ver CDF"]}),e.jsxs(n,{size:"sm",variant:"outline",className:"h-8 text-xs gap-1 text-blue-700 border-blue-300 hover:bg-blue-50",onClick:()=>i(a),children:[e.jsx(FileText,{className:"h-3.5 w-3.5"})," NFS-e"]}),a.pagamento_confirmado&&!a.cdf_enviado&&e.jsxs(n,{size:"sm",className:"h-8 text-xs gap-1",onClick:()=>H.mutate(a),disabled:H.isPending,children:[e.jsx(v,{className:"h-3.5 w-3.5"})," Enviar CDF"]})]})})]},a.id))})]})}),e.jsx(F,{open:f,onOpenChange:g,children:e.jsxs(R,{className:"max-w-lg max-h-[90vh] overflow-y-auto",children:[e.jsx(z,{children:e.jsxs(T,{className:"flex items-center gap-2",children:[e.jsx(q,{className:"h-5 w-5 text-primary"})," Registrar Coleta"]})}),e.jsxs("div",{className:"space-y-5 py-2",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(I,{children:"MTR *"}),e.jsxs(ke,{onValueChange:a=>X(V.find(o=>o.id===a)??null),children:[e.jsx(De,{children:e.jsx(Ee,{placeholder:"Selecione o MTR"})}),e.jsx(Fe,{children:V.map(a=>e.jsxs(Re,{value:a.id,children:[a.numero," — ",a.clientes?.nome_fantasia||a.clientes?.razao_social]},a.id))})]}),j&&e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-xs space-y-1",children:[e.jsxs("p",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Resíduo:"})," ",j.descricao_residuo]}),e.jsxs("p",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Cliente:"})," ",j.clientes?.nome_fantasia||j.clientes?.razao_social]})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(I,{children:"Peso coletado (kg) *"}),e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsx(G,{type:"number",step:"0.001",min:"0",placeholder:"0.000",value:A,onChange:a=>Z(a.target.value),className:"text-lg font-semibold"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"kg"})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(I,{children:"Nome do responsável (opcional)"}),e.jsx(G,{placeholder:"Quem assinou no cliente",value:ee,onChange:a=>ae(a.target.value)})]}),e.jsx(Be,{onChange:oe}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(I,{children:"Observações (opcional)"}),e.jsx(G,{placeholder:"Ex: embalagem danificada...",value:se,onChange:a=>te(a.target.value)})]}),e.jsxs("div",{className:"bg-teal-50 border border-teal-200 rounded-md p-3 text-xs text-teal-800 flex items-start gap-2",children:[e.jsx(L,{className:"h-4 w-4 mt-0.5 flex-shrink-0"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"CDF gerado automaticamente"}),e.jsx("p",{className:"mt-0.5 opacity-80",children:"O certificado fica disponível para visualização imediatamente após o registro."})]})]})]}),e.jsxs($,{children:[e.jsx(n,{variant:"ghost",onClick:()=>g(!1),children:"Cancelar"}),e.jsxs(n,{onClick:()=>J.mutate(),disabled:J.isPending||!j||!A,children:[J.isPending&&e.jsx(me,{className:"h-4 w-4 mr-2 animate-spin"}),e.jsx(q,{className:"h-4 w-4 mr-2"})," Registrar coleta"]})]})]})}),s&&e.jsx(F,{open:!!s,onOpenChange:()=>u(null),children:e.jsxs(R,{className:"max-w-lg max-h-[90vh] overflow-y-auto",children:[e.jsx(z,{children:e.jsx(T,{children:"Boletim de Medição"})}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-sm",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Cliente"}),e.jsx("p",{className:"font-medium",children:s.clientes?.nome_fantasia||s.clientes?.razao_social})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"MTR"}),e.jsx("p",{className:"font-medium",children:s.mtrs?.numero})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Data"}),e.jsx("p",{className:"font-medium",children:new Date(s.data_coleta+"T12:00:00").toLocaleDateString("pt-BR")})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Peso"}),e.jsxs("p",{className:"font-bold text-primary",children:[s.peso_coletado," ",s.unidade]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Responsável"}),e.jsx("p",{className:"font-medium",children:s.nome_responsavel||"—"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Status"}),e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${O[s.status]?.color}`,children:O[s.status]?.label})]})]}),s.assinatura_cliente&&e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground mb-1",children:"Assinatura do cliente"}),e.jsx("div",{className:"border rounded-md p-2 bg-white",children:e.jsx("img",{src:s.assinatura_cliente,alt:"Assinatura",className:"max-h-24 w-full object-contain"})})]}),s.observacoes&&e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Observações"}),e.jsx("p",{className:"text-sm",children:s.observacoes})]}),e.jsxs("div",{className:"border-t pt-4 space-y-2",children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Status do pagamento"}),s.pagamento_confirmado?e.jsxs("p",{className:"text-sm text-green-600 flex items-center gap-1",children:[e.jsx(ce,{className:"h-4 w-4"})," Pagamento confirmado"]}):e.jsxs("p",{className:"text-sm text-amber-600 flex items-center gap-1",children:[e.jsx(P,{className:"h-4 w-4"})," Aguardando pagamento"]}),s.cdf_enviado?e.jsxs("p",{className:"text-sm text-emerald-600 flex items-center gap-1",children:[e.jsx(v,{className:"h-4 w-4"})," CDF enviado em ",s.data_envio_cdf?new Date(s.data_envio_cdf).toLocaleDateString("pt-BR"):"—"]}):e.jsxs("p",{className:"text-sm text-muted-foreground flex items-center gap-1",children:[e.jsx(ye,{className:"h-4 w-4"})," CDF ainda não enviado"]})]})]}),e.jsxs($,{children:[!s.pagamento_confirmado&&e.jsxs(n,{variant:"outline",className:"text-amber-700 border-amber-300",onClick:()=>{K.mutate(s.id),u(null)},children:[e.jsx(P,{className:"h-4 w-4 mr-1"})," Confirmar pagamento"]}),(s.cdf_id||s.numero||s.mtrs?.numero)&&e.jsxs(n,{variant:"outline",onClick:()=>{ne(s),u(null)},children:[e.jsx(pe,{className:"h-4 w-4 mr-1"})," Visualizar CDF"]}),s.pagamento_confirmado&&!s.cdf_enviado&&e.jsxs(n,{onClick:()=>{H.mutate(s),u(null)},children:[e.jsx(v,{className:"h-4 w-4 mr-1"})," Enviar CDF"]}),e.jsx(n,{variant:"ghost",onClick:()=>u(null),children:"Fechar"})]})]})}),e.jsx(F,{open:!!d,onOpenChange:a=>{!a&&d?.blobUrl&&URL.revokeObjectURL(d.blobUrl),a||h(null)},children:e.jsxs(R,{className:"max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0",children:[e.jsx(z,{className:"px-6 py-4 border-b flex-shrink-0",children:e.jsxs(T,{className:"flex items-center gap-2",children:[e.jsx(L,{className:"h-5 w-5 text-green-600"}),"Certificado de Destinação Final — Nº ",d?.numeroCDF]})}),e.jsx("div",{className:"flex-1 overflow-hidden",children:d&&e.jsx("iframe",{src:d.blobUrl,className:"w-full h-full border-0",title:`CDF ${d.numeroCDF}`})}),e.jsxs("div",{className:"px-6 py-3 border-t flex-shrink-0 flex justify-between items-center bg-muted/30",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:'Use o botão "Imprimir / Salvar PDF" dentro do documento para exportar'}),e.jsx(n,{variant:"outline",size:"sm",onClick:()=>{d?.blobUrl&&URL.revokeObjectURL(d.blobUrl),h(null)},children:"Fechar"})]})]})}),l&&e.jsx(F,{open:!!l,onOpenChange:a=>!a&&t(null),children:e.jsxs(R,{className:"max-w-sm",children:[e.jsx(z,{children:e.jsxs(T,{className:"flex items-center gap-2",children:[e.jsx(v,{className:"h-5 w-5 text-primary"}),"Enviar CDF — ",l.numero||l.cdf_id]})}),e.jsxs("div",{className:"space-y-3 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Cliente: ",e.jsx("strong",{children:l.clientes?.nome_fantasia||l.clientes?.razao_social})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Escolha como enviar o certificado:"}),e.jsxs("div",{className:"grid gap-3",children:[e.jsxs(n,{className:"w-full gap-2 bg-green-500 hover:bg-green-600",onClick:()=>he(l),children:[e.jsx(v,{className:"h-4 w-4"}),"Enviar por WhatsApp",l.clientes?.telefone&&e.jsxs("span",{className:"text-xs opacity-80",children:["(",l.clientes.telefone,")"]})]}),e.jsxs(n,{variant:"outline",className:"w-full gap-2",onClick:()=>ve(l),children:[e.jsx(v,{className:"h-4 w-4"}),"Enviar por E-mail",l.clientes?.email&&e.jsxs("span",{className:"text-xs text-muted-foreground",children:["(",l.clientes.email,")"]})]})]})]}),e.jsx($,{children:e.jsx(n,{variant:"ghost",onClick:()=>t(null),children:"Cancelar"})})]})}),r&&(()=>{const a=r,o=$e(a.clientes?.transportadora),m=Ie(a.peso_coletado,{valor_franquia:a.clientes?.valor_franquia,peso_franquia:a.clientes?.peso_franquia,valor_kg_excedente:a.clientes?.valor_kg_excedente}),w=`COLETA, TRANSPORTE, TRATAMENTO E DESTINACAO DE RESIDUOS PERIGOSOS REFERENTE AO MES DE ${new Date(a.data_coleta+"T12:00:00").toLocaleDateString("pt-BR",{month:"long",year:"numeric"}).toUpperCase()}`,N=y=>y.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}),be=m.valorTotal*o.aliquotaISSQN/100,je=y=>{navigator.clipboard.writeText(y),C.success("Copiado!")};return e.jsx(F,{open:!!r,onOpenChange:y=>!y&&i(null),children:e.jsxs(R,{className:"max-w-2xl max-h-[90vh] overflow-y-auto",children:[e.jsx(z,{children:e.jsxs(T,{className:"flex items-center gap-2",children:[e.jsx(FileText,{className:"h-5 w-5 text-blue-600"}),"Emitir NFS-e — ",a.clientes?.nome_fantasia||a.clientes?.razao_social]})}),e.jsxs("div",{className:"space-y-4 py-2",children:[m.valorTotal===0&&e.jsx("div",{className:"bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800",children:"⚠️ Valores do contrato não cadastrados. Configure em Clientes → editar cliente."}),e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2",children:[e.jsx("p",{className:"text-sm font-semibold text-blue-900",children:"Cálculo do valor"}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 text-xs",children:[e.jsx("span",{className:"text-muted-foreground",children:"Peso coletado:"}),e.jsxs("span",{className:"font-medium",children:[a.peso_coletado," ",a.unidade]}),e.jsx("span",{className:"text-muted-foreground",children:"Franquia:"}),e.jsxs("span",{className:"font-medium",children:[N(m.valorBase)," (",a.clientes?.peso_franquia||0," kg)"]}),m.pesoExcedente>0&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-muted-foreground",children:"Excedente:"}),e.jsxs("span",{className:"font-medium text-orange-600",children:[m.pesoExcedente.toFixed(3)," kg × ",N(a.clientes?.valor_kg_excedente||0)," = ",N(m.valorExcedente)]})]}),e.jsx("span",{className:"text-muted-foreground font-semibold",children:"Valor total:"}),e.jsx("span",{className:"font-bold text-blue-700 text-sm",children:N(m.valorTotal)}),e.jsxs("span",{className:"text-muted-foreground",children:["ISSQN (",o.aliquotaISSQN,"%):"]}),e.jsx("span",{className:"font-medium",children:N(be)})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("p",{className:"text-sm font-semibold",children:"Dados para preencher no portal"}),[{label:"Tomador — CNPJ/CPF",value:a.clientes?.cnpj||""},{label:"Tomador — Razão Social",value:a.clientes?.razao_social||""},{label:"Tomador — Inscrição Municipal",value:a.clientes?.inscricao_municipal||"Não informado"},{label:"Código do Serviço",value:"07.09.01"},{label:"Descrição do Serviço",value:w},{label:"Valor do Serviço (R$)",value:m.valorTotal.toFixed(2).replace(".",",")},{label:"Competência",value:new Date(a.data_coleta+"T12:00:00").toLocaleDateString("pt-BR",{month:"2-digit",year:"numeric"})}].map(({label:y,value:Q})=>e.jsxs("div",{className:"flex items-start justify-between gap-3 p-2.5 bg-muted/30 rounded-md border",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs text-muted-foreground mb-0.5",children:y}),e.jsx("p",{className:"text-sm font-medium break-all",children:Q})]}),Q&&Q!=="Não informado"&&e.jsx(n,{variant:"ghost",size:"sm",className:"h-7 px-2 flex-shrink-0",onClick:()=>je(Q),children:"Copiar"})]},y))]}),e.jsxs("div",{className:"text-xs text-muted-foreground bg-muted/20 rounded-md p-3",children:[e.jsxs("p",{className:"font-medium mb-1",children:["Prestador: ",o.fantasia]}),e.jsxs("p",{children:["CNPJ: ",o.cnpj," | IM: ",o.inscricaoMunicipal]}),e.jsxs("p",{children:["Regime: ",o.regime," | ISSQN: ",o.aliquotaISSQN,"%"]})]})]}),e.jsxs($,{children:[e.jsx(n,{variant:"ghost",onClick:()=>i(null),children:"Fechar"}),e.jsxs(n,{className:"gap-2 bg-blue-600 hover:bg-blue-700",onClick:()=>window.open("https://www.isspnetonline.com.br/goiania/online/","_blank"),children:[e.jsx(FileText,{className:"h-4 w-4"})," Abrir Portal NFS-e"]})]})]})})})()]})}export{ca as component};
