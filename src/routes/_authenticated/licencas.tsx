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
import { Plus, Shield, Loader2, Trash2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { DocumentUpload, OpenDocumentButton } from "@/components/document-upload";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/licencas")({
  component: LicencasPage,
});

type Licenca = {
  id: string;
  cliente_id: string | null;
  numero: string;
  tipo: string;
  orgao_emissor: string;
  data_emissao: string;
  data_validade: string;
  status: string;
  escopo: string | null;
  condicionantes: string | null;
  arquivo_url: string | null;
  observacoes: string | null;
  clientes?: { razao_social: string } | null;
};

const TIPOS = [
  "Licença Prévia (LP)",
  "Licença de Instalação (LI)",
  "Licença de Operação (LO)",
  "Licença de Operação de Coleta e Transporte",
  "Autorização Ambiental",
  "Alvará Sanitário",
  "AVCB / CLCB",
  "Cadastro Técnico Federal (CTF/IBAMA)",
  "Outorga de Recursos Hídricos",
  "Outro",
];

const ORGAOS = ["IBAMA", "CETESB", "INEA", "FEAM", "IAT", "IMA", "SEMA", "Prefeitura Municipal", "Corpo de Bombeiros", "Vigilância Sanitária", "Outro"];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ativa: { label: "Ativa", variant: "default" },
  vencida: { label: "Vencida", variant: "destructive" },
  em_renovacao: { label: "Em Renovação", variant: "outline" },
  suspensa: { label: "Suspensa", variant: "secondary" },
  cancelada: { label: "Cancelada", variant: "secondary" },
};

function diasParaVencer(validade: string): number {
  const d = new Date(validade);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function alertaVencimento(dias: number) {
  if (dias < 0) return { color: "text-destructive", label: `Vencida há ${Math.abs(dias)}d`, icon: AlertTriangle };
  if (dias <= 30) return { color: "text-destructive", label: `Vence em ${dias}d`, icon: AlertTriangle };
  if (dias <= 90) return { color: "text-amber-600", label: `Vence em ${dias}d`, icon: Clock };
  return { color: "text-muted-foreground", label: `Vence em ${dias}d`, icon: CheckCircle2 };
}

function LicencasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [arquivoPath, setArquivoPath] = useState<string | null>(null);
  const { user } = Route.useRouteContext();

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social").order("razao_social");
      return data ?? [];
    },
  });

  const { data: licencas = [], isLoading } = useQuery({
    queryKey: ["licencas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licencas")
        .select("*, clientes(razao_social)")
        .order("data_validade", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Licenca[];
    },
  });

  const kpis = useMemo(() => {
    const total = licencas.length;
    const ativas = licencas.filter((l) => l.status === "ativa").length;
    const vencidas = licencas.filter((l) => diasParaVencer(l.data_validade) < 0).length;
    const vencendo = licencas.filter((l) => {
      const d = diasParaVencer(l.data_validade);
      return d >= 0 && d <= 90;
    }).length;
    return { total, ativas, vencidas, vencendo };
  }, [licencas]);

  const createMutation = useMutation({
    mutationFn: async (form: FormData) => {
      const cliente_id = form.get("cliente_id") as string;
      const payload = {
        owner_id: user.id,
        cliente_id: cliente_id && cliente_id !== "none" ? cliente_id : null,
        numero: form.get("numero") as string,
        tipo: form.get("tipo") as string,
        orgao_emissor: form.get("orgao_emissor") as string,
        data_emissao: form.get("data_emissao") as string,
        data_validade: form.get("data_validade") as string,
        status: (form.get("status") as string) || "ativa",
        escopo: (form.get("escopo") as string) || null,
        condicionantes: (form.get("condicionantes") as string) || null,
        arquivo_url: arquivoPath,
        observacoes: (form.get("observacoes") as string) || null,
      };
      const { error } = await supabase.from("licencas").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Licença cadastrada");
      qc.invalidateQueries({ queryKey: ["licencas"] });
      setArquivoPath(null);
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("licencas").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["licencas"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("licencas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Licença removida");
      qc.invalidateQueries({ queryKey: ["licencas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /> Licenças Ambientais
          </h1>
          <p className="text-muted-foreground">Controle de vigência e renovação de licenças e autorizações</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Licença</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Cadastrar Licença</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número *</Label>
                  <Input name="numero" required />
                </div>
                <div>
                  <Label>Tipo *</Label>
                  <Select name="tipo" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Órgão Emissor *</Label>
                  <Select name="orgao_emissor" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{ORGAOS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cliente (opcional)</Label>
                  <Select name="cliente_id">
                    <SelectTrigger><SelectValue placeholder="Própria empresa" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Própria empresa</SelectItem>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Emissão *</Label>
                  <Input name="data_emissao" type="date" required />
                </div>
                <div>
                  <Label>Data de Validade *</Label>
                  <Input name="data_validade" type="date" required />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select name="status" defaultValue="ativa">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <DocumentUpload folder="licencas" value={arquivoPath} onChange={setArquivoPath} label="Arquivo da licença" />
                </div>
              </div>
              <div>
                <Label>Escopo</Label>
                <Textarea name="escopo" placeholder="Atividades licenciadas..." />
              </div>
              <div>
                <Label>Condicionantes</Label>
                <Textarea name="condicionantes" placeholder="Exigências e condicionantes da licença..." />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea name="observacoes" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{kpis.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ativas</p>
          <p className="text-2xl font-bold text-primary">{kpis.ativas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Vencendo (≤90d)</p>
          <p className="text-2xl font-bold text-amber-600">{kpis.vencendo}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Vencidas</p>
          <p className="text-2xl font-bold text-destructive">{kpis.vencidas}</p>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Alerta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin inline" /></TableCell></TableRow>}
            {!isLoading && licencas.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma licença cadastrada</TableCell></TableRow>
            )}
            {licencas.map((l) => {
              const dias = diasParaVencer(l.data_validade);
              const alerta = alertaVencimento(dias);
              const Icon = alerta.icon;
              const st = STATUS_MAP[l.status] ?? { label: l.status, variant: "secondary" as const };
              return (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.numero}</TableCell>
                  <TableCell className="text-sm">{l.tipo}</TableCell>
                  <TableCell>{l.orgao_emissor}</TableCell>
                  <TableCell>{l.clientes?.razao_social ?? "—"}</TableCell>
                  <TableCell>{new Date(l.data_validade).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 text-sm font-medium ${alerta.color}`}>
                      <Icon className="h-4 w-4" /> {alerta.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select value={l.status} onValueChange={(v) => updateStatus.mutate({ id: l.id, status: v })}>
                      <SelectTrigger className="w-36"><Badge variant={st.variant}>{st.label}</Badge></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { if (confirm("Excluir licença?")) deleteMutation.mutate(l.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
