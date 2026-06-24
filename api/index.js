import server from "../dist/server/server.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
  });
  
  const response = await server.fetch(request);
  
  res.status(response.status);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const body = await response.text();
  res.send(body);
}
