export default async function handler(req, res) {
  // Assets são servidos diretamente pelo Vercel via outputDirectory
  if (req.url.startsWith('/assets/') || req.url.startsWith('/favicon')) {
    res.status(404).end();
    return;
  }

  const { default: server } = await import("../dist/server/server.js");
  
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  
  const headers = new Headers();
  Object.entries(req.headers).forEach(([k, v]) => {
    if (v && k !== 'host') headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  });

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
  });

  const response = await server.fetch(request);

  res.status(response.status);
  response.headers.forEach((v, k) => {
    if (k !== 'transfer-encoding') res.setHeader(k, v);
  });
  
  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
}
