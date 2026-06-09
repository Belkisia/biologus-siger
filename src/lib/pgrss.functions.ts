import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Tipos compartilhados
// ---------------------------------------------------------------------------
export const QuestionarioPgrss = z.object({
  // Identificação
  tipo_estabelecimento: z.string().min(1),
  area_construida: z.coerce.number().nonnegative().default(0),
  qtd_funcionarios: z.coerce.number().int().nonnegative().default(0),
  qtd_leitos: z.coerce.number().int().nonnegative().default(0),
  qtd_salas: z.coerce.number().int().nonnegative().default(0),
  // Grupos RSS
  gera_grupo_a: z.boolean().default(false),
  gera_grupo_b: z.boolean().default(false),
  gera_grupo_c: z.boolean().default(false),
  gera_grupo_d: z.boolean().default(false),
  gera_grupo_e: z.boolean().default(false),
  // Infraestrutura
  possui_abrigo_temporario: z.boolean().default(false),
  possui_armazenamento_externo: z.boolean().default(false),
  possui_coleta_especializada: z.boolean().default(false),
  possui_mtr: z.boolean().default(false),
  possui_licenciamento: z.boolean().default(false),
  possui_treinamento: z.boolean().default(false),
  possui_pgrss_vigente: z.boolean().default(false),
  // Comercial
  distancia_km: z.coerce.number().nonnegative().default(0),
  qtd_visitas: z.coerce.number().int().min(1).default(1),
  qtd_treinamentos: z.coerce.number().int().nonnegative().default(1),
  incluir_art: z.boolean().default(true),
  incluir_atualizacao_anual: z.boolean().default(true),
  incluir_consultoria_mensal: z.boolean().default(false),
  meses_consultoria: z.coerce.number().int().nonnegative().default(0),
  porte: z.enum(["pequeno", "medio", "grande"]).default("pequeno"),
  observacoes: z.string().optional().default(""),
});
export type QuestionarioPgrssT = z.infer<typeof QuestionarioPgrss>;

// ---------------------------------------------------------------------------
// Preços (configuração do admin)
// ---------------------------------------------------------------------------
export const obterPrecosPgrss = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("pgrss_precos")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    if (data) return data;
    const { data: novo, error } = await supabase
      .from("pgrss_precos")
      .insert({ owner_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return novo;
  });

const PrecosInput = z.object({
  preco_elaboracao: z.coerce.number().nonnegative(),
  preco_visita_tecnica: z.coerce.number().nonnegative(),
  preco_deslocamento_km: z.coerce.number().nonnegative(),
  preco_art: z.coerce.number().nonnegative(),
  preco_treinamento: z.coerce.number().nonnegative(),
  preco_atualizacao_anual: z.coerce.number().nonnegative(),
  preco_consultoria_mensal: z.coerce.number().nonnegative(),
  multiplicador_pequeno: z.coerce.number().positive(),
  multiplicador_medio: z.coerce.number().positive(),
  multiplicador_grande: z.coerce.number().positive(),
});

export const salvarPrecosPgrss = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PrecosInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("pgrss_precos")
      .upsert({ owner_id: userId, ...data }, { onConflict: "owner_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Motor de cálculo (puro, exportado para reuso na UI também)
// ---------------------------------------------------------------------------
export type PrecosBase = {
  preco_elaboracao: number;
  preco_visita_tecnica: number;
  preco_deslocamento_km: number;
  preco_art: number;
  preco_treinamento: number;
  preco_atualizacao_anual: number;
  preco_consultoria_mensal: number;
  multiplicador_pequeno: number;
  multiplicador_medio: number;
  multiplicador_grande: number;
};

export type ItemCalculado = {
  descricao: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
};

export function calcularProposta(q: QuestionarioPgrssT, p: PrecosBase): {
  itens: ItemCalculado[];
  total: number;
  mult: number;
} {
  const mult =
    q.porte === "grande"
      ? Number(p.multiplicador_grande)
      : q.porte === "medio"
        ? Number(p.multiplicador_medio)
        : Number(p.multiplicador_pequeno);

  const itens: ItemCalculado[] = [];
  const add = (descricao: string, quantidade: number, unidade: string, valor_unitario: number) => {
    if (valor_unitario <= 0 || quantidade <= 0) return;
    itens.push({
      descricao,
      quantidade,
      unidade,
      valor_unitario,
      valor_total: +(quantidade * valor_unitario).toFixed(2),
    });
  };

  add("Elaboração do PGRSS (diagnóstico + documento técnico)", 1, "serv", +(Number(p.preco_elaboracao) * mult).toFixed(2));
  add("Visita técnica ao estabelecimento", q.qtd_visitas, "visita", Number(p.preco_visita_tecnica));
  if (q.distancia_km > 0)
    add("Deslocamento técnico", q.distancia_km, "km", Number(p.preco_deslocamento_km));
  if (q.incluir_art) add("ART (Anotação de Responsabilidade Técnica)", 1, "doc", Number(p.preco_art));
  if (q.qtd_treinamentos > 0)
    add("Treinamento de colaboradores", q.qtd_treinamentos, "turma", Number(p.preco_treinamento));
  if (q.incluir_atualizacao_anual)
    add("Atualização anual do PGRSS", 1, "ano", Number(p.preco_atualizacao_anual));
  if (q.incluir_consultoria_mensal && q.meses_consultoria > 0)
    add("Consultoria ambiental mensal", q.meses_consultoria, "mês", Number(p.preco_consultoria_mensal));

  const total = +itens.reduce((s, i) => s + i.valor_total, 0).toFixed(2);
  return { itens, total, mult };
}

// ---------------------------------------------------------------------------
// Geração de HTML (proposta premium) — usado para salvar e imprimir
// ---------------------------------------------------------------------------
const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const LEGISLACOES = [
  "RDC ANVISA nº 222/2018 — Boas práticas de gerenciamento de RSS",
  "Resolução CONAMA nº 358/2005 — Tratamento e disposição final de RSS",
  "Lei nº 12.305/2010 — Política Nacional de Resíduos Sólidos",
  "Decreto nº 10.936/2022 — Regulamenta a PNRS",
  "ABNT NBR 12.808, 12.809, 12.810 e 13.853 — Resíduos de serviços de saúde",
];

export function montarHtmlProposta(args: {
  numero: string;
  data_emissao: string; // yyyy-mm-dd
  validade?: string | null;
  cliente: {
    razao_social: string;
    nome_fantasia?: string | null;
    cnpj: string;
    endereco?: string | null;
    cidade?: string | null;
    estado?: string | null;
    email?: string | null;
    telefone?: string | null;
    responsavel_tecnico?: string | null;
  };
  questionario: QuestionarioPgrssT;
  itens: ItemCalculado[];
  total: number;
  escopoIA?: string;
}): string {
  const { numero, data_emissao, validade, cliente, questionario: q, itens, total, escopoIA } = args;
  const grupos = [
    q.gera_grupo_a && "A (biológico/infectante)",
    q.gera_grupo_b && "B (químico)",
    q.gera_grupo_c && "C (rejeitos radioativos)",
    q.gera_grupo_d && "D (comum)",
    q.gera_grupo_e && "E (perfurocortante)",
  ].filter(Boolean).join(" · ") || "—";

  const dataBR = new Date(data_emissao + "T00:00:00").toLocaleDateString("pt-BR");
  const valBR = validade ? new Date(validade + "T00:00:00").toLocaleDateString("pt-BR") : "30 dias";

  const itensRows = itens
    .map(
      (i, idx) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${idx + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${i.descricao}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${i.quantidade} ${i.unidade}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmtBRL(i.valor_unitario)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right"><b>${fmtBRL(i.valor_total)}</b></td>
      </tr>`,
    )
    .join("");

  const escopoSection = escopoIA
    ? `<div style="white-space:pre-wrap;line-height:1.55">${escopoIA.replace(/</g, "&lt;")}</div>`
    : `<ul style="line-height:1.7;padding-left:18px;margin:0">
        <li>Diagnóstico ambiental e levantamento operacional</li>
        <li>Classificação e quantificação dos resíduos gerados</li>
        <li>Mapeamento dos pontos geradores e fluxograma interno</li>
        <li>Procedimentos de segregação, acondicionamento e identificação</li>
        <li>Coleta, transporte e armazenamento interno e externo</li>
        <li>Destinação final ambientalmente adequada</li>
        <li>Treinamento de colaboradores e plano de contingência</li>
        <li>Monitoramento, indicadores e adequação à legislação vigente</li>
      </ul>`;

  return `
<div style="max-width:820px;margin:0 auto;color:#111827;font-family:Arial,Helvetica,sans-serif">
  <!-- CAPA -->
  <div style="background:linear-gradient(135deg,#0E3D1A,#1A6B2E);color:#fff;padding:36px 28px;border-radius:8px;margin-bottom:24px">
    <div style="font-size:11px;letter-spacing:.2em;opacity:.85">PROPOSTA TÉCNICA E COMERCIAL</div>
    <div style="font-size:28px;font-weight:800;margin-top:8px">Plano de Gerenciamento de Resíduos de Serviços de Saúde</div>
    <div style="font-size:14px;margin-top:10px;opacity:.95">Elaboração de PGRSS conforme RDC ANVISA 222/2018</div>
    <div style="margin-top:22px;display:flex;justify-content:space-between;font-size:12px">
      <div><b>Nº ${numero}</b> · Emitida em ${dataBR}</div>
      <div>Validade: ${valBR}</div>
    </div>
  </div>

  <!-- DESTINATÁRIO -->
  <h2 style="font-size:13px;color:#1A6B2E;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #1A6B2E;padding-bottom:6px">Destinatário</h2>
  <table style="width:100%;font-size:13px;line-height:1.6;margin-bottom:18px">
    <tr><td style="width:35%;color:#6b7280">Razão Social</td><td><b>${cliente.razao_social}</b></td></tr>
    ${cliente.nome_fantasia ? `<tr><td style="color:#6b7280">Nome Fantasia</td><td>${cliente.nome_fantasia}</td></tr>` : ""}
    <tr><td style="color:#6b7280">CNPJ</td><td>${cliente.cnpj}</td></tr>
    <tr><td style="color:#6b7280">Endereço</td><td>${cliente.endereco || "—"} — ${cliente.cidade || ""}/${cliente.estado || ""}</td></tr>
    <tr><td style="color:#6b7280">Contato</td><td>${cliente.email || "—"} · ${cliente.telefone || "—"}</td></tr>
    ${cliente.responsavel_tecnico ? `<tr><td style="color:#6b7280">Responsável Técnico</td><td>${cliente.responsavel_tecnico}</td></tr>` : ""}
  </table>

  <!-- PERFIL OPERACIONAL -->
  <h2 style="font-size:13px;color:#1A6B2E;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #1A6B2E;padding-bottom:6px">Perfil operacional</h2>
  <table style="width:100%;font-size:13px;line-height:1.6;margin-bottom:18px">
    <tr><td style="width:35%;color:#6b7280">Tipo de estabelecimento</td><td>${q.tipo_estabelecimento}</td></tr>
    <tr><td style="color:#6b7280">Área construída / Funcionários / Leitos / Salas</td>
        <td>${q.area_construida || "—"} m² · ${q.qtd_funcionarios} func. · ${q.qtd_leitos} leitos · ${q.qtd_salas} salas</td></tr>
    <tr><td style="color:#6b7280">Grupos de resíduos gerados</td><td><b>${grupos}</b></td></tr>
    <tr><td style="color:#6b7280">Porte considerado</td><td>${q.porte.toUpperCase()}</td></tr>
  </table>

  <!-- ESCOPO -->
  <h2 style="font-size:13px;color:#1A6B2E;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #1A6B2E;padding-bottom:6px">Escopo dos serviços</h2>
  <div style="font-size:13px;margin-bottom:18px">${escopoSection}</div>

  <!-- INVESTIMENTO -->
  <h2 style="font-size:13px;color:#1A6B2E;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #1A6B2E;padding-bottom:6px">Investimento</h2>
  <table style="width:100%;font-size:12.5px;border-collapse:collapse;margin-bottom:8px">
    <thead>
      <tr style="background:#EAF4ED;color:#0E3D1A">
        <th style="padding:8px;text-align:left;width:40px">#</th>
        <th style="padding:8px;text-align:left">Descrição</th>
        <th style="padding:8px;text-align:center;width:110px">Qtd.</th>
        <th style="padding:8px;text-align:right;width:120px">Valor Unit.</th>
        <th style="padding:8px;text-align:right;width:130px">Total</th>
      </tr>
    </thead>
    <tbody>${itensRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="padding:10px;text-align:right;font-weight:700;background:#0E3D1A;color:#fff">VALOR TOTAL</td>
        <td style="padding:10px;text-align:right;font-weight:800;background:#0E3D1A;color:#fff">${fmtBRL(total)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- CONDIÇÕES -->
  <h2 style="font-size:13px;color:#1A6B2E;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #1A6B2E;padding-bottom:6px;margin-top:20px">Condições</h2>
  <table style="width:100%;font-size:13px;line-height:1.6;margin-bottom:18px">
    <tr><td style="width:35%;color:#6b7280">Prazo de execução</td><td>30 a 45 dias após emissão da Ordem de Serviço</td></tr>
    <tr><td style="color:#6b7280">Validade da proposta</td><td>${valBR}</td></tr>
    <tr><td style="color:#6b7280">Forma de pagamento</td><td>50% na assinatura, 50% na entrega final · Boleto bancário</td></tr>
  </table>

  <!-- LEGISLAÇÃO -->
  <h2 style="font-size:13px;color:#1A6B2E;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #1A6B2E;padding-bottom:6px">Base legal e normativa</h2>
  <ul style="font-size:12px;line-height:1.6;padding-left:18px;color:#374151">
    ${LEGISLACOES.map((l) => `<li>${l}</li>`).join("")}
  </ul>

  <!-- ACEITE -->
  <div style="margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:12px">
    <div style="border-top:1px solid #111;padding-top:6px;text-align:center">CONTRATADA</div>
    <div style="border-top:1px solid #111;padding-top:6px;text-align:center">CONTRATANTE — ${cliente.razao_social}</div>
  </div>

  <div style="margin-top:28px;text-align:center;font-size:10.5px;color:#6b7280">
    Proposta gerada via SIGER PRO · ${dataBR}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// Salvar proposta PGRSS (cria registro em propostas + itens)
// ---------------------------------------------------------------------------
const SalvarInput = z.object({
  cliente_id: z.string().uuid(),
  numero: z.string().min(1),
  validade: z.string().optional().nullable(),
  questionario: QuestionarioPgrss,
  conteudo_html: z.string().min(1),
  itens: z.array(
    z.object({
      descricao: z.string(),
      quantidade: z.number(),
      unidade: z.string(),
      valor_unitario: z.number(),
      valor_total: z.number(),
    }),
  ),
  valor_total: z.number(),
});

export const salvarPropostaPgrss = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalvarInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prop, error } = await supabase
      .from("propostas")
      .insert({
        owner_id: userId,
        cliente_id: data.cliente_id,
        numero: data.numero,
        tipo: "pgrss",
        valor_total: data.valor_total,
        validade: data.validade ?? null,
        status: "rascunho",
        dados_pgrss: data.questionario,
        conteudo_html: data.conteudo_html,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (data.itens.length) {
      const { error: e2 } = await supabase.from("proposta_itens").insert(
        data.itens.map((i, idx) => ({
          proposta_id: prop.id,
          descricao: i.descricao,
          quantidade: i.quantidade,
          unidade: i.unidade,
          valor_unitario: i.valor_unitario,
          valor_total: i.valor_total,
          ordem: idx,
        })),
      );
      if (e2) throw new Error(e2.message);
    }
    return { id: prop.id };
  });

export const obterPropostaPgrss = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: prop, error } = await supabase
      .from("propostas")
      .select("*, cliente:clientes(*)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return prop;
  });

export const listarPropostasPgrss = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("propostas")
      .select("id, numero, data_emissao, valor_total, status, cliente:clientes(razao_social)")
      .eq("tipo", "pgrss")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
