#!/bin/bash
set -e

echo "=== Building SIGER PRO ==="
bunx vite build

echo "=== Bundling server ==="
ESBUILD=$(find node_modules -path "*/esbuild/bin/esbuild" | head -1)
echo "esbuild: $ESBUILD"
$ESBUILD dist/server/server.js \
  --bundle --platform=node --format=cjs \
  --outfile=dist/server.bundle.cjs \
  --external:sharp --external:lightningcss --external:fsevents \
  --log-level=error

echo "=== Patch React ==="
python3 -c "
import re, glob
for f in glob.glob('dist/client/_app/index-*.js'):
    c = open(f).read()
    m = list(re.finditer(r'(\w+)\.startTransition\(\(\)=>\{(\w+)\.hydrateRoot\(document,React\.createElement', c))
    if m:
        rv = m[0].group(1)
        n = re.sub(r'React\.createElement\((\w+)\.StrictMode,null,React\.createElement', lambda x: rv+'.createElement('+x.group(1)+'.StrictMode,null,'+rv+'.createElement', c)
        if n != c:
            open(f,'w').write(n)
            print('Patched:', f)
"

echo "=== Vercel Output ==="
rm -rf .vercel/output
mkdir -p .vercel/output/static/_app
mkdir -p .vercel/output/functions/index.func

cp -r dist/client/_app/. .vercel/output/static/_app/
cp dist/server.bundle.cjs .vercel/output/functions/index.func/server.cjs

cat > .vercel/output/functions/index.func/index.js << 'HANDLER'
const server = require("./server.cjs");
const app = server.default;
const fs = require("fs");
const path = require("path");

const STATIC = path.join(__dirname, "..", "..", "static");
const MIME = {
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
  ".woff2":"font/woff2",
  ".woff": "font/woff",
};

module.exports = async function(req, res) {
  try {
    // Servir assets estáticos /_app/
    if (req.url.startsWith("/_app/")) {
      const filePath = path.join(STATIC, req.url);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        res.setHeader("content-type", MIME[ext] || "application/octet-stream");
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
        res.end(fs.readFileSync(filePath));
        return;
      }
    }

    // SSR
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host  = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url   = new URL(req.url, `${proto}://${host}`);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v && k !== "host" && k !== "connection")
        headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
    }
    const request = new Request(url.toString(), {
      method: req.method,
      headers,
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
HANDLER

echo '{"type":"commonjs"}' > .vercel/output/functions/index.func/package.json
echo '{"runtime":"nodejs20.x","handler":"index.js","launcherType":"Nodejs","shouldAddHelpers":true,"maxDuration":30}' > .vercel/output/functions/index.func/.vc-config.json

cat > .vercel/output/config.json << 'CFG'
{
  "version": 3,
  "routes": [
    {
      "src": "^/_app/(.+)$",
      "headers": {"cache-control": "public, max-age=31536000, immutable"},
      "continue": true
    },
    {"handle": "filesystem"},
    {"src": "^/(.*)$", "dest": "/index"}
  ]
}
CFG

echo "=== Build completo ==="
