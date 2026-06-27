import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardCheck, Scale, CheckCircle2, Loader2,
  Send, DollarSign, FileCheck, Plus, Eye, Eraser, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/boletim")({
  component: BoletimPage,
});

type Boletim = {
  id: string;
  mtr_id: string;
  cliente_id: string;
  data_coleta: string;
  peso_coletado: number;
  unidade: string;
  nome_responsavel: string | null;
  assinatura_cliente: string | null;
  observacoes: string | null;
  status: string;
  cdf_id: string | null;
  numero: string | null;
  pagamento_confirmado: boolean;
  cdf_enviado: boolean;
  data_envio_cdf: string | null;
  data_pagamento: string | null;
  mtrs?: { numero: string; descricao_residuo: string; data_emissao?: string; data_baixa?: string } | null;
  clientes?: {
    razao_social: string;
    nome_fantasia: string | null;
    logradouro: string | null;
    cidade: string | null;
    cnpj: string | null;
    email?: string | null;
  } | null;
};

type MTR = {
  id: string; numero: string; descricao_residuo: string;
  cliente_id: string; quantidade: number; unidade: string;
  clientes?: { razao_social: string; nome_fantasia: string | null } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendente:    { label: "Pendente",        color: "bg-gray-100 text-gray-700" },
  coletado:    { label: "Coletado",        color: "bg-blue-100 text-blue-800" },
  pago:        { label: "Pago",            color: "bg-green-100 text-green-800" },
  cdf_emitido: { label: "CDF Emitido",     color: "bg-teal-100 text-teal-800" },
  cdf_enviado: { label: "CDF Enviado ✓",   color: "bg-emerald-100 text-emerald-800" },
};

// ─────────────────────────────────────────────
// Gerar HTML do CDF sofisticado
// ─────────────────────────────────────────────
function gerarHTMLCDF(params: {
  numeroCDF: string;
  numeroMTR: string;
  dataEmissao: string;
  periodoInicio: string;
  periodoFim: string;
  peso: number;
  unidade: string;
  cliente: {
    razao_social: string;
    nome_fantasia?: string | null;
    logradouro?: string | null;
    cidade?: string | null;
    cnpj?: string | null;
  };
}) {
  const { numeroCDF, numeroMTR, dataEmissao, periodoInicio, periodoFim, peso, unidade, cliente } = params;

  const fmt = (d: string) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";
  const urlVerificacao = `https://biologus-siger.vercel.app/verificar-cdf/${numeroCDF}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>CDF ${numeroCDF}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;background:#f4f4f4;padding:20px;color:#111}
    .cdf-wrap{background:#fff;border:0.5px solid #d1e8d8;border-radius:14px;overflow:hidden;max-width:720px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .cdf-header{background:#0a2e1a;position:relative;overflow:hidden}
    .header-inner{position:relative;z-index:2;padding:24px 32px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
    .cert-num-block{text-align:right;flex-shrink:0}
    .cert-num-label{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#6bbf85;margin-bottom:2px}
    .cert-num-val{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:#fff;letter-spacing:2px}
    .title-band{background:#155c2b;padding:13px 32px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1e7a3a}
    .cert-title{font-family:'Playfair Display',serif;font-size:19px;color:#fff}
    .period-badge{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:5px 14px;font-size:11px;color:#c8ecd4}
    .mtr-band{background:#f0faf3;border-bottom:0.5px solid #c8e6d0;padding:10px 32px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .mtr-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#6b7280;font-weight:600}
    .mtr-val{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#0a2e1a;letter-spacing:1px}
    .mtr-sep{width:1px;height:18px;background:#c8e6d0}
    .body{padding:22px 32px 24px}
    .declaracao{font-size:12px;color:#4a5568;line-height:1.75;border-left:3px solid #1a6b35;padding:10px 16px;background:#f7fdf9;border-radius:0 8px 8px 0;margin-bottom:22px;font-style:italic}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
    .info-card{border:0.5px solid #c8e6d0;border-radius:10px;padding:14px 16px;background:#f7fdf9}
    .card-label{font-size:8.5px;letter-spacing:2.5px;text-transform:uppercase;color:#1a6b35;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px}
    .card-label::after{content:'';flex:1;height:0.5px;background:#b8ddc4}
    .irow{margin-bottom:7px}.irow:last-child{margin-bottom:0}
    .irow .lbl{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:1px}
    .irow .val{font-size:12px;font-weight:500;color:#111827;line-height:1.3}
    .section-divider{font-size:8.5px;letter-spacing:2.5px;text-transform:uppercase;color:#1a6b35;font-weight:600;display:flex;align-items:center;gap:12px;margin:20px 0 12px}
    .section-divider::before,.section-divider::after{content:'';flex:1;height:0.5px;background:#c8e6d0}
    table.rtable{width:100%;border-collapse:separate;border-spacing:0;font-size:11.5px;border:0.5px solid #c8e6d0;border-radius:10px;overflow:hidden}
    table.rtable th{background:#0a2e1a;color:#7dcf9a;padding:10px 13px;text-align:left;font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500}
    table.rtable td{padding:13px 13px;border-bottom:0.5px solid #e8f4ec;color:#1f2937;vertical-align:middle}
    table.rtable tr:last-child td{border-bottom:none}
    .grupo-tag{display:inline-block;background:#0a2e1a;color:#6bbf85;font-size:10px;padding:4px 11px;border-radius:20px;font-weight:600;letter-spacing:.5px}
    .mtr-tag{display:inline-block;background:#f0faf3;border:0.5px solid #b8ddc4;color:#155c2b;font-size:10px;padding:3px 9px;border-radius:20px;font-weight:600;margin-top:5px;letter-spacing:.5px}
    .qty-big{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1a6b35;line-height:1}
    .qty-kg{font-size:10px;color:#6b7280}
    .footer-sec{margin-top:22px;padding-top:18px;border-top:0.5px solid #c8e6d0;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end}
    .sig-box{border-bottom:1.5px solid #155c2b;height:52px;margin-bottom:6px;display:flex;align-items:center;justify-content:center}
    .sig-lbl{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af}
    .sig-name{font-size:12px;font-weight:600;color:#111827;margin-top:1px}
    .sig-cnpj{font-size:10px;color:#6b7280}
    .qr-block{display:flex;flex-direction:column;align-items:center;gap:6px}
    #qrcode-el{width:72px;height:72px;background:#f0faf3;border:1px solid #b8ddc4;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:4px}
    #qrcode-el canvas,#qrcode-el img{width:64px!important;height:64px!important;display:block}
    .qr-lbl{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;text-align:center}
    .qr-url{font-size:8px;color:#6b7280;text-align:center;max-width:80px;word-break:break-all;margin-top:2px}
    .auth-strip{margin-top:14px;background:#f0faf3;border:0.5px solid #b8ddc4;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px}
    .auth-dot{width:7px;height:7px;border-radius:50%;background:#1a6b35;flex-shrink:0}
    .auth-txt{font-size:10.5px;color:#374151}
    .pg{font-size:10px;color:#9ca3af;text-align:right;margin-top:8px}
    .no-print{display:flex;gap:10px;justify-content:center;margin-top:20px}
    @media print{.no-print{display:none!important}body{background:#fff;padding:0}.cdf-wrap{box-shadow:none;border:none;border-radius:0}@page{margin:1cm;size:A4}}
  </style>
</head>
<body>
<div class="cdf-wrap">
  <div class="cdf-header">
    <div class="header-inner">
      <svg width="230" height="64" viewBox="0 0 230 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" fill="#b8d8f0" opacity="0.9"/>
        <ellipse cx="30" cy="30" rx="8" ry="12" fill="#2eaa4e" opacity="0.85"/>
        <ellipse cx="38" cy="26" rx="5" ry="7" fill="#2eaa4e" opacity="0.7"/>
        <circle cx="32" cy="32" r="26" fill="none" stroke="#2eaa4e" stroke-width="2.5" stroke-dasharray="50 14"/>
        <path d="M14 10 C10 4, 22 2, 24 8 C26 12, 18 16, 14 10Z" fill="#2eaa4e"/>
        <path d="M50 54 C54 60, 42 62, 40 56 C38 52, 46 48, 50 54Z" fill="#2eaa4e"/>
        <text x="68" y="26" font-family="Arial Black, sans-serif" font-size="19" font-weight="900" fill="#2eaa4e" letter-spacing="1">BIO LOGUS</text>
        <text x="68" y="46" font-family="Arial Black, sans-serif" font-size="19" font-weight="900" fill="#f5832a" letter-spacing="1">AMBIENTAL</text>
        <text x="69" y="59" font-family="Arial, sans-serif" font-size="10" fill="#2eaa4e" letter-spacing="0.3">Gerenciamento de Resíduos</text>
      </svg>
      <div class="cert-num-block">
        <div class="cert-num-label">Certificado Nº</div>
        <div class="cert-num-val">${numeroCDF}</div>
      </div>
    </div>
    <div class="title-band">
      <div class="cert-title">Certificado de Destinação Final</div>
      <div class="period-badge">${fmt(periodoInicio)} — ${fmt(periodoFim)}</div>
    </div>
  </div>

  <div class="mtr-band">
    <span class="mtr-label">MTR vinculado</span>
    <div class="mtr-sep"></div>
    <span class="mtr-val">${numeroMTR}</span>
    <div class="mtr-sep"></div>
    <span class="mtr-label">Data de emissão</span>
    <div class="mtr-sep"></div>
    <span class="mtr-val" style="font-size:13px;color:#374151;font-family:'Inter',sans-serif;font-weight:500;">${fmt(dataEmissao)}</span>
  </div>

  <div class="body">
    <p class="declaracao">
      Certificamos ter coletado, transportado os resíduos aqui discriminados para tratamento e disposição final,
      em conformidade com as normas aplicáveis da legislação ambiental, do gerador abaixo identificado.
    </p>

    <div class="two-col">
      <div class="info-card">
        <div class="card-label">Certificador</div>
        <div class="irow"><span class="lbl">Razão Social</span><span class="val">BIO LOGUS AMBIENTAL LTDA</span></div>
        <div class="irow"><span class="lbl">CNPJ</span><span class="val">26.484.921/0001-60</span></div>
        <div class="irow"><span class="lbl">Endereço</span><span class="val">R. Ipora, 258 – Qd. 18 Lt. 12, N. Sra. de Fátima, Goiânia-GO, 74420-290</span></div>
      </div>
      <div class="info-card">
        <div class="card-label">Geradora</div>
        <div class="irow"><span class="lbl">Razão Social</span><span class="val">${cliente.razao_social}</span></div>
        <div class="irow"><span class="lbl">CNPJ</span><span class="val">${cliente.cnpj || "—"}</span></div>
        <div class="irow"><span class="lbl">Endereço</span><span class="val">${cliente.logradouro || "—"}${cliente.cidade ? `, ${cliente.cidade}` : ""}</span></div>
      </div>
    </div>

    <div class="section-divider">Resíduos coletados</div>

    <table class="rtable">
      <thead>
        <tr>
          <th>Transportadora</th>
          <th>Receptor Final</th>
          <th>Resíduo</th>
          <th style="text-align:center">Qtd.</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-weight:600;font-size:11.5px;margin-bottom:2px;">BIO LOGUS AMBIENTAL EIRELI</div>
            <div style="font-size:10px;color:#6b7280;">CNPJ: 26.484.921/0001-60</div>
          </td>
          <td>
            <div style="font-weight:600;font-size:11.5px;margin-bottom:2px;">B-GREEN GESTÃO AMBIENTAL S.A.</div>
            <div style="font-size:10px;color:#6b7280;">CNPJ: 01.568.077/0006-30</div>
          </td>
          <td>
            <span class="grupo-tag">GRUPO A, B, E</span>
            <div><span class="mtr-tag">${numeroMTR}</span></div>
          </td>
          <td style="text-align:center">
            <div class="qty-big">${String(peso).replace(".", ",")}</div>
            <div class="qty-kg">${unidade}</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="footer-sec">
      <div>
        <div class="sig-box">
          <svg width="130" height="42" viewBox="0 0 130 42">
            <path d="M8 32 C18 12, 28 38, 44 22 C56 10, 68 34, 85 24 C96 17, 108 30, 122 26"
                  fill="none" stroke="#155c2b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="sig-lbl">Assinatura do certificador</div>
        <div class="sig-name">BIO LOGUS AMBIENTAL LTDA</div>
        <div class="sig-cnpj">CNPJ: 26.484.921/0001-60</div>
      </div>
      <div class="qr-block">
        <div id="qrcode-el"></div>
        <div class="qr-lbl">Verificar<br>autenticidade</div>
        <div class="qr-url">biologus-siger.vercel.app/verificar-cdf/${numeroCDF}</div>
      </div>
    </div>

    <div class="auth-strip">
      <div class="auth-dot"></div>
      <div class="auth-txt">Escaneie o QR Code para verificar a autenticidade deste certificado.</div>
    </div>

    <div class="pg">PÁG. 1</div>
  </div>
</div>

<div class="no-print">
  <button onclick="window.print()" style="background:#0a2e1a;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Inter,sans-serif">
    🖨️ Imprimir / Salvar PDF
  </button>
  <button onclick="window.close()" style="background:#f0faf3;color:#155c2b;border:1px solid #b8ddc4;padding:10px 24px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Inter,sans-serif">
    Fechar
  </button>
</div>

<script>
  new QRCode(document.getElementById("qrcode-el"), {
    text: "${urlVerificacao}",
    width: 64, height: 64,
    colorDark: "#0a2e1a",
    colorLight: "#f0faf3",
    correctLevel: QRCode.CorrectLevel.M
  });
</script>
</body>
</html>`;
}

function abrirCDFBlob(params: Parameters<typeof gerarHTMLCDF>[0]): string {
  const html = gerarHTMLCDF(params);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  return URL.createObjectURL(blob);
}

// ─────────────────────────────────────────────
// Canvas de assinatura
// ─────────────────────────────────────────────
function AssinaturaCanvas({ onChange }: { onChange: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0D9488";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = false;
    const canvas = canvasRef.current; if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const limpar = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Assinatura do responsável</Label>
        <Button type="button" variant="ghost" size="sm" onClick={limpar} className="h-7 text-xs gap-1">
          <Eraser className="h-3 w-3" /> Limpar
        </Button>
      </div>
      <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20 touch-none">
        <canvas ref={canvasRef} width={600} height={160} className="w-full h-32 cursor-crosshair"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      </div>
      <p className="text-xs text-muted-foreground">Assine acima com o dedo ou mouse</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
function BoletimPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();

  const [openNovo, setOpenNovo] = useState(false);
  const [openVer, setOpenVer] = useState<Boletim | null>(null);
  const [openCDF, setOpenCDF] = useState<{ blobUrl: string; numeroCDF: string } | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dataFiltro, setDataFiltro] = useState(() => new Date().toISOString().slice(0, 10));

  const [mtrSelecionado, setMtrSelecionado] = useState<MTR | null>(null);
  const [peso, setPeso] = useState("");
  const [nomeResp, setNomeResp] = useState("");
  const [obs, setObs] = useState("");
  const [assinatura, setAssinatura] = useState("");

  const { data: mtrsAbertos = [] } = useQuery({
    queryKey: ["mtrs-abertos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mtrs")
        .select("id, numero, descricao_residuo, cliente_id, quantidade, unidade, clientes(razao_social, nome_fantasia)")
        .in("status", ["emitido", "em_transporte"])
        .order("data_emissao", { ascending: false });
      return (data ?? []) as MTR[];
    },
  });

  const { data: boletins = [], isLoading } = useQuery({
    queryKey: ["boletins", dataFiltro],
    queryFn: async () => {
      const { data } = await supabase
        .from("boletins_medicao")
        .select("*, mtrs(numero, descricao_residuo, data_emissao, data_baixa), clientes(razao_social, nome_fantasia, logradouro, cidade, cnpj)")
        .eq("data_coleta", dataFiltro)
        .order("created_at", { ascending: false });
      return (data ?? []) as Boletim[];
    },
  });

  const boletinsFiltrados = filtroStatus === "todos" ? boletins : boletins.filter((b) => b.status === filtroStatus);

  // ── Abrir CDF a partir de um boletim ──
  const handleAbrirCDF = (b: Boletim) => {
    // Gera número temporário se não tiver — baseado na data + mtr
    const numeroCDF = b.numero || b.cdf_id ||
      `CDF-${b.data_coleta?.replace(/-/g, "") || new Date().toISOString().slice(0,10).replace(/-/g,"")}-${b.mtrs?.numero?.replace(/[^0-9]/g,"").slice(-4) || "0001"}`;
    const hoje = new Date().toISOString().split("T")[0];
    const cliente = {
      razao_social: b.clientes?.razao_social || "—",
      nome_fantasia: b.clientes?.nome_fantasia,
      logradouro: b.clientes?.logradouro,
      cidade: b.clientes?.cidade,
      cnpj: b.clientes?.cnpj,
    };
    const blobUrl = abrirCDFBlob({
      numeroCDF,
      numeroMTR: b.mtrs?.numero || "—",
      dataEmissao: b.data_coleta || hoje,
      periodoInicio: b.mtrs?.data_emissao || b.data_coleta || hoje,
      periodoFim: b.mtrs?.data_baixa || b.data_coleta || hoje,
      peso: b.peso_coletado,
      unidade: b.unidade || "kg",
      cliente,
    });
    setOpenCDF({ blobUrl, numeroCDF });
  };

  const criarBoletim = useMutation({
    mutationFn: async () => {
      if (!mtrSelecionado || !peso) throw new Error("Preencha o peso");
      const numeroCdf = `CDF-${dataFiltro.replace(/-/g, "")}-${mtrSelecionado.numero.replace(/[^0-9]/g, "").slice(-4)}`;

      const { error: bolError } = await supabase.from("boletins_medicao").insert([{
        owner_id: user.id,
        mtr_id: mtrSelecionado.id,
        cliente_id: mtrSelecionado.cliente_id,
        data_coleta: dataFiltro,
        peso_coletado: Number(peso),
        unidade: mtrSelecionado.unidade || "kg",
        nome_responsavel: nomeResp || null,
        assinatura_cliente: assinatura || null,
        observacoes: obs || null,
        status: "cdf_emitido",
        cdf_id: numeroCdf,
        numero: numeroCdf,
        pagamento_confirmado: false,
        cdf_enviado: false,
      }] as never[]);
      if (bolError) throw bolError;

      await supabase.from("mtrs").update({ status: "destinado", quantidade: Number(peso) }).eq("id", mtrSelecionado.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boletins"] });
      qc.invalidateQueries({ queryKey: ["mtrs-abertos"] });
      toast.success("Coleta registrada — CDF gerado!");
      setOpenNovo(false);
      setMtrSelecionado(null);
      setPeso(""); setNomeResp(""); setObs(""); setAssinatura("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const confirmarPagamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("boletins_medicao").update({
        pagamento_confirmado: true,
        status: "pago",
        data_pagamento: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boletins"] });
      toast.success("Pagamento confirmado — CDF liberado para envio");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enviarCdf = useMutation({
    mutationFn: async (boletim: Boletim) => {
      const { error } = await supabase.from("boletins_medicao").update({
        cdf_enviado: true,
        status: "cdf_enviado",
        data_envio_cdf: new Date().toISOString(),
      }).eq("id", boletim.id);
      if (error) throw error;
      const cliente = boletim.clientes?.nome_fantasia || boletim.clientes?.razao_social || "";
      const numeroCDF = boletim.numero || boletim.cdf_id || "";
      const msg = encodeURIComponent(
        `Olá! Segue o Certificado de Destinação Final (CDF ${numeroCDF}) referente à coleta de resíduos realizada em ${new Date(boletim.data_coleta + "T12:00:00").toLocaleDateString("pt-BR")}.\n\nPeso coletado: ${boletim.peso_coletado} ${boletim.unidade}\nGerador: ${cliente}\n\nQualquer dúvida, estamos à disposição.\n\nBiologus Ambiental`
      );
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boletins"] });
      toast.success("CDF marcado como enviado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const kpis = {
    total: boletins.length,
    coletados: boletins.filter((b) => b.status === "cdf_emitido").length,
    aguardandoPagamento: boletins.filter((b) => !b.pagamento_confirmado && b.status !== "cdf_enviado").length,
    enviados: boletins.filter((b) => b.cdf_enviado).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" /> Boletim de Medição
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre o peso coletado e a assinatura do cliente. O CDF é gerado automaticamente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="w-40" />
          <Button onClick={() => setOpenNovo(true)} disabled={mtrsAbertos.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Nova coleta
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total do dia", val: kpis.total, icon: ClipboardCheck, color: "text-primary" },
          { label: "CDF gerado", val: kpis.coletados, icon: FileCheck, color: "text-teal-600" },
          { label: "Aguard. pagamento", val: kpis.aguardandoPagamento, icon: DollarSign, color: "text-amber-600" },
          { label: "CDF enviado", val: kpis.enviados, icon: Send, color: "text-emerald-600" },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{k.val}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
              </div>
              <k.icon className={`h-6 w-6 ${k.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Fluxo visual */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground"><Scale className="h-3.5 w-3.5 text-blue-500" /> Peso + Assinatura</span>
          <span>→</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><FileCheck className="h-3.5 w-3.5 text-teal-500" /> CDF gerado auto</span>
          <span>→</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><DollarSign className="h-3.5 w-3.5 text-amber-500" /> Confirmar pagamento</span>
          <span>→</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><Send className="h-3.5 w-3.5 text-emerald-500" /> Enviar CDF ao cliente</span>
        </div>
      </Card>

      {/* Filtro status */}
      <div className="flex gap-2 flex-wrap">
        {["todos", "cdf_emitido", "pago", "cdf_enviado"].map((s) => (
          <button key={s} onClick={() => setFiltroStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filtroStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
            }`}>
            {s === "todos" ? `Todos (${boletins.length})` : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        {isLoading ? (
          <div className="py-16 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : boletinsFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <Scale className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum boletim para esta data.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>MTR</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boletinsFiltrados.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-sm">
                    {b.clientes?.nome_fantasia || b.clientes?.razao_social || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.mtrs?.numero ?? "—"}</TableCell>
                  <TableCell className="text-sm font-semibold">{b.peso_coletado} {b.unidade}</TableCell>
                  <TableCell>
                    {b.assinatura_cliente
                      ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Assinado</span>
                      : <span className="text-xs text-muted-foreground">Sem assinatura</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[b.status]?.color ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_CONFIG[b.status]?.label ?? b.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenVer(b)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!b.pagamento_confirmado && (
                        <Button size="sm" variant="outline"
                          className="h-8 text-xs gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                          onClick={() => confirmarPagamento.mutate(b.id)}
                          disabled={confirmarPagamento.isPending}>
                          <DollarSign className="h-3.5 w-3.5" /> Confirmar pgto
                        </Button>
                      )}
                      {/* Botão Visualizar CDF — sempre visível */}
                      <Button size="sm" variant="outline"
                        className="h-8 text-xs gap-1 text-teal-700 border-teal-300 hover:bg-teal-50"
                        onClick={() => handleAbrirCDF(b)}>
                        <FileCheck className="h-3.5 w-3.5" /> Ver CDF
                      </Button>
                      {b.pagamento_confirmado && !b.cdf_enviado && (
                        <Button size="sm" className="h-8 text-xs gap-1"
                          onClick={() => enviarCdf.mutate(b)} disabled={enviarCdf.isPending}>
                          <Send className="h-3.5 w-3.5" /> Enviar CDF
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog: Nova Coleta */}
      <Dialog open={openNovo} onOpenChange={setOpenNovo}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> Registrar Coleta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <Label>MTR *</Label>
              <Select onValueChange={(v) => setMtrSelecionado(mtrsAbertos.find((m) => m.id === v) ?? null)}>
                <SelectTrigger><SelectValue placeholder="Selecione o MTR" /></SelectTrigger>
                <SelectContent>
                  {mtrsAbertos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.numero} — {m.clientes?.nome_fantasia || m.clientes?.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mtrSelecionado && (
                <div className="bg-muted/50 rounded-md p-3 text-xs space-y-1">
                  <p><span className="text-muted-foreground">Resíduo:</span> {mtrSelecionado.descricao_residuo}</p>
                  <p><span className="text-muted-foreground">Cliente:</span> {mtrSelecionado.clientes?.nome_fantasia || mtrSelecionado.clientes?.razao_social}</p>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Peso coletado (kg) *</Label>
              <div className="flex gap-2 items-center">
                <Input type="number" step="0.001" min="0" placeholder="0.000" value={peso}
                  onChange={(e) => setPeso(e.target.value)} className="text-lg font-semibold" />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nome do responsável (opcional)</Label>
              <Input placeholder="Quem assinou no cliente" value={nomeResp} onChange={(e) => setNomeResp(e.target.value)} />
            </div>
            <AssinaturaCanvas onChange={setAssinatura} />
            <div className="space-y-1.5">
              <Label>Observações (opcional)</Label>
              <Input placeholder="Ex: embalagem danificada..." value={obs} onChange={(e) => setObs(e.target.value)} />
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-md p-3 text-xs text-teal-800 flex items-start gap-2">
              <FileCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">CDF gerado automaticamente</p>
                <p className="mt-0.5 opacity-80">O certificado fica disponível para visualização imediatamente após o registro.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenNovo(false)}>Cancelar</Button>
            <Button onClick={() => criarBoletim.mutate()} disabled={criarBoletim.isPending || !mtrSelecionado || !peso}>
              {criarBoletim.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Scale className="h-4 w-4 mr-2" /> Registrar coleta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver boletim */}
      {openVer && (
        <Dialog open={!!openVer} onOpenChange={() => setOpenVer(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Boletim de Medição</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium">{openVer.clientes?.nome_fantasia || openVer.clientes?.razao_social}</p></div>
                <div><p className="text-xs text-muted-foreground">MTR</p><p className="font-medium">{openVer.mtrs?.numero}</p></div>
                <div><p className="text-xs text-muted-foreground">Data</p><p className="font-medium">{new Date(openVer.data_coleta + "T12:00:00").toLocaleDateString("pt-BR")}</p></div>
                <div><p className="text-xs text-muted-foreground">Peso</p><p className="font-bold text-primary">{openVer.peso_coletado} {openVer.unidade}</p></div>
                <div><p className="text-xs text-muted-foreground">Responsável</p><p className="font-medium">{openVer.nome_responsavel || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[openVer.status]?.color}`}>
                    {STATUS_CONFIG[openVer.status]?.label}
                  </span>
                </div>
              </div>
              {openVer.assinatura_cliente && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assinatura do cliente</p>
                  <div className="border rounded-md p-2 bg-white">
                    <img src={openVer.assinatura_cliente} alt="Assinatura" className="max-h-24 w-full object-contain" />
                  </div>
                </div>
              )}
              {openVer.observacoes && (
                <div><p className="text-xs text-muted-foreground">Observações</p><p className="text-sm">{openVer.observacoes}</p></div>
              )}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status do pagamento</p>
                {openVer.pagamento_confirmado
                  ? <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Pagamento confirmado</p>
                  : <p className="text-sm text-amber-600 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Aguardando pagamento</p>}
                {openVer.cdf_enviado
                  ? <p className="text-sm text-emerald-600 flex items-center gap-1"><Send className="h-4 w-4" /> CDF enviado em {openVer.data_envio_cdf ? new Date(openVer.data_envio_cdf).toLocaleDateString("pt-BR") : "—"}</p>
                  : <p className="text-sm text-muted-foreground flex items-center gap-1"><RefreshCw className="h-4 w-4" /> CDF ainda não enviado</p>}
              </div>
            </div>
            <DialogFooter>
              {!openVer.pagamento_confirmado && (
                <Button variant="outline" className="text-amber-700 border-amber-300"
                  onClick={() => { confirmarPagamento.mutate(openVer.id); setOpenVer(null); }}>
                  <DollarSign className="h-4 w-4 mr-1" /> Confirmar pagamento
                </Button>
              )}
              {(openVer.cdf_id || openVer.numero || openVer.mtrs?.numero) && (
                <Button variant="outline" onClick={() => { handleAbrirCDF(openVer); setOpenVer(null); }}>
                  <Eye className="h-4 w-4 mr-1" /> Visualizar CDF
                </Button>
              )}
              {openVer.pagamento_confirmado && !openVer.cdf_enviado && (
                <Button onClick={() => { enviarCdf.mutate(openVer); setOpenVer(null); }}>
                  <Send className="h-4 w-4 mr-1" /> Enviar CDF
                </Button>
              )}
              <Button variant="ghost" onClick={() => setOpenVer(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog: Visualizar CDF — modal com iframe */}
      <Dialog open={!!openCDF} onOpenChange={(o) => {
        if (!o && openCDF?.blobUrl) URL.revokeObjectURL(openCDF.blobUrl);
        if (!o) setOpenCDF(null);
      }}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              Certificado de Destinação Final — Nº {openCDF?.numeroCDF}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {openCDF && (
              <iframe
                src={openCDF.blobUrl}
                className="w-full h-full border-0"
                title={`CDF ${openCDF.numeroCDF}`}
              />
            )}
          </div>
          <div className="px-6 py-3 border-t flex-shrink-0 flex justify-between items-center bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Use o botão "Imprimir / Salvar PDF" dentro do documento para exportar
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              if (openCDF?.blobUrl) URL.revokeObjectURL(openCDF.blobUrl);
              setOpenCDF(null);
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
