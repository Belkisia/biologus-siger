const server = require("./server.cjs");
const handler = server.default;

module.exports = async function(req, res) {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url, `${protocol}://${host}`);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v && k !== "host" && k !== "connection") {
        headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
      }
    }
    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: ["GET","HEAD"].includes(req.method) ? undefined : req,
    });
    const response = await handler.fetch(request, { env: process.env });
    res.status(response.status);
    for (const [k, v] of response.headers.entries()) {
      if (k !== "transfer-encoding" && k !== "connection") res.setHeader(k, v);
    }
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(e) {
    console.error("[SSR Error]", e.message, e.stack);
    res.status(500).end("SSR Error: " + e.message);
  }
}
