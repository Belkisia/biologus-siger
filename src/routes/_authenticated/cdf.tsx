import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileCheck, Loader2, Trash2, Printer, Search, Send, Eye } from "lucide-react";
import { DocumentUpload, OpenDocumentButton } from "@/components/document-upload";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cdf")({
  component: CDFPage,
});

type CDF = {
  id: string;
  mtr_id: string;
  numero: string;
  data_destinacao: string;
  tecnologia: string | null;
  destinador: string | null;
  quantidade_destinada: number | null;
  url_documento: string | null;
  observacoes: string | null;
  enviado?: boolean | null;
  data_envio?: string | null;
  mtrs?: {
    numero: string;
    descricao_residuo: string;
    acondicionamento: string | null;
    unidade: string;
    classe_ibama: string | null;
    clientes?: {
      razao_social: string;
      fantasia: string | null;
      logradouro: string | null;
      cidade: string | null;
      cnpj: string | null;
    } | null;
  } | null;
};

const TECNOLOGIAS = [
  "Aterro Industrial", "Incineração", "Co-processamento",
  "Reciclagem", "Compostagem", "Autoclavagem", "Tratamento Químico",
];

function imprimirCDF(c: CDF) {
  const win = window.open("", "_blank");
  if (!win) return;
  const cliente = c.mtrs?.clientes;
  const dataFormatada = new Date(c.data_destinacao + "T12:00:00").toLocaleDateString("pt-BR");
  const hoje = new Date().toLocaleDateString("pt-BR");

  win.document.write(`<!DOCTYPE html><html><head><title>CDF ${c.numero}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px;max-width:800px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D9488;padding-bottom:12px;margin-bottom:16px}
    .logo{font-size:20px;font-weight:bold;color:#0D9488}
    .logo-sub{font-size:10px;color:#555;margin-top:2px}
    .cdf-badge{background:#0D9488;color:white;font-size:13px;font-weight:bold;padding:8px 18px;border-radius:4px;text-align:center}
    .cdf-num{font-size:11px;color:#555;margin-top:4px;text-align:center}
    .alert-box{background:#f0fdf4;border:2px solid #0D9488;border-radius:6px;padding:12px 16px;margin-bottom:16px;text-align:center}
    .alert-title{font-size:14px;font-weight:bold;color:#0D9488}
    .alert-sub{font-size:10px;color:#555;margin-top:2px}
    .section{margin-bottom:14px}
    .section-title{background:#0D9488;color:white;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-radius:3px 3px 0 0}
    .section-body{border:1px solid #ccc;border-top:none;padding:10px;border-radius:0 0 3px 3px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
    .field{margin-bottom:0}
    .field-label{font-size:9px;text-transform:uppercase;color:#777;letter-spacing:.5px;margin-bottom:1px}
    .field-value{font-size:11px;font-weight:600;border-bottom:1px solid #ddd;padding-bottom:2px;min-height:16px}
    .residuo-table{width:100%;border-collapse:collapse;margin-top:6px;font-size:10px}
    .residuo-table th{background:#f0f0f0;border:1px solid #ccc;padding:4px 6px;text-align:center}
    .residuo-table td{border:1px solid #ccc;padding:6px;text-align:center}
    .cert-text{font-size:10px;font-style:italic;color:#333;border:1px solid #ddd;padding:8px;border-radius:3px;margin-bottom:14px;background:#fafafa}
    .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}
    .ass-box{border:1px solid #000;padding:12px;border-radius:3px;text-align:center}
    .ass-title{font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2px}
    .ass-name{font-size:10px;color:#555;margin-bottom:32px}
    .ass-line{border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555}
    .highlight{background:#f0fdf4;border:1px solid #86efac;border-radius:4px;padding:10px;margin-bottom:14px}
    .highlight-row{display:flex;justify-content:space-between;align-items:center}
    .hl-item{text-align:center}
    .hl-val{font-size:18px;font-weight:bold;color:#0D9488}
    .hl-label{font-size:9px;color:#555;text-transform:uppercase}
    .footer{margin-top:16px;border-top:1px solid #ddd;padding-top:8px;font-size:9px;color:#999;text-align:center}
    @media print{body{padding:10px}@page{margin:1cm}}
  </style>
  </head><body>

  <div class="header">
    <div>
      <div class="logo">BIOLOGUS AMBIENTAL</div>
      <div class="logo-sub">Gestão de Resíduos de Saúde</div>
    </div>
    <div>
      <div class="cdf-badge">CERTIFICADO DE DESTINAÇÃO FINAL</div>
      <div class="cdf-num">Nº ${c.numero} &nbsp;|&nbsp; ${dataFormatada}</div>
    </div>
  </div>

  <div class="alert-box">
    <div class="alert-title">✓ Destinação Ambiental Confirmada</div>
    <div class="alert-sub">Este certificado atesta que os resíduos foram destinados de forma ambientalmente adequada conforme legislação vigente.</div>
  </div>

  <div class="highlight">
    <div class="highlight-row">
      <div class="hl-item"><div class="hl-val">${c.quantidade_destinada ?? "—"} ${c.mtrs?.unidade ?? "kg"}</div><div class="hl-label">Quantidade destinada</div></div>
      <div class="hl-item"><div class="hl-val">${c.tecnologia ?? "Incineração"}</div><div class="hl-label">Tecnologia</div></div>
      <div class="hl-item"><div class="hl-val">${dataFormatada}</div><div class="hl-label">Data de destinação</div></div>
      <div class="hl-item"><div class="hl-val">${c.mtrs?.numero ?? "—"}</div><div class="hl-label">MTR vinculado</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Gerador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">${cliente?.razao_social ?? "—"}</div></div>
        <div class="field"><div class="field-label">Nome Fantasia</div><div class="field-value">${cliente?.fantasia ?? "—"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">${cliente?.cnpj ?? "—"}</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">&nbsp;</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">${cliente?.logradouro ?? "—"}${cliente?.cidade ? `, ${cliente.cidade}` : ""}</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Resíduo Destinado</div>
    <div class="section-body">
      <table class="residuo-table">
        <thead><tr>
          <th>Caracterização</th><th>Classificação</th><th>Acondicionamento</th>
          <th>Quantidade</th><th>Unidade</th><th>Tecnologia</th>
        </tr></thead>
        <tbody><tr>
          <td style="text-align:left">${c.mtrs?.descricao_residuo ?? "—"}</td>
          <td>${c.mtrs?.classe_ibama ?? "RESÍDUO DE SAÚDE"}</td>
          <td>${c.mtrs?.acondicionamento ?? "BOMBONA"}</td>
          <td style="font-weight:bold">${c.quantidade_destinada ?? "—"}</td>
          <td>${c.mtrs?.unidade ?? "kg"}</td>
          <td>${c.tecnologia ?? "Incineração"}</td>
        </tr></tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Transportador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Nome</div><div class="field-value">ATIVA COMERCIAL COMERCIO E SERVICOS LTDA</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">51.480.805/0001-10</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">(62) 3299-6483</div></div>
        <div class="field"><div class="field-label">Tipo de transporte</div><div class="field-value">BAÚ</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Destinador Final</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">${c.destinador ?? "ECO INCINERAR GESTAO AMBIENTAL LTDA"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">12.018.483/0001-30</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">(62) 9900-5300</div></div>
        <div class="field"><div class="field-label">Tecnologia aplicada</div><div class="field-value">${c.tecnologia ?? "Incineração"}</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">LOTEAMENTO FLORIDA OURO QUADRA 07 LOTE 08, ZONA INDUSTRIAL, Alexânia - GO, 72930-000</div></div>
      </div>
    </div>
  </div>

  <div class="cert-text">
    Certificamos que os resíduos identificados neste documento foram coletados, transportados e destinados de forma ambientalmente adequada, em conformidade com a Lei Federal nº 12.305/2010 (Política Nacional de Resíduos Sólidos), a RDC ANVISA nº 222/2018 e demais normas aplicáveis.
  </div>

  <div class="section">
    <div class="section-title">Assinaturas</div>
    <div class="section-body">
      <div class="assinaturas">
        <div class="ass-box">
          <div class="ass-title">Gerador</div>
          <div class="ass-name">${cliente?.fantasia ?? cliente?.razao_social ?? ""}</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
        <div class="ass-box">
          <div class="ass-title">Biologus Ambiental</div>
          <div class="ass-name">Responsável Técnico</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
      </div>
    </div>
  </div>

  ${c.observacoes ? `<div class="section"><div class="section-title">Observações</div><div class="section-body"><p style="font-size:11px">${c.observacoes}</p></div></div>` : ""}

  <div class="footer">
    Biologus Ambiental — biologus.sisgr.com — CDF ${c.numero} — Emitido em ${hoje}
  </div>
  <script>window.onload=()=>window.print();</script>
  </body></html>`);
  win.document.close();
}

function CDFPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openVer, setOpenVer] = useState<CDF | null>(null);
  const [docPath, setDocPath] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTecnologia, setFiltroTecnologia] = useState("todas");
  const { user } = Route.useRouteContext();

  const { data: mtrs = [] } = useQuery({
    queryKey: ["mtrs-select-cdf"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mtrs")
        .select("id, numero, descricao_residuo")
        .order("data_emissao", { ascending: false });
      return data ?? [];
    },
  });

  const { data: cdfs = [], isLoading } = useQuery({
    queryKey: ["cdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cdfs")
        .select("*, mtrs(numero, descricao_residuo, acondicionamento, unidade, classe_ibama, clientes(razao_social, fantasia, logradouro, cidade, cnpj))")
        .order("data_destinacao", { ascending: false });
      if (error) throw error;
      return data as CDF[];
    },
  });

  const cdfsFiltrados = cdfs.filter((c) => {
    const termo = busca.toLowerCase();
    const matchBusca = !busca ||
      c.numero.toLowerCase().includes(termo) ||
      (c.mtrs?.clientes?.razao_social ?? "").toLowerCase().includes(termo) ||
      (c.mtrs?.clientes?.fantasia ?? "").toLowerCase().includes(termo) ||
      (c.mtrs?.numero ?? "").toLowerCase().includes(termo);
    const matchTec = filtroTecnologia === "todas" || c.tecnologia === filtroTecnologia;
    return matchBusca && matchTec;
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id } as never;
      const { error } = await supabase.from("cdfs").insert(row);
      if (error) throw error;
      if (payload.mtr_id) {
        await supabase.from("mtrs").update({ status: "destinado" }).eq("id", payload.mtr_id as string);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cdfs"] });
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      toast.success("CDF emitido");
      setDocPath(null);
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const marcarEnviado = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cdfs").update({ enviado: true, data_envio: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cdfs"] }); toast.success("CDF marcado como enviado"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cdfs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cdfs"] }); toast.success("CDF removido"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.mtr_id || !payload.numero || !payload.data_destinacao) {
      return toast.error("Preencha MTR, número e data de destinação");
    }
    if (payload.quantidade_destinada) payload.quantidade_destinada = Number(payload.quantidade_destinada);
    payload.url_documento = docPath;
    createMutation.mutate(payload);
  };

  const enviados = cdfs.filter((c) => c.enviado).length;
  const pendentes = cdfs.filter((c) => !c.enviado).length;
  const totalKg = cdfs.reduce((a, c) => a + (c.quantidade_destinada ? Number(c.quantidade_destinada) : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CDF — Certificados de Destinação Final</h1>
          <p className="text-sm text-muted-foreground">Comprovação ambiental da destinação adequada dos resíduos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={mtrs.length === 0}><Plus className="h-4 w-4 mr-2" />Emitir CDF</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Certificado de Destinação Final</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>MTR vinculado *</Label>
                  <Select name="mtr_id" required>
                    <SelectTrigger><SelectValue placeholder="Selecione o MTR" /></SelectTrigger>
                    <SelectContent>{mtrs.map((m) => <SelectItem key={m.id} value={m.id}>{m.numero} — {m.descricao_residuo}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Nº CDF *</Label>
                  <Input id="numero" name="numero" required placeholder="CDF-2026-0001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_destinacao">Data de destinação *</Label>
                  <Input id="data_destinacao" name="data_destinacao" type="date" required defaultValue={new Date().toISOString().slice(0,10)} />
                </div>
                <div className="space-y-2">
                  <Label>Tecnologia</Label>
                  <Select name="tecnologia" defaultValue="Incineração">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TECNOLOGIAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinador">Destinador</Label>
                  <Input id="destinador" name="destinador" defaultValue="ECO INCINERAR GESTAO AMBIENTAL LTDA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade_destinada">Quantidade destinada (kg)</Label>
                  <Input id="quantidade_destinada" name="quantidade_destinada" type="number" step="0.001" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <DocumentUpload folder="cdfs" value={docPath} onChange={setDocPath} label="Documento (PDF)" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" name="observacoes" rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Emitir
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de CDFs", val: cdfs.length, color: "text-foreground" },
          { label: "Pendentes envio", val: pendentes, color: "text-amber-600" },
          { label: "Enviados", val: enviados, color: "text-green-600" },
          { label: "Volume destinado (kg)", val: totalKg.toLocaleString("pt-BR"), color: "text-primary" },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.val}</p>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar CDF, cliente ou MTR..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["todas", ...TECNOLOGIAS].map((t) => (
            <button key={t} onClick={() => setFiltroTecnologia(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtroTecnologia === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
              {t === "todas" ? "Todas tecnologias" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : cdfsFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <FileCheck className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum certificado encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº CDF</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Gerador</TableHead>
                <TableHead>MTR</TableHead>
                <TableHead>Tecnologia</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cdfsFiltrados.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.numero}</TableCell>
                  <TableCell className="text-sm">{new Date(c.data_destinacao + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-sm">{c.mtrs?.clientes?.fantasia ?? c.mtrs?.clientes?.razao_social ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.mtrs?.numero ?? "—"}</TableCell>
                  <TableCell className="text-sm">{c.tecnologia ?? "—"}</TableCell>
                  <TableCell className="text-sm font-semibold whitespace-nowrap">
                    {c.quantidade_destinada ? `${Number(c.quantidade_destinada)} kg` : "—"}
                  </TableCell>
                  <TableCell>
                    {c.enviado
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">Enviado ✓</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Pendente</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenVer(c)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => imprimirCDF(c)} title="Imprimir">
                        <Printer className="h-4 w-4" />
                      </Button>
                      {!c.enviado && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => marcarEnviado.mutate(c.id)} title="Marcar enviado">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <OpenDocumentButton path={c.url_documento} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (confirm(`Remover CDF ${c.numero}?`)) deleteMutation.mutate(c.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog: Ver CDF */}
      {openVer && (
        <Dialog open={!!openVer} onOpenChange={() => setOpenVer(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>CDF {openVer.numero}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Gerador</p><p className="font-medium">{openVer.mtrs?.clientes?.fantasia ?? openVer.mtrs?.clientes?.razao_social ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">MTR</p><p className="font-medium">{openVer.mtrs?.numero ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Data destinação</p><p className="font-medium">{new Date(openVer.data_destinacao + "T12:00:00").toLocaleDateString("pt-BR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Quantidade</p><p className="font-bold text-primary">{openVer.quantidade_destinada ?? "—"} kg</p></div>
                <div><p className="text-xs text-muted-foreground">Tecnologia</p><p className="font-medium">{openVer.tecnologia ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Destinador</p><p className="font-medium text-xs">{openVer.destinador ?? "Eco Incinerar"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status envio</p>
                  {openVer.enviado
                    ? <span className="text-xs text-green-600 font-medium">Enviado em {openVer.data_envio ? new Date(openVer.data_envio).toLocaleDateString("pt-BR") : "—"}</span>
                    : <span className="text-xs text-amber-600 font-medium">Pendente</span>
                  }
                </div>
              </div>
              {openVer.observacoes && <div><p className="text-xs text-muted-foreground">Observações</p><p className="text-sm">{openVer.observacoes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => imprimirCDF(openVer)}><Printer className="h-4 w-4 mr-2" />Imprimir</Button>
              {!openVer.enviado && (
                <Button onClick={() => { marcarEnviado.mutate(openVer.id); setOpenVer(null); }}>
                  <Send className="h-4 w-4 mr-2" />Marcar enviado
                </Button>
              )}
              <Button variant="ghost" onClick={() => setOpenVer(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
