import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, AlertTriangle, FileCheck, BarChart3, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/relatorio-financeiro")({
  component: RelatorioFinanceiroPage,
});

type Fatura = {
  id: string; numero: string; competencia: string; data_vencimento: string;
  data_pagamento: string | null; valor: number; valor_pago: number | null;
  status: string; cliente_id: string;
  clientes?: { razao_social: string; nome_fantasia: string | null; cidade: string | null } | null;
};

type Coleta = {
  id: string; data_agendada: string; status: string; peso_real: number | null;
  rota_codigo: string | null; cliente_id: string;
};

type Boletim = {
  id: string; data_coleta: string; peso_coletado: number; pagamento_confirmado: boolean;
  cdf_enviado: boolean; cliente_id: string;
  clientes?: { razao_social: string; nome_fantasia: string | null } | null;
};

function RelatorioFinanceiroPage() {
  const [mesInicio, setMesInicio] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [mesFim, setMesFim] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  });
  const [abaAtiva, setAbaAtiva] = useState<"resumo" | "clientes" | "rotas" | "inadimplencia">("resumo");

  const { data: faturas = [] } = useQuery({
    queryKey: ["rel-faturas", mesInicio, mesFim],
    queryFn: async () => {
      const { data } = await supabase
        .from("faturas")
        .select("*, clientes(razao_social, fantasia, cidade)")
        .gte("data_vencimento", mesInicio)
        .lte("data_vencimento", mesFim)
        .order("data_vencimento", { ascending: false });
      return (data ?? []) as Fatura[];
    },
  });

  const { data: coletas = [] } = useQuery({
    queryKey: ["rel-coletas", mesInicio, mesFim],
    queryFn: async () => {
      const { data } = await supabase
        .from("coletas")
        .select("id, data_agendada, status, peso_real, rota_codigo, cliente_id")
        .gte("data_agendada", mesInicio + "T00:00:00")
        .lte("data_agendada", mesFim + "T23:59:59");
      return (data ?? []) as Coleta[];
    },
  });

  const { data: boletins = [] } = useQuery({
    queryKey: ["rel-boletins", mesInicio, mesFim],
    queryFn: async () => {
      const { data } = await supabase
        .from("boletins_medicao")
        .select("id, data_coleta, peso_coletado, pagamento_confirmado, cdf_enviado, cliente_id, clientes(razao_social, nome_fantasia)")
        .gte("data_coleta", mesInicio)
        .lte("data_coleta", mesFim);
      return (data ?? []) as Boletim[];
    },
  });

  // Cálculos
  const totalFaturado = faturas.reduce((a, f) => a + Number(f.valor), 0);
  const totalRecebido = faturas.filter((f) => f.status === "pago").reduce((a, f) => a + Number(f.valor_pago ?? f.valor), 0);
  const totalInadimplente = faturas.filter((f) => f.status === "vencido").reduce((a, f) => a + Number(f.valor), 0);
  const totalPendente = faturas.filter((f) => f.status === "pendente").reduce((a, f) => a + Number(f.valor), 0);
  const totalKg = boletins.reduce((a, b) => a + Number(b.peso_coletado), 0);
  const coletasRealizadas = coletas.filter((c) => c.status === "realizada").length;
  const cdfsPendentes = boletins.filter((b) => b.pagamento_confirmado && !b.cdf_enviado).length;
  const aguardandoPgto = boletins.filter((b) => !b.pagamento_confirmado).length;

  // Por cliente
  const porCliente = faturas.reduce<Record<string, { nome: string; total: number; pago: number; pendente: number; vencido: number }>>((acc, f) => {
    const id = f.cliente_id;
    const nome = f.clientes?.nome_fantasia || f.clientes?.razao_social || id;
    if (!acc[id]) acc[id] = { nome, total: 0, pago: 0, pendente: 0, vencido: 0 };
    acc[id].total += Number(f.valor);
    if (f.status === "pago") acc[id].pago += Number(f.valor_pago ?? f.valor);
    else if (f.status === "pendente") acc[id].pendente += Number(f.valor);
    else if (f.status === "vencido") acc[id].vencido += Number(f.valor);
    return acc;
  }, {});
  const clientesOrdenados = Object.values(porCliente).sort((a, b) => b.total - a.total);

  // Por rota
  const porRota = coletas.reduce<Record<string, { nome: string; total: number; realizadas: number; pesoKg: number }>>((acc, c) => {
    const key = c.rota_codigo ?? "sem_rota";
    if (!acc[key]) acc[key] = { nome: key.replace(/_/g, " "), total: 0, realizadas: 0, pesoKg: 0 };
    acc[key].total++;
    if (c.status === "realizada") { acc[key].realizadas++; acc[key].pesoKg += Number(c.peso_real ?? 0); }
    return acc;
  }, {});
  const rotasOrdenadas = Object.values(porRota).sort((a, b) => b.realizadas - a.realizadas);

  // Inadimplentes
  const inadimplentes = Object.values(porCliente).filter((c) => c.vencido > 0).sort((a, b) => b.vencido - a.vencido);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const exportarCSV = () => {
    const rows = [
      ["Cliente", "Total Faturado", "Pago", "Pendente", "Vencido"],
      ...clientesOrdenados.map((c) => [c.nome, c.total, c.pago, c.pendente, c.vencido]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `relatorio-${mesInicio}-${mesFim}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Relatório Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Receita, inadimplência e performance por rota e cliente.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">De:</span>
            <Input type="date" value={mesInicio} onChange={(e) => setMesInicio(e.target.value)} className="w-36" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Até:</span>
            <Input type="date" value={mesFim} onChange={(e) => setMesFim(e.target.value)} className="w-36" />
          </div>
          <Button variant="outline" size="sm" onClick={exportarCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total faturado", val: fmt(totalFaturado), icon: TrendingUp, color: "text-primary", bg: "" },
          { label: "Total recebido", val: fmt(totalRecebido), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Inadimplência", val: fmt(totalInadimplente), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Pendente", val: fmt(totalPendente), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((k) => (
          <Card key={k.label} className={`p-4 ${k.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.val}</p>
              </div>
              <k.icon className={`h-7 w-7 opacity-20 ${k.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* KPIs operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Coletas realizadas", val: coletasRealizadas, color: "text-green-600" },
          { label: "Peso total (kg)", val: totalKg.toFixed(1), color: "text-primary" },
          { label: "CDFs p/ enviar", val: cdfsPendentes, color: "text-blue-600" },
          { label: "Aguard. pagamento", val: aguardandoPgto, color: "text-amber-600" },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.val}</p>
          </Card>
        ))}
      </div>

      {/* Barra de taxa de recebimento */}
      {totalFaturado > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Taxa de recebimento</span>
            <span className="text-sm font-bold text-green-600">{Math.round((totalRecebido / totalFaturado) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div className="h-full flex">
              <div className="bg-green-500 h-full transition-all" style={{ width: `${(totalRecebido / totalFaturado) * 100}%` }} />
              <div className="bg-amber-400 h-full transition-all" style={{ width: `${(totalPendente / totalFaturado) * 100}%` }} />
              <div className="bg-red-400 h-full transition-all" style={{ width: `${(totalInadimplente / totalFaturado) * 100}%` }} />
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Recebido</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Pendente</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Vencido</span>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b">
        {[
          { id: "resumo", label: "Resumo" },
          { id: "clientes", label: `Por cliente (${clientesOrdenados.length})` },
          { id: "rotas", label: `Por rota (${rotasOrdenadas.length})` },
          { id: "inadimplencia", label: `Inadimplência (${inadimplentes.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => setAbaAtiva(t.id as typeof abaAtiva)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${abaAtiva === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {abaAtiva === "resumo" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-4">Top 5 clientes por faturamento</h3>
            <div className="space-y-3">
              {clientesOrdenados.slice(0, 5).map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate font-medium flex-1 mr-2">{c.nome}</span>
                    <span className="font-bold text-primary flex-shrink-0">{fmt(c.total)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${totalFaturado > 0 ? (c.total / totalFaturado) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              {clientesOrdenados.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhum dado no período.</p>}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-4">Coletas por rota</h3>
            <div className="space-y-3">
              {rotasOrdenadas.slice(0, 5).map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium flex-1 mr-2">{r.nome}</span>
                    <span className="text-muted-foreground flex-shrink-0">{r.realizadas}/{r.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${r.total > 0 ? (r.realizadas / r.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              {rotasOrdenadas.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhum dado no período.</p>}
            </div>
          </Card>
        </div>
      )}

      {abaAtiva === "clientes" && (
        <Card>
          {clientesOrdenados.length === 0
            ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma fatura no período.</div>
            : <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">{["Cliente","Total","Pago","Pendente","Vencido","Status"].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {clientesOrdenados.map((c, i) => (
                    <tr key={i} className={`hover:bg-muted/30 ${c.vencido > 0 ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 font-medium text-sm">{c.nome}</td>
                      <td className="px-4 py-3 font-bold">{fmt(c.total)}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{c.pago > 0 ? fmt(c.pago) : "—"}</td>
                      <td className="px-4 py-3 text-amber-600">{c.pendente > 0 ? fmt(c.pendente) : "—"}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{c.vencido > 0 ? fmt(c.vencido) : "—"}</td>
                      <td className="px-4 py-3">
                        {c.vencido > 0 ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">Inadimplente</span>
                          : c.pendente > 0 ? <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Pendente</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">Em dia ✓</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      )}

      {abaAtiva === "rotas" && (
        <Card>
          {rotasOrdenadas.length === 0
            ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma coleta no período.</div>
            : <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">{["Rota","Total","Realizadas","Taxa","Peso (kg)"].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {rotasOrdenadas.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium capitalize">{r.nome}</td>
                      <td className="px-4 py-3">{r.total}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{r.realizadas}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${r.total > 0 ? (r.realizadas / r.total) * 100 : 0}%` }} /></div>
                          <span className="text-xs">{r.total > 0 ? Math.round((r.realizadas / r.total) * 100) : 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">{r.pesoKg.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      )}

      {abaAtiva === "inadimplencia" && (
        <div className="space-y-4">
          {inadimplentes.length === 0
            ? <Card className="p-12 text-center"><p className="text-sm text-muted-foreground">Nenhuma inadimplência no período. 🎉</p></Card>
            : <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">{inadimplentes.length} cliente(s) inadimplente(s)</p>
                    <p className="text-sm text-red-700 mt-0.5">Total em aberto: <strong>{fmt(totalInadimplente)}</strong></p>
                  </div>
                </div>
                <Card className="divide-y">
                  {inadimplentes.map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">Total faturado: {fmt(c.total)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{fmt(c.vencido)}</p>
                        <p className="text-xs text-muted-foreground">em atraso</p>
                      </div>
                    </div>
                  ))}
                </Card>
              </>
          }
        </div>
      )}
    </div>
  );
}
