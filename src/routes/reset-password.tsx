import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const hasRecoveryToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.hash.replace(/^#/, "")).get("type") === "recovery";
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

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
          {!hasRecoveryToken && ready ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Abra esta tela pelo link enviado ao seu e-mail.</p>
              <Button type="button" className="w-full" onClick={() => router.navigate({ to: "/auth" })}>
                Voltar para login
              </Button>
            </div>
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