import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Emite NFS-e a partir de uma fatura existente
export const emitirNfseDeFatura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { faturaId: string; descricao?: string }) =>
    z.object({ faturaId: z.string().uuid(), descricao: z.string().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: emit, error: emitErr } = await supabase
      .from("emitente_config")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    if (emitErr) throw emitErr;
    if (!emit) throw new Error("Configure os dados fiscais do emitente antes de emitir NFS-e.");
    if (!emit.item_lista_servico || !emit.codigo_tributario_municipio || !emit.endereco_codigo_municipio) {
      throw new Error("Emitente incompleto: preencha item da lista de serviço, código tributário municipal e código do município do prestador.");
    }

    const { data: fatura, error: fatErr } = await supabase
      .from("faturas")
      .select("*, clientes(*)")
      .eq("id", data.faturaId)
      .maybeSingle();
    if (fatErr) throw fatErr;
    if (!fatura) throw new Error("Fatura não encontrada.");
    const cliente = fatura.clientes as {
      razao_social: string; cnpj: string; email: string | null;
      logradouro: string | null; endereco: string | null; numero: string | null;
      bairro: string | null; cep: string | null; cidade: string | null; estado: string | null;
    } | null;
    if (!cliente) throw new Error("Cliente da fatura não encontrado.");

    const valor = Number(fatura.valor);
    const aliquota = Number(emit.aliquota ?? 0);
    const iss = +(valor * aliquota).toFixed(2);
    const descricao = data.descricao?.trim()
      || fatura.descricao?.trim()
      || `Serviços prestados — competência ${fatura.competencia} — fatura ${fatura.numero}`;

    // cria registro local com status processando para obter o UUID (ref)
    const { data: nota, error: insErr } = await supabase
      .from("notas_fiscais")
      .insert({
        owner_id: userId,
        fatura_id: fatura.id,
        cliente_id: fatura.cliente_id,
        ref: crypto.randomUUID(),
        ambiente: emit.ambiente,
        status: "processando",
        valor_servicos: valor,
        aliquota,
        iss_valor: iss,
        descricao,
      })
      .select("*")
      .single();
    if (insErr) throw insErr;

    const cnpjTomador = (cliente.cnpj ?? "").replace(/\D/g, "");
    const payload = {
      data_emissao: new Date().toISOString(),
      prestador: {
        cnpj: (emit.cnpj ?? "").replace(/\D/g, ""),
        inscricao_municipal: emit.inscricao_municipal,
        codigo_municipio: emit.endereco_codigo_municipio,
      },
      tomador: {
        cnpj: cnpjTomador.length === 14 ? cnpjTomador : undefined,
        cpf: cnpjTomador.length === 11 ? cnpjTomador : undefined,
        razao_social: cliente.razao_social,
        email: cliente.email ?? undefined,
        endereco: {
          logradouro: cliente.logradouro ?? cliente.endereco ?? undefined,
          numero: cliente.numero ?? undefined,
          bairro: cliente.bairro ?? undefined,
          uf: cliente.estado ?? undefined,
          cep: (cliente.cep ?? "").replace(/\D/g, "") || undefined,
        },
      },
      servico: {
        aliquota,
        discriminacao: descricao,
        iss_retido: emit.iss_retido,
        item_lista_servico: emit.item_lista_servico,
        codigo_tributario_municipio: emit.codigo_tributario_municipio,
        valor_servicos: valor,
      },
      natureza_operacao: emit.natureza_operacao,
      optante_simples_nacional: emit.optante_simples_nacional,
      incentivador_cultural: emit.incentivador_cultural,
    };

    const { emitirNfse, mapStatus } = await import("./nfse.server");
    const { status, data: retorno } = await emitirNfse(
      emit.ambiente as "homologacao" | "producao",
      nota.ref,
      payload,
    );

    const mensagemErro = status >= 400
      ? (retorno.erros?.[0]?.mensagem || retorno.mensagem || `HTTP ${status}`)
      : null;

    await supabase.from("notas_fiscais").update({
      status: mensagemErro ? "erro" : mapStatus(retorno.status),
      numero_nfse: retorno.numero ?? null,
      codigo_verificacao: retorno.codigo_verificacao ?? null,
      rps_numero: retorno.numero_rps ?? null,
      rps_serie: retorno.serie_rps ?? null,
      data_emissao: retorno.data_emissao ?? null,
      url_pdf: retorno.url_danfse ?? null,
      url_xml: retorno.caminho_xml_nota_fiscal ?? null,
      mensagem_erro: mensagemErro,
      payload_envio: payload as any,
      payload_retorno: retorno as any,
    }).eq("id", nota.id);

    return { id: nota.id, ref: nota.ref, status, mensagemErro };
  });

export const consultarNfse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { notaId: string }) => z.object({ notaId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: nota, error } = await supabase
      .from("notas_fiscais")
      .select("*")
      .eq("id", data.notaId)
      .eq("owner_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!nota) throw new Error("Nota não encontrada.");

    const { consultarNfse: focusConsultar, mapStatus } = await import("./nfse.server");
    const { status, data: retorno } = await focusConsultar(
      nota.ambiente as "homologacao" | "producao",
      nota.ref,
    );
    const mensagemErro = status >= 400
      ? (retorno.erros?.[0]?.mensagem || retorno.mensagem || `HTTP ${status}`)
      : null;

    await supabase.from("notas_fiscais").update({
      status: mensagemErro ? nota.status : mapStatus(retorno.status),
      numero_nfse: retorno.numero ?? nota.numero_nfse,
      codigo_verificacao: retorno.codigo_verificacao ?? nota.codigo_verificacao,
      rps_numero: retorno.numero_rps ?? nota.rps_numero,
      rps_serie: retorno.serie_rps ?? nota.rps_serie,
      data_emissao: retorno.data_emissao ?? nota.data_emissao,
      url_pdf: retorno.url_danfse ?? nota.url_pdf,
      url_xml: retorno.caminho_xml_nota_fiscal ?? nota.url_xml,
      mensagem_erro: mensagemErro,
      payload_retorno: retorno as any,
    }).eq("id", nota.id);

    return { status, mensagemErro };
  });

export const cancelarNfse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { notaId: string; justificativa: string }) =>
    z.object({ notaId: z.string().uuid(), justificativa: z.string().min(15) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: nota, error } = await supabase
      .from("notas_fiscais").select("*").eq("id", data.notaId).eq("owner_id", userId).maybeSingle();
    if (error) throw error;
    if (!nota) throw new Error("Nota não encontrada.");
    if (nota.status !== "autorizada") throw new Error("Somente notas autorizadas podem ser canceladas.");

    const { cancelarNfse: focusCancelar } = await import("./nfse.server");
    const { status, data: retorno } = await focusCancelar(
      nota.ambiente as "homologacao" | "producao",
      nota.ref,
      data.justificativa,
    );
    const mensagemErro = status >= 400 ? (retorno.erros?.[0]?.mensagem || retorno.mensagem || `HTTP ${status}`) : null;
    if (!mensagemErro) {
      await supabase.from("notas_fiscais").update({
        status: "cancelada",
        cancelada_em: new Date().toISOString(),
        justificativa_cancelamento: data.justificativa,
        payload_retorno: retorno as any,
      }).eq("id", nota.id);
    } else {
      await supabase.from("notas_fiscais").update({ mensagem_erro: mensagemErro, payload_retorno: retorno as any }).eq("id", nota.id);
    }
    return { status, mensagemErro };
  });
