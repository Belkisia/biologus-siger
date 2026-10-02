// Envio de mensagens de WhatsApp via Z-API.
// Server-only — nunca importar em código de cliente.
//
// Credenciais esperadas nas variáveis de ambiente (configuradas na Vercel,
// nunca coladas no código nem no chat):
//   ZAPI_INSTANCE_ID
//   ZAPI_TOKEN
//   ZAPI_CLIENT_TOKEN (opcional — só se a instância do Z-API exigir o
//                       cabeçalho "Client-Token" de segurança da conta)

function getZapiConfig() {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  if (!instanceId || !token) {
    throw new Error("Z-API não configurado (ZAPI_INSTANCE_ID / ZAPI_TOKEN)");
  }
  return { instanceId, token, clientToken: process.env.ZAPI_CLIENT_TOKEN };
}

function normalizarTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  // Z-API espera DDI (55) + DDD + número, só dígitos
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

export async function enviarWhatsApp(args: { telefone: string; mensagem: string }) {
  const { instanceId, token, clientToken } = getZapiConfig();
  const phone = normalizarTelefone(args.telefone);

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(clientToken ? { "Client-Token": clientToken } : {}),
    },
    body: JSON.stringify({ phone, message: args.mensagem }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Z-API ${res.status}: ${txt}`);
  }
  return res.json();
}

// Monta a mensagem padrão de cobrança com o link do boleto
export function montarMensagemBoleto(args: {
  nomeCliente: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  url?: string;
  linhaDigitavel?: string;
}) {
  const valorFmt = args.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const vencFmt = new Date(args.vencimento + "T12:00:00").toLocaleDateString("pt-BR");
  const linhas = [
    `Olá, ${args.nomeCliente}! Segue o boleto da Bio Logus Ambiental.`,
    ``,
    `Valor: ${valorFmt}`,
    `Vencimento: ${vencFmt}`,
  ];
  if (args.url) linhas.push(``, `Link para pagamento: ${args.url}`);
  if (args.linhaDigitavel) linhas.push(``, `Linha digitável: ${args.linhaDigitavel}`);
  return linhas.join("\n");
}
