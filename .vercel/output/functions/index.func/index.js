const server = require("./server.cjs");
const app = server.default;
const fs = require("fs");
const path = require("path");

const STATIC = path.join(__dirname, "..", "..", "static");
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
    if (req.url.startsWith("/assets/")) {
      const filePath = path.join(STATIC, req.url);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        res.setHeader("content-type", MIME[ext] || "application/octet-stream");
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
        res.end(fs.readFileSync(filePath));
        return;
      }
    }
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host  = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url   = new URL(req.url, `${proto}://${host}`);
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
    res.status(response.status);
    for (const [k, v] of response.headers.entries()) {
      if (k !== "transfer-encoding" && k !== "connection") res.setHeader(k, v);
    }
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(e) {
    console.error("[SSR]", e.message, e.stack);
    res.status(500).end("SSR Error: " + e.message);
  }
}
