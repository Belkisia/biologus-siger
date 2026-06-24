const server = require("./server.cjs");
const handler = server.default || server;
const fs = require("fs");
const path = require("path");

const MIME = {
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

module.exports = async function(req, res) {
  try {
    if (req.url.startsWith("/_app/")) {
      const assetPath = path.join(__dirname, "static", req.url);
      if (fs.existsSync(assetPath)) {
        const ext = path.extname(assetPath);
        res.setHeader("content-type", MIME[ext] || "application/octet-stream");
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
        res.end(fs.readFileSync(assetPath));
        return;
      }
    }
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url, `${protocol}://${host}`);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers))
      if (v && k !== "host" && k !== "connection")
        headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
    const request = new Request(url.toString(), {
      method: req.method, headers,
      body: ["GET","HEAD"].includes(req.method) ? undefined : req,
    });
    const response = await handler.fetch(request);
    res.status(response.status);
    for (const [k, v] of response.headers.entries())
      if (k !== "transfer-encoding" && k !== "connection") res.setHeader(k, v);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error("[SSR]", error.message);
    res.status(500).end("Error: " + error.message);
  }
}
