/**
 * Staff authentication (frontend + server API token).
 */
(function (global) {
  'use strict';

  var STORAGE_STAFF = 'farm_staff_users';
  var SESSION_STAFF = 'farm_staffCurrentUser';
  var SESSION_TOKEN = 'farm_staffApiToken';

  function getStaffUsers() {
    try {
      var raw = localStorage.getItem(STORAGE_STAFF);
      if (raw) return JSON.parse(raw);
      var defaultStaff = { admin: { password: 'admin', name: 'Admin' } };
      localStorage.setItem(STORAGE_STAFF, JSON.stringify(defaultStaff));
      return defaultStaff;
    } catch (e) {
      return { admin: { password: 'admin', name: 'Admin' } };
    }
  }

  function getCurrentStaff() {
    try {
      var raw = sessionStorage.getItem(SESSION_STAFF);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getApiToken() {
    try {
      return sessionStorage.getItem(SESSION_TOKEN) || '';
    } catch (e) {
      return '';
    }
  }

  function setSession(staff) {
    try {
      sessionStorage.setItem(SESSION_STAFF, JSON.stringify({ username: staff.username, name: staff.name }));
    } catch (e) {}
  }

  function login(username, password) {
    username = (username || '').trim();
    if (!username || !password) return Promise.resolve({ ok: false, error: 'Username and password required.' });
    var lower = username.toLowerCase();
    var users = getStaffUsers();
    var user = users[lower];
    if (!user || user.password !== password) {
      return Promise.resolve({ ok: false, error: 'Invalid username or password.' });
    }

    return fetch('/api/staff/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: lower, password: password })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            return { ok: false, error: (data && data.error) || 'Server login failed.' };
          }
          if (data && data.token) {
            try { sessionStorage.setItem(SESSION_TOKEN, data.token); } catch (e) {}
          }
          setSession({ username: lower, name: user.name });
          return { ok: true, hasApiToken: !!(data && data.token) };
        });
      })
      .catch(function () {
        setSession({ username: lower, name: user.name });
        return {
          ok: true,
          hasApiToken: false,
          warning: 'Application review is available, but the analytics API could not be reached.'
        };
      });
  }

  /** Fetch API token when staff session exists but token is missing (e.g. after Application Review login). */
  function refreshApiToken(username, password) {
    return login(username, password);
  }

  function clearApiToken() {
    try { sessionStorage.removeItem(SESSION_TOKEN); } catch (e) {}
  }

  function requireApiToken(loginUrl) {
    if (getApiToken()) return true;
    var returnPath = (global.location && global.location.pathname) || 'staff-insights.html';
    var returnFile = returnPath.split('/').pop() || 'staff-insights.html';
    var qs = (global.location && global.location.search) || '';
    var target = (loginUrl || 'staff-login.html')
      + '?return=' + encodeURIComponent(returnFile + qs)
      + '&reason=token';
    global.location.href = target;
    return false;
  }

  function requireStaff(loginUrl) {
    var staff = getCurrentStaff();
    if (!staff) {
      window.location.href = loginUrl || 'staff-login.html';
      return null;
    }
    return staff;
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_STAFF);
      sessionStorage.removeItem(SESSION_TOKEN);
    } catch (e) {}
  }

  global.FarmStaffAuth = {
    getCurrentStaff: getCurrentStaff,
    getApiToken: getApiToken,
    clearApiToken: clearApiToken,
    requireApiToken: requireApiToken,
    refreshApiToken: refreshApiToken,
    login: login,
    logout: logout,
    requireStaff: requireStaff
  };
})(typeof window !== 'undefined' ? window : this);
