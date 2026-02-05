/**
 * Store and retrieve applications per user (localStorage).
 * Sensitive: only accessible when logged in; track page checks auth.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'farm_applications';

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
    var data = getAll();
    var list = data[userId] || [];
    return list.slice().sort(function (a, b) {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });
  }

  function saveApplication(userId, application) {
    if (!userId || !application) return null;
    var data = getAll();
    var list = data[userId] || [];
    application.id = application.id || 'APP-' + Date.now();
    application.submittedAt = application.submittedAt || new Date().toISOString();
    application.status = application.status || 'Submitted';
    list.push(application);
    data[userId] = list;
    saveAll(data);
    return application.id;
  }

  function getAllApplicationsForStaff() {
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
    return out;
  }

  function updateApplicationStatus(userId, applicationId, status) {
    var data = getAll();
    var list = data[userId];
    if (!list) return false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === applicationId) {
        list[i].status = status;
        saveAll(data);
        return true;
      }
    }
    return false;
  }

  global.FarmApplications = {
    getApplicationsByUser: getApplicationsByUser,
    saveApplication: saveApplication,
    getAllApplicationsForStaff: getAllApplicationsForStaff,
    updateApplicationStatus: updateApplicationStatus
  };
})(typeof window !== 'undefined' ? window : this);
