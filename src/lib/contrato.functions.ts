import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  });
