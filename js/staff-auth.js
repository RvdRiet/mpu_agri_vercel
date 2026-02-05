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
    // When Firebase Auth is available, use it (staff must use Firebase email as username)
    if (global.firebaseAuth && typeof global.firebaseAuth.signInWithEmailAndPassword === 'function') {
      return global.firebaseAuth.signInWithEmailAndPassword(username, password)
        .then(function (userCred) {
          var u = userCred.user;
          try {
            sessionStorage.setItem(SESSION_STAFF, JSON.stringify({
              username: u.email,
              name: u.email || u.uid
            }));
          } catch (e) {}
          return { ok: true };
        })
        .catch(function (err) {
          return { ok: false, error: err.message || 'Invalid email or password.' };
        });
    }
    // Fallback: localStorage staff list
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
    if (global.firebaseAuth && typeof global.firebaseAuth.signOut === 'function') {
      global.firebaseAuth.signOut().catch(function () {});
    }
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
