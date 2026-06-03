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
import { Plus, FileText, Loader2, Trash2, Download, Send, FileSignature, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/propostas")({
  component: PropostasPage,
});

type Item = {
  id?: string;
  descricao: string;
  tipo_residuo: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
};

type Proposta = {
  id: string;
  cliente_id: string;
  numero: string;
  data_emissao: string;
  validade: string | null;
  condicoes_pagamento: string | null;
  prazo_coleta: string | null;
  valor_total: number;
  status: string;
  observacoes: string | null;
  contrato_id: string | null;
  enviada_em: string | null;
  clientes?: {
    razao_social: string;
    nome_fantasia: string | null;
    cnpj: string;
    email: string | null;
    telefone: string | null;
    whatsapp: string | null;
    endereco: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
  } | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  rascunho: { label: "Rascunho", variant: "outline" },
  enviada: { label: "Enviada", variant: "secondary" },
  aceita: { label: "Aceita", variant: "default" },
  recusada: { label: "Recusada", variant: "destructive" },
  expirada: { label: "Expirada", variant: "outline" },
  convertida: { label: "Convertida", variant: "default" },
};

const UNIDADES = ["kg", "L", "m³", "ton", "unid", "tambor", "bombona"];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function emptyItem(): Item {
  return { descricao: "", tipo_residuo: "", quantidade: 1, unidade: "kg", valor_unitario: 0, valor_total: 0 };
}

function PropostasPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Proposta | null>(null);

  const [form, setForm] = useState({
    cliente_id: "",
    numero: "",
    data_emissao: new Date().toISOString().slice(0, 10),
    validade: "",
    condicoes_pagamento: "",
    prazo_coleta: "",
    observacoes: "",
  });
  const [items, setItems] = useState<Item[]>([emptyItem()]);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social").order("razao_social");
      return data ?? [];
    },
  });

  const { data: propostas = [], isLoading } = useQuery({
    queryKey: ["propostas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propostas")
        .select("*, clientes(razao_social, nome_fantasia, cnpj, email, telefone, whatsapp, endereco, numero, bairro, cidade, estado)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Proposta[];
    },
  });

  const valorTotal = useMemo(
    () => items.reduce((acc, i) => acc + (Number(i.valor_total) || 0), 0),
    [items],
  );

  const resetForm = () => {
    setEditing(null);
    setForm({
      cliente_id: "",
      numero: `PROP-${new Date().getFullYear()}-${String((propostas.length || 0) + 1).padStart(4, "0")}`,
      data_emissao: new Date().toISOString().slice(0, 10),
      validade: "",
      condicoes_pagamento: "",
      prazo_coleta: "",
      observacoes: "",
    });
    setItems([emptyItem()]);
  };

  const openNew = () => { resetForm(); setOpen(true); };

  const openEdit = async (p: Proposta) => {
    setEditing(p);
    setForm({
      cliente_id: p.cliente_id,
      numero: p.numero,
      data_emissao: p.data_emissao,
      validade: p.validade ?? "",
      condicoes_pagamento: p.condicoes_pagamento ?? "",
      prazo_coleta: p.prazo_coleta ?? "",
      observacoes: p.observacoes ?? "",
    });
    const { data } = await supabase
      .from("proposta_itens")
      .select("*")
      .eq("proposta_id", p.id)
      .order("ordem");
    setItems((data ?? []).length > 0 ? (data as Item[]) : [emptyItem()]);
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.cliente_id || !form.numero) throw new Error("Cliente e número são obrigatórios");
      const itensClean = items.filter((i) => i.descricao.trim() !== "");
      if (itensClean.length === 0) throw new Error("Adicione pelo menos um item");

      const payload = {
        cliente_id: form.cliente_id,
        numero: form.numero,
        data_emissao: form.data_emissao,
        validade: form.validade || null,
        condicoes_pagamento: form.condicoes_pagamento || null,
        prazo_coleta: form.prazo_coleta || null,
        observacoes: form.observacoes || null,
        valor_total: itensClean.reduce((a, i) => a + Number(i.valor_total || 0), 0),
      };

      let propostaId = editing?.id;
      if (editing) {
        const { error } = await supabase.from("propostas").update(payload).eq("id", editing.id);
        if (error) throw error;
        await supabase.from("proposta_itens").delete().eq("proposta_id", editing.id);
      } else {
        const { data, error } = await supabase
          .from("propostas")
          .insert({ ...payload, owner_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        propostaId = data.id;
      }

      const rows = itensClean.map((i, idx) => ({
        proposta_id: propostaId!,
        descricao: i.descricao,
        tipo_residuo: i.tipo_residuo || null,
        quantidade: Number(i.quantidade) || 0,
        unidade: i.unidade,
        valor_unitario: Number(i.valor_unitario) || 0,
        valor_total: Number(i.valor_total) || 0,
        ordem: idx,
      }));
      const { error: itErr } = await supabase.from("proposta_itens").insert(rows);
      if (itErr) throw itErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["propostas"] });
      toast.success(editing ? "Proposta atualizada" : "Proposta criada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: Record<string, unknown> = { status };
      if (status === "enviada") patch.enviada_em = new Date().toISOString();
      if (status === "aceita" || status === "recusada") patch.respondida_em = new Date().toISOString();
      const { error } = await supabase.from("propostas").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["propostas"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("propostas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["propostas"] });
      toast.success("Proposta removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const convertToContract = useMutation({
    mutationFn: async (p: Proposta) => {
      const numeroContrato = `CTR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const { data, error } = await supabase
        .from("contratos")
        .insert({
          owner_id: user.id,
          cliente_id: p.cliente_id,
          numero: numeroContrato,
          data_inicio: new Date().toISOString().slice(0, 10),
          valor_mensal: p.valor_total,
          forma_pagamento: p.condicoes_pagamento,
          objeto: `Originado da proposta ${p.numero}`,
          observacoes: p.observacoes,
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase
        .from("propostas")
        .update({ status: "convertida", contrato_id: data.id })
        .eq("id", p.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["propostas"] });
      qc.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Proposta convertida em contrato");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setItem = (idx: number, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const merged = { ...it, ...patch };
        merged.valor_total = Number(merged.quantidade || 0) * Number(merged.valor_unitario || 0);
        return merged;
      }),
    );
  };

  const buildPDF = async (p: Proposta) => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const { data: itens } = await supabase
      .from("proposta_itens")
      .select("*")
      .eq("proposta_id", p.id)
      .order("ordem");

    const doc = new jsPDF();
    const cli = p.clientes;

    doc.setFontSize(18);
    doc.setTextColor(40, 100, 60);
    doc.text("BIOLOGUS AMBIENTAL", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Gestão de Resíduos", 14, 24);

    doc.setDrawColor(40, 100, 60);
    doc.line(14, 28, 196, 28);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`PROPOSTA COMERCIAL Nº ${p.numero}`, 14, 38);

    doc.setFontSize(10);
    doc.text(`Emissão: ${new Date(p.data_emissao).toLocaleDateString("pt-BR")}`, 14, 46);
    if (p.validade) doc.text(`Validade: ${new Date(p.validade).toLocaleDateString("pt-BR")}`, 110, 46);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", 14, 58);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let y = 64;
    doc.text(`${cli?.razao_social ?? ""}${cli?.nome_fantasia ? ` (${cli.nome_fantasia})` : ""}`, 14, y);
    y += 5;
    doc.text(`CNPJ: ${cli?.cnpj ?? "—"}`, 14, y);
    if (cli?.endereco) {
      y += 5;
      doc.text(`${cli.endereco}${cli.numero ? `, ${cli.numero}` : ""} - ${cli.bairro ?? ""} - ${cli.cidade ?? ""}/${cli.estado ?? ""}`, 14, y);
    }
    if (cli?.email || cli?.telefone) {
      y += 5;
      doc.text(`${cli.email ?? ""}  ${cli.telefone ?? cli.whatsapp ?? ""}`, 14, y);
    }

    autoTable(doc, {
      startY: y + 8,
      head: [["Descrição", "Resíduo", "Qtd", "Unid.", "Vlr. Unit.", "Total"]],
      body: (itens ?? []).map((i) => [
        i.descricao,
        i.tipo_residuo ?? "—",
        Number(i.quantidade).toLocaleString("pt-BR"),
        i.unidade,
        brl(Number(i.valor_unitario)),
        brl(Number(i.valor_total)),
      ]),
      headStyles: { fillColor: [40, 100, 60] },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 30;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`VALOR TOTAL: ${brl(Number(p.valor_total))}`, 196, finalY + 10, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let yy = finalY + 22;
    if (p.condicoes_pagamento) { doc.text(`Condições de pagamento: ${p.condicoes_pagamento}`, 14, yy); yy += 6; }
    if (p.prazo_coleta) { doc.text(`Prazo de coleta: ${p.prazo_coleta}`, 14, yy); yy += 6; }
    if (p.observacoes) {
      yy += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", 14, yy);
      doc.setFont("helvetica", "normal");
      yy += 5;
      const split = doc.splitTextToSize(p.observacoes, 180);
      doc.text(split, 14, yy);
    }

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("Biologus Ambiental - comercial@biologusambiental.com.br", 14, 285);

    return doc;
  };

  const downloadPDF = async (p: Proposta) => {
    const doc = await buildPDF(p);
    doc.save(`Proposta-${p.numero}.pdf`);
  };

  const [emailDialog, setEmailDialog] = useState<{ open: boolean; proposta: Proposta | null; email: string; mensagem: string; sending: boolean }>({
    open: false, proposta: null, email: "", mensagem: "", sending: false,
  });

  const openEmailDialog = (p: Proposta) => {
    setEmailDialog({ open: true, proposta: p, email: p.clientes?.email ?? "", mensagem: "", sending: false });
  };

  const sendByEmail = async () => {
    const p = emailDialog.proposta;
    if (!p) return;
    if (!emailDialog.email.trim()) return toast.error("Informe o e-mail do destinatário");
    setEmailDialog((s) => ({ ...s, sending: true }));
    try {
      const doc = await buildPDF(p);
      const blob = doc.output("blob");
      const path = `${user.id}/${p.id}/Proposta-${p.numero}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("propostas")
        .upload(path, blob, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("propostas")
        .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 dias
      if (sErr || !signed) throw sErr ?? new Error("Falha ao gerar link");

      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Sessão expirada");

      const res = await fetch("/lovable/email/transactional/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          templateName: "proposta-comercial",
          recipientEmail: emailDialog.email.trim(),
          idempotencyKey: `proposta-${p.id}-${Date.now()}`,
          templateData: {
            clienteNome: p.clientes?.razao_social ?? "Cliente",
            numero: p.numero,
            valorTotal: brl(Number(p.valor_total)),
            validade: p.validade ? new Date(p.validade).toLocaleDateString("pt-BR") : "",
            pdfUrl: signed.signedUrl,
            mensagemPersonalizada: emailDialog.mensagem || undefined,
          },
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Falha ao enviar (${res.status}): ${t}`);
      }

      await supabase.from("propostas").update({ status: "enviada", enviada_em: new Date().toISOString() } as never).eq("id", p.id);
      qc.invalidateQueries({ queryKey: ["propostas"] });
      toast.success(`Proposta enviada para ${emailDialog.email}`);
      setEmailDialog({ open: false, proposta: null, email: "", mensagem: "", sending: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar";
      toast.error(msg);
      setEmailDialog((s) => ({ ...s, sending: false }));
    }
  };


  const shareWhatsApp = (p: Proposta) => {
    const tel = (p.clientes?.whatsapp ?? p.clientes?.telefone ?? "").replace(/\D/g, "");
    if (!tel) return toast.error("Cliente sem telefone/WhatsApp cadastrado");
    const msg = encodeURIComponent(
      `Olá! Segue a Proposta Comercial Nº ${p.numero} no valor de ${brl(Number(p.valor_total))}. Qualquer dúvida estamos à disposição. — Biologus Ambiental`,
    );
    const numero = tel.startsWith("55") ? tel : `55${tel}`;
    window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Propostas Comerciais</h1>
          <p className="text-sm text-muted-foreground">Crie, envie e acompanhe propostas. Converta em contrato com um clique.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} disabled={clientes.length === 0}>
              <Plus className="h-4 w-4 mr-2" />Nova proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? `Editar proposta ${editing.numero}` : "Nova proposta"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Cliente *</Label>
                  <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Data emissão</Label>
                  <Input type="date" value={form.data_emissao} onChange={(e) => setForm({ ...form, data_emissao: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Validade</Label>
                  <Input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Condições de pagamento</Label>
                  <Input placeholder="Ex: 30 dias após coleta" value={form.condicoes_pagamento} onChange={(e) => setForm({ ...form, condicoes_pagamento: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Prazo de coleta</Label>
                  <Input placeholder="Ex: até 5 dias úteis após aprovação" value={form.prazo_coleta} onChange={(e) => setForm({ ...form, prazo_coleta: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Observações</Label>
                  <Textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Itens da proposta</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, emptyItem()])}>
                    <Plus className="h-3 w-3 mr-1" />Adicionar item
                  </Button>
                </div>
                <Card className="p-3 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-48">Descrição</TableHead>
                        <TableHead>Resíduo</TableHead>
                        <TableHead className="w-24">Qtd</TableHead>
                        <TableHead className="w-28">Unid.</TableHead>
                        <TableHead className="w-32">Vlr. Unit.</TableHead>
                        <TableHead className="w-32">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it, idx) => (
                        <TableRow key={idx}>
                          <TableCell><Input value={it.descricao} onChange={(e) => setItem(idx, { descricao: e.target.value })} placeholder="Coleta e destinação..." /></TableCell>
                          <TableCell><Input value={it.tipo_residuo} onChange={(e) => setItem(idx, { tipo_residuo: e.target.value })} placeholder="Grupo A" /></TableCell>
                          <TableCell><Input type="number" step="0.01" value={it.quantidade} onChange={(e) => setItem(idx, { quantidade: Number(e.target.value) })} /></TableCell>
                          <TableCell>
                            <Select value={it.unidade} onValueChange={(v) => setItem(idx, { unidade: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><Input type="number" step="0.01" value={it.valor_unitario} onChange={(e) => setItem(idx, { valor_unitario: Number(e.target.value) })} /></TableCell>
                          <TableCell className="font-medium">{brl(it.valor_total)}</TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end mt-3 pr-12">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Valor total</p>
                      <p className="text-2xl font-bold text-primary">{brl(valorTotal)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Salvar alterações" : "Criar proposta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Rascunhos</p>
          <p className="text-2xl font-bold mt-1">{propostas.filter((p) => p.status === "rascunho").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Enviadas</p>
          <p className="text-2xl font-bold mt-1">{propostas.filter((p) => p.status === "enviada").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Aceitas</p>
          <p className="text-2xl font-bold mt-1 text-primary">{propostas.filter((p) => p.status === "aceita" || p.status === "convertida").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor em propostas abertas</p>
          <p className="text-2xl font-bold mt-1">
            {brl(propostas.filter((p) => ["rascunho", "enviada"].includes(p.status)).reduce((a, p) => a + Number(p.valor_total), 0))}
          </p>
        </Card>
      </div>

      {clientes.length === 0 && (
        <Card className="p-4 bg-warning/10 border-warning/30">
          <p className="text-sm">Cadastre um cliente em <strong>Clientes</strong> antes de criar propostas.</p>
        </Card>
      )}

      <Card className="p-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : propostas.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma proposta cadastrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propostas.map((p) => {
                const s = STATUS_MAP[p.status] ?? STATUS_MAP.rascunho;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.numero}</TableCell>
                    <TableCell>{p.clientes?.razao_social ?? "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(p.data_emissao).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{p.validade ? new Date(p.validade).toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell className="font-medium">{brl(Number(p.valor_total))}</TableCell>
                    <TableCell>
                      <Select value={p.status} onValueChange={(v) => updateStatus.mutate({ id: p.id, status: v })} disabled={p.status === "convertida"}>
                        <SelectTrigger className="w-32 h-8">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_MAP).filter(([k]) => k !== "convertida").map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Baixar PDF" onClick={() => downloadPDF(p)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Enviar por WhatsApp" onClick={() => shareWhatsApp(p)}>
                          <Send className="h-4 w-4" />
                        </Button>
                        {p.status === "aceita" && (
                          <Button variant="ghost" size="icon" title="Converter em contrato" onClick={() => {
                            if (confirm(`Criar contrato a partir da proposta ${p.numero}?`)) convertToContract.mutate(p);
                          }}>
                            <FileSignature className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(p)} disabled={p.status === "convertida"}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Excluir" onClick={() => {
                          if (confirm(`Excluir proposta ${p.numero}?`)) deleteMutation.mutate(p.id);
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
