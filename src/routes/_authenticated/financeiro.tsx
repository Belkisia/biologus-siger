import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
import { Plus, DollarSign, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/financeiro")({
  component: FinanceiroPage,
});

type Fatura = {
  id: string;
  numero: string;
  competencia: string;
  data_emissao: string;
  data_vencimento: string;
  valor: number;
  valor_pago: number | null;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  status: string;
  descricao: string | null;
  cliente_id: string;
  contrato_id: string | null;
  clientes?: { razao_social: string } | null;
  contratos?: { numero: string } | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  paga: { label: "Paga", variant: "default" },
  vencida: { label: "Vencida", variant: "destructive" },
  cancelada: { label: "Cancelada", variant: "outline" },
};

const FORMAS = ["Boleto", "PIX", "Transferência", "Cartão", "Dinheiro"];

function brl(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function FinanceiroPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<string>("todas");
  const { user } = Route.useRouteContext();

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social").order('razao_social', { ascending: true });
      return data ?? [];
    },
  });

  const { data: contratos = [] } = useQuery({
    queryKey: ["contratos-select"],
    queryFn: async () => {
      const { data } = await supabase.from("contratos").select("id, numero, cliente_id");
      return data ?? [];
    },
  });

  const { data: faturas = [], isLoading } = useQuery({
    queryKey: ["faturas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("*, clientes(razao_social), contratos(numero)")
        .order("data_vencimento", { ascending: false });
      if (error) throw error;
      // marcar vencidas client-side (sem persistir até o pagamento ou edição)
      const today = new Date().toISOString().slice(0, 10);
      return (data as Fatura[]).map((f) =>
        f.status === "pendente" && f.data_vencimento < today ? { ...f, status: "vencida" } : f
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id } as never;
      const { error } = await supabase.from("faturas").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faturas"] });
      toast.success("Fatura emitida");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const baixaMutation = useMutation({
    mutationFn: async (f: Fatura) => {
      const { error } = await supabase
        .from("faturas")
        .update({
          status: "paga",
          valor_pago: f.valor,
          data_pagamento: new Date().toISOString().slice(0, 10),
        })
        .eq("id", f.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faturas"] });
      toast.success("Pagamento registrado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: Record<string, unknown> = { status };
      if (status !== "paga") {
        patch.valor_pago = null;
        patch.data_pagamento = null;
      }
      const { error } = await supabase.from("faturas").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faturas"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faturas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faturas"] });
      toast.success("Fatura removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.cliente_id || !payload.numero || !payload.competencia || !payload.data_vencimento || !payload.valor) {
      return toast.error("Preencha cliente, número, competência, vencimento e valor");
    }
    payload.valor = Number(payload.valor);
    createMutation.mutate(payload);
  };

  const kpis = useMemo(() => {
    const recebido = faturas.filter((f) => f.status === "paga").reduce((a, f) => a + Number(f.valor_pago ?? 0), 0);
    const aReceber = faturas.filter((f) => f.status === "pendente").reduce((a, f) => a + Number(f.valor), 0);
    const vencido = faturas.filter((f) => f.status === "vencida").reduce((a, f) => a + Number(f.valor), 0);
    return { recebido, aReceber, vencido, total: faturas.length };
  }, [faturas]);

  const filtradas = filtro === "todas" ? faturas : faturas.filter((f) => f.status === filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Contas a receber, baixas e inadimplência.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={clientes.length === 0}>
              <Plus className="h-4 w-4 mr-2" />Nova fatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Emitir fatura</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Cliente *</Label>
                  <Select name="cliente_id" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Contrato (opcional)</Label>
                  <Select name="contrato_id">
                    <SelectTrigger><SelectValue placeholder="Sem contrato" /></SelectTrigger>
                    <SelectContent>
                      {contratos.map((c) => <SelectItem key={c.id} value={c.id}>{c.numero}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Nº fatura *</Label>
                  <Input id="numero" name="numero" required placeholder="FAT-2026-0001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competencia">Competência *</Label>
                  <Input id="competencia" name="competencia" required placeholder="2026-06" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_emissao">Emissão</Label>
                  <Input id="data_emissao" name="data_emissao" type="date" defaultValue={new Date().toISOString().slice(0,10)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Vencimento *</Label>
                  <Input id="data_vencimento" name="data_vencimento" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input id="valor" name="valor" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label>Forma de pagamento</Label>
                  <Select name="forma_pagamento">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {FORMAS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input id="descricao" name="descricao" placeholder="Serviços prestados em..." />
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
                  Emitir
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Recebido</p>
          <p className="text-2xl font-bold mt-1 text-primary">{brl(kpis.recebido)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">A receber</p>
          <p className="text-2xl font-bold mt-1">{brl(kpis.aReceber)}</p>
        </Card>
        <Card className="p-4 border-destructive/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Vencido</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{brl(kpis.vencido)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total faturas</p>
          <p className="text-2xl font-bold mt-1">{kpis.total}</p>
        </Card>
      </div>

      {clientes.length === 0 && (
        <Card className="p-4 bg-warning/10 border-warning/30">
          <p className="text-sm">Cadastre um cliente antes de emitir faturas.</p>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {["todas", "pendente", "paga", "vencida", "cancelada"].map((s) => (
              <Button key={s} size="sm" variant={filtro === s ? "default" : "outline"} onClick={() => setFiltro(s)}>
                {s === "todas" ? "Todas" : STATUS_MAP[s]?.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : filtradas.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma fatura encontrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pago em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((f) => {
                const s = STATUS_MAP[f.status] ?? STATUS_MAP.pendente;
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.numero}</TableCell>
                    <TableCell>
                      <div className="text-sm">{f.clientes?.razao_social ?? "—"}</div>
                      {f.contratos?.numero && <div className="text-xs text-muted-foreground">{f.contratos.numero}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{f.competencia}</TableCell>
                    <TableCell className="text-sm">{new Date(f.data_vencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm font-medium">{brl(f.valor)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {f.data_pagamento ? new Date(f.data_pagamento).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell>
                      <Select value={f.status} onValueChange={(v) => updateStatus.mutate({ id: f.id, status: v })}>
                        <SelectTrigger className="w-32 h-8">
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
                        {f.status !== "paga" && f.status !== "cancelada" && (
                          <Button variant="ghost" size="icon" title="Dar baixa" onClick={() => baixaMutation.mutate(f)}>
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm(`Remover fatura ${f.numero}?`)) deleteMutation.mutate(f.id);
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
