'use strict';

/**
 * Single Vercel serverless entry (Hobby plan: max 12 functions).
 * vercel.json rewrites all /api/* requests here; see api/_routes/router.js.
 * api/[...path].js does not work on non-Next.js projects (preserved as .off).
 */

const { handleApiRequest } = require('./_routes/router');

async function handler(req, res) {
  await handleApiRequest(req, res);
}

module.exports = handler;
module.exports.default = handler;
