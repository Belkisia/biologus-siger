// Integração com o banco Cora (Integração Direta, API v2) para emitir boletos.
// Server-only — nunca importar em código de cliente.
//
// Credenciais esperadas nas variáveis de ambiente (configuradas na Vercel,
// nunca coladas no código nem no chat):
//   CORA_AMBIENTE           = "stage" (testes) ou "producao"
//   CORA_CLIENT_ID          = o Client ID gerado no painel do Cora
//   CORA_CERTIFICADO_PEM    = conteúdo completo do arquivo de certificado (.pem/.crt)
//   CORA_CHAVE_PRIVADA_PEM  = conteúdo completo do arquivo de chave privada (.key)
//
// Endpoints confirmados em 02/10/2026 direto na documentação oficial
// (developers.cora.com.br), com prints da tela de "Emissão de boleto
// registrado" e "Pagar boleto em stage":
//   - Token (autenticação):      POST https://matls-clients.api.stage.cora.com.br/token
//   - Emitir boleto registrado:  POST https://api.stage.cora.com.br/v2/invoices/
//   - Consultar boleto:          GET  https://api.stage.cora.com.br/v2/invoices/{id}
// Repare que o host do token é diferente do host dos boletos — os dois
// exigem o certificado mTLS em toda chamada (exigência da Integração Direta).

import https from "node:https";

type CoraAmbiente = "stage" | "producao";

function getAmbiente(): CoraAmbiente {
  return process.env.CORA_AMBIENTE === "producao" ? "producao" : "stage";
}

function getTokenHost() {
  return getAmbiente() === "producao"
    ? "matls-clients.api.cora.com.br"
    : "matls-clients.api.stage.cora.com.br";
}

function getApiHost() {
  return getAmbiente() === "producao" ? "api.cora.com.br" : "api.stage.cora.com.br";
}

function getCredenciais() {
  const clientId = process.env.CORA_CLIENT_ID;
  const cert = process.env.CORA_CERTIFICADO_PEM;
  const key = process.env.CORA_CHAVE_PRIVADA_PEM;
  if (!clientId || !cert || !key) {
    throw new Error(
      "Credenciais do Cora não configuradas (CORA_CLIENT_ID / CORA_CERTIFICADO_PEM / CORA_CHAVE_PRIVADA_PEM)",
    );
  }
  return { clientId, cert, key };
}

// Chamada HTTPS com certificado mTLS (obrigatório em toda chamada ao Cora)
function requestComCertificado(opts: {
  hostname: string;
  method: string;
  path: string;
  body?: unknown;
  bearerToken?: string;
  idempotencyKey?: string;
}): Promise<{ status: number; json: any }> {
  const { cert, key } = getCredenciais();
  const payload = opts.body ? JSON.stringify(opts.body) : undefined;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: opts.hostname,
        path: opts.path,
        method: opts.method,
        cert,
        key,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          ...(opts.bearerToken ? { Authorization: `Bearer ${opts.bearerToken}` } : {}),
          ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let json: any = null;
          try {
            json = data ? JSON.parse(data) : null;
          } catch {
            json = { raw: data };
          }
          resolve({ status: res.statusCode || 0, json });
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// 1) Autenticação — pega um access_token válido (expira em 24h segundo o Cora)
export async function getCoraToken(): Promise<string> {
  const { clientId, cert, key } = getCredenciais();
  const body = `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: getTokenHost(),
        path: "/token",
        method: "POST",
        cert,
        key,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if ((res.statusCode || 0) >= 400) {
            reject(new Error(`Cora token ${res.statusCode}: ${data}`));
            return;
          }
          try {
            const json = JSON.parse(data);
            resolve(json.access_token);
          } catch {
            reject(new Error(`Resposta inesperada do Cora ao pegar token: ${data}`));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export type DadosBoleto = {
  faturaId: string;
  numero: string; // usado como "code" de referência no Cora
  valor: number; // em reais
  vencimento: string; // YYYY-MM-DD
  cliente: {
    nome: string;
    documento: string; // CPF ou CNPJ (com ou sem pontuação)
    email?: string | null;
    endereco?: string | null; // rua
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
  };
  descricao?: string;
};

export type ResultadoBoleto = {
  coraInvoiceId: string;
  status: string;
  linhaDigitavel?: string;
  codigoBarras?: string;
  url?: string;
  pixCopiaCola?: string;
};

// 2) Emite um boleto registrado na Cora a partir de uma fatura do sistema.
// Usa faturaId como Idempotency-Key: se essa função rodar duas vezes pra
// mesma fatura (ex.: erro de rede e retry), o Cora não deve gerar boleto
// duplicado.
export async function criarBoletoCora(dados: DadosBoleto): Promise<ResultadoBoleto> {
  const token = await getCoraToken();
  const documento = dados.cliente.documento.replace(/\D/g, "");
  const cepLimpo = (dados.cliente.cep || "").replace(/\D/g, "");

  const payload = {
    code: dados.numero,
    customer: {
      name: dados.cliente.nome,
      email: dados.cliente.email || undefined,
      document: {
        identity: documento,
        type: documento.length > 11 ? "CNPJ" : "CPF",
      },
      address: {
        street: dados.cliente.endereco || "Não informado",
        number: dados.cliente.numero || "S/N",
        district: dados.cliente.bairro || "Não informado",
        city: dados.cliente.cidade || "Não informado",
        state: dados.cliente.estado || "GO",
        complement: "N/A",
        zip_code: cepLimpo || "00000000",
      },
    },
    services: [
      {
        name: dados.descricao || "Serviço de coleta de resíduos",
        description: dados.descricao || "Serviço de coleta de resíduos",
        amount: Math.round(dados.valor * 100), // Cora trabalha em centavos
      },
    ],
    payment_terms: {
      due_date: dados.vencimento,
    },
    payment_forms: ["BANK_SLIP", "PIX"],
  };

  const { status, json } = await requestComCertificado({
    hostname: getApiHost(),
    method: "POST",
    path: "/v2/invoices/",
    body: payload,
    bearerToken: token,
    idempotencyKey: dados.faturaId,
  });

  if (status >= 400) {
    throw new Error(`Cora ${status}: ${JSON.stringify(json)}`);
  }

  return {
    coraInvoiceId: json.id,
    status: json.status,
    linhaDigitavel: json.payment_options?.bank_slip?.digitable ?? json.digitable_line,
    codigoBarras: json.payment_options?.bank_slip?.barcode ?? json.barcode,
    url: json.payment_options?.bank_slip?.url ?? json.pdf_url ?? json.url,
    pixCopiaCola: json.payment_options?.pix?.emv ?? json.pix?.emv ?? json.pix?.copy_paste,
  };
}

// 3) Consulta o status atual de um boleto já emitido (pago, aberto, vencido...)
export async function consultarBoletoCora(
  coraInvoiceId: string,
): Promise<ResultadoBoleto & { totalPago?: number }> {
  const token = await getCoraToken();
  const { status, json } = await requestComCertificado({
    hostname: getApiHost(),
    method: "GET",
    path: `/v2/invoices/${coraInvoiceId}`,
    bearerToken: token,
  });
  if (status >= 400) {
    throw new Error(`Cora ${status}: ${JSON.stringify(json)}`);
  }
  return {
    coraInvoiceId: json.id,
    status: json.status,
    linhaDigitavel: json.payment_options?.bank_slip?.digitable,
    codigoBarras: json.payment_options?.bank_slip?.barcode,
    url: json.payment_options?.bank_slip?.url,
    pixCopiaCola: json.payment_options?.pix?.emv,
    totalPago: json.total_paid ? json.total_paid / 100 : 0,
  };
}
