import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Scale, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DocumentUpload, OpenDocumentButton } from "@/components/document-upload";

export const Route = createFileRoute("/_authenticated/descargas")({
  component: DescargasPage,
});

type Descarga = {
  id: string;
  data_descarga: string;
  peso_kg: number;
  destinador: string | null;
  numero_ticket: string | null;
  observacoes: string | null;
  url_ticket: string | null;
};

function DescargasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [urlTicket, setUrlTicket] = useState<string | null>(null);
  const { user } = Route.useRouteContext();

  const { data: descargas = [], isLoading } = useQuery({
    queryKey: ["descargas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("descargas_destino")
        .select("*")
        .order("data_descarga", { ascending: false });
      if (error) throw error;
      return data as Descarga[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id, url_ticket: urlTicket } as never;
      const { error } = await supabase.from("descargas_destino").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["descargas"] });
      toast.success("Pesagem registrada");
      setOpen(false);
      setUrlTicket(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("descargas_destino").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["descargas"] });
      toast.success("Registro removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.data_descarga || !payload.peso_kg) {
      return toast.error("Preencha a data e o peso");
    }
    payload.peso_kg = Number(payload.peso_kg);
    createMutation.mutate(payload);
  };

  const kpis = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7);
    const totalGeral = descargas.reduce((a, d) => a + Number(d.peso_kg), 0);
    const totalMesAtual = descargas
      .filter((d) => d.data_descarga.slice(0, 7) === mesAtual)
      .reduce((a, d) => a + Number(d.peso_kg), 0);
    const ultima = descargas[0];
    return { totalGeral, totalMesAtual, ultima, qtd: descargas.length };
  }, [descargas]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Descarga no Destino</h1>
          <p className="text-sm text-muted-foreground">Pesagem registrada a cada descarga na B-Green (ticket semanal), independente dos MTRs individuais.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setUrlTicket(null); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />Registrar pesagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar pesagem na descarga</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_descarga">Data *</Label>
                  <Input id="data_descarga" name="data_descarga" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso_kg">Peso do ticket (kg) *</Label>
                  <Input id="peso_kg" name="peso_kg" type="number" step="0.01" min="0" required placeholder="Ex.: 1250" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinador">Destinador</Label>
                <Input id="destinador" name="destinador" defaultValue="B-GREEN GESTAO AMBIENTAL S.A." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_ticket">Nº do ticket / nota de pesagem</Label>
                <Input id="numero_ticket" name="numero_ticket" placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label>Foto/PDF do ticket</Label>
                <DocumentUpload folder="descargas" value={urlTicket} onChange={setUrlTicket} label="Ticket de pesagem" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={2} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Registrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pesagens registradas</p>
          <p className="text-2xl font-bold mt-1">{kpis.qtd}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total descarregado (kg)</p>
          <p className="text-2xl font-bold mt-1">{kpis.totalGeral.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Descarregado este mês (kg)</p>
          <p className="text-2xl font-bold mt-1 text-primary">{kpis.totalMesAtual.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Última pesagem</p>
          <p className="text-2xl font-bold mt-1">{kpis.ultima ? `${Number(kpis.ultima.peso_kg).toLocaleString("pt-BR")} kg` : "—"}</p>
          {kpis.ultima && <p className="text-xs text-muted-foreground">{new Date(kpis.ultima.data_descarga + "T12:00:00").toLocaleDateString("pt-BR")}</p>}
        </Card>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : descargas.length === 0 ? (
          <div className="py-16 text-center">
            <Scale className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma pesagem registrada ainda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Destinador</TableHead>
                <TableHead>Nº ticket</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {descargas.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-sm font-medium">{new Date(d.data_descarga + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-sm font-semibold">{Number(d.peso_kg).toLocaleString("pt-BR")} kg</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.destinador ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.numero_ticket ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-56 truncate">{d.observacoes ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <OpenDocumentButton path={d.url_ticket} />
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (confirm("Remover essa pesagem?")) deleteMutation.mutate(d.id);
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
