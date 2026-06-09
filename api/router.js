'use strict';

const routes = {
  'POST /api/analytics/track': require('./analytics/track'),
  'POST /api/analytics/event': require('./analytics/event'),
  'GET /api/analytics/months': require('./analytics/months'),
  'GET /api/analytics/report': require('./analytics/report'),
  'GET /api/analytics/export': require('./analytics/export'),
  'POST /api/staff/login': require('./staff/login')
};

function matchRoute(method, pathname) {
  var key = method + ' ' + pathname;
  if (routes[key]) return routes[key];
  return null;
}

async function handleApiRequest(req, res) {
  var url = req.url || '/';
  var pathname = url.split('?')[0];
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
