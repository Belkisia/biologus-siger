// Focus NFe HTTP client. Server-only.
// Docs: https://focusnfe.com.br/doc/#nfse

export type FocusAmbiente = "homologacao" | "producao";

const BASES: Record<FocusAmbiente, string> = {
  homologacao: "https://homologacao.focusnfe.com.br",
  producao: "https://api.focusnfe.com.br",
};

function auth() {
  const token = process.env.FOCUS_NFE_TOKEN;
  if (!token) throw new Error("FOCUS_NFE_TOKEN não configurado");
  return "Basic " + Buffer.from(`${token}:`).toString("base64");
}

export type FocusNfsePayload = {
  data_emissao: string;
  prestador: {
    cnpj: string;
    inscricao_municipal: string;
    codigo_municipio: string;
  };
  tomador: {
    cnpj?: string;
    cpf?: string;
    razao_social: string;
    email?: string | null;
    endereco?: {
      logradouro?: string | null;
      numero?: string | null;
      complemento?: string | null;
      bairro?: string | null;
      codigo_municipio?: string | null;
      uf?: string | null;
      cep?: string | null;
    };
  };
  servico: {
    aliquota: number;
    discriminacao: string;
    iss_retido: boolean;
    item_lista_servico: string;
    codigo_tributario_municipio?: string | null;
    valor_servicos: number;
  };
  natureza_operacao: number;
  optante_simples_nacional: boolean;
  incentivador_cultural?: boolean;
};

export type FocusNfseResponse = {
  status?: string; // autorizado | processando_autorizacao | erro_autorizacao | cancelado
  numero?: string;
  codigo_verificacao?: string;
  numero_rps?: string;
  serie_rps?: string;
  data_emissao?: string;
  url?: string;
  caminho_xml_nota_fiscal?: string;
  url_danfse?: string;
  erros?: Array<{ codigo?: string; mensagem?: string }>;
  mensagem?: string;
  codigo?: string;
  [k: string]: unknown;
};

async function request<T>(
  ambiente: FocusAmbiente,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: T }> {
  const url = BASES[ambiente] + path;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: auth(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { mensagem: text };
  }
  return { status: res.status, data: data as T };
}

export function emitirNfse(
  ambiente: FocusAmbiente,
  ref: string,
  payload: FocusNfsePayload,
) {
  return request<FocusNfseResponse>(ambiente, "POST", `/v2/nfse?ref=${encodeURIComponent(ref)}`, payload);
}

export function consultarNfse(ambiente: FocusAmbiente, ref: string) {
  return request<FocusNfseResponse>(ambiente, "GET", `/v2/nfse/${encodeURIComponent(ref)}`);
}

export function cancelarNfse(
  ambiente: FocusAmbiente,
  ref: string,
  justificativa: string,
) {
  return request<FocusNfseResponse>(
    ambiente,
    "DELETE",
    `/v2/nfse/${encodeURIComponent(ref)}`,
    { justificativa },
  );
}

export function mapStatus(focusStatus?: string): "processando" | "autorizada" | "erro" | "cancelada" {
  switch (focusStatus) {
    case "autorizado":
      return "autorizada";
    case "cancelado":
      return "cancelada";
    case "erro_autorizacao":
      return "erro";
    case "processando_autorizacao":
    default:
      return "processando";
  }
}
