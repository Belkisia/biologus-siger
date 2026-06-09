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
          onClick={handlePrint}
          disabled={!html || loading}
          style={{ background: "#fff", color: "#0D6B54", border: "none", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", opacity: html ? 1 : 0.5 }}
        >
          Imprimir / PDF
        </button>
      </div>

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
