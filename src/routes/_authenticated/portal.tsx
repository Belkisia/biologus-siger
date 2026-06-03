import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Truck, FileText, FileCheck, DollarSign, Shield, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal")({
  component: PortalPage,
});

const brl = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dt = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString("pt-BR") : "—");

function PortalPage() {
  const { user } = Route.useRouteContext();

  const { data: cliente, isLoading: lc } = useQuery({
    queryKey: ["portal-cliente", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  const cid = cliente?.id;

  const { data: coletas = [] } = useQuery({
    queryKey: ["portal-coletas", cid],
    enabled: !!cid,
    queryFn: async () => {
      const { data } = await supabase
        .from("coletas")
        .select("*")
        .eq("cliente_id", cid!)
        .order("data_agendada", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const { data: mtrs = [] } = useQuery({
    queryKey: ["portal-mtrs", cid],
    enabled: !!cid,
    queryFn: async () => {
      const { data } = await supabase
        .from("mtrs")
        .select("*")
        .eq("cliente_id", cid!)
        .order("data_emissao", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const { data: cdfs = [] } = useQuery({
    queryKey: ["portal-cdfs", cid],
    enabled: !!cid,
    queryFn: async () => {
      const { data } = await supabase
        .from("cdfs")
        .select("*, mtrs(numero,cliente_id)")
        .order("data_destinacao", { ascending: false })
        .limit(50);
      return (data ?? []).filter((c) => c.mtrs?.cliente_id === cid);
    },
  });

  const { data: faturas = [] } = useQuery({
    queryKey: ["portal-faturas", cid],
    enabled: !!cid,
    queryFn: async () => {
      const { data } = await supabase
        .from("faturas")
        .select("*")
        .eq("cliente_id", cid!)
        .order("data_vencimento", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const { data: licencas = [] } = useQuery({
    queryKey: ["portal-licencas", cid],
    enabled: !!cid,
    queryFn: async () => {
      const { data } = await supabase
        .from("licencas")
        .select("*")
        .eq("cliente_id", cid!)
        .order("data_validade", { ascending: true });
      return data ?? [];
    },
  });

  if (lc) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin inline" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center max-w-xl mx-auto">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Portal não disponível</h2>
          <p className="text-sm text-muted-foreground">
            Seu usuário <strong>{user.email}</strong> ainda não está vinculado a um cadastro de cliente.
            Solicite ao administrador o vínculo da sua conta.
          </p>
        </Card>
      </div>
    );
  }

  const aberto = faturas.filter((f) => f.status !== "pago" && f.status !== "cancelada");
  const totalAberto = aberto.reduce((s, f) => s + Number(f.valor ?? 0), 0);
  const hoje = new Date().toISOString().slice(0, 10);
  const licVencendo = licencas.filter((l) => l.data_validade <= new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" /> Portal do Cliente
        </h1>
        <p className="text-muted-foreground">{cliente.razao_social} {cliente.cnpj && `· CNPJ ${cliente.cnpj}`}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> Coletas</p>
          <p className="text-2xl font-bold">{coletas.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> MTRs</p>
          <p className="text-2xl font-bold">{mtrs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Faturas em aberto</p>
          <p className="text-2xl font-bold">{brl(totalAberto)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Licenças vencendo (90d)</p>
          <p className="text-2xl font-bold">{licVencendo.length}</p>
        </Card>
      </div>

      <Tabs defaultValue="coletas">
        <TabsList>
          <TabsTrigger value="coletas">Coletas</TabsTrigger>
          <TabsTrigger value="mtrs">MTRs</TabsTrigger>
          <TabsTrigger value="cdfs">CDFs</TabsTrigger>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="licencas">Licenças</TabsTrigger>
        </TabsList>

        <TabsContent value="coletas">
          <Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead>Qtd (kg)</TableHead><TableHead>Observações</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {coletas.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sem coletas</TableCell></TableRow>}
                {coletas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{dt(c.data_agendada)}</TableCell>
                    <TableCell><Badge variant="secondary">{c.status ?? "—"}</Badge></TableCell>
                    <TableCell>{c.quantidade_total ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{c.observacoes ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="mtrs">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Emissão</TableHead><TableHead>Classe</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {mtrs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sem MTRs</TableCell></TableRow>}
                {mtrs.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.numero}</TableCell>
                    <TableCell>{dt(m.data_emissao)}</TableCell>
                    <TableCell>{m.classe_ibama ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{m.status ?? "—"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="cdfs">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Destinação</TableHead><TableHead>Destinador</TableHead><TableHead>Tecnologia</TableHead></TableRow></TableHeader>
              <TableBody>
                {cdfs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sem CDFs</TableCell></TableRow>}
                {cdfs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.numero}</TableCell>
                    <TableCell>{dt(c.data_destinacao)}</TableCell>
                    <TableCell>{c.destinador ?? "—"}</TableCell>
                    <TableCell>{c.tecnologia ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="faturas">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Vencimento</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {faturas.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sem faturas</TableCell></TableRow>}
                {faturas.map((f) => {
                  const vencida = f.data_vencimento < hoje && f.status !== "pago";
                  return (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-xs">{f.numero ?? f.id.slice(0, 8)}</TableCell>
                      <TableCell className={vencida ? "text-destructive font-medium" : ""}>{dt(f.data_vencimento)}</TableCell>
                      <TableCell>{brl(Number(f.valor))}</TableCell>
                      <TableCell><Badge variant={f.status === "pago" ? "default" : vencida ? "destructive" : "secondary"}>{f.status ?? "—"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="licencas">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Tipo</TableHead><TableHead>Órgão</TableHead><TableHead>Validade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {licencas.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Sem licenças</TableCell></TableRow>}
                {licencas.map((l) => {
                  const vencida = l.data_validade < hoje;
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.numero ?? "—"}</TableCell>
                      <TableCell>{l.tipo}</TableCell>
                      <TableCell>{l.orgao_emissor ?? "—"}</TableCell>
                      <TableCell className={vencida ? "text-destructive font-medium" : ""}>{dt(l.data_validade)}</TableCell>
                      <TableCell><Badge variant={vencida ? "destructive" : "secondary"}>{l.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
