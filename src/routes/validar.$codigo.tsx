import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, ShieldX, Download } from "lucide-react";
import { validarCodigoAssinatura } from "@/lib/assinatura.functions";

export const Route = createFileRoute("/validar/$codigo")({
  component: ValidarPage,
});

function ValidarPage() {
  const { codigo } = Route.useParams();
  const validar = useServerFn(validarCodigoAssinatura);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    validar({ data: { codigo } })
      .then(setData)
      .finally(() => setLoading(false));
  }, [codigo, validar]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!data?.encontrado) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-muted/30">
        <Card className="max-w-md p-10 text-center">
          <ShieldX className="h-14 w-14 mx-auto text-destructive mb-3" />
          <h1 className="text-xl font-semibold">Código não encontrado</h1>
          <p className="text-sm text-muted-foreground mt-2">O código <strong className="font-mono">{codigo}</strong> não corresponde a nenhuma assinatura registrada.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-semibold">Assinatura válida</h1>
              <p className="text-sm opacity-90">Verificação pública de autenticidade · Bio Logus</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Código de verificação</p>
            <p className="text-2xl font-mono font-bold mt-1">{codigo}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Tipo do documento</p>
            <p className="capitalize mt-1">{data.documento_tipo}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Hash SHA-256 do documento</p>
            <p className="font-mono text-xs break-all bg-muted/50 p-3 rounded mt-1">{data.hash_documento}</p>
            <p className="text-xs text-muted-foreground mt-1">Garante que o conteúdo não foi alterado após a assinatura.</p>
          </div>

          {data.pdf_url && (
            <Button asChild className="w-full">
              <a href={data.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" /> Baixar PDF assinado
              </a>
            </Button>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Signatários ({data.todos_signatarios.length})</h2>
          <div className="space-y-3">
            {data.todos_signatarios.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{s.nome}</p>
                  <p className="text-xs text-muted-foreground">{s.email} · {s.papel}</p>
                  {s.assinado_em && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Assinado em {new Date(s.assinado_em).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
                <Badge variant={s.status === "assinado" ? "default" : "secondary"}>
                  {s.status === "assinado" ? "✓ Assinado" : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Assinatura eletrônica simples conforme MP 2.200-2/2001, art. 10, §2º · Validade jurídica entre as partes
        </p>
      </div>
    </div>
  );
}
