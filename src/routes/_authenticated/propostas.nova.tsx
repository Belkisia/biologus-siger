import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { gerarPropostaIA } from "@/lib/proposta-ai.functions";

export const Route = createFileRoute("/_authenticated/propostas/nova")({
  component: GeradorPropostas,
});

// ─── PALETA BRAND ────────────────────────────────────────────────────────────
const C = {
  vesc: "#0E3D1A",
  vmed: "#1A6B2E",
  vacc: "#2E8B47",
  vclr: "#EAF4ED",
  branco: "#FFFFFF",
  cinza: "#3D3D3D",
  muted: "#666666",
  erro: "#A32D2D",
  erroBg: "#FCEBEB",
};

// ─── SISTEMA PROMPT ──────────────────────────────────────────────────────────
const SYSTEM = `Você é o gerador oficial de propostas comerciais da Bio Logus Ambiental, empresa de gestão de resíduos sólidos sediada em Goiânia-GO.

IDENTIDADE FIXA (nunca alterar):
- Empresa: Bio Logus Ambiental | CNPJ: 26.484.921/0001-60
- Sede: Goiânia – GO | Tel: (62) 3558-2791 / (62) 9 8423-6682
- E-mail: comercial@biologusambiental.com.br | Responsável: Belkisia P. Santana

Ao receber os dados, gere uma proposta técnica e comercial compacta estruturada EXATAMENTE assim:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BIO LOGUS AMBIENTAL · Gestão Inteligente de Resíduos · Goiânia – GO
CNPJ 26.484.921/0001-60 · [NÚMERO DA PROPOSTA] · Emitida em [DATA]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESTINATÁRIO
[Nome do cliente] — [Cidade–UF]
[Descrição resumida do serviço em 1 linha]

CONDIÇÕES COMERCIAIS
Validade: [X dias] | Início: [X dias úteis] | Pagamento: [forma]
Frequência: [freq] | Volume: [min] a [max] kg/coleta

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVIÇO CONTRATADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Coleta, transporte e destinação final ambientalmente adequada de:
[Listar cada grupo de resíduo selecionado com acondicionamento correto]

INCLUSO SEM CUSTO ADICIONAL:
▸ Pesagem + comprovante assinado no ato da coleta
▸ MTR (Manifesto de Transporte de Resíduos)
▸ CDF (Certificado de Destinação Final) em até 15 dias
▸ Nota Fiscal discriminada por grupo e peso
▸ Veículo licenciado SEMARH-GO com monitoramento de rota

PREÇO: R$ [X,XX] por kg coletado
Valor máximo estimado: R$ [total] ([max]kg × R$ [preço])
Faturamento pelo peso efetivamente coletado. Sem cobrança mínima.
Conformidade: [citar apenas normas aplicáveis aos grupos selecionados]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBRIGAÇÕES DA CONTRATADA          | OBRIGAÇÕES DO CONTRATANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[5 itens adaptados ao tipo]       | [5 itens adaptados ao tipo]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Cláusula jurídica: público=empenho+IGP-M | privado=CC+multa 2%]
[Observações adicionais se houver]

ASSINATURA
Contratada: Belkisia P. Santana – Comercial | Contratante: _______________
Data: ___/___/${new Date().getFullYear()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NORMAS POR GRUPO (usar somente as aplicáveis):
- Grupos A, B, E (RSS): RDC ANVISA 222/2018 · CONAMA 358/2005 · PNRS Lei 12.305/10
- Classe I industrial: ABNT NBR 10.004:2004 · PNRS Lei 12.305/10 · Lei GO 14.248/2002
- Classe II: ABNT NBR 10.004:2004 · PNRS Lei 12.305/10
- Grupo D: PNRS Lei 12.305/10

Tom: formal, direto, sem floreios. Verbos no infinitivo nas obrigações. Nunca inventar dados não fornecidos.`;

// ─── GRUPOS CONFIG ────────────────────────────────────────────────────────────
const GRUPOS = [
  { id: "A", label: "Grupo A", desc: "Biológicos (bombonas)" },
  { id: "B", label: "Grupo B", desc: "Químicos (recipiente compatível)" },
  { id: "E", label: "Grupo E", desc: "Perfurocortantes (descartex)" },
  { id: "D", label: "Grupo D", desc: "Domiciliar / comum" },
  { id: "I", label: "Classe I", desc: "Perigoso industrial" },
  { id: "IIA", label: "Classe II-A", desc: "Não perigoso / não inerte" },
  { id: "IIB", label: "Classe II-B", desc: "Não perigoso / inerte" },
] as const;

type GrupoId = (typeof GRUPOS)[number]["id"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return Number(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function gerarNumero(cidade: string) {
  const siglas: Record<string, string> = {
    goiania: "GOI",
    anapolis: "ANA",
    aparecida: "APG",
    luziania: "LUZ",
    formosa: "FOR",
    cabeceiras: "CAB",
    catalao: "CAT",
    jatai: "JAT",
    itumbiara: "ITU",
    "rio verde": "RVE",
    "aguas lindas": "AGL",
    trindade: "TRI",
    senador: "SEN",
  };
  const chave = (cidade || "").toLowerCase().split(/[\s–-]/)[0];
  const sigla =
    siglas[chave] ||
    (cidade || "XXX").replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
  const seq = String(Math.floor(Math.random() * 899) + 101);
  return `BL-${new Date().getFullYear()}-${sigla}-${seq}`;
}

// ─── UI HELPERS ──────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: C.cinza,
  textTransform: "uppercase",
  letterSpacing: 0.3,
  marginBottom: 4,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  fontSize: 13,
  borderRadius: 6,
  border: "0.5px solid #ccc",
  background: "#fff",
  color: C.cinza,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={labelStyle}>
        {label}
        {required && <span style={{ color: C.erro }}> *</span>}
      </span>
      {children}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.vclr}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.vesc,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: `1px solid ${C.vclr}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
function GeradorPropostas() {
  const [form, setForm] = useState({
    cliente_nome: "",
    cliente_tipo: "publico",
    cliente_cidade: "",
    cliente_contato: "",
    locais: "",
    frequencia: "mensal",
    vol_min: "0",
    vol_max: "500",
    preco_kg: "6.90",
    pagamento: "30 dias após cada coleta",
    prazo_inicio: "7",
    validade: "60",
    num_proposta: "",
    obs: "",
  });
  const [grupos, setGrupos] = useState<Record<GrupoId, boolean>>({
    A: true,
    B: false,
    E: true,
    D: false,
    I: false,
    IIA: false,
    IIB: false,
  });
  const [loading, setLoading] = useState(false);
  const [proposta, setProposta] = useState("");
  const [erro, setErro] = useState("");
  const [copied, setCopied] = useState(false);
  const outRef = useRef<HTMLDivElement | null>(null);

  const gerarIA = useServerFn(gerarPropostaIA);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const maxEst = fmtBRL(
    (parseFloat(form.vol_max) || 0) * (parseFloat(form.preco_kg) || 0),
  );
  const numProposta = form.num_proposta || gerarNumero(form.cliente_cidade);
  const gruposSel = GRUPOS.filter((g) => grupos[g.id]);

  const validar = () => {
    if (!form.cliente_nome.trim()) return "Informe o nome do cliente.";
    if (!form.cliente_cidade.trim()) return "Informe a cidade do cliente.";
    if (!form.locais.trim()) return "Informe os locais de coleta.";
    if (gruposSel.length === 0)
      return "Selecione pelo menos um grupo de resíduo.";
    if (!form.preco_kg || parseFloat(form.preco_kg) <= 0)
      return "Informe o preço por kg.";
    return null;
  };

  const gerar = async () => {
    const err = validar();
    if (err) {
      setErro(err);
      return;
    }
    setErro("");
    setLoading(true);
    setProposta("");

    const tipoLabel = {
      publico: "Público",
      privado: "Privado",
      terceiro_setor: "Terceiro Setor",
    }[form.cliente_tipo as "publico" | "privado" | "terceiro_setor"];
    const freqLabel = {
      mensal: "Mensal",
      quinzenal: "Quinzenal",
      semanal: "Semanal",
      sob_demanda: "Sob demanda",
    }[form.frequencia as "mensal" | "quinzenal" | "semanal" | "sob_demanda"];
    const grpTexto = gruposSel
      .map((g) => `${g.label} — ${g.desc}`)
      .join("\n  ");
    const hoje = new Date().toLocaleDateString("pt-BR");

    const userMsg = `Gere a proposta com estes dados:

NÚMERO: ${numProposta}
DATA: ${hoje}

CLIENTE:
- Nome: ${form.cliente_nome}
- Tipo: ${tipoLabel}
- Cidade: ${form.cliente_cidade}
- Contato: ${form.cliente_contato || "Não informado"}

SERVIÇO:
- Locais: ${form.locais}
- Grupos de resíduo:
  ${grpTexto}
- Frequência: ${freqLabel}
- Volume: ${form.vol_min} a ${form.vol_max} kg/coleta

COMERCIAL:
- Preço: R$ ${parseFloat(form.preco_kg).toFixed(2).replace(".", ",")} por kg
- Máximo estimado: R$ ${maxEst} (${form.vol_max} kg × R$ ${parseFloat(form.preco_kg).toFixed(2).replace(".", ",")})
- Pagamento: ${form.pagamento}
- Início: ${form.prazo_inicio} dias úteis
- Validade: ${form.validade} dias corridos
${form.obs ? `\nOBSERVAÇÕES: ${form.obs}` : ""}`;

    try {
      const { text } = await gerarIA({ data: { system: SYSTEM, user: userMsg } });
      setProposta(text);
      setTimeout(
        () => outRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setErro(message || "Erro ao conectar com a IA. Tente novamente.");
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
      cliente_nome: "",
      cliente_tipo: "publico",
      cliente_cidade: "",
      cliente_contato: "",
      locais: "",
      frequencia: "mensal",
      vol_min: "0",
      vol_max: "500",
      preco_kg: "6.90",
      pagamento: "30 dias após cada coleta",
      prazo_inicio: "7",
      validade: "60",
      num_proposta: "",
      obs: "",
    });
    setGrupos({
      A: true,
      B: false,
      E: true,
      D: false,
      I: false,
      IIA: false,
      IIB: false,
    });
    setProposta("");
    setErro("");
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", fontFamily: "inherit" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `2px solid ${C.vesc}`,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.vesc }}>
            Gerador de Propostas
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            Bio Logus Ambiental · SIGER PRO
          </div>
        </div>
        <div
          style={{
            background: C.vclr,
            color: C.vesc,
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: "'Courier New', monospace",
          }}
        >
          {numProposta}
        </div>
      </div>

      {/* DADOS DO CLIENTE */}
      <Card title="Dados do Cliente">
        <Row>
          <Field label="Nome do cliente" required>
            <input
              style={inputStyle}
              value={form.cliente_nome}
              onChange={(e) => set("cliente_nome", e.target.value)}
              placeholder="ex: Fundo Municipal de Saúde de Cabeceiras"
            />
          </Field>
          <Field label="Tipo">
            <select
              style={inputStyle}
              value={form.cliente_tipo}
              onChange={(e) => set("cliente_tipo", e.target.value)}
            >
              <option value="publico">Público (prefeitura, fundo, hospital)</option>
              <option value="privado">Privado (clínica, laboratório, indústria)</option>
              <option value="terceiro_setor">Terceiro Setor (ONG, associação)</option>
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="Cidade – UF" required>
            <input
              style={inputStyle}
              value={form.cliente_cidade}
              onChange={(e) => set("cliente_cidade", e.target.value)}
              placeholder="ex: Cabeceiras – GO"
            />
          </Field>
          <Field label="Contato">
            <input
              style={inputStyle}
              value={form.cliente_contato}
              onChange={(e) => set("cliente_contato", e.target.value)}
              placeholder="ex: João Silva – Secretário de Saúde"
            />
          </Field>
        </Row>
      </Card>

      {/* DADOS DO SERVIÇO */}
      <Card title="Serviço">
        <Field label="Locais de coleta" required>
          <input
            style={{ ...inputStyle, marginBottom: 12 }}
            value={form.locais}
            onChange={(e) => set("locais", e.target.value)}
            placeholder="ex: Unidades de saúde do município, UPA, Hospital Municipal"
          />
        </Field>

        <span style={labelStyle}>Grupos de resíduo</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {GRUPOS.map((g) => (
            <label
              key={g.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                color: C.cinza,
                padding: "6px 8px",
                background: grupos[g.id] ? C.vclr : "transparent",
                borderRadius: 5,
                cursor: "pointer",
                border: `0.5px solid ${grupos[g.id] ? C.vacc : "#e5e5e5"}`,
              }}
            >
              <input
                type="checkbox"
                checked={grupos[g.id]}
                onChange={(e) =>
                  setGrupos((gs) => ({ ...gs, [g.id]: e.target.checked }))
                }
                style={{
                  accentColor: C.vmed,
                  width: 14,
                  height: 14,
                  cursor: "pointer",
                }}
              />
              <span>
                <strong>{g.label}</strong> — {g.desc}
              </span>
            </label>
          ))}
        </div>

        <Row>
          <Field label="Frequência">
            <select
              style={inputStyle}
              value={form.frequencia}
              onChange={(e) => set("frequencia", e.target.value)}
            >
              <option value="mensal">Mensal</option>
              <option value="quinzenal">Quinzenal</option>
              <option value="semanal">Semanal</option>
              <option value="sob_demanda">Sob demanda</option>
            </select>
          </Field>
          <Field label="Volume estimado por coleta">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                style={{ ...inputStyle, width: 80 }}
                min="0"
                value={form.vol_min}
                onChange={(e) => set("vol_min", e.target.value)}
              />
              <span style={{ fontSize: 12, color: C.muted }}>a</span>
              <input
                type="number"
                style={{ ...inputStyle, width: 80 }}
                min="0"
                value={form.vol_max}
                onChange={(e) => set("vol_max", e.target.value)}
              />
              <span style={{ fontSize: 12, color: C.muted }}>kg</span>
            </div>
          </Field>
        </Row>
      </Card>

      {/* DADOS COMERCIAIS */}
      <Card title="Comercial">
        <Row>
          <Field label="Preço por kg (R$)" required>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: C.muted }}>R$</span>
              <input
                type="number"
                step="0.01"
                value={form.preco_kg}
                onChange={(e) => set("preco_kg", e.target.value)}
                style={{
                  ...inputStyle,
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.vesc,
                  maxWidth: 110,
                  border: `1.5px solid ${C.vacc}`,
                }}
              />
              <span style={{ fontSize: 12, color: C.muted }}>/kg</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Máx. estimado: <strong>R$ {maxEst}</strong>
            </div>
          </Field>
          <Field label="Pagamento">
            <select
              style={inputStyle}
              value={form.pagamento}
              onChange={(e) => set("pagamento", e.target.value)}
            >
              <option>30 dias após cada coleta</option>
              <option>28 dias após cada coleta</option>
              <option>15 dias após cada coleta</option>
              <option>À vista na coleta</option>
            </select>
          </Field>
        </Row>

        <Row>
          <Field label="Início (dias úteis)">
            <input
              type="number"
              style={inputStyle}
              min="0"
              value={form.prazo_inicio}
              onChange={(e) => set("prazo_inicio", e.target.value)}
            />
          </Field>
          <Field label="Validade (dias)">
            <input
              type="number"
              style={inputStyle}
              min="0"
              value={form.validade}
              onChange={(e) => set("validade", e.target.value)}
            />
          </Field>
          <Field label="Nº da proposta (opcional)">
            <input
              style={inputStyle}
              value={form.num_proposta}
              onChange={(e) => set("num_proposta", e.target.value)}
              placeholder={numProposta}
            />
          </Field>
        </Row>

        <Field label="Observações">
          <textarea
            value={form.obs}
            onChange={(e) => set("obs", e.target.value)}
            placeholder="ex: Sujeito a emissão de empenho; cláusula de reajuste anual IGP-M..."
            style={{
              ...inputStyle,
              minHeight: 60,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </Field>
      </Card>

      {/* ERRO */}
      {erro && (
        <div
          style={{
            background: C.erroBg,
            border: `0.5px solid ${C.erro}`,
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            color: C.erro,
            marginBottom: 10,
          }}
        >
          {erro}
        </div>
      )}

      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={gerar}
          disabled={loading}
          style={{
            background: loading ? "#5a8a65" : C.vesc,
            color: "#fff",
            border: "none",
            borderRadius: 7,
            padding: "10px 22px",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "background .2s",
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Gerando proposta…
            </>
          ) : (
            "✦ Gerar Proposta com IA"
          )}
        </button>
        <button
          onClick={limpar}
          style={{
            background: "#f5f5f5",
            color: C.cinza,
            border: "0.5px solid #ccc",
            borderRadius: 7,
            padding: "10px 16px",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Limpar
        </button>
      </div>

      {/* OUTPUT */}
      {proposta && (
        <div
          ref={outRef}
          style={{
            background: "#fff",
            border: `1.5px solid ${C.vacc}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: C.vesc,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
              ✦ Proposta gerada — {numProposta}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={copiar}
                style={{
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: copied ? C.vacc : "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "0.5px solid rgba(255,255,255,0.3)",
                  fontFamily: "inherit",
                  transition: "background .2s",
                }}
              >
                {copied ? "✓ Copiado!" : "Copiar texto"}
              </button>
              <button
                onClick={() => setProposta("")}
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  border: "0.5px solid rgba(255,255,255,0.2)",
                  fontFamily: "inherit",
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <pre
            style={{
              padding: "16px 18px",
              fontSize: 12.5,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: C.cinza,
              fontFamily: "'Courier New', monospace",
              margin: 0,
              overflowX: "auto",
              maxHeight: 520,
              overflowY: "auto",
            }}
          >
            {proposta}
          </pre>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
