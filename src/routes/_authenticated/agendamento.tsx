import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
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
import {
  CalendarDays, MapPin, Plus, Printer, CheckCircle2, Circle,
  Loader2, Route as RouteIcon, ClipboardList, Layers, Trash2,
  Scale, Search, ChevronLeft, Map, Users, FileText, ArrowRight, PenLine, RotateCcw, CheckCheck
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
  S1: "bg-blue-100 text-blue-800", S2: "bg-teal-100 text-teal-800",
  S3: "bg-amber-100 text-amber-800", S4: "bg-purple-100 text-purple-800",
  "S3/S1": "bg-orange-100 text-orange-800", "01/07": "bg-red-100 text-red-800",
  Semanal: "bg-green-100 text-green-800", Quinzenal: "bg-pink-100 text-pink-800",
};

type Cliente = {
  id: string; razao_social: string; nome_fantasia: string | null;
  logradouro: string | null; cidade: string | null;
  latitude: number | null; longitude: number | null;
};

type RotaCliente = {
  id: string; ordem: number; coletado: boolean;
  cliente: Cliente;
};

// ---- Componente de detalhe da rota ----
function imprimirMTRsLote(mtrs: any[], rotaClientes: any[]) {
  const clienteObj: Record<string, any> = {};
  rotaClientes.forEach(rc => { clienteObj[rc.cliente.id] = rc.cliente; });

  const pages = mtrs.map((mtr, idx) => {
    const c = clienteObj[mtr.cliente_id] || {};
    const d = mtr.data_emissao ? new Date(mtr.data_emissao + "T12:00:00").toLocaleDateString("pt-BR") : "";
    const pb = idx < mtrs.length - 1 ? "page-break-after:always;" : "";
    return `<div style="${pb}padding:20px;max-width:800px;margin:0 auto;font-family:Arial,sans-serif;font-size:11px;color:#000">
      <div style="display:flex;justify-content:space-between;border-bottom:3px solid #0D9488;padding-bottom:10px;margin-bottom:14px">
        <div><b style="font-size:18px;color:#0D9488">BIOLOGUS AMBIENTAL</b><br/><span style="font-size:10px;color:#555">Gestão de Resíduos de Saúde</span></div>
        <div style="text-align:center"><b style="font-size:13px;border:2px solid #000;padding:6px 14px;display:inline-block">MANIFESTO DE TRANSPORTE DE RESÍDUOS</b><br/><span style="font-size:11px;color:#555">Nº ${mtr.numero} | ${d}</span></div>
      </div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Gerador</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Razão Social</div><b>${c.razao_social || ""}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">CNPJ</div><b>${c.cnpj || ""}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Endereço</div><b>${c.logradouro || ""}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Cidade</div><b>${c.cidade || ""}</b></div>
      </div></div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Transportador</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Razão Social</div><b>BIO LOGUS AMBIENTAL LTDA - ME</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">CNPJ</div><b>26.484.921/0001-60</b></div>
        <div style="grid-column:span 2"><div style="color:#777;text-transform:uppercase;font-size:9px">Endereço</div><b>RUA DOS FERROVIARIOS, QD 01, LT 05 — PARQUE INDUSTRIAL JOÃO BRÁS 2 — Goiânia - GO</b></div>
      </div></div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Receptor Final</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Razão Social</div><b>B-GREEN GESTAO AMBIENTAL S.A.</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">CNPJ</div><b>01.568.077/0006-30</b></div>
        <div style="grid-column:span 2"><div style="color:#777;text-transform:uppercase;font-size:9px">Endereço</div><b>SETOR INDUSTRIAL DA CEILANDIA QI 21 LOTE 51/53/55 — CEILANDIA — Brasília - DF — CEP 72265-210</b></div>
      </div></div>
      <div style="margin-bottom:10px"><div style="background:#0D9488;color:#fff;font-size:10px;font-weight:bold;padding:3px 8px;text-transform:uppercase">Resíduos</div>
      <div style="border:1px solid #ccc;border-top:none;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px">
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Descrição</div><b>${mtr.descricao_residuo || "GRUPO A, B E INFECTANTES"}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Acondicionamento</div><b>${mtr.acondicionamento || "BOMBONA"}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Quantidade</div><b>${mtr.quantidade || "___"} ${mtr.unidade || "kg"}</b></div>
        <div><div style="color:#777;text-transform:uppercase;font-size:9px">Status</div><b>${mtr.status || "emitido"}</b></div>
      </div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px">
        <div style="border:1px solid #000;padding:10px;text-align:center;font-size:10px"><b>GERADOR</b>${mtr.assinatura_gerador ? `<img src="${mtr.assinatura_gerador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto"/>` : `<div style="margin-top:26px;border-top:1px solid #999;padding-top:4px;color:#555">Assinatura / Carimbo</div>`}</div>
        <div style="border:1px solid #000;padding:10px;text-align:center;font-size:10px"><b>TRANSPORTADOR</b>${mtr.assinatura_transportador ? `<img src="${mtr.assinatura_transportador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto"/>` : `<div style="margin-top:26px;border-top:1px solid #999;padding-top:4px;color:#555">Assinatura / Carimbo</div>`}</div>
      </div>
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>MTRs em Lote</title><style>*{box-sizing:border-box;margin:0;padding:0}@media print{@page{margin:1cm;size:A4}}</style></head><body>${pages}</body></html>`;
  const win = window.open("", "_blank");
  if (!win) { alert("Permita popups para este site e tente novamente"); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}
function imprimirMTRAgendamento(mtr: any, cliente: any) {
  const win = window.open("", "_blank");
  if (!win) return;
  const dataFmt = new Date(mtr.data_emissao + "T12:00:00").toLocaleDateString("pt-BR");
  win.document.write(`<!DOCTYPE html><html><head><title>MTR ${mtr.numero}</title>
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
    .field-label{font-size:9px;text-transform:uppercase;color:#777;letter-spacing:.5px;margin-bottom:1px}
    .field-value{font-size:11px;font-weight:600;border-bottom:1px solid #ddd;padding-bottom:2px;min-height:16px}
    .assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px}
    .ass-box{border:1px solid #000;padding:12px;border-radius:3px;text-align:center}
    .ass-title{font-weight:bold;font-size:10px;text-transform:uppercase;margin-bottom:2px}
    .ass-line{border-top:1px solid #555;padding-top:4px;font-size:9px;color:#555;margin-top:30px}
    .footer{margin-top:16px;border-top:1px solid #ddd;padding-top:8px;font-size:9px;color:#999;text-align:center}
    @media print{body{padding:10px}@page{margin:1cm}}
  </style></head><body>
  <div class="header">
    <div><div class="logo">BIOLOGUS AMBIENTAL</div><div class="logo-sub">Gestão de Resíduos de Saúde</div></div>
    <div><div class="mtr-title">MANIFESTO DE TRANSPORTE DE RESÍDUOS</div><div class="mtr-num">Nº ${mtr.numero} &nbsp;|&nbsp; ${dataFmt}</div></div>
  </div>
  <div class="section">
    <div class="section-title">Gerador (Contratante)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">${cliente.razao_social || ""}</div></div>
        <div><div class="field-label">Nome Fantasia</div><div class="field-value">${cliente.nome_fantasia || ""}</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">${cliente.cnpj || ""}</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">${cliente.logradouro || ""}</div></div>
        <div><div class="field-label">Cidade</div><div class="field-value">${cliente.cidade || ""}</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Transportador (Contratada)</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">BIO LOGUS AMBIENTAL LTDA - ME</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">26.484.921/0001-60</div></div>
        <div><div class="field-label">Endereço</div><div class="field-value">RUA DOS FERROVIARIOS, QD 01, LT 05 — PARQUE INDUSTRIAL JOÃO BRÁS 2</div></div>
        <div><div class="field-label">Cidade</div><div class="field-value">Goiânia - GO</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Receptor Final</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Razão Social</div><div class="field-value">B-GREEN GESTAO AMBIENTAL S.A.</div></div>
        <div><div class="field-label">CNPJ</div><div class="field-value">01.568.077/0006-30</div></div>
        <div><div class="field-label">Responsável</div><div class="field-value">&nbsp;</div></div>
        <div><div class="field-label">Telefone</div><div class="field-value">&nbsp;</div></div>
        <div style="grid-column:span 2"><div class="field-label">Endereço</div><div class="field-value">SETOR INDUSTRIAL DA CEILANDIA QI 21 LOTE 51/53/55 — CEILANDIA — Brasília - DF — CEP 72265-210</div></div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Resíduos</div>
    <div class="section-body">
      <div class="grid2">
        <div><div class="field-label">Descrição</div><div class="field-value">${mtr.descricao_residuo || "GRUPO A, B E INFECTANTES, QUÍMICOS E PERFURO CORTANTES"}</div></div>
        <div><div class="field-label">Acondicionamento</div><div class="field-value">${mtr.acondicionamento || "BOMBONA"}</div></div>
        <div><div class="field-label">Quantidade</div><div class="field-value">${mtr.quantidade || "___"} ${mtr.unidade || "kg"}</div></div>
        <div><div class="field-label">Status</div><div class="field-value">${mtr.status || "emitido"}</div></div>
      </div>
    </div>
  </div>
  <div class="assinaturas">
    <div class="ass-box">
      <div class="ass-title">Gerador</div>
      ${mtr.assinatura_gerador ? `<img src="${mtr.assinatura_gerador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto" /><div style="font-size:9px;color:#555;border-top:1px solid #555;padding-top:3px;margin-top:2px">${cliente.razao_social || ""}</div>` : `<div class="ass-line">Assinatura / Carimbo</div>`}
    </div>
    <div class="ass-box">
      <div class="ass-title">Transportador</div>
      ${mtr.assinatura_transportador ? `<img src="${mtr.assinatura_transportador}" style="max-width:100%;max-height:70px;display:block;margin:4px auto" /><div style="font-size:9px;color:#555;border-top:1px solid #555;padding-top:3px;margin-top:2px">BIO LOGUS AMBIENTAL LTDA - ME</div>` : `<div class="ass-line">Assinatura / Carimbo</div>`}
    </div>
  </div>
  <div class="footer">Documento gerado pelo SIGER PRO — Bio Logus Ambiental | ${new Date().toLocaleDateString("pt-BR")}</div>
  <script>window.onload=()=>window.print();</script>
  </body></html>`);
  win.document.close();
}

// Componente de assinatura digital
function AssinaturaPad({ onSave, onCancel, titulo }: { onSave: (dataUrl: string) => void; onCancel: () => void; titulo: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { drawing.current = false; lastPos.current = null; };

  const limpar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const salvar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-center">{titulo}</p>
      <div className="border-2 border-dashed border-border rounded-lg bg-white touch-none" style={{ touchAction: "none" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full rounded-lg"
          style={{ touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">Assine acima com o dedo ou caneta</p>
      <div className="flex gap-2 justify-between">
        <Button variant="outline" size="sm" onClick={limpar}>
          <RotateCcw className="h-4 w-4 mr-1" /> Limpar
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={salvar}>
            <PenLine className="h-4 w-4 mr-1" /> Salvar Assinatura
          </Button>
        </div>
      </div>
    </div>
  );
}

function RotaDetalhe({
  rota, dataSelecionada, onVoltar, user
}: {
  rota: typeof ROTAS[0];
  dataSelecionada: string;
  onVoltar: () => void;
  user: any;
}) {
  const qc = useQueryClient();
  const [openAddClientes, setOpenAddClientes] = useState(false);
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [openMTRLote, setOpenMTRLote] = useState(false);
  const [descResiduo, setDescResiduo] = useState("GRUPO A, B, E INFECTANTES, QUIMICOS E PERFURO CORTANTES");
  const [abaAtiva, setAbaAtiva] = useState<"lista" | "mapa">("lista");
  const [openAssinatura, setOpenAssinatura] = useState<{ mtr: any; cliente: any; etapa: "gerador" | "transportador" } | null>(null);

  // Clientes vinculados à rota
  const { data: rotaClientes = [], isLoading } = useQuery({
    queryKey: ["rota-clientes", rota.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("rota_clientes")
        .select("id, ordem, coletado, clientes(id, razao_social, nome_fantasia, logradouro, cidade, cnpj, latitude, longitude)")
        .eq("rota_codigo", rota.id)
        .order("ordem");
      return (data ?? []).map((rc: any) => ({
        id: rc.id,
        ordem: rc.ordem,
        coletado: rc.coletado ?? false,
        cliente: rc.clientes,
      })).filter((rc: any) => rc.cliente) as RotaCliente[];
    },
  });

  // MTRs do dia para essa rota
  const { data: mtrsHoje = [] } = useQuery({
    queryKey: ["mtrs-rota", rota.id, dataSelecionada],
    queryFn: async () => {
      if (!rotaClientes.length) return [];
      const { data } = await supabase
        .from("mtrs")
        .select("id, numero, cliente_id, status, quantidade, unidade, data_emissao, descricao_residuo, acondicionamento, assinatura_gerador, assinatura_transportador")
        .eq("rota_codigo", rota.id)
        .eq("data_emissao", dataSelecionada);
      return data ?? [];
    },
    enabled: rotaClientes.length > 0,
  });

  // Todos clientes para adicionar
  const { data: todosClientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("id, razao_social, nome_fantasia, logradouro, cidade")
        .eq("ativo", true)
        .order('razao_social', { ascending: true });
      return (data ?? []) as Cliente[];
    },
  });

  const jaVinculados = new Set(rotaClientes.map(rc => rc.cliente.id));

  const adicionarClientes = useMutation({
    mutationFn: async () => {
      const rows = selecionados.map((cid, i) => ({
        owner_id: user.id,
        rota_codigo: rota.id,
        rota_id: null,
        cliente_id: cid,
        ordem: rotaClientes.length + i + 1,
        frequencia: "semanal",
        coletado: false,
      }));
      const { error } = await supabase.from("rota_clientes").upsert(rows as any, { onConflict: "rota_codigo,cliente_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rota-clientes"] });
      toast.success(`${selecionados.length} clientes adicionados`);
      setOpenAddClientes(false);
      setSelecionados([]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const baixarMTR = useMutation({
    mutationFn: async ({ mtrId, peso }: { mtrId: string; peso: number }) => {
      const { error } = await supabase.from("mtrs").update({
        status: "baixado",
        quantidade: peso,
        data_baixa: new Date().toISOString().split("T")[0],
      }).eq("id", mtrId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mtrs-rota"] });
      toast.success("MTR baixado com sucesso!");
      setOpenBaixa(null);
      setPesoBaixa("");
    },
  });

  const salvarAssinatura = useMutation({
    mutationFn: async ({ mtrId, campo, dataUrl }: { mtrId: string; campo: string; dataUrl: string }) => {
      const { error } = await supabase.from("mtrs").update({ [campo]: dataUrl }).eq("id", mtrId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mtrs-rota"] }); toast.success("Assinatura salva!"); },
  });

  const removerCliente = useMutation({
    mutationFn: async (rcId: string) => {
      const { error } = await supabase.from("rota_clientes").delete().eq("id", rcId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rota-clientes"] }); toast.success("Cliente removido"); },
  });

  const marcarColetado = useMutation({
    mutationFn: async ({ rcId, coletado }: { rcId: string; coletado: boolean }) => {
      const { error } = await supabase.from("rota_clientes").update({ coletado }).eq("id", rcId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rota-clientes"] }),
  });

  const criarMTRsLote = useMutation({
    mutationFn: async () => {
      const rows = rotaClientes.map((rc, i) => ({
        owner_id: user.id,
        cliente_id: rc.cliente.id,
        numero: `MTR-${dataSelecionada.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
        data_emissao: dataSelecionada,
        descricao_residuo: descResiduo,
        quantidade: 0,
        unidade: "kg",
        acondicionamento: "BOMBONA",
        status: "emitido",
        rota_codigo: rota.id,
      }));
      const { error } = await supabase.from("mtrs").insert(rows as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mtrs-rota"] });
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      toast.success(`${rotaClientes.length} MTRs criados!`);
      setOpenMTRLote(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const imprimirRota = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const hoje = new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR");
    win.document.write(`<!DOCTYPE html><html><head><title>Rota ${rota.label}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;padding:20px}
      h1{font-size:16px;color:#0D9488;margin-bottom:4px}
      .sub{color:#666;font-size:11px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th{background:#f0f0f0;padding:6px 8px;text-align:left;border:1px solid #ccc;font-size:11px}
      td{padding:6px 8px;border:1px solid #ccc;font-size:11px}
      .mtr{color:#0D9488;font-weight:bold}
      @media print{@page{margin:1cm}}
    </style></head><body>
    <h1>${rota.label}</h1>
    <div class="sub">Data: ${hoje} · ${rotaClientes.length} clientes · Semana ${rota.semana}</div>
    <table>
      <thead><tr><th>#</th><th>Cliente</th><th>Endereço</th><th>MTR</th><th>Peso (kg)</th><th>Coletado</th></tr></thead>
      <tbody>
        ${rotaClientes.map((rc, i) => {
          const mtr = mtrsHoje.find((m: any) => m.cliente_id === rc.cliente.id);
          return `<tr>
            <td>${i + 1}</td>
            <td><strong>${rc.cliente.nome_fantasia || rc.cliente.razao_social}</strong></td>
            <td>${rc.cliente.logradouro || "—"}</td>
            <td class="mtr">${mtr ? mtr.numero : "—"}</td>
            <td></td>
            <td style="text-align:center">${rc.coletado ? "✓" : "□"}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
    <script>window.onload=()=>window.print();</script>
    </body></html>`);
    win.document.close();
  };

  const clientesFiltrados = todosClientes.filter(c => {
    const t = busca.toLowerCase();
    return !t || (c.nome_fantasia || c.razao_social).toLowerCase().includes(t) || (c.cidade ?? "").toLowerCase().includes(t);
  });

  const totalColetados = rotaClientes.filter(rc => rc.coletado).length;
  const progresso = rotaClientes.length > 0 ? Math.round((totalColetados / rotaClientes.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onVoltar}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Rotas
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {rota.label}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR")} · Semana {rota.semana} · {rota.dias}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={imprimirRota}>
            <Printer className="h-4 w-4 mr-1" /> Imprimir
          </Button>
          {mtrsHoje.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => imprimirMTRsLote(mtrsHoje, rotaClientes)}>
              <Printer className="h-4 w-4 mr-1" /> MTRs em lote
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setOpenAddClientes(true)}>
            <Plus className="h-4 w-4 mr-1" /> Clientes
          </Button>
          <Button size="sm" onClick={() => setOpenMTRLote(true)} disabled={rotaClientes.length === 0 || mtrsHoje.length > 0}>
            <FileText className="h-4 w-4 mr-1" />
            {mtrsHoje.length > 0 ? `${mtrsHoje.length} MTRs emitidos` : "Gerar MTRs"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Clientes", val: rotaClientes.length, color: "text-primary" },
          { label: "Coletados", val: totalColetados, color: "text-green-600" },
          { label: "Pendentes", val: rotaClientes.length - totalColetados, color: "text-amber-600" },
          { label: "MTRs", val: mtrsHoje.length, color: "text-teal-600" },
        ].map(k => (
          <Card key={k.label} className="p-3 text-center">
            <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Progresso */}
      {rotaClientes.length > 0 && (
        <Card className="p-3">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progresso da coleta</span>
            <span className="font-bold text-primary">{progresso}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${progresso}%` }} />
          </div>
        </Card>
      )}

      {/* Tabs lista/mapa */}
      <div className="flex border-b">
        {[{ id: "lista", icon: Users, label: "Lista" }, { id: "mapa", icon: Map, label: "Mapa" }].map(t => (
          <button key={t.id} onClick={() => setAbaAtiva(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${abaAtiva === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Lista de clientes */}
      {abaAtiva === "lista" && (
        <Card>
          {isLoading ? (
            <div className="py-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
          ) : rotaClientes.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum cliente vinculado.</p>
              <Button size="sm" className="mt-3" onClick={() => setOpenAddClientes(true)}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar clientes
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {rotaClientes.map((rc, i) => {
                const mtr = mtrsHoje.find((m: any) => m.cliente_id === rc.cliente.id);
                return (
                  <div key={rc.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${rc.coletado ? "bg-green-50/50" : ""}`}>
                    <button
                      onClick={() => marcarColetado.mutate({ rcId: rc.id, coletado: !rc.coletado })}
                      className="flex-shrink-0">
                      {rc.coletado
                        ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                        : <Circle className="h-6 w-6 text-muted-foreground/30" />}
                    </button>
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rc.coletado ? "bg-green-500 text-white" : "bg-primary text-white"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${rc.coletado ? "line-through text-muted-foreground" : ""}`}>
                        {rc.cliente.nome_fantasia || rc.cliente.razao_social}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {rc.cliente.logradouro || ""}{rc.cliente.cidade ? ` — ${rc.cliente.cidade}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {mtr && (
                        <>
                          <Badge variant={mtr.status === "baixado" ? "default" : "secondary"} className={`text-xs ${mtr.status === "baixado" ? "bg-green-500" : ""}`}>
                            {mtr.status === "baixado" ? `${mtr.quantidade}kg ✓` : mtr.numero}
                          </Badge>
                          {mtr.status !== "baixado" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Dar baixa no MTR"
                              onClick={() => {
                                const peso = window.prompt(`Peso coletado (kg) — ${rc.cliente.nome_fantasia || rc.cliente.razao_social}:`);
                                if (peso === null) return;
                                baixarMTR.mutate({ mtrId: mtr.id, peso: parseFloat(peso) || 0 });
                              }}>
                              <CheckCheck className="h-3.5 w-3.5 text-orange-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Assinar MTR"
                            onClick={() => setOpenAssinatura({ mtr, cliente: rc.cliente, etapa: "gerador" })}>
                            <PenLine className={`h-3.5 w-3.5 ${mtr.assinatura_gerador ? "text-green-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Imprimir MTR"
                            onClick={() => imprimirMTRAgendamento(mtr, rc.cliente)}>
                            <Printer className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => removerCliente.mutate(rc.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Mapa */}
      {abaAtiva === "mapa" && (
        <Card className="overflow-hidden">
          <div id="mapa-rota" style={{ height: 420 }} />
          <script dangerouslySetInnerHTML={{ __html: `
            if (typeof L !== 'undefined') {
              const map = L.map('mapa-rota').setView([-16.686, -49.264], 11);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OSM'}).addTo(map);
              const clientes = ${JSON.stringify(rotaClientes.filter(rc => rc.cliente.latitude).map((rc, i) => ({
                lat: rc.cliente.latitude, lng: rc.cliente.longitude,
                nome: rc.cliente.nome_fantasia || rc.cliente.razao_social,
                coletado: rc.coletado, ordem: i + 1,
              })))};
              clientes.forEach(c => {
                const col = c.coletado ? '#22c55e' : '#0D9488';
                const ic = L.divIcon({className:'',html:\`<div style="background:\${col};color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)">\${c.ordem}</div>\`,iconSize:[26,26],iconAnchor:[13,13]});
                L.marker([c.lat, c.lng], {icon: ic}).addTo(map).bindPopup(\`<b>\${c.nome}</b>\`);
              });
              if (clientes.length) {
                const fg = L.featureGroup(clientes.map(c => L.marker([c.lat, c.lng])));
                map.fitBounds(fg.getBounds().pad(0.15));
              }
            }
          ` }} />
        </Card>
      )}

      {/* Dialog: Adicionar clientes */}
      <Dialog open={openAddClientes} onOpenChange={setOpenAddClientes}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar clientes — {rota.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{selecionados.length} selecionado(s)</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelecionados(todosClientes.map(c => c.id))}>Todos</Button>
                <Button size="sm" variant="outline" onClick={() => setSelecionados([])}>Limpar</Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou cidade..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-9" />
            </div>
            <div className="flex-1 overflow-y-auto border rounded-md divide-y">
              {clientesFiltrados.map(c => (
                <div key={c.id}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 ${jaVinculados.has(c.id) ? "opacity-50" : ""}`}
                  onClick={() => {
                    if (jaVinculados.has(c.id)) return;
                    setSelecionados(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]);
                  }}>
                  <Checkbox checked={selecionados.includes(c.id) || jaVinculados.has(c.id)} readOnly />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.nome_fantasia || c.razao_social}</p>
                    <p className="text-xs text-muted-foreground">{c.cidade}</p>
                  </div>
                  {jaVinculados.has(c.id) && <Badge variant="secondary" className="text-xs flex-shrink-0">Já na rota</Badge>}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setOpenAddClientes(false); setSelecionados([]); }}>Cancelar</Button>
            <Button onClick={() => adicionarClientes.mutate()} disabled={adicionarClientes.isPending || selecionados.length === 0}>
              {adicionarClientes.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar {selecionados.length > 0 ? selecionados.length : ""} clientes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Baixa do MTR */}
      {/* Dialog: Assinatura Digital */}
      <Dialog open={!!openAssinatura} onOpenChange={(o) => !o && setOpenAssinatura(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              Assinatura Digital — MTR {openAssinatura?.mtr?.numero}
            </DialogTitle>
          </DialogHeader>
          {openAssinatura && (
            <div className="space-y-4">
              {openAssinatura.etapa === "gerador" ? (
                <>
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <p className="font-medium">{openAssinatura.cliente.nome_fantasia || openAssinatura.cliente.razao_social}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Gerador — assine como responsável pelo resíduo</p>
                  </div>
                  <AssinaturaPad
                    titulo="Assinatura do Gerador"
                    onCancel={() => setOpenAssinatura(null)}
                    onSave={(dataUrl) => {
                      salvarAssinatura.mutate({ mtrId: openAssinatura.mtr.id, campo: "assinatura_gerador", dataUrl });
                      setOpenAssinatura(prev => prev ? { ...prev, etapa: "transportador" } : null);
                    }}
                  />
                </>
              ) : (
                <>
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <p className="font-medium">BIO LOGUS AMBIENTAL LTDA - ME</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Transportador — assine como responsável pela coleta</p>
                  </div>
                  <AssinaturaPad
                    titulo="Assinatura do Transportador"
                    onCancel={() => setOpenAssinatura(null)}
                    onSave={(dataUrl) => {
                      salvarAssinatura.mutate({ mtrId: openAssinatura.mtr.id, campo: "assinatura_transportador", dataUrl });
                      setOpenAssinatura(null);
                      toast.success("MTR assinado com sucesso!");
                    }}
                  />
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: MTRs em lote */}
      <Dialog open={openMTRLote} onOpenChange={setOpenMTRLote}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Gerar {rotaClientes.length} MTRs em lote
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Será gerado 1 MTR para cada cliente da rota com a data <strong>{new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR")}</strong>.
            </p>
            <div className="space-y-1.5">
              <Label>Descrição do resíduo</Label>
              <Input value={descResiduo} onChange={e => setDescResiduo(e.target.value)} />
            </div>
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <p className="font-medium">Numeração automática:</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                MTR-{dataSelecionada.replace(/-/g, "")}-001 até -{String(rotaClientes.length).padStart(3, "0")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenMTRLote(false)}>Cancelar</Button>
            <Button onClick={() => criarMTRsLote.mutate()} disabled={criarMTRsLote.isPending}>
              {criarMTRsLote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Gerar MTRs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Componente principal ----
function AgendamentoPage() {
  const { user } = Route.useRouteContext();
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toISOString().slice(0, 10));
  const [rotaAtiva, setRotaAtiva] = useState<typeof ROTAS[0] | null>(null);

  const semanas = [...new Set(ROTAS.map(r => r.semana))];

  if (rotaAtiva) {
    return (
      <RotaDetalhe
        rota={rotaAtiva}
        dataSelecionada={dataSelecionada}
        onVoltar={() => setRotaAtiva(null)}
        user={user}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Agendamento de Rotas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Selecione a rota para visualizar clientes, gerar MTRs e registrar coletas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Data:</Label>
          <Input type="date" value={dataSelecionada} onChange={e => setDataSelecionada(e.target.value)} className="w-40" />
        </div>
      </div>

      {semanas.map(sem => (
        <div key={sem}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEMANA_COLOR[sem] ?? "bg-gray-100 text-gray-800"}`}>{sem}</span>
            <span className="text-sm text-muted-foreground">Semana {sem}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROTAS.filter(r => r.semana === sem).map(rota => (
              <Card
                key={rota.id}
                onClick={() => setRotaAtiva(rota)}
                className="p-4 cursor-pointer transition-all border-2 border-border hover:border-primary hover:shadow-md group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{rota.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rota.dias}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

