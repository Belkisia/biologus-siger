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
import { Plus, FileText, Loader2, Trash2, Printer, Search, Filter } from "lucide-react";
import { DocumentUpload, OpenDocumentButton } from "@/components/document-upload";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mtr")({
  component: MTRPage,
});

type MTR = {
  id: string; numero: string; data_emissao: string; cliente_id: string;
  gerador: string | null; transportador: string | null; destinador: string | null;
  classe_ibama: string | null; codigo_residuo: string | null; descricao_residuo: string;
  quantidade: number; unidade: string; acondicionamento: string | null;
  tecnologia_destinacao: string | null; status: string; url_documento: string | null;
  observacoes: string | null;
  clientes?: { razao_social: string; fantasia: string | null; logradouro: string | null; cidade: string | null; cnpj: string | null } | null;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  emitido:      { label: "Emitido",       color: "bg-blue-100 text-blue-800" },
  em_transporte:{ label: "Em Transporte", color: "bg-amber-100 text-amber-800" },
  recebido:     { label: "Recebido",      color: "bg-purple-100 text-purple-800" },
  destinado:    { label: "Destinado",     color: "bg-green-100 text-green-800" },
  cancelado:    { label: "Cancelado",     color: "bg-red-100 text-red-800" },
};

const CLASSES_IBAMA = ["Classe I — Perigoso", "Classe IIA — Não inerte", "Classe IIB — Inerte"];
const TECNOLOGIAS = ["Aterro Industrial", "Incineração", "Co-processamento", "Reciclagem", "Compostagem", "Autoclavagem", "Tratamento Químico"];

function imprimirMTR(m: MTR) {
  const win = window.open("", "_blank");
  if (!win) return;
  const cliente = m.clientes;
  const dataFormatada = new Date(m.data_emissao + "T12:00:00").toLocaleDateString("pt-BR");
  win.document.write(`<!DOCTYPE html><html><head><title>MTR ${m.numero}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:20px;max-width:800px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D9488;padding-bottom:12px;margin-bottom:16px}
    .logo{font-size:20px;font-weight:bold;color:#0D9488}
    .logo-sub{font-size:10px;color:#555;margin-top:2px}
    .mtr-title{text-align:center;font-size:15px;font-weight:bold;border:2px solid #000;padding:8px 20px;border-radius:4px}
    .mtr-num{font-size:12px;color:#555;margin-top:4px;text-align:center}
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
    .residuo-table td{border:1px solid #ccc;padding:4px 6px;text-align:center}
    .cert-text{font-size:10px;font-style:italic;color:#333;border:1px solid #ddd;padding:8px;border-radius:3px;margin-bottom:14px;background:#fafafa}
    .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}
    .ass-box{border:1px solid #000;padding:12px;border-radius:3px;text-align:center}
    .ass-title{font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2px}
    .ass-name{font-size:10px;color:#555;margin-bottom:24px}
    .ass-line{border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555}
    .footer{margin-top:16px;border-top:1px solid #ddd;padding-top:8px;font-size:9px;color:#999;text-align:center}
    @media print{body{padding:10px}@page{margin:1cm}}
  </style>
  </head><body>
  <div class="header">
    <div><div class="logo">BIOLOGUS AMBIENTAL</div><div class="logo-sub">Gestão de Resíduos de Saúde</div></div>
    <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${m.numero} &nbsp;|&nbsp; ${dataFormatada}</div></div>
  </div>

  <div class="section">
    <div class="section-title">Gerador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">${cliente?.razao_social ?? "—"}</div></div>
        <div class="field"><div class="field-label">Nome Fantasia</div><div class="field-value">${cliente?.fantasia ?? "—"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">${cliente?.cnpj ?? "—"}</div></div>
        <div class="field"><div class="field-label">Responsável / Telefone</div><div class="field-value">&nbsp;</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">${cliente?.logradouro ?? "—"}${cliente?.cidade ? `, ${cliente.cidade}` : ""}</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Descrição do(s) Resíduo(s)</div>
    <div class="section-body">
      <table class="residuo-table">
        <thead><tr>
          <th>Caracterização (Nome)</th><th>Estado Físico</th><th>Classif. / Código</th>
          <th>Código ONU</th><th>Nº Risco</th><th>Acondic.</th><th>Qtde</th><th>Un.</th>
        </tr></thead>
        <tbody><tr>
          <td style="text-align:left">${m.descricao_residuo}</td>
          <td>SÓLIDO</td>
          <td>${m.classe_ibama ?? "RESÍDUO DE SAÚDE"}</td>
          <td>2814</td><td>6.2</td>
          <td>${m.acondicionamento ?? "BOMBONA"}</td>
          <td>${m.quantidade > 0 ? m.quantidade : ""}</td>
          <td>${m.unidade}</td>
        </tr></tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Transportador</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Nome</div><div class="field-value">${m.transportador ?? "ATIVA COMERCIAL COMERCIO E SERVICOS LTDA"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">51.480.805/0001-10</div></div>
        <div class="field"><div class="field-label">Placa do Veículo</div><div class="field-value">&nbsp;</div></div>
        <div class="field"><div class="field-label">Condutor</div><div class="field-value">&nbsp;</div></div>
        <div class="field"><div class="field-label">Tipo de Transporte</div><div class="field-value">BAÚ</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">(62) 3299-6483</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">RUA JOSE GOMES BAYLAO, 794 - CONJ MORADA NOVA, Goiânia - GO</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Receptor Final</div>
    <div class="section-body">
      <div class="grid2">
        <div class="field"><div class="field-label">Razão Social</div><div class="field-value">${m.destinador ?? "ECO INCINERAR GESTAO AMBIENTAL LTDA"}</div></div>
        <div class="field"><div class="field-label">CNPJ</div><div class="field-value">12.018.483/0001-30</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">(62) 9900-5300</div></div>
        <div class="field"><div class="field-label">Tecnologia</div><div class="field-value">${m.tecnologia_destinacao ?? "Incineração"}</div></div>
        <div class="field" style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">LOTEAMENTO FLORIDA OURO QUADRA 07 LOTE 08, ZONA INDUSTRIAL, Alexânia - GO</div></div>
      </div>
    </div>
  </div>

  <div class="cert-text">
    Eu, por meio deste manifesto, declaro que os resíduos acima listados estão integralmente descritos pelo nome, classificados, embalados e rotulados seguindo as normas vigentes e estão sob todos os aspectos em condições adequadas para transporte de acordo com os regulamentos nacionais e internacionais vigentes.
  </div>

  <div class="section">
    <div class="section-title">Conferência</div>
    <div class="section-body">
      <div class="assinaturas">
        <div class="ass-box">
          <div class="ass-title">Gerador</div>
          <div class="ass-name">${cliente?.fantasia ?? cliente?.razao_social ?? ""}</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
        <div class="ass-box">
          <div class="ass-title">Transportador</div>
          <div class="ass-name">ATIVA COMERCIAL COMERCIO E SERVICOS LTDA</div>
          <div class="ass-line">DATA _____________ &nbsp;&nbsp; ASSINATURA _________________________</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">Biologus Ambiental — biologus.sisgr.com — Impresso em ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}</div>
  <script>window.onload=()=>window.print();</script>
  </body></html>`);
  win.document.close();
}

function MTRPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [docPath, setDocPath] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const { user } = Route.useRouteContext();

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social, fantasia").order('razao_social', { ascending: true });
      return data ?? [];
    },
  });

  const { data: mtrs = [], isLoading } = useQuery({
    queryKey: ["mtrs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mtrs")
        .select("*, clientes(razao_social, fantasia, logradouro, cidade, cnpj)")
        .order("data_emissao", { ascending: false });
      if (error) throw error;
      return data as MTR[];
    },
  });

  const mtrsFiltrados = mtrs.filter((m) => {
    const termo = busca.toLowerCase();
    const matchBusca = !busca ||
      m.numero.toLowerCase().includes(termo) ||
      (m.clientes?.razao_social ?? "").toLowerCase().includes(termo) ||
      (m.clientes?.fantasia ?? "").toLowerCase().includes(termo);
    const matchStatus = filtroStatus === "todos" || m.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await supabase.from("mtrs").insert([{ ...payload, owner_id: user.id }] as never[]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mtrs"] }); toast.success("MTR registrado"); setDocPath(null); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("mtrs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mtrs"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mtrs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mtrs"] }); toast.success("MTR removido"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.cliente_id || !payload.numero || !payload.descricao_residuo) return toast.error("Preencha cliente, número e descrição");
    if (payload.quantidade) payload.quantidade = Number(payload.quantidade);
    payload.url_documento = docPath;
    createMutation.mutate(payload);
  };

  const totalKg = mtrs.reduce((a, m) => a + (m.unidade === "kg" ? Number(m.quantidade) : 0), 0);
  const destinados = mtrs.filter((m) => m.status === "destinado").length;
  const abertos = mtrs.filter((m) => ["emitido","em_transporte"].includes(m.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">MTR — Manifesto de Transporte de Resíduos</h1>
          <p className="text-sm text-muted-foreground">Rastreabilidade legal do gerador ao destino final.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={clientes.length === 0}><Plus className="h-4 w-4 mr-2" />Novo MTR</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar MTR</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente (Gerador) *</Label>
                  <Select name="cliente_id" required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{(c as { fantasia?: string | null; razao_social: string }).fantasia || c.razao_social}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="numero">Nº MTR *</Label><Input id="numero" name="numero" required placeholder="MTR-2026-0001" /></div>
                <div className="space-y-2"><Label htmlFor="data_emissao">Data de emissão</Label><Input id="data_emissao" name="data_emissao" type="date" defaultValue={new Date().toISOString().slice(0,10)} /></div>
                <div className="space-y-2">
                  <Label>Classe IBAMA</Label>
                  <Select name="classe_ibama">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{CLASSES_IBAMA.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="codigo_residuo">Código IBAMA</Label><Input id="codigo_residuo" name="codigo_residuo" placeholder="ex.: 180103" /></div>
                <div className="space-y-2"><Label htmlFor="acondicionamento">Acondicionamento</Label><Input id="acondicionamento" name="acondicionamento" defaultValue="BOMBONA" /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="descricao_residuo">Descrição do resíduo *</Label><Input id="descricao_residuo" name="descricao_residuo" required defaultValue="GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES" /></div>
                <div className="space-y-2"><Label htmlFor="quantidade">Quantidade</Label><Input id="quantidade" name="quantidade" type="number" step="0.001" /></div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select name="unidade" defaultValue="kg">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["kg","ton","L","m3","un"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="transportador">Transportador</Label><Input id="transportador" name="transportador" defaultValue="ATIVA COMERCIAL COMERCIO E SERVICOS LTDA" /></div>
                <div className="space-y-2"><Label htmlFor="destinador">Destinador</Label><Input id="destinador" name="destinador" defaultValue="ECO INCINERAR GESTAO AMBIENTAL LTDA" /></div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Tecnologia de destinação</Label>
                  <Select name="tecnologia_destinacao" defaultValue="Incineração">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TECNOLOGIAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2"><DocumentUpload folder="mtrs" value={docPath} onChange={setDocPath} label="Documento (PDF)" /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="observacoes">Observações</Label><Textarea id="observacoes" name="observacoes" rows={2} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Registrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de MTRs", val: mtrs.length, color: "text-foreground" },
          { label: "Em aberto", val: abertos, color: "text-amber-600" },
          { label: "Destinados", val: destinados, color: "text-green-600" },
          { label: "Volume (kg)", val: totalKg.toLocaleString("pt-BR"), color: "text-primary" },
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
          <Input placeholder="Buscar MTR ou cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {["todos", ...Object.keys(STATUS_MAP)].map((s) => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filtroStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
              {s === "todos" ? "Todos" : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : mtrsFiltrados.length === 0 ? (
          <div className="py-16 text-center"><FileText className="h-10 w-10 mx-auto text-muted-foreground/40" /><p className="mt-3 text-sm text-muted-foreground">Nenhum MTR encontrado.</p></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº MTR</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Gerador</TableHead>
                <TableHead>Resíduo</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mtrsFiltrados.map((m) => {
                const s = STATUS_MAP[m.status] ?? STATUS_MAP.emitido;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.numero}</TableCell>
                    <TableCell className="text-sm">{new Date(m.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{m.clientes?.fantasia ?? m.clientes?.razao_social ?? "—"}</TableCell>
                    <TableCell>
                      <div className="text-sm truncate max-w-48">{m.descricao_residuo}</div>
                      {m.classe_ibama && <div className="text-xs text-muted-foreground">{m.classe_ibama}</div>}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap font-semibold">{Number(m.quantidade) > 0 ? `${Number(m.quantidade)} ${m.unidade}` : "—"}</TableCell>
                    <TableCell>
                      <Select value={m.status} onValueChange={(v) => updateStatus.mutate({ id: m.id, status: v })}>
                        <SelectTrigger className="w-36 h-7 border-0 p-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => imprimirMTR(m)} title="Imprimir MTR">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <OpenDocumentButton path={m.url_documento} />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (confirm(`Remover MTR ${m.numero}?`)) deleteMutation.mutate(m.id); }}>
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
