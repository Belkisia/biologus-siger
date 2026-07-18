import{d as de,m as fe,a6 as ge,r as p,n as oe,s as _,o as K,t as w,j as e,i as S,I,B as r,K as g,C as H,a as ne,y as he}from"./index-BtmPAlC_.js";import{L as A}from"./label-yK_mkRib.js";import{D as $,a as P,b as T,c as L,d as B}from"./dialog-CxuoFkFd.js";import{T as ve,a as be,b as re,c as k,d as je,e as D}from"./table-BeVClJjf.js";import{S as ye,a as we,d as Ne,b as Ce,c as _e}from"./select-CYi40ygX.js";import{P as ke}from"./plus-DCY1jk1b.js";import{F as z}from"./file-check-DwHBVJy5.js";import{D as F}from"./dollar-sign-BzolPge6.js";import{L as le}from"./loader-circle-Dx2rZTkX.js";import{E as ce}from"./eye-CQtKqbra.js";import"./index-Cxxp5ICW.js";import"./index-Dp95fEtH.js";import"./index-DvgpG2xJ.js";import"./index-DvNuWhcb.js";import"./index-CrmUEuRE.js";import"./index-C2lGiFha.js";import"./index-Cb8Dp5Kj.js";import"./index-RrM3Lt2d.js";import"./index-B0BPPmPN.js";import"./index-DIHX5hqv.js";import"./check-DgFBxzTW.js";const De=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]],Ee=de("clipboard-check",De);const Se=[["path",{d:"M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21",key:"g5wo59"}],["path",{d:"m5.082 11.09 8.828 8.828",key:"1wx5vj"}]],ze=de("eraser",Se),R={pendente:{label:"Pendente",color:"bg-gray-100 text-gray-700"},coletado:{label:"Coletado",color:"bg-blue-100 text-blue-800"},pago:{label:"Pago",color:"bg-green-100 text-green-800"},cdf_emitido:{label:"CDF Emitido",color:"bg-teal-100 text-teal-800"},cdf_enviado:{label:"CDF Enviado ✓",color:"bg-emerald-100 text-emerald-800"}};function Fe(m){const{numeroCDF:c,numeroMTR:h,dataEmissao:x,periodoInicio:s,periodoFim:u,peso:d,unidade:b,cliente:n}=m,t=o=>o?new Date(o+"T12:00:00").toLocaleDateString("pt-BR"):"—",i=`https://biologus-siger.vercel.app/verificar-cdf/${c}`;return`<!DOCTYPE html>
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
    <span class="mtr-val">${h}</span>
    <div class="mtr-sep"></div>
    <span class="mtr-label">Data de emissão</span>
    <div class="mtr-sep"></div>
    <span class="mtr-val" style="font-size:13px;color:#374151;font-family:'Inter',sans-serif;font-weight:500;">${t(x)}</span>
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
        <div class="irow"><span class="lbl">Razão Social</span><span class="val">${n.razao_social}</span></div>
        <div class="irow"><span class="lbl">CNPJ</span><span class="val">${n.cnpj||"—"}</span></div>
        <div class="irow"><span class="lbl">Endereço</span><span class="val">${n.logradouro||"—"}${n.cidade?`, ${n.cidade}`:""}</span></div>
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
            <div><span class="mtr-tag">${h}</span></div>
          </td>
          <td style="text-align:center">
            <div class="qty-big">${String(d).replace(".",",")}</div>
            <div class="qty-kg">${b}</div>
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
    text: "${i}",
    width: 64, height: 64,
    colorDark: "#0a2e1a",
    colorLight: "#f0faf3",
    correctLevel: QRCode.CorrectLevel.M
  });
<\/script>
</body>
</html>`}function Re(m){const c=Fe(m),h=new Blob([c],{type:"text/html;charset=utf-8"});return URL.createObjectURL(h)}function Ae({onChange:m}){const c=p.useRef(null),h=p.useRef(!1),x=p.useRef({x:0,y:0}),s=(t,i)=>{const o=i.getBoundingClientRect(),f=i.width/o.width,O=i.height/o.height;return"touches"in t?{x:(t.touches[0].clientX-o.left)*f,y:(t.touches[0].clientY-o.top)*O}:{x:(t.clientX-o.left)*f,y:(t.clientY-o.top)*O}},u=t=>{t.preventDefault();const i=c.current;i&&(h.current=!0,x.current=s(t,i))},d=t=>{if(t.preventDefault(),!h.current)return;const i=c.current;if(!i)return;const o=i.getContext("2d");if(!o)return;const f=s(t,i);o.beginPath(),o.moveTo(x.current.x,x.current.y),o.lineTo(f.x,f.y),o.strokeStyle="#0D9488",o.lineWidth=2.5,o.lineCap="round",o.lineJoin="round",o.stroke(),x.current=f},b=t=>{t.preventDefault(),h.current=!1;const i=c.current;i&&m(i.toDataURL("image/png"))},n=()=>{const t=c.current;if(!t)return;const i=t.getContext("2d");i&&(i.clearRect(0,0,t.width,t.height),m(""))};return e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(A,{className:"text-sm font-medium",children:"Assinatura do responsável"}),e.jsxs(r,{type:"button",variant:"ghost",size:"sm",onClick:n,className:"h-7 text-xs gap-1",children:[e.jsx(ze,{className:"h-3 w-3"})," Limpar"]})]}),e.jsx("div",{className:"border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20 touch-none",children:e.jsx("canvas",{ref:c,width:600,height:160,className:"w-full h-32 cursor-crosshair",onMouseDown:u,onMouseMove:d,onMouseUp:b,onMouseLeave:b,onTouchStart:u,onTouchMove:d,onTouchEnd:b})}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Assine acima com o dedo ou mouse"}),openEnvio&&e.jsx($,{open:!!openEnvio,onOpenChange:t=>!t&&setOpenEnvio(null),children:e.jsxs(P,{className:"max-w-sm",children:[e.jsx(T,{children:e.jsxs(L,{className:"flex items-center gap-2",children:[e.jsx(g,{className:"h-5 w-5 text-primary"}),"Enviar CDF — ",openEnvio.numero||openEnvio.cdf_id]})}),e.jsxs("div",{className:"space-y-3 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Cliente: ",e.jsx("strong",{children:openEnvio.clientes?.nome_fantasia||openEnvio.clientes?.razao_social})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Escolha como enviar o certificado:"}),e.jsxs("div",{className:"grid gap-3",children:[e.jsxs(r,{className:"w-full gap-2 bg-green-500 hover:bg-green-600",onClick:()=>enviarWhatsApp(openEnvio),children:[e.jsx(g,{className:"h-4 w-4"}),"Enviar por WhatsApp",openEnvio.clientes?.telefone&&e.jsxs("span",{className:"text-xs opacity-80",children:["(",openEnvio.clientes.telefone,")"]})]}),e.jsxs(r,{variant:"outline",className:"w-full gap-2",onClick:()=>enviarEmail(openEnvio),children:[e.jsx(g,{className:"h-4 w-4"}),"Enviar por E-mail",openEnvio.clientes?.email&&e.jsxs("span",{className:"text-xs text-muted-foreground",children:["(",openEnvio.clientes.email,")"]})]})]})]}),e.jsx(B,{children:e.jsx(r,{variant:"ghost",onClick:()=>setOpenEnvio(null),children:"Cancelar"})})]})})]})}function aa(){const m=fe(),{user:c}=ge.useRouteContext(),[h,x]=p.useState(!1),[s,u]=p.useState(null),[d,b]=p.useState(null),[n,t]=p.useState(null),[i,o]=p.useState("todos"),[f,O]=p.useState(()=>new Date().toISOString().slice(0,10)),[v,J]=p.useState(null),[E,W]=p.useState(""),[Y,X]=p.useState(""),[Z,ee]=p.useState(""),[pe,ae]=p.useState(""),{data:M=[]}=oe({queryKey:["mtrs-abertos"],queryFn:async()=>{const{data:a}=await _.from("mtrs").select("id, numero, descricao_residuo, cliente_id, quantidade, unidade, clientes(razao_social, nome_fantasia)").in("status",["emitido","em_transporte"]).order("data_emissao",{ascending:!1});return a??[]}}),{data:y=[],isLoading:me}=oe({queryKey:["boletins",f],queryFn:async()=>{const{data:a}=await _.from("boletins_medicao").select("*, mtrs(numero, descricao_residuo, data_emissao, data_baixa), clientes(razao_social, nome_fantasia, logradouro, cidade, cnpj, email, telefone)").eq("data_coleta",f).order("created_at",{ascending:!1});return a??[]}}),se=i==="todos"?y:y.filter(a=>a.status===i),te=a=>{const l=a.numero||a.cdf_id||`CDF-${a.data_coleta?.replace(/-/g,"")||new Date().toISOString().slice(0,10).replace(/-/g,"")}-${a.mtrs?.numero?.replace(/[^0-9]/g,"").slice(-4)||"0001"}`,j=new Date().toISOString().split("T")[0],N={razao_social:a.clientes?.razao_social||"—",nome_fantasia:a.clientes?.nome_fantasia,logradouro:a.clientes?.logradouro,cidade:a.clientes?.cidade,cnpj:a.clientes?.cnpj},C=Re({numeroCDF:l,numeroMTR:a.mtrs?.numero||"—",dataEmissao:a.data_coleta||j,periodoInicio:a.mtrs?.data_emissao||a.data_coleta||j,periodoFim:a.mtrs?.data_baixa||a.data_coleta||j,peso:a.peso_coletado,unidade:a.unidade||"kg",cliente:N});b({blobUrl:C,numeroCDF:l})},U=K({mutationFn:async()=>{if(!v||!E)throw new Error("Preencha o peso");const a=crypto.randomUUID(),{error:l}=await _.from("boletins_medicao").insert([{owner_id:c.id,mtr_id:v.id,cliente_id:v.cliente_id,data_coleta:f,peso_coletado:Number(E),unidade:v.unidade||"kg",nome_responsavel:Y||null,assinatura_cliente:pe||null,observacoes:Z||null,status:"cdf_emitido",cdf_id:a,numero:a,pagamento_confirmado:!1,cdf_enviado:!1}]);if(l)throw l;await _.from("mtrs").update({status:"destinado",quantidade:Number(E)}).eq("id",v.id)},onSuccess:()=>{m.invalidateQueries({queryKey:["boletins"]}),m.invalidateQueries({queryKey:["mtrs-abertos"]}),w.success("Coleta registrada — CDF gerado!"),x(!1),J(null),W(""),X(""),ee(""),ae("")},onError:a=>w.error(a.message)}),Q=K({mutationFn:async a=>{const{error:l}=await _.from("boletins_medicao").update({pagamento_confirmado:!0,status:"pago",data_pagamento:new Date().toISOString()}).eq("id",a);if(l)throw l},onSuccess:()=>{m.invalidateQueries({queryKey:["boletins"]}),w.success("Pagamento confirmado — CDF liberado para envio")},onError:a=>w.error(a.message)}),ie=async a=>{const{error:l}=await _.from("boletins_medicao").update({cdf_enviado:!0,status:"cdf_enviado",data_envio_cdf:new Date().toISOString()}).eq("id",a.id);if(l)throw l;m.invalidateQueries({queryKey:["boletins"]})},xe=async a=>{await ie(a);const l=a.clientes?.nome_fantasia||a.clientes?.razao_social||"",j=a.numero||a.cdf_id||"",N=a.clientes?.telefone?.replace(/\D/g,"")||"",C=encodeURIComponent(`Olá ${l}! Segue o Certificado de Destinação Final Nº ${j} referente à coleta de resíduos realizada em ${new Date(a.data_coleta+"T12:00:00").toLocaleDateString("pt-BR")}.

Peso coletado: ${a.peso_coletado} ${a.unidade}

Qualquer dúvida, estamos à disposição.

Biologus Ambiental
(62) 3558-2791`),V=N?`https://wa.me/55${N}?text=${C}`:`https://wa.me/?text=${C}`;window.open(V,"_blank"),w.success("CDF marcado como enviado via WhatsApp"),t(null)},ue=async a=>{await ie(a);const l=a.clientes?.nome_fantasia||a.clientes?.razao_social||"",j=a.numero||a.cdf_id||"",N=a.clientes?.email||"",C=encodeURIComponent(`Certificado de Destinação Final Nº ${j} - Biologus Ambiental`),V=encodeURIComponent(`Prezado(a) ${l},

Segue o Certificado de Destinação Final Nº ${j} referente à coleta de resíduos realizada em ${new Date(a.data_coleta+"T12:00:00").toLocaleDateString("pt-BR")}.

Peso coletado: ${a.peso_coletado} ${a.unidade}

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Biologus Ambiental
(62) 3558-2791
comercial@biologusambiental.com.br`);window.open(`mailto:${N}?subject=${C}&body=${V}`,"_blank"),w.success("CDF marcado como enviado via E-mail"),t(null)},G=K({mutationFn:async a=>{t(a)},onError:a=>w.error(a.message)}),q={total:y.length,coletados:y.filter(a=>a.status==="cdf_emitido").length,aguardandoPagamento:y.filter(a=>!a.pagamento_confirmado&&a.status!=="cdf_enviado").length,enviados:y.filter(a=>a.cdf_enviado).length};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold text-foreground flex items-center gap-2",children:[e.jsx(S,{className:"h-6 w-6 text-primary"})," Boletim de Medição"]}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Registre o peso coletado e a assinatura do cliente. O CDF é gerado automaticamente."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(I,{type:"date",value:f,onChange:a=>O(a.target.value),className:"w-40"}),e.jsxs(r,{onClick:()=>x(!0),disabled:M.length===0,children:[e.jsx(ke,{className:"h-4 w-4 mr-1"})," Nova coleta"]})]})]}),e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[{label:"Total do dia",val:q.total,icon:Ee,color:"text-primary"},{label:"CDF gerado",val:q.coletados,icon:z,color:"text-teal-600"},{label:"Aguard. pagamento",val:q.aguardandoPagamento,icon:F,color:"text-amber-600"},{label:"CDF enviado",val:q.enviados,icon:g,color:"text-emerald-600"}].map(a=>e.jsx(H,{className:"p-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-2xl font-bold",children:a.val}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:a.label})]}),e.jsx(a.icon,{className:`h-6 w-6 ${a.color}`})]})},a.label))}),e.jsx(H,{className:"p-4 bg-muted/30",children:e.jsxs("div",{className:"flex items-center gap-2 flex-wrap text-xs text-muted-foreground",children:[e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(S,{className:"h-3.5 w-3.5 text-blue-500"})," Peso + Assinatura"]}),e.jsx("span",{children:"→"}),e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(z,{className:"h-3.5 w-3.5 text-teal-500"})," CDF gerado auto"]}),e.jsx("span",{children:"→"}),e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(F,{className:"h-3.5 w-3.5 text-amber-500"})," Confirmar pagamento"]}),e.jsx("span",{children:"→"}),e.jsxs("span",{className:"flex items-center gap-1 font-medium text-foreground",children:[e.jsx(g,{className:"h-3.5 w-3.5 text-emerald-500"})," Enviar CDF ao cliente"]})]})}),e.jsx("div",{className:"flex gap-2 flex-wrap",children:["todos","cdf_emitido","pago","cdf_enviado"].map(a=>e.jsx("button",{onClick:()=>o(a),className:`text-xs px-3 py-1.5 rounded-full border transition-colors ${i===a?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:border-primary/40"}`,children:a==="todos"?`Todos (${y.length})`:R[a]?.label},a))}),e.jsx(H,{children:me?e.jsx("div",{className:"py-16 text-center",children:e.jsx(le,{className:"h-6 w-6 mx-auto animate-spin text-muted-foreground"})}):se.length===0?e.jsxs("div",{className:"py-16 text-center",children:[e.jsx(S,{className:"h-10 w-10 mx-auto text-muted-foreground/30 mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nenhum boletim para esta data."})]}):e.jsxs(ve,{children:[e.jsx(be,{children:e.jsxs(re,{children:[e.jsx(k,{children:"Cliente"}),e.jsx(k,{children:"MTR"}),e.jsx(k,{children:"Peso"}),e.jsx(k,{children:"Assinatura"}),e.jsx(k,{children:"Status"}),e.jsx(k,{className:"text-right",children:"Ações"})]})}),e.jsx(je,{children:se.map(a=>e.jsxs(re,{children:[e.jsx(D,{className:"font-medium text-sm",children:a.clientes?.nome_fantasia||a.clientes?.razao_social||"—"}),e.jsx(D,{className:"text-sm text-muted-foreground",children:a.mtrs?.numero??"—"}),e.jsxs(D,{className:"text-sm font-semibold",children:[a.peso_coletado," ",a.unidade]}),e.jsx(D,{children:a.assinatura_cliente?e.jsxs("span",{className:"flex items-center gap-1 text-xs text-green-600",children:[e.jsx(ne,{className:"h-3.5 w-3.5"})," Assinado"]}):e.jsx("span",{className:"text-xs text-muted-foreground",children:"Sem assinatura"})}),e.jsx(D,{children:e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${R[a.status]?.color??"bg-gray-100 text-gray-700"}`,children:R[a.status]?.label??a.status})}),e.jsx(D,{children:e.jsxs("div",{className:"flex items-center justify-end gap-1",children:[e.jsx(r,{variant:"ghost",size:"icon",className:"h-8 w-8",onClick:()=>u(a),children:e.jsx(ce,{className:"h-4 w-4"})}),!a.pagamento_confirmado&&e.jsxs(r,{size:"sm",variant:"outline",className:"h-8 text-xs gap-1 text-amber-700 border-amber-300 hover:bg-amber-50",onClick:()=>Q.mutate(a.id),disabled:Q.isPending,children:[e.jsx(F,{className:"h-3.5 w-3.5"})," Confirmar pgto"]}),e.jsxs(r,{size:"sm",variant:"outline",className:"h-8 text-xs gap-1 text-teal-700 border-teal-300 hover:bg-teal-50",onClick:()=>te(a),children:[e.jsx(z,{className:"h-3.5 w-3.5"})," Ver CDF"]}),a.pagamento_confirmado&&!a.cdf_enviado&&e.jsxs(r,{size:"sm",className:"h-8 text-xs gap-1",onClick:()=>G.mutate(a),disabled:G.isPending,children:[e.jsx(g,{className:"h-3.5 w-3.5"})," Enviar CDF"]})]})})]},a.id))})]})}),e.jsx($,{open:h,onOpenChange:x,children:e.jsxs(P,{className:"max-w-lg max-h-[90vh] overflow-y-auto",children:[e.jsx(T,{children:e.jsxs(L,{className:"flex items-center gap-2",children:[e.jsx(S,{className:"h-5 w-5 text-primary"})," Registrar Coleta"]})}),e.jsxs("div",{className:"space-y-5 py-2",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(A,{children:"MTR *"}),e.jsxs(ye,{onValueChange:a=>J(M.find(l=>l.id===a)??null),children:[e.jsx(we,{children:e.jsx(Ne,{placeholder:"Selecione o MTR"})}),e.jsx(Ce,{children:M.map(a=>e.jsxs(_e,{value:a.id,children:[a.numero," — ",a.clientes?.nome_fantasia||a.clientes?.razao_social]},a.id))})]}),v&&e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-xs space-y-1",children:[e.jsxs("p",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Resíduo:"})," ",v.descricao_residuo]}),e.jsxs("p",{children:[e.jsx("span",{className:"text-muted-foreground",children:"Cliente:"})," ",v.clientes?.nome_fantasia||v.clientes?.razao_social]})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(A,{children:"Peso coletado (kg) *"}),e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsx(I,{type:"number",step:"0.001",min:"0",placeholder:"0.000",value:E,onChange:a=>W(a.target.value),className:"text-lg font-semibold"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"kg"})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(A,{children:"Nome do responsável (opcional)"}),e.jsx(I,{placeholder:"Quem assinou no cliente",value:Y,onChange:a=>X(a.target.value)})]}),e.jsx(Ae,{onChange:ae}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(A,{children:"Observações (opcional)"}),e.jsx(I,{placeholder:"Ex: embalagem danificada...",value:Z,onChange:a=>ee(a.target.value)})]}),e.jsxs("div",{className:"bg-teal-50 border border-teal-200 rounded-md p-3 text-xs text-teal-800 flex items-start gap-2",children:[e.jsx(z,{className:"h-4 w-4 mt-0.5 flex-shrink-0"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"CDF gerado automaticamente"}),e.jsx("p",{className:"mt-0.5 opacity-80",children:"O certificado fica disponível para visualização imediatamente após o registro."})]})]})]}),e.jsxs(B,{children:[e.jsx(r,{variant:"ghost",onClick:()=>x(!1),children:"Cancelar"}),e.jsxs(r,{onClick:()=>U.mutate(),disabled:U.isPending||!v||!E,children:[U.isPending&&e.jsx(le,{className:"h-4 w-4 mr-2 animate-spin"}),e.jsx(S,{className:"h-4 w-4 mr-2"})," Registrar coleta"]})]})]})}),s&&e.jsx($,{open:!!s,onOpenChange:()=>u(null),children:e.jsxs(P,{className:"max-w-lg max-h-[90vh] overflow-y-auto",children:[e.jsx(T,{children:e.jsx(L,{children:"Boletim de Medição"})}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-sm",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Cliente"}),e.jsx("p",{className:"font-medium",children:s.clientes?.nome_fantasia||s.clientes?.razao_social})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"MTR"}),e.jsx("p",{className:"font-medium",children:s.mtrs?.numero})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Data"}),e.jsx("p",{className:"font-medium",children:new Date(s.data_coleta+"T12:00:00").toLocaleDateString("pt-BR")})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Peso"}),e.jsxs("p",{className:"font-bold text-primary",children:[s.peso_coletado," ",s.unidade]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Responsável"}),e.jsx("p",{className:"font-medium",children:s.nome_responsavel||"—"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Status"}),e.jsx("span",{className:`text-xs px-2 py-0.5 rounded-full font-medium ${R[s.status]?.color}`,children:R[s.status]?.label})]})]}),s.assinatura_cliente&&e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground mb-1",children:"Assinatura do cliente"}),e.jsx("div",{className:"border rounded-md p-2 bg-white",children:e.jsx("img",{src:s.assinatura_cliente,alt:"Assinatura",className:"max-h-24 w-full object-contain"})})]}),s.observacoes&&e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Observações"}),e.jsx("p",{className:"text-sm",children:s.observacoes})]}),e.jsxs("div",{className:"border-t pt-4 space-y-2",children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Status do pagamento"}),s.pagamento_confirmado?e.jsxs("p",{className:"text-sm text-green-600 flex items-center gap-1",children:[e.jsx(ne,{className:"h-4 w-4"})," Pagamento confirmado"]}):e.jsxs("p",{className:"text-sm text-amber-600 flex items-center gap-1",children:[e.jsx(F,{className:"h-4 w-4"})," Aguardando pagamento"]}),s.cdf_enviado?e.jsxs("p",{className:"text-sm text-emerald-600 flex items-center gap-1",children:[e.jsx(g,{className:"h-4 w-4"})," CDF enviado em ",s.data_envio_cdf?new Date(s.data_envio_cdf).toLocaleDateString("pt-BR"):"—"]}):e.jsxs("p",{className:"text-sm text-muted-foreground flex items-center gap-1",children:[e.jsx(he,{className:"h-4 w-4"})," CDF ainda não enviado"]})]})]}),e.jsxs(B,{children:[!s.pagamento_confirmado&&e.jsxs(r,{variant:"outline",className:"text-amber-700 border-amber-300",onClick:()=>{Q.mutate(s.id),u(null)},children:[e.jsx(F,{className:"h-4 w-4 mr-1"})," Confirmar pagamento"]}),(s.cdf_id||s.numero||s.mtrs?.numero)&&e.jsxs(r,{variant:"outline",onClick:()=>{te(s),u(null)},children:[e.jsx(ce,{className:"h-4 w-4 mr-1"})," Visualizar CDF"]}),s.pagamento_confirmado&&!s.cdf_enviado&&e.jsxs(r,{onClick:()=>{G.mutate(s),u(null)},children:[e.jsx(g,{className:"h-4 w-4 mr-1"})," Enviar CDF"]}),e.jsx(r,{variant:"ghost",onClick:()=>u(null),children:"Fechar"})]})]})}),e.jsx($,{open:!!d,onOpenChange:a=>{!a&&d?.blobUrl&&URL.revokeObjectURL(d.blobUrl),a||b(null)},children:e.jsxs(P,{className:"max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0",children:[e.jsx(T,{className:"px-6 py-4 border-b flex-shrink-0",children:e.jsxs(L,{className:"flex items-center gap-2",children:[e.jsx(z,{className:"h-5 w-5 text-green-600"}),"Certificado de Destinação Final — Nº ",d?.numeroCDF]})}),e.jsx("div",{className:"flex-1 overflow-hidden",children:d&&e.jsx("iframe",{src:d.blobUrl,className:"w-full h-full border-0",title:`CDF ${d.numeroCDF}`})}),e.jsxs("div",{className:"px-6 py-3 border-t flex-shrink-0 flex justify-between items-center bg-muted/30",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:'Use o botão "Imprimir / Salvar PDF" dentro do documento para exportar'}),e.jsx(r,{variant:"outline",size:"sm",onClick:()=>{d?.blobUrl&&URL.revokeObjectURL(d.blobUrl),b(null)},children:"Fechar"})]})]})}),n&&e.jsx($,{open:!!n,onOpenChange:a=>!a&&t(null),children:e.jsxs(P,{className:"max-w-sm",children:[e.jsx(T,{children:e.jsxs(L,{className:"flex items-center gap-2",children:[e.jsx(g,{className:"h-5 w-5 text-primary"}),"Enviar CDF — ",n.numero||n.cdf_id]})}),e.jsxs("div",{className:"space-y-3 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Cliente: ",e.jsx("strong",{children:n.clientes?.nome_fantasia||n.clientes?.razao_social})]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Escolha como enviar o certificado:"}),e.jsxs("div",{className:"grid gap-3",children:[e.jsxs(r,{className:"w-full gap-2 bg-green-500 hover:bg-green-600",onClick:()=>xe(n),children:[e.jsx(g,{className:"h-4 w-4"}),"Enviar por WhatsApp",n.clientes?.telefone&&e.jsxs("span",{className:"text-xs opacity-80",children:["(",n.clientes.telefone,")"]})]}),e.jsxs(r,{variant:"outline",className:"w-full gap-2",onClick:()=>ue(n),children:[e.jsx(g,{className:"h-4 w-4"}),"Enviar por E-mail",n.clientes?.email&&e.jsxs("span",{className:"text-xs text-muted-foreground",children:["(",n.clientes.email,")"]})]})]})]}),e.jsx(B,{children:e.jsx(r,{variant:"ghost",onClick:()=>t(null),children:"Cancelar"})})]})})]})}export{aa as component};
