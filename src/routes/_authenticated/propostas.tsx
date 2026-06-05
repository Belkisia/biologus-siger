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
import { Plus, FileText, Loader2, Trash2, Download, Send, FileSignature, Copy, Mail, Eye } from "lucide-react";
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
    contrato_id: "",
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

  const { data: contratos = [] } = useQuery({
    queryKey: ["contratos-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contratos")
        .select("id, numero, cliente_id, objeto, valor_mensal, forma_pagamento, observacoes, indice_reajuste, periodicidade_reajuste, dia_vencimento, data_inicio, data_fim, status")
        .order("created_at", { ascending: false });
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
      contrato_id: "",
      numero: `PROP-${new Date().getFullYear()}-${String((propostas.length || 0) + 1).padStart(4, "0")}`,
      data_emissao: new Date().toISOString().slice(0, 10),
      validade: "",
      condicoes_pagamento: "",
      prazo_coleta: "",
      observacoes: "",
    });
    setItems([emptyItem()]);
  };

  // ── Mapeamento automático a partir do contrato ───────────────────────
  const applyContrato = async (contratoId: string) => {
    if (!contratoId) return;
    const c = contratos.find((x) => x.id === contratoId);
    if (!c) return;
    const { data: citens } = await supabase
      .from("contrato_itens")
      .select("descricao, grupo_residuo, unidade, preco_unitario, franquia, preco_excedente")
      .eq("contrato_id", contratoId);

    // Cláusulas derivadas do contrato — sem texto genérico
    const clausulas: string[] = [];
    if (c.periodicidade_reajuste && c.indice_reajuste)
      clausulas.push(`Reajuste ${c.periodicidade_reajuste} pelo índice ${c.indice_reajuste}.`);
    if (c.dia_vencimento)
      clausulas.push(`Faturamento mensal com vencimento todo dia ${c.dia_vencimento}.`);
    if (c.data_fim)
      clausulas.push(`Vigência até ${new Date(c.data_fim).toLocaleDateString("pt-BR")}.`);
    (citens ?? []).forEach((it) => {
      if (it.franquia && it.preco_excedente)
        clausulas.push(`${it.grupo_residuo ?? it.descricao}: franquia ${it.franquia} ${it.unidade ?? "kg"}/mês, excedente R$ ${Number(it.preco_excedente).toFixed(2).replace(".", ",")}/${it.unidade ?? "kg"}.`);
    });
    if (c.observacoes) clausulas.push(c.observacoes);

    setForm((f) => ({
      ...f,
      cliente_id: c.cliente_id,
      contrato_id: contratoId,
      condicoes_pagamento: c.forma_pagamento || f.condicoes_pagamento,
      observacoes: clausulas.join(" "),
    }));

    const mapped: Item[] = (citens ?? []).map((it) => {
      const qtd = Number(it.franquia ?? 1);
      const vu = Number(it.preco_unitario ?? 0);
      return {
        descricao: it.descricao || `Coleta, transporte e destinação final — ${it.grupo_residuo ?? ""}`.trim(),
        tipo_residuo: it.grupo_residuo ?? "",
        quantidade: qtd,
        unidade: it.unidade ?? "kg",
        valor_unitario: vu,
        valor_total: qtd * vu,
      };
    });
    if (mapped.length > 0) setItems(mapped);
    toast.success(`Dados do contrato ${c.numero} aplicados`);
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
    const { data: itens } = await supabase
      .from("proposta_itens")
      .select("*")
      .eq("proposta_id", p.id)
      .order("ordem");

    const PAGE_W = 210;
    const PAGE_H = 297;
    const M = 10;
    const BRAND: [number, number, number] = [14, 61, 26];    // #0E3D1A
    const BRAND2: [number, number, number] = [26, 107, 46];  // #1A6B2E
    const ACC: [number, number, number] = [46, 139, 71];     // #2E8B47
    const SOFT: [number, number, number] = [234, 244, 237];  // #EAF4ED
    const MUTED: [number, number, number] = [102, 102, 102];
    const BORDER: [number, number, number] = [210, 215, 212];

    const cli = p.clientes;
    const dataEmissao = new Date(p.data_emissao).toLocaleDateString("pt-BR");
    const ano = new Date(p.data_emissao).getFullYear();
    const cidadeCli = cli?.cidade ? `${cli.cidade}${cli.estado ? ` – ${cli.estado}` : ""}` : "";

    // Derivações de serviço
    const itensList = (itens ?? []) as Array<{
      descricao: string; tipo_residuo: string | null;
      quantidade: number; unidade: string;
      valor_unitario: number; valor_total: number;
    }>;
    const totalQtd = itensList.reduce((s, i) => s + Number(i.quantidade || 0), 0);
    const totalKg = itensList
      .filter((i) => (i.unidade || "").toLowerCase() === "kg")
      .reduce((s, i) => s + Number(i.quantidade || 0), 0);
    const valorTotal = Number(p.valor_total || 0);
    const precoKg = totalKg > 0 ? valorTotal / totalKg : 0;
    const volMax = totalKg > 0 ? totalKg : totalQtd;
    const volMin = Math.max(0, Math.round(volMax * 0.4));

    type Tier = {
      h2: number; h3: number; h5: number; h6: number;
      fNome: number; fBody: number; fSmall: number; fXs: number;
      bulletGap: number;
    };
    const tiers: Tier[] = [
      { h2: 30, h3: 62, h5: 48, h6: 30, fNome: 13, fBody: 8.2, fSmall: 7.4, fXs: 6.6, bulletGap: 4.4 },
      { h2: 28, h3: 58, h5: 42, h6: 28, fNome: 12, fBody: 7.8, fSmall: 7.0, fXs: 6.3, bulletGap: 4.0 },
      { h2: 26, h3: 54, h5: 38, h6: 26, fNome: 11, fBody: 7.4, fSmall: 6.6, fXs: 6.0, bulletGap: 3.7 },
      { h2: 24, h3: 50, h5: 34, h6: 24, fNome: 10.5, fBody: 7.0, fSmall: 6.3, fXs: 5.8, bulletGap: 3.4 },
    ];

    // Normas — apenas as aplicáveis (deduz dos tipos de resíduo)
    const tipos = itensList.map((i) => (i.tipo_residuo || "").toLowerCase()).join(" ");
    const isRSS = /grupo\s*[abe]|biolog|qu[ií]mico|perfuro/.test(tipos);
    const isClasseI = /classe\s*i\b|perigos|industrial/.test(tipos);
    const isClasseII = /classe\s*ii|n[aã]o[-\s]?perigos/.test(tipos);
    const isGrupoD = /grupo\s*d|domiciliar|comum/.test(tipos);
    const normas: string[] = [];
    if (isRSS) normas.push("RDC ANVISA 222/2018", "CONAMA 358/2005");
    if (isClasseI || isClasseII) normas.push("ABNT NBR 10.004:2004");
    if (isClasseI) normas.push("Lei GO 14.248/2002");
    if (normas.length === 0 || isGrupoD) normas.unshift("PNRS Lei 12.305/2010");
    else normas.push("PNRS Lei 12.305/2010");
    const normasTxt = Array.from(new Set(normas)).join(" · ");

    // Acondicionamento por tipo
    const acond: string[] = [];
    if (/grupo\s*a|biolog/i.test(tipos)) acond.push("Grupo A em bombonas brancas leitosas");
    if (/grupo\s*b|qu[ií]mico/i.test(tipos)) acond.push("Grupo B em recipiente compatível identificado");
    if (/grupo\s*e|perfuro/i.test(tipos)) acond.push("Grupo E em coletor descartex rígido");
    if (/grupo\s*d|domiciliar|comum/i.test(tipos)) acond.push("Grupo D em saco preto reforçado");
    if (/classe\s*i\b|perigos|industrial/i.test(tipos)) acond.push("Classe I em embalagem homologada com rótulo de risco");
    if (/classe\s*ii/i.test(tipos)) acond.push("Classe II em big bag ou tambor lacrado");
    if (acond.length === 0) acond.push("Conforme orientação técnica fornecida na visita inicial");

    const render = (t: Tier) => {
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      // ── BLOCO 1 — CABEÇALHO ─────────────────────────────────────────
      doc.setFillColor(...BRAND);
      doc.rect(0, 0, PAGE_W, 13, "F");
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.text("BIO LOGUS AMBIENTAL", PAGE_W / 2, 6, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.6);
      doc.text("Gestão Inteligente de Resíduos  ·  Goiânia – GO", PAGE_W / 2, 10.3, { align: "center" });
      doc.setFillColor(...BRAND2);
      doc.rect(0, 13, PAGE_W, 4.6, "F");
      doc.setFontSize(7);
      doc.text(
        `CNPJ 26.484.921/0001-60   ·   Nº ${p.numero}   ·   Emitida em ${dataEmissao}`,
        PAGE_W / 2, 16.4, { align: "center" },
      );

      let y = 20.5;
      const colW = (PAGE_W - M * 2 - 3) / 2;
      const xR = M + colW + 3;

      // ── BLOCO 2 — DESTINATÁRIO + CONDIÇÕES ──────────────────────────
      const h2 = t.h2;
      doc.setFillColor(...SOFT);
      doc.rect(M, y, colW, h2, "F");
      doc.setFillColor(...BRAND);
      doc.rect(M, y, 1.2, h2, "F");
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.6);
      doc.text("DESTINATÁRIO", M + 3, y + 3.6);
      doc.setTextColor(20);
      doc.setFontSize(t.fNome);
      const nome = cli?.razao_social ?? "—";
      const nomeLines = doc.splitTextToSize(nome, colW - 6) as string[];
      doc.text(nomeLines.slice(0, 2), M + 3, y + 8.2);
      let yL = y + 8.2 + Math.min(nomeLines.length, 2) * (t.fNome * 0.4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.fSmall);
      if (cidadeCli) { doc.text(cidadeCli, M + 3, yL); yL += 3.6; }
      if (cli?.cnpj) { doc.text(`CNPJ ${cli.cnpj}`, M + 3, yL); yL += 3.6; }
      if (cli?.endereco) {
        const end = `${cli.endereco}${cli.numero ? `, ${cli.numero}` : ""}${cli.bairro ? ` – ${cli.bairro}` : ""}`;
        const endLines = doc.splitTextToSize(end, colW - 6) as string[];
        doc.text(endLines.slice(0, 2), M + 3, yL); yL += endLines.slice(0, 2).length * 3.4;
      }
      doc.setFont("helvetica", "italic");
      doc.setFontSize(t.fXs);
      doc.setTextColor(...MUTED);
      const descServ = itensList[0]?.descricao || "Coleta, transporte e destinação final de resíduos";
      const descLines = doc.splitTextToSize(descServ, colW - 6) as string[];
      doc.text(descLines.slice(0, 2), M + 3, y + h2 - 2.5);

      // Condições (direita)
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(xR, y, colW, h2);
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.6);
      doc.text("CONDIÇÕES COMERCIAIS", xR + 3, y + 3.6);
      const cond: [string, string][] = [
        ["Validade", p.validade ? `até ${new Date(p.validade).toLocaleDateString("pt-BR")}` : "60 dias corridos"],
        ["Início", p.prazo_coleta || "7 dias úteis após assinatura"],
        ["Pagamento", p.condicoes_pagamento || "30 dias após cada coleta"],
        ["Frequência", "Mensal"],
        ["Volume", `${volMin} a ${Math.round(volMax)} kg/coleta`],
      ];
      doc.setTextColor(25);
      doc.setFontSize(t.fSmall);
      const rowH = (h2 - 6) / cond.length;
      let yR = y + 7;
      for (const [k, v] of cond) {
        doc.setFont("helvetica", "bold");
        doc.text(k, xR + 3, yR);
        doc.setFont("helvetica", "normal");
        const vLines = doc.splitTextToSize(v, colW - 26) as string[];
        doc.text(vLines.slice(0, 1), xR + 24, yR);
        yR += rowH;
      }

      y += h2 + 3;

      // ── BLOCO 3 — SERVIÇO + INCLUSO + PREÇO (3 colunas) ────────────
      const h3 = t.h3;
      const w3 = (PAGE_W - M * 2 - 4) / 3;
      const x3a = M;
      const x3b = M + w3 + 2;
      const x3c = M + (w3 + 2) * 2;

      const drawHeader = (x: number, w: number, label: string, dark = true) => {
        doc.setFillColor(...(dark ? BRAND : BRAND2));
        doc.rect(x, y, w, 5, "F");
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(label, x + 2.5, y + 3.5);
      };

      // Col 1: SERVIÇO PRESTADO
      doc.setDrawColor(...BORDER);
      doc.rect(x3a, y, w3, h3);
      drawHeader(x3a, w3, "SERVIÇO PRESTADO");
      doc.setTextColor(25);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.fSmall);
      doc.text("Coleta, transporte e destinação final de:", x3a + 2.5, y + 9);
      let ys = y + 12.5;
      const bullets1: string[] = [];
      for (const i of itensList.slice(0, 5)) {
        const tipoLab = i.tipo_residuo ? `${i.tipo_residuo}` : i.descricao;
        bullets1.push(tipoLab);
      }
      if (bullets1.length === 0) bullets1.push("Resíduos conforme especificação técnica");
      for (const b of bullets1) {
        doc.setTextColor(...ACC); doc.text("▸", x3a + 2.5, ys);
        doc.setTextColor(25);
        const lines = doc.splitTextToSize(b, w3 - 7) as string[];
        doc.text(lines.slice(0, 2), x3a + 5.5, ys);
        ys += lines.slice(0, 2).length * 3.3 + 0.6;
      }
      doc.setFont("helvetica", "italic");
      doc.setFontSize(t.fXs);
      doc.setTextColor(...MUTED);
      const acondTxt = "Acondicionamento: " + acond.join("; ") + ".";
      const acondLines = doc.splitTextToSize(acondTxt, w3 - 5) as string[];
      doc.text(acondLines.slice(0, 4), x3a + 2.5, y + h3 - acondLines.slice(0, 4).length * 3 - 0.5);

      // Col 2: INCLUSO NO VALOR
      doc.setDrawColor(...BORDER);
      doc.rect(x3b, y, w3, h3);
      drawHeader(x3b, w3, "INCLUSO NO VALOR");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.fSmall);
      const incl = [
        "Pesagem + comprovante assinado",
        "MTR (Manifesto de Transp.)",
        "CDF (Cert. de Dest. Final) em 15 dias",
        "Nota Fiscal por grupo e peso",
        "Veículo licenciado SEMARH-GO",
        "Equipe treinada com EPIs completos",
      ];
      let yi = y + 9;
      for (const it of incl) {
        doc.setTextColor(...ACC); doc.text("✓", x3b + 2.5, yi);
        doc.setTextColor(25);
        const lines = doc.splitTextToSize(it, w3 - 7) as string[];
        doc.text(lines.slice(0, 1), x3b + 5.5, yi);
        yi += t.bulletGap;
      }

      // Col 3: PREÇO POR KG COLETADO (fundo verde escuro)
      doc.setFillColor(...BRAND);
      doc.rect(x3c, y, w3, h3, "F");
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("PREÇO POR KG COLETADO", x3c + w3 / 2, y + 4, { align: "center" });
      doc.setFontSize(precoKg > 0 ? 22 : 14);
      const precoStr = precoKg > 0 ? `R$ ${brl(precoKg).replace("R$\u00A0", "")}` : "Sob consulta";
      doc.text(precoStr, x3c + w3 / 2, y + 16, { align: "center" });
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.text("por quilo coletado", x3c + w3 / 2, y + 20, { align: "center" });
      doc.setDrawColor(255);
      doc.setLineWidth(0.2);
      doc.line(x3c + 4, y + 23.5, x3c + w3 - 4, y + 23.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.text("Máximo estimado", x3c + w3 / 2, y + 28, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(brl(valorTotal), x3c + w3 / 2, y + 34, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.6);
      if (precoKg > 0 && volMax > 0) {
        doc.text(`(${Math.round(volMax)} kg × ${brl(precoKg)})`, x3c + w3 / 2, y + 38, { align: "center" });
      }

      y += h3 + 3;

      // ── BLOCO 4 — NOTA DE FATURAMENTO ──────────────────────────────
      const h4 = 11;
      doc.setFillColor(248, 251, 248);
      doc.rect(M, y, PAGE_W - M * 2, h4, "F");
      doc.setFillColor(...ACC);
      doc.rect(M, y, 1.2, h4, "F");
      doc.setTextColor(20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.fSmall);
      const nota = `Faturamento cobrado pelo peso efetivamente coletado, com base em comprovante assinado pelo responsável. Sem cobrança mínima. Conformidade: ${normasTxt}.`;
      const notaLines = doc.splitTextToSize(nota, PAGE_W - M * 2 - 5) as string[];
      doc.text(notaLines.slice(0, 2), M + 3, y + 4);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(t.fXs);
      doc.setTextColor(...MUTED);
      const extra = "Sujeito à emissão de empenho pelo órgão contratante. / Multa de 2% + juros 1%/mês sobre valores em atraso.";
      doc.text(extra, M + 3, y + h4 - 1.8);

      y += h4 + 3;

      // ── BLOCO 5 — OBRIGAÇÕES ────────────────────────────────────────
      const h5 = t.h5;
      doc.setDrawColor(...BORDER);
      doc.rect(M, y, colW, h5);
      doc.rect(xR, y, colW, h5);
      drawHeader(M, colW, "OBRIGAÇÕES DA CONTRATADA");
      drawHeader(xR, colW, "OBRIGAÇÕES DO CONTRATANTE");

      const obrL = [
        "Coletar resíduos com equipe treinada e EPIs completos.",
        "Pesar e emitir comprovante no ato da coleta.",
        "Transportar em veículo licenciado com monitoramento de rota.",
        "Emitir MTR e CDF em até 15 dias após destinação final.",
        "Apresentar Nota Fiscal discriminada por grupo e peso.",
      ];
      const obrR = [
        `Acondicionar resíduos: ${acond[0] || "conforme grupo selecionado"}.`,
        "Designar responsável para acompanhar e assinar a coleta.",
        "Garantir acesso às instalações nos dias acordados.",
        "Efetuar pagamento no prazo mediante nota fiscal.",
        "Comunicar alterações de volume com 72h de antecedência.",
      ];
      const drawBullets = (x: number, w: number, arr: string[]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(t.fSmall);
        let yy = y + 9;
        const gap = (h5 - 11) / arr.length;
        for (const s of arr) {
          doc.setTextColor(...ACC); doc.text("▸", x + 2.5, yy);
          doc.setTextColor(25);
          const lines = doc.splitTextToSize(s, w - 7) as string[];
          doc.text(lines.slice(0, 2), x + 5.5, yy);
          yy += Math.max(gap, lines.slice(0, 2).length * 3.3 + 0.6);
        }
      };
      drawBullets(M, colW, obrL);
      drawBullets(xR, colW, obrR);

      y += h5 + 3;

      // ── BLOCO 6 — ASSINATURA ────────────────────────────────────────
      const h6 = t.h6;
      // Esquerda: Contratada
      doc.setFillColor(...SOFT);
      doc.rect(M, y, colW, h6, "F");
      doc.setFillColor(...BRAND);
      doc.rect(M, y, 1.2, h6, "F");
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.6);
      doc.text("CONTRATADA", M + 3, y + 4);
      doc.setTextColor(20);
      doc.setFontSize(9);
      doc.text("Bio Logus Ambiental", M + 3, y + 9);
      doc.setDrawColor(120);
      doc.setLineWidth(0.3);
      doc.line(M + 3, y + h6 - 9, M + colW - 3, y + h6 - 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.fXs);
      doc.setTextColor(...MUTED);
      doc.text("Belkisia P. Santana — Comercial", M + 3, y + h6 - 5.5);
      doc.text(`Goiânia, ${dataEmissao}`, M + 3, y + h6 - 2);

      // Direita: Contratante
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(xR, y, colW, h6);
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.6);
      doc.text("CONTRATANTE", xR + 3, y + 4);
      doc.setTextColor(20);
      doc.setFontSize(9);
      const cName = cli?.razao_social || "—";
      doc.text(doc.splitTextToSize(cName, colW - 6).slice(0, 1) as string[], xR + 3, y + 9);
      doc.setDrawColor(120);
      doc.setLineWidth(0.3);
      doc.line(xR + 3, y + h6 - 9, xR + colW - 3, y + h6 - 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.fXs);
      doc.setTextColor(...MUTED);
      doc.text("Nome / Cargo: __________________________", xR + 3, y + h6 - 5.5);
      doc.text(`Data: ____/____/${ano}`, xR + 3, y + h6 - 2);

      // ── RODAPÉ ──────────────────────────────────────────────────────
      doc.setFillColor(...BRAND);
      doc.rect(0, PAGE_H - 6, PAGE_W, 6, "F");
      doc.setTextColor(255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.text(
        "(62) 3558-2791  ·  (62) 9 8423-6682  ·  comercial@biologusambiental.com.br",
        M, PAGE_H - 2.2,
      );
      doc.text("Página 1", PAGE_W - M, PAGE_H - 2.2, { align: "right" });

      return doc;
    };

    // Auto-compactação: tenta cada tier até caber em 1 página
    let doc = render(tiers[0]);
    for (let i = 1; i < tiers.length; i++) {
      const pages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      if (pages <= 1) break;
      doc = render(tiers[i]);
    }
    const finalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
    if (finalPages > 1) {
      for (let pg = finalPages; pg > 1; pg--) doc.deletePage(pg);
    }
    return doc;
  };



  const downloadPDF = async (p: Proposta) => {
    const doc = await buildPDF(p);
    doc.save(`Proposta-${p.numero}.pdf`);
  };

  const previewPDF = async (p: Proposta) => {
    try {
      const doc = await buildPDF(p);
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        // fallback se popup bloqueado: força download
        doc.save(`Proposta-${p.numero}.pdf`);
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      alert("Não foi possível gerar o PDF. Veja o console para detalhes.");
    }
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
                        <Button variant="ghost" size="icon" title="Visualizar PDF" onClick={() => previewPDF(p)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Baixar PDF" onClick={() => downloadPDF(p)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Enviar por e-mail" onClick={() => openEmailDialog(p)}>
                          <Mail className="h-4 w-4" />
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

      <Dialog open={emailDialog.open} onOpenChange={(o) => !emailDialog.sending && setEmailDialog((s) => ({ ...s, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar proposta {emailDialog.proposta?.numero} por e-mail</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail do destinatário</Label>
              <Input type="email" value={emailDialog.email} onChange={(e) => setEmailDialog((s) => ({ ...s, email: e.target.value }))} placeholder="cliente@empresa.com.br" />
            </div>
            <div className="space-y-2">
              <Label>Mensagem personalizada (opcional)</Label>
              <Textarea rows={4} value={emailDialog.mensagem} onChange={(e) => setEmailDialog((s) => ({ ...s, mensagem: e.target.value }))} placeholder="Substitui o texto padrão do e-mail." />
            </div>
            <p className="text-xs text-muted-foreground">O PDF da proposta será gerado e enviado como link de download (válido por 30 dias). Status mudará para <strong>Enviada</strong>.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmailDialog((s) => ({ ...s, open: false }))} disabled={emailDialog.sending}>Cancelar</Button>
            <Button onClick={sendByEmail} disabled={emailDialog.sending}>
              {emailDialog.sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
