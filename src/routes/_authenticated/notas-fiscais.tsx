import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Loader2, RefreshCw, XCircle, Download, Settings } from "lucide-react";
import { toast } from "sonner";
import { consultarNfse, cancelarNfse } from "@/lib/nfse.functions";

export const Route = createFileRoute("/_authenticated/notas-fiscais")({
  component: NotasFiscaisPage,
});

type Nota = {
  id: string; ref: string; status: string; ambiente: string;
  numero_nfse: string | null; codigo_verificacao: string | null;
  valor_servicos: number; aliquota: number | null; iss_valor: number | null;
  descricao: string; url_pdf: string | null; url_xml: string | null;
  mensagem_erro: string | null; data_emissao: string | null; created_at: string;
  cliente_id: string; fatura_id: string | null;
  clientes?: { razao_social: string } | null;
  faturas?: { numero: string } | null;
};

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  processando: { label: "Processando", variant: "secondary" },
  autorizada: { label: "Autorizada", variant: "default" },
  erro: { label: "Erro", variant: "destructive" },
  cancelada: { label: "Cancelada", variant: "outline" },
  rascunho: { label: "Rascunho", variant: "outline" },
};

const REGIMES = [
  { v: "simples_nacional", l: "Simples Nacional" },
  { v: "lucro_presumido", l: "Lucro Presumido" },
  { v: "lucro_real", l: "Lucro Real" },
];

function brl(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function NotasFiscaisPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [configOpen, setConfigOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState<Nota | null>(null);
  const [justificativa, setJustificativa] = useState("");

  const consultarFn = useServerFn(consultarNfse);
  const cancelarFn = useServerFn(cancelarNfse);

  const { data: emit } = useQuery({
    queryKey: ["emitente"],
    queryFn: async () => {
      const { data } = await supabase.from("emitente_config").select("*").eq("owner_id", user.id).maybeSingle();
      return data;
    },
  });

  const { data: notas = [], isLoading } = useQuery({
    queryKey: ["notas-fiscais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas_fiscais")
        .select("*, clientes(razao_social), faturas(numero)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Nota[];
    },
  });

  const salvarEmitente = useMutation({
    mutationFn: async (fd: FormData) => {
      const payload: Record<string, unknown> = { owner_id: user.id };
      fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
      payload.aliquota = Number(payload.aliquota || 0);
      payload.natureza_operacao = Number(payload.natureza_operacao || 1);
      payload.optante_simples_nacional = payload.optante_simples_nacional === "on";
      payload.incentivador_cultural = payload.incentivador_cultural === "on";
      payload.iss_retido = payload.iss_retido === "on";
      const { error } = await supabase.from("emitente_config").upsert(payload as never, { onConflict: "owner_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emitente"] });
      toast.success("Configuração salva");
      setConfigOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const consultarMut = useMutation({
    mutationFn: async (notaId: string) => consultarFn({ data: { notaId } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["notas-fiscais"] });
      if (r.mensagemErro) toast.error(r.mensagemErro);
      else toast.success("Status atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelarMut = useMutation({
    mutationFn: async () => {
      if (!cancelOpen) return;
      return cancelarFn({ data: { notaId: cancelOpen.id, justificativa } });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["notas-fiscais"] });
      if (r?.mensagemErro) toast.error(r.mensagemErro);
      else { toast.success("Nota cancelada"); setCancelOpen(null); setJustificativa(""); }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notas Fiscais (NFS-e)</h1>
          <p className="text-sm text-muted-foreground">
            Emissão via Focus NFe · Ambiente atual: <b>{emit?.ambiente ?? "não configurado"}</b>
          </p>
        </div>
        <Button variant="outline" onClick={() => setConfigOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />Configuração do emitente
        </Button>
      </div>

      {!emit && (
        <Card className="p-4 bg-warning/10 border-warning/30">
          <p className="text-sm">
            Configure os dados fiscais do prestador antes de emitir NFS-e. Clique em <b>Configuração do emitente</b>.
          </p>
        </Card>
      )}

      <Card className="p-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : notas.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma nota emitida. Vá até o Financeiro e clique em <b>Emitir NFS-e</b> em uma fatura.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº NFS-e</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>ISS</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-40 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.map((n) => {
                const s = STATUS[n.status] ?? STATUS.processando;
                return (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.numero_nfse ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm">{n.clientes?.razao_social ?? "—"}</TableCell>
                    <TableCell className="text-sm">{n.faturas?.numero ?? "—"}</TableCell>
                    <TableCell className="text-sm">{brl(n.valor_servicos)}</TableCell>
                    <TableCell className="text-sm">{brl(n.iss_valor)}</TableCell>
                    <TableCell className="text-sm">
                      {n.data_emissao ? new Date(n.data_emissao).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={s.variant}>{s.label}</Badge>
                        {n.mensagem_erro && <span className="text-[10px] text-destructive line-clamp-2">{n.mensagem_erro}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Atualizar status" disabled={consultarMut.isPending}
                          onClick={() => consultarMut.mutate(n.id)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        {n.url_pdf && (
                          <Button variant="ghost" size="icon" title="Baixar PDF" asChild>
                            <a href={n.url_pdf} target="_blank" rel="noreferrer"><Download className="h-4 w-4 text-primary" /></a>
                          </Button>
                        )}
                        {n.status === "autorizada" && (
                          <Button variant="ghost" size="icon" title="Cancelar NFS-e" onClick={() => setCancelOpen(n)}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Config emitente */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Configuração do emitente (Focus NFe)</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); salvarEmitente.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Razão social *</Label>
                <Input name="razao_social" required defaultValue={emit?.razao_social ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input name="cnpj" required defaultValue={emit?.cnpj ?? ""} placeholder="Só números" />
              </div>
              <div className="space-y-2">
                <Label>Inscrição municipal *</Label>
                <Input name="inscricao_municipal" required defaultValue={emit?.inscricao_municipal ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Regime tributário</Label>
                <Select name="regime_tributario" defaultValue={emit?.regime_tributario ?? "simples_nacional"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REGIMES.map((r) => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ambiente</Label>
                <Select name="ambiente" defaultValue={emit?.ambiente ?? "homologacao"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homologacao">Homologação (teste)</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Item da lista de serviço *</Label>
                <Input name="item_lista_servico" required defaultValue={emit?.item_lista_servico ?? ""} placeholder="Ex.: 17.05" />
              </div>
              <div className="space-y-2">
                <Label>Código tributário municipal *</Label>
                <Input name="codigo_tributario_municipio" required defaultValue={emit?.codigo_tributario_municipio ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Alíquota ISS (0-1)</Label>
                <Input name="aliquota" type="number" step="0.0001" min="0" max="1" defaultValue={emit?.aliquota ?? 0} />
              </div>
              <div className="space-y-2">
                <Label>Natureza da operação</Label>
                <Input name="natureza_operacao" type="number" min="1" max="6" defaultValue={emit?.natureza_operacao ?? 1} />
              </div>
              <div className="space-y-2">
                <Label>Código IBGE município prestador *</Label>
                <Input name="endereco_codigo_municipio" required defaultValue={emit?.endereco_codigo_municipio ?? ""} placeholder="Ex.: 5208707" />
              </div>
              <div className="space-y-2">
                <Label>UF prestador</Label>
                <Input name="endereco_uf" defaultValue={emit?.endereco_uf ?? ""} maxLength={2} />
              </div>
              <div className="flex items-center gap-6 md:col-span-2 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="optante_simples_nacional" defaultChecked={emit?.optante_simples_nacional ?? true} /> Optante Simples Nacional
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="incentivador_cultural" defaultChecked={emit?.incentivador_cultural ?? false} /> Incentivador cultural
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="iss_retido" defaultChecked={emit?.iss_retido ?? false} /> ISS retido
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setConfigOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={salvarEmitente.isPending}>
                {salvarEmitente.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancelar */}
      <Dialog open={!!cancelOpen} onOpenChange={(o) => !o && setCancelOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar NFS-e {cancelOpen?.numero_nfse}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Justificativa (mín. 15 caracteres)</Label>
            <Textarea rows={3} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(null)}>Voltar</Button>
            <Button variant="destructive" disabled={justificativa.length < 15 || cancelarMut.isPending}
              onClick={() => cancelarMut.mutate()}>
              {cancelarMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
