'use strict';

const routes = {
  'POST /api/analytics/track': require('./analytics/track'),
  'POST /api/analytics/event': require('./analytics/event'),
  'GET /api/analytics/months': require('./analytics/months'),
  'GET /api/analytics/report': require('./analytics/report'),
  'GET /api/analytics/export': require('./analytics/export'),
  'POST /api/staff/login': require('./staff/login'),

  // Applicant auth + applications (database-backed)
  'POST /api/auth/register': require('./auth/register'),
  'POST /api/auth/login': require('./auth/login'),
  'GET /api/applications': require('./applications'),
  'POST /api/applications': require('./applications'),

  // Staff application review
  'GET /api/staff/applications': require('./staff/applications'),
  'PATCH /api/staff/applications': require('./staff/applications'),

  // NDA Price Watch PDF scraper
  'GET /api/price-watch': require('./price-watch')
};

function matchRoute(method, pathname) {
  var key = method + ' ' + pathname;
  if (routes[key]) return routes[key];
  return null;
}

/** Normalize path for Vercel rewrites and non-Next catch-all quirks. */
function normalizePathname(req) {
  var url = req.url || '/';
  var pathname = url.split('?')[0];

  if (pathname.indexOf('://') !== -1) {
    try {
      pathname = new URL(pathname).pathname;
    } catch (e) {}
  }

  if (!pathname.startsWith('/api')) {
    var headers = req.headers || {};
    var orig = headers['x-vercel-original-url'] || headers['x-invoke-path'] || headers['x-forwarded-uri'];
    if (orig) {
      pathname = String(orig).split('?')[0];
    }
  }

  if ((pathname === '/api' || pathname === '/api/') && req.query && req.query.path) {
    var segs = req.query.path;
    if (!Array.isArray(segs)) segs = String(segs).split('/');
    pathname = '/api/' + segs.filter(Boolean).join('/');
  }

  if (pathname !== '/api' && !pathname.startsWith('/api/')) {
    pathname = '/api' + (pathname.startsWith('/') ? pathname : '/' + pathname);
  }

  return pathname;
}

async function handleApiRequest(req, res) {
  var pathname = normalizePathname(req);
  var handler = matchRoute(req.method, pathname);
  if (!handler) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
    return true;
  }
  await handler(req, res);
  return true;
}

module.exports = { handleApiRequest: handleApiRequest };
