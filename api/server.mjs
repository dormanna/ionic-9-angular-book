// The BoB Tours API. Node's own http server, no dependencies.
// Start it in a second terminal:  node api/server.mjs
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';

const PORT = 3000;
const DELAY = 400; // ms, so that a loading state is visible

// The catalogue is read-only. Requests are written beside it.
const seed = new URL('./db.json', import.meta.url);
const inbox = new URL('./requests.json', import.meta.url);

const db = JSON.parse(await readFile(seed, 'utf8'));
const requests = await readFile(inbox, 'utf8')
  .then(JSON.parse)
  .catch(() => []);

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readBody = async (req) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
};

// /api/tours?q=rhine&region=SM — both optional.
const tours = (url) => {
  const q = (url.searchParams.get('q') ?? '').toLowerCase();
  const region = url.searchParams.get('region') ?? '';
  return db.tours.filter(
    (t) =>
      (!region || t.Region === region) &&
      (!q || t.Title.toLowerCase().includes(q)),
  );
};

const routes = {
  'GET /api/tours': (url) => tours(url),
  'GET /api/regions': () => db.regions,
  'GET /api/tourtypes': () => db.tourtypes,
  'GET /api/requests': () => requests,
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  await new Promise((done) => setTimeout(done, DELAY));

  // Ask any route to fail, and see what your app makes of it:
  //   /api/tours?fail=500
  if (url.searchParams.has('fail')) {
    const status = Number(url.searchParams.get('fail')) || 500;
    return send(res, status, { error: 'Asked to fail' });
  }

  const route = routes[`${req.method} ${path}`];
  if (route) return send(res, 200, route(url));

  if (req.method === 'GET' && path.startsWith('/api/tours/')) {
    const id = Number(path.split('/').pop());
    const tour = db.tours.find((t) => t.ID === id);
    return tour
      ? send(res, 200, tour)
      : send(res, 404, { error: `No tour with ID ${id}` });
  }

  if (req.method === 'POST' && path === '/api/requests') {
    const sent = await readBody(req);
    const request = { ID: requests.length + 1, ...sent };
    requests.push(request);
    await writeFile(inbox, JSON.stringify(requests, null, 2));
    return send(res, 201, request);
  }

  send(res, 404, { error: `No route for ${path}` });
});

server.listen(PORT, () => {
  console.log(`BoB Tours API on http://localhost:${PORT}`);
});
