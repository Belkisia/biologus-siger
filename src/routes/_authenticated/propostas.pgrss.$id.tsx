import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { obterPropostaPgrss } from "@/lib/pgrss.functions";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/propostas/pgrss/$id")({
  component: VerPgrss,
});

function VerPgrss() {
  const { id } = Route.useParams();
  const carregar = useServerFn(obterPropostaPgrss);
  const [html, setHtml] = useState<string>("");
  const [numero, setNumero] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    carregar({ data: { id } }).then((p) => {
      setHtml((p?.conteudo_html as string) || "");
      setNumero((p?.numero as string) || "");
    });
  }, [carregar, id]);

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#111;line-height:1.55}
    @media print{body{margin:0;padding:16px}}
    table{border-collapse:collapse}
  </style></head><body>${html || `<p>Carregando…</p>`}</body></html>`;

  const handlePrint = () => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.focus();
    w.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Link to="/propostas">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">Proposta {numero}</div>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" /> Imprimir / PDF
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          title={numero}
          style={{ width: "100%", height: "78vh", border: "none" }}
        />
      </div>
    </div>
  );
}
