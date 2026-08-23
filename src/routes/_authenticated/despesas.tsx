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
import { Plus, TrendingDown, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/despesas")({
  component: DespesasPage,
});

type Despesa = {
  id: string;
  descricao: string;
  categoria: string;
  fornecedor: string | null;
  data_vencimento: string;
  data_pagamento: string | null;
  valor: number;
  valor_pago: number | null;
  forma_pagamento: string | null;
  status: string;
  observacoes: string | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  paga: { label: "Paga", variant: "default" },
  vencida: { label: "Vencida", variant: "destructive" },
  cancelada: { label: "Cancelada", variant: "outline" },
};

const CATEGORIAS = [
  "Combustível",
  "Manutenção de veículos",
  "Água",
  "Energia",
  "Aluguel",
  "Internet/Telefone",
  "Salários",
  "Impostos",
  "Material de escritório",
  "EPI / Uniformes",
  "Seguro",
  "Contador",
  "Outros",
];

const FORMAS = ["Boleto", "PIX", "Transferência", "Cartão", "Dinheiro"];

function brl(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DespesasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<string>("todas");
  const { user } = Route.useRouteContext();

  const { data: despesas = [], isLoading } = useQuery({
    queryKey: ["despesas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas")
        .select("*")
        .order("data_vencimento", { ascending: false });
      if (error) throw error;
      const today = new Date().toISOString().slice(0, 10);
      return (data as Despesa[]).map((d) =>
        d.status === "pendente" && d.data_vencimento < today ? { ...d, status: "vencida" } : d,
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id } as never;
      const { error } = await supabase.from("despesas").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa lançada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const baixaMutation = useMutation({
    mutationFn: async (d: Despesa) => {
      const { error } = await supabase
        .from("despesas")
        .update({
          status: "paga",
          valor_pago: d.valor,
          data_pagamento: new Date().toISOString().slice(0, 10),
        })
        .eq("id", d.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["despesas"] });
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
      const { error } = await supabase.from("despesas").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["despesas"] }),
  });

  const editarValorMutation = useMutation({
    mutationFn: async ({ id, valor }: { id: string; valor: number }) => {
      const { error } = await supabase.from("despesas").update({ valor } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["despesas"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("despesas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["despesas"] });
      toast.success("Despesa removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.descricao || !payload.categoria || !payload.data_vencimento || !payload.valor) {
      return toast.error("Preencha descrição, categoria, vencimento e valor");
    }
    payload.valor = Number(payload.valor);
    createMutation.mutate(payload);
  };

  const kpis = useMemo(() => {
    const pago = despesas.filter((d) => d.status === "paga").reduce((a, d) => a + Number(d.valor_pago ?? 0), 0);
    const aPagar = despesas.filter((d) => d.status === "pendente").reduce((a, d) => a + Number(d.valor), 0);
    const vencido = despesas.filter((d) => d.status === "vencida").reduce((a, d) => a + Number(d.valor), 0);
    return { pago, aPagar, vencido, total: despesas.length };
  }, [despesas]);

  const filtradas = filtro === "todas" ? despesas : despesas.filter((d) => d.status === filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
          <p className="text-sm text-muted-foreground">Contas a pagar — combustível, água, energia, salários e outros gastos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />Nova despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Lançar despesa</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input id="descricao" name="descricao" required placeholder="Ex.: Abastecimento caminhão placa ABC-1234" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select name="categoria" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input id="fornecedor" name="fornecedor" placeholder="Ex.: Posto Ipiranga" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Vencimento *</Label>
                  <Input id="data_vencimento" name="data_vencimento" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input id="valor" name="valor" type="number" step="0.01" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Forma de pagamento</Label>
                  <Select name="forma_pagamento">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {FORMAS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                  Lançar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pago</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{brl(kpis.pago)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">A pagar</p>
          <p className="text-2xl font-bold mt-1">{brl(kpis.aPagar)}</p>
        </Card>
        <Card className="p-4 border-destructive/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Vencido</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{brl(kpis.vencido)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total despesas</p>
          <p className="text-2xl font-bold mt-1">{kpis.total}</p>
        </Card>
      </div>

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
            <TrendingDown className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma despesa encontrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pago em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((d) => {
                const s = STATUS_MAP[d.status] ?? STATUS_MAP.pendente;
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.descricao}</TableCell>
                    <TableCell><Badge variant="outline">{d.categoria}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.fornecedor ?? "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(d.data_vencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <button
                        className="hover:underline decoration-dashed underline-offset-2"
                        title="Clique para editar o valor"
                        onClick={() => {
                          const novo = window.prompt("Novo valor da despesa (R$):", String(d.valor));
                          if (novo === null) return;
                          const num = parseFloat(novo.replace(",", ".").replace(/[^\d.-]/g, ""));
                          if (isNaN(num) || num < 0) {
                            toast.error("Valor inválido");
                            return;
                          }
                          editarValorMutation.mutate({ id: d.id, valor: num });
                        }}
                      >
                        {brl(d.valor)}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.data_pagamento ? new Date(d.data_pagamento).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell>
                      <Select value={d.status} onValueChange={(v) => updateStatus.mutate({ id: d.id, status: v })}>
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
                        {d.status !== "paga" && d.status !== "cancelada" && (
                          <Button variant="ghost" size="icon" title="Dar baixa" onClick={() => baixaMutation.mutate(d)}>
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm(`Remover despesa "${d.descricao}"?`)) deleteMutation.mutate(d.id);
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
