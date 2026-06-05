import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Building2, FileText, FileSignature, ShieldCheck, Truck, Award,
  Receipt, FolderOpen, Loader2, ExternalLink, Upload, Trash2, Mail, Phone,
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
              <TableCell>{l.arquivo_url && <OpenFileBtn path={l.arquivo_url} />}</TableCell>
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
              <TableCell>{m.url_documento && <OpenFileBtn path={m.url_documento} />}</TableCell>
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
              <TableCell>{c.url_documento && <OpenFileBtn path={c.url_documento} />}</TableCell>
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

// ---------- Documentos (storage) ----------
function DocumentosTab({ clienteId, ownerId }: { clienteId: string; ownerId: string }) {
  const folder = `${ownerId}/clientes/${clienteId}`;
  const [files, setFiles] = useState<Array<{ name: string; size: number; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (error) { toast.error(error.message); setFiles([]); }
    else setFiles((data ?? []).map((f) => ({ name: f.name, size: (f.metadata as any)?.size ?? 0, created_at: f.created_at ?? "" })));
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clienteId, ownerId]);

  const handleUpload = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) { toast.error("Arquivo maior que 20MB"); return; }
    setUploading(true);
    const path = `${folder}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
    setUploading(false);
    if (error) toast.error(error.message);
    else { toast.success("Arquivo enviado"); load(); }
  };

  const handleOpen = async (name: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(`${folder}/${name}`, 3600);
    if (error || !data?.signedUrl) { toast.error("Falha ao abrir"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Remover ${name}?`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([`${folder}/${name}`]);
    if (error) toast.error(error.message);
    else { toast.success("Removido"); load(); }
  };

  return (
    <Card className="p-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Arquivos gerais do cliente (contratos digitalizados, documentos societários, etc).</p>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading} size="sm">
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Enviar arquivo
        </Button>
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
      </div>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></div>
      ) : files.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Nenhum documento enviado.</div>
      ) : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Arquivo</TableHead><TableHead>Tamanho</TableHead><TableHead>Enviado em</TableHead><TableHead className="w-24"></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {files.map((f) => (
              <TableRow key={f.name}>
                <TableCell className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{f.name}</TableCell>
                <TableCell>{(f.size / 1024).toFixed(1)} KB</TableCell>
                <TableCell>{fmtDate(f.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(f.name)}><ExternalLink className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function OpenFileBtn({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
    setLoading(false);
    if (error || !data?.signedUrl) { toast.error("Falha ao abrir"); return; }
    window.open(data.signedUrl, "_blank");
  };
  return (
    <Button variant="ghost" size="icon" onClick={open} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
    </Button>
  );
}
