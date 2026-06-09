import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recycle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — SIGER PRO" },
      { name: "description", content: "Acesse o Sistema Inteligente de Gerenciamento de Resíduos." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetCooldown, setResetCooldown] = useState(0);
  const resetEmailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.navigate({ to: "/dashboard" });
    });
  }, [router]);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = window.setTimeout(() => setResetCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resetCooldown]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      const text = error.message.toLowerCase().includes("invalid") ? "E-mail ou senha inválidos." : error.message;
      setMessage({ type: "error", text });
      return toast.error(text);
    }
    if (!data.session) {
      setMessage({ type: "error", text: "Login não confirmou a sessão. Tente novamente." });
      return;
    }
    toast.success("Bem-vindo!");
    await router.invalidate();
    router.navigate({ to: "/dashboard", replace: true });
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Você já pode entrar.");
  };

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setLoading(false);
      return toast.error("Falha ao entrar com Google");
    }
    if (result.redirected) return;
    router.navigate({ to: "/dashboard" });
  };

  const onResetPassword = async () => {
    const trimmedEmail = email.trim();
    setMessage(null);
    if (resetCooldown > 0) {
      const text = `Aguarde ${resetCooldown}s antes de solicitar outro link.`;
      setMessage({ type: "error", text });
      return;
    }
    if (!trimmedEmail) {
      const text = "Digite seu e-mail para redefinir a senha.";
      setMessage({ type: "error", text });
      toast.error(text);
      return;
    }

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);

    if (error) {
      const text = error.message.toLowerCase().includes("security purposes") || error.message.toLowerCase().includes("only request this")
        ? "O link já foi solicitado. Aguarde 1 minuto antes de tentar novamente e verifique sua caixa de entrada e spam."
        : error.message;
      if (text.includes("Aguarde 1 minuto")) setResetCooldown(60);
      setMessage({ type: "error", text });
      return toast.error(text);
    }
    setResetCooldown(60);
    const text = "Enviamos o link de redefinição para seu e-mail. Abra o e-mail e cadastre a nova senha.";
    setMessage({ type: "success", text });
    toast.success(text);
  };

  const openResetTab = () => {
    setAuthTab("reset");
    setMessage(null);
    window.requestAnimationFrame(() => resetEmailInputRef.current?.focus());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-subtle)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-4 text-primary-foreground" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}>
            <Recycle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">SIGER PRO</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistema Inteligente de Gerenciamento de Resíduos</p>
        </div>

        <Card className="p-6">
          <Tabs value={authTab} onValueChange={(value) => { setAuthTab(value); setMessage(null); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="reset">Redefinir senha</TabsTrigger>
            </TabsList>

            {message && (
              <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${message.type === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"}`}>
                {message.text}
              </div>
            )}

            <TabsContent value="login" className="mt-0">
              <form onSubmit={onSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">E-mail</Label>
                  <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pass">Senha</Label>
                  <Input id="si-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <button
                  type="button"
                  onClick={openResetTab}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-mail</Label>
                  <Input ref={resetEmailInputRef} id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <Button type="button" className="w-full" onClick={onResetPassword} disabled={resetLoading || loading || resetCooldown > 0}>
                  {resetLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {resetCooldown > 0 ? `Aguarde ${resetCooldown}s` : "Enviar link de redefinição"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={loading}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
