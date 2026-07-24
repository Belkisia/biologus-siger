import{s as r}from"./index-DdofeqSv.js";async function i(e){try{const{data:{session:o}}=await r.auth.getSession();if(!o)throw new Error("Não autenticado");const a=await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o.access_token}`},body:JSON.stringify(e)}),t=await a.json();if(!a.ok)throw new Error(t.error||"Erro ao enviar");return{success:!0}}catch(o){return{success:!1,error:o.message}}}function s(e){return{assunto:`Proposta Comercial ${e.numeroProposta} – Bio Logus Ambiental`,html:`
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5}
  .wrap{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0a2e1a;padding:24px 32px;text-align:center}
  .header h1{color:#fff;font-size:20px;margin:0}
  .header p{color:#6bbf85;font-size:12px;margin:4px 0 0}
  .body{padding:32px}
  .destaque{background:#f0faf3;border-left:4px solid #1a6b35;padding:16px;margin:20px 0;border-radius:0 8px 8px 0}
  .btn{display:inline-block;background:#1a6b35;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;margin:20px 0}
  .footer{background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999}
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🌿 Bio Logus Ambiental</h1>
    <p>Gerenciamento de Resíduos · CNPJ 26.484.921/0001-60</p>
  </div>
  <div class="body">
    <p>Prezado(a) <strong>${e.clienteNome}</strong>,</p>
    <p>Segue nossa proposta comercial para coleta, transporte e destinação final de resíduos:</p>
    <div class="destaque">
      <p style="margin:0"><strong>Proposta:</strong> ${e.numeroProposta}</p>
      <p style="margin:4px 0"><strong>Valor:</strong> ${e.valorTotal}</p>
      <p style="margin:4px 0 0"><strong>Válida até:</strong> ${e.validade}</p>
    </div>
    <p>O documento com todos os detalhes segue em anexo. Qualquer dúvida estamos à disposição.</p>
    <p>Atenciosamente,<br><strong>${e.vendedor}</strong><br>Bio Logus Ambiental<br>(62) 3558-2791 · comercial@biologusambiental.com.br</p>
  </div>
  <div class="footer">Bio Logus Ambiental Ltda · R. Ipora, 258, Goiânia-GO · biologusambiental.com.br</div>
</div>
</body></html>`}}function d(e){return{assunto:`Certificado de Destinação Final Nº ${e.numeroCDF} – Bio Logus Ambiental`,html:`
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5}
  .wrap{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0a2e1a;padding:24px 32px;text-align:center}
  .header h1{color:#fff;font-size:20px;margin:0}
  .header p{color:#6bbf85;font-size:12px;margin:4px 0 0}
  .body{padding:32px}
  .destaque{background:#f0faf3;border-left:4px solid #1a6b35;padding:16px;margin:20px 0;border-radius:0 8px 8px 0}
  .footer{background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999}
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🌿 Bio Logus Ambiental</h1>
    <p>Certificado de Destinação Final</p>
  </div>
  <div class="body">
    <p>Prezado(a) <strong>${e.clienteNome}</strong>,</p>
    <p>Segue o Certificado de Destinação Final referente à coleta realizada:</p>
    <div class="destaque">
      <p style="margin:0"><strong>CDF Nº:</strong> ${e.numeroCDF}</p>
      <p style="margin:4px 0"><strong>Data da coleta:</strong> ${e.dataColeta}</p>
      <p style="margin:4px 0 0"><strong>Peso coletado:</strong> ${e.peso} ${e.unidade}</p>
    </div>
    <p>O certificado comprova que os resíduos foram coletados, transportados e destinados adequadamente, em conformidade com a legislação ambiental vigente.</p>
    <p>Atenciosamente,<br><strong>Bio Logus Ambiental</strong><br>(62) 3558-2791 · financeiro@biologusambiental.com.br</p>
  </div>
  <div class="footer">Bio Logus Ambiental Ltda · R. Ipora, 258, Goiânia-GO</div>
</div>
</body></html>`}}function p(e){return{assunto:`Manifesto de Transporte de Resíduos ${e.numeroMTR} – Bio Logus Ambiental`,html:`
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5}
  .wrap{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0a2e1a;padding:24px 32px;text-align:center}
  .header h1{color:#fff;font-size:20px;margin:0}
  .header p{color:#6bbf85;font-size:12px;margin:4px 0 0}
  .body{padding:32px}
  .destaque{background:#f0faf3;border-left:4px solid #1a6b35;padding:16px;margin:20px 0;border-radius:0 8px 8px 0}
  .footer{background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999}
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🌿 Bio Logus Ambiental</h1>
    <p>Manifesto de Transporte de Resíduos</p>
  </div>
  <div class="body">
    <p>Prezado(a) <strong>${e.clienteNome}</strong>,</p>
    <p>Segue o MTR referente à coleta de resíduos:</p>
    <div class="destaque">
      <p style="margin:0"><strong>MTR Nº:</strong> ${e.numeroMTR}</p>
      <p style="margin:4px 0"><strong>Data:</strong> ${e.dataEmissao}</p>
      <p style="margin:4px 0 0"><strong>Resíduo:</strong> ${e.residuo}</p>
    </div>
    <p>O MTR é o documento obrigatório para o transporte de resíduos conforme legislação vigente.</p>
    <p>Atenciosamente,<br><strong>Bio Logus Ambiental</strong><br>(62) 3558-2791 · financeiro@biologusambiental.com.br</p>
  </div>
  <div class="footer">Bio Logus Ambiental Ltda · R. Ipora, 258, Goiânia-GO</div>
</div>
</body></html>`}}function l(e){return{assunto:`Nota Fiscal de Serviço – Bio Logus Ambiental – ${e.competencia}`,html:`
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5}
  .wrap{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0a2e1a;padding:24px 32px;text-align:center}
  .header h1{color:#fff;font-size:20px;margin:0}
  .header p{color:#6bbf85;font-size:12px;margin:4px 0 0}
  .body{padding:32px}
  .destaque{background:#f0faf3;border-left:4px solid #1a6b35;padding:16px;margin:20px 0;border-radius:0 8px 8px 0}
  .footer{background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999}
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🌿 Bio Logus Ambiental</h1>
    <p>Nota Fiscal de Serviço Eletrônica – NFS-e</p>
  </div>
  <div class="body">
    <p>Prezado(a) <strong>${e.clienteNome}</strong>,</p>
    <p>Segue a Nota Fiscal de Serviço referente aos serviços prestados:</p>
    <div class="destaque">
      <p style="margin:0"><strong>Referência CDF:</strong> ${e.numeroCDF}</p>
      <p style="margin:4px 0"><strong>Competência:</strong> ${e.competencia}</p>
      <p style="margin:4px 0 0"><strong>Valor:</strong> ${e.valor}</p>
    </div>
    <p>A NFS-e foi emitida no portal da Prefeitura de Goiânia e pode ser consultada em: <a href="https://www.isspnetonline.com.br/goiania/online/">isspnetonline.com.br/goiania</a></p>
    <p>Atenciosamente,<br><strong>Bio Logus Ambiental</strong><br>(62) 3558-2791 · financeiro@biologusambiental.com.br</p>
  </div>
  <div class="footer">Bio Logus Ambiental Ltda · R. Ipora, 258, Goiânia-GO · CNPJ 26.484.921/0001-60</div>
</div>
</body></html>`}}export{d as a,l as b,p as c,i as e,s as t};
