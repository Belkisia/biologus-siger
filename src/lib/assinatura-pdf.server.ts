// Geração e averbação de PDFs assinados (Worker-compatível via pdf-lib)
import { PDFDocument, StandardFonts, rgb, PageSizes, type Color, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";

type SignatarioInfo = {
  nome: string;
  email: string;
  cpf_cnpj?: string | null;
  papel: string;
  assinado_em: string;
  ip?: string | null;
  codigo_verificacao: string;
  rubrica_base64?: string | null;
};

export async function sha256(bytes: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Gera um PDF de contrato simples a partir de dados estruturados.
 * Layout: cabeçalho verde Bio Logus + cláusulas em texto corrido + assinaturas.
 */
export async function gerarPDFContrato(args: {
  numero: string;
  data: string;
  conteudoHtml?: string | null;
  contratante: { nome: string; cnpj: string; endereco: string };
  contratada: { nome: string; cnpj?: string; endereco?: string; email?: string };
  objeto: string;
  itens: Array<{ descricao: string; quantidade: number; unidade: string; valor: number }>;
  valorMensal: number;
  formaPagamento: string;
  diaVencimento?: number | null;
  vigenciaInicio: string;
  vigenciaFim?: string | null;
  indiceReajuste?: string | null;
  periodicidadeReajuste?: string | null;
  observacoes?: string | null;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const A4 = PageSizes.A4;
  const M = 50;
  const lineH = 12;
  const green = rgb(0.102, 0.365, 0.247);

  let page = doc.addPage(A4);
  let y = A4[1] - M;
  const W = A4[0] - M * 2;

  const newPage = () => {
    page = doc.addPage(A4);
    y = A4[1] - M;
  };

  const drawText = (
    text: string,
    opts: { size?: number; font?: PDFFont; color?: Color; indent?: number } = {},
  ) => {
    const size = opts.size ?? 9.5;
    const f = opts.font ?? font;
    const color = opts.color ?? rgb(0.1, 0.1, 0.1);
    const x = M + (opts.indent ?? 0);
    // word wrap manual
    const words = text.split(/\s+/);
    let line = "";
    const lines: string[] = [];
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > W - (opts.indent ?? 0)) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    for (const l of lines) {
      if (y < M + 40) newPage();
      page.drawText(l, { x, y, size, font: f, color });
      y -= size + 3;
    }
  };

  const h1 = (text: string) => {
    if (y < M + 60) newPage();
    page.drawRectangle({ x: 0, y: y - 4, width: A4[0], height: 28, color: green });
    page.drawText(text, { x: M, y: y + 6, size: 13, font: bold, color: rgb(1, 1, 1) });
    y -= 36;
  };

  const h2 = (text: string) => {
    y -= 6;
    if (y < M + 40) newPage();
    page.drawText(text, { x: M, y, size: 11, font: bold, color: green });
    y -= 16;
  };

  const spacer = (h = 8) => {
    y -= h;
  };

  if (args.conteudoHtml?.trim()) {
    for (const block of htmlToTextBlocks(args.conteudoHtml)) {
      if (block.kind === "heading") h2(block.text);
      else drawText(block.text);
      spacer(3);
    }
    return await doc.save();
  }

  // ── Cabeçalho ──
  h1(`CONTRATO DE PRESTAÇÃO DE SERVIÇOS Nº ${args.numero}`);
  drawText(`Data: ${args.data}`, { size: 9 });
  spacer(6);

  // ── Partes ──
  h2("DAS PARTES");
  drawText(
    `CONTRATANTE: ${args.contratante.nome}, CNPJ ${args.contratante.cnpj}, com sede em ${args.contratante.endereco}.`,
  );
  spacer(4);
  drawText(
    `CONTRATADA: ${args.contratada.nome}${args.contratada.cnpj ? `, CNPJ ${args.contratada.cnpj}` : ""}${args.contratada.endereco ? `, com sede em ${args.contratada.endereco}` : ""}.`,
  );

  // ── Cláusulas ──
  h2("CLÁUSULA 1ª — OBJETO");
  drawText(
    args.objeto ||
      "Prestação de serviços de coleta, transporte, tratamento e destinação final ambientalmente adequada de resíduos, conforme legislação vigente (Lei 12.305/2010 — PNRS, Resolução CONAMA 313/2002 e normas correlatas).",
  );

  if (args.itens.length > 0) {
    spacer(4);
    drawText("Compreende os seguintes itens:", { font: bold, size: 9.5 });
    for (const it of args.itens) {
      drawText(`• ${it.descricao} — ${it.quantidade} ${it.unidade} — ${brl(it.valor)}`, {
        indent: 12,
      });
    }
  }

  h2("CLÁUSULA 2ª — VIGÊNCIA");
  const vig = args.vigenciaFim
    ? `O presente contrato vigorará de ${args.vigenciaInicio} a ${args.vigenciaFim}, podendo ser renovado mediante aditivo.`
    : `O presente contrato vigorará a partir de ${args.vigenciaInicio} por prazo indeterminado, podendo ser rescindido por qualquer das partes mediante notificação prévia de 30 dias.`;
  drawText(vig);

  h2("CLÁUSULA 3ª — PREÇO E PAGAMENTO");
  drawText(
    `O valor mensal contratado é de ${brl(args.valorMensal)}, a ser pago via ${args.formaPagamento}${args.diaVencimento ? `, com vencimento todo dia ${args.diaVencimento}` : ""}.`,
  );

  if (args.indiceReajuste) {
    h2("CLÁUSULA 4ª — REAJUSTE");
    drawText(
      `Os valores serão reajustados pelo índice ${args.indiceReajuste}${args.periodicidadeReajuste ? ` em periodicidade ${args.periodicidadeReajuste}` : " anualmente"}.`,
    );
  }

  h2("CLÁUSULA 5ª — OBRIGAÇÕES DA CONTRATADA");
  drawText(
    "Emitir MTR (Manifesto de Transporte de Resíduos) e CDF (Certificado de Destinação Final) conforme legislação; manter licenças ambientais válidas; transportar e destinar os resíduos exclusivamente para empresas licenciadas; cumprir prazos acordados; comunicar prontamente qualquer não-conformidade.",
  );

  h2("CLÁUSULA 6ª — OBRIGAÇÕES DA CONTRATANTE");
  drawText(
    "Segregar e acondicionar adequadamente os resíduos; disponibilizar local seguro para coleta; efetuar pagamento nas datas pactuadas; fornecer informações necessárias para emissão dos documentos legais.",
  );

  h2("CLÁUSULA 7ª — RESCISÃO");
  drawText(
    "O contrato poderá ser rescindido por inadimplemento, descumprimento de obrigações, ou por conveniência das partes mediante aviso prévio de 30 dias, sem prejuízo das obrigações já vencidas.",
  );

  h2("CLÁUSULA 8ª — PROTEÇÃO DE DADOS (LGPD)");
  drawText(
    "As partes comprometem-se a tratar os dados pessoais eventualmente compartilhados em estrita observância à Lei 13.709/2018 (LGPD), utilizando-os apenas para a execução deste contrato.",
  );

  h2("CLÁUSULA 9ª — FORO");
  drawText(
    "Fica eleito o foro da comarca da sede da CONTRATADA para dirimir quaisquer questões oriundas deste contrato, com renúncia expressa a qualquer outro.",
  );

  if (args.observacoes) {
    h2("CLÁUSULA 10ª — DISPOSIÇÕES GERAIS");
    drawText(args.observacoes);
  }

  // ── Assinaturas ──
  spacer(20);
  if (y < M + 100) newPage();
  drawText(
    "E por estarem assim justas e contratadas, as partes assinam o presente eletronicamente, conforme a MP 2.200-2/2001, art. 10, §2º.",
    { size: 9 },
  );
  spacer(40);
  drawText("___________________________________     ___________________________________", {
    size: 9,
  });
  drawText(
    `${args.contratante.nome}                                                       ${args.contratada.nome}`,
    { size: 8 },
  );
  drawText("CONTRATANTE                                                          CONTRATADA", {
    size: 8,
  });

  return await doc.save();
}

/**
 * Anexa uma página de manifesto/averbação a um PDF existente com todos os signatários,
 * suas rubricas, IP, hash do documento original e QR Code de validação pública.
 */
export async function anexarManifestoAssinatura(args: {
  pdfBytes: Uint8Array;
  hashDocumentoOriginal: string;
  signatarios: SignatarioInfo[];
  urlValidacao: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.load(args.pdfBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.102, 0.365, 0.247);

  const A4 = PageSizes.A4;
  const M = 40;
  let page = doc.addPage(A4);
  let y = A4[1] - M;

  // Header
  page.drawRectangle({ x: 0, y: y - 6, width: A4[0], height: 36, color: green });
  page.drawText("MANIFESTO DE ASSINATURA ELETRÔNICA", {
    x: M,
    y: y + 8,
    size: 13,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("MP 2.200-2/2001, art. 10, §2º", {
    x: M,
    y: y - 2,
    size: 8,
    font,
    color: rgb(1, 1, 1),
  });
  y -= 50;

  // QR Code
  const qrDataUrl = await QRCode.toDataURL(args.urlValidacao, { margin: 1, width: 200 });
  const qrPng = await doc.embedPng(qrDataUrl);
  page.drawImage(qrPng, { x: A4[0] - M - 90, y: y - 90, width: 90, height: 90 });
  page.drawText("Valide em:", {
    x: A4[0] - M - 90,
    y: y - 100,
    size: 7,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(args.urlValidacao.replace(/^https?:\/\//, ""), {
    x: A4[0] - M - 90,
    y: y - 110,
    size: 6.5,
    font,
    color: rgb(0.3, 0.3, 0.3),
    maxWidth: 90,
  });

  // Hash
  page.drawText("Hash SHA-256 do documento original:", {
    x: M,
    y,
    size: 9,
    font: bold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 12;
  // hash em 2 linhas
  page.drawText(args.hashDocumentoOriginal.slice(0, 32), {
    x: M,
    y,
    size: 8,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 10;
  page.drawText(args.hashDocumentoOriginal.slice(32), {
    x: M,
    y,
    size: 8,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 20;

  // Linha
  page.drawLine({
    start: { x: M, y },
    end: { x: A4[0] - M, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 18;

  // Signatários
  page.drawText("SIGNATÁRIOS", { x: M, y, size: 11, font: bold, color: green });
  y -= 18;

  for (const s of args.signatarios) {
    if (y < M + 120) {
      page = doc.addPage(A4);
      y = A4[1] - M;
    }

    page.drawText(s.nome, { x: M, y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 12;
    page.drawText(`${s.email}${s.cpf_cnpj ? ` • CPF/CNPJ: ${s.cpf_cnpj}` : ""}`, {
      x: M,
      y,
      size: 8.5,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 11;
    page.drawText(`Papel: ${s.papel.toUpperCase()}`, {
      x: M,
      y,
      size: 8.5,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 11;
    page.drawText(
      `Assinado em: ${new Date(s.assinado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (BRT)`,
      { x: M, y, size: 8.5, font, color: rgb(0.3, 0.3, 0.3) },
    );
    y -= 11;
    if (s.ip) {
      page.drawText(`IP: ${s.ip}`, { x: M, y, size: 8.5, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 11;
    }
    page.drawText(`Código de verificação: ${s.codigo_verificacao}`, {
      x: M,
      y,
      size: 8.5,
      font: bold,
      color: green,
    });
    y -= 14;

    // Rubrica desenhada
    if (s.rubrica_base64) {
      try {
        const cleanB64 = s.rubrica_base64.replace(/^data:image\/\w+;base64,/, "");
        const imgBytes = Uint8Array.from(atob(cleanB64), (c) => c.charCodeAt(0));
        const img = await doc.embedPng(imgBytes);
        const scale = 50 / img.height;
        page.drawImage(img, { x: M, y: y - 50, width: img.width * scale, height: 50 });
        y -= 56;
      } catch {
        /* ignore */
      }
    }

    page.drawLine({
      start: { x: M, y },
      end: { x: A4[0] - M, y },
      thickness: 0.3,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 16;
  }

  // Rodapé legal
  if (y < M + 60) {
    page = doc.addPage(A4);
    y = A4[1] - M;
  }
  y = Math.max(y, M + 40);
  page.drawText(
    "Documento assinado eletronicamente. A autenticidade pode ser verificada acessando a URL acima e",
    { x: M, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) },
  );
  y -= 10;
  page.drawText(
    "informando o código de verificação. O hash SHA-256 garante que o conteúdo não foi alterado após a assinatura.",
    { x: M, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) },
  );

  return await doc.save();
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function htmlToTextBlocks(html: string) {
  const blocks: Array<{ kind: "heading" | "text"; text: string }> = [];
  // Preserve original close tags so the matching regex can detect heading endings unambiguously.
  const normalized = html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(td|th)>/gi, " | ");
  // Match block-level tags. Headings keep their level so we can close on the same tag.
  const matches = normalized.matchAll(
    /<(h[1-6]|p|li|tr)([^>]*)>([\s\S]*?)<\/\1>/gi,
  );
  for (const m of matches) {
    const tag = m[1].toLowerCase();
    const kind = tag.startsWith("h") ? "heading" : "text";
    const text = decodeHtml(
      m[3]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\s+\|/g, " |")
        .trim(),
    );
    if (text) blocks.push({ kind, text });
  }
  if (blocks.length) return blocks;
  const text = decodeHtml(
    normalized
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  return text ? [{ kind: "text" as const, text }] : [];
}


function decodeHtml(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
