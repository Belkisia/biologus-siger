import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";

type ContratoView = {
  id: string;
  numero: string | null;
  conteudo_html: string | null;
  clientes?: { razao_social: string | null } | null;
};

export const Route = createFileRoute("/_authenticated/contratos/$contratoId")({
  component: ContratoViewerPage,
});

function ContratoViewerPage() {
  const { contratoId } = Route.useParams();

  const { data: contrato, isLoading, error } = useQuery({
    queryKey: ["contrato-view", contratoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("id, numero, conteudo_html, clientes(razao_social)")
        .eq("id", contratoId)
        .single();
      if (error) throw error;
      return data as ContratoView;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando contrato...
      </div>
    );
  }

  if (error || !contrato) {
    return <div className="p-8 text-sm text-destructive">Contrato não encontrado ou sem permissão de acesso.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-lg font-semibold">Contrato {contrato.numero || "—"}</h1>
          <p className="text-sm text-muted-foreground">{contrato.clientes?.razao_social || "Cliente não informado"}</p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
        </Button>
      </div>

      <div className="bg-white p-8 text-black shadow-sm print:p-0 print:shadow-none">
        {contrato.conteudo_html ? (
          <div dangerouslySetInnerHTML={{ __html: contrato.conteudo_html }} />
        ) : (
          <div className="py-16 text-center text-sm text-red-700">Contrato sem conteúdo HTML salvo.</div>
        )}
      </div>
    </div>
  );
}