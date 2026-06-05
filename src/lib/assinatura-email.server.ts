// Envio de e-mails via Resend (gratuito 3k/mês)
// Server-only — nunca importar em código de cliente.

const RESEND_URL = "https://api.resend.com/emails";

function getKey() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurado");
  return key;
}

// Em produção, troque por um domínio verificado no Resend (ex: assinaturas@biologus.com.br)
const FROM = "Bio Logus Ambiental <onboarding@resend.dev>";

async function send(to: string, subject: string, html: string) {
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt}`);
  }
  return res.json();
}

const baseStyle = `font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a`;
const greenHeader = `background:linear-gradient(135deg,#1a5d3f,#2d8a5f);color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center`;
const card = `background:#f7faf8;border:1px solid #d4e3d9;border-radius:0 0 8px 8px;padding:28px 24px`;
const btn = `display:inline-block;background:#1a5d3f;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;margin:16px 0`;

export async function enviarConviteAssinatura(args: {
  to: string;
  nome: string;
  documentoNome: string;
  url: string;
  remetente?: string;
}) {
  const html = `
<div style="${baseStyle}">
  <div style="${greenHeader}">
    <h1 style="margin:0;font-size:20px;font-weight:600">Bio Logus Ambiental</h1>
    <p style="margin:4px 0 0;font-size:13px;opacity:.85">Soluções em Gestão de Resíduos</p>
  </div>
  <div style="${card}">
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a5d3f">Convite para assinatura eletrônica</h2>
    <p style="margin:0 0 8px">Olá, <strong>${escape(args.nome)}</strong>.</p>
    <p style="margin:0 0 8px">Você foi convidado(a) a assinar eletronicamente o documento:</p>
    <p style="margin:0 0 16px;padding:12px;background:#fff;border-left:3px solid #2d8a5f;font-weight:600">${escape(args.documentoNome)}</p>
    <p style="margin:0 0 8px">Clique no botão abaixo para revisar e assinar. O processo leva menos de 2 minutos.</p>
    <p style="text-align:center"><a href="${args.url}" style="${btn}">Assinar documento</a></p>
    <p style="margin:24px 0 0;font-size:12px;color:#666">Esta assinatura tem validade jurídica conforme a MP 2.200-2/2001, art. 10, §2º. O sistema captura IP, data/hora e código de confirmação enviado ao seu e-mail.</p>
    <p style="margin:8px 0 0;font-size:11px;color:#999">Se você não esperava este convite, ignore este e-mail.</p>
  </div>
</div>`;
  return send(args.to, `Assinatura solicitada: ${args.documentoNome}`, html);
}

export async function enviarCodigoOTP(args: { to: string; nome: string; codigo: string }) {
  const html = `
<div style="${baseStyle}">
  <div style="${greenHeader}">
    <h1 style="margin:0;font-size:20px;font-weight:600">Bio Logus Ambiental</h1>
  </div>
  <div style="${card}">
    <h2 style="margin:0 0 12px;font-size:18px;color:#1a5d3f">Seu código de assinatura</h2>
    <p style="margin:0 0 16px">Olá, <strong>${escape(args.nome)}</strong>. Digite o código abaixo na tela de assinatura para confirmar sua autoria:</p>
    <p style="text-align:center;margin:24px 0">
      <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:8px;color:#1a5d3f;background:#fff;padding:16px 28px;border-radius:8px;border:2px solid #2d8a5f;font-family:monospace">${args.codigo}</span>
    </p>
    <p style="margin:0;font-size:13px;color:#666;text-align:center">Válido por 10 minutos. Não compartilhe este código.</p>
  </div>
</div>`;
  return send(args.to, `Código de assinatura: ${args.codigo}`, html);
}

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
