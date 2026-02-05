/**
 * Enterprise-grade input sanitization and validation.
 * Use before storing in Firestore or displaying user content to prevent XSS and injection.
 */
(function (global) {
  'use strict';

  var MAX_TEXT_LENGTH = 10000;
  var MAX_FIELD_LENGTH = 500;

  function escapeHtml(str) {
    if (str == null || typeof str !== 'string') return '';
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' };
    return str.replace(/[&<>"'/]/g, function (c) { return map[c] || c; });
  }

  /**
   * Sanitize a string for safe storage and display. Removes control chars, limits length.
   */
  function sanitizeString(value, maxLen) {
    if (value == null) return '';
    var s = String(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    maxLen = maxLen == null ? MAX_FIELD_LENGTH : Math.min(Number(maxLen) || MAX_FIELD_LENGTH, MAX_TEXT_LENGTH);
    return s.length > maxLen ? s.slice(0, maxLen) : s;
  }

  /**
   * Sanitize textarea/long text.
   */
  function sanitizeText(value) {
    return sanitizeString(value, MAX_TEXT_LENGTH);
  }

  /**
   * Sanitize object values recursively (for form details). Does not escape HTML; use when storing.
   * Trims and length-limits string values, removes undefined/null.
   */
  function sanitizeForStorage(obj) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return sanitizeString(obj);
    var out = {};
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var v = obj[k];
      if (v === undefined || v === null) continue;
      if (typeof v === 'string') out[k] = sanitizeString(v, MAX_FIELD_LENGTH);
      else if (typeof v === 'object' && v !== null && !(v instanceof Date)) out[k] = sanitizeForStorage(v);
      else out[k] = v;
    }
    return out;
  }

  /**
   * Safe display: escape HTML when rendering user content into DOM.
   */
  function safeText(text) {
    return escapeHtml(sanitizeString(text));
  }

  global.FarmSecurity = {
    sanitizeString: sanitizeString,
    sanitizeText: sanitizeText,
    sanitizeForStorage: sanitizeForStorage,
    escapeHtml: escapeHtml,
    safeText: safeText,
    MAX_FIELD_LENGTH: MAX_FIELD_LENGTH,
    MAX_TEXT_LENGTH: MAX_TEXT_LENGTH
  };
})(typeof window !== 'undefined' ? window : this);
