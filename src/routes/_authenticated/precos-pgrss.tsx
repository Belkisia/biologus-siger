import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { obterPrecosPgrss, salvarPrecosPgrss } from "@/lib/pgrss.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/precos-pgrss")({
  component: PrecosPgrssPage,
});

type Form = {
  preco_elaboracao: string;
  preco_visita_tecnica: string;
  preco_deslocamento_km: string;
  preco_art: string;
  preco_treinamento: string;
  preco_atualizacao_anual: string;
  preco_consultoria_mensal: string;
  multiplicador_pequeno: string;
  multiplicador_medio: string;
  multiplicador_grande: string;
};

const fields: { key: keyof Form; label: string; help?: string }[] = [
  { key: "preco_elaboracao", label: "Elaboração do PGRSS (R$)", help: "Valor base, antes do multiplicador de porte" },
  { key: "preco_visita_tecnica", label: "Visita técnica (R$ / visita)" },
  { key: "preco_deslocamento_km", label: "Deslocamento (R$ / km)" },
  { key: "preco_art", label: "ART (R$)" },
  { key: "preco_treinamento", label: "Treinamento (R$ / turma)" },
  { key: "preco_atualizacao_anual", label: "Atualização anual (R$)" },
  { key: "preco_consultoria_mensal", label: "Consultoria mensal (R$ / mês)" },
  { key: "multiplicador_pequeno", label: "Multiplicador — Pequeno porte" },
  { key: "multiplicador_medio", label: "Multiplicador — Médio porte" },
  { key: "multiplicador_grande", label: "Multiplicador — Grande porte" },
];

function PrecosPgrssPage() {
  const carregar = useServerFn(obterPrecosPgrss);
  const salvar = useServerFn(salvarPrecosPgrss);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregar().then((d) => {
      setForm({
        preco_elaboracao: String(d.preco_elaboracao),
        preco_visita_tecnica: String(d.preco_visita_tecnica),
        preco_deslocamento_km: String(d.preco_deslocamento_km),
        preco_art: String(d.preco_art),
        preco_treinamento: String(d.preco_treinamento),
        preco_atualizacao_anual: String(d.preco_atualizacao_anual),
        preco_consultoria_mensal: String(d.preco_consultoria_mensal),
        multiplicador_pequeno: String(d.multiplicador_pequeno),
        multiplicador_medio: String(d.multiplicador_medio),
        multiplicador_grande: String(d.multiplicador_grande),
      });
    });
  }, [carregar]);

  const submit = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload: Record<string, number> = {};
      (Object.keys(form) as (keyof Form)[]).forEach((k) => {
        payload[k] = Number(form[k].replace(",", "."));
      });
      await salvar({ data: payload as never });
      toast.success("Tabela de preços salva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="p-6 text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tabela de preços — PGRSS</h1>
          <p className="text-sm text-muted-foreground">
            Usada pelo motor de cálculo do Gerador de Propostas PGRSS.
          </p>
        </div>
        <Link to="/propostas/pgrss/nova">
          <Button variant="outline">Ir para o gerador</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valores base e multiplicadores</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                inputMode="decimal"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
              {f.help && <p className="text-[11px] text-muted-foreground">{f.help}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={saving}>
          {saving ? "Salvando…" : "Salvar preços"}
        </Button>
      </div>
    </div>
  );
}
