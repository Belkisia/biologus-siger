// deploy 81
const server = require("./server.cjs");
const app = server.default;
const fs = require("fs");
const path = require("path");
const STATIC = path.join(__dirname, "..", "..", "static");
const MIME = {".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".woff":"font/woff"};
const ASSET_MAP = {
  "index.js": "index-I-pL0E8j.js",
  "notas.js": "notas-fiscais-DDatz38y.js",
  "trash.js": "trash-2-BEX78DtN.js",
  "relatorio.js": "relatorio-financeiro-BYvyiu1c.js",
  "conciliacao.js": "conciliacao-Bxn1mVTy.js",
  "chart.js": "chart-column-B5_2d5sP.js",
  "label.js": "label-BSjnP37m.js",
  "purify.es.js": "purify.es-CC4Brkr_.js",
  "building.js": "building-2-D053u7nb.js",
  "loader.js": "loader-circle-CTAaX4KG.js",
  "plus.js": "plus-B8BEWkxO.js",
  "search.js": "search--DpySj_U.js",
  "circle.js": "circle-alert-x0OJ0GxF.js",
  "clientes._clienteId.js": "clientes._clienteId-DH8uF0bp.js",
  "auth.js": "auth-BqbvynCz.js",
  "index.es.js": "index.es-CMRNym4Z.js",
  "licencas.js": "licencas-3UpMxyT3.js",
  "jspdf.es.min.js": "jspdf.es.min-DTzQOFRQ.js",
  "award.js": "award-BxXN4Nft.js",
  "reset.js": "reset-password-BrJM4tCo.js",
  "rotate.js": "rotate-ccw-ntgdOavk.js",
  "mail.js": "mail-DU6rUaB0.js",
  "external.js": "external-link-ExBEnxe7.js",
  "nfse.functions.js": "nfse.functions-DlLe9mwU.js",
  "dollar.js": "dollar-sign-BtNBH8yc.js",
  "folder.js": "folder-open-JJN9xaiC.js",
  "pgrss.js": "pgrss-nova-CZnfbvHf.js",
  "dialog.js": "dialog-BDeT-N-6.js",
  "cdf.js": "cdf-CTXzZdqM.js",
  "shield.js": "shield-check-DfxRvEID.js",
  "typeof.js": "typeof-QjJsDpFa.js",
  "recycle.js": "recycle-DiBJr7iy.js",
  "upload.js": "upload-C0vtZVEs.js",
  "check.js": "check-check-BZcFjeDQ.js",
  "route.js": "route-BruY3vgx.js",
  "history.js": "history-CCjjJoQD.js",
  "boletim.js": "boletim-Zim1NX8w.js",
  "clientes.js": "clientes-BDZpAdKa.js",
  "html2canvas.esm.js": "html2canvas.esm-DXEQVQnt.js",
  "printer.js": "printer-Bg2mQJvw.js",
  "rotas.js": "rotas-9XrfJsEF.js",
  "eye.js": "eye-DYkrXZj1.js",
  "precos.js": "precos-pgrss-C8fIG-z9.js",
  "financeiro.js": "financeiro-e7yHhR9J.js",
  "agendamento.js": "agendamento-DMoeI-t3.js",
  "file.js": "file-text-BqC7s4JA.js",
  "styles.css": "styles-sBFn0ras.css",
  "usuarios.js": "usuarios-DxI2LAH4.js",
  "tabs.js": "tabs-CCCuvid4.js",
  "propostas.pgrss._id.js": "propostas.pgrss._id-DNIvyDeF.js",
  "table.js": "table-BjnETQ9R.js",
  "select.js": "select-DGvcsbf7.js",
  "save.js": "save-B0dw3JOX.js",
  "pgrss.functions.js": "pgrss.functions-CU97yDzS.js",
  "users.js": "users-z4RvB4FC.js",
  "download.js": "download-DqLUlCV3.js",
  "assinar._token.js": "assinar._token-Bkfa6exu.js",
  "unsubscribe.js": "unsubscribe-BPK7w2zW.js",
  "contrato.js": "contrato-modelo.functions-DHRkKof3.js",
  "portal.js": "portal-DNpCGRk7.js",
  "propostas.pgrss.nova.js": "propostas.pgrss.nova-BbUXMAFK.js",
  "propostas.js": "propostas-DXfkYJpi.js",
  "historico.js": "historico-DLYhsbJD.js",
  "validar._codigo.js": "validar._codigo-DBScFpfd.js",
  "mtr.js": "mtr-D6B7MJzX.js",
  "trending.js": "trending-up-D28Arpv5.js",
  "assinatura.functions.js": "assinatura.functions-BoHHLarS.js",
  "document.js": "document-upload-BiyInxK_.js",
  "landmark.js": "landmark-CZr7XupQ.js",
  "coletas.js": "coletas-BbNKsuNb.js",
  "PieChart.js": "PieChart--KNvIQPB.js",
  "badge.js": "badge-Dldlk9oG.js",
  "propostas.nova.js": "propostas.nova-DstiinQ3.js",
  "checkbox.js": "checkbox-B3i4H1n8.js",
  "textarea.js": "textarea-BdOOS7qL.js",
  "modelos.js": "modelos-contrato-COJ3vXom.js",
  "contratos.js": "contratos-D4Rd3qPf.js",
  "arrow.js": "arrow-left-Bh9EsZMx.js",
  "relatorios.js": "relatorios-DTVodbEI.js",
  "dashboard.js": "dashboard-BjMV7TG8.js",
  "pen.js": "pen-line-DFAWL_it.js"
};
module.exports = async function(req, res) {
  try {
    if (req.url.startsWith("/assets/")) {
      const fname = req.url.slice(8).split("?")[0];
      const fp = path.join(STATIC, fname);
      if (fs.existsSync(fp)) {
        res.setHeader("content-type", MIME[path.extname(fp)] || "application/octet-stream");
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
        res.end(fs.readFileSync(fp));
        return;
      }
      const ext = path.extname(fname).slice(1);
      const prefix = fname.split('-')[0];
      const current = ASSET_MAP[prefix + "." + ext];
      if (current) {
        const fp2 = path.join(STATIC, current);
        if (fs.existsSync(fp2)) {
          res.setHeader("content-type", MIME["." + ext] || "application/octet-stream");
          res.setHeader("cache-control", "public, max-age=60");
          res.end(fs.readFileSync(fp2));
          return;
        }
      }
      res.statusCode = 404;
      res.end("Not found: " + fname);
      return;
    }
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url, proto + "://" + host);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v && k !== "host" && k !== "connection") headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
    }
    const request = new Request(url.toString(), {method: req.method, headers, body: ["GET","HEAD"].includes(req.method) ? undefined : req});
    const response = await app.fetch(request, {env: process.env});
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("text/html")) {
      res.setHeader("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
      res.setHeader("pragma", "no-cache");
      res.setHeader("vercel-cdn-cache-control", "no-store");
    }
    res.statusCode = response.status;
    for (const [k, v] of response.headers.entries()) {
      if (!["transfer-encoding","connection","cache-control"].includes(k)) res.setHeader(k, v);
    }
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(e) {
    console.error("[SSR]", e.message);
    res.statusCode = 500;
    res.end("SSR Error: " + e.message);
  }
}
