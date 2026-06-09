import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Recycle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha — SIGER PRO" },
      { name: "description", content: "Crie uma nova senha de acesso ao SIGER PRO." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [emailCooldown, setEmailCooldown] = useState(0);

  useEffect(() => {
    const initRecovery = async () => {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = search.get("code");
      const isRecovery = search.get("type") === "recovery" || hash.get("type") === "recovery";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setMessage(error.message);
      }

      const { data } = await supabase.auth.getSession();
      setCanReset(Boolean(data.session) || isRecovery || Boolean(code));
      setReady(true);
    };

    initRecovery();
  }, []);

  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = window.setTimeout(() => setEmailCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [emailCooldown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return toast.error(error.message);
    toast.success("Senha redefinida. Faça login novamente.");
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  const onSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (emailCooldown > 0) {
      setMessageType("error");
      setMessage(`Aguarde ${emailCooldown}s antes de solicitar outro link.`);
      return;
    }
    if (!trimmedEmail) {
      setMessageType("error");
      setMessage("Digite seu e-mail para receber o link de redefinição.");
      return;
    }

    setEmailLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setEmailLoading(false);

    if (error) {
      const text = error.message.includes("58 seconds") || error.message.includes("security purposes")
        ? "Aguarde cerca de 1 minuto antes de pedir outro link. O primeiro link já foi enviado."
        : error.message;
      if (text.includes("1 minuto")) setEmailCooldown(60);
      setMessageType("error");
      setMessage(text);
      toast.error(text);
      return;
    }

    const text = "Link enviado. Verifique seu e-mail e abra o link para cadastrar a nova senha.";
    setEmailCooldown(60);
    setMessageType("success");
    setMessage(text);
    toast.success(text);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-subtle)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-4 text-primary-foreground" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}>
            <Recycle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">SIGER PRO</h1>
          <p className="text-sm text-muted-foreground mt-1">Redefinir senha de acesso</p>
        </div>

        <Card className="p-6">
          {!canReset && ready ? (
            <form onSubmit={onSendRecoveryEmail} className="space-y-4">
              {message && (
                <div className={`rounded-md border px-3 py-2 text-sm ${messageType === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"}`}>
                  {message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail</Label>
                <Input id="recovery-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <Button type="submit" className="w-full" disabled={emailLoading || emailCooldown > 0}>
                {emailLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {emailCooldown > 0 ? `Aguarde ${emailCooldown}s` : "Enviar link de redefinição"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => router.navigate({ to: "/auth" })}>
                Voltar para login
              </Button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-pass">Nova senha</Label>
                <Input id="new-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirmar senha</Label>
                <Input id="confirm-pass" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}