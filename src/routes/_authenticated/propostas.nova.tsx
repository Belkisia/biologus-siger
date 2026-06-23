import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";

export const Route = createFileRoute("/_authenticated/propostas/nova")({
  component: GeradorPropostas,
});

// ─── PALETA BRAND BIO LOGUS ───────────────────────────────────────────────────
const C = {
  vesc: "#0E3D1A", vmed: "#1A6B2E", vacc: "#2E8B47",
  vclr: "#EAF4ED", branco: "#FFFFFF", cinza: "#3D3D3D",
  muted: "#666666", erro: "#A32D2D", erroBg: "#FCEBEB",
};

// ─── PROMPT DE SISTEMA CIRÚRGICO ─────────────────────────────────────────────
// Descreve o modelo exato célula por célula para não haver ambiguidade
const SYSTEM = `Você é o gerador de propostas da Bio Logus Ambiental.

REGRA ABSOLUTA: A proposta é UMA ÚNICA FOLHA A4. Máximo duas se inevitável. PROIBIDO gerar seções narrativas longas, parágrafos de apresentação, textos de encerramento ou qualquer conteúdo que alongue o documento. Cada bloco é uma tabela compacta.

━━━ IDENTIDADE FIXA (nunca alterar) ━━━
Empresa: Bio Logus Ambiental | CNPJ: 26.484.921/0001-60
Responsável: Belkisia P. Santana — Comercial
Tel: (62) 3558-2791 / (62) 9 8423-6682
E-mail: comercial@biologusambiental.com.br

━━━ ESTRUTURA OBRIGATÓRIA — SIGA EXATAMENTE ESTA ORDEM ━━━

▌BLOCO 1 — CABEÇALHO (faixa verde escura, 1 linha)
Fundo #0E3D1A, texto branco centralizado:
"BIO LOGUS AMBIENTAL · Gestão Inteligente de Resíduos · Goiânia – GO"
Linha abaixo: "CNPJ 26.484.921/0001-60 · Nº [NUM_PROPOSTA] · Emitida em [DATA]"

▌BLOCO 2 — DESTINATÁRIO + CONDIÇÕES (2 colunas, sem título de seção)
Coluna esquerda (fundo #EAF4ED, borda esquerda verde):
  Label pequeno: "DESTINATÁRIO"
  Nome do cliente em negrito grande
  Cidade – UF
  Descrição do serviço em 1 linha itálico

Coluna direita (fundo branco):
  Tabela de 2 colunas sem bordas externas:
  Validade     | [X] dias corridos
  Início       | [X] dias úteis após assinatura
  Pagamento    | [forma]
  Frequência   | [freq]
  Volume       | [min] a [max] kg/coleta

▌BLOCO 3 — SERVIÇO + INCLUSO + PREÇO (3 colunas, sem título de seção)
Coluna 1 — "SERVIÇO PRESTADO" (header verde escuro):
  "Coleta, transporte e destinação final de:"
  ▸ [cada grupo de resíduo com seu acondicionamento]

Coluna 2 — "INCLUSO NO VALOR" (header verde escuro):
  ▸ Pesagem + comprovante assinado na coleta
  ▸ MTR (Manifesto de Transporte de Resíduos)
  ▸ CDF (Certificado de Destinação Final) em até 15 dias
  ▸ Nota Fiscal discriminada por grupo e peso
  ▸ Veículo licenciado SEMARH-GO

Coluna 3 — "PREÇO POR KG COLETADO" (header + fundo verde escuro, texto branco):
  R$ [X,XX] em fonte grande e negrito
  "por quilo coletado" em itálico pequeno
  ———
  "Máximo estimado:"
  R$ [TOTAL] em negrito
  "([max]kg × R$ [preço])" pequeno

▌BLOCO 4 — NOTA DE FATURAMENTO (faixa com borda esquerda verde, 1 linha)
"Faturamento: cobrado pelo peso efetivamente coletado, com base em comprovante assinado pelo responsável. Sem cobrança mínima. Conformidade: [normas aplicáveis]."
[Se cliente público adicionar: "Sujeito à emissão de empenho pelo órgão contratante."]
[Se cliente privado adicionar: "Multa de 2% + juros 1%/mês sobre valores em atraso."]

▌BLOCO 5 — OBRIGAÇÕES (2 colunas, sem texto longo)
Header esquerdo verde: "OBRIGAÇÕES DA CONTRATADA"
Header direito verde: "OBRIGAÇÕES DO CONTRATANTE"
Máximo 5 bullets por lado. Verbos no infinitivo. Frases curtas.

CONTRATADA:
▸ Coletar resíduos com equipe treinada e EPIs completos.
▸ Pesar e emitir comprovante no ato da coleta.
▸ Transportar em veículo licenciado com monitoramento de rota.
▸ Emitir MTR e CDF em até 15 dias após destinação final.
▸ Apresentar Nota Fiscal discriminada por grupo e peso.

CONTRATANTE (adaptar ao acondicionamento dos grupos marcados):
▸ Acondicionar resíduos: [adaptar por grupo].
▸ Designar responsável para acompanhar e assinar a coleta.
▸ Garantir acesso às instalações nos dias acordados.
▸ Efetuar pagamento no prazo mediante nota fiscal.
▸ Comunicar alterações de volume com 72h de antecedência.

▌BLOCO 6 — ASSINATURA (2 colunas)
Esquerda (fundo #EAF4ED, borda verde):
  "CONTRATADA"
  "Bio Logus Ambiental"
  [linha de assinatura]
  "Belkisia P. Santana — Comercial"
  "Goiânia, [data]"

Direita (fundo branco, borda cinza):
  "CONTRATANTE"
  "[Nome do cliente]"
  [linha de assinatura]
  "Nome / Cargo: _______________"
  "Data: ___/___/[ano]"

▌RODAPÉ (todas as páginas)
"(62) 3558-2791 · (62) 9 8423-6682 · comercial@biologusambiental.com.br" | "Página X"

━━━ NORMAS — CITAR APENAS AS APLICÁVEIS ━━━
Grupos A, B, E (RSS): RDC ANVISA 222/2018 · CONAMA 358/2005 · PNRS Lei 12.305/2010
Classe I industrial:   ABNT NBR 10.004:2004 · PNRS Lei 12.305/2010 · Lei GO 14.248/2002
Classe II:             ABNT NBR 10.004:2004 · PNRS Lei 12.305/2010
Grupo D:               PNRS Lei 12.305/2010

━━━ PROIBIDO ━━━
✗ Seção "Apresentação da Empresa"
✗ Seção "Diferenciais"
✗ Seção "Encerramento" ou texto de agradecimento
✗ Parágrafos com mais de 2 linhas em qualquer bloco
✗ Qualquer conteúdo que não esteja nos 6 blocos acima
✗ Numerar seções (1., 2., 3. etc.)
✗ Mais de 2 páginas A4`;

// ─── CONFIG GRUPOS ────────────────────────────────────────────────────────────
const GRUPOS = [
  { id: "A",   label: "Grupo A",    desc: "Biológicos (bombonas)" },
  { id: "B",   label: "Grupo B",    desc: "Químicos (recipiente compatível)" },
  { id: "E",   label: "Grupo E",    desc: "Perfurocortantes (descartex)" },
  { id: "D",   label: "Grupo D",    desc: "Domiciliar / comum" },
  { id: "I",   label: "Classe I",   desc: "Perigoso industrial" },
  { id: "IIA", label: "Classe II-A", desc: "Não perigoso / não inerte" },
  { id: "IIB", label: "Classe II-B", desc: "Não perigoso / inerte" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtBRL(v: any) {
  return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function gerarNumero(cidade: string) {
  const siglas: Record<string, string> = {
    goiania:"GOI", anapolis:"ANA", aparecida:"APG", luziania:"LUZ",
    formosa:"FOR", cabeceiras:"CAB", catalao:"CAT", jatai:"JAT",
    itumbiara:"ITU", "rio verde":"RVE", trindade:"TRI",
  };
  const chave = (cidade || "").toLowerCase().split(/[\s–\-]/)[0];
  const sigla = siglas[chave] || (cidade || "XXX").replace(/[^a-zA-Z]/g,"").substring(0,3).toUpperCase();
  const seq = String(Math.floor(Math.random() * 899) + 101);
  return `BL-${new Date().getFullYear()}-${sigla}-${seq}`;
}

// ─── UI PRIMITIVOS ────────────────────────────────────────────────────────────
const Label = ({ children, required }: any) => (
  <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, marginBottom: 4,
    textTransform: "uppercase", letterSpacing: ".06em" }}>
    {children}{required && <span style={{ color: C.erro }}> *</span>}
  </div>
);

const Inp = ({ style, ...p }: any) => (
  <input style={{ width: "100%", padding: "7px 10px", fontSize: 13,
    border: "0.5px solid #ccc", borderRadius: 6,
    background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)", fontFamily: "inherit", outline: "none", ...style }} {...p} />
);

const Sel = ({ children, ...p }: any) => (
  <select style={{ width: "100%", padding: "7px 10px", fontSize: 13,
    border: "0.5px solid #ccc", borderRadius: 6,
    background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)", fontFamily: "inherit", outline: "none" }} {...p}>
    {children}
  </select>
);

const Card = ({ title, icon, children }: any) => (
  <div style={{ background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10,
    padding: "14px 16px", marginBottom: 10 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: C.vmed, textTransform: "uppercase",
      letterSpacing: ".08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
      {icon} {title}
    </div>
    {children}
  </div>
);

const Row = ({ children, cols = 2, gap = 10 }: any) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap, marginBottom: 10 }}>
    {children}
  </div>
);

const Field = ({ label, required, children }: any) => (
  <div><Label required={required}>{label}</Label>{children}</div>
);

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
function GeradorPropostas() {
  const [form, setForm] = useState({
    cliente_nome: "", cliente_tipo: "publico", cliente_cidade: "",
    cliente_cnpj: "", cliente_endereco: "", cliente_email: "",
    cliente_tel: "", cliente_contato: "",
    locais: "", frequencia: "mensal",
    vol_min: "0", vol_max: "500",
    preco_kg: "6.90", pagamento: "30 dias após cada coleta",
    prazo_inicio: "7", validade: "60",
    num_proposta: "", obs: "",
  });
  const [grupos, setGrupos] = useState<Record<string, boolean>>({
    A: true, B: false, E: true, D: false, I: false, IIA: false, IIB: false,
  });
  const [loading, setLoading] = useState(false);
  const [proposta, setProposta] = useState("");
  const [erro, setErro] = useState("");
  const [copied, setCopied] = useState(false);
  const outRef = useRef<HTMLDivElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const maxEst = fmtBRL((parseFloat(form.vol_max) || 0) * (parseFloat(form.preco_kg) || 0));
  const numProposta = form.num_proposta || gerarNumero(form.cliente_cidade);
  const gruposSel = GRUPOS.filter(g => grupos[g.id]);

  const validar = () => {
    if (!form.cliente_nome.trim()) return "Informe o nome do cliente.";
    if (!form.cliente_cidade.trim()) return "Informe a cidade do cliente.";
    if (!form.locais.trim()) return "Informe os locais de coleta.";
    if (gruposSel.length === 0) return "Selecione pelo menos um grupo de resíduo.";
    if (!form.preco_kg || parseFloat(form.preco_kg) <= 0) return "Informe o preço por kg.";
    return null;
  };

  const gerar = async () => {
    const err = validar();
    if (err) { setErro(err); return; }
    setErro("");
    setLoading(true);
    setProposta("");

    const tipoLabel = ({ publico: "Público", privado: "Privado", terceiro_setor: "Terceiro Setor" } as any)[form.cliente_tipo];
    const freqLabel = ({ mensal: "Mensal", quinzenal: "Quinzenal", semanal: "Semanal", sob_demanda: "Sob demanda" } as any)[form.frequencia];
    const grpTexto = gruposSel.map(g => `${g.label} — ${g.desc}`).join("\n  ");
    const hoje = new Date().toLocaleDateString("pt-BR");
    const precoFmt = parseFloat(form.preco_kg).toFixed(2).replace(".", ",");

    const userMsg = `Gere a proposta com os dados abaixo. Siga EXATAMENTE os 6 blocos definidos. NÃO adicione seções extras.

NÚMERO: ${numProposta}
DATA: ${hoje}

CLIENTE:
- Nome: ${form.cliente_nome}
- CNPJ: ${form.cliente_cnpj || "Não informado"}
- Endereço: ${form.cliente_endereco || "Não informado"}
- E-mail: ${form.cliente_email || "Não informado"}
- Telefone: ${form.cliente_tel || "Não informado"}
- Contato: ${form.cliente_contato || "Não informado"}
- Tipo: ${tipoLabel}
- Cidade: ${form.cliente_cidade}

SERVIÇO:
- Locais de coleta: ${form.locais}
- Grupos de resíduo:
  ${grpTexto}
- Frequência: ${freqLabel}
- Volume: ${form.vol_min} a ${form.vol_max} kg/coleta

COMERCIAL:
- Preço: R$ ${precoFmt}/kg
- Máximo estimado: R$ ${maxEst} (${form.vol_max} kg × R$ ${precoFmt})
- Pagamento: ${form.pagamento}
- Prazo de início: ${form.prazo_inicio} dias úteis após assinatura
- Validade: ${form.validade} dias corridos
${form.obs ? `\nOBSERVAÇÕES ESPECIAIS: ${form.obs}` : ""}

LEMBRE: apenas os 6 blocos. Sem seções numeradas. Sem apresentação. Sem encerramento. 1 folha A4.`;

    try {
      const res = await fetch("/api/anthropic-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1800,
          system: SYSTEM,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const texto = data.content?.map((b: any) => b.text || "").join("") || "";
      setProposta(texto);
      setTimeout(() => outRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setErro("Erro ao conectar com a IA. Verifique a conexão e tente novamente.");
    }
    setLoading(false);
  };

  const copiar = () => {
    navigator.clipboard.writeText(proposta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const limpar = () => {
    setForm({
      cliente_nome: "", cliente_tipo: "publico", cliente_cidade: "",
      cliente_cnpj: "", cliente_endereco: "", cliente_email: "",
      cliente_tel: "", cliente_contato: "",
      locais: "", frequencia: "mensal",
      vol_min: "0", vol_max: "500", preco_kg: "6.90",
      pagamento: "30 dias após cada coleta", prazo_inicio: "7",
      validade: "60", num_proposta: "", obs: "",
    });
    setGrupos({ A: true, B: false, E: true, D: false, I: false, IIA: false, IIB: false });
    setProposta("");
    setErro("");
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "1rem 0", maxWidth: 680, fontFamily: "var(--font-sans)" }}>

      {/* TOPO */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>
            Gerador de Propostas
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>
            Modelo compacto · 1 folha A4 · Bio Logus Ambiental
          </div>
        </div>
        <div style={{ fontSize: 11, background: C.vclr, color: C.vmed, padding: "4px 12px",
          borderRadius: 20, fontWeight: 600, border: `0.5px solid ${C.vacc}` }}>
          {numProposta}
        </div>
      </div>

      {/* ── BLOCO CLIENTE ───────────────────────────────────────────────────── */}
      <Card title="Dados do Cliente" icon="🏢">
        <Row cols={2}>
          <Field label="Razão Social / Nome" required>
            <Inp value={form.cliente_nome} onChange={(e: any) => set("cliente_nome", e.target.value)}
              placeholder="ex: Clínica Constanza Marçal" />
          </Field>
          <Field label="Tipo de Cliente" required>
            <Sel value={form.cliente_tipo} onChange={(e: any) => set("cliente_tipo", e.target.value)}>
              <option value="publico">Público (prefeitura, fundo, hospital)</option>
              <option value="privado">Privado (clínica, laboratório, indústria)</option>
              <option value="terceiro_setor">Terceiro Setor (ONG, associação)</option>
            </Sel>
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="CNPJ">
            <Inp value={form.cliente_cnpj} onChange={(e: any) => set("cliente_cnpj", e.target.value)}
              placeholder="ex: 27.894.384/0001-90" />
          </Field>
          <Field label="Cidade – UF" required>
            <Inp value={form.cliente_cidade} onChange={(e: any) => set("cliente_cidade", e.target.value)}
              placeholder="ex: Goiânia – GO" />
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="Endereço">
            <Inp value={form.cliente_endereco} onChange={(e: any) => set("cliente_endereco", e.target.value)}
              placeholder="ex: Rua J 31, 145 – Setor Jáo" />
          </Field>
          <Field label="E-mail">
            <Inp value={form.cliente_email} onChange={(e: any) => set("cliente_email", e.target.value)}
              placeholder="ex: contato@clinica.com.br" />
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="Telefone">
            <Inp value={form.cliente_tel} onChange={(e: any) => set("cliente_tel", e.target.value)}
              placeholder="ex: (62) 9855-5661" />
          </Field>
          <Field label="Contato (nome e cargo)">
            <Inp value={form.cliente_contato} onChange={(e: any) => set("cliente_contato", e.target.value)}
              placeholder="ex: Talita Alves – Adm." />
          </Field>
        </Row>
      </Card>

      {/* ── BLOCO SERVIÇO ────────────────────────────────────────────────────── */}
      <Card title="Dados do Serviço" icon="🚛">
        <Field label="Locais de Coleta" required>
          <Inp value={form.locais} onChange={(e: any) => set("locais", e.target.value)}
            placeholder="ex: Clínica — Rua J 31, 145, Setor Jáo, Goiânia/GO"
            style={{ marginBottom: 12 }} />
        </Field>

        <Label required>Grupos de Resíduo</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
          {GRUPOS.map(g => (
            <label key={g.id} style={{
              display: "flex", alignItems: "center", gap: 7, fontSize: 12.5,
              color: "var(--color-text-secondary)", cursor: "pointer", padding: "5px 8px",
              borderRadius: 6, transition: "all .15s",
              background: grupos[g.id] ? C.vclr : "transparent",
              border: `0.5px solid ${grupos[g.id] ? C.vacc : "transparent"}`,
            }}>
              <input type="checkbox" checked={grupos[g.id]}
                onChange={e => setGrupos(gs => ({ ...gs, [g.id]: e.target.checked }))}
                style={{ accentColor: C.vmed, width: 14, height: 14, cursor: "pointer" }} />
              <span><strong>{g.label}</strong> — {g.desc}</span>
            </label>
          ))}
        </div>

        <Row cols={2}>
          <Field label="Frequência de Coleta" required>
            <Sel value={form.frequencia} onChange={(e: any) => set("frequencia", e.target.value)}>
              <option value="mensal">Mensal</option>
              <option value="quinzenal">Quinzenal</option>
              <option value="semanal">Semanal</option>
              <option value="sob_demanda">Sob demanda</option>
            </Sel>
          </Field>
          <Field label="Volume estimado (kg/coleta)" required>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Inp type="number" value={form.vol_min}
                onChange={(e: any) => set("vol_min", e.target.value)} style={{ width: 70 }} min="0" />
              <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", flexShrink: 0 }}>a</span>
              <Inp type="number" value={form.vol_max}
                onChange={(e: any) => set("vol_max", e.target.value)} style={{ width: 70 }} min="0" />
              <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", flexShrink: 0 }}>kg</span>
            </div>
          </Field>
        </Row>
      </Card>

      {/* ── BLOCO COMERCIAL ──────────────────────────────────────────────────── */}
      <Card title="Dados Comerciais" icon="💰">
        <Row cols={2}>
          <div>
            <Label required>Preço por kg (R$)</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.vesc }}>R$</span>
              <Inp type="number" step="0.01" value={form.preco_kg}
                onChange={(e: any) => set("preco_kg", e.target.value)}
                style={{ fontSize: 18, fontWeight: 700, color: C.vesc, maxWidth: 100,
                  border: `1.5px solid ${C.vacc}` }} />
              <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>/kg</span>
            </div>
            <div style={{ fontSize: 12, background: C.vclr, color: C.vmed,
              padding: "5px 10px", borderRadius: 6, marginTop: 6,
              border: `0.5px solid ${C.vacc}` }}>
              Máx. estimado: <strong>R$ {maxEst}</strong>
            </div>
          </div>
          <Field label="Forma de Pagamento">
            <Sel value={form.pagamento} onChange={(e: any) => set("pagamento", e.target.value)}>
              <option>30 dias após cada coleta</option>
              <option>28 dias após cada coleta</option>
              <option>15 dias após cada coleta</option>
              <option>À vista na coleta</option>
            </Sel>
          </Field>
        </Row>

        <Row cols={3}>
          <Field label="Prazo início (dias úteis)">
            <Inp type="number" value={form.prazo_inicio} min="1" max="30"
              onChange={(e: any) => set("prazo_inicio", e.target.value)} />
          </Field>
          <Field label="Validade (dias corridos)">
            <Inp type="number" value={form.validade} min="15" max="180"
              onChange={(e: any) => set("validade", e.target.value)} />
          </Field>
          <Field label="Número da proposta">
            <Inp value={form.num_proposta || numProposta}
              onChange={(e: any) => set("num_proposta", e.target.value)}
              placeholder={numProposta} />
          </Field>
        </Row>

        <Field label="Observações / Condições especiais">
          <textarea value={form.obs} onChange={e => set("obs", e.target.value)}
            placeholder="ex: Sujeito a empenho; reajuste anual IGP-M; coleta em múltiplos pontos..."
            style={{ width: "100%", padding: "7px 10px", fontSize: 13, borderRadius: 6,
              minHeight: 52, border: "0.5px solid #ccc",
              background: "var(--color-background-secondary)",
              color: "var(--color-text-primary)", fontFamily: "inherit",
              resize: "vertical", outline: "none" }} />
        </Field>
      </Card>

      {/* ERRO */}
      {erro && (
        <div style={{ background: C.erroBg, border: `0.5px solid ${C.erro}`, borderRadius: 6,
          padding: "10px 14px", fontSize: 13, color: C.erro, marginBottom: 10 }}>
          ⚠ {erro}
        </div>
      )}

      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={gerar} disabled={loading}
          style={{ background: loading ? "#5a8a65" : C.vesc, color: "#fff", border: "none",
            borderRadius: 7, padding: "10px 22px", fontSize: 13.5, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8, transition: "background .2s" }}>
          {loading ? (
            <>
              <span style={{ display: "inline-block", width: 14, height: 14,
                border: "2px solid #fff", borderTopColor: "transparent",
                borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              Gerando proposta compacta…
            </>
          ) : "✦ Gerar Proposta — 1 Folha"}
        </button>
        <button onClick={limpar}
          style={{ background: "var(--color-background-secondary)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 7, padding: "10px 16px", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit" }}>
          Limpar
        </button>
      </div>

      {/* OUTPUT */}
      {proposta && (
        <div ref={outRef} style={{ background: "var(--color-background-primary)",
          border: `1.5px solid ${C.vacc}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: C.vesc, padding: "10px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
              ✦ Proposta gerada — {numProposta} · modelo 1 folha
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copiar}
                style={{ fontSize: 12, padding: "4px 12px", borderRadius: 5,
                  cursor: "pointer", color: "#fff", fontFamily: "inherit",
                  background: copied ? C.vacc : "rgba(255,255,255,0.15)",
                  border: "0.5px solid rgba(255,255,255,0.3)",
                  transition: "background .2s" }}>
                {copied ? "✓ Copiado!" : "Copiar texto"}
              </button>
              <button onClick={() => setProposta("")}
                style={{ fontSize: 12, padding: "4px 10px", borderRadius: 5,
                  cursor: "pointer", color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.1)",
                  border: "0.5px solid rgba(255,255,255,0.2)",
                  fontFamily: "inherit" }}>
                ✕
              </button>
            </div>
          </div>
          <pre style={{ padding: "16px 18px", fontSize: 12.5, lineHeight: 1.75,
            whiteSpace: "pre-wrap", color: "var(--color-text-primary)",
            fontFamily: "'Courier New', monospace", margin: 0,
            maxHeight: 560, overflowY: "auto" }}>
            {proposta}
          </pre>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
