/**
 * South African ID auth. Uses Firebase Auth when configured (SA ID as identifier via email).
 * Fallback: localStorage when Firebase is not configured.
 */
(function (global) {
  'use strict';

  var SA_ID_EMAIL_SUFFIX = '@farm.local';
  var STORAGE_USERS = 'farm_users';
  var STORAGE_CURRENT = 'farm_currentUser';

  function isValidSAId(id) {
    var s = String(id).replace(/\s/g, '');
    if (!/^\d{13}$/.test(s)) return false;
    var digits = s.split('').map(Number);
    var yy = digits[0] * 10 + digits[1];
    var mm = digits[2] * 10 + digits[3];
    var dd = digits[4] * 10 + digits[5];
    if (mm < 1 || mm > 12) return false;
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var isLeap = function (y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; };
    var y = yy <= 25 ? 2000 + yy : 1900 + yy;
    if (mm === 2 && isLeap(y)) daysInMonth[1] = 29;
    if (dd < 1 || dd > daysInMonth[mm - 1]) return false;
    if (digits[10] !== 0 && digits[10] !== 1) return false;
    return true;
  }

  function getCurrentUser() {
    try {
      var raw = sessionStorage.getItem(STORAGE_CURRENT);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (user) sessionStorage.setItem(STORAGE_CURRENT, JSON.stringify(user));
      else sessionStorage.removeItem(STORAGE_CURRENT);
    } catch (e) {}
  }

  function saIdToEmail(saId) {
    return String(saId).replace(/\s/g, '') + SA_ID_EMAIL_SUFFIX;
  }

  function emailToSaId(email) {
    if (!email || email.indexOf(SA_ID_EMAIL_SUFFIX) === -1) return '';
    return email.replace(SA_ID_EMAIL_SUFFIX, '');
  }

  function useFirebase() {
    return global.firebaseAuth && typeof global.firebaseAuth.createUserWithEmailAndPassword === 'function';
  }

  function register(saId, password, fullName) {
    saId = String(saId).replace(/\s/g, '');
    if (!isValidSAId(saId)) return Promise.resolve({ ok: false, error: 'Invalid South African ID number.' });
    if (!password || password.length < 6) return Promise.resolve({ ok: false, error: 'Password must be at least 6 characters.' });
    if (!fullName || !fullName.trim()) return Promise.resolve({ ok: false, error: 'Full name is required.' });

    if (useFirebase()) {
      var email = saIdToEmail(saId);
      var name = fullName.trim();
      return global.firebaseAuth.createUserWithEmailAndPassword(email, password)
        .then(function (userCred) {
          return userCred.user.updateProfile({ displayName: name }).then(function () {
            setCurrentUser({ id: saId, name: name });
            return { ok: true };
          });
        })
        .catch(function (err) {
          var msg = err.message || 'Registration failed.';
          if (err.code === 'auth/email-already-in-use') msg = 'This ID is already registered.';
          if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
          return { ok: false, error: msg };
        });
    }

    var users = (function () {
      try {
        var raw = localStorage.getItem(STORAGE_USERS);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    })();
    if (users[saId]) return Promise.resolve({ ok: false, error: 'This ID is already registered.' });
    users[saId] = { id: saId, password: password, name: fullName.trim() };
    try { localStorage.setItem(STORAGE_USERS, JSON.stringify(users)); } catch (e) {}
    setCurrentUser({ id: saId, name: fullName.trim() });
    return Promise.resolve({ ok: true });
  }

  function login(saId, password) {
    saId = String(saId).replace(/\s/g, '');
    if (!isValidSAId(saId)) return Promise.resolve({ ok: false, error: 'Invalid South African ID number.' });
    if (!password) return Promise.resolve({ ok: false, error: 'Password is required.' });

    if (useFirebase()) {
      var email = saIdToEmail(saId);
      return global.firebaseAuth.signInWithEmailAndPassword(email, password)
        .then(function (userCred) {
          var user = userCred.user;
          var id = emailToSaId(user.email);
          var name = (user.displayName || '').trim() || id;
          setCurrentUser({ id: id, name: name });
          return { ok: true };
        })
        .catch(function (err) {
          var msg = err.message || 'Login failed.';
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Invalid ID or password.';
          return { ok: false, error: msg };
        });
    }

    var users = (function () {
      try {
        var raw = localStorage.getItem(STORAGE_USERS);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    })();
    var user = users[saId];
    if (!user || user.password !== password) return Promise.resolve({ ok: false, error: 'Invalid ID or password.' });
    setCurrentUser({ id: user.id, name: user.name });
    return Promise.resolve({ ok: true });
  }

  function logout() {
    if (useFirebase() && global.firebaseAuth.signOut) global.firebaseAuth.signOut();
    setCurrentUser(null);
  }

  function requireAuth(redirectUrl) {
    redirectUrl = redirectUrl || 'login.html';
    var user = getCurrentUser();
    if (!user) {
      window.location.href = redirectUrl + (redirectUrl.indexOf('?') === -1 ? '?' : '&') + 'return=' + encodeURIComponent(window.location.pathname + window.location.search);
      return null;
    }
    return user;
  }

  if (useFirebase()) {
    global.firebaseAuth.onAuthStateChanged(function (user) {
      if (user && user.email) {
        var id = emailToSaId(user.email);
        if (id) setCurrentUser({ id: id, name: (user.displayName || '').trim() || id });
      } else {
        setCurrentUser(null);
      }
    });
  }

  global.FarmAuth = {
    isValidSAId: isValidSAId,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    register: register,
    login: login,
    logout: logout,
    requireAuth: requireAuth
  };
})(typeof window !== 'undefined' ? window : this);
