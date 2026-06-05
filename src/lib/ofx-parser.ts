// Parser simples de OFX (SGML/XML) — extrai transações bancárias.
export type OfxTransaction = {
  fitId: string;
  date: string; // YYYY-MM-DD
  type: "CREDIT" | "DEBIT";
  amount: number;
  memo: string;
};

function parseOfxDate(raw: string): string {
  // YYYYMMDD[HHMMSS[.XXX]][TZ]
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return new Date().toISOString().slice(0, 10);
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function getTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}>([^<\\r\\n]+)`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

export function parseOfx(content: string): OfxTransaction[] {
  // Pega cada <STMTTRN>...</STMTTRN> ou até o próximo <STMTTRN> / </BANKTRANLIST>
  const txns: OfxTransaction[] = [];
  const blocks = content.split(/<STMTTRN>/i).slice(1);
  for (const raw of blocks) {
    const block = raw.split(/<\/STMTTRN>|<STMTTRN>/i)[0];
    const trntype = getTag(block, "TRNTYPE").toUpperCase();
    const dtposted = getTag(block, "DTPOSTED");
    const trnamt = parseFloat(getTag(block, "TRNAMT").replace(",", "."));
    const fitid = getTag(block, "FITID") || `${dtposted}-${trnamt}-${Math.random()}`;
    const memo = getTag(block, "MEMO") || getTag(block, "NAME") || "";
    if (!dtposted || isNaN(trnamt)) continue;
    txns.push({
      fitId: fitid,
      date: parseOfxDate(dtposted),
      type: trnamt >= 0 ? "CREDIT" : "DEBIT",
      amount: trnamt,
      memo,
    });
  }
  return txns;
}
