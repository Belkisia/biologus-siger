// deploy sync
const server = require("./server.cjs");
const app = server.default;
const fs = require("fs");
const path = require("path");
const STATIC = path.join(__dirname, "..", "..", "static");
const MIME = {".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".woff":"font/woff"};

// Mapa de prefixo → asset atual (para fallback de cache busting)
const ASSET_MAP = {
  "mtr.js": "mtr-DejDyzj9.js",
  "upload.js": "upload-BUxgIa_1.js",
  "PieChart.js": "PieChart-CnrfyLiK.js",
  "index.js": "index--6cdjjJ-.js",
  "document.js": "document-upload-D1wUQXUT.js",
  "pen.js": "pen-line-BlEY8yzk.js",
  "conciliacao.js": "conciliacao-PJXfHjbR.js",
  "purify.es.js": "purify.es-CC4Brkr_.js",
  "pgrss.functions.js": "pgrss.functions-CA0T7Jna.js",
  "pgrss.js": "pgrss-ver._id-EqmdmgQ3.js",
  "users.js": "users-ZvpR-rMZ.js",
  "clientes.js": "clientes-D9Qrcnlp.js",
  "sendEmail.js": "sendEmail-DvW3jg5m.js",
  "nfse.functions.js": "nfse.functions-CIby7Z97.js",
  "clientes._clienteId.js": "clientes._clienteId-Dd5FVmlU.js",
  "save.js": "save-CkYYWEOZ.js",
  "dollar.js": "dollar-sign-BXiTqhXX.js",
  "table.js": "table-BzF6jKcI.js",
  "printer.js": "printer-DS8-KeDH.js",
  "landmark.js": "landmark-DG2-doEn.js",
  "relatorios.js": "relatorios-BkrYVtBT.js",
  "trash.js": "trash-2-oKJqgkeS.js",
  "typeof.js": "typeof-QjJsDpFa.js",
  "cdf.js": "cdf-BZLvjpDP.js",
  "route.js": "route-DyuxEBYH.js",
  "auth.js": "auth-middleware-BXMg-mmD.js",
  "html2canvas.esm.js": "html2canvas.esm-DXEQVQnt.js",
  "file.js": "file-text-Bd3I4rsu.js",
  "badge.js": "badge-CAUv28Kt.js",
  "financeiro.js": "financeiro-jrOqnmOd.js",
  "loader.js": "loader-circle-CwVPwZxj.js",
  "shield.js": "shield-check-C0mFHq6l.js",
  "contratos.js": "contratos-DJ-yHDcQ.js",
  "agendamento.js": "agendamento-BBaThJsN.js",
  "history.js": "history-yjUOKiSW.js",
  "external.js": "external-link-z2B8VHY-.js",
  "propostas.pgrss.nova.js": "propostas.pgrss.nova-DlkVhRxm.js",
  "licencas.js": "licencas-COEGkZIq.js",
  "eye.js": "eye-KUbn11wo.js",
  "building.js": "building-2-BUTd6ms1.js",
  "trending.js": "trending-up-qe3oTBXj.js",
  "select.js": "select-4Jyqvbsl.js",
  "check.js": "check-DgXwnz3F.js",
  "styles.css": "styles-sBFn0ras.css",
  "reset.js": "reset-password-Bp2ZUmWa.js",
  "download.js": "download-DRSfvNny.js",
  "mail.js": "mail-0oSLlHxe.js",
  "dialog.js": "dialog-B6MgW_kr.js",
  "checkbox.js": "checkbox-C9VQct6S.js",
  "assinar._token.js": "assinar._token-CHyItbgv.js",
  "award.js": "award-CrZUigeJ.js",
  "plus.js": "plus-DKnNjOwn.js",
  "usuarios.js": "usuarios-DXV2IRM3.js",
  "arrow.js": "arrow-left-DTrZN7Qu.js",
  "modelos.js": "modelos-contrato-CzNwcPxK.js",
  "recycle.js": "recycle-3rDxrKws.js",
  "validar._codigo.js": "validar._codigo-BxNRikqQ.js",
  "portal.js": "portal-DbTQ18Li.js",
  "assinatura.functions.js": "assinatura.functions-DMkqxlmc.js",
  "dashboard.js": "dashboard-COSbQaDP.js",
  "coletas.js": "coletas-B1uVNhNO.js",
  "contrato.js": "contrato-modelo.functions-BJeN5-Br.js",
  "index.es.js": "index.es-xZYXD3cx.js",
  "historico.js": "historico-dYn97EZN.js",
  "notas.js": "notas-fiscais-DrarYk38.js",
  "propostas.js": "propostas-YsrrqRf-.js",
  "search.js": "search-BRgmdj2Y.js",
  "rotas.js": "rotas-usyLdAJq.js",
  "boletim.js": "boletim-Djt5COCZ.js",
  "circle.js": "circle-alert-BZ94hwVe.js",
  "tabs.js": "tabs-DB6burs7.js",
  "label.js": "label-BHMzSQ32.js",
  "jspdf.es.min.js": "jspdf.es.min-Bwq2hvit.js",
  "propostas.nova.js": "propostas.nova-D-Wcw-p8.js",
  "unsubscribe.js": "unsubscribe-FByfCUwO.js",
  "textarea.js": "textarea-DxSsN9aC.js",
  "folder.js": "folder-open-Cr2z3PHP.js",
  "relatorio.js": "relatorio-financeiro-NEWN0mIS.js",
  "precos.js": "precos-pgrss-ZhigrIpe.js",
  "rotate.js": "rotate-ccw-jaflkToI.js",
  "propostas.pgrss._id.js": "propostas.pgrss._id-CUOldStR.js",
  "chart.js": "chart-column-BMpR4ghf.js"
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
      // Fallback: tentar encontrar pelo prefixo
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
