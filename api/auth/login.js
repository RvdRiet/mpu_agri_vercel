'use strict';

const db = require('../lib/db');
const { sendJson, readBody, setCors } = require('../lib/http');
const { normalizeId, hashId, verifyPassword, signToken } = require('../lib/user-auth');

async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (!db.isConfigured()) {
    return sendJson(res, 503, { error: 'Database not configured. Set DATABASE_URL.' });
  }

  try {
    var body = await readBody(req);
    var idNumber = normalizeId(body.idNumber);
    var password = String(body.password || '');
    if (!idNumber || !password) {
      return sendJson(res, 400, { error: 'ID number and password are required.' });
    }

    var user = await db.queryOne(
      `SELECT id, password_hash, full_name, email, phone, status
       FROM users WHERE id_number_hash = $1`,
      [hashId(idNumber)]
    );

    if (!user || !verifyPassword(password, user.password_hash)) {
      return sendJson(res, 401, { error: 'Invalid ID number or password.' });
    }
    if (user.status !== 'active') {
      return sendJson(res, 403, { error: 'This account is not active.' });
    }

    await db.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

    var token = signToken(user);
    return sendJson(res, 200, {
      ok: true,
      token: token,
      user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone }
    });
  } catch (e) {
    console.error('login error', e);
    return sendJson(res, 500, { error: 'Login failed' });
  }
}

module.exports = handler;
module.exports.default = handler;
