/**
 * Vercel serverless: fetch latest Price Watch PDF URL from NDA
 * https://www.nda.gov.za/index.php/publications/36-price-watch
 */

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
  // Direct .pdf links (allow query string)
  const directPdf = html.match(/href=["']([^"']*\.pdf(?:\?[^"']*)?)["']/i);
  if (directPdf && directPdf[1]) return { url: absoluteUrl(directPdf[1]), type: 'pdf' };
  // Joomla/NDA: link with download or task=download (often first in list = latest)
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

  try {
    const response = await fetch(NDA_PRICE_WATCH_URL, {
      headers: { 'User-Agent': 'MpumalangaAgriSupport/1.0 (compatible; +https://mpu-agri.vercel.app)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      return res.status(200).json({
        fallback: NDA_PRICE_WATCH_URL,
        error: 'page_not_available',
        message: 'Could not load Price Watch page. Use the link below to open NDA directly.',
      });
    }
    const html = await response.text();
    const result = extractLatestPdfLink(html);
    if (result && result.url) {
      const title = extractTitleFromLink(html, result.url);
      return res.status(200).json({
        url: result.url,
        title: title || 'Price Watch',
        source: NDA_PRICE_WATCH_URL,
      });
    }
    return res.status(200).json({
      fallback: NDA_PRICE_WATCH_URL,
      error: 'no_pdf_found',
      message: 'No PDF link found on the page. Use the link below to open NDA and download the latest.',
    });
  } catch (err) {
    return res.status(200).json({
      fallback: NDA_PRICE_WATCH_URL,
      error: 'fetch_failed',
      message: err && err.message ? err.message : 'Could not fetch Price Watch. Use the link below.',
    });
  }
}
