'use strict';

const db = require('../_lib/db');
const { sendJson, readBody, setCors, parseQuery } = require('../_lib/http');
const { requireUser } = require('../_lib/user-auth');

const VALID_TYPES = ['crop', 'mesp_2025_26', 'environmental', 'livestock', 'other'];

function rowToApplication(row) {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    type: row.type,
    commodity: row.commodity,
    farmerCategory: row.farmer_category,
    status: row.status,
    summary: row.summary,
    details: row.details,
    statusMessage: row.status_message,
    submittedAt: row.submitted_at,
    decidedAt: row.decided_at
  };
}

async function listForUser(res, userId, query) {
  if (query.id) {
    var one = await db.queryOne(
      `SELECT * FROM applications WHERE id = $1 AND user_id = $2`,
      [query.id, userId]
    );
    if (!one) return sendJson(res, 404, { error: 'Application not found.' });
    return sendJson(res, 200, { ok: true, application: rowToApplication(one) });
  }
  var result = await db.query(
    `SELECT * FROM applications WHERE user_id = $1 ORDER BY submitted_at DESC`,
    [userId]
  );
  return sendJson(res, 200, { ok: true, applications: result.rows.map(rowToApplication) });
}

async function createForUser(req, res, userId) {
  var body = await readBody(req);
  var type = String(body.type || '').trim();
  if (VALID_TYPES.indexOf(type) === -1) {
    return sendJson(res, 400, { error: 'Invalid application type.' });
  }

  var referenceCode = 'APP-' + Date.now();
  var summary = body.summary && typeof body.summary === 'object' ? body.summary : {};
  var details = body.details && typeof body.details === 'object' ? body.details : {};

  var created = await db.withTransaction(async function (client) {
    var ins = await client.query(
      `INSERT INTO applications
         (reference_code, user_id, type, commodity, farmer_category, summary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        referenceCode,
        userId,
        type,
        body.commodity || null,
        body.farmerCategory || null,
        JSON.stringify(summary),
        JSON.stringify(details)
      ]
    );
    var app = ins.rows[0];
    await client.query(
      `INSERT INTO application_events (application_id, action, to_status, note)
       VALUES ($1, 'submitted', $2, $3)`,
      [app.id, app.status, 'Application submitted by applicant.']
    );
    return app;
  });

  return sendJson(res, 201, { ok: true, application: rowToApplication(created) });
}

async function handler(req, res) {
  setCors(res, 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (!db.isConfigured()) {
    return sendJson(res, 503, { error: 'Database not configured. Set DATABASE_URL.' });
  }

  var user = requireUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Authentication required.' });
  }

  try {
    if (req.method === 'GET') {
      return await listForUser(res, user.id, parseQuery(req.url));
    }
    if (req.method === 'POST') {
      return await createForUser(req, res, user.id);
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    console.error('applications error', e);
    return sendJson(res, 500, { error: 'Application request failed' });
  }
}

module.exports = handler;
module.exports.default = handler;
