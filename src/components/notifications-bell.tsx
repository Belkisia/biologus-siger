import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, AlertTriangle, Shield, DollarSign, Loader2, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Notif = {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  ref_tabela: string | null;
  ref_id: string | null;
  lida: boolean;
  prioridade: "baixa" | "media" | "alta";
  created_at: string;
};

const iconFor = (tipo: string) => {
  if (tipo.startsWith("licenca")) return Shield;
  if (tipo.startsWith("fatura")) return DollarSign;
  return AlertTriangle;
};

const linkFor = (n: Notif) => {
  if (n.ref_tabela === "licencas") return "/licencas";
  if (n.ref_tabela === "faturas") return "/financeiro";
  return "/dashboard";
};

export function NotificationsBell() {
  const qc = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as Notif[];
    },
    refetchInterval: 60_000,
  });

  const unread = notifs.filter((n) => !n.lida).length;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notificacoes"] }),
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("lida", false);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notificações marcadas como lidas");
      qc.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });

  const gerarAgora = useMutation({
    mutationFn: async () => {
      // Insere notificações via SQL inline através de uma chamada direta às tabelas:
      // como a função pública é restrita ao service_role, geramos no client filtrando por owner.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sem sessão");
      const hoje = new Date().toISOString().slice(0, 10);
      const limite30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      const limite7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      const [licRes, fatRes, existRes] = await Promise.all([
        supabase.from("licencas").select("id,numero,tipo,data_validade,status").lte("data_validade", limite30),
        supabase.from("faturas").select("id,numero,data_vencimento,valor,status").lte("data_vencimento", limite7),
        supabase.from("notificacoes").select("ref_tabela,ref_id,created_at"),
      ]);
      if (licRes.error) throw licRes.error;
      if (fatRes.error) throw fatRes.error;
      if (existRes.error) throw existRes.error;

      const jaHoje = new Set(
        (existRes.data ?? [])
          .filter((n) => n.created_at?.slice(0, 10) === hoje)
          .map((n) => `${n.ref_tabela}:${n.ref_id}`),
      );

      type NotifInsert = {
        owner_id: string;
        tipo: string;
        titulo: string;
        mensagem: string;
        ref_tabela: string;
        ref_id: string;
        prioridade: "alta" | "media" | "baixa";
      };
      const rows: NotifInsert[] = [];

      for (const l of licRes.data ?? []) {
        if (l.status === "cancelada") continue;
        if (jaHoje.has(`licencas:${l.id}`)) continue;
        const vencida = l.data_validade < hoje;
        const limite15 = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
        rows.push({
          owner_id: user.id,
          tipo: vencida ? "licenca_vencida" : "licenca_vencendo",
          titulo: `Licença ${l.numero ?? "(sem número)"} - ${l.tipo}`,
          mensagem: `Validade: ${new Date(l.data_validade).toLocaleDateString("pt-BR")}`,
          ref_tabela: "licencas",
          ref_id: l.id,
          prioridade: vencida || l.data_validade <= limite15 ? "alta" : "media",
        });
      }
      for (const f of fatRes.data ?? []) {
        if (f.status === "pago" || f.status === "cancelada") continue;
        if (jaHoje.has(`faturas:${f.id}`)) continue;
        const vencida = f.data_vencimento < hoje;
        rows.push({
          owner_id: user.id,
          tipo: vencida ? "fatura_vencida" : "fatura_vencendo",
          titulo: `Fatura ${f.numero ?? f.id.slice(0, 8)}`,
          mensagem: `Vencimento: ${new Date(f.data_vencimento).toLocaleDateString("pt-BR")} - R$ ${Number(f.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          ref_tabela: "faturas",
          ref_id: f.id,
          prioridade: vencida ? "alta" : "media",
        });
      }

      if (rows.length === 0) return 0;
      const { error } = await supabase.from("notificacoes").insert(rows);
      if (error) throw error;
      return rows.length;
    },

    onSuccess: (n) => {
      toast.success(n ? `${n} notificação(ões) geradas` : "Nada novo para notificar");
      qc.invalidateQueries({ queryKey: ["notificacoes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <p className="font-semibold text-sm">Notificações</p>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => gerarAgora.mutate()} disabled={gerarAgora.isPending} title="Verificar vencimentos agora">
              {gerarAgora.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
            </Button>
            {unread > 0 && (
              <Button size="sm" variant="ghost" onClick={() => markAll.mutate()}>
                <CheckCheck className="h-3 w-3 mr-1" /> Tudo lido
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {isLoading && <div className="p-6 text-center"><Loader2 className="h-4 w-4 animate-spin inline" /></div>}
          {!isLoading && notifs.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
          )}
          <div className="divide-y">
            {notifs.map((n) => {
              const Icon = iconFor(n.tipo);
              return (
                <Link
                  key={n.id}
                  to={linkFor(n)}
                  onClick={() => !n.lida && markRead.mutate(n.id)}
                  className={`flex gap-3 p-3 hover:bg-muted/50 transition ${!n.lida ? "bg-muted/30" : ""}`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${n.prioridade === "alta" ? "text-destructive" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{n.titulo}</p>
                      {!n.lida && <Badge variant="default" className="h-1.5 w-1.5 p-0 rounded-full shrink-0 mt-1.5" />}
                    </div>
                    {n.mensagem && <p className="text-xs text-muted-foreground">{n.mensagem}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
