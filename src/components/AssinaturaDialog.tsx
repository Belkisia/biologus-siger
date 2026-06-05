import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Send, Loader2, CheckCircle2, Clock, Mail, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { criarSolicitacaoAssinatura, listarSignatarios } from "@/lib/assinatura.functions";
import { supabase } from "@/integrations/supabase/client";

type Sig = {
  nome: string;
  email: string;
  cpf_cnpj: string;
  papel: "contratante" | "contratada" | "testemunha";
};

const emptySig = (papel: Sig["papel"] = "contratante"): Sig => ({ nome: "", email: "", cpf_cnpj: "", papel });

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
  const qc = useQueryClient();
  const criar = useServerFn(criarSolicitacaoAssinatura);
  const listar = useServerFn(listarSignatarios);

  const [signers, setSigners] = useState<Sig[]>([]);
  const [sending, setSending] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["signatarios", documentoTipo, documentoId],
    queryFn: () => listar({ data: { documento_tipo: documentoTipo, documento_id: documentoId! } }),
    enabled: !!documentoId && open,
  });

  useEffect(() => {
    if (!open || !documentoId) return;
    if (existing?.signatarios?.length) return;
    // Pré-preencher: cliente como contratante, Bio Logus como contratada
    setSigners([
      { nome: clienteSugerido?.nome || "", email: clienteSugerido?.email || "", cpf_cnpj: clienteSugerido?.cpf_cnpj || "", papel: "contratante" },
      { nome: "Bio Logus Ambiental Ltda.", email: "contato@biologus.com.br", cpf_cnpj: "", papel: "contratada" },
    ]);
  }, [open, documentoId, existing, clienteSugerido]);

  const jaEnviado = (existing?.signatarios?.length || 0) > 0;
  const todosAssinados = existing?.signatarios?.length && existing.signatarios.every((s: any) => s.status === "assinado");

  const enviar = async () => {
    if (!documentoId) return;
    for (const s of signers) {
      if (!s.nome.trim() || !s.email.trim()) {
        toast.error("Preencha nome e e-mail de todos os signatários");
        return;
      }
    }
    setSending(true);
    try {
      const r = await criar({ data: { documento_tipo: documentoTipo, documento_id: documentoId, signatarios: signers } });
      toast.success(`${r.total} convite(s) enviado(s) por e-mail`);
      qc.invalidateQueries({ queryKey: ["signatarios", documentoTipo, documentoId] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const baixarPDF = () => {
    if (existing?.pdf_assinado_url) window.open(existing.pdf_assinado_url, "_blank");
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/assinar/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assinatura eletrônica do {documentoTipo}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : jaEnviado ? (
          <div className="space-y-4">
            <Card className="p-4 bg-emerald-50 border-emerald-200">
              <p className="text-sm text-emerald-900">
                {todosAssinados ? "✓ Todos assinaram. PDF consolidado disponível." : "Convites enviados. Aguardando assinaturas."}
              </p>
            </Card>

            {existing!.signatarios.map((s: any) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.email} · {s.papel}</p>
                    {s.assinado_em && (
                      <p className="text-xs text-emerald-700 mt-1">Assinado em {new Date(s.assinado_em).toLocaleString("pt-BR")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.status === "assinado" ? (
                      <Badge className="bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Assinado</Badge>
                    ) : (
                      <>
                        <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{s.status === "otp_enviado" ? "Em andamento" : "Pendente"}</Badge>
                        <Button variant="ghost" size="icon" title="Copiar link" onClick={() => copyLink(s.token)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {todosAssinados && existing!.pdf_assinado_path && (
              <Button onClick={baixarPDF} className="w-full">
                <Download className="h-4 w-4 mr-2" /> Baixar PDF assinado
              </Button>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
              {!todosAssinados && (
                <Button variant="destructive" onClick={async () => {
                  if (!confirm("Cancelar e reenviar para novos signatários?")) return;
                  // Reset: limpa signatários antigos chamando criar novamente vai sobrescrever
                  qc.invalidateQueries({ queryKey: ["signatarios", documentoTipo, documentoId] });
                  setSigners([emptySig("contratante"), emptySig("contratada")]);
                  // força refresh para mostrar form
                  await qc.refetchQueries({ queryKey: ["signatarios", documentoTipo, documentoId] });
                }}>
                  Reiniciar
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cada signatário receberá um e-mail com link único. Ao abrir, validamos a identidade por código OTP, capturamos IP/data/hora e geramos PDF assinado com validade jurídica (MP 2.200-2/2001).
            </p>

            {signers.map((s, i) => (
              <Card key={i} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signatário {i + 1}</span>
                  {signers.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => setSigners(signers.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome completo *</Label>
                    <Input value={s.nome} onChange={(e) => setSigners(signers.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))} />
                  </div>
                  <div>
                    <Label className="text-xs">E-mail *</Label>
                    <Input type="email" value={s.email} onChange={(e) => setSigners(signers.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                  </div>
                  <div>
                    <Label className="text-xs">CPF/CNPJ</Label>
                    <Input value={s.cpf_cnpj} onChange={(e) => setSigners(signers.map((x, j) => j === i ? { ...x, cpf_cnpj: e.target.value } : x))} />
                  </div>
                  <div>
                    <Label className="text-xs">Papel</Label>
                    <Select value={s.papel} onValueChange={(v: any) => setSigners(signers.map((x, j) => j === i ? { ...x, papel: v } : x))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contratante">Contratante</SelectItem>
                        <SelectItem value="contratada">Contratada</SelectItem>
                        <SelectItem value="testemunha">Testemunha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="outline" size="sm" onClick={() => setSigners([...signers, emptySig("testemunha")])} disabled={signers.length >= 10}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar signatário
            </Button>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={enviar} disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Enviar para assinatura
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
