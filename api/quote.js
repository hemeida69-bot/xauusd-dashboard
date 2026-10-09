// Vercel serverless function — proxy AllTick to avoid browser CORS
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const token = req.query.token;
  const path = req.query.path || 'trade-tick';
  const query = req.query.query;

  if (!token || !query) {
    return res.status(400).json({ ret: 400, msg: 'token and query required' });
  }

  // Allow only known AllTick quote paths
  const allowed = new Set(['trade-tick', 'depth-tick', 'kline']);
  if (!allowed.has(path)) {
    return res.status(400).json({ ret: 400, msg: 'invalid path' });
  }

  const url =
    'https://quote.alltick.co/quote-b-api/' +
    path +
    '?token=' +
    encodeURIComponent(token) +
    '&query=' +
    encodeURIComponent(query);

  try {
    const r = await fetch(url);
    const text = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(r.status).send(text);
  } catch (e) {
    res.status(502).json({ ret: 502, msg: String(e.message || e) });
  }
};
