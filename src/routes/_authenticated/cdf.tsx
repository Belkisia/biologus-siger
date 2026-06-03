import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileCheck, Loader2, Trash2 } from "lucide-react";
import { DocumentUpload, OpenDocumentButton } from "@/components/document-upload";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cdf")({
  component: CDFPage,
});

type CDF = {
  id: string;
  mtr_id: string;
  numero: string;
  data_destinacao: string;
  tecnologia: string | null;
  destinador: string | null;
  quantidade_destinada: number | null;
  url_documento: string | null;
  observacoes: string | null;
  mtrs?: { numero: string; descricao_residuo: string; clientes?: { razao_social: string } | null } | null;
};

const TECNOLOGIAS = ["Aterro Industrial", "Incineração", "Co-processamento", "Reciclagem", "Compostagem", "Autoclavagem", "Tratamento Químico"];

function CDFPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [docPath, setDocPath] = useState<string | null>(null);
  const { user } = Route.useRouteContext();

  const { data: mtrs = [] } = useQuery({
    queryKey: ["mtrs-select"],
    queryFn: async () => {
      const { data } = await supabase.from("mtrs").select("id, numero, descricao_residuo").order("data_emissao", { ascending: false });
      return data ?? [];
    },
  });

  const { data: cdfs = [], isLoading } = useQuery({
    queryKey: ["cdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cdfs")
        .select("*, mtrs(numero, descricao_residuo, clientes(razao_social))")
        .order("data_destinacao", { ascending: false });
      if (error) throw error;
      return data as CDF[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const row = { ...payload, owner_id: user.id } as never;
      const { error } = await supabase.from("cdfs").insert(row);
      if (error) throw error;
      if (payload.mtr_id) {
        await supabase.from("mtrs").update({ status: "destinado" }).eq("id", payload.mtr_id as string);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cdfs"] });
      qc.invalidateQueries({ queryKey: ["mtrs"] });
      toast.success("CDF emitido");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cdfs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cdfs"] });
      toast.success("CDF removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    if (!payload.mtr_id || !payload.numero || !payload.data_destinacao) {
      return toast.error("Preencha MTR, número e data de destinação");
    }
    if (payload.quantidade_destinada) payload.quantidade_destinada = Number(payload.quantidade_destinada);
    payload.url_documento = docPath;
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CDF — Certificados de Destinação Final</h1>
          <p className="text-sm text-muted-foreground">Comprovação ambiental da destinação adequada dos resíduos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={mtrs.length === 0}>
              <Plus className="h-4 w-4 mr-2" />Emitir CDF
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Novo certificado</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>MTR vinculado *</Label>
                  <Select name="mtr_id" required>
                    <SelectTrigger><SelectValue placeholder="Selecione o MTR" /></SelectTrigger>
                    <SelectContent>
                      {mtrs.map((m) => <SelectItem key={m.id} value={m.id}>{m.numero} — {m.descricao_residuo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Nº CDF *</Label>
                  <Input id="numero" name="numero" required placeholder="CDF-2026-0001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_destinacao">Data de destinação *</Label>
                  <Input id="data_destinacao" name="data_destinacao" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Tecnologia</Label>
                  <Select name="tecnologia">
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TECNOLOGIAS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinador">Destinador</Label>
                  <Input id="destinador" name="destinador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade_destinada">Quantidade destinada (kg)</Label>
                  <Input id="quantidade_destinada" name="quantidade_destinada" type="number" step="0.001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url_documento">URL do documento (PDF)</Label>
                  <Input id="url_documento" name="url_documento" type="url" placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" name="observacoes" rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Emitir
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {mtrs.length === 0 && (
        <Card className="p-4 bg-warning/10 border-warning/30">
          <p className="text-sm">Registre um MTR antes de emitir certificados.</p>
        </Card>
      )}

      <Card className="p-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : cdfs.length === 0 ? (
          <div className="py-16 text-center">
            <FileCheck className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum certificado emitido.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº CDF</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>MTR</TableHead>
                <TableHead>Gerador</TableHead>
                <TableHead>Tecnologia</TableHead>
                <TableHead>Qtd. destinada</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cdfs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.numero}</TableCell>
                  <TableCell className="text-sm">{new Date(c.data_destinacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-sm">{c.mtrs?.numero ?? "—"}</TableCell>
                  <TableCell className="text-sm">{c.mtrs?.clientes?.razao_social ?? "—"}</TableCell>
                  <TableCell className="text-sm">{c.tecnologia ?? "—"}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{c.quantidade_destinada ? `${Number(c.quantidade_destinada)} kg` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {c.url_documento && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={c.url_documento} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (confirm(`Remover CDF ${c.numero}?`)) deleteMutation.mutate(c.id);
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
