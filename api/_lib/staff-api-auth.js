'use strict';

const crypto = require('crypto');

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

function getSecret() {
  return process.env.STAFF_API_SECRET || 'mpu-dev-staff-secret-change-in-production';
}

function getStaffUsers() {
  if (process.env.STAFF_USERS) {
    try {
      return JSON.parse(process.env.STAFF_USERS);
    } catch (e) {
      console.warn('Invalid STAFF_USERS env JSON');
    }
  }
  return { admin: { password: 'admin', name: 'Admin' } };
}

function validateCredentials(username, password) {
  username = String(username || '').trim().toLowerCase();
  password = String(password || '');
  if (!username || !password) return null;
  var users = getStaffUsers();
  var user = users[username];
  if (!user || user.password !== password) return null;
  return { username: username, name: user.name || username };
}

function signToken(staff) {
  var payload = {
    sub: staff.username,
    name: staff.name,
    exp: Date.now() + TOKEN_TTL_MS
  };
  var payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  var sig = crypto.createHmac('sha256', getSecret()).update(payloadStr).digest('base64url');
  return payloadStr + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  var parts = token.split('.');
  if (parts.length !== 2) return null;
  var payloadStr = parts[0];
  var sig = parts[1];
  var expected = crypto.createHmac('sha256', getSecret()).update(payloadStr).digest('base64url');
  if (sig !== expected) return null;
  try {
    var payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return { username: payload.sub, name: payload.name };
  } catch (e) {
    return null;
  }
}

function extractBearer(req) {
  var auth = req.headers.authorization || req.headers.Authorization || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

function requireStaff(req) {
  var token = extractBearer(req);
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  validateCredentials: validateCredentials,
  signToken: signToken,
  verifyToken: verifyToken,
  requireStaff: requireStaff,
  extractBearer: extractBearer
};
