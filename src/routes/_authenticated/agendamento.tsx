import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays, MapPin, Plus, Printer, CheckCircle2, Circle,
  Loader2, Route as RouteIcon, ClipboardList, FileText, Layers
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/agendamento")({
  component: AgendamentoPage,
});

const ROTAS = [
  { id: "centro_aeroporto", label: "Centro / Aeroporto", semana: "S1", dias: "Seg–Sex" },
  { id: "campinas", label: "Campinas e Região", semana: "S1", dias: "2 dias" },
  { id: "vila_mutirao", label: "Vila Mutirão / Curitiba / Balneário", semana: "S1", dias: "2 dias" },
  { id: "senador_canedo", label: "Senador Canedo + Bela Vista", semana: "S1", dias: "1 dia" },
  { id: "nova_veneza", label: "Nova Veneza + Nerópolis", semana: "S1", dias: "1 dia" },
  { id: "setor_bueno", label: "Setor Bueno + Oeste", semana: "S2", dias: "2 dias" },
  { id: "setor_sul", label: "Setor Sul", semana: "S2", dias: "1 dia" },
  { id: "trindade", label: "Trindade", semana: "S2", dias: "1 dia" },
  { id: "itaberai", label: "Itaberaí", semana: "S2", dias: "2 dias" },
  { id: "quirinopolis", label: "Quirinópolis + Itumbiara", semana: "S2", dias: "1 dia" },
  { id: "morrinhos", label: "Morrinhos + Catalão", semana: "S2", dias: "1 dia" },
  { id: "aparecida", label: "Aparecida de Goiânia", semana: "S3", dias: "2 dias" },
  { id: "caldas_novas", label: "Caldas Novas", semana: "S3", dias: "1 dia" },
  { id: "anapolis", label: "Anápolis", semana: "S3", dias: "1 dia" },
  { id: "abadia_guapo", label: "Abadia / Guapó / Aragoiânia", semana: "S3", dias: "1 dia" },
  { id: "ipora", label: "Iporá e Região", semana: "S3/S1", dias: "2 dias" },
  { id: "inhumas", label: "Inhumas / Goianira / Caturaí", semana: "S4", dias: "2 dias" },
  { id: "vera_cruz", label: "Vera Cruz / Parque Oeste / Santa Rita", semana: "S4", dias: "1 dia" },
  { id: "brasilia", label: "Brasília", semana: "01/07", dias: "2 dias" },
  { id: "rio_verde", label: "Rio Verde", semana: "Semanal", dias: "Seg/Qua/Sex" },
  { id: "veterinaria", label: "Veterinária Quinzenal", semana: "Quinzenal", dias: "1 dia" },
];

const SEMANA_COLOR: Record<string, string> = {
  S1: "bg-blue-100 text-blue-800",
  S2: "bg-teal-100 text-teal-800",
  S3: "bg-amber-100 text-amber-800",
  S4: "bg-purple-100 text-purple-800",
  "S3/S1": "bg-orange-100 text-orange-800",
  "01/07": "bg-red-100 text-red-800",
  Semanal: "bg-green-100 text-green-800",
  Quinzenal: "bg-pink-100 text-pink-800",
};

type Cliente = { id: string; razao_social: string; fantasia: string | null; logradouro: string | null; cidade: string | null };
type MTR = { id: string; numero: string; cliente_id: string; status: string };

function AgendamentoPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();

  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toISOString().slice(0, 10));
  const [rotaSelecionada, setRotaSelecionada] = useState("");
  const [clientesSelecionados, setClientesSelecionados] = useState<string[]>([]);
  const [atendidos, setAtendidos] = useState<Set<string>>(new Set());
  const [abaAtiva, setAbaAtiva] = useState<"rota" | "mtr" | "imprimir">("rota");
  const [openLote, setOpenLote] = useState(false);
  const [openIndividual, setOpenIndividual] = useState(false);
  const [clienteIndividual, setClienteIndividual] = useState<Cliente | null>(null);
  const [mtrForm, setMtrForm] = useState({ numero: "", descricao_residuo: "GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES", quantidade: "", unidade: "kg", acondicionamento: "BOMBONA", classe_ibama: "Classe I — Perigoso" });
  const printRef = useRef<HTMLDivElement>(null);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-agendamento"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social, fantasia:nome_fantasia, logradouro:endereco, cidade").order("razao_social");
      return (data ?? []) as unknown as Cliente[];
    },
  });

  const { data: mtrsHoje = [] } = useQuery({
    queryKey: ["mtrs-hoje", dataSelecionada],
    queryFn: async () => {
      const { data } = await supabase.from("mtrs").select("id, numero, cliente_id, status").eq("data_emissao", dataSelecionada);
      return (data ?? []) as MTR[];
    },
  });

  const clientesDaRota = clientes.filter((c) => clientesSelecionados.includes(c.id));
  const mtrsPorCliente = (clienteId: string) => mtrsHoje.filter((m) => m.cliente_id === clienteId);

  const criarMtrLote = useMutation({
    mutationFn: async () => {
      const rows = clientesSelecionados.map((cid, i) => ({
        cliente_id: cid,
        numero: `MTR-${dataSelecionada.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
        data_emissao: dataSelecionada,
        descricao_residuo: mtrForm.descricao_residuo,
        quantidade: mtrForm.quantidade ? Number(mtrForm.quantidade) : null,
        unidade: mtrForm.unidade,
        acondicionamento: mtrForm.acondicionamento,
        classe_ibama: mtrForm.classe_ibama,
        status: "emitido",
        owner_id: user.id,
      }));
      const { error } = await supabase.from("mtrs").insert(rows as never[]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mtrs-hoje"] });
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      toast.success(`${clientesSelecionados.length} MTRs criados`);
      setOpenLote(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const criarMtrIndividual = useMutation({
    mutationFn: async () => {
      if (!clienteIndividual) return;
      const row = {
        cliente_id: clienteIndividual.id,
        numero: mtrForm.numero || `MTR-${dataSelecionada.replace(/-/g, "")}-IND`,
        data_emissao: dataSelecionada,
        descricao_residuo: mtrForm.descricao_residuo,
        quantidade: mtrForm.quantidade ? Number(mtrForm.quantidade) : null,
        unidade: mtrForm.unidade,
        acondicionamento: mtrForm.acondicionamento,
        classe_ibama: mtrForm.classe_ibama,
        status: "emitido",
        owner_id: user.id,
      };
      const { error } = await supabase.from("mtrs").insert([row] as never[]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mtrs-hoje"] });
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      toast.success("MTR criado");
      setOpenIndividual(false);
      setClienteIndividual(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAtendido = (id: string) => {
    setAtendidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win || !printRef.current) return;
    win.document.write(`<html><head><title>Rota ${dataSelecionada}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:20px}
        h1{font-size:16px;margin-bottom:4px}
        .sub{color:#555;font-size:11px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;margin-bottom:24px}
        th{background:#f0f0f0;padding:6px 8px;text-align:left;border:1px solid #ccc;font-size:11px}
        td{padding:6px 8px;border:1px solid #ccc;font-size:11px;vertical-align:top}
        .mtr-box{border:2px solid #000;padding:16px;margin-bottom:20px;page-break-inside:avoid}
        .mtr-title{font-size:13px;font-weight:bold;text-align:center;border-bottom:1px solid #000;padding-bottom:8px;margin-bottom:12px}
        .mtr-num{float:right;font-size:11px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
        .field{margin-bottom:6px}
        .field-label{font-size:9px;text-transform:uppercase;color:#555;letter-spacing:.5px}
        .field-value{font-size:11px;font-weight:bold;border-bottom:1px solid #999;padding-bottom:2px;min-height:16px}
        .residuo-table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10px}
        .residuo-table th,.residuo-table td{border:1px solid #000;padding:4px 6px}
        .residuo-table th{background:#eee}
        .assinatura{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px}
        .ass-box{border:1px solid #000;padding:10px;text-align:center}
        .ass-line{border-top:1px solid #000;margin-top:32px;padding-top:4px;font-size:10px}
        .logo-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;margin-bottom:12px;padding-bottom:8px}
        .logo-title{font-size:18px;font-weight:bold;color:#0D9488}
        @media print{body{padding:10px}.mtr-box{page-break-inside:avoid}}
      </style>
    </head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const semanas = [...new Set(ROTAS.map((r) => r.semana))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Agendamento de Rotas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Planeje a rota, gere MTRs em lote e acompanhe digitalmente.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="data-rota" className="text-sm whitespace-nowrap">Data da rota:</Label>
          <Input id="data-rota" type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} className="w-40" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { id: "rota", icon: RouteIcon, label: "Selecionar Rota" },
          { id: "mtr", icon: ClipboardList, label: `MTRs (${mtrsHoje.length})` },
          { id: "imprimir", icon: Printer, label: "Imprimir / Digital" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA: SELECIONAR ROTA */}
      {abaAtiva === "rota" && (
        <div className="space-y-6">
          {semanas.map((sem) => (
            <div key={sem}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEMANA_COLOR[sem] ?? "bg-gray-100 text-gray-800"}`}>{sem}</span>
                <span className="text-sm text-muted-foreground font-medium">Semana {sem}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ROTAS.filter((r) => r.semana === sem).map((rota) => (
                  <Card
                    key={rota.id}
                    onClick={() => setRotaSelecionada(rota.id === rotaSelecionada ? "" : rota.id)}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      rotaSelecionada === rota.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{rota.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rota.dias}</p>
                      </div>
                      <MapPin className={`h-4 w-4 mt-0.5 flex-shrink-0 ${rotaSelecionada === rota.id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Selecionar clientes */}
          {rotaSelecionada && (
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Clientes para a rota — {ROTAS.find((r) => r.id === rotaSelecionada)?.label}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setClientesSelecionados(clientes.map((c) => c.id))}>
                    Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setClientesSelecionados([])}>
                    Limpar
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Input placeholder="Buscar cliente..." className="mb-3" id="busca-cliente" onChange={(e) => {
                  const term = e.target.value.toLowerCase();
                  document.querySelectorAll("[data-cliente-item]").forEach((el) => {
                    const name = el.getAttribute("data-name") ?? "";
                    (el as HTMLElement).style.display = name.includes(term) ? "" : "none";
                  });
                }} />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 border rounded-md p-2">
                {clientes.map((c) => (
                  <div
                    key={c.id}
                    data-cliente-item
                    data-name={(c.fantasia || c.razao_social).toLowerCase()}
                    className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    onClick={() => setClientesSelecionados((prev) =>
                      prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                    )}
                  >
                    <Checkbox checked={clientesSelecionados.includes(c.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.fantasia || c.razao_social}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.logradouro ?? ""}{c.cidade ? ` — ${c.cidade}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">{clientesSelecionados.length} cliente(s) selecionado(s)</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={clientesSelecionados.length === 0}
                    onClick={() => { setAbaAtiva("imprimir"); }}
                  >
                    <Printer className="h-4 w-4 mr-1" /> Ver rota
                  </Button>
                  <Button
                    size="sm"
                    disabled={clientesSelecionados.length === 0}
                    onClick={() => setOpenLote(true)}
                  >
                    <Layers className="h-4 w-4 mr-1" /> Criar MTRs em lote
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ABA: MTRs */}
      {abaAtiva === "mtr" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              MTRs emitidos para <strong>{new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR")}</strong> — {mtrsHoje.length} no total
            </p>
            <Button size="sm" onClick={() => { setClienteIndividual(null); setOpenIndividual(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Novo MTR individual
            </Button>
          </div>

          {clientesDaRota.length > 0 && (
            <Card className="p-4 space-y-2">
              <h3 className="text-sm font-medium mb-3">Clientes da rota selecionada</h3>
              {clientesDaRota.map((c) => {
                const mtrsC = mtrsPorCliente(c.id);
                return (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{c.fantasia || c.razao_social}</p>
                      <p className="text-xs text-muted-foreground">{c.cidade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {mtrsC.length > 0 ? (
                        mtrsC.map((m) => (
                          <Badge key={m.id} variant="secondary" className="text-xs">{m.numero}</Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Sem MTR</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => { setClienteIndividual(c); setOpenIndividual(true); }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> MTR
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}

          {mtrsHoje.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum MTR para esta data.</p>
              <p className="text-xs text-muted-foreground mt-1">Selecione uma rota e crie em lote, ou crie individualmente.</p>
            </Card>
          )}
        </div>
      )}

      {/* ABA: IMPRIMIR / DIGITAL */}
      {abaAtiva === "imprimir" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {clientesDaRota.length} clientes · {atendidos.size} atendidos
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAtendidos(new Set(clientesSelecionados))}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Marcar todos
              </Button>
              <Button size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Imprimir
              </Button>
            </div>
          </div>

          {/* Digital checklist */}
          {clientesDaRota.length > 0 && (
            <div className="space-y-2">
              {clientesDaRota.map((c, i) => {
                const done = atendidos.has(c.id);
                const mtrsC = mtrsPorCliente(c.id);
                return (
                  <Card
                    key={c.id}
                    className={`p-4 transition-all cursor-pointer ${done ? "opacity-60 bg-muted/30" : ""}`}
                    onClick={() => toggleAtendido(c.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                          {c.fantasia || c.razao_social}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{c.logradouro}{c.cidade ? ` — ${c.cidade}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {mtrsC.map((m) => (
                          <Badge key={m.id} variant="secondary" className="text-xs">{m.numero}</Badge>
                        ))}
                        {done
                          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                          : <Circle className="h-5 w-5 text-muted-foreground/40" />
                        }
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {clientesDaRota.length === 0 && (
            <Card className="p-12 text-center">
              <RouteIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Selecione uma rota na aba "Selecionar Rota" primeiro.</p>
            </Card>
          )}

          {/* Área de impressão oculta */}
          <div className="hidden">
            <div ref={printRef}>
              <div className="logo-header">
                <div className="logo-title">BIOLOGUS AMBIENTAL</div>
                <div style={{ fontSize: 11 }}>
                  Rota: {ROTAS.find((r) => r.id === rotaSelecionada)?.label ?? "—"}<br />
                  Data: {new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR")}
                </div>
              </div>

              {/* Lista resumo */}
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Endereço</th>
                    <th>Cidade</th>
                    <th>MTR</th>
                    <th>Atendido</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesDaRota.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td><strong>{c.fantasia || c.razao_social}</strong></td>
                      <td>{c.logradouro ?? "—"}</td>
                      <td>{c.cidade ?? "—"}</td>
                      <td>{mtrsPorCliente(c.id).map((m) => m.numero).join(", ") || "—"}</td>
                      <td style={{ width: 60 }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ pageBreakBefore: "always" }} />

              {/* MTRs individuais */}
              {clientesDaRota.map((c, i) => {
                const mtrsC = mtrsPorCliente(c.id);
                const mtrNum = mtrsC[0]?.numero ?? `MTR-${dataSelecionada.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`;
                return (
                  <div key={c.id} className="mtr-box">
                    <div className="mtr-title">
                      MANIFESTO DE TRANSPORTE DE RESÍDUOS
                      <span className="mtr-num">Nº {mtrNum}</span>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #000", paddingBottom: 4, marginBottom: 8 }}>
                        GERADOR
                      </div>
                      <div className="grid2">
                        <div className="field">
                          <div className="field-label">Razão Social</div>
                          <div className="field-value">{c.razao_social}</div>
                        </div>
                        <div className="field">
                          <div className="field-label">Nome Fantasia</div>
                          <div className="field-value">{c.fantasia ?? "—"}</div>
                        </div>
                        <div className="field">
                          <div className="field-label">Endereço</div>
                          <div className="field-value">{c.logradouro ?? "—"}</div>
                        </div>
                        <div className="field">
                          <div className="field-label">Cidade / UF</div>
                          <div className="field-value">{c.cidade ?? "—"}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #000", paddingBottom: 4, marginBottom: 8 }}>
                        DESCRIÇÃO DO(S) RESÍDUO(S)
                      </div>
                      <table className="residuo-table">
                        <thead>
                          <tr>
                            <th>Caracterização</th>
                            <th>Estado Físico</th>
                            <th>Classif.</th>
                            <th>Cód. ONU</th>
                            <th>Nº Risco</th>
                            <th>Acondic.</th>
                            <th>Qtde</th>
                            <th>Un.</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES</td>
                            <td>SÓLIDO</td>
                            <td>RESÍDUO DE SAÚDE</td>
                            <td>2814</td>
                            <td>6.2</td>
                            <td>BOMBONA</td>
                            <td></td>
                            <td>kg</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #000", paddingBottom: 4, marginBottom: 8 }}>
                        TRANSPORTADOR
                      </div>
                      <div className="grid2">
                        <div className="field">
                          <div className="field-label">Nome</div>
                          <div className="field-value">ATIVA COMERCIAL COMERCIO E SERVICOS LTDA</div>
                        </div>
                        <div className="field">
                          <div className="field-label">CNPJ</div>
                          <div className="field-value">51.480.805/0001-10</div>
                        </div>
                        <div className="field">
                          <div className="field-label">Placa do Veículo</div>
                          <div className="field-value"></div>
                        </div>
                        <div className="field">
                          <div className="field-label">Condutor</div>
                          <div className="field-value"></div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #000", paddingBottom: 4, marginBottom: 8 }}>
                        RECEPTOR FINAL
                      </div>
                      <div className="grid2">
                        <div className="field">
                          <div className="field-label">Razão Social</div>
                          <div className="field-value">ECO INCINERAR GESTAO AMBIENTAL LTDA</div>
                        </div>
                        <div className="field">
                          <div className="field-label">CNPJ</div>
                          <div className="field-value">12.018.483/0001-30</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 10, fontStyle: "italic", borderTop: "1px solid #ccc", paddingTop: 6, marginBottom: 10 }}>
                      Eu, por meio deste manifesto, declaro que os resíduos acima listados estão integralmente descritos pelo nome, classificados, embalados e rotulados seguindo as normas vigentes e estão sob todos os aspectos em condições adequadas para transporte de acordo com os regulamentos nacionais e internacionais vigentes.
                    </div>

                    <div className="assinatura">
                      <div className="ass-box">
                        <div style={{ fontSize: 10, fontWeight: "bold" }}>GERADOR</div>
                        <div style={{ fontSize: 10 }}>{c.fantasia || c.razao_social}</div>
                        <div style={{ height: 48 }} />
                        <div className="ass-line">DATA _____________ ASSINATURA _________________________</div>
                      </div>
                      <div className="ass-box">
                        <div style={{ fontSize: 10, fontWeight: "bold" }}>TRANSPORTADOR</div>
                        <div style={{ fontSize: 10 }}>ATIVA COMERCIAL COMERCIO E SERVICOS LTDA</div>
                        <div style={{ height: 48 }} />
                        <div className="ass-line">DATA _____________ ASSINATURA _________________________</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Criar MTRs em lote */}
      <Dialog open={openLote} onOpenChange={setOpenLote}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Criar {clientesSelecionados.length} MTRs em lote
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Os dados abaixo serão aplicados a todos os clientes selecionados.</p>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Descrição do resíduo</Label>
                <Input value={mtrForm.descricao_residuo} onChange={(e) => setMtrForm((f) => ({ ...f, descricao_residuo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Quantidade (opcional)</Label>
                <Input type="number" placeholder="0.000" value={mtrForm.quantidade} onChange={(e) => setMtrForm((f) => ({ ...f, quantidade: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Unidade</Label>
                <Select value={mtrForm.unidade} onValueChange={(v) => setMtrForm((f) => ({ ...f, unidade: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["kg", "ton", "L", "m3", "un"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Acondicionamento</Label>
                <Input value={mtrForm.acondicionamento} onChange={(e) => setMtrForm((f) => ({ ...f, acondicionamento: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Classe IBAMA</Label>
                <Select value={mtrForm.classe_ibama} onValueChange={(v) => setMtrForm((f) => ({ ...f, classe_ibama: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Classe I — Perigoso", "Classe IIA — Não inerte", "Classe IIB — Inerte"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <p className="font-medium">Numeração automática:</p>
              <p className="text-muted-foreground text-xs mt-0.5">MTR-{dataSelecionada.replace(/-/g, "")}-001 até -{String(clientesSelecionados.length).padStart(3, "0")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenLote(false)}>Cancelar</Button>
            <Button onClick={() => criarMtrLote.mutate()} disabled={criarMtrLote.isPending}>
              {criarMtrLote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar {clientesSelecionados.length} MTRs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: MTR Individual */}
      <Dialog open={openIndividual} onOpenChange={setOpenIndividual}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Novo MTR — {clienteIndividual ? (clienteIndividual.fantasia || clienteIndividual.razao_social) : "Selecionar cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!clienteIndividual && (
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select onValueChange={(v) => setClienteIndividual(clientes.find((c) => c.id === v) ?? null)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.fantasia || c.razao_social}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Nº MTR</Label>
                <Input placeholder={`MTR-${dataSelecionada.replace(/-/g, "")}-IND`} value={mtrForm.numero} onChange={(e) => setMtrForm((f) => ({ ...f, numero: e.target.value }))} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Descrição do resíduo</Label>
                <Input value={mtrForm.descricao_residuo} onChange={(e) => setMtrForm((f) => ({ ...f, descricao_residuo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Quantidade</Label>
                <Input type="number" placeholder="0.000" value={mtrForm.quantidade} onChange={(e) => setMtrForm((f) => ({ ...f, quantidade: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Unidade</Label>
                <Select value={mtrForm.unidade} onValueChange={(v) => setMtrForm((f) => ({ ...f, unidade: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["kg", "ton", "L", "m3", "un"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Acondicionamento</Label>
                <Input value={mtrForm.acondicionamento} onChange={(e) => setMtrForm((f) => ({ ...f, acondicionamento: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Classe IBAMA</Label>
                <Select value={mtrForm.classe_ibama} onValueChange={(v) => setMtrForm((f) => ({ ...f, classe_ibama: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Classe I — Perigoso", "Classe IIA — Não inerte", "Classe IIB — Inerte"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setOpenIndividual(false); setClienteIndividual(null); }}>Cancelar</Button>
            <Button onClick={() => criarMtrIndividual.mutate()} disabled={criarMtrIndividual.isPending || !clienteIndividual}>
              {criarMtrIndividual.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar MTR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
