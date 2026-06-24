'use strict';

const { sendJson, setCors } = require('../_lib/http');

const NDA_PRICE_WATCH_URL = 'https://www.nda.gov.za/index.php/publications/36-price-watch';
const NDA_ORIGIN = 'https://www.nda.gov.za';

function absoluteUrl(href) {
  if (!href || !href.trim()) return null;
  const u = href.trim();
  if (/^https?:\/\//i.test(u)) return u;
  const base = NDA_ORIGIN.replace(/\/$/, '');
  return u.startsWith('/') ? base + u : base + '/' + u;
}

function extractLatestPdfLink(html) {
  if (!html || typeof html !== 'string') return null;
  const directPdf = html.match(/href=["']([^"']*\.pdf(?:\?[^"']*)?)["']/i);
  if (directPdf && directPdf[1]) return { url: absoluteUrl(directPdf[1]), type: 'pdf' };
  const linkTags = html.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>/gi);
  for (const m of linkTags) {
    const href = (m[1] || '').trim();
    if (!href || href.startsWith('#') || /^(javascript|mailto):/i.test(href)) continue;
    if (/\.pdf(\?|$)/i.test(href) || /download|task=download|document\.download/i.test(href)) {
      return { url: absoluteUrl(href), type: 'doc' };
    }
  }
  return null;
}

function extractTitleFromLink(html, linkUrl) {
  if (!html || !linkUrl) return 'Price Watch';
  const escaped = linkUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<a[^>]*href=["']${escaped}["'][^>]*>([^<]*)</a>`, 'i');
  const m = html.match(re);
  return (m && m[1] && m[1].trim()) ? m[1].trim() : 'Price Watch';
}

async function handler(req, res) {
  setCors(res, 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const response = await fetch(NDA_PRICE_WATCH_URL, {
      headers: { 'User-Agent': 'MpumalangaAgriSupport/1.0 (compatible; +https://mpu-agri.vercel.app)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      return sendJson(res, 200, {
        fallback: NDA_PRICE_WATCH_URL,
        error: 'page_not_available',
        message: 'Could not load Price Watch page. Use the link below to open NDA directly.',
      });
    }
    const html = await response.text();
    const result = extractLatestPdfLink(html);
    if (result && result.url) {
      const title = extractTitleFromLink(html, result.url);
      return sendJson(res, 200, {
        url: result.url,
        title: title || 'Price Watch',
        source: NDA_PRICE_WATCH_URL,
      });
    }
    return sendJson(res, 200, {
      fallback: NDA_PRICE_WATCH_URL,
      error: 'no_pdf_found',
      message: 'No PDF link found on the page. Use the link below to open NDA and download the latest.',
    });
  } catch (err) {
    return sendJson(res, 200, {
      fallback: NDA_PRICE_WATCH_URL,
      error: 'fetch_failed',
      message: err && err.message ? err.message : 'Could not fetch Price Watch. Use the link below.',
    });
  }
}

module.exports = handler;
module.exports.default = handler;
