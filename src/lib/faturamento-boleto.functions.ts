import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============================================================
// Gera o boleto na Cora para uma lista de faturas pendentes e
// manda automaticamente por e-mail + WhatsApp.
//
// Cada fatura é tratada de forma independente: se uma falhar
// (ex.: cliente sem e-mail, erro do banco), as outras continuam
// e o erro fica registrado na própria fatura (campo boleto_erro),
// pra não travar o lote inteiro por causa de um cliente problemático.
// ============================================================
export const gerarBoletosEmLote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { faturaIds: string[] }) =>
    z.object({ faturaIds: z.array(z.string().uuid()).min(1).max(200) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { criarBoletoCora } = await import("./cora.server");
    const { enviarWhatsApp, montarMensagemBoleto } = await import("./zapi.server");

    const { data: faturas, error } = await supabaseAdmin
      .from("faturas")
      .select(
        "id, numero, valor, data_vencimento, cora_invoice_id, clientes(razao_social, nome_fantasia, cnpj, email, telefone, endereco, numero, bairro, cidade, estado, cep)",
      )
      .in("id", data.faturaIds)
      .eq("owner_id", context.userId);
    if (error) throw new Error("Falha ao buscar faturas: " + error.message);

    const resultados: Array<{
      faturaId: string;
      cliente: string;
      ok: boolean;
      etapa?: "boleto" | "email" | "whatsapp";
      erro?: string;
    }> = [];

    for (const fatura of faturas || []) {
      const cliente = fatura.clientes as any;
      const nomeCliente = cliente?.nome_fantasia || cliente?.razao_social || "Cliente";

      // Já tem boleto gerado — não gera de novo (idempotente a nível de aplicação)
      if (fatura.cora_invoice_id) {
        resultados.push({ faturaId: fatura.id, cliente: nomeCliente, ok: true });
        continue;
      }

      try {
        const boleto = await criarBoletoCora({
          faturaId: fatura.id,
          numero: fatura.numero,
          valor: Number(fatura.valor),
          vencimento: fatura.data_vencimento,
          cliente: {
            nome: cliente?.razao_social || nomeCliente,
            documento: cliente?.cnpj || "",
            email: cliente?.email,
            endereco: cliente?.endereco,
            numero: cliente?.numero,
            bairro: cliente?.bairro,
            cidade: cliente?.cidade,
            estado: cliente?.estado,
            cep: cliente?.cep,
          },
          descricao: "Serviço de coleta e destinação de resíduos",
        });

        await supabaseAdmin
          .from("faturas")
          .update({
            cora_invoice_id: boleto.coraInvoiceId,
            boleto_status: boleto.status,
            boleto_linha_digitavel: boleto.linhaDigitavel,
            boleto_codigo_barras: boleto.codigoBarras,
            boleto_url: boleto.url,
            boleto_pix_copia_cola: boleto.pixCopiaCola,
            boleto_gerado_em: new Date().toISOString(),
            boleto_erro: null,
          })
          .eq("id", fatura.id);

        // E-mail (se o cliente tiver e-mail cadastrado)
        if (cliente?.email) {
          try {
            const { enviarBoletoPorEmail } = await import("./assinatura-email.server");
            await enviarBoletoPorEmail({
              to: cliente.email,
              nomeCliente,
              numero: fatura.numero,
              valor: Number(fatura.valor),
              vencimento: fatura.data_vencimento,
              url: boleto.url,
              linhaDigitavel: boleto.linhaDigitavel,
            });
            await supabaseAdmin
              .from("faturas")
              .update({ enviado_email_em: new Date().toISOString() })
              .eq("id", fatura.id);
          } catch (e) {
            resultados.push({
              faturaId: fatura.id,
              cliente: nomeCliente,
              ok: false,
              etapa: "email",
              erro: e instanceof Error ? e.message : String(e),
            });
          }
        }

        // WhatsApp (se o cliente tiver telefone cadastrado)
        if (cliente?.telefone) {
          try {
            await enviarWhatsApp({
              telefone: cliente.telefone,
              mensagem: montarMensagemBoleto({
                nomeCliente,
                valor: Number(fatura.valor),
                vencimento: fatura.data_vencimento,
                url: boleto.url,
                linhaDigitavel: boleto.linhaDigitavel,
              }),
            });
            await supabaseAdmin
              .from("faturas")
              .update({ enviado_whatsapp_em: new Date().toISOString() })
              .eq("id", fatura.id);
          } catch (e) {
            resultados.push({
              faturaId: fatura.id,
              cliente: nomeCliente,
              ok: false,
              etapa: "whatsapp",
              erro: e instanceof Error ? e.message : String(e),
            });
          }
        }

        resultados.push({ faturaId: fatura.id, cliente: nomeCliente, ok: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await supabaseAdmin.from("faturas").update({ boleto_erro: msg }).eq("id", fatura.id);
        resultados.push({ faturaId: fatura.id, cliente: nomeCliente, ok: false, etapa: "boleto", erro: msg });
      }
    }

    return {
      total: resultados.length,
      sucesso: resultados.filter((r) => r.ok).length,
      falhas: resultados.filter((r) => !r.ok),
    };
  });
