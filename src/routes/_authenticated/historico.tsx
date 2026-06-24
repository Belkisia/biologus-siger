import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, FileText, FileCheck, Scale, DollarSign, Search, TrendingUp, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/historico")({
  component: HistoricoPage,
});

type Cliente = { id: string; razao_social: string; fantasia: string | null; cidade: string | null; cnpj: string | null; email: string | null; whatsapp: string | null };
type Coleta = { id: string; data_agendada: string; status: string; tipo_residuo: string; peso_real: number | null; rota_codigo: string | null };
type MTR = { id: string; numero: string; data_emissao: string; status: string; quantidade: number; unidade: string; descricao_residuo: string };
type CDF = { id: string; numero: string; data_destinacao: string; tecnologia: string | null; quantidade_destinada: number | null; enviado: boolean | null };
type Boletim = { id: string; data_coleta: string; peso_coletado: number; status: string; pagamento_confirmado: boolean; cdf_enviado: boolean };
type Fatura = { id: string; numero: string; competencia: string; data_vencimento: string; valor: number; status: string };

const STATUS_BADGE: Record<string, string> = {
  realizada: "bg-green-100 text-green-800", agendada: "bg-blue-100 text-blue-800",
  cancelada: "bg-red-100 text-red-800", nao_coletada: "bg-orange-100 text-orange-800",
  emitido: "bg-blue-100 text-blue-800", destinado: "bg-green-100 text-green-800",
  pago: "bg-green-100 text-green-800", pendente: "bg-amber-100 text-amber-800",
  vencido: "bg-red-100 text-red-800",
};

function HistoricoPage() {
  const [clienteId, setClienteId] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<"coletas" | "mtrs" | "cdfs" | "boletins" | "faturas">("coletas");

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social, fantasia, cidade, cnpj, email, whatsapp").eq("ativo", true).order('razao_social', { ascending: true });
      return (data ?? []) as Cliente[];
    },
  });

  const cliente = clientes.find((c) => c.id === clienteId);

  const { data: coletas = [] } = useQuery({
    queryKey: ["hist-coletas", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data } = await supabase.from("coletas").select("id, data_agendada, status, tipo_residuo, peso_real, rota_codigo").eq("cliente_id", clienteId).order("data_agendada", { ascending: false });
      return (data ?? []) as Coleta[];
    },
  });

  const { data: mtrs = [] } = useQuery({
    queryKey: ["hist-mtrs", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data } = await supabase.from("mtrs").select("id, numero, data_emissao, status, quantidade, unidade, descricao_residuo").eq("cliente_id", clienteId).order("data_emissao", { ascending: false });
      return (data ?? []) as MTR[];
    },
  });

  const { data: cdfs = [] } = useQuery({
    queryKey: ["hist-cdfs", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data } = await supabase
        .from("cdfs")
        .select("id, numero, data_destinacao, tecnologia, quantidade_destinada, enviado, mtrs!inner(cliente_id)")
        .eq("mtrs.cliente_id", clienteId)
        .order("data_destinacao", { ascending: false });
      return (data ?? []) as CDF[];
    },
  });

  const { data: boletins = [] } = useQuery({
    queryKey: ["hist-boletins", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data } = await supabase.from("boletins_medicao").select("id, data_coleta, peso_coletado, status, pagamento_confirmado, cdf_enviado").eq("cliente_id", clienteId).order("data_coleta", { ascending: false });
      return (data ?? []) as Boletim[];
    },
  });

  const { data: faturas = [] } = useQuery({
    queryKey: ["hist-faturas", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const { data } = await supabase.from("faturas").select("id, numero, competencia, data_vencimento, valor, status").eq("cliente_id", clienteId).order("data_vencimento", { ascending: false });
      return (data ?? []) as Fatura[];
    },
  });

  const clientesFiltrados = clientes.filter((c) => {
    const t = busca.toLowerCase();
    return !t || (c.fantasia ?? c.razao_social).toLowerCase().includes(t) || (c.cidade ?? "").toLowerCase().includes(t);
  });

  const totalKg = boletins.reduce((a, b) => a + Number(b.peso_coletado), 0);
  const totalFaturado = faturas.reduce((a, f) => a + Number(f.valor), 0);
  const totalPago = faturas.filter((f) => f.status === "pago").reduce((a, f) => a + Number(f.valor), 0);
  const inadimplente = faturas.filter((f) => f.status === "vencido").reduce((a, f) => a + Number(f.valor), 0);

  const abas = [
    { id: "coletas" as const, label: `Coletas (${coletas.length})`, icon: Truck },
    { id: "mtrs" as const, label: `MTRs (${mtrs.length})`, icon: FileText },
    { id: "cdfs" as const, label: `CDFs (${cdfs.length})`, icon: FileCheck },
    { id: "boletins" as const, label: `Boletins (${boletins.length})`, icon: Scale },
    { id: "faturas" as const, label: `Faturas (${faturas.length})`, icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" /> Histórico por Cliente
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Coletas, MTRs, CDFs, boletins e faturas de cada cliente em um só lugar.</p>
      </div>

      {/* Seletor de cliente */}
      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
        {busca && clientesFiltrados.length > 0 && !clienteId && (
          <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
            {clientesFiltrados.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50"
                onClick={() => { setClienteId(c.id); setBusca(""); }}>
                <div>
                  <p className="text-sm font-medium">{c.fantasia || c.razao_social}</p>
                  <p className="text-xs text-muted-foreground">{c.cidade} · {c.cnpj}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {clienteId && !busca && (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
            <div>
              <p className="font-medium text-sm">{cliente?.fantasia || cliente?.razao_social}</p>
              <p className="text-xs text-muted-foreground">{cliente?.cidade} · {cliente?.cnpj}</p>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setClienteId("")}>Trocar</button>
          </div>
        )}
      </Card>

      {clienteId && (
        <>
          {/* KPIs do cliente */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Coletas realizadas", val: coletas.filter((c) => c.status === "realizada").length, icon: Truck, color: "text-green-600" },
              { label: "Peso total coletado", val: `${totalKg.toFixed(1)} kg`, icon: Scale, color: "text-primary" },
              { label: "Total faturado", val: `R$ ${totalFaturado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-teal-600" },
              { label: "Inadimplência", val: inadimplente > 0 ? `R$ ${inadimplente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", icon: DollarSign, color: inadimplente > 0 ? "text-red-600" : "text-muted-foreground" },
            ].map((k) => (
              <Card key={k.label} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${k.color}`}>{k.val}</p>
                </div>
                <k.icon className={`h-7 w-7 opacity-20 ${k.color}`} />
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b overflow-x-auto">
            {abas.map((t) => (
              <button key={t.id} onClick={() => setAbaAtiva(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${abaAtiva === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{t.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas */}
          <Card>
            {abaAtiva === "coletas" && (
              coletas.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma coleta registrada.</div> :
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">{["Data","Status","Resíduo","Peso","Rota"].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {coletas.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5">{new Date(c.data_agendada).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-700"}`}>{c.status}</span></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.tipo_residuo}</td>
                      <td className="px-4 py-2.5 font-medium">{c.peso_real ? `${c.peso_real} kg` : "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{c.rota_codigo?.replace(/_/g," ") ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {abaAtiva === "mtrs" && (
              mtrs.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhum MTR registrado.</div> :
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">{["Nº MTR","Data","Resíduo","Qtd.","Status"].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {mtrs.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{m.numero}</td>
                      <td className="px-4 py-2.5">{new Date(m.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-48 truncate">{m.descricao_residuo}</td>
                      <td className="px-4 py-2.5 font-semibold text-primary">{Number(m.quantidade) > 0 ? `${m.quantidade} ${m.unidade}` : "—"}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[m.status] ?? "bg-gray-100 text-gray-700"}`}>{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {abaAtiva === "cdfs" && (
              cdfs.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhum CDF emitido.</div> :
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">{["Nº CDF","Data","Tecnologia","Qtd.","Enviado"].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {cdfs.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{c.numero}</td>
                      <td className="px-4 py-2.5">{new Date(c.data_destinacao + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.tecnologia ?? "—"}</td>
                      <td className="px-4 py-2.5 font-semibold">{c.quantidade_destinada ? `${c.quantidade_destinada} kg` : "—"}</td>
                      <td className="px-4 py-2.5">{c.enviado ? <span className="text-xs text-green-600 font-medium">✓ Sim</span> : <span className="text-xs text-amber-600">Pendente</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {abaAtiva === "boletins" && (
              boletins.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhum boletim registrado.</div> :
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">{["Data","Peso","Status","Pagamento","CDF"].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {boletins.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5">{new Date(b.data_coleta + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5 font-bold text-primary">{b.peso_coletado} kg</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[b.status] ?? "bg-gray-100 text-gray-700"}`}>{b.status}</span></td>
                      <td className="px-4 py-2.5">{b.pagamento_confirmado ? <span className="text-xs text-green-600 font-medium">✓ Confirmado</span> : <span className="text-xs text-amber-600">Pendente</span>}</td>
                      <td className="px-4 py-2.5">{b.cdf_enviado ? <span className="text-xs text-green-600 font-medium">✓ Enviado</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {abaAtiva === "faturas" && (
              faturas.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma fatura registrada.</div> :
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">{["Nº Fatura","Competência","Vencimento","Valor","Status"].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {faturas.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{f.numero}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{f.competencia}</td>
                      <td className="px-4 py-2.5">{new Date(f.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2.5 font-bold">R$ {Number(f.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[f.status] ?? "bg-gray-100 text-gray-700"}`}>{f.status}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t bg-muted/30">
                  <td colSpan={3} className="px-4 py-2.5 text-xs font-medium text-right text-muted-foreground">Total faturado:</td>
                  <td className="px-4 py-2.5 font-bold text-primary">R$ {totalFaturado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-xs text-green-600 font-medium">Pago: R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                </tr></tfoot>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
