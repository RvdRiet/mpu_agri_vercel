/**
 * Production analytics client — sends events to /api/analytics/*
 */
(function (global) {
  'use strict';

  var SESSION_STAFF_TOKEN = 'farm_staffApiToken';

  function isStaffPath() {
    var path = (global.location && global.location.pathname) || '';
    return /staff(-login|-insights)?\.html/i.test(path) || /\/staff\.html/i.test(path);
  }

  function apiBase() {
    return '';
  }

  function sessionId() {
    var key = 'farm_analytics_sid';
    try {
      var existing = sessionStorage.getItem(key);
      if (existing) return existing;
      var sid = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem(key, sid);
      return sid;
    } catch (e) {
      return 's_anon';
    }
  }

  function pageLabel(path) {
    if (!path || path === '/') return 'Home';
    var name = path.split('/').pop() || path;
    name = name.replace(/\.html$/i, '');
    if (name === 'index') return 'Home';
    if (name === 'mesp-2025-26') return 'MESP Application';
    var labels = {
      crop: 'Crop Programme',
      livestock: 'Livestock Programme',
      environmental: 'Environmental Programme',
      weather: 'Weather',
      alerts: 'Alerts',
      guides: 'Guides',
      'e-learning': 'E-learning',
      support: 'Support',
      track: 'Track Application',
      login: 'Login',
      register: 'Register',
      'my-account': 'My Account'
    };
    if (labels[name]) return labels[name];
    if (path.indexOf('/Application/') !== -1) {
      if (name === 'crop') return 'Crop Grant Form';
      if (name === 'environmental') return 'Environmental Grant Form';
      if (name === 'index') return 'Livestock Grant Form';
    }
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  }

  function postJson(url, body) {
    return fetch(apiBase() + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      keepalive: true
    }).then(function (res) {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    });
  }

  function getJson(url, token) {
    var headers = { Accept: 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch(apiBase() + url, { headers: headers }).then(function (res) {
      if (res.status === 401) {
        var err = new Error('Unauthorized');
        err.status = 401;
        throw err;
      }
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    });
  }

  function getStaffToken() {
    try {
      return sessionStorage.getItem(SESSION_STAFF_TOKEN) || '';
    } catch (e) {
      return '';
    }
  }

  function recordPageView() {
    if (isStaffPath()) return;
    var path = (global.location && global.location.pathname) || '/';
    postJson('/api/analytics/track', {
      path: path,
      label: pageLabel(path),
      sessionId: sessionId(),
      at: new Date().toISOString()
    }).catch(function () {});
  }

  function trackEvent(type, payload) {
    var body = payload || {};
    body.type = type;
    body.at = body.at || new Date().toISOString();
    postJson('/api/analytics/event', body).catch(function () {});
  }

  function fetchAvailableMonths() {
    var token = getStaffToken();
    if (!token) return Promise.reject(new Error('Not authenticated'));
    return getJson('/api/analytics/months', token);
  }

  function fetchMonthReport(month) {
    var token = getStaffToken();
    if (!token) return Promise.reject(new Error('Not authenticated'));
    return getJson('/api/analytics/report?month=' + encodeURIComponent(month), token);
  }

  function downloadMonthReport(month, format) {
    var token = getStaffToken();
    if (!token) return Promise.reject(new Error('Not authenticated'));
    format = format || 'csv';
    return fetch(apiBase() + '/api/analytics/export?month=' + encodeURIComponent(month) + '&format=' + format, {
      headers: { Authorization: 'Bearer ' + token }
    }).then(function (res) {
      if (res.status === 401) {
        var err = new Error('Unauthorized');
        err.status = 401;
        throw err;
      }
      if (!res.ok) throw new Error('Export failed');
      return res.blob().then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'agrisupport-analytics-' + month + '.' + (format === 'json' ? 'json' : 'csv');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    });
  }

  if (!isStaffPath()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', recordPageView);
    } else {
      recordPageView();
    }
  }

  global.FarmAnalytics = {
    recordPageView: recordPageView,
    trackEvent: trackEvent,
    pageLabel: pageLabel,
    getStaffToken: getStaffToken,
    fetchAvailableMonths: fetchAvailableMonths,
    fetchMonthReport: fetchMonthReport,
    downloadMonthReport: downloadMonthReport
  };
})(typeof window !== 'undefined' ? window : this);
