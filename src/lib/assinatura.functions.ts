import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SignatarioInput = z.object({
  nome: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  cpf_cnpj: z.string().trim().max(20).optional().nullable(),
  papel: z.enum(["contratante", "contratada", "testemunha"]),
});

type ContratoItemPdf = {
  descricao: string | null;
  franquia: number | string | null;
  unidade: string | null;
  preco_unitario: number | string | null;
};

// ============================================================
// 1) Criar solicitação de assinatura (autenticado)
// ============================================================
export const criarSolicitacaoAssinatura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      documento_tipo: "contrato" | "proposta";
      documento_id: string;
      signatarios: Array<{
        nome: string;
        email: string;
        cpf_cnpj?: string | null;
        papel: "contratante" | "contratada" | "testemunha";
      }>;
    }) =>
      z
        .object({
          documento_tipo: z.enum(["contrato", "proposta"]),
          documento_id: z.string().uuid(),
          signatarios: z.array(SignatarioInput).min(1).max(10),
        })
        .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { gerarPDFContrato } = await import("./assinatura-pdf.server");
    const { enviarConviteAssinatura } = await import("./assinatura-email.server");

    // 1. Buscar o contrato + cliente + itens
    const { data: contrato, error: errC } = await supabaseAdmin
      .from("contratos")
      .select("*, clientes(razao_social, cnpj, endereco, email)")
      .eq("id", data.documento_id)
      .single();
    if (errC || !contrato) throw new Error("Contrato não encontrado");

    const { data: itens } = await supabaseAdmin
      .from("contrato_itens")
      .select("descricao, franquia, unidade, preco_unitario")
      .eq("contrato_id", data.documento_id);

    // 2. Gerar PDF do contrato
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
        descricao: i.descricao,
        quantidade: Number(i.franquia || 0),
        unidade: i.unidade || "un",
        valor: Number(i.preco_unitario || 0),
      })),
      valorMensal: Number(contrato.valor_mensal || 0),
      formaPagamento: contrato.forma_pagamento || "boleto bancário",
      diaVencimento: contrato.dia_vencimento,
      vigenciaInicio: new Date(contrato.data_inicio).toLocaleDateString("pt-BR"),
      vigenciaFim: contrato.data_fim
        ? new Date(contrato.data_fim).toLocaleDateString("pt-BR")
        : null,
      indiceReajuste: contrato.indice_reajuste,
      periodicidadeReajuste: contrato.periodicidade_reajuste,
      observacoes: contrato.observacoes,
    });

    // 3. Salvar PDF original no storage
    const pdfPath = `originais/${data.documento_tipo}/${data.documento_id}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("documentos")
      .upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw new Error("Falha ao salvar PDF: " + upErr.message);

    // 4. Limpar signatários antigos do mesmo documento
    await supabaseAdmin
      .from("signatarios")
      .delete()
      .eq("documento_tipo", data.documento_tipo)
      .eq("documento_id", data.documento_id)
      .eq("owner_id", context.userId);

    // 5. Criar signatários
    const rows = data.signatarios.map((s, i) => ({
      owner_id: context.userId,
      documento_tipo: data.documento_tipo,
      documento_id: data.documento_id,
      ordem: i + 1,
      nome: s.nome,
      email: s.email.toLowerCase(),
      cpf_cnpj: s.cpf_cnpj || null,
      papel: s.papel,
    }));
    const { data: criados, error: errS } = await supabaseAdmin
      .from("signatarios")
      .insert(rows)
      .select();
    if (errS) throw new Error("Falha ao criar signatários: " + errS.message);

    // 6. Determinar URL base
    const host = getRequestHeader("host") || "";
    const proto = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${proto}://${host}`;
    const docNome = `Contrato Nº ${contrato.numero}`;

    // 7. Enviar e-mails de convite
    for (const sig of criados || []) {
      try {
        await enviarConviteAssinatura({
          to: sig.email,
          nome: sig.nome,
          documentoNome: docNome,
          url: `${baseUrl}/assinar/${sig.token}`,
        });
        await supabaseAdmin
          .from("signatarios")
          .update({ email_enviado_em: new Date().toISOString() })
          .eq("id", sig.id);
      } catch (e) {
        console.error("Falha ao enviar e-mail para", sig.email, e);
      }
    }

    return { ok: true, total: criados?.length || 0 };
  });

// ============================================================
// 2) Obter signatário pelo token (PÚBLICO)
// ============================================================
export const obterSignatarioPorToken = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => z.object({ token: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sig, error } = await supabaseAdmin
      .from("signatarios")
      .select(
        "id, nome, email, cpf_cnpj, papel, status, documento_tipo, documento_id, expira_em, assinado_em",
      )
      .eq("token", data.token)
      .single();
    if (error || !sig) throw new Error("Link inválido ou expirado");
    if (new Date(sig.expira_em) < new Date() && sig.status !== "assinado") {
      throw new Error("Link expirado");
    }

    // URL do PDF original (signed URL 1h)
    const pdfPath = `originais/${sig.documento_tipo}/${sig.documento_id}.pdf`;
    const { data: signed } = await supabaseAdmin.storage
      .from("documentos")
      .createSignedUrl(pdfPath, 3600);

    // Buscar info do documento (só contratos tem 'objeto'; propostas tem só numero)
    const tabela = sig.documento_tipo === "contrato" ? "contratos" : "propostas";
    const selectCols = sig.documento_tipo === "contrato" ? "numero, objeto" : "numero";
    const { data: doc } = await supabaseAdmin
      .from(tabela)
      .select(selectCols)
      .eq("id", sig.documento_id)
      .single();

    // Log evento
    const ip = getRequestIP({ xForwardedFor: true }) || null;
    const ua = getRequestHeader("user-agent") || null;
    await supabaseAdmin.from("signatario_eventos").insert({
      signatario_id: sig.id,
      evento: "link_aberto",
      ip,
      user_agent: ua,
    });

    return {
      signatario: sig,
      pdfUrl: signed?.signedUrl || null,
      documento: { numero: (doc as any)?.numero, objeto: (doc as any)?.objeto || null },
    };
  });

// ============================================================
// 3) Solicitar OTP (PÚBLICO)
// ============================================================
async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const solicitarOTP = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => z.object({ token: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { enviarCodigoOTP } = await import("./assinatura-email.server");

    const { data: sig, error } = await supabaseAdmin
      .from("signatarios")
      .select("id, nome, email, status")
      .eq("token", data.token)
      .single();
    if (error || !sig) throw new Error("Link inválido");
    if (sig.status === "assinado") throw new Error("Documento já assinado");

    // Rate limit: máx 3 OTPs em 10 min
    const dezMinAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("signatario_otps")
      .select("*", { count: "exact", head: true })
      .eq("signatario_id", sig.id)
      .gte("created_at", dezMinAtras);
    if ((count || 0) >= 3) {
      throw new Error("Muitas tentativas. Aguarde 10 minutos.");
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    const hash = await sha256Hex(codigo);

    await supabaseAdmin.from("signatario_otps").insert({
      signatario_id: sig.id,
      codigo_hash: hash,
    });

    await enviarCodigoOTP({ to: sig.email, nome: sig.nome, codigo });

    await supabaseAdmin.from("signatarios").update({ status: "otp_enviado" }).eq("id", sig.id);

    const ip = getRequestIP({ xForwardedFor: true }) || null;
    await supabaseAdmin.from("signatario_eventos").insert({
      signatario_id: sig.id,
      evento: "otp_solicitado",
      ip,
    });

    return { ok: true, enviado_para: maskEmail(sig.email) };
  });

function maskEmail(e: string) {
  const [u, d] = e.split("@");
  return u.slice(0, 2) + "***@" + d;
}

// ============================================================
// 4) Confirmar assinatura (PÚBLICO) — valida OTP + assina
// ============================================================
export const confirmarAssinatura = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { token: string; codigo: string; rubrica_base64?: string | null; aceite: boolean }) =>
      z
        .object({
          token: z.string().uuid(),
          codigo: z.string().regex(/^\d{6}$/),
          rubrica_base64: z.string().max(500_000).optional().nullable(),
          aceite: z.literal(true),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { anexarManifestoAssinatura, sha256 } = await import("./assinatura-pdf.server");

    const { data: sig } = await supabaseAdmin
      .from("signatarios")
      .select("*")
      .eq("token", data.token)
      .single();
    if (!sig) throw new Error("Link inválido");
    if (sig.status === "assinado") throw new Error("Já assinado");

    // Validar OTP mais recente, não usado, dentro da validade
    const { data: otp } = await supabaseAdmin
      .from("signatario_otps")
      .select("*")
      .eq("signatario_id", sig.id)
      .is("usado_em", null)
      .gte("expira_em", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!otp) throw new Error("Código expirado. Solicite um novo.");
    if (otp.tentativas >= 5) throw new Error("Muitas tentativas. Solicite um novo código.");

    const hash = await sha256Hex(data.codigo);
    if (hash !== otp.codigo_hash) {
      await supabaseAdmin
        .from("signatario_otps")
        .update({ tentativas: otp.tentativas + 1 })
        .eq("id", otp.id);
      throw new Error("Código incorreto");
    }

    // OK — marcar OTP como usado
    await supabaseAdmin
      .from("signatario_otps")
      .update({ usado_em: new Date().toISOString() })
      .eq("id", otp.id);

    const ip = getRequestIP({ xForwardedFor: true }) || null;
    const ua = getRequestHeader("user-agent") || null;
    const codigoVerif = randomCode(10);

    // Baixar PDF original
    const pdfPath = `originais/${sig.documento_tipo}/${sig.documento_id}.pdf`;
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("documentos")
      .download(pdfPath);
    if (dlErr || !blob) throw new Error("PDF original não encontrado");
    const origBytes = new Uint8Array(await blob.arrayBuffer());
    const hashDoc = await sha256(origBytes);

    // Registrar assinatura
    await supabaseAdmin.from("documento_assinaturas").insert({
      signatario_id: sig.id,
      documento_tipo: sig.documento_tipo,
      documento_id: sig.documento_id,
      hash_documento: hashDoc,
      codigo_verificacao: codigoVerif,
      rubrica_base64: data.rubrica_base64 || null,
      ip,
      user_agent: ua,
    });

    await supabaseAdmin
      .from("signatarios")
      .update({ status: "assinado", assinado_em: new Date().toISOString() })
      .eq("id", sig.id);

    await supabaseAdmin.from("signatario_eventos").insert({
      signatario_id: sig.id,
      evento: "assinado",
      ip,
      user_agent: ua,
      metadata: { codigo_verificacao: codigoVerif },
    });

    // Verificar se todos os signatários assinaram → gerar PDF final consolidado
    const { data: todos } = await supabaseAdmin
      .from("signatarios")
      .select("id, nome, email, cpf_cnpj, papel, assinado_em, status")
      .eq("documento_tipo", sig.documento_tipo)
      .eq("documento_id", sig.documento_id)
      .order("ordem");

    const todosAssinados = todos?.every((s) => s.status === "assinado");

    if (todosAssinados && todos) {
      const { data: assinaturas } = await supabaseAdmin
        .from("documento_assinaturas")
        .select("signatario_id, codigo_verificacao, rubrica_base64, ip")
        .eq("documento_tipo", sig.documento_tipo)
        .eq("documento_id", sig.documento_id);

      const sigInfos = todos.map((t) => {
        const a = assinaturas?.find((x) => x.signatario_id === t.id);
        return {
          nome: t.nome,
          email: t.email,
          cpf_cnpj: t.cpf_cnpj,
          papel: t.papel,
          assinado_em: t.assinado_em!,
          ip: a?.ip || null,
          codigo_verificacao: a?.codigo_verificacao || "",
          rubrica_base64: a?.rubrica_base64 || null,
        };
      });

      const host = getRequestHeader("host") || "";
      const proto = host.includes("localhost") ? "http" : "https";
      const urlValidacao = `${proto}://${host}/validar/${codigoVerif}`;

      const finalBytes = await anexarManifestoAssinatura({
        pdfBytes: origBytes,
        hashDocumentoOriginal: hashDoc,
        signatarios: sigInfos,
        urlValidacao,
      });

      const finalPath = `assinados/${sig.documento_tipo}/${sig.documento_id}.pdf`;
      await supabaseAdmin.storage
        .from("documentos")
        .upload(finalPath, finalBytes, { contentType: "application/pdf", upsert: true });

      // Atualizar caminho em todas as assinaturas
      await supabaseAdmin
        .from("documento_assinaturas")
        .update({ pdf_assinado_path: finalPath })
        .eq("documento_tipo", sig.documento_tipo)
        .eq("documento_id", sig.documento_id);
    }

    return { ok: true, codigo_verificacao: codigoVerif, todosAssinados };
  });

function randomCode(len: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// ============================================================
// 5) Validar código público (PÚBLICO) — para /validar/:codigo
// ============================================================
export const validarCodigoAssinatura = createServerFn({ method: "POST" })
  .inputValidator((data: { codigo: string }) =>
    z.object({ codigo: z.string().trim().min(4).max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: assin } = await supabaseAdmin
      .from("documento_assinaturas")
      .select("*, signatarios(nome, email, cpf_cnpj, papel, assinado_em)")
      .eq("codigo_verificacao", data.codigo.toUpperCase())
      .single();
    if (!assin) return { encontrado: false };

    // Listar todos signatários do documento
    const { data: todos } = await supabaseAdmin
      .from("signatarios")
      .select("nome, email, papel, status, assinado_em")
      .eq("documento_tipo", assin.documento_tipo)
      .eq("documento_id", assin.documento_id)
      .order("ordem");

    let pdfUrl: string | null = null;
    if (assin.pdf_assinado_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from("documentos")
        .createSignedUrl(assin.pdf_assinado_path, 3600);
      pdfUrl = signed?.signedUrl || null;
    }

    return {
      encontrado: true,
      hash_documento: assin.hash_documento,
      assinado_em: assin.assinado_em,
      documento_tipo: assin.documento_tipo,
      signatario_principal: (assin as any).signatarios,
      todos_signatarios: todos || [],
      pdf_url: pdfUrl,
    };
  });

// ============================================================
// 6) Listar signatários de um documento (autenticado)
// ============================================================
export const listarSignatarios = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { documento_tipo: "contrato" | "proposta"; documento_id: string }) =>
    z
      .object({
        documento_tipo: z.enum(["contrato", "proposta"]),
        documento_id: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sigs } = await supabase
      .from("signatarios")
      .select("*")
      .eq("documento_tipo", data.documento_tipo)
      .eq("documento_id", data.documento_id)
      .order("ordem");

    const { data: pdfAssin } = await supabase
      .from("documento_assinaturas")
      .select("pdf_assinado_path")
      .eq("documento_tipo", data.documento_tipo)
      .eq("documento_id", data.documento_id)
      .not("pdf_assinado_path", "is", null)
      .limit(1)
      .maybeSingle();

    let pdf_assinado_url: string | null = null;
    if (pdfAssin?.pdf_assinado_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from("documentos")
        .createSignedUrl(pdfAssin.pdf_assinado_path, 3600);
      pdf_assinado_url = signed?.signedUrl || null;
    }

    return {
      signatarios: sigs || [],
      pdf_assinado_path: pdfAssin?.pdf_assinado_path || null,
      pdf_assinado_url,
    };
  });
