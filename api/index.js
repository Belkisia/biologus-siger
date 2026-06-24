export default async function handler(req, res) {
  const { default: server } = await import("../dist/server/server.js");
  
  const url = new URL(req.url, `https://${req.headers.host}`);
  const headers = new Headers();
  Object.entries(req.headers).forEach(([k, v]) => {
    if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  });

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
  });

  const response = await server.fetch(request);

  res.status(response.status);
  response.headers.forEach((v, k) => res.setHeader(k, v));
  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
}
