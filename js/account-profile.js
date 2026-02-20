/**
 * User account profile (personal details, farm, documents). Stored in localStorage keyed by user id.
 * Used by my-account page. No server; all client-side.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'farm_user_profiles';
  var MAX_DOC_DATAURL_LEN = 600000;

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

  function getProfile(userId) {
    if (!userId) return null;
    var data = getAll();
    return data[userId] || null;
  }

  function getDefaultProfile() {
    return {
      personal: {
        fullName: '',
        contactNumber: '',
        email: '',
        physicalAddress: ''
      },
      farm: {
        farmName: '',
        district: '',
        coordinates: '',
        sizeHa: '',
        mainCommodities: '',
        soilType: '',
        irrigationType: '',
        previousYields: ''
      },
      documents: [
        { type: 'id_copy', name: '', dataUrl: '' },
        { type: 'proof_of_ownership', name: '', dataUrl: '' },
        { type: 'bank_details', name: '', dataUrl: '' }
      ]
    };
  }

  function setProfile(userId, profile) {
    if (!userId) return;
    var data = getAll();
    var existing = data[userId] || getDefaultProfile();
    if (profile.personal) {
      existing.personal = Object.assign({}, getDefaultProfile().personal, profile.personal);
    }
    if (profile.farm) {
      existing.farm = Object.assign({}, getDefaultProfile().farm, profile.farm);
    }
    if (profile.documents && Array.isArray(profile.documents)) {
      existing.documents = profile.documents.map(function (d) {
        return { type: d.type, name: d.name || '', dataUrl: d.dataUrl || '' };
      });
    }
    data[userId] = existing;
    saveAll(data);
  }

  function setDocument(userId, type, file) {
    if (!userId || !type) return Promise.resolve(false);
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        if (dataUrl.length > MAX_DOC_DATAURL_LEN) {
          resolve({ ok: false, error: 'File too large to store in browser. Use a smaller file or a copy.' });
          return;
        }
        var data = getAll();
        var profile = data[userId] || getDefaultProfile();
        var docs = profile.documents || getDefaultProfile().documents.slice();
        var idx = docs.findIndex(function (d) { return d.type === type; });
        if (idx === -1) docs.push({ type: type, name: '', dataUrl: '' });
        idx = idx === -1 ? docs.length - 1 : idx;
        docs[idx] = { type: type, name: file.name, dataUrl: dataUrl };
        profile.documents = docs;
        data[userId] = profile;
        saveAll(data);
        resolve({ ok: true });
      };
      reader.onerror = function () { resolve({ ok: false, error: 'Could not read file.' }); };
      reader.readAsDataURL(file);
    });
  }

  global.FarmAccountProfile = {
    getProfile: getProfile,
    setProfile: setProfile,
    getDefaultProfile: getDefaultProfile,
    setDocument: setDocument
  };
})(typeof window !== 'undefined' ? window : this);
