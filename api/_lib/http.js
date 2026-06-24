'use strict';

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on('data', function (chunk) { chunks.push(chunk); });
    req.on('end', function () {
      var raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function setCors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods || 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseQuery(url) {
  var q = {};
  var i = (url || '').indexOf('?');
  if (i === -1) return q;
  var search = url.slice(i + 1);
  search.split('&').forEach(function (pair) {
    if (!pair) return;
    var kv = pair.split('=');
    q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
  });
  return q;
}

module.exports = { sendJson: sendJson, readBody: readBody, setCors: setCors, parseQuery: parseQuery };
