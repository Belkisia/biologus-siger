<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
=======
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
>>>>>>> independente
import { useServerFn } from "@tanstack/react-start";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
<<<<<<< HEAD
import {
  Loader2, CheckCircle2, FileText, ShieldCheck, AlertCircle,
  Camera, RefreshCw, PenLine, KeyRound, BadgeCheck,
} from "lucide-react";
=======
import { Loader2, CheckCircle2, FileText, ShieldCheck, AlertCircle } from "lucide-react";
>>>>>>> independente
import { toast } from "sonner";
import { obterSignatarioPorToken, solicitarOTP, confirmarAssinatura } from "@/lib/assinatura.functions";

export const Route = createFileRoute("/assinar/$token")({
  component: AssinarPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-4 bg-muted/30">
      <Card className="max-w-md p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
        <h1 className="text-xl font-semibold">Não foi possível abrir o documento</h1>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </Card>
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">Documento não encontrado.</div>,
});

<<<<<<< HEAD
// ── Etapas do fluxo ──────────────────────────────────────────────────────────
type Etapa = "leitura" | "selfie" | "assinatura" | "otp" | "concluido";

function StepIndicator({ etapa }: { etapa: Etapa }) {
  const steps: { key: Etapa; label: string; icon: React.ReactNode }[] = [
    { key: "leitura",    label: "Ler",      icon: <FileText className="h-4 w-4" /> },
    { key: "selfie",     label: "Selfie",   icon: <Camera className="h-4 w-4" /> },
    { key: "assinatura", label: "Assinar",  icon: <PenLine className="h-4 w-4" /> },
    { key: "otp",        label: "Confirmar",icon: <KeyRound className="h-4 w-4" /> },
    { key: "concluido",  label: "Concluído",icon: <BadgeCheck className="h-4 w-4" /> },
  ];
  const idx = steps.findIndex((s) => s.key === etapa);
  return (
    <div className="flex items-center justify-between px-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1 flex-1 last:flex-none">
          <div className={`flex flex-col items-center gap-1 ${i <= idx ? "text-emerald-700" : "text-muted-foreground/40"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
              ${i < idx ? "bg-emerald-600 border-emerald-600 text-white" :
                i === idx ? "border-emerald-600 text-emerald-700 bg-emerald-50" :
                "border-muted-foreground/30 bg-muted/30"}`}>
              {i < idx ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
            </div>
            <span className="text-xs font-medium hidden sm:block">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 transition-all ${i < idx ? "bg-emerald-500" : "bg-muted-foreground/20"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Componente de selfie ──────────────────────────────────────────────────────
function SelfieCapture({ onCapturada, onPular }: { onCapturada: (base64: string) => void; onPular: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [erroCam, setErroCam] = useState(false);
  const [iniciando, setIniciando] = useState(false);

  const iniciarCamera = useCallback(async () => {
    setIniciando(true);
    setErroCam(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
    } catch {
      setErroCam(true);
    } finally {
      setIniciando(false);
    }
  }, []);

  const pararCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  useEffect(() => { iniciarCamera(); return () => pararCamera(); }, []);

  const tirarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const b64 = canvas.toDataURL("image/jpeg", 0.85);
    setFoto(b64);
    pararCamera();
  };

  const refazer = () => {
    setFoto(null);
    iniciarCamera();
  };

  const confirmar = () => {
    if (foto) { onCapturada(foto); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm text-amber-800 dark:text-amber-300">
        <strong>Por que pedimos uma selfie?</strong><br />
        A foto comprova sua identidade no momento da assinatura, fortalecendo a validade jurídica do documento conforme a MP 2.200-2/2001. Ela é armazenada com criptografia junto ao registro da assinatura.
      </div>

      {erroCam ? (
        <div className="text-center space-y-3 py-4">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Câmera não disponível ou acesso negado.</p>
          <Button variant="outline" onClick={onPular}>Pular foto e continuar</Button>
        </div>
      ) : foto ? (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden border-2 border-emerald-500">
            <img src={foto} alt="Selfie" className="w-full object-cover" style={{ maxHeight: 320 }} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={refazer}>
              <RefreshCw className="h-4 w-4 mr-2" /> Tirar novamente
            </Button>
            <Button className="flex-1 bg-emerald-700 hover:bg-emerald-800" onClick={confirmar}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Usar esta foto
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden bg-black border" style={{ minHeight: 280 }}>
            {iniciando ? (
              <div className="flex items-center justify-center h-64 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="w-full" style={{ maxHeight: 320, objectFit: "cover", transform: "scaleX(-1)" }} />
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onPular}>Pular</Button>
            <Button className="flex-1 bg-emerald-700 hover:bg-emerald-800" onClick={tirarFoto} disabled={iniciando || !stream}>
              <Camera className="h-4 w-4 mr-2" /> Tirar selfie
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
=======
>>>>>>> independente
function AssinarPage() {
  const { token } = Route.useParams();
  const obter = useServerFn(obterSignatarioPorToken);
  const solicitar = useServerFn(solicitarOTP);
  const confirmar = useServerFn(confirmarAssinatura);

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

<<<<<<< HEAD
  const [etapa, setEtapa] = useState<Etapa>("leitura");
  const [aceite, setAceite] = useState(false);
  const [selfieB64, setSelfieB64] = useState<string | null>(null);
=======
  const [aceite, setAceite] = useState(false);
  const [otpEnviado, setOtpEnviado] = useState(false);
>>>>>>> independente
  const [codigo, setCodigo] = useState("");
  const [sending, setSending] = useState(false);
  const [signing, setSigning] = useState(false);
  const [sucesso, setSucesso] = useState<{ codigo: string; todos: boolean } | null>(null);
  const sigRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    obter({ data: { token } })
      .then((r) => setInfo(r))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [token, obter]);

  const handleSolicitarOTP = async () => {
<<<<<<< HEAD
    if (sigRef.current?.isEmpty()) {
      toast.error("Desenhe sua assinatura antes de continuar.");
=======
    if (!aceite) {
      toast.error("Você precisa concordar com os termos antes de prosseguir.");
      return;
    }
    if (sigRef.current?.isEmpty()) {
      toast.error("Desenhe sua assinatura no quadro acima.");
>>>>>>> independente
      return;
    }
    setSending(true);
    try {
      const r = await solicitar({ data: { token } });
<<<<<<< HEAD
      toast.success(`Código enviado para ${r.enviado_para}`);
      setEtapa("otp");
=======
      setOtpEnviado(true);
      toast.success(`Código enviado para ${r.enviado_para}`);
>>>>>>> independente
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleAssinar = async () => {
    if (!/^\d{6}$/.test(codigo)) {
      toast.error("Digite o código de 6 dígitos");
      return;
    }
    setSigning(true);
    try {
<<<<<<< HEAD
      // Combina assinatura manuscrita + selfie em uma imagem só
      const rubricaCanvas = sigRef.current?.getCanvas();
      let rubricaFinal: string | undefined;

      if (selfieB64 && rubricaCanvas) {
        // Cria canvas combinado: selfie pequena + assinatura
        const offscreen = document.createElement("canvas");
        const selfieImg = new Image();
        const rubricaImg = new Image();
        await new Promise<void>((res) => { selfieImg.onload = () => res(); selfieImg.src = selfieB64; });
        await new Promise<void>((res) => { rubricaImg.onload = () => res(); rubricaImg.src = rubricaCanvas.toDataURL("image/png"); });
        const W = 640, H = 280;
        offscreen.width = W;
        offscreen.height = H;
        const ctx = offscreen.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, H);
        // selfie à esquerda (120x160)
        ctx.drawImage(selfieImg, 8, 8, 120, 160);
        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(8, 8, 120, 160);
        ctx.font = "10px Arial";
        ctx.fillStyle = "#888";
        ctx.fillText("Foto do signatário", 8, 182);
        // assinatura à direita
        ctx.drawImage(rubricaImg, 140, 8, W - 150, 200);
        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(140, 8, W - 150, 200);
        ctx.fillStyle = "#888";
        ctx.fillText("Assinatura manuscrita", 140, 222);
        // linha de dados
        ctx.fillStyle = "#444";
        ctx.font = "11px monospace";
        ctx.fillText(`Signatário: ${info?.signatario?.nome || ""}  |  ${new Date().toLocaleString("pt-BR")}`, 8, 255);
        rubricaFinal = offscreen.toDataURL("image/png");
      } else {
        rubricaFinal = rubricaCanvas?.toDataURL("image/png");
      }

      const r = await confirmar({ data: { token, codigo, rubrica_base64: rubricaFinal, aceite: true } });
      setSucesso({ codigo: r.codigo_verificacao, todos: !!r.todosAssinados });
      setEtapa("concluido");
=======
      const rubrica = sigRef.current?.getCanvas().toDataURL("image/png");
      const r = await confirmar({ data: { token, codigo, rubrica_base64: rubrica, aceite: true } });
      setSucesso({ codigo: r.codigo_verificacao, todos: !!r.todosAssinados });
>>>>>>> independente
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSigning(false);
    }
  };

<<<<<<< HEAD
  // ── Estados de carregamento / erro / já assinou ───────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
=======
  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
>>>>>>> independente
  }

  if (erro) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-muted/30">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
          <h1 className="text-xl font-semibold">Link inválido</h1>
          <p className="text-sm text-muted-foreground mt-2">{erro}</p>
        </Card>
      </div>
    );
  }

<<<<<<< HEAD
  // ── Tela de sucesso ───────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-emerald-50/50">
        <Card className="max-w-lg w-full p-10 text-center shadow-lg">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900">Documento assinado!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Assinatura registrada com validade jurídica conforme a <strong>MP 2.200-2/2001</strong>.
            {selfieB64 && " Foto de identidade capturada e vinculada à assinatura."}
          </p>
          <div className="mt-6 p-4 bg-muted/40 rounded-xl text-left border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Código de verificação</p>
            <p className="text-3xl font-mono font-bold mt-1 text-emerald-800 tracking-widest">{sucesso.codigo}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Guarde este código. Qualquer pessoa pode validar em{" "}
              <strong className="text-foreground">/validar/{sucesso.codigo}</strong>
            </p>
          </div>
          {sucesso.todos ? (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800 font-medium">✓ Todos os signatários assinaram.</p>
              <p className="text-xs text-emerald-700 mt-1">O documento final consolidado está disponível no sistema.</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Aguardando assinatura dos demais signatários.</p>
=======
  if (sucesso) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-muted/30">
        <Card className="max-w-lg w-full p-10 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-600 mb-4" />
          <h1 className="text-2xl font-semibold">Documento assinado!</h1>
          <p className="text-muted-foreground mt-2">Sua assinatura foi registrada com validade jurídica conforme a MP 2.200-2/2001.</p>
          <div className="mt-6 p-4 bg-muted/40 rounded-lg text-left">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Código de verificação</p>
            <p className="text-2xl font-mono font-bold mt-1">{sucesso.codigo}</p>
            <p className="text-xs text-muted-foreground mt-2">Guarde este código. Qualquer pessoa pode validar a assinatura em <strong>/validar/{sucesso.codigo}</strong></p>
          </div>
          {sucesso.todos ? (
            <p className="mt-6 text-sm text-emerald-700">✓ Todos os signatários assinaram. O documento final foi consolidado.</p>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Aguardando assinatura dos demais signatários.</p>
>>>>>>> independente
          )}
        </Card>
      </div>
    );
  }

<<<<<<< HEAD
  const sig = info?.signatario;
  const jaAssinou = sig?.status === "assinado";

  if (jaAssinou) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-muted/30">
        <Card className="max-w-md p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600 mb-3" />
          <h1 className="text-xl font-semibold">Você já assinou este documento</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Assinado em {new Date(sig.assinado_em).toLocaleString("pt-BR")}
          </p>
        </Card>
      </div>
    );
  }

  // ── Fluxo principal ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-background py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Header */}
        <Card className="p-5 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white border-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Bio Logus Ambiental</p>
              <h1 className="text-lg font-semibold mt-0.5">
                {info?.documento?.numero ? `Contrato Nº ${info.documento.numero}` : "Assinatura eletrônica"}
              </h1>
            </div>
            <div className="text-right text-sm">
              <p className="text-xs opacity-75">Signatário</p>
              <p className="font-semibold">{sig?.nome}</p>
              <p className="text-xs opacity-75 mt-0.5">{sig?.papel}</p>
=======
  const sig = info.signatario;
  const jaAssinou = sig.status === "assinado";

  return (
    <div className="min-h-screen bg-muted/30 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card className="p-6 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-semibold">Bio Logus Ambiental</h1>
              <p className="text-sm opacity-90 mt-1">Assinatura eletrônica · {info.documento.numero ? `Nº ${info.documento.numero}` : info.signatario.documento_tipo}</p>
            </div>
            <div className="text-right text-sm">
              <p className="opacity-80">Signatário</p>
              <p className="font-medium">{sig.nome}</p>
              <p className="text-xs opacity-75">{sig.email} · {sig.papel}</p>
>>>>>>> independente
            </div>
          </div>
        </Card>

<<<<<<< HEAD
        {/* Steps */}
        <Card className="p-4">
          <StepIndicator etapa={etapa} />
        </Card>

        {/* ── ETAPA 1: LEITURA ─────────────────────────────────────────── */}
        {etapa === "leitura" && (
          <>
            <Card className="overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Leia o documento completo antes de assinar</span>
              </div>
              {info?.pdfUrl ? (
                <iframe src={info.pdfUrl} className="w-full" style={{ height: "65vh" }} title="Documento" />
              ) : (
                <div className="p-12 text-center text-muted-foreground text-sm">PDF não disponível</div>
              )}
            </Card>

            <Card className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox id="aceite" checked={aceite} onCheckedChange={(v) => setAceite(!!v)} className="mt-0.5" />
                <Label htmlFor="aceite" className="text-sm leading-relaxed cursor-pointer">
                  Li, compreendi e concordo com todos os termos do documento acima. Declaro ser{" "}
                  <strong>{sig?.nome}</strong> e que estou assinando por livre e espontânea vontade.
                </Label>
              </div>
              <Button
                className="w-full bg-emerald-700 hover:bg-emerald-800"
                size="lg"
                disabled={!aceite}
                onClick={() => setEtapa("selfie")}
              >
                Continuar para verificação de identidade
              </Button>
            </Card>
          </>
        )}

        {/* ── ETAPA 2: SELFIE ──────────────────────────────────────────── */}
        {etapa === "selfie" && (
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5 text-emerald-600" /> Verificação de identidade
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tire uma selfie para vincular sua identidade à assinatura.
              </p>
            </div>
            <SelfieCapture
              onCapturada={(b64) => { setSelfieB64(b64); setEtapa("assinatura"); }}
              onPular={() => { setSelfieB64(null); setEtapa("assinatura"); }}
            />
          </Card>
        )}

        {/* ── ETAPA 3: ASSINATURA MANUSCRITA ───────────────────────────── */}
        {etapa === "assinatura" && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PenLine className="h-5 w-5 text-emerald-600" /> Desenhe sua assinatura
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Use o mouse ou o dedo na tela sensível ao toque.
              </p>
            </div>

            {selfieB64 && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <img src={selfieB64} alt="Selfie" className="w-14 h-14 object-cover rounded-md border-2 border-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">Foto capturada ✓</p>
                  <p className="text-xs text-emerald-700">Será vinculada à sua assinatura</p>
                </div>
              </div>
            )}

            <div>
              <div className="border-2 border-dashed border-emerald-300 rounded-xl overflow-hidden bg-white shadow-inner">
                <SignatureCanvas
                  ref={sigRef}
                  canvasProps={{
                    className: "w-full",
                    style: { width: "100%", height: 180 },
                  }}
                  penColor="#0a2540"
                  backgroundColor="white"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Assine dentro do quadro acima
                </p>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  onClick={() => sigRef.current?.clear()}
                >
=======
        {jaAssinou && (
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <p className="text-sm text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Você já assinou este documento em {new Date(sig.assinado_em).toLocaleString("pt-BR")}.
            </p>
          </Card>
        )}

        {/* PDF Viewer */}
        <Card className="overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Documento para assinatura</span>
          </div>
          {info.pdfUrl ? (
            <iframe src={info.pdfUrl} className="w-full" style={{ height: "70vh" }} title="Documento" />
          ) : (
            <div className="p-12 text-center text-muted-foreground text-sm">PDF não disponível</div>
          )}
        </Card>

        {!jaAssinou && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Assinar documento
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sua assinatura tem validade jurídica conforme MP 2.200-2/2001, art. 10, §2º. Capturamos IP, data/hora e código de confirmação enviado ao seu e-mail.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="aceite" checked={aceite} onCheckedChange={(v) => setAceite(!!v)} />
              <Label htmlFor="aceite" className="text-sm leading-relaxed cursor-pointer">
                Li, compreendi e concordo com todos os termos do documento acima. Declaro ser o(a) signatário(a) <strong>{sig.nome}</strong> e que estou assinando por livre e espontânea vontade.
              </Label>
            </div>

            <div>
              <Label className="text-sm">Desenhe sua assinatura abaixo</Label>
              <div className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas
                  ref={sigRef}
                  canvasProps={{ className: "w-full", style: { width: "100%", height: 160 } }}
                  penColor="#0a2540"
                />
              </div>
              <div className="mt-1 flex justify-end">
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline" onClick={() => sigRef.current?.clear()}>
>>>>>>> independente
                  Limpar
                </button>
              </div>
            </div>

<<<<<<< HEAD
            <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Ao clicar em continuar, seu IP, data/hora e localização serão registrados junto à assinatura.
                Validade jurídica conforme <strong>MP 2.200-2/2001, art. 10, §2º</strong>.
              </span>
            </div>

            <Button
              className="w-full bg-emerald-700 hover:bg-emerald-800"
              size="lg"
              onClick={handleSolicitarOTP}
              disabled={sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
              Enviar código de confirmação por e-mail
            </Button>
          </Card>
        )}

        {/* ── ETAPA 4: OTP ─────────────────────────────────────────────── */}
        {etapa === "otp" && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-emerald-600" /> Confirme sua identidade
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enviamos um código de 6 dígitos para <strong>{sig?.email}</strong>. Verifique sua caixa de entrada ou spam.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Código recebido por e-mail</Label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-3xl font-mono tracking-[0.5em] h-14"
                inputMode="numeric"
                autoFocus
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSolicitarOTP}
                disabled={sending}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Reenviar código
              </Button>
              <Button
                className="flex-1 bg-emerald-700 hover:bg-emerald-800"
                size="lg"
                onClick={handleAssinar}
                disabled={signing || codigo.length !== 6}
              >
                {signing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <BadgeCheck className="h-4 w-4 mr-2" />
                )}
                Assinar agora
              </Button>
            </div>

            <button
              type="button"
              className="text-xs text-muted-foreground underline w-full text-center"
              onClick={() => setEtapa("assinatura")}
            >
              ← Voltar e corrigir assinatura
            </button>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground py-2">
          Protegido por Bio Logus · Assinatura eletrônica com validade jurídica · MP 2.200-2/2001
=======
            {!otpEnviado ? (
              <Button onClick={handleSolicitarOTP} disabled={sending || !aceite} className="w-full" size="lg">
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enviar código de confirmação para meu e-mail
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-muted/40 rounded-lg">
                <div>
                  <Label>Código recebido por e-mail (6 dígitos)</Label>
                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl font-mono tracking-widest mt-2"
                    inputMode="numeric"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAssinar} disabled={signing || codigo.length !== 6} className="flex-1" size="lg">
                    {signing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Assinar agora
                  </Button>
                  <Button variant="ghost" onClick={handleSolicitarOTP} disabled={sending}>
                    Reenviar
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground py-4">
          Protegido por Bio Logus · Assinatura eletrônica simples conforme MP 2.200-2/2001
>>>>>>> independente
        </p>
      </div>
    </div>
  );
}
