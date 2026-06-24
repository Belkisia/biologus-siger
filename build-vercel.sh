#!/bin/bash
set -e

echo "=== Using pre-compiled server bundle ==="
# Não faz build no Vercel — usa o bundle já compilado que foi commitado

echo "=== Creating Vercel Build Output API v3 ==="
rm -rf .vercel/output
mkdir -p .vercel/output/static/assets
mkdir -p .vercel/output/functions/index.func

# 1. Assets estáticos pré-compilados
cp -r server-prebuilt/assets/. .vercel/output/static/assets/
echo "✓ Assets: $(ls .vercel/output/static/assets/ | wc -l) arquivos"

# 2. Server bundle pré-compilado
cp server-prebuilt/server.bundle.cjs .vercel/output/functions/index.func/server.cjs
echo "✓ Server: $(du -sh .vercel/output/functions/index.func/server.cjs | cut -f1)"

# 3. Handler
cat > .vercel/output/functions/index.func/index.js << 'EOF'
const server = require("./server.cjs");
const handler = server.default || server;

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
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
    });

    const response = await handler.fetch(request);
    
    res.status(response.status);
    for (const [k, v] of response.headers.entries()) {
      if (k !== "transfer-encoding" && k !== "connection") {
        res.setHeader(k, v);
      }
    }
    
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (error) {
    console.error("[SSR Error]", error.message, error.stack);
    res.status(500).end("Internal Server Error: " + error.message);
  }
}
EOF

# 4. package.json CJS
cat > .vercel/output/functions/index.func/package.json << 'EOF'
{"type":"commonjs"}
EOF

# 5. .vc-config.json
cat > .vercel/output/functions/index.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true,
  "maxDuration": 30
}
EOF

# 6. config.json
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "^/assets/(.+)$",
      "headers": { "cache-control": "public, max-age=31536000, immutable" },
      "continue": true
    },
    { "handle": "filesystem" },
    { "src": "^/(.*)$", "dest": "/index" }
  ]
}
EOF

echo "=== Build Output pronto ==="
