#!/bin/bash
set -e
echo "=== Building SIGER PRO ==="
npx vite build

echo "=== Bundle server ==="
ESBUILD=$(find node_modules -path "*/esbuild/bin/esbuild" | head -1)
$ESBUILD .output/server/index.mjs \
  --bundle --platform=node --format=cjs \
  --outfile=.vercel/output/functions/index.func/server.cjs \
  --external:sharp --external:lightningcss --external:fsevents \
  --log-level=error

echo "=== Assets ==="
mkdir -p .vercel/output/static/assets
cp -r .output/public/assets/. .vercel/output/static/assets/

echo "=== Handler ==="
cat > .vercel/output/functions/index.func/index.js << 'HANDLER'
const server = require("./server.cjs");
const app = server.default;
const fs = require("fs");
const path = require("path");
const STATIC = path.join(__dirname, "..", "..", "static");
const MIME = {".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".woff":"font/woff"};
module.exports = async function(req, res) {
  try {
    if (req.url.startsWith("/assets/")) {
      const fp = path.join(STATIC, req.url);
      if (fs.existsSync(fp)) {
        res.setHeader("content-type", MIME[path.extname(fp)] || "application/octet-stream");
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
        res.end(fs.readFileSync(fp));
        return;
      }
    }
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url, `${proto}://${host}`);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v && k !== "host" && k !== "connection") headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
    }
    const request = new Request(url.toString(), {method: req.method, headers, body: ["GET","HEAD"].includes(req.method) ? undefined : req});
    const response = await app.fetch(request, {env: process.env});
    res.setHeader("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("vercel-cdn-cache-control", "no-store");
    res.status(response.status);
    for (const [k, v] of response.headers.entries()) {
      if (!["transfer-encoding","connection"].includes(k)) res.setHeader(k, v);
    }
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(e) {
    console.error("[SSR]", e.message);
    res.status(500).end("SSR Error: " + e.message);
  }
}
HANDLER

echo '{"type":"commonjs"}' > .vercel/output/functions/index.func/package.json
echo '{"runtime":"nodejs20.x","handler":"index.js","launcherType":"Nodejs","shouldAddHelpers":true,"maxDuration":30}' > .vercel/output/functions/index.func/.vc-config.json
cat > .vercel/output/config.json << 'CFG'
{"version":3,"routes":[{"src":"^/assets/(.+)$","dest":"/assets/$1"},{"handle":"filesystem"},{"src":"^/(.*)$","dest":"/index"}]}
CFG

echo "=== Done ==="
