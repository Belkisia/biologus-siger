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

function valorPorExtenso(n: number): string {
  const inteiro = Math.floor(n);
  const cents = Math.round((n - inteiro) * 100);
  const f = (x: number) => x.toLocaleString("pt-BR");
  const reais = `${f(inteiro)} ${inteiro === 1 ? "real" : "reais"}`;
  return cents > 0 ? `${reais} e ${cents} centavos` : reais;
}

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
  const { numero, data_emissao, validade, cliente, total } = args;
  const dataBR = new Date(data_emissao + "T00:00:00").toLocaleDateString("pt-BR");
  const diasValidade = validade
    ? Math.max(
        1,
        Math.round(
          (new Date(validade + "T00:00:00").getTime() -
            new Date(data_emissao + "T00:00:00").getTime()) /
            86400000,
        ),
      )
    : 30;
  const valorNum = fmtBRL(total);
  const valorExt = valorPorExtenso(total);
  const contato = cliente.responsavel_tecnico || "Responsável";
  const enderecoCompleto = `${cliente.endereco || ""}${cliente.cidade ? " — " + cliente.cidade : ""}${cliente.estado ? "/" + cliente.estado : ""}`.trim();

  // Legislações de referência (rodapé compacto)
  const legendaLeis = LEGISLACOES.slice(0, 3).join(" · ");

  return `
<div style="width:190mm;min-height:277mm;margin:0 auto;padding:10mm 12mm;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.45;box-sizing:border-box">
  <div style="text-align:center;border-bottom:2px solid #0E3D1A;padding-bottom:6px;margin-bottom:10px">
    <div style="font-size:16px;font-weight:800;color:#0E3D1A">PROPOSTA COMERCIAL Nº ${numero}</div>
    <div style="font-size:10px;color:#374151">Data: ${dataBR}</div>
  </div>

  <div style="margin-bottom:8px">
    <div><b>À</b> ${cliente.razao_social}${cliente.nome_fantasia ? " (" + cliente.nome_fantasia + ")" : ""}</div>
    <div><b>CNPJ:</b> ${cliente.cnpj} &nbsp; <b>End.:</b> ${enderecoCompleto || "—"}</div>
    <div><b>A/C:</b> ${contato} &nbsp; <b>Contato:</b> ${cliente.email || "—"} · ${cliente.telefone || "—"}</div>
    <div><b>Ref.:</b> Proposta Técnica para Elaboração de PGRSS (Plano de Gerenciamento de Resíduos de Serviços de Saúde)</div>
  </div>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">1. APRESENTAÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">
    Somos especializados em consultoria ambiental e engenharia de saúde e segurança do trabalho. Apresentamos a seguir nossa proposta para a elaboração do PGRSS, atendendo à Resolução RDC ANVISA nº 222/2018 e demais legislações municipais e estaduais vigentes.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">2. ESCOPO DOS SERVIÇOS</b></div>
  <ul style="margin:0 0 8px 16px;padding:0">
    <li><b>Diagnóstico e Classificação:</b> identificação e quantificação dos resíduos (Grupos A, B, C, D e E) conforme a norma da ANVISA.</li>
    <li><b>Elaboração do Documento (PGRSS):</b> redação do plano detalhando segregação, acondicionamento, identificação, transporte interno, armazenamento e destinação final.</li>
  </ul>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">3. PRAZO DE EXECUÇÃO</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">
    O prazo total para a entrega do documento final, impresso e em meio digital (PDF), será de <b>30 dias úteis</b>, contados a partir da aprovação desta proposta e da disponibilização das informações necessárias pela contratante.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">4. INVESTIMENTO</b></div>
  <p style="margin:0 0 8px 0">
    O valor total para a prestação dos serviços descritos acima é de <b>${valorNum}</b> (${valorExt}).<br/>
    <b>Condições de Pagamento:</b> 50% no aceite da proposta e 50% na entrega do documento final.<br/>
    <b>Formas aceitas:</b> Boleto bancário, PIX ou transferência.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">5. VALIDADE DA PROPOSTA</b></div>
  <p style="margin:0 0 8px 0">Esta proposta é válida por <b>${diasValidade} dias</b> a partir da data de emissão.</p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">6. RESPONSABILIDADES TÉCNICAS E LEGAIS</b></div>
  <p style="margin:0 0 8px 0;text-align:justify">
    <b>Da Contratada:</b> emissão de ART (Anotação de Responsabilidade Técnica) e enquadramento às normas da RDC ANVISA nº 222/2018 e CONAMA nº 358/2005.<br/>
    <b>Do Cliente:</b> fornecimento de plantas arquitetônicas (se houver), acesso às instalações e execução das melhorias estruturais propostas no plano.
  </p>

  <div style="margin-bottom:4px"><b style="color:#0E3D1A">7. DE ACORDO / ACEITE</b></div>
  <p style="margin:0 0 10px 0">Para aprovação, por favor, assine este documento e devolva-o por e-mail ou WhatsApp.</p>

  <div style="font-size:11px;line-height:1.9">
    <div><b>De acordo:</b></div>
    <div>Nome: ______________________________________________</div>
    <div>Cargo: ______________________________________________</div>
    <div>Data: ____ / ____ / ______</div>
    <div style="margin-top:14px;border-top:1px solid #111;width:60%;text-align:center;padding-top:4px">Assinatura</div>
  </div>

  <div style="position:relative;margin-top:10px;font-size:8.5px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;padding-top:4px">
    ${legendaLeis}
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
