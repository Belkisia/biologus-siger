#!/bin/bash
set -e

echo "=== Building TanStack Start ==="
npx vite build

echo "=== Creating Vercel Build Output ==="
rm -rf .vercel/output
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions/index.func

# 1. Copiar assets estáticos para .vercel/output/static
cp -r dist/client/assets .vercel/output/static/
cp dist/client/index.html .vercel/output/static/index.html 2>/dev/null || true

# 2. Copiar o server para a function
cp -r dist/server .vercel/output/functions/index.func/
cp -r dist/client .vercel/output/functions/index.func/

# 3. Criar o handler da function
cat > .vercel/output/functions/index.func/index.js << 'EOF'
import server from "./server/server.js";

export default async function handler(req, res) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  
  const headers = new Headers();
  Object.entries(req.headers).forEach(([k, v]) => {
    if (v && k !== "host") headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  });

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
  });

  const response = await server.fetch(request);
  
  res.status(response.status);
  response.headers.forEach((v, k) => {
    if (k !== "transfer-encoding") res.setHeader(k, v);
  });
  
  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
}
EOF

# 4. Criar package.json para a function
cat > .vercel/output/functions/index.func/package.json << 'EOF'
{"type":"module"}
EOF

# 5. Criar .vc-config.json para a function
cat > .vercel/output/functions/index.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true
}
EOF

# 6. Criar config.json principal
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": { "cache-control": "public, max-age=31536000, immutable" },
      "continue": true
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index"
    }
  ]
}
EOF

echo "=== Vercel Build Output criado ==="
ls -la .vercel/output/
ls -la .vercel/output/static/
ls -la .vercel/output/functions/index.func/
