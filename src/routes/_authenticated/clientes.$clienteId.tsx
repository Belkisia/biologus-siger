import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Building2, FileText, FileSignature, ShieldCheck, Truck, Award,
  Receipt, FolderOpen, Loader2, ExternalLink, Upload, Trash2, Mail, Phone,
  History, Plus, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clientes/$clienteId")({
  component: PastaDigitalPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">Erro: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6">Cliente não encontrado.</div>,
});

const BUCKET = "documentos";
const fmtBRL = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-BR") : "—";

function PastaDigitalPage() {
  const { clienteId } = Route.useParams();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ["cliente", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").eq("id", clienteId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></div>;
  }
  if (!cliente) {
    return <div className="p-6">Cliente não encontrado.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/clientes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6" /> {cliente.razao_social}
          </h1>
          <p className="text-sm text-muted-foreground">Pasta digital do cliente</p>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Info label="CNPJ" value={cliente.cnpj} mono />
        <Info label="Nome fantasia" value={cliente.nome_fantasia || "—"} />
        <Info label="Cidade/UF" value={[cliente.cidade, cliente.estado].filter(Boolean).join(" / ") || "—"} />
        <Info label="Status" value={<Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>{cliente.status}</Badge>} />
        <Info label="E-mail" value={cliente.email ? <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{cliente.email}</span> : "—"} />
        <Info label="Telefone" value={cliente.telefone ? <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{cliente.telefone}</span> : "—"} />
        <Info label="Responsável técnico" value={cliente.responsavel_tecnico || "—"} />
        <Info label="Responsável financeiro" value={cliente.responsavel_financeiro || "—"} />
      </Card>

      <Tabs defaultValue="contratos" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="contratos"><FileSignature className="h-4 w-4 mr-1" />Contratos</TabsTrigger>
          <TabsTrigger value="propostas"><FileText className="h-4 w-4 mr-1" />Propostas</TabsTrigger>
          <TabsTrigger value="licencas"><ShieldCheck className="h-4 w-4 mr-1" />Licenças</TabsTrigger>
          <TabsTrigger value="mtr"><Truck className="h-4 w-4 mr-1" />MTR</TabsTrigger>
          <TabsTrigger value="cdf"><Award className="h-4 w-4 mr-1" />Certificados</TabsTrigger>
          <TabsTrigger value="boletos"><Receipt className="h-4 w-4 mr-1" />Boletos</TabsTrigger>
          <TabsTrigger value="documentos"><FolderOpen className="h-4 w-4 mr-1" />Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="contratos"><ContratosTab clienteId={clienteId} /></TabsContent>
        <TabsContent value="propostas"><PropostasTab clienteId={clienteId} /></TabsContent>
        <TabsContent value="licencas"><LicencasTab clienteId={clienteId} /></TabsContent>
        <TabsContent value="mtr"><MtrTab clienteId={clienteId} /></TabsContent>
        <TabsContent value="cdf"><CdfTab clienteId={clienteId} /></TabsContent>
        <TabsContent value="boletos"><BoletosTab clienteId={clienteId} /></TabsContent>
        <TabsContent value="documentos"><DocumentosTab clienteId={clienteId} ownerId={cliente.owner_id} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function TabCard({ children, empty, loading }: { children: React.ReactNode; empty?: boolean; loading?: boolean }) {
  return (
    <Card className="p-4 mt-4">
      {loading ? (
        <div className="py-10 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
      ) : empty ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Nenhum registro encontrado.</div>
      ) : children}
    </Card>
  );
}

// ---------- Contratos ----------
function ContratosTab({ clienteId }: { clienteId: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pasta-contratos", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("contratos").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <TabCard loading={isLoading} empty={data.length === 0}>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Número</TableHead><TableHead>Objeto</TableHead><TableHead>Início</TableHead>
          <TableHead>Fim</TableHead><TableHead>Valor mensal</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {data.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono">{c.numero}</TableCell>
              <TableCell className="max-w-xs truncate">{c.objeto || "—"}</TableCell>
              <TableCell>{fmtDate(c.data_inicio)}</TableCell>
              <TableCell>{fmtDate(c.data_fim)}</TableCell>
              <TableCell>{fmtBRL(c.valor_mensal)}</TableCell>
              <TableCell><Badge variant={c.status === "ativo" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabCard>
  );
}

// ---------- Propostas ----------
function PropostasTab({ clienteId }: { clienteId: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pasta-propostas", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("propostas").select("*").eq("cliente_id", clienteId).order("data_emissao", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <TabCard loading={isLoading} empty={data.length === 0}>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Número</TableHead><TableHead>Emissão</TableHead><TableHead>Validade</TableHead>
          <TableHead>Valor</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {data.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono">{p.numero}</TableCell>
              <TableCell>{fmtDate(p.data_emissao)}</TableCell>
              <TableCell>{fmtDate(p.validade)}</TableCell>
              <TableCell>{fmtBRL(p.valor_total)}</TableCell>
              <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabCard>
  );
}

// ---------- Licenças ----------
function LicencasTab({ clienteId }: { clienteId: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pasta-licencas", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("licencas").select("*").eq("cliente_id", clienteId).order("data_validade", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <TabCard loading={isLoading} empty={data.length === 0}>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Número</TableHead><TableHead>Tipo</TableHead><TableHead>Órgão</TableHead>
          <TableHead>Emissão</TableHead><TableHead>Validade</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {data.map((l: any) => (
            <TableRow key={l.id}>
              <TableCell className="font-mono">{l.numero}</TableCell>
              <TableCell>{l.tipo}</TableCell>
              <TableCell>{l.orgao_emissor}</TableCell>
              <TableCell>{fmtDate(l.data_emissao)}</TableCell>
              <TableCell>{fmtDate(l.data_validade)}</TableCell>
              <TableCell><Badge>{l.status}</Badge></TableCell>
              <TableCell>{l.arquivo_url && <OpenInline path={l.arquivo_url} />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabCard>
  );
}

// ---------- MTR ----------
function MtrTab({ clienteId }: { clienteId: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pasta-mtr", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("mtrs").select("*").eq("cliente_id", clienteId).order("data_emissao", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <TabCard loading={isLoading} empty={data.length === 0}>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Número</TableHead><TableHead>Emissão</TableHead><TableHead>Resíduo</TableHead>
          <TableHead>Qtd</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {data.map((m: any) => (
            <TableRow key={m.id}>
              <TableCell className="font-mono">{m.numero}</TableCell>
              <TableCell>{fmtDate(m.data_emissao)}</TableCell>
              <TableCell className="max-w-xs truncate">{m.descricao_residuo}</TableCell>
              <TableCell>{m.quantidade} {m.unidade}</TableCell>
              <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
              <TableCell>{m.url_documento && <OpenInline path={m.url_documento} />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabCard>
  );
}

// ---------- CDF / Certificados (via MTR) ----------
function CdfTab({ clienteId }: { clienteId: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pasta-cdf", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cdfs")
        .select("*, mtr:mtrs!inner(numero, cliente_id, descricao_residuo)")
        .eq("mtr.cliente_id", clienteId)
        .order("data_destinacao", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <TabCard loading={isLoading} empty={data.length === 0}>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Número</TableHead><TableHead>MTR</TableHead><TableHead>Destinação</TableHead>
          <TableHead>Tecnologia</TableHead><TableHead>Qtd destinada</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {data.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono">{c.numero}</TableCell>
              <TableCell className="font-mono text-xs">{c.mtr?.numero || "—"}</TableCell>
              <TableCell>{fmtDate(c.data_destinacao)}</TableCell>
              <TableCell>{c.tecnologia || "—"}</TableCell>
              <TableCell>{c.quantidade_destinada ?? "—"}</TableCell>
              <TableCell>{c.url_documento && <OpenInline path={c.url_documento} />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabCard>
  );
}

// ---------- Boletos / Faturas ----------
function BoletosTab({ clienteId }: { clienteId: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pasta-faturas", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("faturas").select("*").eq("cliente_id", clienteId).order("data_vencimento", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <TabCard loading={isLoading} empty={data.length === 0}>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Número</TableHead><TableHead>Competência</TableHead><TableHead>Vencimento</TableHead>
          <TableHead>Valor</TableHead><TableHead>Pago em</TableHead><TableHead>Status</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {data.map((f: any) => (
            <TableRow key={f.id}>
              <TableCell className="font-mono">{f.numero}</TableCell>
              <TableCell>{f.competencia}</TableCell>
              <TableCell>{fmtDate(f.data_vencimento)}</TableCell>
              <TableCell>{fmtBRL(f.valor)}</TableCell>
              <TableCell>{fmtDate(f.data_pagamento)}</TableCell>
              <TableCell><Badge variant={f.status === "pago" ? "default" : f.status === "vencida" ? "destructive" : "secondary"}>{f.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabCard>
  );
}

// ---------- Documentos (versionado) ----------
const CATEGORIAS = [
  { v: "geral", l: "Geral" },
  { v: "contratual", l: "Contratual" },
  { v: "societario", l: "Societário" },
  { v: "fiscal", l: "Fiscal" },
  { v: "ambiental", l: "Ambiental" },
  { v: "operacional", l: "Operacional" },
  { v: "outro", l: "Outro" },
];

type DocRow = {
  id: string; nome: string; categoria: string; descricao: string | null;
  versao_atual: number; storage_path: string; mime_type: string | null;
  tamanho_bytes: number | null; updated_at: string; created_at: string;
};

function DocumentosTab({ clienteId, ownerId }: { clienteId: string; ownerId: string }) {
  const qc = useQueryClient();
  const [novoOpen, setNovoOpen] = useState(false);
  const [histDoc, setHistDoc] = useState<DocRow | null>(null);
  const newVerRef = useRef<HTMLInputElement>(null);
  const [verTarget, setVerTarget] = useState<DocRow | null>(null);
  const [verNota, setVerNota] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["cliente-documentos", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cliente_documentos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DocRow[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["cliente-documentos", clienteId] });

  const uploadFile = async (file: File, documentoId: string, versao: number): Promise<string> => {
    if (file.size > 20 * 1024 * 1024) throw new Error("Arquivo maior que 20MB");
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${ownerId}/clientes/${clienteId}/${documentoId}/v${versao}-${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return path;
  };

  const handleCreate = async (payload: { nome: string; categoria: string; descricao: string; file: File; nota: string }) => {
    const { data: inserted, error: e1 } = await supabase.from("cliente_documentos").insert({
      owner_id: ownerId, cliente_id: clienteId,
      nome: payload.nome, categoria: payload.categoria, descricao: payload.descricao || null,
      versao_atual: 1, storage_path: "pending",
      mime_type: payload.file.type, tamanho_bytes: payload.file.size,
    }).select().single();
    if (e1 || !inserted) { toast.error(e1?.message ?? "Erro"); return; }
    try {
      const path = await uploadFile(payload.file, inserted.id, 1);
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("cliente_documentos").update({ storage_path: path }).eq("id", inserted.id);
      await supabase.from("cliente_documento_versoes").insert({
        documento_id: inserted.id, owner_id: ownerId, versao: 1, storage_path: path,
        mime_type: payload.file.type, tamanho_bytes: payload.file.size, nome_arquivo: payload.file.name,
        acao: "criado", nota: payload.nota || null, uploaded_by: u.user?.id ?? null,
      });
      toast.success("Documento criado");
      setNovoOpen(false); refresh();
    } catch (err: any) {
      await supabase.from("cliente_documentos").delete().eq("id", inserted.id);
      toast.error(err.message ?? "Falha no upload");
    }
  };

  const handleNewVersion = async (doc: DocRow, file: File, nota: string) => {
    if (!file) return;
    const novaV = doc.versao_atual + 1;
    try {
      const path = await uploadFile(file, doc.id, novaV);
      const { data: u } = await supabase.auth.getUser();
      const { error: e1 } = await supabase.from("cliente_documento_versoes").insert({
        documento_id: doc.id, owner_id: ownerId, versao: novaV, storage_path: path,
        mime_type: file.type, tamanho_bytes: file.size, nome_arquivo: file.name,
        acao: "nova_versao", nota: nota || null, uploaded_by: u.user?.id ?? null,
      });
      if (e1) throw e1;
      await supabase.from("cliente_documentos").update({
        versao_atual: novaV, storage_path: path, mime_type: file.type, tamanho_bytes: file.size,
      }).eq("id", doc.id);
      toast.success(`Versão v${novaV} enviada`);
      setVerTarget(null); setVerNota(""); refresh();
      if (histDoc?.id === doc.id) setHistDoc({ ...doc, versao_atual: novaV, storage_path: path });
    } catch (err: any) {
      toast.error(err.message ?? "Falha");
    }
  };

  const handleDelete = async (doc: DocRow) => {
    if (!confirm(`Remover "${doc.nome}" e todas as versões?`)) return;
    const { data: versoes } = await supabase.from("cliente_documento_versoes").select("storage_path").eq("documento_id", doc.id);
    const paths = (versoes ?? []).map((v) => v.storage_path);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    const { error } = await supabase.from("cliente_documentos").delete().eq("id", doc.id);
    if (error) toast.error(error.message);
    else { toast.success("Removido"); refresh(); }
  };

  return (
    <Card className="p-4 mt-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-medium">Documentos do cliente</h3>
          <p className="text-sm text-muted-foreground">Upload com versionamento e histórico completo de alterações.</p>
        </div>
        <Button size="sm" onClick={() => setNovoOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo documento</Button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Nenhum documento cadastrado.</div>
      ) : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Versão</TableHead>
            <TableHead>Tamanho</TableHead><TableHead>Atualizado</TableHead><TableHead className="w-36"></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{d.nome}</div>
                  {d.descricao && <div className="text-xs text-muted-foreground">{d.descricao}</div>}
                </TableCell>
                <TableCell><Badge variant="outline">{CATEGORIAS.find((c) => c.v === d.categoria)?.l ?? d.categoria}</Badge></TableCell>
                <TableCell><Badge>v{d.versao_atual}</Badge></TableCell>
                <TableCell className="text-xs">{d.tamanho_bytes ? `${(d.tamanho_bytes / 1024).toFixed(1)} KB` : "—"}</TableCell>
                <TableCell className="text-xs">{fmtDate(d.updated_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <OpenInline path={d.storage_path} />
                    <Button variant="ghost" size="icon" title="Nova versão" onClick={() => setVerTarget(d)}>
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Histórico" onClick={() => setHistDoc(d)}>
                      <History className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Remover" onClick={() => handleDelete(d)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <NovoDocDialog open={novoOpen} onOpenChange={setNovoOpen} onSubmit={handleCreate} />

      {/* Nova versão */}
      <Dialog open={!!verTarget} onOpenChange={(v) => { if (!v) { setVerTarget(null); setVerNota(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova versão — {verTarget?.nome}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Próxima versão: v{(verTarget?.versao_atual ?? 0) + 1}</p>
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <Input ref={newVerRef} type="file" />
            </div>
            <div className="space-y-2">
              <Label>Nota da alteração (opcional)</Label>
              <Textarea value={verNota} onChange={(e) => setVerNota(e.target.value)} placeholder="Ex: ajuste de cláusula de reajuste" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVerTarget(null)}>Cancelar</Button>
            <Button onClick={() => { const f = newVerRef.current?.files?.[0]; if (!f || !verTarget) { toast.error("Selecione um arquivo"); return; } handleNewVersion(verTarget, f, verNota); }}>
              Enviar versão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      <HistoricoDialog doc={histDoc} onOpenChange={(v) => !v && setHistDoc(null)} onChanged={refresh} ownerId={ownerId} />
    </Card>
  );
}

function NovoDocDialog({ open, onOpenChange, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSubmit: (p: { nome: string; categoria: string; descricao: string; file: File; nota: string }) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("geral");
  const [descricao, setDescricao] = useState("");
  const [nota, setNota] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!open) { setNome(""); setCategoria("geral"); setDescricao(""); setNota(""); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo documento</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2"><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Contrato Social" /></div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Descrição (opcional)</Label><Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} /></div>
          <div className="space-y-2"><Label>Arquivo</Label><Input ref={fileRef} type="file" /></div>
          <div className="space-y-2"><Label>Nota (opcional)</Label><Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex: versão inicial" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={submitting} onClick={async () => {
            const f = fileRef.current?.files?.[0];
            if (!nome.trim() || !f) { toast.error("Informe nome e arquivo"); return; }
            setSubmitting(true);
            await onSubmit({ nome: nome.trim(), categoria, descricao, file: f, nota });
            setSubmitting(false);
          }}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HistoricoDialog({ doc, onOpenChange, onChanged, ownerId }: {
  doc: DocRow | null; onOpenChange: (v: boolean) => void; onChanged: () => void; ownerId: string;
}) {
  const qc = useQueryClient();
  const { data: versoes = [], isLoading } = useQuery({
    queryKey: ["doc-versoes", doc?.id],
    enabled: !!doc,
    queryFn: async () => {
      const { data, error } = await supabase.from("cliente_documento_versoes")
        .select("*").eq("documento_id", doc!.id).order("versao", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const restaurar = async (v: any) => {
    if (!doc) return;
    if (!confirm(`Restaurar v${v.versao} como versão atual? Será criada uma nova entrada no histórico.`)) return;
    const novaV = doc.versao_atual + 1;
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("cliente_documento_versoes").insert({
      documento_id: doc.id, owner_id: ownerId, versao: novaV, storage_path: v.storage_path,
      mime_type: v.mime_type, tamanho_bytes: v.tamanho_bytes, nome_arquivo: v.nome_arquivo,
      acao: "restaurado", nota: `Restaurado de v${v.versao}`, uploaded_by: u.user?.id ?? null,
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from("cliente_documentos").update({
      versao_atual: novaV, storage_path: v.storage_path, mime_type: v.mime_type, tamanho_bytes: v.tamanho_bytes,
    }).eq("id", doc.id);
    toast.success(`Restaurado como v${novaV}`);
    qc.invalidateQueries({ queryKey: ["doc-versoes", doc.id] });
    onChanged();
  };

  return (
    <Dialog open={!!doc} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Histórico — {doc?.nome}</DialogTitle></DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Versão</TableHead><TableHead>Ação</TableHead><TableHead>Arquivo</TableHead>
                <TableHead>Nota</TableHead><TableHead>Data</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {versoes.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell><Badge variant={v.versao === doc?.versao_atual ? "default" : "outline"}>v{v.versao}{v.versao === doc?.versao_atual && " (atual)"}</Badge></TableCell>
                    <TableCell className="text-xs">{v.acao}</TableCell>
                    <TableCell className="text-xs max-w-[180px] truncate" title={v.nome_arquivo}>{v.nome_arquivo}</TableCell>
                    <TableCell className="text-xs max-w-[180px] truncate" title={v.nota}>{v.nota || "—"}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(v.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <OpenInline path={v.storage_path} />
                        {v.versao !== doc?.versao_atual && (
                          <Button variant="ghost" size="icon" title="Restaurar" onClick={() => restaurar(v)}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OpenInline({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
=======
>>>>>>> independente
  const open = async () => {
    if (!path || path === "pending") return;
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
    setLoading(false);
    if (error || !data?.signedUrl) { toast.error("Falha ao abrir"); return; }
<<<<<<< HEAD
    setPreviewUrl(data.signedUrl);
  };
  return (
    <>
      <Button variant="ghost" size="icon" onClick={open} disabled={loading} title="Abrir">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
      </Button>
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="px-4 py-3">Documento</DialogTitle></DialogHeader>
          {previewUrl && <iframe src={previewUrl} title="Documento" className="w-full flex-1 border-0" />}
        </DialogContent>
      </Dialog>
    </>
=======
    window.open(data.signedUrl, "_blank");
  };
  return (
    <Button variant="ghost" size="icon" onClick={open} disabled={loading} title="Abrir">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
    </Button>
>>>>>>> independente
  );
}
