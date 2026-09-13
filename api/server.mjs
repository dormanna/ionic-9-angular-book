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
  res.writeHead(status, {
    'Content-Type': 'application/json',
    // The same address answers in more than one language.
    Vary: 'Accept-Language',
  });
  res.end(JSON.stringify(body));
};

// English is the catalogue; a translation lays itself over it,
// and whatever it does not cover stays English.
const localize = (item, language) => {
  const { Translations = {}, ...base } = item;
  return { ...base, ...Translations[language] };
};

const languageOf = (req) =>
  (req.headers['accept-language'] ?? '').slice(0, 2);

const readBody = async (req) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
};

// /api/tours?q=rhine&region=SM&tourType=BO
//           &minPrice=80&maxPrice=250 — all optional.
const tours = (url, language) => {
  const get = (name) => url.searchParams.get(name) ?? '';
  const q = get('q').toLowerCase();
  const region = get('region');
  const type = get('tourType');
  const min = Number(get('minPrice')) || 0;
  const max = Number(get('maxPrice')) || Infinity;
  return db.tours
    .map((t) => localize(t, language))
    .filter(
      (t) =>
        (!region || t.Region === region) &&
        (!type || t.Tourtype === type) &&
        t.PriceG >= min &&
        t.PriceG <= max &&
        (!q ||
          `${t.Title} ${t.Description}`
            .toLowerCase()
            .includes(q)),
    );
};

// The tour photographs, /api/img/big/city.jpg and
// /api/img/small/city.jpg. No delay: the pictures are
// not what the loading states are about.
const image = async (path) => {
  const m = /^\/api\/img\/(big|small)\/([\w-]+\.jpg)$/
    .exec(path);
  if (!m) return null;
  const file = new URL(`./img/${m[1]}/${m[2]}`, import.meta.url);
  return readFile(file).catch(() => null);
};

const routes = {
  'GET /api/tours': (url, language) => tours(url, language),
  'GET /api/regions': (url, language) =>
    db.regions.map((r) => localize(r, language)),
  'GET /api/tourtypes': (url, language) =>
    db.tourtypes.map((t) => localize(t, language)),
  'GET /api/requests': () => requests,
};

// A native app is a different origin than this server, so the
// browser inside it asks permission first. Development only: in
// production, name the origins you serve.
const allowOrigin = (res) => {
  const allow = 'Access-Control-Allow-';
  res.setHeader(`${allow}Origin`, '*');
  res.setHeader(`${allow}Headers`, 'Content-Type');
  res.setHeader(`${allow}Methods`, 'GET, POST, OPTIONS');
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const language = languageOf(req);

  allowOrigin(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET') {
    const picture = await image(path);
    if (picture) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      return res.end(picture);
    }
  }

  await new Promise((done) => setTimeout(done, DELAY));

  // Ask any route to fail, and see what your app makes of it:
  //   /api/tours?fail=500
  if (url.searchParams.has('fail')) {
    const status = Number(url.searchParams.get('fail')) || 500;
    return send(res, status, { error: 'Asked to fail' });
  }

  const route = routes[`${req.method} ${path}`];
  if (route) return send(res, 200, route(url, language));

  if (req.method === 'GET' && path.startsWith('/api/tours/')) {
    const id = Number(path.split('/').pop());
    const tour = db.tours.find((t) => t.ID === id);
    return tour
      ? send(res, 200, localize(tour, language))
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
