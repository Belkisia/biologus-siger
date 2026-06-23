import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Loader2, ShieldCheck, ShieldOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/usuarios")({
  component: UsuariosPage,
});

type AppRole = "admin" | "diretor" | "financeiro" | "comercial" | "operacional" | "motorista" | "cliente";

const ROLES: { value: AppRole; label: string; desc: string }[] = [
  { value: "admin", label: "Administrador", desc: "Acesso total ao sistema" },
  { value: "diretor", label: "Diretor", desc: "Visão estratégica e relatórios" },
  { value: "financeiro", label: "Financeiro", desc: "Faturas, recebimentos e contratos" },
  { value: "comercial", label: "Comercial", desc: "Clientes e contratos" },
  { value: "operacional", label: "Operacional", desc: "Coletas, MTR e CDF" },
  { value: "motorista", label: "Motorista", desc: "Coletas atribuídas" },
  { value: "cliente", label: "Cliente", desc: "Portal do cliente" },
];

const ROLE_LABEL: Record<AppRole, string> = Object.fromEntries(ROLES.map((r) => [r.value, r.label])) as Record<AppRole, string>;

type Profile = { id: string; email: string | null; full_name: string | null; created_at: string };
type UserRole = { id: string; user_id: string; role: AppRole };

function UsuariosPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();

  const { data: profiles = [], isLoading: lp } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const { data: roles = [], isLoading: lr } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return (data ?? []) as UserRole[];
    },
  });

  const { data: myRoles = [] } = useQuery({
    queryKey: ["my-roles", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });

  const isAdmin = myRoles.includes("admin");

  const rolesByUser = useMemo(() => {
    const map: Record<string, AppRole[]> = {};
    for (const r of roles) (map[r.user_id] ||= []).push(r.role);
    return map;
  }, [roles]);

  const addRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Papel atribuído");
      qc.invalidateQueries({ queryKey: ["user-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Papel removido");
      qc.invalidateQueries({ queryKey: ["user-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = lp || lr;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-7 w-7 text-primary" /> Usuários & Permissões
          </h1>
          <p className="text-muted-foreground">Gestão de papéis (RBAC) — controle granular de acesso aos módulos</p>
        </div>
        <Card className="p-3 flex items-center gap-2 text-sm">
          {isAdmin ? <ShieldCheck className="h-4 w-4 text-primary" /> : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
          <span>
            Você é <strong>{isAdmin ? "Administrador" : "usuário padrão"}</strong>
            {!isAdmin && " — apenas administradores podem alterar papéis"}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ROLES.map((r) => (
          <Card key={r.value} className="p-3">
            <p className="text-sm font-semibold">{r.label}</p>
            <p className="text-xs text-muted-foreground">{r.desc}</p>
          </Card>
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Papéis</TableHead>
              <TableHead className="w-64">Atribuir papel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin inline" /></TableCell></TableRow>}
            {!loading && profiles.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum usuário cadastrado</TableCell></TableRow>
            )}
            {profiles.map((p) => {
              const userRoles = rolesByUser[p.id] ?? [];
              const available = ROLES.filter((r) => !userRoles.includes(r.value));
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.full_name ?? "—"}
                    {p.id === user.id && <Badge variant="outline" className="ml-2">você</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.email ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {userRoles.length === 0 && <span className="text-xs text-muted-foreground">sem papel</span>}
                      {userRoles.map((role) => {
                        const r = roles.find((x) => x.user_id === p.id && x.role === role);
                        return (
                          <Badge key={role} variant="secondary" className="gap-1">
                            {ROLE_LABEL[role]}
                            {isAdmin && r && (
                              <button
                                type="button"
                                onClick={() => removeRole.mutate(r.id)}
                                className="ml-1 hover:text-destructive"
                                aria-label="Remover papel"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isAdmin && available.length > 0 ? (
                      <Select onValueChange={(v) => addRole.mutate({ user_id: p.id, role: v as AppRole })}>
                        <SelectTrigger>
                          <span className="flex items-center gap-2 text-sm">
                            <Plus className="h-3 w-3" /> Adicionar papel
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {available.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">{!isAdmin ? "—" : "todos atribuídos"}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4 bg-muted/30">
        <p className="text-sm font-semibold mb-1">Sobre o RBAC</p>
        <p className="text-xs text-muted-foreground">
          Os papéis são armazenados em tabela dedicada (<code>user_roles</code>) com função <code>has_role()</code> security-definer,
          prevenindo escalação de privilégios. Cada novo usuário recebe automaticamente o papel <strong>operacional</strong>.
        </p>
      </Card>
    </div>
  );
}
