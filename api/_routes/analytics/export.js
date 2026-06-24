'use strict';

const { getMonthReport } = require('../../_lib/analytics-store');
const { isValidMonth, monthReportToCsv } = require('../../_lib/analytics-core');
const { requireStaff } = require('../../_lib/staff-api-auth');
const { sendJson, setCors, parseQuery } = require('../../_lib/http');

async function handler(req, res) {
  setCors(res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (!requireStaff(req)) {
    return sendJson(res, 401, { error: 'Unauthorized' });
  }

  try {
    var query = parseQuery(req.url);
    var month = query.month || new Date().toISOString().slice(0, 7);
    var format = (query.format || 'csv').toLowerCase();
    if (!isValidMonth(month)) {
      return sendJson(res, 400, { error: 'Invalid month. Use YYYY-MM.' });
    }

    var report = await getMonthReport(month);
    report.generatedAt = new Date().toISOString();

    if (format === 'json') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="agrisupport-analytics-' + month + '.json"');
      return res.end(JSON.stringify(report, null, 2));
    }

    var csv = monthReportToCsv(report);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="agrisupport-analytics-' + month + '.csv"');
    return res.end('\uFEFF' + csv);
  } catch (e) {
    console.error('analytics export error', e);
    return sendJson(res, 500, { error: 'Failed to export report' });
  }
}

module.exports = handler;
module.exports.default = handler;
