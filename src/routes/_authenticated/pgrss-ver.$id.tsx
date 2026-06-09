import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { obterPropostaPgrss } from "@/lib/pgrss.functions";

export const Route = createFileRoute("/_authenticated/pgrss-ver/$id")({
  component: VerPgrssSimples,
});

function VerPgrssSimples() {
  const { id } = Route.useParams();
  const carregar = useServerFn(obterPropostaPgrss);
  const [html, setHtml] = useState("");
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(true);
  const [emailModal, setEmailModal] = useState(false);
  const [emailDest, setEmailDest] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    carregar({ data: { id } })
      .then((p) => {
        setHtml((p?.conteudo_html as string) || "");
        setNumero((p?.numero as string) || "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    if (!html) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:0}@media print{@page{size:A4;margin:10mm}}</style></head><body>${html}</body></html>`);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 3000);
    }, 600);
  };

  const handleWhatsApp = () => {
    const linkProposta = window.location.href;
    const texto = encodeURIComponent(
      `Olá! Segue a Proposta Comercial PGRSS nº ${numero} da Bio Logus Ambiental.\n\n` +
      `Para visualizar a proposta acesse o link abaixo:\n${linkProposta}\n\n` +
      `Dúvidas? Entre em contato:\n` +
      `📧 comercial@biologusambiental.com.br\n` +
      `📱 (62) 98423-6682`
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  const handleEmail = async () => {
    if (!emailDest.trim()) return;
    setSending(true);
    try {
      // Envia via mailto como fallback confiável
      const assunto = encodeURIComponent(`Proposta PGRSS nº ${numero} — Bio Logus Ambiental`);
      const corpo = encodeURIComponent(
        `Prezado(a),\n\nSegue em anexo a Proposta Comercial para Elaboração de PGRSS nº ${numero}.\n\n${emailMsg || "Para dúvidas, entre em contato conosco."}\n\nAtenciosamente,\nBio Logus Ambiental\ncomercial@biologusambiental.com.br\n(62) 98423-6682`
      );
      window.location.href = `mailto:${emailDest}?subject=${assunto}&body=${corpo}`;
      setEmailModal(false);
    } finally {
      setSending(false);
    }
  };

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:0;color:#111}</style></head><body>${html || "<p style='padding:40px'>Carregando...</p>"}</body></html>`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Barra superior */}
      <div style={{ background: "#0D6B54", padding: "10px 20px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <button
          onClick={() => window.location.href = "/propostas"}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,.4)", color: "#fff", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
        >
          ← Voltar
        </button>
        <span style={{ color: "#fff", fontWeight: 600, flex: 1, fontSize: "14px" }}>
          📄 Proposta PGRSS — {numero || id}
        </span>
        <button
          onClick={() => setEmailModal(true)}
          disabled={!html || loading}
          style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.4)", padding: "7px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", opacity: html ? 1 : 0.5 }}
        >
          ✉ E-mail
        </button>
        <button
          onClick={handleWhatsApp}
          disabled={!html || loading}
          style={{ background: "#25D366", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", opacity: html ? 1 : 0.5 }}
        >
          📱 WhatsApp
        </button>
        <button
          onClick={handlePrint}
          disabled={!html || loading}
          style={{ background: "#fff", color: "#0D6B54", border: "none", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", opacity: html ? 1 : 0.5 }}
        >
          Imprimir / PDF
        </button>
      </div>

      {/* Modal de e-mail */}
      {emailModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "min(480px,90vw)", display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>Enviar proposta por e-mail</h3>
            <div>
              <label style={{ fontSize: "12px", color: "#6B7671", display: "block", marginBottom: "4px" }}>E-mail do destinatário *</label>
              <input
                type="email"
                value={emailDest}
                onChange={e => setEmailDest(e.target.value)}
                placeholder="cliente@empresa.com"
                style={{ width: "100%", border: "1px solid #E2E8E5", borderRadius: "7px", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#6B7671", display: "block", marginBottom: "4px" }}>Mensagem (opcional)</label>
              <textarea
                value={emailMsg}
                onChange={e => setEmailMsg(e.target.value)}
                placeholder="Mensagem personalizada..."
                rows={3}
                style={{ width: "100%", border: "1px solid #E2E8E5", borderRadius: "7px", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
              Abrirá seu cliente de e-mail com a mensagem pré-preenchida.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setEmailModal(false)} style={{ padding: "8px 16px", borderRadius: "7px", border: "1px solid #E2E8E5", background: "#fff", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={handleEmail} disabled={!emailDest.trim() || sending} style={{ padding: "8px 16px", borderRadius: "7px", border: "none", background: "#0D6B54", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", opacity: emailDest ? 1 : 0.5 }}>
                {sending ? "Abrindo..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#6B7671" }}>
          Carregando proposta...
        </div>
      ) : (
        <iframe
          srcDoc={srcDoc}
          style={{ flex: 1, border: "none" }}
          title={numero}
        />
      )}
    </div>
  );
}
