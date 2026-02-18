/**
 * Staff authentication (frontend-only). Separate from applicant auth.
 */
(function (global) {
  'use strict';

  var STORAGE_STAFF = 'farm_staff_users';
  var SESSION_STAFF = 'farm_staffCurrentUser';

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

  function login(username, password) {
    username = (username || '').trim();
    if (!username || !password) return { ok: false, error: 'Username and password required.' };
    var lower = username.toLowerCase();
    var users = getStaffUsers();
    var user = users[lower];
    if (!user || user.password !== password) return { ok: false, error: 'Invalid username or password.' };
    try {
      sessionStorage.setItem(SESSION_STAFF, JSON.stringify({ username: lower, name: user.name }));
    } catch (e) {}
    return { ok: true };
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_STAFF);
    } catch (e) {}
  }

  global.FarmStaffAuth = {
    getCurrentStaff: getCurrentStaff,
    login: login,
    logout: logout
  };
})(typeof window !== 'undefined' ? window : this);
