'use strict';

const { recordEvent } = require('../../_lib/analytics-store');
const { pageLabel } = require('../../_lib/analytics-core');
const { sendJson, readBody, setCors } = require('../../_lib/http');

async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    var body = await readBody(req);
    var path = body.path || '/';
    var at = body.at || new Date().toISOString();
    var sessionId = body.sessionId || 'anon';

    await recordEvent({
      type: 'page_view',
      path: path,
      label: body.label || pageLabel(path),
      sessionId: sessionId,
      at: at
    });

    return sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error('analytics track error', e);
    return sendJson(res, 500, { error: 'Failed to record page view' });
  }
}

module.exports = handler;
module.exports.default = handler;
