import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck, CheckCircle2, Circle, Clock, AlertTriangle,
  MapPin, Scale, FileText, Send, RefreshCw, ChevronDown, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel")({
  component: PainelPage,
});

type Coleta = {
  id: string; cliente_id: string; data_agendada: string; status: string;
  motorista: string | null; veiculo: string | null; peso_real: number | null;
  rota_codigo: string | null; rota_id: string | null;
  clientes?: { razao_social: string; fantasia: string | null; logradouro: string | null; cidade: string | null } | null;
};

type Boletim = {
  id: string; cliente_id: string; data_coleta: string; peso_coletado: number;
  status: string; pagamento_confirmado: boolean; cdf_enviado: boolean;
  clientes?: { razao_social: string; fantasia: string | null } | null;
  mtrs?: { numero: string } | null;
};

const STATUS_COLETA: Record<string, { label: string; color: string; icon: typeof Circle }> = {
  agendada:    { label: "Agendada",    color: "text-blue-600",   icon: Clock },
  em_rota:     { label: "Em Rota",     color: "text-amber-600",  icon: Truck },
  realizada:   { label: "Realizada",   color: "text-green-600",  icon: CheckCircle2 },
  nao_coletada:{ label: "Não coletada",color: "text-red-600",    icon: AlertTriangle },
  cancelada:   { label: "Cancelada",   color: "text-gray-400",   icon: Circle },
};

export default function PainelPage() {
  const qc = useQueryClient();
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});

  const dataInicio = data + "T00:00:00";
  const dataFim = data + "T23:59:59";

  const { data: coletas = [], isLoading: loadColetas } = useQuery({
    queryKey: ["painel-coletas", data],
    queryFn: async () => {
      const { data: d } = await supabase
        .from("coletas")
        .select("*, clientes(razao_social, fantasia, logradouro, cidade)")
        .gte("data_agendada", dataInicio)
        .lte("data_agendada", dataFim)
        .order("data_agendada");
      return (d ?? []) as Coleta[];
    },
  });

  const { data: boletins = [], isLoading: loadBoletins } = useQuery({
    queryKey: ["painel-boletins", data],
    queryFn: async () => {
      const { data: d } = await supabase
        .from("boletins_medicao")
        .select("*, clientes(razao_social, fantasia), mtrs(numero)")
        .eq("data_coleta", data)
        .order("created_at", { ascending: false });
      return (d ?? []) as Boletim[];
    },
  });

  const { data: mtrsAbertos = [] } = useQuery({
    queryKey: ["painel-mtrs", data],
    queryFn: async () => {
      const { data: d } = await supabase
        .from("mtrs")
        .select("id, numero, status, clientes(razao_social, fantasia)")
        .in("status", ["emitido", "em_transporte"])
        .gte("data_emissao", data)
        .lte("data_emissao", data);
      return d ?? [];
    },
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("coletas").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["painel-coletas"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  // Agrupar coletas por rota
  const coletasPorRota = coletas.reduce<Record<string, Coleta[]>>((acc, c) => {
    const key = c.rota_codigo ?? "sem_rota";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const kpis = {
    total: coletas.length,
    realizadas: coletas.filter((c) => c.status === "realizada").length,
    emRota: coletas.filter((c) => c.status === "em_rota").length,
    pendentes: coletas.filter((c) => c.status === "agendada").length,
    naoColetadas: coletas.filter((c) => c.status === "nao_coletada").length,
    boletinsHoje: boletins.length,
    aguardandoPgto: boletins.filter((b) => !b.pagamento_confirmado).length,
    cdfsPendentes: boletins.filter((b) => b.pagamento_confirmado && !b.cdf_enviado).length,
  };

  const pesoTotal = boletins.reduce((a, b) => a + Number(b.peso_coletado), 0);
  const progresso = kpis.total > 0 ? Math.round((kpis.realizadas / kpis.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Painel do Dia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhamento em tempo real das coletas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-40" />
          <Button variant="outline" size="icon" onClick={() => qc.invalidateQueries()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progresso */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso do dia</span>
          <span className="text-sm font-bold text-primary">{progresso}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{kpis.realizadas} realizadas</span>
          <span>{kpis.total} total</span>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total agendadas", val: kpis.total, color: "text-foreground", bg: "" },
          { label: "Em rota agora", val: kpis.emRota, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Realizadas", val: kpis.realizadas, color: "text-green-600", bg: "bg-green-50" },
          { label: "Não coletadas", val: kpis.naoColetadas, color: "text-red-600", bg: "bg-red-50" },
        ].map((k) => (
          <Card key={k.label} className={`p-4 ${k.bg}`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.val}</p>
          </Card>
        ))}
      </div>

      {/* Boletins KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Boletins hoje", val: kpis.boletinsHoje, icon: Scale, color: "text-primary" },
          { label: "Peso coletado", val: `${pesoTotal.toFixed(1)} kg`, icon: Scale, color: "text-teal-600" },
          { label: "Aguard. pagamento", val: kpis.aguardandoPgto, icon: AlertTriangle, color: "text-amber-600" },
          { label: "CDFs p/ enviar", val: kpis.cdfsPendentes, icon: Send, color: "text-blue-600" },
        ].map((k) => (
          <Card key={k.label} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
            </div>
            <k.icon className={`h-7 w-7 opacity-20 ${k.color}`} />
          </Card>
        ))}
      </div>

      {/* Alertas */}
      {(kpis.aguardandoPgto > 0 || kpis.cdfsPendentes > 0 || kpis.naoColetadas > 0) && (
        <div className="space-y-2">
          {kpis.naoColetadas > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span><strong>{kpis.naoColetadas}</strong> coleta(s) não realizadas hoje — verificar com o motorista</span>
            </div>
          )}
          {kpis.aguardandoPgto > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span><strong>{kpis.aguardandoPgto}</strong> boletim(ns) aguardando confirmação de pagamento — CDF retido</span>
            </div>
          )}
          {kpis.cdfsPendentes > 0 && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <Send className="h-4 w-4 flex-shrink-0" />
              <span><strong>{kpis.cdfsPendentes}</strong> CDF(s) prontos para enviar ao cliente — pagamento confirmado</span>
            </div>
          )}
        </div>
      )}

      {/* Coletas por rota */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Coletas por rota</h2>
        {loadColetas ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : coletas.length === 0 ? (
          <Card className="p-12 text-center">
            <Truck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma coleta agendada para esta data.</p>
            <p className="text-xs text-muted-foreground mt-1">Use a aba Agendamento para criar coletas em lote.</p>
          </Card>
        ) : (
          Object.entries(coletasPorRota).map(([rota, items]) => {
            const aberto = expandido[rota] !== false;
            const realizadas = items.filter((c) => c.status === "realizada").length;
            return (
              <Card key={rota} className="overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandido((e) => ({ ...e, [rota]: !aberto }))}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{rota === "sem_rota" ? "Sem rota definida" : rota.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                    <span className="text-xs text-muted-foreground">{items.length} clientes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 bg-muted rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${items.length > 0 ? (realizadas / items.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{realizadas}/{items.length}</span>
                    </div>
                    {aberto ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
                {aberto && (
                  <div className="border-t divide-y">
                    {items.map((c, i) => {
                      const st = STATUS_COLETA[c.status] ?? STATUS_COLETA.agendada;
                      const Icon = st.icon;
                      return (
                        <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                          <Icon className={`h-4 w-4 flex-shrink-0 ${st.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.clientes?.fantasia || c.clientes?.razao_social}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.clientes?.logradouro}{c.clientes?.cidade ? ` — ${c.clientes.cidade}` : ""}</p>
                          </div>
                          {c.peso_real && <span className="text-xs font-semibold text-primary">{c.peso_real} kg</span>}
                          <div className="flex gap-1">
                            {c.status !== "realizada" && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-green-700 hover:bg-green-50"
                                onClick={() => atualizarStatus.mutate({ id: c.id, status: "realizada" })}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Realizada
                              </Button>
                            )}
                            {c.status === "agendada" && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-700 hover:bg-amber-50"
                                onClick={() => atualizarStatus.mutate({ id: c.id, status: "em_rota" })}>
                                <Truck className="h-3.5 w-3.5 mr-1" /> Em rota
                              </Button>
                            )}
                            {c.status !== "cancelada" && c.status !== "realizada" && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-red-700 hover:bg-red-50"
                                onClick={() => atualizarStatus.mutate({ id: c.id, status: "nao_coletada" })}>
                                Não coletada
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Boletins do dia */}
      {boletins.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Boletins de Medição — {data}</h2>
          <Card className="divide-y">
            {boletins.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                <Scale className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.clientes?.fantasia || b.clientes?.razao_social}</p>
                  <p className="text-xs text-muted-foreground">{b.mtrs?.numero} · {b.peso_coletado} kg</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {b.cdf_enviado
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">CDF enviado ✓</span>
                    : b.pagamento_confirmado
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">CDF pronto</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Aguard. pgto</span>
                  }
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
