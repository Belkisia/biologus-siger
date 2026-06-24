import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Users, Trash2, Loader2, ChevronDown, ChevronRight, CalendarDays, Layers } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/rotas")({
  component: RotasPage,
});

type Rota = {
  id: string; nome: string; codigo: string; semana: string;
  dias_semana: string[] | null; duracao_dias: number; carro: string | null;
  ativo: boolean; observacoes: string | null;
  rota_clientes?: { id: string; ordem: number; frequencia: string; clientes: { id: string; razao_social: string; fantasia: string | null; cidade: string | null } | null }[];
};

type Cliente = { id: string; razao_social: string; fantasia: string | null; cidade: string | null };

const SEMANAS = ["S1", "S2", "S3", "S4", "Semanal", "Quinzenal", "01/07"];
const DIAS = ["seg", "ter", "qua", "qui", "sex", "sab"];
const SEMANA_COLOR: Record<string, string> = {
  S1: "bg-blue-100 text-blue-800", S2: "bg-teal-100 text-teal-800",
  S3: "bg-amber-100 text-amber-800", S4: "bg-purple-100 text-purple-800",
  Semanal: "bg-green-100 text-green-800", Quinzenal: "bg-pink-100 text-pink-800",
  "01/07": "bg-red-100 text-red-800",
};

// Rotas pré-definidas do sistema
const ROTAS_PADRAO = [
  { nome: "Centro / Aeroporto", codigo: "centro_aeroporto", semana: "S1", duracao_dias: 2, carro: "A/B", dias_semana: ["seg", "ter"] },
  { nome: "Campinas e Região", codigo: "campinas", semana: "S1", duracao_dias: 2, carro: "A", dias_semana: ["seg", "ter"] },
  { nome: "Vila Mutirão / Curitiba / Balneário", codigo: "vila_mutirao", semana: "S1", duracao_dias: 2, carro: "B", dias_semana: ["seg", "ter"] },
  { nome: "Senador Canedo + Bela Vista", codigo: "senador_canedo", semana: "S1", duracao_dias: 1, carro: "A", dias_semana: ["qua"] },
  { nome: "Nova Veneza + Nerópolis", codigo: "nova_veneza", semana: "S1", duracao_dias: 1, carro: "B", dias_semana: ["qua"] },
  { nome: "Setor Bueno + Oeste", codigo: "setor_bueno", semana: "S2", duracao_dias: 2, carro: "A", dias_semana: ["seg", "ter"] },
  { nome: "Setor Sul", codigo: "setor_sul", semana: "S2", duracao_dias: 1, carro: "A", dias_semana: ["qua"] },
  { nome: "Trindade", codigo: "trindade", semana: "S2", duracao_dias: 1, carro: "B", dias_semana: ["seg"] },
  { nome: "Itaberaí", codigo: "itaberai", semana: "S2", duracao_dias: 2, carro: "B", dias_semana: ["seg", "ter"] },
  { nome: "Quirinópolis + Itumbiara", codigo: "quirinopolis", semana: "S2", duracao_dias: 1, carro: "B", dias_semana: ["qua"] },
  { nome: "Morrinhos + Catalão", codigo: "morrinhos", semana: "S2", duracao_dias: 1, carro: "B", dias_semana: ["qui"] },
  { nome: "Aparecida de Goiânia", codigo: "aparecida", semana: "S3", duracao_dias: 2, carro: "A", dias_semana: ["seg", "ter"] },
  { nome: "Caldas Novas", codigo: "caldas_novas", semana: "S3", duracao_dias: 1, carro: "B", dias_semana: ["seg"] },
  { nome: "Anápolis", codigo: "anapolis", semana: "S3", duracao_dias: 1, carro: "B", dias_semana: ["ter"] },
  { nome: "Abadia / Guapó / Aragoiânia", codigo: "abadia_guapo", semana: "S3", duracao_dias: 1, carro: "A", dias_semana: ["qua"] },
  { nome: "Iporá e Região", codigo: "ipora", semana: "S3", duracao_dias: 2, carro: "B", dias_semana: ["seg", "ter"] },
  { nome: "Inhumas / Goianira / Caturaí", codigo: "inhumas", semana: "S4", duracao_dias: 2, carro: "A", dias_semana: ["seg", "ter"] },
  { nome: "Vera Cruz / Parque Oeste / Santa Rita", codigo: "vera_cruz", semana: "S4", duracao_dias: 1, carro: "B", dias_semana: ["seg"] },
  { nome: "Brasília", codigo: "brasilia", semana: "01/07", duracao_dias: 2, carro: "B", dias_semana: ["ter", "qua"] },
  { nome: "Rio Verde", codigo: "rio_verde", semana: "Semanal", duracao_dias: 1, carro: "A", dias_semana: ["seg", "qua", "sex"] },
  { nome: "Veterinária Quinzenal", codigo: "veterinaria", semana: "Quinzenal", duracao_dias: 1, carro: "B", dias_semana: ["ter"] },
];

function RotasPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [openNova, setOpenNova] = useState(false);
  const [openClientes, setOpenClientes] = useState<Rota | null>(null);
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});
  const [clientesBusca, setClientesBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [diasForm, setDiasForm] = useState<string[]>([]);

  const { data: rotas = [], isLoading } = useQuery({
    queryKey: ["rotas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rotas")
        .select("*, rota_clientes(id, ordem, frequencia, clientes(id, razao_social, fantasia, cidade))")
        .eq("ativo", true)
        .order("semana");
      if (error) throw error;
      return data as Rota[];
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data } = await supabase.from("clientes").select("id, razao_social, fantasia, cidade").eq("ativo", true).order('razao_social', { ascending: true });
      return (data ?? []) as Cliente[];
    },
  });

  const criarRota = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await supabase.from("rotas").insert([{ ...payload, owner_id: user.id, dias_semana: diasForm }] as never[]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rotas"] }); toast.success("Rota criada"); setOpenNova(false); setDiasForm([]); },
    onError: (e: Error) => toast.error(e.message),
  });

  const importarRotasPadrao = useMutation({
    mutationFn: async () => {
      const rows = ROTAS_PADRAO.map((r) => ({ ...r, owner_id: user.id, ativo: true }));
      const { error } = await supabase.from("rotas").upsert(rows as never[], { onConflict: "owner_id,codigo" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rotas"] }); toast.success(`${ROTAS_PADRAO.length} rotas importadas`); },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirRota = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rotas").update({ ativo: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rotas"] }); toast.success("Rota removida"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const vincularClientes = useMutation({
    mutationFn: async () => {
      if (!openClientes) return;
      const rows = selecionados.map((cid, i) => ({
        owner_id: user.id,
        rota_id: openClientes.id,
        cliente_id: cid,
        ordem: i + 1,
        frequencia: "semanal",
      }));
      const { error } = await supabase.from("rota_clientes").upsert(rows as never[], { onConflict: "rota_id,cliente_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rotas"] });
      toast.success(`${selecionados.length} clientes vinculados`);
      setOpenClientes(null);
      setSelecionados([]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removerCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rota_clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rotas"] }); toast.success("Cliente removido da rota"); },
  });

  const rotasPorSemana = rotas.reduce<Record<string, Rota[]>>((acc, r) => {
    if (!acc[r.semana]) acc[r.semana] = [];
    acc[r.semana].push(r);
    return acc;
  }, {});

  const clientesFiltrados = clientes.filter((c) => {
    const t = clientesBusca.toLowerCase();
    return !t || (c.fantasia ?? c.razao_social).toLowerCase().includes(t) || (c.cidade ?? "").toLowerCase().includes(t);
  });

  const clientesJaVinculados = new Set(openClientes?.rota_clientes?.map((rc) => rc.clientes?.id).filter(Boolean) ?? []);

  const handleSubmitRota = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== "") payload[k] = v; });
    payload.duracao_dias = Number(payload.duracao_dias ?? 1);
    criarRota.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Gestão de Rotas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Cadastre rotas, vincule clientes e controle frequências.</p>
        </div>
        <div className="flex gap-2">
          {rotas.length === 0 && (
            <Button variant="outline" onClick={() => importarRotasPadrao.mutate()} disabled={importarRotasPadrao.isPending}>
              {importarRotasPadrao.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Layers className="h-4 w-4 mr-2" />}
              Importar rotas padrão
            </Button>
          )}
          <Button onClick={() => setOpenNova(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova rota
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Rotas ativas", val: rotas.length },
          { label: "Total de clientes", val: rotas.reduce((a, r) => a + (r.rota_clientes?.length ?? 0), 0) },
          { label: "Sem clientes", val: rotas.filter((r) => !r.rota_clientes?.length).length },
          { label: "Carros", val: "A + B" },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
            <p className="text-2xl font-bold mt-1 text-primary">{k.val}</p>
          </Card>
        ))}
      </div>

      {/* Rotas por semana */}
      {isLoading ? (
        <div className="py-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
      ) : rotas.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma rota cadastrada.</p>
          <p className="text-xs text-muted-foreground mt-1">Clique em "Importar rotas padrão" para carregar todas as rotas do sistema.</p>
          <Button className="mt-4" onClick={() => importarRotasPadrao.mutate()} disabled={importarRotasPadrao.isPending}>
            {importarRotasPadrao.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Importar rotas padrão
          </Button>
        </Card>
      ) : (
        Object.entries(rotasPorSemana).map(([semana, items]) => (
          <div key={semana}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEMANA_COLOR[semana] ?? "bg-gray-100 text-gray-800"}`}>{semana}</span>
              <span className="text-sm text-muted-foreground">{items.length} rota(s)</span>
            </div>
            <div className="space-y-2">
              {items.map((r) => {
                const aberto = expandido[r.id];
                const nClientes = r.rota_clientes?.length ?? 0;
                return (
                  <Card key={r.id} className="overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      <button className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        onClick={() => setExpandido((e) => ({ ...e, [r.id]: !e[r.id] }))}>
                        {aberto ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{r.nome}</span>
                            {r.carro && <Badge variant="outline" className="text-xs">{r.carro}</Badge>}
                            <Badge variant="outline" className="text-xs">{r.duracao_dias}d</Badge>
                            {r.dias_semana?.map((d) => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Users className="h-3 w-3 inline mr-1" />{nClientes} clientes vinculados
                          </p>
                        </div>
                      </button>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" className="h-8 text-xs"
                          onClick={() => { setOpenClientes(r); setSelecionados(r.rota_clientes?.map((rc) => rc.clientes?.id ?? "").filter(Boolean) ?? []); }}>
                          <Users className="h-3.5 w-3.5 mr-1" /> Clientes
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                          onClick={() => { if (confirm(`Remover rota "${r.nome}"?`)) excluirRota.mutate(r.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {aberto && nClientes > 0 && (
                      <div className="border-t bg-muted/20 divide-y">
                        {r.rota_clientes?.sort((a, b) => a.ordem - b.ordem).map((rc, i) => (
                          <div key={rc.id} className="flex items-center gap-3 px-4 py-2.5">
                            <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{rc.clientes?.fantasia || rc.clientes?.razao_social}</p>
                              <p className="text-xs text-muted-foreground">{rc.clientes?.cidade} · <span className={`font-medium ${rc.frequencia === "semanal" ? "text-green-600" : rc.frequencia === "quinzenal" ? "text-blue-600" : "text-amber-600"}`}>{rc.frequencia}</span></p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => removerCliente.mutate(rc.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {aberto && nClientes === 0 && (
                      <div className="border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                        Nenhum cliente vinculado. Clique em "Clientes" para adicionar.
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Dialog: Nova rota */}
      <Dialog open={openNova} onOpenChange={setOpenNova}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Nova Rota</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitRota} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2"><Label>Nome da rota *</Label><Input name="nome" required placeholder="ex: Setor Oeste" /></div>
              <div className="space-y-1.5 col-span-2"><Label>Código *</Label><Input name="codigo" required placeholder="ex: setor_oeste" /></div>
              <div className="space-y-1.5">
                <Label>Semana</Label>
                <Select name="semana" defaultValue="S1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEMANAS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Duração (dias)</Label><Input name="duracao_dias" type="number" min="1" max="7" defaultValue="1" /></div>
              <div className="space-y-1.5">
                <Label>Carro</Label>
                <Select name="carro">
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{["A","B","A/B"].map((c) => <SelectItem key={c} value={c}>Carro {c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dias da semana</Label>
                <div className="flex gap-1 flex-wrap mt-1">
                  {DIAS.map((d) => (
                    <button key={d} type="button"
                      onClick={() => setDiasForm((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${diasForm.includes(d) ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenNova(false)}>Cancelar</Button>
              <Button type="submit" disabled={criarRota.isPending}>
                {criarRota.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Vincular clientes */}
      {openClientes && (
        <Dialog open={!!openClientes} onOpenChange={() => { setOpenClientes(null); setSelecionados([]); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> {openClientes.nome}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 flex-1 overflow-hidden flex flex-col py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selecionados.length} selecionado(s)</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelecionados(clientes.map((c) => c.id))}>Todos</Button>
                  <Button size="sm" variant="outline" onClick={() => setSelecionados([])}>Limpar</Button>
                </div>
              </div>
              <Input placeholder="Buscar cliente..." value={clientesBusca} onChange={(e) => setClientesBusca(e.target.value)} />
              <div className="flex-1 overflow-y-auto border rounded-md divide-y">
                {clientesFiltrados.map((c) => (
                  <div key={c.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 ${clientesJaVinculados.has(c.id) ? "bg-primary/5" : ""}`}
                    onClick={() => setSelecionados((prev) => prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id])}>
                    <Checkbox checked={selecionados.includes(c.id)} readOnly />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.fantasia || c.razao_social}</p>
                      <p className="text-xs text-muted-foreground">{c.cidade ?? ""}</p>
                    </div>
                    {clientesJaVinculados.has(c.id) && <Badge variant="secondary" className="text-xs flex-shrink-0">Vinculado</Badge>}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => { setOpenClientes(null); setSelecionados([]); }}>Cancelar</Button>
              <Button onClick={() => vincularClientes.mutate()} disabled={vincularClientes.isPending || selecionados.length === 0}>
                {vincularClientes.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar {selecionados.length} clientes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
