import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Truck, Scale, Calendar, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type KPI = { clientes: number; coletasHoje: number; coletasMes: number; pesoMes: number };

function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<{ kpi: KPI; porDia: { dia: string; coletas: number }[]; porGrupo: { name: string; value: number }[] }> => {
      const today = new Date();
      const startMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const startDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

      const [clientesRes, coletasMesRes, coletasHojeRes] = await Promise.all([
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase.from("coletas").select("id, data_agendada, peso_real, quantidade_prevista, grupo_residuo").gte("data_agendada", startMonth),
        supabase.from("coletas").select("id", { count: "exact", head: true }).gte("data_agendada", startDay),
      ]);

      const coletasMes = coletasMesRes.data ?? [];
      const pesoMes = coletasMes.reduce((s, c) => s + Number(c.peso_real ?? c.quantidade_prevista ?? 0), 0);

      const byDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        byDay[d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })] = 0;
      }
      coletasMes.forEach((c) => {
        const k = new Date(c.data_agendada).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        if (k in byDay) byDay[k]++;
      });

      const byGrupo: Record<string, number> = {};
      coletasMes.forEach((c) => {
        const g = c.grupo_residuo || "Não classificado";
        byGrupo[g] = (byGrupo[g] || 0) + 1;
      });

      return {
        kpi: {
          clientes: clientesRes.count ?? 0,
          coletasHoje: coletasHojeRes.count ?? 0,
          coletasMes: coletasMes.length,
          pesoMes: Math.round(pesoMes),
        },
        porDia: Object.entries(byDay).map(([dia, coletas]) => ({ dia, coletas })),
        porGrupo: Object.entries(byGrupo).map(([name, value]) => ({ name, value })),
      };
    },
  });
}

const COLORS = ["oklch(0.32 0.07 160)", "oklch(0.68 0.16 162)", "oklch(0.55 0.12 200)", "oklch(0.78 0.16 80)", "oklch(0.6 0.22 27)"];

function Dashboard() {
  const { data, isLoading } = useDashboard();

  const kpis = [
    { label: "Clientes ativos", value: data?.kpi.clientes ?? 0, icon: Users, accent: "text-primary" },
    { label: "Coletas hoje", value: data?.kpi.coletasHoje ?? 0, icon: Calendar, accent: "text-primary-glow" },
    { label: "Coletas no mês", value: data?.kpi.coletasMes ?? 0, icon: Truck, accent: "text-chart-3" },
    { label: "Peso no mês (kg)", value: (data?.kpi.pesoMes ?? 0).toLocaleString("pt-BR"), icon: Scale, accent: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Executivo</h1>
        <p className="text-sm text-muted-foreground">Visão geral da operação em tempo real.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <p className="text-3xl font-bold mt-2 text-foreground">{isLoading ? "—" : k.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg bg-accent flex items-center justify-center ${k.accent}`}>
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Coletas — últimos 7 dias</h2>
              <p className="text-xs text-muted-foreground">Volume diário de operações</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary-glow" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.porDia ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 240)" />
                <XAxis dataKey="dia" stroke="oklch(0.5 0.015 240)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.015 240)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.005 240)" }} />
                <Bar dataKey="coletas" fill="oklch(0.68 0.16 162)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-foreground">Por grupo de resíduo</h2>
          <p className="text-xs text-muted-foreground mb-4">Distribuição no mês</p>
          <div className="h-72">
            {data?.porGrupo.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.porGrupo} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {data.porGrupo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Nenhuma coleta no mês
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
