import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Save, Calculator, FileText } from "lucide-react";
import {
  calcularProposta,
  montarHtmlProposta,
  obterPrecosPgrss,
  salvarPropostaPgrss,
  type ItemCalculado,
  type PrecosBase,
  type QuestionarioPgrssT,
} from "@/lib/pgrss.functions";
import { gerarPropostaIA } from "@/lib/proposta-ai.functions";

export const Route = createFileRoute("/_authenticated/propostas/pgrss/nova")({
  component: NovaPgrss,
});

type Cliente = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  email: string | null;
  telefone: string | null;
  responsavel_tecnico: string | null;
};

const TIPOS = [
  "Hospital",
  "Clínica médica",
  "Clínica odontológica",
  "Clínica veterinária",
  "Laboratório de análises",
  "Farmácia / Drogaria",
  "Unidade Básica de Saúde",
  "Consultório",
  "Pronto-atendimento",
  "Outro estabelecimento de saúde",
];

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function defaultQuestionario(): QuestionarioPgrssT {
  return {
    tipo_estabelecimento: "Clínica médica",
    area_construida: 0,
    qtd_funcionarios: 0,
    qtd_leitos: 0,
    qtd_salas: 0,
    gera_grupo_a: true,
    gera_grupo_b: false,
    gera_grupo_c: false,
    gera_grupo_d: true,
    gera_grupo_e: true,
    possui_abrigo_temporario: false,
    possui_armazenamento_externo: false,
    possui_coleta_especializada: false,
    possui_mtr: false,
    possui_licenciamento: false,
    possui_treinamento: false,
    possui_pgrss_vigente: false,
    distancia_km: 0,
    qtd_visitas: 1,
    qtd_treinamentos: 1,
    incluir_art: true,
    incluir_atualizacao_anual: true,
    incluir_consultoria_mensal: false,
    meses_consultoria: 0,
    porte: "pequeno",
    observacoes: "",
  };
}

function gerarNumero() {
  const ano = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 8999) + 1000);
  return `PGRSS-${ano}-${seq}`;
}

function NovaPgrss() {
  const navigate = useNavigate();
  const carregarPrecos = useServerFn(obterPrecosPgrss);
  const salvar = useServerFn(salvarPropostaPgrss);
  const gerarIA = useServerFn(gerarPropostaIA);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [precos, setPrecos] = useState<PrecosBase | null>(null);
  const [q, setQ] = useState<QuestionarioPgrssT>(defaultQuestionario());
  const [numero, setNumero] = useState(gerarNumero());
  const [validade, setValidade] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [escopoIA, setEscopoIA] = useState<string>("");
  const [loadingIA, setLoadingIA] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("clientes")
      .select("id,razao_social,nome_fantasia,cnpj,endereco,cidade,estado,email,telefone,responsavel_tecnico")
      .order("razao_social")
      .then(({ data }) => setClientes((data as Cliente[]) || []));
    carregarPrecos().then((p) =>
      setPrecos({
        preco_elaboracao: Number(p.preco_elaboracao),
        preco_visita_tecnica: Number(p.preco_visita_tecnica),
        preco_deslocamento_km: Number(p.preco_deslocamento_km),
        preco_art: Number(p.preco_art),
        preco_treinamento: Number(p.preco_treinamento),
        preco_atualizacao_anual: Number(p.preco_atualizacao_anual),
        preco_consultoria_mensal: Number(p.preco_consultoria_mensal),
        multiplicador_pequeno: Number(p.multiplicador_pequeno),
        multiplicador_medio: Number(p.multiplicador_medio),
        multiplicador_grande: Number(p.multiplicador_grande),
      }),
    );
  }, [carregarPrecos]);

  const cliente = useMemo(() => clientes.find((c) => c.id === clienteId), [clientes, clienteId]);

  const calculo = useMemo(() => {
    if (!precos) return { itens: [] as ItemCalculado[], total: 0, mult: 1 };
    return calcularProposta(q, precos);
  }, [q, precos]);

  const precosOk =
    precos &&
    (precos.preco_elaboracao > 0 ||
      precos.preco_visita_tecnica > 0 ||
      precos.preco_art > 0);

  const handleGerarIA = async () => {
    if (!cliente) return toast.error("Selecione o cliente.");
    setLoadingIA(true);
    try {
      const grupos = [
        q.gera_grupo_a && "A",
        q.gera_grupo_b && "B",
        q.gera_grupo_c && "C",
        q.gera_grupo_d && "D",
        q.gera_grupo_e && "E",
      ].filter(Boolean).join(", ");
      const system = `Você é consultor sênior em gestão de resíduos de serviços de saúde (PGRSS). Gere o ESCOPO TÉCNICO de uma proposta de elaboração de PGRSS, em texto direto, profissional, em português do Brasil. Use bullets com hífen. Cite RDC ANVISA 222/2018, CONAMA 358/2005, PNRS Lei 12.305/2010 e ABNT aplicáveis quando pertinente. Sem cabeçalhos, sem CAPA, sem investimento. Máximo 25 linhas.`;
      const user = `Cliente: ${cliente.razao_social} (${cliente.cnpj})
Tipo: ${q.tipo_estabelecimento}
Porte: ${q.porte}
Área: ${q.area_construida} m² | Funcionários: ${q.qtd_funcionarios} | Leitos: ${q.qtd_leitos} | Salas: ${q.qtd_salas}
Grupos gerados: ${grupos || "—"}
Infraestrutura existente:
- Abrigo temporário: ${q.possui_abrigo_temporario ? "sim" : "não"}
- Armazenamento externo: ${q.possui_armazenamento_externo ? "sim" : "não"}
- Coleta especializada: ${q.possui_coleta_especializada ? "sim" : "não"}
- MTR: ${q.possui_mtr ? "sim" : "não"}
- Licenciamento ambiental: ${q.possui_licenciamento ? "sim" : "não"}
- Treinamento equipe: ${q.possui_treinamento ? "sim" : "não"}
- PGRSS vigente: ${q.possui_pgrss_vigente ? "sim" : "não"}
Observações: ${q.observacoes || "—"}

Produza o escopo personalizado, citando os grupos efetivamente gerados, lacunas identificadas (ex.: ausência de PGRSS vigente, falta de treinamento) e ações que serão executadas para sanar cada lacuna.`;
      const r = await gerarIA({ data: { system, user } });
      setEscopoIA(r.text);
      toast.success("Escopo gerado pela IA.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na IA");
    } finally {
      setLoadingIA(false);
    }
  };

  const handleSalvar = async () => {
    if (!cliente) return toast.error("Selecione o cliente.");
    if (!calculo.itens.length) return toast.error("Configure a tabela de preços antes.");
    setSaving(true);
    try {
      const html = montarHtmlProposta({
        numero,
        data_emissao: new Date().toISOString().slice(0, 10),
        validade,
        cliente,
        questionario: q,
        itens: calculo.itens,
        total: calculo.total,
        escopoIA: escopoIA || undefined,
      });
      const r = await salvar({
        data: {
          cliente_id: cliente.id,
          numero,
          validade,
          questionario: q,
          conteudo_html: html,
          itens: calculo.itens,
          valor_total: calculo.total,
        },
      });
      toast.success("Proposta PGRSS salva.");
      navigate({ to: "/propostas/pgrss/$id", params: { id: r.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const SwitchRow = ({
    k,
    label,
  }: {
    k: keyof QuestionarioPgrssT;
    label: string;
  }) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <Checkbox
        checked={Boolean(q[k])}
        onCheckedChange={(v) => setQ({ ...q, [k]: Boolean(v) })}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-700" />
            Gerador Inteligente de Propostas PGRSS
          </h1>
          <p className="text-sm text-muted-foreground">
            Questionário técnico, motor de cálculo automático e geração de escopo com IA.
          </p>
        </div>
      </div>

      {!precosOk && (
        <div className="rounded-md border border-amber-400 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
          ⚠ Sua tabela de preços está vazia. Configure em{" "}
          <a className="underline font-medium" href="/precos-pgrss">
            /precos-pgrss
          </a>{" "}
          antes de gerar uma proposta.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Coluna 1: Cliente + identificação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Cliente & Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Nº proposta</Label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={validade}
                  onChange={(e) => setValidade(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de estabelecimento</Label>
              <Select
                value={q.tipo_estabelecimento}
                onValueChange={(v) => setQ({ ...q, tipo_estabelecimento: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Área construída (m²)</Label>
                <Input
                  type="number"
                  value={q.area_construida}
                  onChange={(e) => setQ({ ...q, area_construida: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Funcionários</Label>
                <Input
                  type="number"
                  value={q.qtd_funcionarios}
                  onChange={(e) => setQ({ ...q, qtd_funcionarios: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Leitos</Label>
                <Input
                  type="number"
                  value={q.qtd_leitos}
                  onChange={(e) => setQ({ ...q, qtd_leitos: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Salas</Label>
                <Input
                  type="number"
                  value={q.qtd_salas}
                  onChange={(e) => setQ({ ...q, qtd_salas: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Porte (multiplicador)</Label>
              <Select
                value={q.porte}
                onValueChange={(v) => setQ({ ...q, porte: v as QuestionarioPgrssT["porte"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequeno">Pequeno</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 2: Questionário técnico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Questionário Técnico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Grupos de resíduos gerados
              </Label>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <SwitchRow k="gera_grupo_a" label="Grupo A — biológico" />
                <SwitchRow k="gera_grupo_b" label="Grupo B — químico" />
                <SwitchRow k="gera_grupo_c" label="Grupo C — radioativo" />
                <SwitchRow k="gera_grupo_d" label="Grupo D — comum" />
                <SwitchRow k="gera_grupo_e" label="Grupo E — perfurocortante" />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Infraestrutura atual
              </Label>
              <div className="grid grid-cols-1 gap-1.5 mt-1.5">
                <SwitchRow k="possui_abrigo_temporario" label="Possui abrigo temporário" />
                <SwitchRow k="possui_armazenamento_externo" label="Possui armazenamento externo" />
                <SwitchRow k="possui_coleta_especializada" label="Possui coleta especializada" />
                <SwitchRow k="possui_mtr" label="Emite MTR" />
                <SwitchRow k="possui_licenciamento" label="Possui licenciamento ambiental" />
                <SwitchRow k="possui_treinamento" label="Equipe treinada" />
                <SwitchRow k="possui_pgrss_vigente" label="Possui PGRSS vigente" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações para a IA</Label>
              <Textarea
                rows={3}
                value={q.observacoes}
                onChange={(e) => setQ({ ...q, observacoes: e.target.value })}
                placeholder="Particularidades do cliente, dores, exigências do órgão fiscalizador…"
              />
            </div>
          </CardContent>
        </Card>

        {/* Coluna 3: Cálculo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" /> 3. Motor de Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Visitas técnicas</Label>
                <Input
                  type="number"
                  value={q.qtd_visitas}
                  onChange={(e) => setQ({ ...q, qtd_visitas: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Distância (km)</Label>
                <Input
                  type="number"
                  value={q.distancia_km}
                  onChange={(e) => setQ({ ...q, distancia_km: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Treinamentos</Label>
                <Input
                  type="number"
                  value={q.qtd_treinamentos}
                  onChange={(e) => setQ({ ...q, qtd_treinamentos: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Meses consultoria</Label>
                <Input
                  type="number"
                  value={q.meses_consultoria}
                  onChange={(e) => setQ({ ...q, meses_consultoria: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <SwitchRow k="incluir_art" label="Incluir ART" />
              <SwitchRow k="incluir_atualizacao_anual" label="Incluir atualização anual" />
              <SwitchRow k="incluir_consultoria_mensal" label="Incluir consultoria mensal" />
            </div>

            <div className="rounded-md border bg-muted/30 p-2 text-xs">
              {calculo.itens.length === 0 ? (
                <div className="text-muted-foreground">Nenhum item calculado.</div>
              ) : (
                <table className="w-full">
                  <tbody>
                    {calculo.itens.map((i, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-1 pr-2">{i.descricao}</td>
                        <td className="py-1 text-right whitespace-nowrap">{fmtBRL(i.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-2 font-semibold">TOTAL</td>
                      <td className="pt-2 text-right font-bold text-emerald-700">
                        {fmtBRL(calculo.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escopo da IA */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-700" /> 4. Escopo personalizado pela IA
          </CardTitle>
          <Button onClick={handleGerarIA} disabled={loadingIA || !cliente} variant="secondary">
            {loadingIA ? "Gerando…" : "Gerar com IA"}
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={10}
            value={escopoIA}
            onChange={(e) => setEscopoIA(e.target.value)}
            placeholder="Clique em 'Gerar com IA' para criar o escopo personalizado, ou escreva manualmente. Se ficar vazio, será usado um escopo padrão."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSalvar} disabled={saving || !cliente}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Salvando…" : "Salvar e visualizar proposta"}
        </Button>
      </div>
    </div>
  );
}
