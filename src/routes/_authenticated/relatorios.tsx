import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: RelatoriosPage,
});

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))", "hsl(var(--warning))"];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(";"), ...rows.map((r) => headers.map((h) => esc(r[h])).join(";"))].join("\n");
}

function downloadCSV(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return toast.error("Sem dados para exportar");
  const blob = new Blob(["\uFEFF" + toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RelatoriosPage() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1).toISOString().slice(0, 10);
  const fimMes = hoje.toISOString().slice(0, 10);
  const [from, setFrom] = useState(inicioMes);
  const [to, setTo] = useState(fimMes);

  const { data: coletas = [], isLoading: l1 } = useQuery({
    queryKey: ["rel-coletas", from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coletas")
        .select("data_agendada, grupo_residuo, peso_real, quantidade_prevista, status, clientes(razao_social)")
        .gte("data_agendada", from)
        .lte("data_agendada", to + "T23:59:59");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: mtrs = [], isLoading: l2 } = useQuery({
    queryKey: ["rel-mtrs", from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mtrs")
        .select("data_emissao, classe_ibama, tecnologia_destinacao, quantidade, unidade, status, clientes(razao_social)")
        .gte("data_emissao", from).lte("data_emissao", to);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: faturas = [], isLoading: l3 } = useQuery({
    queryKey: ["rel-faturas", from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("competencia, data_emissao, data_vencimento, data_pagamento, valor, valor_pago, status, clientes(razao_social)")
        .gte("data_emissao", from).lte("data_emissao", to);
      if (error) throw error;
      return data ?? [];
    },
  });

  const isLoading = l1 || l2 || l3;

  // --- Operacional: volume por mês ---
  const volumePorMes = useMemo(() => {
    const map = new Map<string, number>();
    coletas.forEach((c) => {
      const m = c.data_agendada.slice(0, 7);
      const peso = Number(c.peso_real ?? c.quantidade_prevista ?? 0);
      map.set(m, (map.get(m) ?? 0) + peso);
    });
    return Array.from(map.entries()).sort().map(([mes, kg]) => ({ mes, kg: Number(kg.toFixed(2)) }));
  }, [coletas]);

  const porGrupo = useMemo(() => {
    const map = new Map<string, number>();
    coletas.forEach((c) => {
      const g = c.grupo_residuo ?? "Não classificado";
      map.set(g, (map.get(g) ?? 0) + Number(c.peso_real ?? c.quantidade_prevista ?? 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  }, [coletas]);

  // --- Ambiental: MTR por classe e tecnologia ---
  const porClasse = useMemo(() => {
    const map = new Map<string, number>();
    mtrs.forEach((m) => {
      const k = m.classe_ibama ?? "Não classificado";
      map.set(k, (map.get(k) ?? 0) + Number(m.quantidade ?? 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  }, [mtrs]);

  const porTecnologia = useMemo(() => {
    const map = new Map<string, number>();
    mtrs.forEach((m) => {
      const k = m.tecnologia_destinacao ?? "Não informada";
      map.set(k, (map.get(k) ?? 0) + Number(m.quantidade ?? 0));
    });
    return Array.from(map.entries()).map(([tec, kg]) => ({ tec, kg: Number(kg.toFixed(2)) }));
  }, [mtrs]);

  // --- Financeiro: faturado vs recebido por competência ---
  const finPorMes = useMemo(() => {
    const map = new Map<string, { faturado: number; recebido: number }>();
    faturas.forEach((f) => {
      const k = f.competencia ?? f.data_emissao.slice(0, 7);
      const cur = map.get(k) ?? { faturado: 0, recebido: 0 };
      cur.faturado += Number(f.valor ?? 0);
      if (f.status === "paga") cur.recebido += Number(f.valor_pago ?? 0);
      map.set(k, cur);
    });
    return Array.from(map.entries()).sort().map(([mes, v]) => ({
      mes, faturado: Number(v.faturado.toFixed(2)), recebido: Number(v.recebido.toFixed(2)),
    }));
  }, [faturas]);

  const totalFaturado = faturas.reduce((a, f) => a + Number(f.valor ?? 0), 0);
  const totalRecebido = faturas.filter((f) => f.status === "paga").reduce((a, f) => a + Number(f.valor_pago ?? 0), 0);
  const totalKgColetado = coletas.reduce((a, c) => a + Number(c.peso_real ?? c.quantidade_prevista ?? 0), 0);
  const totalKgMTR = mtrs.reduce((a, m) => a + Number(m.quantidade ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Indicadores operacionais, ambientais e financeiros.</p>
      </div>

      <Card className="p-4">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="from">Período de</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">até</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${coletas.length} coletas · ${mtrs.length} MTRs · ${faturas.length} faturas`}
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Coletado (kg)</p>
          <p className="text-2xl font-bold mt-1">{totalKgColetado.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Manifestado (kg)</p>
          <p className="text-2xl font-bold mt-1">{totalKgMTR.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Faturado</p>
          <p className="text-2xl font-bold mt-1">{brl(totalFaturado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Recebido</p>
          <p className="text-2xl font-bold mt-1 text-primary">{brl(totalRecebido)}</p>
        </Card>
      </div>

      <Tabs defaultValue="operacional">
        <TabsList>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="ambiental">Ambiental</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="operacional" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Volume coletado por mês (kg)</h3>
              <Button variant="outline" size="sm" onClick={() => downloadCSV("volume_por_mes", volumePorMes)}>
                <Download className="h-4 w-4 mr-2" />CSV
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={volumePorMes}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="kg" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Distribuição por grupo de resíduo</h3>
              <Button variant="outline" size="sm" onClick={() => downloadCSV("por_grupo", porGrupo)}>
                <Download className="h-4 w-4 mr-2" />CSV
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={porGrupo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {porGrupo.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="ambiental" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">MTR por classe IBAMA (kg)</h3>
              <Button variant="outline" size="sm" onClick={() => downloadCSV("mtr_por_classe", porClasse)}>
                <Download className="h-4 w-4 mr-2" />CSV
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={porClasse} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {porClasse.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Destinação por tecnologia (kg)</h3>
              <Button variant="outline" size="sm" onClick={() => downloadCSV("tecnologia_destinacao", porTecnologia)}>
                <Download className="h-4 w-4 mr-2" />CSV
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porTecnologia} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="tec" type="category" width={140} className="text-xs" />
                <Tooltip />
                <Bar dataKey="kg" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Faturado vs Recebido por competência</h3>
              <Button variant="outline" size="sm" onClick={() => downloadCSV("faturado_recebido", finPorMes)}>
                <Download className="h-4 w-4 mr-2" />CSV
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={finPorMes}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend />
                <Line type="monotone" dataKey="faturado" stroke={CHART_COLORS[0]} strokeWidth={2} />
                <Line type="monotone" dataKey="recebido" stroke={CHART_COLORS[1]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Detalhamento de faturas</h3>
              <Button variant="outline" size="sm" onClick={() => downloadCSV("faturas", faturas as unknown as Record<string, unknown>[])}>
                <Download className="h-4 w-4 mr-2" />Exportar tudo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas.slice(0, 20).map((f, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{f.competencia}</TableCell>
                    <TableCell className="text-sm">{f.clientes?.razao_social ?? "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(f.data_vencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{brl(Number(f.valor))}</TableCell>
                    <TableCell className="text-sm">{f.valor_pago ? brl(Number(f.valor_pago)) : "—"}</TableCell>
                    <TableCell className="text-sm capitalize">{f.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
