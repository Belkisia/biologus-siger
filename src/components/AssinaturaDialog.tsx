     import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Clock, Download, Copy, Send, Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";
import { criarSolicitacaoAssinatura, listarSignatarios } from "@/lib/assinatura.functions";

// ── CSS injetado — idêntico ao EcoTrack ──────────────────────────────────────
const STYLES = `
.sig-tabs{display:flex;border-bottom:1px solid #E2E8E5;margin-bottom:16px}
.sig-tab{padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:#6B7671;user-select:none;transition:all .15s}
.sig-tab.active{border-bottom-color:#0D6B54;color:#0D6B54}
.sig-area{border:2px dashed #E2E8E5;border-radius:10px;background:#fff;position:relative;cursor:crosshair;transition:border-color .2s;overflow:hidden}
.sig-area:hover{border-color:#1D9E75}
.sig-area.signed{border:2px solid #059669;background:#ECFDF5}
.sig-placeholder{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#6B7671;font-size:13px;text-align:center;white-space:nowrap;pointer-events:none;line-height:1.6}
.sig-canvas{width:100%;height:130px;display:block;touch-action:none;border-radius:8px}
.cam-box{border:2px dashed #E2E8E5;border-radius:10px;overflow:hidden;background:#111;position:relative;transition:border-color .2s;height:200px}
.cam-box.ok{border:2px solid #059669}
.cam-video{width:100%;height:200px;object-fit:cover;display:none;position:absolute;top:0;left:0}
.cam-canvas-el{display:none}
.cam-preview{width:100%;height:200px;object-fit:cover;display:none;position:absolute;top:0;left:0;border-radius:0}
.cam-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);flex-direction:column;gap:8px}
.cam-overlay svg{width:36px;height:36px;color:#fff;opacity:.8}
.cam-overlay span{color:#fff;font-size:12px;opacity:.7}
.proof-strip{display:flex;gap:8px;align-items:center;background:#ECFDF5;border:1px solid rgba(5,150,105,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:#059669;margin-top:10px}
.sig-cor-sel,.sig-esp-sel{width:auto!important;font-size:12px!important;padding:6px 10px!important}
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("eco-sig-styles")) return;
  const s = document.createElement("style");
  s.id = "eco-sig-styles";
  s.textContent = STYLES;
  document.head.appendChild(s);
}

// ── Componente principal ──────────────────────────────────────────────────────
export function AssinaturaDialog({
  open,
  onOpenChange,
  documentoTipo,
  documentoId,
  clienteSugerido,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  documentoTipo: "contrato" | "proposta";
  documentoId: string | null;
  clienteSugerido?: { nome: string; email?: string; cpf_cnpj?: string } | null;
}) {
  injectStyles();

  const qc = useQueryClient();
  const criar = useServerFn(criarSolicitacaoAssinatura);
  const listar = useServerFn(listarSignatarios);

  // ── Estado form ───────────────────────────────────────────────────────────
  const [sigNome, setSigNome]   = useState("");
  const [sigCpf, setSigCpf]     = useState("");
  const [sigCargo, setSigCargo] = useState("");
  const [sigEmail, setSigEmail] = useState("");
  const [sending, setSending]   = useState(false);
  const [tabAtual, setTabAtual] = useState<"ass" | "foto">("ass");

  // ── Canvas assinatura ─────────────────────────────────────────────────────
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const ctxRef     = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const [corSel, setCorSel] = useState("#1a1a1a");
  const [espSel, setEspSel] = useState("3");
  const [signed, setSigned] = useState(false);

  // ── Câmera ────────────────────────────────────────────────────────────────
  const videoRef    = useRef<HTMLVideoElement>(null);
  const camCanvasRef= useRef<HTMLCanvasElement>(null);
  const previewRef  = useRef<HTMLImageElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const [camFase, setCamFase]     = useState<"idle" | "live" | "foto">("idle");
  const [camFotoData, setCamFotoData] = useState<string | null>(null);
  const [camErro, setCamErro]     = useState(false);
  const [camMsg, setCamMsg]       = useState("Clique em \"Ativar câmera\" abaixo");

  // ── Supabase signatários ──────────────────────────────────────────────────
  const { data: existing, isLoading } = useQuery({
    queryKey: ["signatarios", documentoTipo, documentoId],
    queryFn:  () => listar({ data: { documento_tipo: documentoTipo, documento_id: documentoId! } }),
    enabled:  !!documentoId && open,
  });
  const jaEnviado      = (existing?.signatarios?.length || 0) > 0;
  const todosAssinados = jaEnviado && existing!.signatarios.every((s: any) => s.status === "assinado");

  // ── Pré-preencher ao abrir ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setSigNome(clienteSugerido?.nome || "");
    setSigCpf(clienteSugerido?.cpf_cnpj || "");
    setSigEmail(clienteSugerido?.email || "");
    setSigCargo("");
    setTabAtual("ass");
    setSigned(false);
    setCamFase("idle");
    setCamFotoData(null);
    setCamErro(false);
    setCamMsg("Clique em \"Ativar câmera\" abaixo");
    setTimeout(() => initCanvas(), 200);
  }, [open, clienteSugerido]);

  // ── Para câmera ao fechar ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) camParar();
  }, [open]);

  // ── Canvas init ───────────────────────────────────────────────────────────
  const initCanvas = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    ctxRef.current = ctx;
    ctx.strokeStyle = corSel;
    ctx.lineWidth   = Number(espSel);
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    function pos(e: MouseEvent | TouchEvent) {
      const cvEl = cv!;
      const r = cvEl.getBoundingClientRect();
      const src = "touches" in e ? e.touches[0] : e;
      return [
        (src.clientX - r.left) * (cvEl.width / r.width),
        (src.clientY - r.top)  * (cvEl.height / r.height),
      ];
    }
    cv.onmousedown = (e) => {
      drawingRef.current = true;
      const [x, y] = pos(e);
      ctx.beginPath(); ctx.moveTo(x, y);
    };
    cv.onmousemove = (e) => {
      if (!drawingRef.current) return;
      const [x, y] = pos(e);
      ctx.lineTo(x, y); ctx.stroke();
      setSigned(true);
    };
    cv.onmouseup = cv.onmouseleave = () => { drawingRef.current = false; };
    cv.ontouchstart = (e) => {
      e.preventDefault();
      drawingRef.current = true;
      const [x, y] = pos(e);
      ctx.beginPath(); ctx.moveTo(x, y);
    };
    cv.ontouchmove = (e) => {
      e.preventDefault();
      if (!drawingRef.current) return;
      const [x, y] = pos(e);
      ctx.lineTo(x, y); ctx.stroke();
      setSigned(true);
    };
    cv.ontouchend = () => { drawingRef.current = false; };
  }, [corSel, espSel]);

  const sigLimpar = () => {
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (cv && ctx) ctx.clearRect(0, 0, cv.width, cv.height);
    setSigned(false);
  };

  const setCor = (v: string) => {
    setCorSel(v);
    if (ctxRef.current) ctxRef.current.strokeStyle = v;
  };
  const setEsp = (v: string) => {
    setEspSel(v);
    if (ctxRef.current) ctxRef.current.lineWidth = Number(v);
  };

  const trocarTab = (t: "ass" | "foto") => {
    setTabAtual(t);
    if (t === "ass") setTimeout(() => initCanvas(), 100);
  };

  // ── Câmera ────────────────────────────────────────────────────────────────
  const camParar = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const camAtivar = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamErro(true);
      setCamMsg("Câmera não disponível — use \"Enviar da galeria\"");
      return;
    }
    setCamMsg("Aguarde, abrindo câmera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const vid = videoRef.current;
      if (vid) { vid.srcObject = stream; vid.style.display = "block"; }
      setCamFase("live");
    } catch {
      setCamErro(true);
      setCamMsg("Acesso negado — use o botão \"Enviar da galeria\"");
      toast.error("Câmera negada — use o botão de galeria");
    }
  };

  const camCapturar = () => {
    const vid = videoRef.current;
    const cnv = camCanvasRef.current;
    const prev = previewRef.current;
    if (!vid?.srcObject || !cnv) { toast.error("Câmera não está ativa"); return; }
    const w = vid.videoWidth || 640, h = vid.videoHeight || 480;
    cnv.width = w; cnv.height = h;
    const ctx = cnv.getContext("2d")!;
    // Espelha horizontal
    ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1);
    ctx.drawImage(vid, 0, 0, w, h);
    ctx.restore();
    // Carimbo rodapé com nome, CPF e data/hora
    ctx.fillStyle = "rgba(0,0,0,.65)";
    ctx.fillRect(0, h - 36, w, 36);
    ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
    ctx.fillText(
      `${sigNome || "Signatário"} | ${sigCpf || ""} | ${new Date().toLocaleString("pt-BR")}`,
      10, h - 12,
    );
    const data = cnv.toDataURL("image/jpeg", 0.88);
    setCamFotoData(data);
    if (prev) { prev.src = data; prev.style.display = "block"; }
    if (vid)  vid.style.display = "none";
    camParar();
    setCamFase("foto");
    toast.success("✔ Foto capturada!");
  };

  const camRefazer = () => {
    setCamFotoData(null);
    setCamFase("idle");
    setCamErro(false);
    setCamMsg("Clique em \"Ativar câmera\" abaixo");
    const prev = previewRef.current;
    if (prev) { prev.style.display = "none"; prev.src = ""; }
    camAtivar();
  };

  const camUpload = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = () => {
      const file = inp.files?.[0]; if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toast.error("Arquivo muito grande. Máx 5MB"); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        setCamFotoData(data);
        const prev = previewRef.current;
        if (prev) { prev.src = data; prev.style.display = "block"; }
        camParar();
        setCamFase("foto");
        toast.success("✔ Foto carregada!");
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  };

  // ── Confirmar e enviar ────────────────────────────────────────────────────
  const sigConfirmar = async () => {
    if (!sigNome.trim()) { toast.error("Informe o nome do signatário"); return; }
    if (!sigCpf.trim())  { toast.error("Informe o CPF"); return; }
    if (!sigEmail.trim()) { toast.error("Informe o e-mail"); return; }

    // Valida assinatura
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (!cv || !ctx || !signed) {
      trocarTab("ass");
      toast.error("Desenhe a assinatura antes de confirmar"); return;
    }
    // Verifica pixels
    const imgD = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let temTraco = false;
    for (let i = 3; i < imgD.length; i += 4) { if (imgD[i] > 10) { temTraco = true; break; } }
    if (!temTraco) {
      trocarTab("ass");
      toast.error("Assinatura em branco — desenhe a assinatura"); return;
    }

    // Foto obrigatória
    if (!camFotoData) {
      trocarTab("foto");
      toast.error("📸 Tire a foto do signatário para concluir"); return;
    }

    if (!documentoId) return;
    setSending(true);
    try {
      const rubrica = cv.toDataURL("image/png");
      // Signatários: contratante (cliente) + contratada (Bio Logus)
      const signatarios = [
        {
          nome:     sigNome,
          email:    sigEmail,
          cpf_cnpj: sigCpf,
          papel:    "contratante" as const,
        },
        {
          nome:     "BIO LOGUS AMBIENTAL LTDA - ME",
          email:    "comercial@biologusambiental.com.br",
          cpf_cnpj: "26.484.921/0001-60",
          papel:    "contratada" as const,
        },
      ];
      const r = await criar({ data: { documento_tipo: documentoTipo, documento_id: documentoId, signatarios } });
      toast.success(`✔ Assinatura registrada! ${r.total} convite(s) enviado(s).`);
      qc.invalidateQueries({ queryKey: ["signatarios", documentoTipo, documentoId] });
      camParar();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/assinar/${token}`);
    toast.success("Link copiado");
  };

  const mascCpf = (v: string) => {
    const d = v.replace(/\D/g, "").substring(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            ✏ Assinatura digital do contratante
          </h2>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>

        ) : jaEnviado ? (
          /* ── Já enviado ── */
          <div className="p-5 space-y-4">
            <Card className={`p-4 ${todosAssinados ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              <p className={`text-sm font-medium ${todosAssinados ? "text-emerald-900" : "text-amber-900"}`}>
                {todosAssinados ? "✓ Todos assinaram." : "⏳ Aguardando assinaturas."}
              </p>
            </Card>
            {existing!.signatarios.map((s: any) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.nome}</p>
                    <p className="text-xs text-muted-foreground">{s.email} · {s.papel}</p>
                    {s.assinado_em && <p className="text-xs text-emerald-700 mt-1">Assinado em {new Date(s.assinado_em).toLocaleString("pt-BR")}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.status === "assinado"
                      ? <Badge className="bg-emerald-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Assinado</Badge>
                      : <>
                          <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{s.status === "otp_enviado" ? "Em andamento" : "Pendente"}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => copyLink(s.token)}><Copy className="h-4 w-4" /></Button>
                        </>}
                  </div>
                </div>
              </Card>
            ))}
            {todosAssinados && existing!.pdf_assinado_url && (
              <Button className="w-full bg-emerald-700 hover:bg-emerald-800" asChild>
                <a href={existing!.pdf_assinado_url!} download>
                  <Download className="h-4 w-4 mr-2" /> Baixar PDF assinado
                </a>
              </Button>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
            </div>
          </div>

        ) : (
          /* ── Formulário de assinatura ── */
          <div className="p-5 space-y-5">

            {/* Banner contratante */}
            <div style={{
              background: "var(--color-background-secondary)",
              borderLeft: "4px solid #0D6B54",
              borderRadius: "0 8px 8px 0",
              padding: "12px 16px",
              fontSize: "13px",
            }}>
              <strong style={{ color: "#084D3C" }}>Contratante:</strong>{" "}
              <span>{clienteSugerido?.nome || "—"}</span>
              {clienteSugerido?.cpf_cnpj && (
                <>&nbsp;|&nbsp;<strong style={{ color: "#084D3C" }}>CNPJ/CPF:</strong>{" "}<span>{clienteSugerido.cpf_cnpj}</span></>
              )}
            </div>

            {/* Dados do signatário */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="space-y-1.5">
                <Label style={{ fontSize: "11px" }}>Nome do signatário *</Label>
                <Input
                  value={sigNome}
                  onChange={(e) => setSigNome(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: "11px" }}>CPF *</Label>
                <Input
                  value={sigCpf}
                  onChange={(e) => setSigCpf(mascCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: "11px" }}>E-mail *</Label>
                <Input
                  type="email"
                  value={sigEmail}
                  onChange={(e) => setSigEmail(e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ fontSize: "11px" }}>Cargo / Função</Label>
                <Input
                  value={sigCargo}
                  onChange={(e) => setSigCargo(e.target.value)}
                  placeholder="Diretor, Responsável Técnico..."
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="sig-tabs">
              <div
                className={`sig-tab ${tabAtual === "ass" ? "active" : ""}`}
                onClick={() => trocarTab("ass")}
              >
                ✏ Assinatura
              </div>
              <div
                className={`sig-tab ${tabAtual === "foto" ? "active" : ""}`}
                onClick={() => trocarTab("foto")}
              >
                📷 Foto do signatário{" "}
                {!camFotoData && (
                  <span style={{
                    fontSize: "10px",
                    background: "#FFF0F0",
                    color: "#DC3545",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    marginLeft: "4px",
                  }}>
                    obrigatória
                  </span>
                )}
              </div>
            </div>

            {/* Painel: Assinatura */}
            {tabAtual === "ass" && (
              <div>
                <p style={{ fontSize: "12px", color: "#6B7671", marginBottom: "8px" }}>
                  Desenhe a assinatura no campo abaixo *
                </p>
                <div className={`sig-area ${signed ? "signed" : ""}`}>
                  <canvas
                    ref={canvasRef}
                    id="sig-canvas"
                    className="sig-canvas"
                    width={620}
                    height={130}
                  />
                  {!signed && (
                    <div className="sig-placeholder">✏ Clique e arraste para assinar</div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  <select
                    className="sig-cor-sel"
                    value={corSel}
                    onChange={(e) => setCor(e.target.value)}
                    style={{ width: "auto", fontSize: "12px", padding: "6px 10px", borderRadius: "7px", border: "1px solid #E2E8E5" }}
                  >
                    <option value="#1a1a1a">Preta</option>
                    <option value="#0D6B54">Verde</option>
                    <option value="#003087">Azul</option>
                  </select>
                  <select
                    className="sig-esp-sel"
                    value={espSel}
                    onChange={(e) => setEsp(e.target.value)}
                    style={{ width: "auto", fontSize: "12px", padding: "6px 10px", borderRadius: "7px", border: "1px solid #E2E8E5" }}
                  >
                    <option value="2">Fina</option>
                    <option value="3">Média</option>
                    <option value="5">Grossa</option>
                  </select>
                  <button
                    type="button"
                    onClick={sigLimpar}
                    style={{
                      fontSize: "12px", padding: "6px 12px", borderRadius: "7px",
                      border: "1px solid #E2E8E5", background: "transparent",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ✕ Limpar
                  </button>
                  {signed && (
                    <span className="proof-strip" style={{ padding: "4px 10px", marginTop: 0 }}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Assinatura capturada
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Painel: Foto */}
            {tabAtual === "foto" && (
              <div>
                <p style={{ fontSize: "12px", color: "#6B7671", marginBottom: "10px" }}>
                  Tire uma foto do signatário <strong>segurando o documento</strong>. Fica salva internamente como prova de identidade — não aparece no contrato impresso.
                </p>
                <div className={`cam-box ${camFase === "foto" ? "ok" : ""}`}>
                  <video
                    ref={videoRef}
                    className="cam-video"
                    autoPlay
                    playsInline
                    muted
                    style={{ display: camFase === "live" ? "block" : "none" }}
                  />
                  <img
                    ref={previewRef}
                    className="cam-preview"
                    alt="Preview"
                    style={{ display: camFase === "foto" ? "block" : "none" }}
                  />
                  <canvas ref={camCanvasRef} className="cam-canvas-el" />
                  {camFase === "idle" && (
                    <div className="cam-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span>{camMsg}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {camFase === "idle" && !camErro && (
                    <button
                      type="button"
                      onClick={camAtivar}
                      style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "7px", border: "none", background: "#0D6B54", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      📷 Ativar câmera
                    </button>
                  )}
                  {camFase === "live" && (
                    <button
                      type="button"
                      onClick={camCapturar}
                      style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "7px", border: "none", background: "#DC3545", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      ⬤ Tirar foto agora
                    </button>
                  )}
                  {camFase === "foto" && (
                    <button
                      type="button"
                      onClick={camRefazer}
                      style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "7px", border: "1px solid #E2E8E5", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      ↺ Tirar novamente
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={camUpload}
                    style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "7px", border: "1px solid #E2E8E5", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    ↑ Enviar da galeria
                  </button>
                </div>

                {camFotoData && (
                  <div className="proof-strip">
                    <CheckCircle2 className="h-4 w-4" />
                    Foto capturada — identidade do signatário registrada
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px", borderTop: "1px solid #E2E8E5" }}>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button
                onClick={sigConfirmar}
                disabled={sending}
                className="bg-primary hover:bg-primary/90"
              >
                {sending
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : null}
                ✓ Confirmar assinatura
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
