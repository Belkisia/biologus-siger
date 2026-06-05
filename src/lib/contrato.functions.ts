import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
