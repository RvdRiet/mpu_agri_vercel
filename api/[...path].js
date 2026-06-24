'use strict';

/**
 * Single Vercel serverless entry (Hobby plan: max 12 functions).
 * All API routes are dispatched via api/_routes/router.js.
 * Original per-file handlers are preserved as *.js.off for self-hosting restore.
 */

const { handleApiRequest } = require('./_routes/router');

async function handler(req, res) {
  await handleApiRequest(req, res);
}

module.exports = handler;
module.exports.default = handler;
