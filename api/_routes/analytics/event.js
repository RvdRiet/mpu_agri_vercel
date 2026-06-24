'use strict';

const { recordEvent } = require('../../_lib/analytics-store');
const { sendJson, readBody, setCors } = require('../../_lib/http');

var ALLOWED = {
  application_submitted: true,
  application_status: true,
  user_registered: true,
  issue_reported: true,
  feedback_submitted: true
};

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
    if (!body.type || !ALLOWED[body.type]) {
      return sendJson(res, 400, { error: 'Invalid event type' });
    }
    body.at = body.at || new Date().toISOString();
    await recordEvent(body);
    return sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error('analytics event error', e);
    return sendJson(res, 500, { error: 'Failed to record event' });
  }
}

module.exports = handler;
module.exports.default = handler;
