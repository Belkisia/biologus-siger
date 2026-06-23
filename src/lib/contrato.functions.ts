import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
<<<<<<< HEAD

// =============================
// Engine de renderização (puro)
// =============================
export function renderTemplate(
  html: string,
  vars: Record<string, string | number | null | undefined>,
) {
  return html.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    if (v === null || v === undefined || v === "")
      return `<span style="color:#b91c1c">[${key}]</span>`;
    return String(v);
  });
}

function brl(v: number | null | undefined) {
  if (v == null) return "";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dataBR(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-BR");
}

type ClienteVars = Record<string, string | number | null | undefined>;
type ContratoVars = Record<string, string | number | null | undefined>;
type PropostaVars = Record<string, string | number | boolean | null | undefined>;
type ItemVars = {
  descricao?: string | null;
  grupo_residuo?: string | null;
  tipo_residuo?: string | null;
  unidade?: string | null;
  franquia?: string | number | null;
  quantidade?: string | number | null;
  preco_unitario?: string | number | null;
  preco_excedente?: string | number | null;
  valor_unitario?: string | number | null;
};

type PropostaItemRow = {
  descricao?: string | null;
  tipo_residuo?: string | null;
  unidade?: string | null;
  valor_unitario?: string | number | null;
  quantidade?: string | number | null;
};

// Constrói o dicionário de variáveis a partir do cliente + opcionalmente contrato/proposta + itens
export function buildVars(args: {
  cliente: ClienteVars | null;
  contrato?: ContratoVars | null;
  proposta?: PropostaVars | null;
  itens?: Array<ItemVars> | null;
  empresa?: {
    razao_social: string;
    cnpj: string;
    endereco: string;
    email: string;
    telefone: string;
  };
}) {
  const e = args.empresa || {
    razao_social: "BIO LOGUS AMBIENTAL LTDA - ME",
    cnpj: "26.484.921/0001-60",
    endereco:
      "Rua Iporá, nº 258, Qd. 18, Lt. 12, Bairro Nossa Senhora de Fátima - Goiânia-GO, CEP 74.420-290",
    email: "comercial@biologusambientental.com.br",
    telefone: "(62) 3558-2791",
  };
  const c = args.cliente || {};
  const ct = args.contrato || {};
  const itens = args.itens || [];

  // Agrupamento de resíduos
  const grupos = Array.from(
    new Set(itens.map((i) => (i.grupo_residuo || "").trim()).filter(Boolean)),
  ).sort();
  const gruposStr = grupos.length
    ? grupos.length === 1
      ? `Grupo ${grupos[0]}`
      : `Grupos ${grupos.slice(0, -1).join(", ")} e ${grupos.slice(-1)}`
    : "";
  const limiteKg = itens.reduce((s, i) => s + (Number(i.franquia) || 0), 0);
  const excedentes = itens.map((i) => Number(i.preco_excedente)).filter((v) => v > 0);
  const excedenteMedio = excedentes.length
    ? excedentes.reduce((a, b) => a + b, 0) / excedentes.length
    : 0;
  const tabelaItens = itens.length
    ? `<table style="width:100%;border-collapse:collapse;margin:8px 0" border="1" cellpadding="6">
<thead><tr><th>Descrição do resíduo</th><th>Grupo</th><th>Unidade</th><th>Franquia</th><th>Preço unitário</th><th>Excedente</th></tr></thead>
<tbody>${itens.map((i) => `<tr><td>${i.descricao || ""}</td><td>${i.grupo_residuo || "—"}</td><td>${i.unidade || "kg"}</td><td>${i.franquia != null ? `${i.franquia} ${i.unidade || "kg"}` : "—"}</td><td>${brl(Number(i.preco_unitario))}</td><td>${i.preco_excedente ? brl(Number(i.preco_excedente)) : "—"}</td></tr>`).join("")}</tbody></table>`
    : "";
  const objetoDescricao = itens.length
    ? itens
        .map((i) => i.descricao)
        .filter(Boolean)
        .join("; ")
    : "resíduos de serviços de saúde";
  const localColeta = [
    c.endereco,
    c.numero && `nº ${c.numero}`,
    c.bairro,
    c.cidade && `${c.cidade}/${c.estado || ""}`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    CONTRATO_NUMERO: ct.numero || "",
    DATA_CONTRATO: dataBR(new Date().toISOString().slice(0, 10)),
    CLIENTE_RAZAO_SOCIAL: c.razao_social || "",
    CLIENTE_NOME_FANTASIA: c.nome_fantasia || "",
    CLIENTE_CNPJ: c.cnpj || "",
    CLIENTE_CPF: c.cnpj || "",
    CLIENTE_INSCRICAO_ESTADUAL: c.inscricao_estadual || "",
    CLIENTE_INSCRICAO_MUNICIPAL: c.inscricao_municipal || "",
    CLIENTE_CNAE: c.cnae || "",
    CLIENTE_PORTE: c.porte || "",
    CLIENTE_ENDERECO: [c.endereco, c.numero && `nº ${c.numero}`, c.bairro]
      .filter(Boolean)
      .join(", "),
    CLIENTE_LOGRADOURO: c.endereco || "",
    CLIENTE_NUMERO: c.numero || "",
    CLIENTE_BAIRRO: c.bairro || "",
    CLIENTE_CIDADE: c.cidade || "",
    CLIENTE_ESTADO: c.estado || "",
    CLIENTE_CEP: c.cep || "",
    CLIENTE_EMAIL: c.email || "",
    CLIENTE_TELEFONE: c.telefone || c.whatsapp || "",
    CLIENTE_WHATSAPP: c.whatsapp || "",
    REPRESENTANTE_NOME:
      c.responsavel_financeiro || c.responsavel_tecnico || c.responsavel_operacional || "",
    REPRESENTANTE_CPF: c.representante_cpf || c.cnpj || "",
    RESPONSAVEL_TECNICO: c.responsavel_tecnico || "",
    RESPONSAVEL_FINANCEIRO: c.responsavel_financeiro || "",
    RESPONSAVEL_OPERACIONAL: c.responsavel_operacional || "",
    VALOR_MENSAL: brl(ct.valor_mensal == null ? null : Number(ct.valor_mensal)),
    LIMITE_KG: limiteKg ? `${limiteKg.toLocaleString("pt-BR")}` : "",
    VALOR_EXCEDENTE: excedenteMedio ? brl(excedenteMedio) : "",
    FREQUENCIA_COLETA:
      ct.periodicidade_reajuste === "mensal"
        ? "mensal"
        : ct.frequencia_coleta || "mensal (1 vez ao mês)",
    FORMA_PAGAMENTO: ct.forma_pagamento || "boleto bancário",
    DIA_VENCIMENTO: ct.dia_vencimento ? String(ct.dia_vencimento) : "",
    VIGENCIA_ANOS: ct.vigencia_anos ? String(ct.vigencia_anos) : "01 (um)",
    GRUPOS_RESIDUOS: gruposStr || "A, B e E",
    LOCAL_COLETA: localColeta,
    OBJETO_DESCRICAO: objetoDescricao,
    TABELA_RESIDUOS: tabelaItens,
    TECNOLOGIA_TRATAMENTO:
      "autoclavagem, incineração ou aterro sanitário industrial, conforme classe e características do resíduo",
    VIGENCIA: ct.data_fim
      ? `${dataBR(String(ct.data_inicio || ""))} a ${dataBR(String(ct.data_fim || ""))}`
      : `a partir de ${dataBR(String(ct.data_inicio || ""))}`,
    DATA_INICIO: dataBR(String(ct.data_inicio || "")),
    DATA_FIM: dataBR(String(ct.data_fim || "")),
    EMPRESA_RAZAO_SOCIAL: e.razao_social,
    EMPRESA_CNPJ: e.cnpj,
    EMPRESA_ENDERECO: e.endereco,
    EMPRESA_EMAIL: e.email,
    EMPRESA_TELEFONE: e.telefone,
    BLOCO_ASSINATURA: `
<table style="width:100%;margin-top:48px;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px">
  <tr>
    <td style="width:48%;text-align:center;vertical-align:bottom;padding:0 16px">
      <div style="border-top:1.5px solid #333;padding-top:8px;margin-top:64px">
        <strong>${c.razao_social || ""}</strong><br>
        <span style="color:#555">CONTRATANTE</span>
      </div>
    </td>
    <td style="width:4%"></td>
    <td style="width:48%;text-align:center;vertical-align:bottom;padding:0 16px">
      <div style="border-top:1.5px solid #333;padding-top:8px;margin-top:64px">
        <strong>BIO LOGUS AMBIENTAL LTDA – ME</strong><br>
        <span style="color:#555">CONTRATADA</span>
      </div>
    </td>
  </tr>
</table>`,
  };
}

// =============================
// Listar / Obter modelos
// =============================
export const listarModelos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contrato_modelos")
      .select("id, nome, descricao, ativo, versao_atual, owner_id, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  });

export const obterModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: m, error } = await context.supabase
      .from("contrato_modelos")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return m;
  });

export const listarVersoes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { modelo_id: string }) => z.object({ modelo_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("contrato_modelo_versoes")
      .select("id, versao, motivo, created_at, alterado_por")
      .eq("modelo_id", data.modelo_id)
      .order("versao", { ascending: false });
    if (error) throw new Error(error.message);
    return rows || [];
  });

// =============================
// Criar / Atualizar / Duplicar
// =============================
const ModeloInput = z.object({
  nome: z.string().trim().min(1).max(200),
  descricao: z.string().max(1000).optional().nullable(),
  conteudo_html: z.string().max(200000),
  ativo: z.boolean().optional(),
});

export const criarModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof ModeloInput>) => ModeloInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: m, error } = await context.supabase
      .from("contrato_modelos")
      .insert({
        owner_id: context.userId,
        nome: data.nome,
        descricao: data.descricao || null,
        conteudo_html: data.conteudo_html,
        ativo: data.ativo ?? true,
        versao_atual: 1,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("contrato_modelo_versoes").insert({
      modelo_id: m!.id,
      versao: 1,
      conteudo_html: data.conteudo_html,
      motivo: "Versão inicial",
      alterado_por: context.userId,
    });
    return m;
  });

export const atualizarModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id: string;
      nome: string;
      descricao?: string | null;
      conteudo_html: string;
      motivo?: string;
    }) =>
      z
        .object({
          id: z.string().uuid(),
          nome: z.string().trim().min(1).max(200),
          descricao: z.string().max(1000).optional().nullable(),
          conteudo_html: z.string().max(200000),
          motivo: z.string().max(500).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: atual, error: e1 } = await context.supabase
      .from("contrato_modelos")
      .select("conteudo_html, versao_atual")
      .eq("id", data.id)
      .single();
    if (e1) throw new Error(e1.message);
    const mudou = atual!.conteudo_html !== data.conteudo_html;
    const novaVersao = mudou ? (atual!.versao_atual || 1) + 1 : atual!.versao_atual || 1;
    const { error } = await context.supabase
      .from("contrato_modelos")
      .update({
        nome: data.nome,
        descricao: data.descricao || null,
        conteudo_html: data.conteudo_html,
        versao_atual: novaVersao,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    if (mudou) {
      await context.supabase.from("contrato_modelo_versoes").insert({
        modelo_id: data.id,
        versao: novaVersao,
        conteudo_html: data.conteudo_html,
        motivo: data.motivo || "Atualização",
        alterado_por: context.userId,
      });
    }
    return { ok: true, versao: novaVersao };
  });

export const duplicarModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: src, error } = await context.supabase
      .from("contrato_modelos")
      .select("nome, descricao, conteudo_html")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { data: novo, error: e2 } = await context.supabase
      .from("contrato_modelos")
      .insert({
        owner_id: context.userId,
        nome: `${src!.nome} (cópia)`,
        descricao: src!.descricao,
        conteudo_html: src!.conteudo_html,
        ativo: true,
        versao_atual: 1,
      })
      .select("id")
      .single();
    if (e2) throw new Error(e2.message);
    await context.supabase.from("contrato_modelo_versoes").insert({
      modelo_id: novo!.id,
      versao: 1,
      conteudo_html: src!.conteudo_html,
      motivo: "Cópia de outro modelo",
      alterado_por: context.userId,
    });
    return novo;
  });

export const alternarAtivoModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; ativo: boolean }) =>
    z.object({ id: z.string().uuid(), ativo: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contrato_modelos")
      .update({ ativo: data.ativo })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const excluirModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contrato_modelos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const ContratoPadraoInput = z.object({
  cliente_id: z.string().uuid(),
  numero: z.string().trim().min(1).max(50),
  data_inicio: z.string().trim().min(1),
  data_fim: z.string().optional().nullable(),
  valor_mensal: z.coerce.number().optional().nullable(),
  indice_reajuste: z.string().optional().nullable(),
  periodicidade_reajuste: z.string().optional().nullable(),
  dia_vencimento: z.coerce.number().int().optional().nullable(),
  forma_pagamento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  grupos_residuos: z.string().optional().nullable(),
  frequencia_coleta_texto: z.string().optional().nullable(),
  limite_kg: z.coerce.number().optional().nullable(),
  valor_excedente: z.coerce.number().optional().nullable(),
  periodicidade_vigencia: z.string().optional().nullable(),
});

export const gerarContratoPadraoBioLogus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof ContratoPadraoInput>) => ContratoPadraoInput.parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: modelos, error: modelosError }, { data: cliente, error: clienteError }] =
      await Promise.all([
        context.supabase
          .from("contrato_modelos")
          .select("id,nome,conteudo_html,owner_id")
          .eq("ativo", true)
          .order("updated_at", { ascending: false }),
        context.supabase.from("clientes").select("*").eq("id", data.cliente_id).single(),
      ]);

    if (modelosError) throw new Error(modelosError.message);
    if (clienteError || !cliente) throw new Error("Cliente não encontrado.");

    const modelo = (modelos || []).find(
      (m) => m.owner_id === null && (m.conteudo_html?.length || 0) > 5000,
    );
    if (!modelo?.conteudo_html) {
      throw new Error("Modelo padrão não encontrado. Ative o modelo Bio Logus 2026.");
    }

    const vigenciaAnos =
      data.periodicidade_vigencia === "semestral"
        ? "0,5 (meio)"
        : data.periodicidade_vigencia === "trimestral"
          ? "0,25 (três meses)"
          : "01 (um)";

    const conteudo_html = renderTemplate(
      modelo.conteudo_html,
      buildVars({
        cliente,
        contrato: {
          numero: data.numero,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim || null,
          valor_mensal: data.valor_mensal ?? null,
          forma_pagamento: data.forma_pagamento || "",
          dia_vencimento: data.dia_vencimento ?? null,
          frequencia_coleta: data.frequencia_coleta_texto || "mensal (1 vez ao mês)",
          vigencia_anos: vigenciaAnos,
        },
        itens: data.limite_kg
          ? [
              {
                descricao: "Resíduos de serviços de saúde",
                grupo_residuo: data.grupos_residuos || "Grupo A, B e E",
                unidade: "kg",
                franquia: data.limite_kg,
                preco_unitario: 0,
                preco_excedente: data.valor_excedente || 0,
              },
            ]
          : [],
      }),
    );

    const { data: novo, error } = await context.supabase
      .from("contratos")
      .insert({
        owner_id: context.userId,
        cliente_id: data.cliente_id,
        numero: data.numero,
        objeto: "Coleta, transporte, tratamento e destinação final de resíduos de serviços de saúde",
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || null,
        valor_mensal: data.valor_mensal ?? null,
        frequencia_coleta: data.frequencia_coleta_texto || null,
        grupos_residuos: data.grupos_residuos || null,
        limite_kg: data.limite_kg ?? null,
        valor_excedente: data.valor_excedente ?? null,
        vigencia_anos: vigenciaAnos,
        indice_reajuste: data.indice_reajuste || null,
        periodicidade_reajuste: data.periodicidade_reajuste || null,
        dia_vencimento: data.dia_vencimento ?? null,
        forma_pagamento: data.forma_pagamento || null,
        observacoes: data.observacoes || null,
        status: data.status || "ativo",
        conteudo_html,
        modelo_id: modelo.id,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: novo!.id };
  });

// =============================
// Renderizar prévia
// =============================
export const renderizarModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { modelo_id: string; cliente_id: string; proposta_id?: string | null }) =>
    z
      .object({
        modelo_id: z.string().uuid(),
        cliente_id: z.string().uuid(),
        proposta_id: z.string().uuid().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: m } = await supabaseAdmin
      .from("contrato_modelos")
      .select("conteudo_html, nome")
      .eq("id", data.modelo_id)
      .single();
    const { data: cliente } = await supabaseAdmin
      .from("clientes")
      .select("*")
      .eq("id", data.cliente_id)
      .single();
    let itens: ItemVars[] = [];
    let proposta: PropostaVars | null = null;
    if (data.proposta_id) {
      proposta = (
        await supabaseAdmin.from("propostas").select("*").eq("id", data.proposta_id).single()
      ).data as unknown as PropostaVars | null;
      const { data: pis } = await supabaseAdmin
        .from("proposta_itens")
        .select("*")
        .eq("proposta_id", data.proposta_id)
        .order("ordem");
      itens = ((pis || []) as PropostaItemRow[]).map((i) => ({
        descricao: i.descricao,
        grupo_residuo: i.tipo_residuo,
        unidade: i.unidade,
        preco_unitario: i.valor_unitario,
        franquia: i.quantidade,
        preco_excedente: i.valor_unitario,
      }));
    }
    const html = renderTemplate(m!.conteudo_html, buildVars({ cliente, proposta, itens }));
    return { html, nome: m!.nome };
  });

// =============================
// Gerar contrato a partir do modelo
// =============================
export const gerarContratoDeModelo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      modelo_id: string;
      cliente_id: string;
      proposta_id?: string | null;
      numero: string;
      data_inicio: string;
      data_fim?: string | null;
      valor_mensal?: number | null;
      conteudo_html_editado?: string | null;
    }) =>
      z
        .object({
          modelo_id: z.string().uuid(),
          cliente_id: z.string().uuid(),
          proposta_id: z.string().uuid().optional().nullable(),
          numero: z.string().min(1).max(50),
          data_inicio: z.string(),
          data_fim: z.string().optional().nullable(),
          valor_mensal: z.number().nullable().optional(),
          conteudo_html_editado: z.string().max(200000).optional().nullable(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: m, error: em } = await supabaseAdmin
      .from("contrato_modelos")
      .select("conteudo_html")
      .eq("id", data.modelo_id)
      .single();
    if (em || !m) throw new Error("Modelo não encontrado");
    const { data: cliente } = await supabaseAdmin
      .from("clientes")
      .select("*")
      .eq("id", data.cliente_id)
      .single();

    let itens: ItemVars[] = [];
    if (data.proposta_id) {
      const { data: pis } = await supabaseAdmin
        .from("proposta_itens")
        .select("*")
        .eq("proposta_id", data.proposta_id)
        .order("ordem");
      itens = ((pis || []) as PropostaItemRow[]).map((i) => ({
        descricao: i.descricao,
        grupo_residuo: i.tipo_residuo,
        unidade: i.unidade,
        preco_unitario: i.valor_unitario,
        franquia: i.quantidade,
        preco_excedente: i.valor_unitario,
      }));
    }

    const contratoStub = {
      numero: data.numero,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim,
      valor_mensal: data.valor_mensal,
    };
    const html = renderTemplate(
      data.conteudo_html_editado || m.conteudo_html,
      buildVars({ cliente, contrato: contratoStub, itens }),
    );

    const { data: novo, error } = await supabaseAdmin
      .from("contratos")
      .insert({
        owner_id: context.userId,
        cliente_id: data.cliente_id,
        numero: data.numero,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || null,
        valor_mensal: data.valor_mensal || null,
        status: "ativo",
        modelo_id: data.modelo_id,
        conteudo_html: html,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (data.proposta_id) {
      await supabaseAdmin
        .from("propostas")
        .update({ contrato_id: novo!.id, status: "convertida" })
        .eq("id", data.proposta_id);
    }
    return { id: novo!.id };
  });

// =============================
// Visualização / preview / e-mail
// =============================

function htmlToDataUrl(html: string) {
  // btoa não trata UTF-8; usa encodeURIComponent + unescape
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(unescape(encodeURIComponent(html)))
      : Buffer.from(html, "utf-8").toString("base64");
  return `data:text/html;charset=utf-8;base64,${b64}`;
}

export const previewContratoRascunho = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      modelo_id: string;
      cliente_id: string;
      numero?: string | null;
      data_inicio?: string | null;
      data_fim?: string | null;
      valor_mensal?: number | null;
      conteudo_html_editado?: string | null;
    }) =>
      z
        .object({
          modelo_id: z.string().uuid(),
          cliente_id: z.string().uuid(),
          numero: z.string().optional().nullable(),
          data_inicio: z.string().optional().nullable(),
          data_fim: z.string().optional().nullable(),
          valor_mensal: z.number().optional().nullable(),
          conteudo_html_editado: z.string().max(200000).optional().nullable(),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: m } = await context.supabase
      .from("contrato_modelos")
      .select("conteudo_html")
      .eq("id", data.modelo_id)
      .single();
    const { data: cliente } = await context.supabase
      .from("clientes")
      .select("*")
      .eq("id", data.cliente_id)
      .single();
    const contratoStub = {
      numero: data.numero || "RASCUNHO",
      data_inicio: data.data_inicio || new Date().toISOString().slice(0, 10),
      data_fim: data.data_fim,
      valor_mensal: data.valor_mensal,
    };
    const html = renderTemplate(
      data.conteudo_html_editado || m?.conteudo_html || "",
      buildVars({ cliente, contrato: contratoStub, itens: [] }),
    );
    const wrapped = `<!doctype html><html><head><meta charset="utf-8"><title>Pré-visualização</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:24px auto;padding:0 24px;color:#111;line-height:1.5}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px}</style></head><body>${html}</body></html>`;
    return { url: htmlToDataUrl(wrapped), html };
  });

export const visualizarContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { contrato_id: string }) =>
    z.object({ contrato_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: c, error } = await context.supabase
      .from("contratos")
      .select("numero, conteudo_html, data_inicio, data_fim, valor_mensal, status, forma_pagamento, observacoes, clientes(razao_social, cnpj, endereco, numero, bairro, cidade, estado, cep)")
      .eq("id", data.contrato_id)
      .single();
    if (error || !c) throw new Error("Contrato não encontrado");

    let body = c.conteudo_html;
    if (!body || body.trim().length < 20) {
      const cli = (c as unknown as { clientes?: Record<string, string | null> }).clientes || {};
      const end = [cli.endereco, cli.numero, cli.bairro, cli.cidade, cli.estado, cli.cep].filter(Boolean).join(", ");
      body = `
        <h1 style="text-align:center">CONTRATO Nº ${c.numero}</h1>
        <h3>Contratante</h3>
        <p><strong>${cli.razao_social || "—"}</strong><br/>CNPJ: ${cli.cnpj || "—"}<br/>${end || "—"}</p>
        <h3>Dados do Contrato</h3>
        <table>
          <tr><td><strong>Início:</strong> ${dataBR(c.data_inicio)}</td><td><strong>Fim:</strong> ${dataBR(c.data_fim) || "Indeterminado"}</td></tr>
          <tr><td><strong>Valor mensal:</strong> ${brl(c.valor_mensal)}</td><td><strong>Forma pgto:</strong> ${c.forma_pagamento || "—"}</td></tr>
          <tr><td colspan="2"><strong>Status:</strong> ${c.status || "—"}</td></tr>
        </table>
        ${c.observacoes ? `<h3>Observações</h3><p>${c.observacoes}</p>` : ""}
        <p style="margin-top:32px;color:#888;font-size:12px;font-style:italic">* Contrato gerado antes da implantação do conteúdo HTML automático. Exibindo dados do registro.</p>
      `;
    }

    const wrapped = `<!doctype html><html><head><meta charset="utf-8"><title>Contrato ${c.numero}</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:24px auto;padding:0 24px;color:#111;line-height:1.5}table{border-collapse:collapse;width:100%;margin:8px 0}td,th{border:1px solid #999;padding:6px;text-align:left}h1{font-size:20px}h3{margin-top:20px;color:#0D6B54}</style></head><body>${body}</body></html>`;
    return { html: wrapped };
  });


export const enviarContratoEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { contrato_id: string; email: string; mensagem?: string | null }) =>
    z
      .object({
        contrato_id: z.string().uuid(),
        email: z.string().trim().email().max(255),
        mensagem: z.string().max(2000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: c, error } = await context.supabase
      .from("contratos")
      .select("numero, conteudo_html, clientes(razao_social)")
      .eq("id", data.contrato_id)
      .single();
    if (error || !c) throw new Error("Contrato não encontrado");

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY não configurado");
    const FROM = "Bio Logus Ambiental <onboarding@resend.dev>";
    const cliente = (c as unknown as { clientes?: { razao_social?: string } }).clientes;
    const nome = cliente?.razao_social || "Cliente";
    const numero = c.numero || "";
    const corpo = `
<div style="font-family:Arial,sans-serif;max-width:820px;margin:0 auto;padding:24px;color:#111">
  <div style="background:linear-gradient(135deg,#1a5d3f,#2d8a5f);color:#fff;padding:20px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Bio Logus Ambiental</h1>
    <p style="margin:4px 0 0;opacity:.85;font-size:13px">Contrato ${numero}</p>
  </div>
  <div style="background:#f7faf8;border:1px solid #d4e3d9;border-top:0;border-radius:0 0 8px 8px;padding:20px">
    <p>Olá, <strong>${nome}</strong>.</p>
    <p>Segue o contrato <strong>${numero}</strong> para sua análise.</p>
    ${data.mensagem ? `<p style="padding:12px;background:#fff;border-left:3px solid #2d8a5f;white-space:pre-wrap">${data.mensagem}</p>` : ""}
    <hr style="border:0;border-top:1px solid #d4e3d9;margin:16px 0"/>
    <div>${c.conteudo_html || ""}</div>
  </div>
</div>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [data.email],
        subject: `Contrato ${numero} - Bio Logus Ambiental`,
        html: corpo,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Falha no envio: ${res.status} ${t}`);
    }
    return { ok: true };
=======
import { buildVars, renderTemplate } from "./contrato-modelo.functions";



type ContratoItemPdf = {
  descricao: string | null;
  franquia: number | string | null;
  unidade: string | null;
  preco_unitario: number | string | null;
};

async function gerarPDFDoContrato(documento_id: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { gerarPDFContrato } = await import("./assinatura-pdf.server");

  const { data: contrato, error } = await supabaseAdmin
    .from("contratos")
    .select("*, clientes(razao_social, cnpj, endereco, email)")
    .eq("id", documento_id)
    .single();
  if (error || !contrato) throw new Error("Contrato não encontrado");

  const { data: itens } = await supabaseAdmin
    .from("contrato_itens")
    .select("descricao, franquia, unidade, preco_unitario")
    .eq("contrato_id", documento_id);

  const pdfBytes = await gerarPDFContrato({
    numero: contrato.numero,
    data: new Date().toLocaleDateString("pt-BR"),
    conteudoHtml: contrato.conteudo_html,
    contratante: {
      nome: contrato.clientes?.razao_social || "Cliente",
      cnpj: contrato.clientes?.cnpj || "",
      endereco: contrato.clientes?.endereco || "",
    },
    contratada: {
      nome: "Bio Logus Ambiental Ltda.",
      cnpj: "00.000.000/0001-00",
      endereco: "Endereço Bio Logus",
      email: "contato@biologus.com.br",
    },
    objeto: contrato.objeto || "",
    itens: ((itens || []) as ContratoItemPdf[]).map((i) => ({
      descricao: i.descricao || "",
      quantidade: Number(i.franquia || 0),
      unidade: i.unidade || "un",
      valor: Number(i.preco_unitario || 0),
    })),
    valorMensal: Number(contrato.valor_mensal || 0),
    formaPagamento: contrato.forma_pagamento || "boleto bancário",
    diaVencimento: contrato.dia_vencimento,
    vigenciaInicio: new Date(contrato.data_inicio).toLocaleDateString("pt-BR"),
    vigenciaFim: contrato.data_fim ? new Date(contrato.data_fim).toLocaleDateString("pt-BR") : null,
    indiceReajuste: contrato.indice_reajuste,
    periodicidadeReajuste: contrato.periodicidade_reajuste,
    observacoes: contrato.observacoes,
  });

  return { contrato, pdfBytes };
}

// Visualizar PDF do contrato (retorna URL temporária)
export const visualizarContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contrato_id: string }) =>
    z.object({ contrato_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { pdfBytes, contrato } = await gerarPDFDoContrato(data.contrato_id);
    const path = `preview/contrato/${data.contrato_id}.pdf`;
    const { error } = await supabaseAdmin.storage
      .from("documentos")
      .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (error) throw new Error("Falha ao gerar PDF: " + error.message);
    const { data: signed } = await supabaseAdmin.storage
      .from("documentos")
      .createSignedUrl(path, 3600);
    return { url: signed?.signedUrl || "", numero: contrato.numero };
  });

// Enviar contrato por e-mail (sem assinatura, apenas informativo)
export const enviarContratoEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contrato_id: string; email: string; mensagem?: string }) =>
    z
      .object({
        contrato_id: z.string().uuid(),
        email: z.string().email().max(255),
        mensagem: z.string().max(2000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("contratos")
      .update({
        ultimo_email_status: "processando",
        ultimo_email_em: new Date().toISOString(),
        ultimo_email_destino: data.email,
        ultimo_email_erro: null,
      })
      .eq("id", data.contrato_id);

    try {
      const { pdfBytes, contrato } = await gerarPDFDoContrato(data.contrato_id);
      const { enviarContratoInformativo } = await import("./assinatura-email.server");
      const base64 = Buffer.from(pdfBytes).toString("base64");
      await enviarContratoInformativo({
        to: data.email,
        nomeCliente: contrato.clientes?.razao_social || "Cliente",
        numeroContrato: contrato.numero,
        mensagem: data.mensagem,
        pdfBase64: base64,
      });
      await supabaseAdmin
        .from("contratos")
        .update({
          ultimo_email_status: "enviado",
          ultimo_email_em: new Date().toISOString(),
          ultimo_email_erro: null,
        })
        .eq("id", data.contrato_id);
      return { ok: true };
    } catch (e: unknown) {
      await supabaseAdmin
        .from("contratos")
        .update({
          ultimo_email_status: "falhou",
          ultimo_email_em: new Date().toISOString(),
          ultimo_email_erro: String(e instanceof Error ? e.message : e).slice(0, 500),
        })
        .eq("id", data.contrato_id);
      throw e;
    }
  });

// =============================
// Preview de contrato (antes de salvar)
// =============================
const PreviewInput = z.object({
  cliente_id: z.string().uuid(),
  numero: z.string().max(100).optional().nullable(),
  data_inicio: z.string().min(1),
  data_fim: z.string().optional().nullable(),
  valor_mensal: z.number().nullable().optional(),
  forma_pagamento: z.string().max(200).optional().nullable(),
  dia_vencimento: z.number().int().min(1).max(31).optional().nullable(),
  frequencia_coleta: z.string().max(200).optional().nullable(),
  limite_kg: z.number().nullable().optional(),
  valor_excedente: z.number().nullable().optional(),
  grupos_residuos: z.string().max(200).optional().nullable(),
  representante_nome: z.string().max(200).optional().nullable(),
  representante_cpf: z.string().max(50).optional().nullable(),
  vigencia_anos: z.string().max(50).optional().nullable(),
});

export const previewContratoRascunho = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof PreviewInput>) => PreviewInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { gerarPDFContrato } = await import("./assinatura-pdf.server");

    const [{ data: modelos }, { data: cliente }] = await Promise.all([
      supabaseAdmin
        .from("contrato_modelos")
        .select("id, nome, conteudo_html, owner_id")
        .eq("ativo", true)
        .order("updated_at", { ascending: false }),
      supabaseAdmin.from("clientes").select("*").eq("id", data.cliente_id).single(),
    ]);
    const modelo =
      (modelos || []).find(
        (m) =>
          m.nome?.toLowerCase().includes("padrão 2026") && (m.conteudo_html?.length || 0) > 5000,
      ) ||
      (modelos || []).find(
        (m) => m.owner_id === null && (m.conteudo_html?.length || 0) > 5000,
      ) ||
      null;
    if (!modelo?.conteudo_html) throw new Error("Modelo Padrão Bio Logus 2026 não encontrado.");
    if (!cliente) throw new Error("Cliente não encontrado.");

    const limite = Number(data.limite_kg) || 0;
    const excedente = Number(data.valor_excedente) || 0;
    const itens = limite > 0
      ? [{
          descricao: "Resíduos de serviços de saúde",
          grupo_residuo: data.grupos_residuos || "A, B e E",
          unidade: "kg",
          franquia: limite,
          preco_unitario: 0,
          preco_excedente: excedente,
        }]
      : [];
    const clienteVars = {
      ...cliente,
      responsavel_financeiro:
        data.representante_nome || cliente.responsavel_financeiro || null,
      representante_cpf: data.representante_cpf || "",
    };
    const vars = buildVars({
      cliente: clienteVars,
      contrato: {
        numero: data.numero || "(prévia)",
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || null,
        valor_mensal: data.valor_mensal ?? null,
        forma_pagamento: data.forma_pagamento || "",
        dia_vencimento: data.dia_vencimento ?? null,
        frequencia_coleta: data.frequencia_coleta || "",
        vigencia_anos: data.vigencia_anos || "01 (um)",
      },
      itens,
    });
    if (data.grupos_residuos)
      (vars as Record<string, string>).GRUPOS_RESIDUOS = data.grupos_residuos;

    const placeholdersRegex = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;
    const used = Array.from(
      new Set(Array.from(modelo.conteudo_html.matchAll(placeholdersRegex)).map((m) => m[1])),
    );
    const missing = used.filter((k) => {
      const v = (vars as Record<string, unknown>)[k];
      return v === null || v === undefined || v === "";
    });

    const html = renderTemplate(modelo.conteudo_html, vars);

    const pdfBytes = await gerarPDFContrato({
      numero: data.numero || "(prévia)",
      data: new Date().toLocaleDateString("pt-BR"),
      conteudoHtml: html,
      contratante: {
        nome: cliente.razao_social || "",
        cnpj: cliente.cnpj || "",
        endereco: cliente.endereco || "",
      },
      contratada: {
        nome: "Bio Logus Ambiental Ltda.",
        cnpj: "26.484.921/0001-60",
        endereco:
          "Rua Iporá, nº 258, Qd. 18, Lt. 12, Nossa Senhora de Fátima - Goiânia/GO",
        email: "comercial@biologusambientental.com.br",
      },
      objeto: "",
      itens: itens.map((i) => ({
        descricao: i.descricao,
        quantidade: Number(i.franquia || 0),
        unidade: i.unidade || "kg",
        valor: Number(i.preco_unitario || 0),
      })),
      valorMensal: Number(data.valor_mensal || 0),
      formaPagamento: data.forma_pagamento || "boleto bancário",
      diaVencimento: data.dia_vencimento ?? null,
      vigenciaInicio: data.data_inicio
        ? new Date(data.data_inicio + "T00:00:00").toLocaleDateString("pt-BR")
        : "",
      vigenciaFim: data.data_fim
        ? new Date(data.data_fim + "T00:00:00").toLocaleDateString("pt-BR")
        : null,
      indiceReajuste: null,
      periodicidadeReajuste: null,
      observacoes: null,
    });

    const path = `preview/contrato-rascunho/${data.cliente_id}-${Date.now()}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("documentos")
      .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw new Error("Falha ao gerar PDF: " + upErr.message);
    const { data: signed } = await supabaseAdmin.storage
      .from("documentos")
      .createSignedUrl(path, 3600);

    return {
      html,
      pdfUrl: signed?.signedUrl || "",
      missing,
      placeholdersUsados: used.length,
    };
>>>>>>> independente
  });
