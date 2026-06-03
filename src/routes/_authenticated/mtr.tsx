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
import { Plus, FileText, Loader2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mtr")({
  component: MTRPage,
});

type MTR = {
  id: string;
  numero: string;
  data_emissao: string;
  cliente_id: string;
  gerador: string | null;
  transportador: string | null;
  destinador: string | null;
  classe_ibama: string | null;
  codigo_residuo: string | null;
  descricao_residuo: string;
  quantidade: number;
  unidade: string;
  acondicionamento: string | null;
  tecnologia_destinacao: string | null;
  status: string;
  url_documento: string | null;
  observacoes: string | null;
  clientes?: { razao_social: string } | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  emitido: { label: "Emitido", variant: "secondary" },
  em_transporte: { label: "Em Transporte", variant: "outline" },
  recebido: { label: "Recebido", variant: "outline" },
  destinado: { label: "Destinado", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const CLASSES_IBAMA = ["Classe I — Perigoso", "Classe IIA — Não inerte", "Classe IIB — Inerte"];
const TECNOLOGIAS = ["Aterro Industrial", "Incineração", "Co-processamento", "Reciclagem", "Compostagem", "Autoclavagem", "Tratamento Químico"];

function MTRPage() {
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

  const { data: mtrs = [], isLoading } = useQuery({
    queryKey: ["mtrs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mtrs")
        .select("*, clientes(razao_social)")
        .order("data_emissao", { ascending: false });
      if (error) throw error;
      return data as MTR[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id } as never;
      const { error } = await supabase.from("mtrs").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      toast.success("MTR registrado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("mtrs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mtrs"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mtrs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      toast.success("MTR removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.cliente_id || !payload.numero || !payload.descricao_residuo) {
      return toast.error("Preencha cliente, número e descrição do resíduo");
    }
    if (payload.quantidade) payload.quantidade = Number(payload.quantidade);
    createMutation.mutate(payload);
  };

  const totalKg = mtrs.reduce((acc, m) => acc + (m.unidade === "kg" ? Number(m.quantidade) : 0), 0);
  const destinados = mtrs.filter((m) => m.status === "destinado").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">MTR — Manifesto de Transporte de Resíduos</h1>
          <p className="text-sm text-muted-foreground">Rastreabilidade legal do gerador ao destino final.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={clientes.length === 0}>
              <Plus className="h-4 w-4 mr-2" />Novo MTR
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar MTR</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente (Gerador) *</Label>
                  <Select name="cliente_id" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Nº MTR *</Label>
                  <Input id="numero" name="numero" required placeholder="MTR-2026-0001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_emissao">Data de emissão</Label>
                  <Input id="data_emissao" name="data_emissao" type="date" defaultValue={new Date().toISOString().slice(0,10)} />
                </div>
                <div className="space-y-2">
                  <Label>Classe IBAMA</Label>
                  <Select name="classe_ibama">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {CLASSES_IBAMA.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_residuo">Código IBAMA</Label>
                  <Input id="codigo_residuo" name="codigo_residuo" placeholder="ex.: 180103" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acondicionamento">Acondicionamento</Label>
                  <Input id="acondicionamento" name="acondicionamento" placeholder="Bombona, Caixa..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao_residuo">Descrição do resíduo *</Label>
                  <Input id="descricao_residuo" name="descricao_residuo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input id="quantidade" name="quantidade" type="number" step="0.001" />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select name="unidade" defaultValue="kg">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ton">ton</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="m3">m³</SelectItem>
                      <SelectItem value="un">un</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportador">Transportador</Label>
                  <Input id="transportador" name="transportador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinador">Destinador</Label>
                  <Input id="destinador" name="destinador" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Tecnologia de destinação</Label>
                  <Select name="tecnologia_destinacao">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TECNOLOGIAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="url_documento">URL do documento (PDF)</Label>
                  <Input id="url_documento" name="url_documento" type="url" placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" name="observacoes" rows={2} />
                </div>
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

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total de MTRs</p>
          <p className="text-2xl font-bold mt-1">{mtrs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Volume registrado (kg)</p>
          <p className="text-2xl font-bold mt-1 text-primary">{totalKg.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Destinados</p>
          <p className="text-2xl font-bold mt-1">{destinados}</p>
        </Card>
      </div>

      {clientes.length === 0 && (
        <Card className="p-4 bg-warning/10 border-warning/30">
          <p className="text-sm">Cadastre um cliente antes de registrar MTRs.</p>
        </Card>
      )}

      <Card className="p-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : mtrs.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum MTR registrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº MTR</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Gerador</TableHead>
                <TableHead>Resíduo</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Destinador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mtrs.map((m) => {
                const s = STATUS_MAP[m.status] ?? STATUS_MAP.emitido;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.numero}</TableCell>
                    <TableCell className="text-sm">{new Date(m.data_emissao).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{m.clientes?.razao_social ?? "—"}</TableCell>
                    <TableCell>
                      <div className="text-sm">{m.descricao_residuo}</div>
                      {m.classe_ibama && <div className="text-xs text-muted-foreground">{m.classe_ibama}</div>}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{Number(m.quantidade)} {m.unidade}</TableCell>
                    <TableCell className="text-sm">{m.destinador ?? "—"}</TableCell>
                    <TableCell>
                      <Select value={m.status} onValueChange={(v) => updateStatus.mutate({ id: m.id, status: v })}>
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {m.url_documento && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={m.url_documento} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm(`Remover MTR ${m.numero}?`)) deleteMutation.mutate(m.id);
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
