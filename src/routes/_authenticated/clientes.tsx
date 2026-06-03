import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Building2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clientes")({
  component: ClientesPage,
});

type Cliente = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  status: string;
  created_at: string;
};

function ClientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = Route.useRouteContext();

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id } as never;
      const { error } = await supabase.from("clientes").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente cadastrado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente removido");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v) payload[k] = v; });
    createMutation.mutate(payload);
  };

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.razao_social.toLowerCase().includes(q) || c.cnpj.includes(q) || (c.nome_fantasia ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">Cadastro completo de empresas geradoras.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo cliente</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field name="razao_social" label="Razão Social *" required />
                <Field name="nome_fantasia" label="Nome Fantasia" />
                <Field name="cnpj" label="CNPJ *" required placeholder="00.000.000/0000-00" />
                <Field name="inscricao_estadual" label="Inscrição Estadual" />
                <Field name="cnae" label="CNAE" />
                <Field name="porte" label="Porte" />
                <Field name="responsavel_tecnico" label="Resp. Técnico" />
                <Field name="responsavel_financeiro" label="Resp. Financeiro" />
                <Field name="email" label="E-mail" type="email" />
                <Field name="telefone" label="Telefone" />
                <Field name="whatsapp" label="WhatsApp" />
                <Field name="cep" label="CEP" />
                <Field name="endereco" label="Endereço" />
                <Field name="numero" label="Número" />
                <Field name="bairro" label="Bairro" />
                <Field name="cidade" label="Cidade" />
                <Field name="estado" label="UF" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" rows={3} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por razão social, fantasia ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{c.razao_social}</div>
                    {c.nome_fantasia && <div className="text-xs text-muted-foreground">{c.nome_fantasia}</div>}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{c.cnpj}</TableCell>
                  <TableCell className="text-sm">{[c.cidade, c.estado].filter(Boolean).join(" / ") || "—"}</TableCell>
                  <TableCell className="text-sm">{c.email || c.telefone || "—"}</TableCell>
                  <TableCell><Badge variant={c.status === "ativo" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Remover este cliente?")) deleteMutation.mutate(c.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function Field({ name, label, ...rest }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...rest} />
    </div>
  );
}
