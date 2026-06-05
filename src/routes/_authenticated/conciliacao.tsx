import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Loader2, Link2, X, CheckCircle2, Landmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { parseOfx } from "@/lib/ofx-parser";

export const Route = createFileRoute("/_authenticated/conciliacao")({
  component: ConciliacaoPage,
});

type Conta = { id: string; nome: string; banco: string | null; saldo_inicial: number };
type Lanc = {
  id: string;
  data_lancamento: string;
  tipo: string;
  valor: number;
  descricao: string | null;
  memo: string | null;
  status: string;
  fatura_id: string | null;
  conta_id: string;
  faturas?: { numero: string; clientes?: { razao_social: string } | null } | null;
};
type Fatura = {
  id: string;
  numero: string;
  valor: number;
  data_vencimento: string;
  status: string;
  clientes?: { razao_social: string } | null;
};

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ConciliacaoPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [contaSel, setContaSel] = useState<string>("");
  const [openConta, setOpenConta] = useState(false);
  const [filtro, setFiltro] = useState("pendente");
  const [matchLanc, setMatchLanc] = useState<Lanc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: contas = [] } = useQuery({
    queryKey: ["contas-bancarias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contas_bancarias").select("*").order("nome");
      if (error) throw error;
      if (data && data.length && !contaSel) setContaSel(data[0].id);
      return data as Conta[];
    },
  });

  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ["extrato", contaSel],
    enabled: !!contaSel,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extrato_lancamentos")
        .select("*, faturas(numero, clientes(razao_social))")
        .eq("conta_id", contaSel)
        .order("data_lancamento", { ascending: false });
      if (error) throw error;
      return data as Lanc[];
    },
  });

  const { data: faturasPend = [] } = useQuery({
    queryKey: ["faturas-conciliar"],
    queryFn: async () => {
      const { data } = await supabase
        .from("faturas")
        .select("id, numero, valor, data_vencimento, status, clientes(razao_social)")
        .in("status", ["pendente", "vencida"])
        .order("data_vencimento");
      return (data ?? []) as Fatura[];
    },
  });

  const createConta = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await supabase.from("contas_bancarias").insert({ ...payload, owner_id: user.id } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta cadastrada");
      setOpenConta(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const importOfx = useMutation({
    mutationFn: async (file: File) => {
      if (!contaSel) throw new Error("Selecione uma conta");
      const text = await file.text();
      const txns = parseOfx(text);
      if (!txns.length) throw new Error("Nenhuma transação encontrada no OFX");
      const rows = txns.map((t) => ({
        owner_id: user.id,
        conta_id: contaSel,
        fit_id: t.fitId,
        data_lancamento: t.date,
        tipo: t.type,
        valor: t.amount,
        memo: t.memo,
        descricao: t.memo,
      }));
      // upsert para evitar duplicar pelo FITID
      const { error, count } = await supabase
        .from("extrato_lancamentos")
        .upsert(rows as never, { onConflict: "conta_id,fit_id", ignoreDuplicates: true, count: "exact" });
      if (error) throw error;
      return { total: txns.length, inseridos: count ?? 0 };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["extrato"] });
      toast.success(`OFX importado: ${r.inseridos} novos de ${r.total} lançamentos`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const conciliar = useMutation({
    mutationFn: async ({ lancId, faturaId, fatura }: { lancId: string; faturaId: string; fatura: Fatura }) => {
      const { error: e1 } = await supabase
        .from("extrato_lancamentos")
        .update({ status: "conciliado", fatura_id: faturaId, conciliado_em: new Date().toISOString() })
        .eq("id", lancId);
      if (e1) throw e1;
      // dar baixa na fatura
      const { error: e2 } = await supabase
        .from("faturas")
        .update({
          status: "paga",
          valor_pago: fatura.valor,
          data_pagamento: new Date().toISOString().slice(0, 10),
        })
        .eq("id", faturaId);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extrato"] });
      qc.invalidateQueries({ queryKey: ["faturas-conciliar"] });
      qc.invalidateQueries({ queryKey: ["faturas"] });
      toast.success("Conciliado e fatura baixada");
      setMatchLanc(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: Record<string, unknown> = { status };
      if (status !== "conciliado") {
        patch.fatura_id = null;
        patch.conciliado_em = null;
      }
      const { error } = await supabase.from("extrato_lancamentos").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["extrato"] }),
  });

  const delLanc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("extrato_lancamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extrato"] });
      toast.success("Lançamento removido");
    },
  });

  const contaAtual = contas.find((c) => c.id === contaSel);

  const kpis = useMemo(() => {
    const creditos = lancamentos.filter((l) => l.valor > 0).reduce((a, l) => a + Number(l.valor), 0);
    const debitos = lancamentos.filter((l) => l.valor < 0).reduce((a, l) => a + Number(l.valor), 0);
    const pendentes = lancamentos.filter((l) => l.status === "pendente").length;
    const saldo = (contaAtual?.saldo_inicial ?? 0) + creditos + debitos;
    return { creditos, debitos, pendentes, saldo };
  }, [lancamentos, contaAtual]);

  const filtrados = filtro === "todos" ? lancamentos : lancamentos.filter((l) => l.status === filtro);

  // sugestões de match: faturas com valor igual ao crédito (tolerância 0,01) e até 30 dias antes/depois
  const sugerirFaturas = (l: Lanc): Fatura[] => {
    if (l.valor <= 0) return [];
    const valor = Math.abs(Number(l.valor));
    return faturasPend
      .filter((f) => Math.abs(Number(f.valor) - valor) < 0.01)
      .sort((a, b) => Math.abs(new Date(a.data_vencimento).getTime() - new Date(l.data_lancamento).getTime()) -
                      Math.abs(new Date(b.data_vencimento).getTime() - new Date(l.data_lancamento).getTime()));
  };

  const handleConta = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") p[k] = v; });
    if (!p.nome) return toast.error("Informe o nome da conta");
    if (p.saldo_inicial) p.saldo_inicial = Number(p.saldo_inicial);
    createConta.mutate(p);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conciliação Bancária</h1>
          <p className="text-sm text-muted-foreground">Importe extratos OFX e concilie com as faturas a receber.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={openConta} onOpenChange={setOpenConta}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Nova conta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar conta bancária</DialogTitle></DialogHeader>
              <form onSubmit={handleConta} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input name="nome" required placeholder="Ex.: Itaú CC Principal" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Banco</Label><Input name="banco" placeholder="Itaú" /></div>
                  <div className="space-y-2"><Label>Agência</Label><Input name="agencia" /></div>
                  <div className="space-y-2"><Label>Conta</Label><Input name="numero_conta" /></div>
                  <div className="space-y-2"><Label>Saldo inicial</Label><Input name="saldo_inicial" type="number" step="0.01" defaultValue="0" /></div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setOpenConta(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createConta.isPending}>
                    {createConta.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <input
            ref={fileRef}
            type="file"
            accept=".ofx,.OFX"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importOfx.mutate(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <Button disabled={!contaSel || importOfx.isPending} onClick={() => fileRef.current?.click()}>
            {importOfx.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Importar OFX
          </Button>
        </div>
      </div>

      {contas.length === 0 ? (
        <Card className="p-8 text-center">
          <Landmark className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Cadastre sua primeira conta bancária para começar.</p>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Label className="text-sm">Conta:</Label>
            <Select value={contaSel} onValueChange={setContaSel}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {contas.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}{c.banco ? ` — ${c.banco}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo atual</p>
              <p className="text-2xl font-bold mt-1">{brl(kpis.saldo)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Créditos</p>
              <p className="text-2xl font-bold mt-1 text-primary">{brl(kpis.creditos)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Débitos</p>
              <p className="text-2xl font-bold mt-1 text-destructive">{brl(kpis.debitos)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">A conciliar</p>
              <p className="text-2xl font-bold mt-1">{kpis.pendentes}</p>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {["pendente", "conciliado", "ignorado", "todos"].map((s) => (
                <Button key={s} size="sm" variant={filtro === s ? "default" : "outline"} onClick={() => setFiltro(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
            ) : filtrados.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">Nenhum lançamento. Importe um arquivo OFX.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fatura</TableHead>
                    <TableHead className="w-32"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((l) => {
                    const sugs = l.status === "pendente" ? sugerirFaturas(l) : [];
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="text-sm">{new Date(l.data_lancamento).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{l.memo || l.descricao || "—"}</TableCell>
                        <TableCell className={`text-sm text-right font-medium ${Number(l.valor) < 0 ? "text-destructive" : "text-primary"}`}>
                          {brl(Number(l.valor))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={l.status === "conciliado" ? "default" : l.status === "ignorado" ? "outline" : "secondary"}>
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {l.faturas ? (
                            <div>
                              <div className="font-medium">{l.faturas.numero}</div>
                              <div className="text-muted-foreground">{l.faturas.clientes?.razao_social}</div>
                            </div>
                          ) : sugs.length > 0 ? (
                            <span className="text-primary">{sugs.length} sugestão(ões)</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {l.status === "pendente" && Number(l.valor) > 0 && (
                              <Button size="icon" variant="ghost" title="Conciliar" onClick={() => setMatchLanc(l)}>
                                <Link2 className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            {l.status === "pendente" && (
                              <Button size="icon" variant="ghost" title="Ignorar" onClick={() => setStatus.mutate({ id: l.id, status: "ignorado" })}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            {l.status !== "pendente" && (
                              <Button size="icon" variant="ghost" title="Reabrir" onClick={() => setStatus.mutate({ id: l.id, status: "pendente" })}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => {
                              if (confirm("Remover lançamento?")) delLanc.mutate(l.id);
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
        </>
      )}

      <Dialog open={!!matchLanc} onOpenChange={(o) => !o && setMatchLanc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Conciliar lançamento</DialogTitle>
          </DialogHeader>
          {matchLanc && (
            <div className="space-y-4">
              <Card className="p-3 bg-muted/30">
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{matchLanc.memo || matchLanc.descricao}</div>
                    <div className="text-xs text-muted-foreground">{new Date(matchLanc.data_lancamento).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="text-primary font-bold">{brl(Number(matchLanc.valor))}</div>
                </div>
              </Card>
              <div>
                <p className="text-sm font-medium mb-2">Faturas pendentes:</p>
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {(() => {
                    const sugs = sugerirFaturas(matchLanc);
                    const sugIds = new Set(sugs.map((s) => s.id));
                    const outras = faturasPend.filter((f) => !sugIds.has(f.id));
                    const list = [...sugs, ...outras];
                    if (!list.length) return <p className="text-sm text-muted-foreground">Nenhuma fatura pendente.</p>;
                    return list.map((f) => {
                      const sugerida = sugIds.has(f.id);
                      return (
                        <button
                          key={f.id}
                          onClick={() => conciliar.mutate({ lancId: matchLanc.id, faturaId: f.id, fatura: f })}
                          disabled={conciliar.isPending}
                          className={`w-full text-left p-3 rounded-md border hover:bg-accent transition-colors flex justify-between items-center ${sugerida ? "border-primary/50 bg-primary/5" : "border-border"}`}
                        >
                          <div>
                            <div className="font-medium text-sm">{f.numero} {sugerida && <Badge variant="default" className="ml-2 text-[10px]">match</Badge>}</div>
                            <div className="text-xs text-muted-foreground">{f.clientes?.razao_social} — venc. {new Date(f.data_vencimento).toLocaleDateString("pt-BR")}</div>
                          </div>
                          <div className="text-sm font-medium">{brl(Number(f.valor))}</div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
