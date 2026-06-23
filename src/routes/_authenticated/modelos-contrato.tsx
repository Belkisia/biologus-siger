import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Loader2, Trash2, Copy, History, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  listarModelos, obterModelo, criarModelo, atualizarModelo, duplicarModelo,
  alternarAtivoModelo, excluirModelo, listarVersoes,
  renderTemplate, buildVars,
} from "@/lib/contrato-modelo.functions";

// Dados de exemplo para a pré-visualização (não persistidos)
const SAMPLE_CLIENTE = {
  razao_social: "MV. OROFACI ODONTOLOGIA LTDA",
  nome_fantasia: "MV. OROFACI ODONTOLOGIA",
  cnpj: "18.526.332/0001-70",
  inscricao_estadual: "ISENTO",
  inscricao_municipal: "123456",
  cnae: "8630-5/04 - Atividade odontológica",
  endereco: "Avenida Presidente Vargas, Quadra 23, Lote 01",
  numero: "S/N",
  bairro: "Jardim Marista",
  cidade: "Trindade",
  estado: "GO",
  cep: "75.388-408",
  email: "contato@orofaci.com.br",
  telefone: "(62) 98257-1491",
  whatsapp: "(62) 98257-1491",
  responsavel_tecnico: "Márcia Vieira da Silva",
  responsavel_financeiro: "Márcia Vieira da Silva",
  responsavel_operacional: "Márcia Vieira da Silva",
};
const SAMPLE_ITENS = [
  { descricao: "Resíduo infectante perfurocortante", grupo_residuo: "E", unidade: "kg", franquia: 20, preco_unitario: 9.5, preco_excedente: 11 },
  { descricao: "Resíduo químico (amálgama, reveladores)", grupo_residuo: "B", unidade: "kg", franquia: 5, preco_unitario: 18, preco_excedente: 22 },
  { descricao: "Resíduo biológico", grupo_residuo: "A", unidade: "kg", franquia: 15, preco_unitario: 8, preco_excedente: 10 },
];
const SAMPLE_CONTRATO = {
  numero: "CTR-2026-0001",
  data_inicio: new Date().toISOString().slice(0, 10),
  data_fim: null,
  valor_mensal: 1850,
  periodicidade_reajuste: "mensal",
};

export const Route = createFileRoute("/_authenticated/modelos-contrato")({
  component: ModelosPage,
});

type ModeloRow = {
  id: string; nome: string; descricao: string | null;
  ativo: boolean; versao_atual: number; owner_id: string | null; updated_at: string;
};

function ModelosPage() {
  const qc = useQueryClient();
  const fnList = useServerFn(listarModelos);
  const fnGet = useServerFn(obterModelo);
  const fnCreate = useServerFn(criarModelo);
  const fnUpdate = useServerFn(atualizarModelo);
  const fnDup = useServerFn(duplicarModelo);
  const fnToggle = useServerFn(alternarAtivoModelo);
  const fnDel = useServerFn(excluirModelo);
  const fnVers = useServerFn(listarVersoes);

  const { data: modelos = [], isLoading } = useQuery({
    queryKey: ["contrato_modelos"],
    queryFn: () => fnList(),
  });

  const [editor, setEditor] = useState<{
    open: boolean; id?: string;
    nome: string; descricao: string; conteudo_html: string; motivo: string;
  }>({ open: false, nome: "", descricao: "", conteudo_html: "", motivo: "" });

  const [versHistorico, setVersHistorico] = useState<{ open: boolean; modelo?: ModeloRow }>({ open: false });
  const { data: versoes = [] } = useQuery({
    queryKey: ["modelo_versoes", versHistorico.modelo?.id],
    queryFn: () => fnVers({ data: { modelo_id: versHistorico.modelo!.id } }),
    enabled: !!versHistorico.modelo?.id,
  });

  function novoModelo() {
    setEditor({
      open: true, nome: "", descricao: "",
      conteudo_html: "<h1>Novo modelo de contrato</h1><p>Digite aqui o conteúdo. Use o seletor de variáveis para inserir campos dinâmicos como {{CLIENTE_RAZAO_SOCIAL}}.</p>",
      motivo: "",
    });
  }

  async function editarModelo(id: string) {
    const m = await fnGet({ data: { id } });
    setEditor({
      open: true, id: m.id, nome: m.nome, descricao: m.descricao || "",
      conteudo_html: m.conteudo_html, motivo: "",
    });
  }

  // Validação em tempo real dos placeholders
  const validation = useMemo(() => {
    const html = editor.conteudo_html || "";
    const used = Array.from(new Set(Array.from(html.matchAll(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g)).map((m) => m[1])));
    const sampleVars = buildVars({ cliente: SAMPLE_CLIENTE, contrato: SAMPLE_CONTRATO, itens: SAMPLE_ITENS }) as Record<string, string>;
    const known = new Set(Object.keys(sampleVars));
    const unknown = used.filter((k) => !known.has(k));
    const emptyWithSample = used.filter((k) => known.has(k) && (sampleVars[k] === "" || sampleVars[k] == null));
    const ok = used.filter((k) => known.has(k) && sampleVars[k] !== "" && sampleVars[k] != null);
    return { used, unknown, emptyWithSample, ok };
  }, [editor.conteudo_html]);

  const podeSalvar = !!editor.nome.trim() && validation.unknown.length === 0;

  const salvar = useMutation({
    mutationFn: async () => {
      if (!editor.nome.trim()) throw new Error("Nome é obrigatório");
      if (validation.unknown.length > 0) {
        throw new Error(`Placeholders não reconhecidos: ${validation.unknown.map((v) => `{{${v}}}`).join(", ")}`);
      }
      if (editor.id) {
        return fnUpdate({ data: { id: editor.id, nome: editor.nome, descricao: editor.descricao, conteudo_html: editor.conteudo_html, motivo: editor.motivo } });
      } else {
        return fnCreate({ data: { nome: editor.nome, descricao: editor.descricao, conteudo_html: editor.conteudo_html } });
      }
    },
    onSuccess: () => {
      toast.success("Modelo salvo");
      setEditor((s) => ({ ...s, open: false }));
      qc.invalidateQueries({ queryKey: ["contrato_modelos"] });
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao salvar"),
  });

  const duplicar = useMutation({
    mutationFn: (id: string) => fnDup({ data: { id } }),
    onSuccess: () => { toast.success("Modelo duplicado"); qc.invalidateQueries({ queryKey: ["contrato_modelos"] }); },
    onError: (e: any) => toast.error(e?.message || "Erro"),
  });

  const toggle = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => fnToggle({ data: { id, ativo } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contrato_modelos"] }),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => fnDel({ data: { id } }),
    onSuccess: () => { toast.success("Modelo excluído"); qc.invalidateQueries({ queryKey: ["contrato_modelos"] }); },
    onError: (e: any) => toast.error(e?.message || "Erro"),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Modelos de Contrato</h1>
          <p className="text-sm text-muted-foreground">Crie modelos reutilizáveis com variáveis dinâmicas que serão preenchidas automaticamente.</p>
        </div>
        <Button onClick={novoModelo}><Plus className="h-4 w-4" /> Novo modelo</Button>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : modelos.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            Nenhum modelo cadastrado. Clique em "Novo modelo" para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(modelos as ModeloRow[]).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.nome}</div>
                    {m.descricao && <div className="text-xs text-muted-foreground">{m.descricao}</div>}
                    {!m.owner_id && <Badge variant="outline" className="mt-1">Sistema</Badge>}
                  </TableCell>
                  <TableCell>v{m.versao_atual}</TableCell>
                  <TableCell>
                    <Switch checked={m.ativo} onCheckedChange={(v) => toggle.mutate({ id: m.id, ativo: v })} disabled={!m.owner_id} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(m.updated_at).toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => editarModelo(m.id)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="Histórico" onClick={() => setVersHistorico({ open: true, modelo: m })}><History className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="Duplicar" onClick={() => duplicar.mutate(m.id)}><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="Excluir" disabled={!m.owner_id}
                        onClick={() => { if (confirm(`Excluir modelo "${m.nome}"?`)) excluir.mutate(m.id); }}>
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

      <Dialog open={editor.open} onOpenChange={(o) => setEditor((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-[95vw] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editor.id ? "Editar modelo" : "Novo modelo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={editor.nome} onChange={(e) => setEditor((s) => ({ ...s, nome: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={editor.descricao} onChange={(e) => setEditor((s) => ({ ...s, descricao: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conteúdo do contrato</Label>
                <RichTextEditor
                  value={editor.conteudo_html}
                  onChange={(html) => setEditor((s) => ({ ...s, conteudo_html: html }))}
                  minHeight={520}
                />
                <p className="text-xs text-muted-foreground">
                  Use {`{{VARIAVEL}}`} para campos dinâmicos. O painel ao lado mostra como ficará com dados reais.
                </p>
              </div>
              <PreviewPane html={editor.conteudo_html} />
            </div>

            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium flex items-center gap-2">
                  {validation.unknown.length > 0 ? (
                    <><AlertTriangle className="h-4 w-4 text-destructive" /> Validação dos placeholders</>
                  ) : validation.emptyWithSample.length > 0 ? (
                    <><AlertTriangle className="h-4 w-4 text-amber-500" /> Validação dos placeholders</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Validação dos placeholders</>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{validation.used.length} usados</span>
              </div>
              {validation.unknown.length > 0 && (
                <div className="text-xs">
                  <div className="text-destructive font-medium mb-1">Desconhecidos (bloqueiam o salvamento):</div>
                  <div className="flex flex-wrap gap-1">
                    {validation.unknown.map((v) => (
                      <Badge key={v} variant="destructive" className="font-mono">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {validation.emptyWithSample.length > 0 && (
                <div className="text-xs">
                  <div className="text-amber-700 font-medium mb-1">Sem dado no exemplo (verifique se serão preenchidos pelo cadastro do cliente/contrato):</div>
                  <div className="flex flex-wrap gap-1">
                    {validation.emptyWithSample.map((v) => (
                      <Badge key={v} variant="outline" className="font-mono border-amber-400 text-amber-700">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {validation.ok.length > 0 && (
                <div className="text-xs">
                  <div className="text-muted-foreground mb-1">Preenchidos no exemplo:</div>
                  <div className="flex flex-wrap gap-1">
                    {validation.ok.map((v) => (
                      <Badge key={v} variant="secondary" className="font-mono">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {validation.used.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum placeholder {`{{...}}`} encontrado no conteúdo.</p>
              )}
            </Card>

            {editor.id && (
              <div className="space-y-2">
                <Label>Motivo da alteração (opcional)</Label>
                <Textarea rows={2} value={editor.motivo} onChange={(e) => setEditor((s) => ({ ...s, motivo: e.target.value }))} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditor((s) => ({ ...s, open: false }))}>Cancelar</Button>
            <Button onClick={() => salvar.mutate()} disabled={salvar.isPending || !podeSalvar}
              title={!podeSalvar ? "Corrija os placeholders desconhecidos para salvar" : ""}>
              {salvar.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={versHistorico.open} onOpenChange={(o) => setVersHistorico({ open: o, modelo: o ? versHistorico.modelo : undefined })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico — {versHistorico.modelo?.nome}</DialogTitle>
          </DialogHeader>
          {versoes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhuma versão registrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Versão</TableHead><TableHead>Data</TableHead><TableHead>Motivo</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {(versoes as any[]).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>v{v.versao}</TableCell>
                    <TableCell className="text-xs">{new Date(v.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-xs">{v.motivo || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewPane({ html }: { html: string }) {
  const [showRaw, setShowRaw] = useState(false);
  const rendered = useMemo(() => {
    try {
      const vars = buildVars({
        cliente: SAMPLE_CLIENTE,
        contrato: SAMPLE_CONTRATO,
        itens: SAMPLE_ITENS,
      });
      return renderTemplate(html || "", vars);
    } catch {
      return html;
    }
  }, [html]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Pré-visualização (dados de exemplo)</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Modelo</span>
          <Switch checked={!showRaw} onCheckedChange={(v) => setShowRaw(!v)} />
          <span className="text-xs text-muted-foreground">Preenchido</span>
        </div>
      </div>
      <div
        className="prose prose-sm max-w-none border rounded-md p-4 bg-background overflow-y-auto"
        style={{ minHeight: 520, maxHeight: 640 }}
        dangerouslySetInnerHTML={{ __html: showRaw ? (html || "") : rendered }}
      />
      <p className="text-xs text-muted-foreground">
        Placeholders sem dado aparecem em <span className="text-destructive font-mono">[VARIAVEL]</span>. Dados reais serão usados ao gerar o contrato a partir de um cliente/proposta.
      </p>
    </div>
  );
}
