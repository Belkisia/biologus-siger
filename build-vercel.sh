#!/bin/bash
set -e

echo "=== Building TanStack Start ==="
npx vite build

echo "=== Creating Vercel Build Output API v3 ==="
rm -rf .vercel/output
mkdir -p .vercel/output/static/assets
mkdir -p .vercel/output/functions/index.func/server
mkdir -p .vercel/output/functions/index.func/client

# 1. Assets estáticos do client → .vercel/output/static/assets/
cp -r dist/client/assets/. .vercel/output/static/assets/
echo "✓ Assets copiados: $(ls .vercel/output/static/assets/ | wc -l) arquivos"

# 2. Server bundle → dentro da function
cp -r dist/server/. .vercel/output/functions/index.func/server/
echo "✓ Server copiado"

# 3. Client para o server poder servir o index.html via SSR
cp dist/client/index.html .vercel/output/functions/index.func/client/index.html

# 4. Handler da serverless function
cat > .vercel/output/functions/index.func/index.js << 'EOF'
import server from "./server/server.js";

export default async function handler(req, res) {
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

    const hasBody = !["GET", "HEAD"].includes(req.method);
    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: hasBody ? req : undefined,
      duplex: hasBody ? "half" : undefined,
    });

    const response = await server.fetch(request);
    
    res.status(response.status);
    for (const [k, v] of response.headers.entries()) {
      if (k !== "transfer-encoding" && k !== "connection") {
        res.setHeader(k, v);
      }
    }
    
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (error) {
    console.error("[SSR Error]", error);
    res.status(500).end("Internal Server Error");
  }
}
EOF

# 5. package.json para a function (ESM)
cat > .vercel/output/functions/index.func/package.json << 'EOF'
{"type":"module"}
EOF

# 6. .vc-config.json
cat > .vercel/output/functions/index.func/.vc-config.json << 'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true,
  "maxDuration": 30
}
EOF

# 7. config.json — assets via filesystem, tudo mais via SSR
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "^/assets/(.+)$",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "^/favicon\\.ico$",
      "continue": true
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "^/(.*)$",
      "dest": "/index"
    }
  ]
}
EOF

echo "=== Build Output criado ==="
echo "Static assets: $(ls .vercel/output/static/assets/ | wc -l)"
echo "Function files: $(ls .vercel/output/functions/index.func/ | wc -l)"
