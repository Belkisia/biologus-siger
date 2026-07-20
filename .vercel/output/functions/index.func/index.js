const server = require("./server.cjs");
const app = server.default;
const fs = require("fs");
const path = require("path");

// Assets ficam em static/assets/ relativo ao output
const ASSETS = path.join(__dirname, "..", "..", "static", "assets");
const MIME = {
  ".js":    "application/javascript; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".svg":   "image/svg+xml",
  ".png":   "image/png",
  ".ico":   "image/x-icon",
  ".woff2": "font/woff2",
  ".woff":  "font/woff",
};

module.exports = async function(req, res) {
  try {
    // Servir assets estáticos
    if (req.url.startsWith("/assets/")) {
      const fname = req.url.replace(/^\/assets\//, "").split("?")[0];
      const fp = path.join(ASSETS, fname);
      if (fs.existsSync(fp)) {
        const ext = path.extname(fp);
        res.setHeader("content-type", MIME[ext] || "application/octet-stream");
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
        res.end(fs.readFileSync(fp));
        return;
      }
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    // SSR
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url, `${proto}://${host}`);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v && k !== "host" && k !== "connection")
        headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
    }
    const request = new Request(url.toString(), {
      method: req.method, headers,
      body: ["GET","HEAD"].includes(req.method) ? undefined : req,
    });
    const response = await app.fetch(request, { env: process.env });
    res.setHeader("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("vercel-cdn-cache-control", "no-store");
    res.statusCode = response.status;
    for (const [k, v] of response.headers.entries()) {
      if (!["transfer-encoding", "connection"].includes(k)) res.setHeader(k, v);
    }
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(e) {
    console.error("[SSR]", e.message, e.stack?.slice(0,200));
    res.statusCode = 500;
    res.end("SSR Error: " + e.message);
  }
}
