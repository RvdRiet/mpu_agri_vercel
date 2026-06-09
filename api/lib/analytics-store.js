'use strict';

const fs = require('fs');
const path = require('path');
const { emptyMonth, isValidMonth, applyEvent, buildReportSummary } = require('./analytics-core');

const DATA_DIR = path.join(process.cwd(), 'data', 'analytics');
const BLOB_PREFIX = 'analytics/';

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function monthFilePath(month) {
  return path.join(DATA_DIR, month + '.json');
}

async function loadFromBlob(month) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { list, get } = await import('@vercel/blob');
    const listed = await list({ prefix: BLOB_PREFIX + month + '.json', limit: 1 });
    if (!listed.blobs.length) return null;
    const res = await fetch(listed.blobs[0].url);
    if (!res.ok) return null;
    return JSON.parse(await res.text());
  } catch (e) {
    console.warn('Blob load failed', month, e.message);
    return null;
  }
}

async function saveToBlob(month, data) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    const { put } = await import('@vercel/blob');
    await put(BLOB_PREFIX + month + '.json', JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true
    });
    return true;
  } catch (e) {
    console.warn('Blob save failed', month, e.message);
    return false;
  }
}

async function loadMonth(month) {
  if (!isValidMonth(month)) throw new Error('Invalid month');
  var blobData = await loadFromBlob(month);
  if (blobData) return blobData;

  ensureDataDir();
  var filePath = monthFilePath(month);
  if (!fs.existsSync(filePath)) return emptyMonth(month);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return emptyMonth(month);
  }
}

async function saveMonth(month, data) {
  if (!isValidMonth(month)) throw new Error('Invalid month');
  var savedBlob = await saveToBlob(month, data);
  if (savedBlob) return;

  ensureDataDir();
  fs.writeFileSync(monthFilePath(month), JSON.stringify(data, null, 2), 'utf8');
}

async function recordEvent(event) {
  var at = event.at || new Date().toISOString();
  var month = String(at).slice(0, 7);
  var data = await loadMonth(month);
  applyEvent(data, event);
  await saveMonth(month, data);
  return data;
}

async function listMonths() {
  var months = new Set();

  ensureDataDir();
  if (fs.existsSync(DATA_DIR)) {
    fs.readdirSync(DATA_DIR).forEach(function (file) {
      var m = file.match(/^(\d{4}-\d{2})\.json$/);
      if (m) months.add(m[1]);
    });
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import('@vercel/blob');
      var cursor;
      do {
        var result = await list({ prefix: BLOB_PREFIX, cursor: cursor, limit: 100 });
        result.blobs.forEach(function (blob) {
          var m = blob.pathname.match(/(\d{4}-\d{2})\.json$/);
          if (m) months.add(m[1]);
        });
        cursor = result.hasMore ? result.cursor : undefined;
      } while (cursor);
    } catch (e) {
      console.warn('Blob list failed', e.message);
    }
  }

  var current = new Date().toISOString().slice(0, 7);
  months.add(current);

  return Array.from(months).sort().reverse();
}

async function getMonthReport(month) {
  var data = await loadMonth(month);
  return buildReportSummary(data);
}

module.exports = {
  recordEvent: recordEvent,
  listMonths: listMonths,
  getMonthReport: getMonthReport,
  loadMonth: loadMonth
};
