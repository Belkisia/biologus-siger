import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/coletas")({
  component: ColetasPage,
});

type Coleta = {
  id: string;
  cliente_id: string;
  data_agendada: string;
  horario: string | null;
  tipo_residuo: string;
  grupo_residuo: string | null;
  quantidade_prevista: number | null;
  peso_real: number | null;
  unidade: string | null;
  motorista: string | null;
  veiculo: string | null;
  status: string;
  clientes?: { razao_social: string } | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  agendada: { label: "Agendada", variant: "secondary" },
  em_rota: { label: "Em Rota", variant: "outline" },
  coletada: { label: "Coletada", variant: "default" },
  finalizada: { label: "Finalizada", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

const GRUPOS = ["Grupo A — Infectante", "Grupo B — Químico", "Grupo C — Radioativo", "Grupo D — Comum", "Grupo E — Perfurocortante", "Industrial", "Óleo", "Lâmpadas", "Pilhas/Baterias"];

function ColetasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { user } = Route.useRouteContext();

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social").order("razao_social");
      return data ?? [];
    },
  });

  const { data: coletas = [], isLoading } = useQuery({
    queryKey: ["coletas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coletas")
        .select("*, clientes(razao_social)")
        .order("data_agendada", { ascending: false });
      if (error) throw error;
      return data as Coleta[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await supabase.from("coletas").insert({ ...payload, owner_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coletas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Coleta agendada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("coletas").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coletas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v) payload[k] = v; });
    if (!payload.cliente_id || !payload.data_agendada || !payload.tipo_residuo) {
      return toast.error("Preencha cliente, data e tipo de resíduo");
    }
    if (payload.quantidade_prevista) payload.quantidade_prevista = Number(payload.quantidade_prevista);
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coletas</h1>
          <p className="text-sm text-muted-foreground">Agenda operacional e rastreamento de coletas.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={clientes.length === 0}>
              <Plus className="h-4 w-4 mr-2" />Agendar coleta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Nova coleta</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Cliente *</Label>
                  <Select name="cliente_id" required>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_agendada">Data *</Label>
                  <Input id="data_agendada" name="data_agendada" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario">Janela / Horário</Label>
                  <Input id="horario" name="horario" placeholder="08:00 — 12:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_residuo">Tipo de Resíduo *</Label>
                  <Input id="tipo_residuo" name="tipo_residuo" required placeholder="Ex.: Perfurocortante" />
                </div>
                <div className="space-y-2">
                  <Label>Grupo</Label>
                  <Select name="grupo_residuo">
                    <SelectTrigger><SelectValue placeholder="Classificação" /></SelectTrigger>
                    <SelectContent>
                      {GRUPOS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade_prevista">Quantidade prevista (kg)</Label>
                  <Input id="quantidade_prevista" name="quantidade_prevista" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motorista">Motorista</Label>
                  <Input id="motorista" name="motorista" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="veiculo">Veículo</Label>
                  <Input id="veiculo" name="veiculo" placeholder="Placa ou identificador" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={2} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Agendar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {clientes.length === 0 && (
        <Card className="p-4 bg-warning/10 border-warning/30">
          <p className="text-sm">Cadastre um cliente em <strong>Clientes</strong> antes de agendar a primeira coleta.</p>
        </Card>
      )}

      <Card className="p-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : coletas.length === 0 ? (
          <div className="py-16 text-center">
            <Truck className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma coleta agendada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Resíduo</TableHead>
                <TableHead>Qtd. (kg)</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coletas.map((c) => {
                const s = STATUS_MAP[c.status] ?? STATUS_MAP.agendada;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">
                      {new Date(c.data_agendada).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="font-medium">{c.clientes?.razao_social ?? "—"}</TableCell>
                    <TableCell>
                      <div className="text-sm">{c.tipo_residuo}</div>
                      {c.grupo_residuo && <div className="text-xs text-muted-foreground">{c.grupo_residuo}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{c.peso_real ?? c.quantidade_prevista ?? "—"}</TableCell>
                    <TableCell className="text-sm">{c.motorista ?? "—"}</TableCell>
                    <TableCell>
                      <Select value={c.status} onValueChange={(v) => updateStatus.mutate({ id: c.id, status: v })}>
                        <SelectTrigger className="w-36 h-8">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_MAP).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
