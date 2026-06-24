'use strict';

const db = require('../../_lib/db');
const { sendJson, readBody, setCors } = require('../../_lib/http');
const { isValidSaId, normalizeId, hashId, hashPassword, signToken } = require('../../_lib/user-auth');

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

    if (!isValidSaId(idNumber)) {
      return sendJson(res, 400, { error: 'A valid 13-digit SA ID number is required.' });
    }
    if (password.length < 8) {
      return sendJson(res, 400, { error: 'Password must be at least 8 characters.' });
    }

    var idHash = hashId(idNumber);
    var existing = await db.queryOne('SELECT id FROM users WHERE id_number_hash = $1', [idHash]);
    if (existing) {
      return sendJson(res, 409, { error: 'An account with this ID number already exists.' });
    }

    var user = await db.queryOne(
      `INSERT INTO users (id_number_hash, id_number_last4, password_hash, full_name, email, phone, physical_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, full_name, email, phone`,
      [
        idHash,
        idNumber.slice(-4),
        hashPassword(password),
        body.fullName || null,
        body.email || null,
        body.phone || null,
        body.physicalAddress || null
      ]
    );

    var token = signToken(user);
    return sendJson(res, 201, {
      ok: true,
      token: token,
      user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone }
    });
  } catch (e) {
    console.error('register error', e);
    return sendJson(res, 500, { error: 'Registration failed' });
  }
}

module.exports = handler;
module.exports.default = handler;
