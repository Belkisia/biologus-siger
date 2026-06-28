#!/bin/bash
set -e

echo "=== Building SIGER PRO ==="
bunx vite build

echo "=== Bundling server ==="
ESBUILD=$(find node_modules -path "*/esbuild/bin/esbuild" | head -1)
echo "esbuild: $ESBUILD"
$ESBUILD dist/server/server.js \
  --bundle --platform=node --format=cjs \
  --outfile=server-prebuilt/server.bundle.cjs \
  --external:sharp --external:lightningcss --external:fsevents \
  --log-level=error

echo "=== Patch React ==="
node -e "
const fs = require('fs');
const glob = require('glob');
const files = glob.sync('dist/client/_app/index-*.js');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  const m = c.match(/(\w+)\.startTransition\(\(\)=>\{(\w+)\.hydrateRoot\(document,React\.createElement/);
  if (m) {
    const rv = m[1];
    const n = c.replace(/React\.createElement\((\w+)\.StrictMode,null,React\.createElement/g,
      (_, x) => rv+'.createElement('+x+'.StrictMode,null,'+rv+'.createElement');
    if (n !== c) { fs.writeFileSync(f, n); console.log('Patched:', f); }
  }
});
" 2>/dev/null || python3 -c "
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

echo "=== Assets ==="
mkdir -p server-prebuilt/assets
cp -r dist/client/_app/. server-prebuilt/assets/

echo "=== Vercel Output ==="
rm -rf .vercel/output
mkdir -p .vercel/output/static/assets
mkdir -p .vercel/output/functions/index.func
cp -r server-prebuilt/assets/. .vercel/output/static/assets/
cp server-prebuilt/server.bundle.cjs .vercel/output/functions/index.func/server.cjs

node -e "
const fs = require('fs');
const handler = \`const server = require('./server.cjs');
const app = server.default;
module.exports = async function(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url, proto + '://' + host);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v && k !== 'host' && k !== 'connection') headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
    }
    const request = new Request(url.toString(), { method: req.method, headers, body: ['GET','HEAD'].includes(req.method) ? undefined : req });
    const response = await app.fetch(request, { env: process.env });
    res.status(response.status);
    for (const [k, v] of response.headers.entries()) {
      if (k !== 'transfer-encoding' && k !== 'connection') res.setHeader(k, v);
    }
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(e) {
    console.error('[SSR]', e.message);
    res.status(500).end('SSR Error: ' + e.message);
  }
}\`;
fs.writeFileSync('.vercel/output/functions/index.func/index.js', handler);
fs.writeFileSync('.vercel/output/functions/index.func/package.json', JSON.stringify({type:'commonjs'}));
fs.writeFileSync('.vercel/output/functions/index.func/.vc-config.json', JSON.stringify({runtime:'nodejs20.x',handler:'index.js',launcherType:'Nodejs',shouldAddHelpers:true,maxDuration:30}));
fs.writeFileSync('.vercel/output/config.json', JSON.stringify({version:3,routes:[{src:'^/assets/(.+\\\\.css)$',headers:{'content-type':'text/css; charset=utf-8','cache-control':'public, max-age=31536000, immutable'},continue:true},{src:'^/assets/(.+\\\\.js)$',headers:{'content-type':'application/javascript; charset=utf-8','cache-control':'public, max-age=31536000, immutable'},continue:true},{handle:'filesystem'},{src:'^/(.*)\$',dest:'/index'}]}, null, 2));
console.log('Handler e config gerados');
"

echo "=== Build completo ==="
