// ECOTRACK-SIGER-2026
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Eye, Mail, PenTool, Trash2, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { enviarContratoEmail, gerarContratoPadraoBioLogus } from "@/lib/contrato.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/contratos")({
  component: ContratosPage,
});

// ── CSS EcoTrack injetado ─────────────────────────────────────────────────────
const ECO_CSS = `
.eco-ct-table{width:100%;border-collapse:collapse}
.eco-ct-table th{font-size:11px;font-weight:500;color:#6B7671;text-transform:uppercase;letter-spacing:.06em;padding:10px 14px;text-align:left;background:#F7F8F6;border-bottom:1px solid #E2E8E5}
.eco-ct-table td{padding:11px 14px;font-size:13px;border-bottom:1px solid #E2E8E5;color:#1A1F1D;vertical-align:middle}
.eco-ct-table tr:last-child td{border-bottom:none}
.eco-ct-table tr:hover td{background:#fafbfa}
.eco-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500}
.eco-badge-ok{background:#ECFDF5;color:#059669}
.eco-badge-pend{background:#FFFBEB;color:#D97706}
.eco-badge-draft{background:#f1f3f2;color:#6B7671}
.eco-badge-dn{background:#FFF0F0;color:#DC3545}
.eco-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.eco-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .15s;font-family:inherit}
.eco-btn-p{background:#0D6B54;color:#fff}.eco-btn-p:hover{background:#084D3C}
.eco-btn-g{background:transparent;color:#6B7671;border:1px solid #E2E8E5}.eco-btn-g:hover{background:#F7F8F6;color:#1A1F1D}
.eco-btn-danger{background:transparent;color:#DC3545;border:1px solid #DC3545}.eco-btn-danger:hover{background:#FFF0F0}
.eco-btn:disabled{opacity:.4;cursor:default}
.eco-filtros{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.eco-filtro-btn{background:transparent;color:#6B7671;border:1px solid #E2E8E5;border-radius:7px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s}
.eco-filtro-btn:hover{background:#F7F8F6}
.eco-filtro-btn.af{background:#0D6B54;color:#fff;border-color:#0D6B54}
/* modal assinatura EcoTrack */
.eco-sig-tabs{display:flex;border-bottom:1px solid #E2E8E5;margin-bottom:16px}
.eco-sig-tab{padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:#6B7671;user-select:none;transition:all .15s}
.eco-sig-tab.active{border-bottom-color:#0D6B54;color:#0D6B54}
.eco-sig-area{border:2px dashed #E2E8E5;border-radius:10px;background:#fff;position:relative;cursor:crosshair;transition:border-color .2s;overflow:hidden;height:140px}
.eco-sig-area:hover{border-color:#1D9E75}
.eco-sig-area.signed{border:2px solid #059669;background:#ECFDF5}
.eco-sig-canvas{width:100%;height:140px;display:block;touch-action:none}
.eco-sig-placeholder{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#6B7671;font-size:13px;pointer-events:none;text-align:center}
.eco-cam-box{border:2px dashed #E2E8E5;border-radius:10px;overflow:hidden;background:#111;position:relative;height:200px}
.eco-cam-box.ok{border:2px solid #059669}
.eco-cam-video{width:100%;height:200px;object-fit:cover;position:absolute;top:0;left:0}
.eco-cam-canvas{display:none}
.eco-cam-preview{width:100%;height:200px;object-fit:cover;position:absolute;top:0;left:0;display:none}
.eco-cam-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);flex-direction:column;gap:8px}
.eco-proof-strip{display:flex;gap:8px;align-items:center;background:#ECFDF5;border:1px solid rgba(5,150,105,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:#059669;margin-top:10px}
/* contrato doc */
.contrato-doc{font-family:'Georgia',serif;font-size:13px;line-height:1.8;color:#1a1a1a}
.contrato-header{background:#0D6B54;color:#fff;padding:16px 24px;display:flex;justify-content:space-between;border-radius:4px 4px 0 0;margin-bottom:0}
.contrato-header-logo{font-size:16px;font-weight:700;letter-spacing:-.3px}
.contrato-header-info{font-size:11px;text-align:right;opacity:.8;line-height:1.6}
.contrato-body{padding:24px;background:#fff}
.contrato-title{font-size:14px;font-weight:700;text-align:center;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em}
.contrato-num{text-align:center;font-size:13px;font-weight:700;margin-bottom:18px;color:#0D6B54}
.contrato-partes{margin-bottom:20px;padding:14px 16px;background:#EAF4ED;border-left:4px solid #0D6B54;border-radius:0 8px 8px 0;font-size:13px}
.clausula{margin-bottom:18px}
.clausula-titulo{font-weight:700;color:#084D3C;border-bottom:1px solid #E0F2EC;padding-bottom:4px;margin-bottom:10px;font-size:13px}
.clausula p{margin-bottom:6px}
.contrato-assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px;padding-top:20px;border-top:1px solid #ccc}
.assinatura-box{text-align:center}
.assinatura-linha{border-top:1.5px solid #333;margin-bottom:8px;margin-top:60px}
.assinatura-nome{font-weight:600;font-size:13px}
.assinatura-cargo{font-size:12px;color:#6B7671}
.eco-viewer-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(10,18,15,.72);display:flex;align-items:stretch;justify-content:center;padding:18px}
.eco-viewer-shell{width:min(1120px,100%);height:calc(100vh - 36px);background:#fff;border:1px solid #DDE7E1;border-radius:10px;box-shadow:0 24px 80px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
.eco-viewer-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #E2E8E5;background:#fff;flex-wrap:wrap}
.eco-viewer-title{min-width:0;font-size:14px;font-weight:600;color:#1A1F1D;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eco-viewer-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.eco-viewer-document{flex:1;overflow:auto;background:#F7F8F6;padding:24px}
.eco-viewer-paper{width:min(880px,100%);min-height:calc(100% - 48px);margin:0 auto;background:#fff;border:1px solid #E2E8E5;box-shadow:0 4px 18px rgba(0,0,0,.08);padding:38px;color:#1a1a1a}
.eco-viewer-footer{padding:10px 16px;border-top:1px solid #E2E8E5;background:#fff;display:flex;justify-content:flex-end}
@media (max-width:640px){.eco-viewer-backdrop{padding:0}.eco-viewer-shell{height:100vh;border-radius:0;border:0}.eco-viewer-document{padding:12px}.eco-viewer-paper{padding:18px;font-size:12px}.eco-viewer-title{white-space:normal}}
@media print{body *{visibility:hidden!important}.eco-viewer-backdrop,.eco-viewer-backdrop *{visibility:visible!important}.eco-viewer-backdrop{position:absolute!important;inset:0!important;background:#fff!important;padding:0!important}.eco-viewer-shell{height:auto!important;width:100%!important;border:0!important;box-shadow:none!important;border-radius:0!important;overflow:visible!important}.eco-viewer-toolbar,.eco-viewer-footer{display:none!important}.eco-viewer-document{overflow:visible!important;background:#fff!important;padding:0!important}.eco-viewer-paper{width:100%!important;max-width:none!important;min-height:0!important;margin:0!important;border:0!important;box-shadow:none!important;padding:0!important}}
`;

function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("eco-ct-styles")) return;
  const s = document.createElement("style");
  s.id = "eco-ct-styles";
  s.textContent = ECO_CSS;
  document.head.appendChild(s);
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Cliente = {
  id: string; razao_social: string; nome_fantasia: string | null;
  cnpj: string | null; email: string | null; telefone: string | null;
  endereco: string | null; numero: string | null; bairro: string | null;
  cidade: string | null; estado: string | null; cep: string | null;
  responsavel_financeiro: string | null;
};

type Contrato = {
  id: string; cliente_id: string; numero: string;
  data_inicio: string; data_fim: string | null;
  valor_mensal: number | null; status: string;
  forma_pagamento: string | null; observacoes: string | null;
  conteudo_html: string | null;
  ultimo_email_em: string | null; ultimo_email_destino: string | null;
  clientes?: { razao_social: string } | null;
};

// ── Modal assinatura EcoTrack ─────────────────────────────────────────────────
function ModalAssinatura({
  open, contrato, cliente, onClose, onSalvo,
}: {
  open: boolean;
  contrato: Contrato | null;
  cliente: Cliente | null;
  onClose: () => void;
  onSalvo: (rubricaB64: string, fotoB64: string | null) => void;
}) {
  const [tab, setTab] = useState<"ass" | "foto">("ass");
  const [sigNome, setSigNome] = useState("");
  const [sigCpf, setSigCpf] = useState("");
  const [sigCargo, setSigCargo] = useState("");
  const [signed, setSigned] = useState(false);
  const [camFase, setCamFase] = useState<"idle" | "live" | "foto">("idle");
  const [camFotoData, setCamFotoData] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const [corSel, setCorSel] = useState("#1a1a1a");
  const [espSel, setEspSel] = useState("3");
  const videoRef = useRef<HTMLVideoElement>(null);
  const camCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open && cliente) {
      setSigNome(cliente.responsavel_financeiro || cliente.razao_social);
      setSigCpf(cliente.cnpj || "");
      setSigCargo("");
      setTab("ass");
      setSigned(false);
      setCamFase("idle");
      setCamFotoData(null);
      setTimeout(() => initCanvas(), 200);
    }
    if (!open) camParar();
  }, [open, cliente]);

  const initCanvas = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    ctxRef.current = ctx;
    ctx.strokeStyle = corSel; ctx.lineWidth = Number(espSel);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    const pos = (e: MouseEvent | TouchEvent) => {
      const r = cv.getBoundingClientRect();
      const src = "touches" in e ? e.touches[0] : e;
      return [(src.clientX - r.left) * (cv.width / r.width), (src.clientY - r.top) * (cv.height / r.height)];
    };
    cv.onmousedown = (e) => { drawingRef.current = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); };
    cv.onmousemove = (e) => { if (!drawingRef.current) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); setSigned(true); };
    cv.onmouseup = cv.onmouseleave = () => { drawingRef.current = false; };
    cv.ontouchstart = (e) => { e.preventDefault(); drawingRef.current = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); };
    cv.ontouchmove = (e) => { e.preventDefault(); if (!drawingRef.current) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); setSigned(true); };
    cv.ontouchend = () => { drawingRef.current = false; };
  }, [corSel, espSel]);

  const sigLimpar = () => {
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (cv && ctx) ctx.clearRect(0, 0, cv.width, cv.height);
    setSigned(false);
  };

  const setCor = (v: string) => { setCorSel(v); if (ctxRef.current) ctxRef.current.strokeStyle = v; };
  const setEsp = (v: string) => { setEspSel(v); if (ctxRef.current) ctxRef.current.lineWidth = Number(v); };

  const trocarTab = (t: "ass" | "foto") => {
    setTab(t);
    if (t === "ass") setTimeout(() => initCanvas(), 100);
  };

  const camParar = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const camAtivar = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { toast.error("Câmera não disponível — use Enviar da galeria"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      const vid = videoRef.current;
      if (vid) { vid.srcObject = stream; vid.style.display = "block"; }
      setCamFase("live");
    } catch { toast.error("Câmera negada — use o botão de galeria"); }
  };

  const camCapturar = () => {
    const vid = videoRef.current; const cnv = camCanvasRef.current;
    if (!vid?.srcObject || !cnv) { toast.error("Câmera não está ativa"); return; }
    const w = vid.videoWidth || 640, h = vid.videoHeight || 480;
    cnv.width = w; cnv.height = h;
    const ctx = cnv.getContext("2d")!;
    ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.drawImage(vid, 0, 0, w, h); ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(0, h - 36, w, 36);
    ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`${sigNome || "Signatário"} | ${sigCpf || ""} | ${new Date().toLocaleString("pt-BR")}`, 10, h - 12);
    const data = cnv.toDataURL("image/jpeg", 0.88);
    setCamFotoData(data);
    const prev = previewRef.current;
    if (prev) { prev.src = data; prev.style.display = "block"; }
    if (vid) vid.style.display = "none";
    camParar(); setCamFase("foto");
    toast.success("✔ Foto capturada!");
  };

  const camRefazer = () => {
    setCamFotoData(null); setCamFase("idle");
    const prev = previewRef.current;
    if (prev) { prev.style.display = "none"; prev.src = ""; }
    camAtivar();
  };

  const camUpload = () => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
    inp.onchange = () => {
      const file = inp.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string; setCamFotoData(data);
        const prev = previewRef.current;
        if (prev) { prev.src = data; prev.style.display = "block"; }
        camParar(); setCamFase("foto");
        toast.success("✔ Foto carregada!");
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  };

  const mascCpf = (v: string) => {
    const d = v.replace(/\D/g, "").substring(0, 11);
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const confirmar = () => {
    if (!sigNome.trim()) { toast.error("Informe o nome do signatário"); return; }
    if (!sigCpf.trim()) { toast.error("Informe o CPF"); return; }
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (!cv || !ctx || !signed) { trocarTab("ass"); toast.error("Desenhe a assinatura antes de confirmar"); return; }
    const imgD = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let temTraco = false;
    for (let i = 3; i < imgD.length; i += 4) { if (imgD[i] > 10) { temTraco = true; break; } }
    if (!temTraco) { trocarTab("ass"); toast.error("Assinatura em branco — desenhe a assinatura"); return; }
    if (!camFotoData) { trocarTab("foto"); toast.error("📸 Tire a foto do signatário para concluir"); return; }
    const rubrica = cv.toDataURL("image/png");
    camParar();
    onSalvo(rubrica, camFotoData);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8E5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>✏ Assinatura digital do contratante</span>
        </div>
        <div style={{ padding: "20px" }}>
          {/* Banner contratante */}
          <div style={{ background: "#EAF4ED", borderLeft: "4px solid #0D6B54", borderRadius: "0 8px 8px 0", padding: "12px 16px", marginBottom: "18px", fontSize: "13px", color: "#084D3C" }}>
            <strong>Contratante:</strong> {cliente?.razao_social || "—"}&nbsp;|&nbsp;
            <strong>CNPJ/CPF:</strong> {cliente?.cnpj || "—"}
          </div>

          {/* Dados */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#6B7671", display: "block", marginBottom: "5px" }}>Nome do signatário *</label>
              <Input value={sigNome} onChange={(e) => setSigNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#6B7671", display: "block", marginBottom: "5px" }}>CPF *</label>
              <Input value={sigCpf} onChange={(e) => setSigCpf(mascCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: "11px", color: "#6B7671", display: "block", marginBottom: "5px" }}>Cargo / Função</label>
              <Input value={sigCargo} onChange={(e) => setSigCargo(e.target.value)} placeholder="Diretor, Responsável Técnico..." />
            </div>
          </div>

          {/* Tabs */}
          <div className="eco-sig-tabs">
            <div className={`eco-sig-tab ${tab === "ass" ? "active" : ""}`} onClick={() => trocarTab("ass")}>✏ Assinatura</div>
            <div className={`eco-sig-tab ${tab === "foto" ? "active" : ""}`} onClick={() => trocarTab("foto")}>
              📷 Foto do signatário{" "}
              {!camFotoData && <span style={{ fontSize: "10px", background: "#FFF0F0", color: "#DC3545", padding: "1px 6px", borderRadius: "4px", marginLeft: "4px" }}>obrigatória</span>}
            </div>
          </div>

          {/* Painel assinatura */}
          {tab === "ass" && (
            <div>
              <p style={{ fontSize: "12px", color: "#6B7671", marginBottom: "8px" }}>Desenhe a assinatura no campo abaixo *</p>
              <div className={`eco-sig-area ${signed ? "signed" : ""}`}>
                <canvas ref={canvasRef} className="eco-sig-canvas" width={560} height={140} />
                {!signed && <div className="eco-sig-placeholder">✏ Clique e arraste para assinar</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                <select value={corSel} onChange={(e) => setCor(e.target.value)} style={{ width: "auto", fontSize: "12px", padding: "6px 10px", borderRadius: "7px", border: "1px solid #E2E8E5", fontFamily: "inherit" }}>
                  <option value="#1a1a1a">Preta</option>
                  <option value="#0D6B54">Verde</option>
                  <option value="#003087">Azul</option>
                </select>
                <select value={espSel} onChange={(e) => setEsp(e.target.value)} style={{ width: "auto", fontSize: "12px", padding: "6px 10px", borderRadius: "7px", border: "1px solid #E2E8E5", fontFamily: "inherit" }}>
                  <option value="2">Fina</option>
                  <option value="3">Média</option>
                  <option value="5">Grossa</option>
                </select>
                <button type="button" onClick={sigLimpar} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "7px", border: "1px solid #E2E8E5", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>✕ Limpar</button>
                {signed && <span className="eco-proof-strip" style={{ padding: "4px 10px", marginTop: 0 }}>✓ Assinatura capturada</span>}
              </div>
            </div>
          )}

          {/* Painel câmera */}
          {tab === "foto" && (
            <div>
              <p style={{ fontSize: "12px", color: "#6B7671", marginBottom: "10px" }}>
                Tire uma foto do signatário <strong>segurando o documento</strong>. Fica salva internamente como prova de identidade.
              </p>
              <div className={`eco-cam-box ${camFase === "foto" ? "ok" : ""}`}>
                <video ref={videoRef} className="eco-cam-video" autoPlay playsInline muted style={{ display: camFase === "live" ? "block" : "none" }} />
                <img ref={previewRef} className="eco-cam-preview" alt="Preview" style={{ display: camFase === "foto" ? "block" : "none" }} />
                <canvas ref={camCanvasRef} className="eco-cam-canvas" />
                {camFase === "idle" && (
                  <div className="eco-cam-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "40px", height: "40px", color: "#fff", opacity: .7 }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span style={{ color: "#fff", fontSize: "12px", opacity: .9 }}>Clique em "Ativar câmera" abaixo</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                {camFase === "idle" && <button type="button" onClick={camAtivar} className="eco-btn eco-btn-p" style={{ fontSize: "12px" }}>📷 Ativar câmera</button>}
                {camFase === "live" && <button type="button" onClick={camCapturar} style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "7px", border: "none", background: "#DC3545", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>⬤ Tirar foto agora</button>}
                {camFase === "foto" && <button type="button" onClick={camRefazer} className="eco-btn eco-btn-g" style={{ fontSize: "12px" }}>↺ Tirar novamente</button>}
                <button type="button" onClick={camUpload} className="eco-btn eco-btn-g" style={{ fontSize: "12px" }}>↑ Enviar da galeria</button>
              </div>
              {camFotoData && <div className="eco-proof-strip">✓ Foto capturada — identidade do signatário registrada</div>}
            </div>
          )}
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8E5", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button type="button" onClick={onClose} className="eco-btn eco-btn-g">Cancelar</button>
          <button type="button" onClick={confirmar} className="eco-btn eco-btn-p">✓ Confirmar assinatura</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
function ContratosPage() {
  injectCSS();
  const qc = useQueryClient();

  const [novoOpen, setNovoOpen] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [selectedClienteId, setSelectedClienteId] = useState("");

  // Form novo contrato
  const [dataInicio, setDataInicio] = useState("");
  const [periodicidade, setPeriodicidade] = useState("anual");
  const [dataFim, setDataFim] = useState("");

  // Modal ver contrato
  const [verContrato, setVerContrato] = useState<Contrato | null>(null);
  

  // Modal assinatura
  const [assContrato, setAssContrato] = useState<Contrato | null>(null);

  // Modal e-mail
  const [emailContrato, setEmailContrato] = useState<Contrato | null>(null);
  const [emailDest, setEmailDest] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const enviarEmail = useServerFn(enviarContratoEmail);
  const gerarContratoPadrao = useServerFn(gerarContratoPadraoBioLogus);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select(
        "id,razao_social,nome_fantasia,cnpj,email,telefone,endereco,numero,bairro,cidade,estado,cep,responsavel_financeiro"
      ).order("razao_social");
      return (data ?? []) as Cliente[];
    },
  });

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ["contratos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contratos").select("*,clientes(razao_social)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contrato[];
    },
  });

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId) ?? null;
  const proximoNumero = `CT-BLA${String(contratos.length + 1).padStart(4, "0")}`;

  function addMonthsISO(d: string, m: number) {
    const dt = new Date(d + "T00:00:00"); dt.setMonth(dt.getMonth() + m); dt.setDate(dt.getDate() - 1);
    return dt.toISOString().slice(0, 10);
  }
  const MESES: Record<string, number> = { anual: 12, semestral: 6, trimestral: 3 };

  const onInicioChange = (v: string) => { setDataInicio(v); if (v && MESES[periodicidade]) setDataFim(addMonthsISO(v, MESES[periodicidade])); };
  const onPeriodicidadeChange = (v: string) => { setPeriodicidade(v); if (dataInicio && MESES[v]) setDataFim(addMonthsISO(dataInicio, MESES[v])); };

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      await gerarContratoPadrao({
        data: {
          ...payload,
          cliente_id: selectedClienteId,
          periodicidade_vigencia: periodicidade,
        } as never,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contratos"] }); toast.success("Contrato gerado!"); setNovoOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("contratos").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contratos"] }); toast.success("Contrato removido"); },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!selectedClienteId || !payload.numero || !payload.data_inicio) return toast.error("Preencha cliente, número e data de início");
    payload.cliente_id = selectedClienteId;
    payload.periodicidade_vigencia = periodicidade;
    if (payload.valor_mensal) payload.valor_mensal = Number(payload.valor_mensal);
    createMutation.mutate(payload);
  };

  const handleVerPDF = (c: Contrato) => {
    setVerContrato(c);
  };

  const handleAssinaturaSalva = async (rubrica: string, foto: string | null) => {
    if (!assContrato) return;
    toast.success("✔ Assinatura registrada com sucesso!");
    setAssContrato(null);
    qc.invalidateQueries({ queryKey: ["contratos"] });
  };

  const handleEnviarEmail = async () => {
    if (!emailContrato || !emailDest) return;
    setSendingEmail(true);
    try { await enviarEmail({ data: { contrato_id: emailContrato.id, email: emailDest } }); toast.success("Contrato enviado por e-mail"); setEmailContrato(null); }
    catch (e: any) { toast.error(e.message); }
    finally { setSendingEmail(false); }
  };

  // Filtros estilo EcoTrack
  const contratosFiltrados = contratos.filter((c) => {
    const razao = c.clientes?.razao_social?.toLowerCase() || "";
    const buscaOk = !busca || razao.includes(busca.toLowerCase()) || c.numero.includes(busca);
    const filtroOk = filtro === "todos" || c.status === filtro;
    return buscaOk && filtroOk;
  });

  const counts = {
    todos: contratos.length,
    ativo: contratos.filter((c) => c.status === "ativo").length,
    suspenso: contratos.filter((c) => c.status === "suspenso").length,
    encerrado: contratos.filter((c) => c.status === "encerrado").length,
  };

  const statusBadge = (s: string) => {
    if (s === "ativo") return <span className="eco-badge eco-badge-ok"><span className="eco-badge-dot" />Ativo</span>;
    if (s === "suspenso") return <span className="eco-badge eco-badge-pend"><span className="eco-badge-dot" />Suspenso</span>;
    if (s === "encerrado") return <span className="eco-badge eco-badge-draft"><span className="eco-badge-dot" />Encerrado</span>;
    return <span className="eco-badge eco-badge-draft">{s}</span>;
  };

  const receitaMensal = contratos.filter((c) => c.status === "ativo").reduce((a, c) => a + (c.valor_mensal || 0), 0);
  const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Banner teal EcoTrack */}
      <div style={{ background: "#EAF4ED", border: "1px solid rgba(13,107,84,.2)", borderRadius: "10px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D6B54" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#084D3C" }}>Modelo Bio Logus Ambiental — Coleta, Transporte e Destinação Final RSS</div>
            <div style={{ fontSize: "12px", color: "#0D6B54", marginTop: "2px" }}>Gere e envie contratos com assinatura digital para seus clientes</div>
          </div>
        </div>
        <button className="eco-btn eco-btn-p" onClick={() => { setNovoOpen(true); setSelectedClienteId(""); setDataInicio(""); setPeriodicidade("anual"); setDataFim(""); }} disabled={clientes.length === 0}>
          <Plus size={14} /> Novo contrato
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {[
          { label: "Contratos ativos", val: String(counts.ativo), sub: "com validade jurídica" },
          { label: "Receita mensal recorrente", val: fmtBRL(receitaMensal), sub: "dos contratos ativos" },
          { label: "Total cadastrado", val: String(counts.todos), sub: `${counts.suspenso} suspenso${counts.suspenso !== 1 ? "s" : ""}` },
        ].map((k, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E2E8E5", borderRadius: "10px", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#6B7671", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>{k.label}</div>
            <div style={{ fontSize: "26px", fontWeight: 600, lineHeight: 1, letterSpacing: "-.5px", color: i === 1 ? "#0D6B54" : "#1A1F1D" }}>{k.val}</div>
            <div style={{ fontSize: "12px", marginTop: "6px", color: "#6B7671" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: "#fff", border: "1px solid #E2E8E5", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #E2E8E5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Contratos</span>
        </div>
        <div style={{ padding: "14px 20px 8px" }}>
          {/* Filtros EcoTrack */}
          <div className="eco-filtros">
            {[
              { k: "todos", lbl: `✓ Todos (${counts.todos})` },
              { k: "ativo", lbl: `Ativos (${counts.ativo})` },
              { k: "suspenso", lbl: `Suspensos (${counts.suspenso})` },
              { k: "encerrado", lbl: `Encerrados (${counts.encerrado})` },
            ].map((f) => (
              <button key={f.k} className={`eco-filtro-btn ${filtro === f.k ? "af" : ""}`} onClick={() => setFiltro(f.k)}>{f.lbl}</button>
            ))}
            <div style={{ marginLeft: "auto" }}>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente..." style={{ width: "220px", border: "1px solid #E2E8E5", borderRadius: "7px", padding: "7px 12px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          {isLoading ? (
            <div style={{ padding: "48px", textAlign: "center" }}><Loader2 className="animate-spin mx-auto text-muted-foreground" size={24} /></div>
          ) : contratosFiltrados.length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center", color: "#6B7671", fontSize: "13px" }}>
              <FileSignature size={40} style={{ margin: "0 auto 12px", opacity: .3 }} />
              Nenhum contrato encontrado.
            </div>
          ) : (
            <table className="eco-ct-table">
              <thead>
                <tr><th>Número</th><th>Cliente</th><th>Tipo</th><th>Vigência</th><th>Valor mensal</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {contratosFiltrados.map((c) => {
                  const cli = clientes.find((cl) => cl.id === c.cliente_id);
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.numero}</td>
                      <td>{c.clientes?.razao_social || "—"}</td>
                      <td><span className="eco-badge" style={{ background: "#E0F2EC", color: "#0D6B54" }}>RSS</span></td>
                      <td style={{ fontSize: "12px", color: "#6B7671" }}>
                        {new Date(c.data_inicio).toLocaleDateString("pt-BR")}
                        {c.data_fim && <> → {new Date(c.data_fim).toLocaleDateString("pt-BR")}</>}
                      </td>
                      <td>{c.valor_mensal ? fmtBRL(c.valor_mensal) + "/mês" : "—"}</td>
                      <td>{statusBadge(c.status)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button title="Visualizar contrato" onClick={() => handleVerPDF(c)}
                            style={{ padding: "5px", borderRadius: "6px", border: "1px solid #E2E8E5", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Eye size={14} />
                          </button>
                          <button title="Ver HTML" onClick={() => setVerContrato(c)}
                            style={{ padding: "5px", borderRadius: "6px", border: "1px solid #E2E8E5", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <FileSignature size={14} />
                          </button>
                          <button title="Assinar digitalmente" onClick={() => setAssContrato(c)}
                            style={{ padding: "5px", borderRadius: "6px", border: "1px solid #0D6B54", background: "#EAF4ED", color: "#0D6B54", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <PenTool size={14} />
                          </button>
                          <button title="Enviar por e-mail" onClick={() => { setEmailDest(cli?.email || ""); setEmailContrato(c); }}
                            style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #E2E8E5", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                            <Mail size={14} /> E-mail
                          </button>
                          <button title="Remover" onClick={() => { if (confirm(`Remover ${c.numero}?`)) deleteMutation.mutate(c.id); }}
                            style={{ padding: "5px", borderRadius: "6px", border: "1px solid #fca5a5", background: "#fff", color: "#DC3545", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Novo contrato */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo Contrato — Padrão Bio Logus 2026</DialogTitle></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">

            {/* 1. Cliente */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                <Label>Selecionar cliente *</Label>
              </div>
              <Select name="cliente_id" required value={selectedClienteId} onValueChange={setSelectedClienteId}>
                <SelectTrigger><SelectValue placeholder="Buscar cliente cadastrado…" /></SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="font-medium">{c.razao_social}</span>
                      {c.cnpj && <span className="ml-2 text-muted-foreground text-xs">{c.cnpj}</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCliente && (
                <div style={{ background: "#EAF4ED", borderLeft: "4px solid #0D6B54", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: "12px", color: "#084D3C" }}>
                  <strong>{selectedCliente.razao_social}</strong>
                  {selectedCliente.cnpj && <> &nbsp;·&nbsp; CNPJ: {selectedCliente.cnpj}</>}
                  {selectedCliente.cidade && <> &nbsp;·&nbsp; {selectedCliente.cidade}/{selectedCliente.estado}</>}
                </div>
              )}
            </div>

            {selectedCliente && (<>
              {/* 2. Identificação */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                  <Label>Identificação do contrato</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Número *</Label>
                    <Input name="numero" required defaultValue={proximoNumero} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Vigência</Label>
                    <Select value={periodicidade} onValueChange={onPeriodicidadeChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anual">Anual — 01 (um) ano</SelectItem>
                        <SelectItem value="semestral">Semestral — 06 meses</SelectItem>
                        <SelectItem value="trimestral">Trimestral — 03 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data de início *</Label>
                    <Input name="data_inicio" type="date" required value={dataInicio} onChange={(e) => onInicioChange(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data de término</Label>
                    <Input name="data_fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 3. Serviço */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                  <Label>Pesagem e serviço — Cláusulas 1.2 e 2.1</Label>
                </div>
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#92400E" }}>
                  Estes campos alimentam diretamente as cláusulas do contrato.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Grupos de resíduos — Cláusula 1.1</Label>
                    <Select name="grupos_residuos" defaultValue="Grupo A, B e E (CONAMA 358/2005 e ANVISA 222/18)">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grupo A, B e E (CONAMA 358/2005 e ANVISA 222/18)">Grupos A, B e E</SelectItem>
                        <SelectItem value="Grupo A e E (CONAMA 358/2005 e ANVISA 222/18)">Grupos A e E</SelectItem>
                        <SelectItem value="Grupo E (perfurocortantes)">Grupo E — somente perfurocortantes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Frequência — Cláusula 2.1</Label>
                    <Select name="frequencia_coleta_texto" defaultValue="Mensal (1x ao mês)">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mensal (1x ao mês)">Mensal — 1x ao mês</SelectItem>
                        <SelectItem value="Quinzenal (2x ao mês)">Quinzenal — 2x ao mês</SelectItem>
                        <SelectItem value="Semanal (4x ao mês)">Semanal — 4x ao mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Limite de peso — kg/mês *</Label>
                    <div className="flex items-center gap-2">
                      <Input name="limite_kg" type="number" step="0.1" min="0" placeholder="Ex.: 10" required className="font-mono" />
                      <span className="text-sm text-muted-foreground shrink-0">kg</span>
                    </div>
                    <p className="text-xs text-muted-foreground">→ Cláusula 1.2: "0 a X kg…"</p>
                  </div>
                </div>
              </div>

              {/* 4. Financeiro */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
                  <Label>Valores e pagamento — Cláusula 3</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Valor mensal R$ — Cláusula 3.1 *</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-muted-foreground">R$</span>
                      <Input name="valor_mensal" type="number" step="0.01" min="0" placeholder="70.00" required className="font-mono" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Valor por kg excedente — Cláusula 3.2</Label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-muted-foreground">R$</span>
                      <Input name="valor_excedente" type="number" step="0.01" min="0" placeholder="8.50" className="font-mono" />
                      <span className="text-sm text-muted-foreground shrink-0">/kg</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Forma de pagamento</Label>
                    <Select name="forma_pagamento" defaultValue="no ato da coleta de cada mês">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no ato da coleta de cada mês">No ato da coleta</SelectItem>
                        <SelectItem value="boleto bancário — 30 dias">Boleto — 30 dias</SelectItem>
                        <SelectItem value="PIX — 7 dias após a coleta">PIX — 7 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>)}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setNovoOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || !selectedCliente} className="bg-primary hover:bg-primary/90">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Gerar e salvar contrato
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver contrato HTML */}
      <Dialog open={!!verContrato} onOpenChange={() => setVerContrato(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8E5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>{verContrato?.numero} — {verContrato?.clientes?.razao_social}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="eco-btn eco-btn-g" style={{ fontSize: "12px" }} onClick={() => window.print()}>
                Imprimir / PDF
              </button>
              <button className="eco-btn eco-btn-p" style={{ fontSize: "12px" }} onClick={() => { setAssContrato(verContrato); setVerContrato(null); }}>
                ✏ Assinar digitalmente
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#F7F8F6" }}>
            {verContrato?.conteudo_html ? (
              <div dangerouslySetInnerHTML={{ __html: verContrato.conteudo_html }} />
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#6B7671" }}>Contrato sem conteúdo HTML gerado.</div>
            )}
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid #E2E8E5", textAlign: "right" }}>
            <button className="eco-btn eco-btn-g" onClick={() => setVerContrato(null)}>Fechar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Assinatura EcoTrack */}
      <ModalAssinatura
        open={!!assContrato}
        contrato={assContrato}
        cliente={assContrato ? (clientes.find((c) => c.id === assContrato.cliente_id) ?? null) : null}
        onClose={() => setAssContrato(null)}
        onSalvo={handleAssinaturaSalva}
      />

      {/* Modal: E-mail */}
      <Dialog open={!!emailContrato} onOpenChange={() => setEmailContrato(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enviar contrato por e-mail</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>E-mail destinatário *</Label>
              <Input type="email" value={emailDest} onChange={(e) => setEmailDest(e.target.value)} placeholder="cliente@empresa.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmailContrato(null)}>Cancelar</Button>
            <Button onClick={handleEnviarEmail} disabled={!emailDest || sendingEmail}>
              {sendingEmail && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Mail className="h-4 w-4 mr-2" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
