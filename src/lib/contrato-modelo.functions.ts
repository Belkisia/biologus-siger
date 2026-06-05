import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

// Constrói o dicionário de variáveis a partir do cliente + opcionalmente contrato/proposta + itens
export function buildVars(args: {
  cliente: any;
  contrato?: any | null;
  proposta?: any | null;
  itens?: Array<any> | null;
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
    REPRESENTANTE_CPF: c.representante_cpf || "",
    RESPONSAVEL_TECNICO: c.responsavel_tecnico || "",
    RESPONSAVEL_FINANCEIRO: c.responsavel_financeiro || "",
    RESPONSAVEL_OPERACIONAL: c.responsavel_operacional || "",
    VALOR_MENSAL: brl(ct.valor_mensal),
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
      ? `${dataBR(ct.data_inicio)} a ${dataBR(ct.data_fim)}`
      : `a partir de ${dataBR(ct.data_inicio)}`,
    DATA_INICIO: dataBR(ct.data_inicio),
    DATA_FIM: dataBR(ct.data_fim),
    EMPRESA_RAZAO_SOCIAL: e.razao_social,
    EMPRESA_CNPJ: e.cnpj,
    EMPRESA_ENDERECO: e.endereco,
    EMPRESA_EMAIL: e.email,
    EMPRESA_TELEFONE: e.telefone,
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
    let itens: any[] = [];
    let proposta: any = null;
    if (data.proposta_id) {
      proposta = (
        await supabaseAdmin.from("propostas").select("*").eq("id", data.proposta_id).single()
      ).data;
      const { data: pis } = await supabaseAdmin
        .from("proposta_itens")
        .select("*")
        .eq("proposta_id", data.proposta_id)
        .order("ordem");
      itens = (pis || []).map((i: any) => ({
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

    let itens: any[] = [];
    if (data.proposta_id) {
      const { data: pis } = await supabaseAdmin
        .from("proposta_itens")
        .select("*")
        .eq("proposta_id", data.proposta_id)
        .order("ordem");
      itens = (pis || []).map((i: any) => ({
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
