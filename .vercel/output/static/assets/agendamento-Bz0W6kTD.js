import{d as ce,ah as we,r as y,j as e,I as H,C as O,m as je,n as M,s as j,o as E,t as R,B as c,M as Ne,a as Ce,ai as Ae}from"./index-Bq3A1tGt.js";import{L as pe}from"./label-COJpEbtc.js";import{B as ie}from"./badge-tOZA3JsC.js";import{D as B,a as F,b as P,c as q,d as se}from"./dialog-CgSWydGJ.js";import{C as Se}from"./checkbox-C0uRdjxd.js";import{C as Re,a as ze}from"./check-check-6_VJdZcl.js";import{A as De}from"./arrow-right-B-ezgqEa.js";import{P as V}from"./printer-DY80GYeh.js";import{P as oe}from"./plus-DC8Eiwng.js";import{F as K}from"./file-text-Bt-tuLc4.js";import{U as re}from"./users-BIo3p4Rw.js";import{L as Y}from"./loader-circle-ByGrro2X.js";import{E as Te}from"./eye-DCYpWAcu.js";import{P as X}from"./pen-line-CjCSqSd7.js";import{T as _e}from"./trash-2-C_ah4QR1.js";import{S as ke}from"./search-CLogMClM.js";import{R as Ee}from"./rotate-ccw-7ZmtXiwk.js";import"./index-9v-bE1o3.js";import"./index-CXvJUsjw.js";import"./index-DHjREAg0.js";import"./index-D4Tl1nvs.js";import"./index-C_fu9XF8.js";import"./index-O5y3vOVO.js";import"./index-CXUClYZ4.js";import"./check-up1sTYxO.js";const Oe=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Le=ce("chevron-left",Oe);const Ie=[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]],$e=ce("map",Ie),de=[{id:"centro_aeroporto",label:"Centro / Aeroporto",semana:"S1",dias:"Seg–Sex"},{id:"campinas",label:"Campinas e Região",semana:"S1",dias:"2 dias"},{id:"vila_mutirao",label:"Vila Mutirão / Curitiba / Balneário",semana:"S1",dias:"2 dias"},{id:"senador_canedo",label:"Senador Canedo + Bela Vista",semana:"S1",dias:"1 dia"},{id:"nova_veneza",label:"Nova Veneza + Nerópolis",semana:"S1",dias:"1 dia"},{id:"setor_bueno",label:"Setor Bueno + Oeste",semana:"S2",dias:"2 dias"},{id:"setor_sul",label:"Setor Sul",semana:"S2",dias:"1 dia"},{id:"trindade",label:"Trindade",semana:"S2",dias:"1 dia"},{id:"itaberai",label:"Itaberaí",semana:"S2",dias:"2 dias"},{id:"quirinopolis",label:"Quirinópolis + Itumbiara",semana:"S2",dias:"1 dia"},{id:"morrinhos",label:"Morrinhos + Catalão",semana:"S2",dias:"1 dia"},{id:"aparecida",label:"Aparecida de Goiânia",semana:"S3",dias:"2 dias"},{id:"caldas_novas",label:"Caldas Novas",semana:"S3",dias:"1 dia"},{id:"anapolis",label:"Anápolis",semana:"S3",dias:"1 dia"},{id:"abadia_guapo",label:"Abadia / Guapó / Aragoiânia",semana:"S3",dias:"1 dia"},{id:"ipora",label:"Iporá e Região",semana:"S3/S1",dias:"2 dias"},{id:"inhumas",label:"Inhumas / Goianira / Caturaí",semana:"S4",dias:"2 dias"},{id:"vera_cruz",label:"Vera Cruz / Parque Oeste / Santa Rita",semana:"S4",dias:"1 dia"},{id:"brasilia",label:"Brasília",semana:"01/07",dias:"2 dias"},{id:"rio_verde",label:"Rio Verde",semana:"Semanal",dias:"Seg/Qua/Sex"},{id:"veterinaria",label:"Veterinária Quinzenal",semana:"Quinzenal",dias:"1 dia"}],Me={S1:"bg-blue-100 text-blue-800",S2:"bg-teal-100 text-teal-800",S3:"bg-amber-100 text-amber-800",S4:"bg-purple-100 text-purple-800","S3/S1":"bg-orange-100 text-orange-800","01/07":"bg-red-100 text-red-800",Semanal:"bg-green-100 text-green-800",Quinzenal:"bg-pink-100 text-pink-800"};function G(i){return i==="ativa"?{nome:"ATIVA COMERCIAL COMERCIO E SERVICOS LTDA",nomeAbrev:"ATIVA COMERCIAL",cnpj:"51.480.805/0001-10",endereco:"RUA JOSE GOMES BAYLAO, 793, CONJUNTO GUADALAJARA, Goiânia - GO, CEP 74423-500"}:{nome:"BIO LOGUS AMBIENTAL LTDA - ME",nomeAbrev:"BIO LOGUS AMBIENTAL EIRELI",cnpj:"26.484.921/0001-60",endereco:"RUA DOS FERROVIARIOS, QD 01, LT 05 — PARQUE INDUSTRIAL JOÃO BRÁS 2 — Goiânia - GO"}}function Be(){const i=new Date().getFullYear(),r=Math.floor(1e4+Math.random()*9e4);return`${i}${r}`}function Fe(i){const{numeroCDF:r,numeroMTR:b,dataEmissao:f,periodoInicio:u,periodoFim:d,cliente:s}=i,p=G(s.transportadora),h=f?new Date(f+"T12:00:00").toLocaleDateString("pt-BR"):new Date().toLocaleDateString("pt-BR"),C=u?new Date(u+"T12:00:00").toLocaleDateString("pt-BR"):h,w=d?new Date(d+"T12:00:00").toLocaleDateString("pt-BR"):h,A=`https://biologus-siger.vercel.app/verificar-cdf/${r}`;return`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>CDF ${r}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;background:#f4f4f4;padding:20px;color:#111}
    .cdf-wrap{background:#fff;border:0.5px solid #d1e8d8;border-radius:14px;overflow:hidden;max-width:720px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08)}

    /* HEADER */
    .cdf-header{background:#0a2e1a;position:relative;overflow:hidden}
    .header-inner{position:relative;z-index:2;padding:24px 32px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
    .cert-num-block{text-align:right;flex-shrink:0}
    .cert-num-label{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#6bbf85;margin-bottom:2px}
    .cert-num-val{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:#fff;letter-spacing:2px}
    .title-band{background:#155c2b;padding:13px 32px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1e7a3a}
    .cert-title{font-family:'Playfair Display',serif;font-size:19px;color:#fff}
    .period-badge{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:5px 14px;font-size:11px;color:#c8ecd4}

    /* FAIXA MTR */
    .mtr-band{background:#f0faf3;border-bottom:0.5px solid #c8e6d0;padding:10px 32px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .mtr-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#6b7280;font-weight:600}
    .mtr-val{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#0a2e1a;letter-spacing:1px}
    .mtr-sep{width:1px;height:18px;background:#c8e6d0}

    /* BODY */
    .body{padding:22px 32px 24px}
    .declaracao{font-size:12px;color:#4a5568;line-height:1.75;border-left:3px solid #1a6b35;padding:10px 16px;background:#f7fdf9;border-radius:0 8px 8px 0;margin-bottom:22px;font-style:italic}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
    .info-card{border:0.5px solid #c8e6d0;border-radius:10px;padding:14px 16px;background:#f7fdf9}
    .card-label{font-size:8.5px;letter-spacing:2.5px;text-transform:uppercase;color:#1a6b35;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px}
    .card-label::after{content:'';flex:1;height:0.5px;background:#b8ddc4}
    .irow{margin-bottom:7px}
    .irow:last-child{margin-bottom:0}
    .irow .lbl{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:1px}
    .irow .val{font-size:12px;font-weight:500;color:#111827;line-height:1.3}
    .section-divider{font-size:8.5px;letter-spacing:2.5px;text-transform:uppercase;color:#1a6b35;font-weight:600;display:flex;align-items:center;gap:12px;margin:20px 0 12px}
    .section-divider::before,.section-divider::after{content:'';flex:1;height:0.5px;background:#c8e6d0}

    /* TABELA */
    table.rtable{width:100%;border-collapse:separate;border-spacing:0;font-size:11.5px;border:0.5px solid #c8e6d0;border-radius:10px;overflow:hidden}
    table.rtable th{background:#0a2e1a;color:#7dcf9a;padding:10px 13px;text-align:left;font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500}
    table.rtable td{padding:13px 13px;border-bottom:0.5px solid #e8f4ec;color:#1f2937;vertical-align:middle}
    table.rtable tr:last-child td{border-bottom:none}
    .grupo-tag{display:inline-block;background:#0a2e1a;color:#6bbf85;font-size:10px;padding:4px 11px;border-radius:20px;font-weight:600;letter-spacing:.5px}
    .mtr-tag{display:inline-block;background:#f0faf3;border:0.5px solid #b8ddc4;color:#155c2b;font-size:10px;padding:3px 9px;border-radius:20px;font-weight:600;margin-top:5px;letter-spacing:.5px}
    .qty-big{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1a6b35;line-height:1}
    .qty-kg{font-size:10px;color:#6b7280}

    /* FOOTER */
    .footer{margin-top:22px;padding-top:18px;border-top:0.5px solid #c8e6d0;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end}
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

    /* PRINT */
    .no-print{display:flex;gap:10px;justify-content:center;margin-top:20px}
    @media print{.no-print{display:none!important}body{background:#fff;padding:0}.cdf-wrap{box-shadow:none;border:none;border-radius:0}@page{margin:1cm;size:A4}}
  </style>
</head>
<body>
<div class="cdf-wrap">

  <!-- HEADER -->
  <div class="cdf-header">
    <div class="header-inner">
      <!-- LOGO SVG -->
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
        <div class="cert-num-val">${r}</div>
      </div>
    </div>
    <div class="title-band">
      <div class="cert-title">Certificado de Destinação Final</div>
      <div class="period-badge">${C} — ${w}</div>
    </div>
  </div>

  <!-- FAIXA MTR -->
  <div class="mtr-band">
    <span class="mtr-label">MTR vinculado</span>
    <div class="mtr-sep"></div>
    <span class="mtr-val">${b}</span>
    <div class="mtr-sep"></div>
    <span class="mtr-label">Data de emissão</span>
    <div class="mtr-sep"></div>
    <span class="mtr-val" style="font-size:13px;color:#374151;font-family:'Inter',sans-serif;font-weight:500;">${h}</span>
  </div>

  <!-- BODY -->
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
        <div class="irow"><span class="lbl">Razão Social</span><span class="val">${s.razao_social}</span></div>
        <div class="irow"><span class="lbl">CNPJ</span><span class="val">${s.cnpj||"—"}</span></div>
        <div class="irow"><span class="lbl">Endereço</span><span class="val">${s.logradouro||"—"}${s.cidade?`, ${s.cidade}`:""}</span></div>
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
            <div style="font-weight:600;font-size:11.5px;margin-bottom:2px;">${p.nomeAbrev}</div>
            <div style="font-size:10px;color:#6b7280;">CNPJ: ${p.cnpj}</div>
          </td>
          <td>
            <div style="font-weight:600;font-size:11.5px;margin-bottom:2px;">B-GREEN GESTÃO AMBIENTAL S.A.</div>
            <div style="font-size:10px;color:#6b7280;">CNPJ: 01.568.077/0006-30</div>
          </td>
          <td>
            <span class="grupo-tag">GRUPO A, B, E</span>
            <div><span class="mtr-tag">${b}</span></div>
          </td>
          <td style="text-align:center">
            <div class="qty-big" id="qty-val">${String(peso).replace(".",",")}</div>
            <div class="qty-kg">kg</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
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
        <div class="qr-url">biologus-siger.vercel.app/verificar-cdf/${r}</div>
      </div>
    </div>

    <div class="auth-strip">
      <div class="auth-dot"></div>
      <div class="auth-txt">Escaneie o QR Code para verificar a autenticidade deste certificado.</div>
    </div>

    <div class="pg">PÁG. 1</div>
  </div>
</div>

<!-- Botões fora da área de impressão -->
<div class="no-print">
  <button onclick="window.print()" style="background:#0a2e1a;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Inter,sans-serif">
    🖨️ Imprimir / Salvar PDF
  </button>
  <button onclick="window.close()" style="background:#f0faf3;color:#155c2b;border:1px solid #b8ddc4;padding:10px 24px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Inter,sans-serif">
    Fechar
  </button>
</div>

<script>
  // QR Code real
  new QRCode(document.getElementById("qrcode-el"), {
    text: "${A}",
    width: 64,
    height: 64,
    colorDark: "#0a2e1a",
    colorLight: "#f0faf3",
    correctLevel: QRCode.CorrectLevel.M
  });
<\/script>
</body>
</html>`}function ne(i){const r=Fe(i),b=new Blob([r],{type:"text/html;charset=utf-8"});return URL.createObjectURL(b)}function Pe(i,r){const b={};r.forEach(s=>{b[s.cliente.id]=s.cliente});const u=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>MTRs em Lote</title><style>*{box-sizing:border-box;margin:0;padding:0}@media print{@page{margin:1cm;size:A4}}</style></head><body>${i.map((s,p)=>{const h=b[s.cliente_id]||{},C=s.data_emissao?new Date(s.data_emissao+"T12:00:00").toLocaleDateString("pt-BR"):"";return`<div style="${p<i.length-1?"page-break-after:always;":""}padding:20px;max-width:800px;margin:0 auto;font-family:Arial,sans-serif;font-size:11px;color:#000">
      <div style="display:flex;justify-content:space-between;border-bottom:3px solid #0D9488;padding-bottom:10px;margin-bottom:14px">
        <div><b style="font-size:18px;color:#0D9488">BIOLOGUS AMBIENTAL</b><br/><span style="font-size:10px;color:#555">Gestão de Resíduos de Saúde</span></div>
        <div style="text-align:center"><b style="font-size:13px;border:2px solid #000;padding:6px 14px;display:inline-block">MANIFESTO DE TRANSPORTE DE RESÍDUOS</b><br/><span style="font-size:11px;color:#555">Nº ${s.numero} | ${C}</span></div>
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
        <div style="border:1px solid #000;padding:10px;text-align:center;font-size:10px"><b>GERADOR</b>${s.assinatura_gerador?`<img src="${s.assinatura_gerador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto"/>`:'<div style="margin-top:26px;border-top:1px solid #999;padding-top:4px;color:#555">Assinatura / Carimbo</div>'}</div>
        <div style="border:1px solid #000;padding:10px;text-align:center;font-size:10px"><b>TRANSPORTADOR</b>${s.assinatura_transportador?`<img src="${s.assinatura_transportador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto"/>`:'<div style="margin-top:26px;border-top:1px solid #999;padding-top:4px;color:#555">Assinatura / Carimbo</div>'}</div>
      </div>
    </div>`}).join("")}</body></html>`,d=window.open("","_blank");if(!d){alert("Permita popups para este site e tente novamente");return}d.document.write(u),d.document.close(),d.focus(),setTimeout(()=>d.print(),600)}function qe(i,r){const b=window.open("","_blank");if(!b)return;const f=new Date(i.data_emissao+"T12:00:00").toLocaleDateString("pt-BR");b.document.write(`<!DOCTYPE html><html><head><title>MTR ${i.numero}</title>
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
    <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${i.numero} &nbsp;|&nbsp; ${f}</div></div>
  </div>
  <div class="section">
    <div class="section-title">Gerador (Contratante)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">${r.razao_social||""}</div></div>
        <div><div class="field-label">Nome Fantasia</div><div class="field-value">${r.nome_fantasia||""}</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">${r.cnpj||""}</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">${r.logradouro||""}</div></div>
        <div><div class="field-label">Cidade</div><div class="field-value">${r.cidade||""}</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Transportador (Contratada)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">${G(r.transportadora).nome}</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">${G(r.transportadora).cnpj}</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">${G(r.transportadora).endereco}</div></div>
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
        <div style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">SETOR INDUSTRIAL DA CEILANDIA QI 21 LOTE 51/53/55 — CEILANDIA — Brasília - DF — CEP 72265-210</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Resíduos</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Descrição</div><div class="field-value">${i.descricao_residuo||"GRUPO A, B E INFECTANTES, QUÍMICOS E PERFURO CORTANTES"}</div></div>
        <div><div class="field-label">Acondicionamento</div><div class="field-value">${i.acondicionamento||"BOMBONA"}</div></div>
        <div><div class="field-label">Quantidade</div><div class="field-value">${i.quantidade||"___"} ${i.unidade||"kg"}</div></div>
        <div><div class="field-label">Status</div><div class="field-value">${i.status||"emitido"}</div></div>
      </div>
    </div>
  </div>
  <div class="assinaturas">
    <div class="ass-box">
      <div class="ass-title">Gerador</div>
      ${i.assinatura_gerador?`<img src="${i.assinatura_gerador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto" /><div style="font-size:9px;color:#555;border-top:1px solid #555;padding-top:3px;margin-top:2px">${r.razao_social||""}</div>`:'<div class="ass-line">Assinatura / Carimbo</div>'}
    </div>
    <div class="ass-box">
      <div class="ass-title">Transportador</div>
      ${i.assinatura_transportador?`<img src="${i.assinatura_transportador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto" /><div style="font-size:9px;color:#555;border-top:1px solid #555;padding-top:3px;margin-top:2px">BIO LOGUS AMBIENTAL LTDA - ME</div>`:'<div class="ass-line">Assinatura / Carimbo</div>'}
    </div>
  </div>
  <div class="footer">Documento gerado pelo SIGER PRO — Bio Logus Ambiental | ${new Date().toLocaleDateString("pt-BR")}</div>
  <script>window.onload=()=>window.print();<\/script>
  </body></html>`),b.document.close()}function le({onSave:i,onCancel:r,titulo:b}){const f=y.useRef(null),u=y.useRef(!1),d=y.useRef(null),s=(n,g)=>{const x=g.getBoundingClientRect(),z=g.width/x.width,_=g.height/x.height;return"touches"in n?{x:(n.touches[0].clientX-x.left)*z,y:(n.touches[0].clientY-x.top)*_}:{x:(n.clientX-x.left)*z,y:(n.clientY-x.top)*_}},p=n=>{n.preventDefault();const g=f.current;g&&(u.current=!0,d.current=s(n,g))},h=n=>{if(n.preventDefault(),!u.current)return;const g=f.current,x=g?.getContext("2d");if(!g||!x||!d.current)return;const z=s(n,g);x.beginPath(),x.moveTo(d.current.x,d.current.y),x.lineTo(z.x,z.y),x.strokeStyle="#000",x.lineWidth=2.5,x.lineCap="round",x.lineJoin="round",x.stroke(),d.current=z},C=()=>{u.current=!1,d.current=null},w=()=>{const n=f.current,g=n?.getContext("2d");!n||!g||g.clearRect(0,0,n.width,n.height)},A=()=>{const n=f.current;n&&i(n.toDataURL("image/png"))};return e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx("p",{className:"text-sm font-medium text-center",children:b}),e.jsx("div",{className:"border-2 border-dashed border-border rounded-lg bg-white touch-none",style:{touchAction:"none"},children:e.jsx("canvas",{ref:f,width:600,height:200,className:"w-full rounded-lg",style:{touchAction:"none"},onMouseDown:p,onMouseMove:h,onMouseUp:C,onMouseLeave:C,onTouchStart:p,onTouchMove:h,onTouchEnd:C})}),e.jsx("p",{className:"text-xs text-muted-foreground text-center",children:"Assine acima com o dedo ou caneta"}),e.jsxs("div",{className:"flex gap-2 justify-between",children:[e.jsxs(c,{variant:"outline",size:"sm",onClick:w,children:[e.jsx(Ee,{className:"h-4 w-4 mr-1"})," Limpar"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(c,{variant:"ghost",size:"sm",onClick:r,children:"Cancelar"}),e.jsxs(c,{size:"sm",onClick:A,children:[e.jsx(X,{className:"h-4 w-4 mr-1"})," Salvar Assinatura"]})]})]})]})}function Ge({rota:i,dataSelecionada:r,onVoltar:b,user:f}){const u=je(),d=u,[s,p]=y.useState(!1),[h,C]=y.useState(""),[w,A]=y.useState([]),[n,g]=y.useState(!1),[x,z]=y.useState("GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES"),[_,me]=y.useState("lista"),[D,k]=y.useState(null),[S,L]=y.useState(null),{data:l=[],isLoading:xe}=M({queryKey:["rota-clientes",i.id],queryFn:async()=>{const{data:a}=await j.from("rota_clientes").select("id, ordem, coletado, clientes(id, razao_social, nome_fantasia, logradouro, cidade, cnpj, latitude, longitude, transportadora)").eq("rota_codigo",i.id).order("ordem");return(a??[]).map(t=>({id:t.id,ordem:t.ordem,coletado:t.coletado??!1,cliente:t.clientes})).filter(t=>t.cliente)}}),{data:N=[]}=M({queryKey:["mtrs-rota",i.id,r],queryFn:async()=>{if(!l.length)return[];const{data:a}=await j.from("mtrs").select("id, numero, cliente_id, status, quantidade, unidade, data_emissao, descricao_residuo, acondicionamento, assinatura_gerador, assinatura_transportador, data_baixa").eq("rota_codigo",i.id).eq("data_emissao",r);return a??[]},enabled:l.length>0}),{data:fe=[]}=M({queryKey:["cdfs-rota",i.id,r],queryFn:async()=>{const{data:a}=await j.from("boletins_medicao").select("id, mtr_id, cdf_id, cdf_enviado, numero").in("mtr_id",N.map(t=>t.id));return a??[]},enabled:N.length>0}),{data:Z=[]}=M({queryKey:["clientes-select"],queryFn:async()=>{const{data:a}=await j.from("clientes").select("id, razao_social, nome_fantasia, logradouro, cidade").eq("ativo",!0).order("razao_social",{ascending:!0});return a??[]}}),I=new Set(l.map(a=>a.cliente.id)),U=E({mutationFn:async()=>{const a=w.map((o,m)=>({owner_id:f.id,rota_codigo:i.id,rota_id:null,cliente_id:o,ordem:l.length+m+1,frequencia:"semanal",coletado:!1})),{error:t}=await j.from("rota_clientes").upsert(a,{onConflict:"rota_codigo,cliente_id"});if(t)throw t},onSuccess:()=>{u.invalidateQueries({queryKey:["rota-clientes"]}),R.success(`${w.length} clientes adicionados`),p(!1),A([])},onError:a=>R.error(a.message)}),ue=E({mutationFn:async({mtrId:a,peso:t,cliente:o})=>{const m=new Date().toISOString().split("T")[0],v=Be(),T=crypto.randomUUID(),{data:$,error:ae}=await j.from("mtrs").update({status:"baixado",quantidade:t,data_baixa:m}).eq("id",a).select("id, numero, cliente_id, rota_codigo, descricao_residuo, unidade, data_emissao").single();if(ae)throw ae;const{data:ye,error:te}=await j.from("boletins_medicao").insert([{owner_id:f.id,mtr_id:$.id,cliente_id:$.cliente_id,data_coleta:m,peso_coletado:t,unidade:$.unidade||"kg",status:"pendente",pagamento_confirmado:!1,cdf_enviado:!1,cdf_id:T,numero:v}]).select("id").single();if(te)throw te;return{mtrData:$,boletimData:ye,numeroCDF:v,cliente:o}},onSuccess:({mtrData:a,numeroCDF:t,cliente:o})=>{d.invalidateQueries({queryKey:["mtrs-rota"]}),d.invalidateQueries({queryKey:["cdfs-rota"]}),R.success("MTR baixado! Boletim e CDF gerados.");const m=new Date().toISOString().split("T")[0],v=ne({numeroCDF:t,numeroMTR:a.numero,dataEmissao:m,periodoInicio:a.data_emissao||m,periodoFim:m,cliente:o});L({blobUrl:v,numeroCDF:t})},onError:a=>R.error(a.message)}),W=E({mutationFn:async({mtrId:a,campo:t,dataUrl:o})=>{const{error:m}=await j.from("mtrs").update({[t]:o}).eq("id",a);if(m)throw m},onSuccess:()=>{d.invalidateQueries({queryKey:["mtrs-rota"]}),R.success("Assinatura salva!")}}),ge=E({mutationFn:async a=>{const{error:t}=await j.from("rota_clientes").delete().eq("id",a);if(t)throw t},onSuccess:()=>{u.invalidateQueries({queryKey:["rota-clientes"]}),R.success("Cliente removido")}}),ve=E({mutationFn:async({rcId:a,coletado:t})=>{const{error:o}=await j.from("rota_clientes").update({coletado:t}).eq("id",a);if(o)throw o},onSuccess:()=>u.invalidateQueries({queryKey:["rota-clientes"]})}),Q=E({mutationFn:async()=>{const a=l.map((o,m)=>({owner_id:f.id,cliente_id:o.cliente.id,numero:`MTR-${r.replace(/-/g,"")}-${String(m+1).padStart(3,"0")}`,data_emissao:r,descricao_residuo:x,quantidade:0,unidade:"kg",acondicionamento:"BOMBONA",status:"emitido",rota_codigo:i.id})),{error:t}=await j.from("mtrs").insert(a);if(t)throw t},onSuccess:()=>{u.invalidateQueries({queryKey:["mtrs-rota"]}),u.invalidateQueries({queryKey:["mtrs"]}),R.success(`${l.length} MTRs criados!`),g(!1)},onError:a=>R.error(a.message)}),be=()=>{const a=window.open("","_blank");if(!a)return;const t=new Date(r+"T12:00:00").toLocaleDateString("pt-BR");a.document.write(`<!DOCTYPE html><html><head><title>Rota ${i.label}</title>
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
    <h1>${i.label}</h1>
    <div class="sub">Data: ${t} · ${l.length} clientes · Semana ${i.semana}</div>
    <table>
      <thead><tr><th>#</th><th>Cliente</th><th>Endereço</th><th>MTR</th><th>Peso (kg)</th><th>Coletado</th></tr></thead>
      <tbody>
        ${l.map((o,m)=>{const v=N.find(T=>T.cliente_id===o.cliente.id);return`<tr>
            <td>${m+1}</td>
            <td><strong>${o.cliente.nome_fantasia||o.cliente.razao_social}</strong></td>
            <td>${o.cliente.logradouro||"—"}</td>
            <td class="mtr">${v?v.numero:"—"}</td>
            <td></td>
            <td style="text-align:center">${o.coletado?"✓":"□"}</td>
          </tr>`}).join("")}
      </tbody>
    </table>
    <script>window.onload=()=>window.print();<\/script>
    </body></html>`),a.document.close()},he=Z.filter(a=>{const t=h.toLowerCase();return!t||(a.nome_fantasia||a.razao_social).toLowerCase().includes(t)||(a.cidade??"").toLowerCase().includes(t)}),J=l.filter(a=>a.coletado).length,ee=l.length>0?Math.round(J/l.length*100):0;return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-3 flex-wrap",children:[e.jsxs(c,{variant:"ghost",size:"sm",onClick:b,children:[e.jsx(Le,{className:"h-4 w-4 mr-1"})," Rotas"]}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("h1",{className:"text-xl font-bold flex items-center gap-2",children:[e.jsx(Ne,{className:"h-5 w-5 text-primary"}),i.label]}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5",children:[new Date(r+"T12:00:00").toLocaleDateString("pt-BR")," · Semana ",i.semana," · ",i.dias]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(c,{variant:"outline",size:"sm",onClick:be,children:[e.jsx(V,{className:"h-4 w-4 mr-1"})," Imprimir"]}),N.length>0&&e.jsxs(c,{variant:"outline",size:"sm",onClick:()=>Pe(N,l),children:[e.jsx(V,{className:"h-4 w-4 mr-1"})," MTRs em lote"]}),e.jsxs(c,{variant:"outline",size:"sm",onClick:()=>p(!0),children:[e.jsx(oe,{className:"h-4 w-4 mr-1"})," Clientes"]}),e.jsxs(c,{size:"sm",onClick:()=>g(!0),disabled:l.length===0||N.length>0,children:[e.jsx(K,{className:"h-4 w-4 mr-1"}),N.length>0?`${N.length} MTRs emitidos`:"Gerar MTRs"]})]})]}),e.jsx("div",{className:"grid grid-cols-4 gap-3",children:[{label:"Clientes",val:l.length,color:"text-primary"},{label:"Coletados",val:J,color:"text-green-600"},{label:"Pendentes",val:l.length-J,color:"text-amber-600"},{label:"MTRs",val:N.length,color:"text-teal-600"}].map(a=>e.jsxs(O,{className:"p-3 text-center",children:[e.jsx("p",{className:`text-2xl font-bold ${a.color}`,children:a.val}),e.jsx("p",{className:"text-xs text-muted-foreground",children:a.label})]},a.label))}),l.length>0&&e.jsxs(O,{className:"p-3",children:[e.jsxs("div",{className:"flex justify-between text-sm mb-1.5",children:[e.jsx("span",{className:"text-muted-foreground",children:"Progresso da coleta"}),e.jsxs("span",{className:"font-bold text-primary",children:[ee,"%"]})]}),e.jsx("div",{className:"w-full bg-muted rounded-full h-2.5",children:e.jsx("div",{className:"bg-green-500 h-2.5 rounded-full transition-all",style:{width:`${ee}%`}})})]}),e.jsx("div",{className:"flex border-b",children:[{id:"lista",icon:re,label:"Lista"},{id:"mapa",icon:$e,label:"Mapa"}].map(a=>e.jsxs("button",{onClick:()=>me(a.id),className:`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${_===a.id?"border-primary text-primary":"border-transparent text-muted-foreground"}`,children:[e.jsx(a.icon,{className:"h-4 w-4"}),a.label]},a.id))}),_==="lista"&&e.jsx(O,{children:xe?e.jsx("div",{className:"py-12 text-center",children:e.jsx(Y,{className:"h-5 w-5 animate-spin mx-auto text-muted-foreground"})}):l.length===0?e.jsxs("div",{className:"py-12 text-center",children:[e.jsx(re,{className:"h-10 w-10 mx-auto text-muted-foreground/30 mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nenhum cliente vinculado."}),e.jsxs(c,{size:"sm",className:"mt-3",onClick:()=>p(!0),children:[e.jsx(oe,{className:"h-4 w-4 mr-1"})," Adicionar clientes"]})]}):e.jsx("div",{className:"divide-y",children:l.map((a,t)=>{const o=N.find(v=>v.cliente_id===a.cliente.id),m=fe.find(v=>v.mtr_id===o?.id);return e.jsxs("div",{className:`flex items-center gap-3 px-4 py-3 transition-colors ${a.coletado?"bg-green-50/50":""}`,children:[e.jsx("button",{onClick:()=>ve.mutate({rcId:a.id,coletado:!a.coletado}),className:"flex-shrink-0",children:a.coletado?e.jsx(Ce,{className:"h-6 w-6 text-green-500"}):e.jsx(Ae,{className:"h-6 w-6 text-muted-foreground/30"})}),e.jsx("div",{className:`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${a.coletado?"bg-green-500 text-white":"bg-primary text-white"}`,children:t+1}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:`text-sm font-medium truncate ${a.coletado?"line-through text-muted-foreground":""}`,children:a.cliente.nome_fantasia||a.cliente.razao_social}),e.jsxs("p",{className:"text-xs text-muted-foreground truncate",children:[a.cliente.logradouro||"",a.cliente.cidade?` — ${a.cliente.cidade}`:""]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0",children:[o&&e.jsxs(e.Fragment,{children:[e.jsx(ie,{variant:o.status==="baixado"?"default":"secondary",className:`text-xs ${o.status==="baixado"?"bg-green-500":""}`,children:o.status==="baixado"?`${o.quantidade}kg ✓`:o.numero}),o.status!=="baixado"&&e.jsx(c,{variant:"ghost",size:"icon",className:"h-7 w-7",title:"Dar baixa no MTR",onClick:()=>{const v=window.prompt(`Peso coletado (kg) — ${a.cliente.nome_fantasia||a.cliente.razao_social}:`);if(v===null)return;const T=parseFloat(v.replace(",","."))||0;ue.mutate({mtrId:o.id,peso:T,cliente:a.cliente})},children:e.jsx(ze,{className:"h-3.5 w-3.5 text-orange-500"})}),o.status==="baixado"&&m?.cdf_id&&e.jsx(c,{variant:"ghost",size:"icon",className:"h-7 w-7",title:`Visualizar CDF ${m.cdf_id}`,onClick:()=>{const v=new Date().toISOString().split("T")[0],T=ne({numeroCDF:m.cdf_id??"",numeroMTR:o.numero,dataEmissao:o.data_emissao||v,periodoInicio:o.data_emissao||v,periodoFim:o.data_baixa||v,cliente:a.cliente});L({blobUrl:T,numeroCDF:m.cdf_id??""})},children:e.jsx(Te,{className:"h-3.5 w-3.5 text-green-600"})}),e.jsx(c,{variant:"ghost",size:"icon",className:"h-7 w-7",title:"Assinar MTR",onClick:()=>k({mtr:o,cliente:a.cliente,etapa:"gerador"}),children:e.jsx(X,{className:`h-3.5 w-3.5 ${o.assinatura_gerador?"text-green-500":"text-muted-foreground"}`})}),e.jsx(c,{variant:"ghost",size:"icon",className:"h-7 w-7",title:"Imprimir MTR",onClick:()=>qe(o,a.cliente),children:e.jsx(V,{className:"h-3.5 w-3.5 text-primary"})})]}),e.jsx(c,{variant:"ghost",size:"icon",className:"h-7 w-7",onClick:()=>ge.mutate(a.id),children:e.jsx(_e,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]},a.id)})})}),_==="mapa"&&e.jsxs(O,{className:"overflow-hidden",children:[e.jsx("div",{id:"mapa-rota",style:{height:420}}),e.jsx("script",{dangerouslySetInnerHTML:{__html:`
            if (typeof L !== 'undefined') {
              const map = L.map('mapa-rota').setView([-16.686, -49.264], 11);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OSM'}).addTo(map);
              const clientes = ${JSON.stringify(l.filter(a=>a.cliente.latitude).map((a,t)=>({lat:a.cliente.latitude,lng:a.cliente.longitude,nome:a.cliente.nome_fantasia||a.cliente.razao_social,coletado:a.coletado,ordem:t+1})))};
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
          `}})]}),e.jsx(B,{open:s,onOpenChange:p,children:e.jsxs(F,{className:"max-w-lg max-h-[90vh] overflow-hidden flex flex-col",children:[e.jsx(P,{children:e.jsxs(q,{children:["Adicionar clientes — ",i.label]})}),e.jsxs("div",{className:"space-y-3 flex-1 overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:"text-sm text-muted-foreground",children:[w.length," selecionado(s)"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(c,{size:"sm",variant:"outline",onClick:()=>A(Z.map(a=>a.id)),children:"Todos"}),e.jsx(c,{size:"sm",variant:"outline",onClick:()=>A([]),children:"Limpar"})]})]}),e.jsxs("div",{className:"relative",children:[e.jsx(ke,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"}),e.jsx(H,{placeholder:"Buscar por nome ou cidade...",value:h,onChange:a=>C(a.target.value),className:"pl-9"})]}),e.jsx("div",{className:"flex-1 overflow-y-auto border rounded-md divide-y",children:he.map(a=>e.jsxs("div",{className:`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 ${I.has(a.id)?"opacity-50":""}`,onClick:()=>{I.has(a.id)||A(t=>t.includes(a.id)?t.filter(o=>o!==a.id):[...t,a.id])},children:[e.jsx(Se,{checked:w.includes(a.id)||I.has(a.id)}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium truncate",children:a.nome_fantasia||a.razao_social}),e.jsx("p",{className:"text-xs text-muted-foreground",children:a.cidade})]}),I.has(a.id)&&e.jsx(ie,{variant:"secondary",className:"text-xs flex-shrink-0",children:"Já na rota"})]},a.id))})]}),e.jsxs(se,{children:[e.jsx(c,{variant:"ghost",onClick:()=>{p(!1),A([])},children:"Cancelar"}),e.jsxs(c,{onClick:()=>U.mutate(),disabled:U.isPending||w.length===0,children:[U.isPending&&e.jsx(Y,{className:"h-4 w-4 mr-2 animate-spin"}),"Adicionar ",w.length>0?w.length:""," clientes"]})]})]})}),e.jsx(B,{open:!!D,onOpenChange:a=>!a&&k(null),children:e.jsxs(F,{className:"max-w-lg",children:[e.jsx(P,{children:e.jsxs(q,{className:"flex items-center gap-2",children:[e.jsx(X,{className:"h-5 w-5 text-primary"}),"Assinatura Digital — MTR ",D?.mtr?.numero]})}),D&&e.jsx("div",{className:"space-y-4",children:D.etapa==="gerador"?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-sm",children:[e.jsx("p",{className:"font-medium",children:D.cliente.nome_fantasia||D.cliente.razao_social}),e.jsx("p",{className:"text-muted-foreground text-xs mt-0.5",children:"Gerador — assine como responsável pelo resíduo"})]}),e.jsx(le,{titulo:"Assinatura do Gerador",onCancel:()=>k(null),onSave:a=>{W.mutate({mtrId:D.mtr.id,campo:"assinatura_gerador",dataUrl:a}),k(t=>t?{...t,etapa:"transportador"}:null)}})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-sm",children:[e.jsx("p",{className:"font-medium",children:"BIO LOGUS AMBIENTAL LTDA - ME"}),e.jsx("p",{className:"text-muted-foreground text-xs mt-0.5",children:"Transportador — assine como responsável pela coleta"})]}),e.jsx(le,{titulo:"Assinatura do Transportador",onCancel:()=>k(null),onSave:a=>{W.mutate({mtrId:D.mtr.id,campo:"assinatura_transportador",dataUrl:a}),k(null),R.success("MTR assinado com sucesso!")}})]})})]})}),e.jsx(B,{open:!!S,onOpenChange:a=>{!a&&S?.blobUrl&&URL.revokeObjectURL(S.blobUrl),a||L(null)},children:e.jsxs(F,{className:"max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0",children:[e.jsx(P,{className:"px-6 py-4 border-b flex-shrink-0",children:e.jsxs(q,{className:"flex items-center gap-2",children:[e.jsx(K,{className:"h-5 w-5 text-green-600"}),"Certificado de Destinação Final — Nº ",S?.numeroCDF]})}),e.jsx("div",{className:"flex-1 overflow-hidden",children:S&&e.jsx("iframe",{src:S.blobUrl,className:"w-full h-full border-0",title:`CDF ${S.numeroCDF}`})}),e.jsxs("div",{className:"px-6 py-3 border-t flex-shrink-0 flex justify-between items-center bg-muted/30",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:'Use o botão "Imprimir / Salvar PDF" dentro do documento para exportar'}),e.jsx(c,{variant:"outline",size:"sm",onClick:()=>{S?.blobUrl&&URL.revokeObjectURL(S.blobUrl),L(null)},children:"Fechar"})]})]})}),e.jsx(B,{open:n,onOpenChange:g,children:e.jsxs(F,{className:"max-w-md",children:[e.jsx(P,{children:e.jsxs(q,{className:"flex items-center gap-2",children:[e.jsx(K,{className:"h-5 w-5 text-primary"}),"Gerar ",l.length," MTRs em lote"]})}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Será gerado 1 MTR para cada cliente da rota com a data ",e.jsx("strong",{children:new Date(r+"T12:00:00").toLocaleDateString("pt-BR")}),"."]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(pe,{children:"Descrição do resíduo"}),e.jsx(H,{value:x,onChange:a=>z(a.target.value)})]}),e.jsxs("div",{className:"bg-muted/50 rounded-md p-3 text-sm",children:[e.jsx("p",{className:"font-medium",children:"Numeração automática:"}),e.jsxs("p",{className:"text-muted-foreground text-xs mt-0.5",children:["MTR-",r.replace(/-/g,""),"-001 até -",String(l.length).padStart(3,"0")]})]})]}),e.jsxs(se,{children:[e.jsx(c,{variant:"ghost",onClick:()=>g(!1),children:"Cancelar"}),e.jsxs(c,{onClick:()=>Q.mutate(),disabled:Q.isPending,children:[Q.isPending&&e.jsx(Y,{className:"h-4 w-4 mr-2 animate-spin"}),"Gerar MTRs"]})]})]})})]})}function ua(){const{user:i}=we.useRouteContext(),[r,b]=y.useState(()=>new Date().toISOString().slice(0,10)),[f,u]=y.useState(null),d=[...new Set(de.map(s=>s.semana))];return f?e.jsx(Ge,{rota:f,dataSelecionada:r,onVoltar:()=>u(null),user:i}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-start justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold flex items-center gap-2",children:[e.jsx(Re,{className:"h-6 w-6 text-primary"})," Agendamento de Rotas"]}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Selecione a rota para visualizar clientes, gerar MTRs e registrar coletas."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(pe,{className:"text-sm whitespace-nowrap",children:"Data:"}),e.jsx(H,{type:"date",value:r,onChange:s=>b(s.target.value),className:"w-40"})]})]}),d.map(s=>e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx("span",{className:`text-xs font-semibold px-2 py-0.5 rounded-full ${Me[s]??"bg-gray-100 text-gray-800"}`,children:s}),e.jsxs("span",{className:"text-sm text-muted-foreground",children:["Semana ",s]})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",children:de.filter(p=>p.semana===s).map(p=>e.jsx(O,{onClick:()=>u(p),className:"p-4 cursor-pointer transition-all border-2 border-border hover:border-primary hover:shadow-md group",children:e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium text-sm group-hover:text-primary transition-colors",children:p.label}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:p.dias})]}),e.jsx(De,{className:"h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5"})]})},p.id))})]},s))]})}export{ua as component};
