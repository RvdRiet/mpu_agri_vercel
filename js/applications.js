/**
 * Store and retrieve applications. Uses Firestore when available, else localStorage.
 * Sensitive: only accessible when logged in; track page checks auth.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'farm_applications';
  var FIRESTORE_COLLECTION = 'applications';

  function useFirestore() {
    return global.firebaseDb && typeof global.firebaseDb.collection === 'function';
  }

  function sanitizeForFirestore(obj) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    var out = {};
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        var v = obj[k];
        if (v !== undefined) out[k] = sanitizeForFirestore(v);
      }
    }
    return out;
  }

  function getAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function getApplicationsByUser(userId) {
    if (!userId) return [];
    if (useFirestore()) {
      return global.firebaseDb.collection(FIRESTORE_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('submittedAt', 'desc')
        .get()
        .then(function (snap) {
          return snap.docs.map(function (d) {
            var data = d.data();
            data.id = d.id;
            return data;
          });
        })
        .catch(function (err) {
          console.warn('Firestore getApplicationsByUser failed', err);
          return [];
        });
    }
    var data = getAll();
    var list = data[userId] || [];
    return Promise.resolve(list.slice().sort(function (a, b) {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    }));
  }

  function saveApplication(userId, application) {
    if (!userId || !application) return Promise.resolve(null);
    application.submittedAt = application.submittedAt || new Date().toISOString();
    application.status = application.status || 'Submitted';
    if (useFirestore()) {
      var doc = {
        userId: userId,
        submittedAt: application.submittedAt,
        status: application.status,
        summary: application.summary || {},
        details: application.details || {}
      };
      doc = sanitizeForFirestore(doc);
      return global.firebaseDb.collection(FIRESTORE_COLLECTION)
        .add(doc)
        .then(function (ref) {
          application.id = ref.id;
          return ref.id;
        })
        .catch(function (err) {
          console.warn('Firestore saveApplication failed', err);
          return null;
        });
    }
    var data = getAll();
    var list = data[userId] || [];
    application.id = application.id || 'APP-' + Date.now();
    list.push(application);
    data[userId] = list;
    saveAll(data);
    return Promise.resolve(application.id);
  }

  function getAllApplicationsForStaff() {
    if (useFirestore()) {
      return global.firebaseDb.collection(FIRESTORE_COLLECTION)
        .get()
        .then(function (snap) {
          var out = [];
          snap.docs.forEach(function (d) {
            var data = d.data();
            data.id = d.id;
            out.push({ userId: data.userId, application: data });
          });
          out.sort(function (a, b) {
            return new Date(b.application.submittedAt || 0) - new Date(a.application.submittedAt || 0);
          });
          return out;
        })
        .catch(function (err) {
          console.warn('Firestore getAllApplicationsForStaff failed', err);
          return [];
        });
    }
    var data = getAll();
    var out = [];
    Object.keys(data).forEach(function (userId) {
      var list = data[userId] || [];
      list.forEach(function (app) {
        out.push({ userId: userId, application: app });
      });
    });
    out.sort(function (a, b) {
      return new Date(b.application.submittedAt) - new Date(a.application.submittedAt);
    });
    return Promise.resolve(out);
  }

  function updateApplicationStatus(userId, applicationId, status) {
    if (useFirestore()) {
      return global.firebaseDb.collection(FIRESTORE_COLLECTION)
        .doc(applicationId)
        .update({ status: status })
        .then(function () { return true; })
        .catch(function (err) {
          console.warn('Firestore updateApplicationStatus failed', err);
          return false;
        });
    }
    var data = getAll();
    var list = data[userId];
    if (!list) return Promise.resolve(false);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === applicationId) {
        list[i].status = status;
        saveAll(data);
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  global.FarmApplications = {
    getApplicationsByUser: getApplicationsByUser,
    saveApplication: saveApplication,
    getAllApplicationsForStaff: getAllApplicationsForStaff,
    updateApplicationStatus: updateApplicationStatus
  };
})(typeof window !== 'undefined' ? window : this);
