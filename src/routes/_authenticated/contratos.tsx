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
import { Plus, FileSignature, Loader2, Trash2, PenTool, Eye, Mail } from "lucide-react";
import { toast } from "sonner";
import { AssinaturaDialog } from "@/components/AssinaturaDialog";
import { useServerFn } from "@tanstack/react-start";
import { visualizarContrato, enviarContratoEmail } from "@/lib/contrato.functions";


export const Route = createFileRoute("/_authenticated/contratos")({
  component: ContratosPage,
});

type Contrato = {
  id: string;
  cliente_id: string;
  numero: string;
  objeto: string | null;
  data_inicio: string;
  data_fim: string | null;
  valor_mensal: number | null;
  indice_reajuste: string | null;
  periodicidade_reajuste: string | null;
  dia_vencimento: number | null;
  forma_pagamento: string | null;
  status: string;
  observacoes: string | null;
  clientes?: { razao_social: string } | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ativo: { label: "Ativo", variant: "default" },
  suspenso: { label: "Suspenso", variant: "outline" },
  encerrado: { label: "Encerrado", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const INDICES = ["IPCA", "IGP-M", "INPC", "IPC-FIPE", "Personalizado"];

function formatBRL(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ContratosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { user } = Route.useRouteContext();

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social, cnpj, email").order("razao_social");
      return data ?? [];
    },
  });

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ["contratos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*, clientes(razao_social)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contrato[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id } as never;
      const { error } = await supabase.from("contratos").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato cadastrado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contratos").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contratos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contratos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.cliente_id || !payload.numero || !payload.data_inicio) {
      return toast.error("Preencha cliente, número e data de início");
    }
    if (payload.valor_mensal) payload.valor_mensal = Number(payload.valor_mensal);
    if (payload.dia_vencimento) payload.dia_vencimento = Number(payload.dia_vencimento);
    createMutation.mutate(payload);
  };

  const totalMensal = contratos
    .filter((c) => c.status === "ativo")
    .reduce((acc, c) => acc + (c.valor_mensal ?? 0), 0);

  const [assinaturaContrato, setAssinaturaContrato] = useState<Contrato | null>(null);


  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contratos</h1>
          <p className="text-sm text-muted-foreground">Gestão de contratos comerciais, vigências e reajustes.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={clientes.length === 0}>
              <Plus className="h-4 w-4 mr-2" />Novo contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo contrato</DialogTitle></DialogHeader>
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
                  <Label htmlFor="numero">Número *</Label>
                  <Input id="numero" name="numero" required placeholder="CTR-2026-0001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Início *</Label>
                  <Input id="data_inicio" name="data_inicio" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Término</Label>
                  <Input id="data_fim" name="data_fim" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_mensal">Valor mensal (R$)</Label>
                  <Input id="valor_mensal" name="valor_mensal" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Índice de reajuste</Label>
                  <Select name="indice_reajuste">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {INDICES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Periodicidade reajuste</Label>
                  <Select name="periodicidade_reajuste" defaultValue="anual">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dia_vencimento">Dia vencimento</Label>
                  <Input id="dia_vencimento" name="dia_vencimento" type="number" min="1" max="31" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
                  <Input id="forma_pagamento" name="forma_pagamento" placeholder="Boleto, PIX..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="objeto">Objeto do contrato</Label>
                  <Textarea id="objeto" name="objeto" rows={2} placeholder="Coleta, transporte e destinação final..." />
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
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Contratos ativos</p>
          <p className="text-2xl font-bold mt-1">{contratos.filter((c) => c.status === "ativo").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Receita mensal recorrente</p>
          <p className="text-2xl font-bold mt-1 text-primary">{formatBRL(totalMensal)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total cadastrado</p>
          <p className="text-2xl font-bold mt-1">{contratos.length}</p>
        </Card>
      </div>

      {clientes.length === 0 && (
        <Card className="p-4 bg-warning/10 border-warning/30">
          <p className="text-sm">Cadastre um cliente em <strong>Clientes</strong> antes de criar contratos.</p>
        </Card>
      )}

      <Card className="p-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : contratos.length === 0 ? (
          <div className="py-16 text-center">
            <FileSignature className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum contrato cadastrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Valor mensal</TableHead>
                <TableHead>Reajuste</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratos.map((c) => {
                const s = STATUS_MAP[c.status] ?? STATUS_MAP.ativo;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.numero}</TableCell>
                    <TableCell>{c.clientes?.razao_social ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(c.data_inicio).toLocaleDateString("pt-BR")}
                      {c.data_fim && <> → {new Date(c.data_fim).toLocaleDateString("pt-BR")}</>}
                    </TableCell>
                    <TableCell className="text-sm">{formatBRL(c.valor_mensal)}</TableCell>
                    <TableCell className="text-sm">
                      {c.indice_reajuste ?? "—"}
                      {c.periodicidade_reajuste && <div className="text-xs text-muted-foreground">{c.periodicidade_reajuste}</div>}
                    </TableCell>
                    <TableCell>
                      <Select value={c.status} onValueChange={(v) => updateStatus.mutate({ id: c.id, status: v })}>
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
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Enviar para assinatura" onClick={() => setAssinaturaContrato(c)}>
                          <PenTool className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Remover" onClick={() => {
                          if (confirm(`Remover contrato ${c.numero}?`)) deleteMutation.mutate(c.id);
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

      <AssinaturaDialog
        open={!!assinaturaContrato}
        onOpenChange={(v) => !v && setAssinaturaContrato(null)}
        documentoTipo="contrato"
        documentoId={assinaturaContrato?.id ?? null}
        clienteSugerido={
          assinaturaContrato
            ? {
                nome: clientes.find((cl) => cl.id === assinaturaContrato.cliente_id)?.razao_social || "",
                email: (clientes.find((cl) => cl.id === assinaturaContrato.cliente_id) as any)?.email || "",
                cpf_cnpj: (clientes.find((cl) => cl.id === assinaturaContrato.cliente_id) as any)?.cnpj || "",
              }
            : null
        }
      />
    </div>
  );
}
