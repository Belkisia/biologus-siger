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
  ultimo_email_status: string | null;
  ultimo_email_em: string | null;
  ultimo_email_destino: string | null;
  ultimo_email_erro: string | null;
  clientes?: { razao_social: string } | null;
};

const EMAIL_STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
  processando: { label: "Em processamento", variant: "secondary" },
  enviado: { label: "Enviado", variant: "default", className: "bg-emerald-600 hover:bg-emerald-600" },
  falhou: { label: "Falhou", variant: "destructive" },
};


const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ativo: { label: "Ativo", variant: "default" },
  suspenso: { label: "Suspenso", variant: "outline" },
  encerrado: { label: "Encerrado", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

import { buildVars, renderTemplate } from "@/lib/contrato-modelo.functions";

function addMonthsISO(dataInicio: string, meses: number): string {
  const d = new Date(dataInicio + "T00:00:00");
  d.setMonth(d.getMonth() + meses);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const PERIODICIDADE_MESES: Record<string, number> = {
  trimestral: 3,
  semestral: 6,
  anual: 12,
};


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
      // 1) Buscar modelo padrão ativo + cliente
      const [{ data: modelo }, { data: cliente }] = await Promise.all([
        supabase.from("contrato_modelos").select("id, conteudo_html").eq("ativo", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("clientes").select("*").eq("id", payload.cliente_id as string).single(),
      ]);

      // 2) Renderizar HTML integral do contrato com placeholders preenchidos
      let conteudo_html: string | null = null;
      let modelo_id: string | null = null;
      if (modelo?.conteudo_html && cliente) {
        const limite = Number(payload.limite_kg) || 0;
        const excedente = Number(payload.valor_excedente) || 0;
        const itens = limite > 0
          ? [{
              descricao: "Resíduos de serviços de saúde",
              grupo_residuo: (payload.grupos_residuos as string) || "A, B e E",
              unidade: "kg",
              franquia: limite,
              preco_unitario: 0,
              preco_excedente: excedente,
            }]
          : [];
        const vars = buildVars({
          cliente,
          contrato: {
            numero: payload.numero,
            data_inicio: payload.data_inicio,
            data_fim: payload.data_fim,
            valor_mensal: payload.valor_mensal,
            forma_pagamento: payload.forma_pagamento,
            dia_vencimento: payload.dia_vencimento,
            frequencia_coleta: payload.frequencia_coleta,
            vigencia_anos: periodicidade === "anual" ? "01 (um)" : periodicidade === "semestral" ? "0,5 (meio)" : "0,25 (três meses)",
          },
          itens,
        });
        // grupos override
        if (payload.grupos_residuos) (vars as Record<string, string>).GRUPOS_RESIDUOS = String(payload.grupos_residuos);
        conteudo_html = renderTemplate(modelo.conteudo_html, vars);
        modelo_id = modelo.id;
      }

      // 3) Limpar campos auxiliares antes do insert
      const { limite_kg: _lk, valor_excedente: _ve, grupos_residuos: _gr, frequencia_coleta: _fc, ...dbPayload } = payload as any;
      const row = { ...dbPayload, owner_id: user.id, conteudo_html, modelo_id } as never;
      const { error } = await supabase.from("contratos").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato cadastrado com o modelo Padrão 2026 aplicado");
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
  const [filtroEmail, setFiltroEmail] = useState<string>("todos");
  const [ordemEmail, setOrdemEmail] = useState<string>("recente");

  const contratosFiltrados = (() => {
    let list = contratos;
    if (filtroEmail === "nunca") {
      list = list.filter((c) => !c.ultimo_email_status);
    } else if (filtroEmail !== "todos") {
      list = list.filter((c) => c.ultimo_email_status === filtroEmail);
    }
    if (ordemEmail !== "nenhum") {
      list = [...list].sort((a, b) => {
        const ta = a.ultimo_email_em ? new Date(a.ultimo_email_em).getTime() : 0;
        const tb = b.ultimo_email_em ? new Date(b.ultimo_email_em).getTime() : 0;
        return ordemEmail === "recente" ? tb - ta : ta - tb;
      });
    }
    return list;
  })();


  const [emailContrato, setEmailContrato] = useState<Contrato | null>(null);
  const [emailDestino, setEmailDestino] = useState("");
  const [emailMensagem, setEmailMensagem] = useState("");
  const [previewing, setPreviewing] = useState<string | null>(null);

  const [dataInicio, setDataInicio] = useState("");
  const [periodicidade, setPeriodicidade] = useState("anual");
  const [dataFim, setDataFim] = useState("");

  const visualizar = useServerFn(visualizarContrato);
  const enviarEmail = useServerFn(enviarContratoEmail);

  const handlePreview = async (c: Contrato) => {
    setPreviewing(c.id);
    try {
      const r = await visualizar({ data: { contrato_id: c.id } });
      if (r.url) window.open(r.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Falha ao gerar PDF");
    } finally {
      setPreviewing(null);
    }
  };

  const emailMutation = useMutation({
    mutationFn: async () => {
      if (!emailContrato) return;
      await enviarEmail({ data: { contrato_id: emailContrato.id, email: emailDestino, mensagem: emailMensagem || undefined } });
    },
    onSuccess: () => {
      toast.success("Contrato enviado por e-mail");
      qc.invalidateQueries({ queryKey: ["contratos"] });
      setEmailContrato(null);
      setEmailDestino("");
      setEmailMensagem("");
    },
    onError: (e: Error) => {
      toast.error(e.message);
      qc.invalidateQueries({ queryKey: ["contratos"] });
    },

  });

  const openChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setDataInicio("");
      setPeriodicidade("anual");
      setDataFim("");
    }
  };

  const onInicioChange = (v: string) => {
    setDataInicio(v);
    if (v && periodicidade && PERIODICIDADE_MESES[periodicidade]) {
      setDataFim(addMonthsISO(v, PERIODICIDADE_MESES[periodicidade]));
    }
  };
  const onPeriodicidadeChange = (v: string) => {
    setPeriodicidade(v);
    if (dataInicio && PERIODICIDADE_MESES[v]) {
      setDataFim(addMonthsISO(dataInicio, PERIODICIDADE_MESES[v]));
    }
  };

  const openEmailDialog = (c: Contrato) => {
    const cli = clientes.find((cl) => cl.id === c.cliente_id);
    setEmailDestino((cli as any)?.email || "");
    setEmailMensagem("");
    setEmailContrato(c);
  };




  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contratos</h1>
          <p className="text-sm text-muted-foreground">Gestão de contratos comerciais e vigências — modelo Padrão Bio Logus 2026 aplicado automaticamente.</p>
        </div>
        <Dialog open={open} onOpenChange={openChange}>
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
                  <Input id="data_inicio" name="data_inicio" type="date" required value={dataInicio} onChange={(e) => onInicioChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Término</Label>
                  <Input id="data_fim" name="data_fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Calculado automaticamente conforme periodicidade</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_mensal">Valor mensal (R$)</Label>
                  <Input id="valor_mensal" name="valor_mensal" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Vigência</Label>
                  <Select value={periodicidade} onValueChange={onPeriodicidadeChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anual">Anual (1 ano)</SelectItem>
                      <SelectItem value="semestral">Semestral (6 meses)</SelectItem>
                      <SelectItem value="trimestral">Trimestral (3 meses)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Calcula automaticamente a data de término.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dia_vencimento">Dia vencimento</Label>
                  <Input id="dia_vencimento" name="dia_vencimento" type="number" min="1" max="31" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
                  <Input id="forma_pagamento" name="forma_pagamento" placeholder="boleto bancário, PIX, depósito..." defaultValue="boleto bancário" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencia_coleta">Frequência da coleta</Label>
                  <Input id="frequencia_coleta" name="frequencia_coleta" placeholder="mensal (1 vez ao mês)" defaultValue="mensal (1 vez ao mês)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limite_kg">Pesagem — limite (kg/mês)</Label>
                  <Input id="limite_kg" name="limite_kg" type="number" step="0.01" placeholder="Ex.: 20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_excedente">Valor do kg excedente (R$)</Label>
                  <Input id="valor_excedente" name="valor_excedente" type="number" step="0.01" placeholder="Ex.: 12,50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grupos_residuos">Grupos de resíduos</Label>
                  <Input id="grupos_residuos" name="grupos_residuos" placeholder="A, B e E" defaultValue="A, B e E" />
                </div>

                <div className="md:col-span-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
                  <strong className="text-foreground">Contrato Padrão Bio Logus 2026</strong> — o texto integral das 9 cláusulas será aplicado automaticamente, preenchendo os campos acima nos placeholders correspondentes. Sem alterações nas cláusulas.
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações internas</Label>
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

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Filtrar por envio de e-mail</Label>
            <Select value={filtroEmail} onValueChange={setFiltroEmail}>
              <SelectTrigger className="w-52 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="processando">Em processamento</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="falhou">Falhou</SelectItem>
                <SelectItem value="nunca">Não enviado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ordenar por data de envio</Label>
            <Select value={ordemEmail} onValueChange={setOrdemEmail}>
              <SelectTrigger className="w-52 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recente">Mais recente primeiro</SelectItem>
                <SelectItem value="antigo">Mais antigo primeiro</SelectItem>
                <SelectItem value="nenhum">Sem ordenação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(filtroEmail !== "todos" || ordemEmail !== "recente") && (
            <Button variant="ghost" size="sm" onClick={() => { setFiltroEmail("todos"); setOrdemEmail("recente"); }}>
              Limpar
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            {contratosFiltrados.length} de {contratos.length} contrato(s)
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : contratos.length === 0 ? (
          <div className="py-16 text-center">
            <FileSignature className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum contrato cadastrado.</p>
          </div>
        ) : contratosFiltrados.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhum contrato corresponde aos filtros selecionados.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Valor mensal</TableHead>
                
                <TableHead>Status</TableHead>
                <TableHead>Envio e-mail</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosFiltrados.map((c) => {
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
                    <TableCell className="text-sm">
                      {c.ultimo_email_status ? (
                        <div className="space-y-1">
                          <Badge
                            variant={EMAIL_STATUS_MAP[c.ultimo_email_status]?.variant ?? "secondary"}
                            className={EMAIL_STATUS_MAP[c.ultimo_email_status]?.className}
                          >
                            {EMAIL_STATUS_MAP[c.ultimo_email_status]?.label ?? c.ultimo_email_status}
                          </Badge>
                          {c.ultimo_email_em && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(c.ultimo_email_em).toLocaleString("pt-BR")}
                            </div>
                          )}
                          {c.ultimo_email_destino && (
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={c.ultimo_email_destino}>
                              {c.ultimo_email_destino}
                            </div>
                          )}
                          {c.ultimo_email_status === "falhou" && c.ultimo_email_erro && (
                            <div className="text-xs text-destructive truncate max-w-[180px]" title={c.ultimo_email_erro}>
                              {c.ultimo_email_erro}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>

                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Visualizar PDF" onClick={() => handlePreview(c)} disabled={previewing === c.id}>
                          {previewing === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEmailDialog(c)} className="gap-1.5">
                          <Mail className="h-4 w-4" />
                          Enviar por e-mail
                        </Button>

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

      <Dialog open={!!emailContrato} onOpenChange={(v) => !v && setEmailContrato(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar contrato {emailContrato?.numero} por e-mail</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail destinatário *</Label>
              <Input type="email" value={emailDestino} onChange={(e) => setEmailDestino(e.target.value)} placeholder="cliente@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Mensagem (opcional)</Label>
              <Textarea rows={4} value={emailMensagem} onChange={(e) => setEmailMensagem(e.target.value)} placeholder="Mensagem que acompanha o contrato..." />
            </div>
            <p className="text-xs text-muted-foreground">O contrato será gerado em PDF e enviado como anexo.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmailContrato(null)}>Cancelar</Button>
            <Button onClick={() => emailMutation.mutate()} disabled={!emailDestino || emailMutation.isPending}>
              {emailMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

