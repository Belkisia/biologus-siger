import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, FileText, ShieldCheck, AlertCircle } from "lucide-react";
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

function AssinarPage() {
  const { token } = Route.useParams();
  const obter = useServerFn(obterSignatarioPorToken);
  const solicitar = useServerFn(solicitarOTP);
  const confirmar = useServerFn(confirmarAssinatura);

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [aceite, setAceite] = useState(false);
  const [otpEnviado, setOtpEnviado] = useState(false);
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
    if (!aceite) {
      toast.error("Você precisa concordar com os termos antes de prosseguir.");
      return;
    }
    if (sigRef.current?.isEmpty()) {
      toast.error("Desenhe sua assinatura no quadro acima.");
      return;
    }
    setSending(true);
    try {
      const r = await solicitar({ data: { token } });
      setOtpEnviado(true);
      toast.success(`Código enviado para ${r.enviado_para}`);
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
      const rubrica = sigRef.current?.getCanvas().toDataURL("image/png");
      const r = await confirmar({ data: { token, codigo, rubrica_base64: rubrica, aceite: true } });
      setSucesso({ codigo: r.codigo_verificacao, todos: r.todosAssinados });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
          )}
        </Card>
      </div>
    );
  }

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
            </div>
          </div>
        </Card>

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
                  Limpar
                </button>
              </div>
            </div>

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
        </p>
      </div>
    </div>
  );
}
