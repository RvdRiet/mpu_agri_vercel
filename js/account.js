/**
 * My Account page: load/save profile, documents, application history.
 * Requires FarmAuth, FarmAccountProfile, FarmApplications.
 */
(function () {
  'use strict';

  var user = window.FarmAuth && FarmAuth.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html?return=my-account.html';
    return;
  }

  var Profile = window.FarmAccountProfile;
  var userId = user.id;

  var personalId = document.getElementById('personalId');
  var personalName = document.getElementById('personalName');
  var personalPhone = document.getElementById('personalPhone');
  var personalEmail = document.getElementById('personalEmail');
  var personalAddress = document.getElementById('personalAddress');
  var formPersonal = document.getElementById('formPersonal');
  var personalSaved = document.getElementById('personalSaved');

  var farmName = document.getElementById('farmName');
  var farmDistrict = document.getElementById('farmDistrict');
  var farmCoordinates = document.getElementById('farmCoordinates');
  var farmSize = document.getElementById('farmSize');
  var farmSoil = document.getElementById('farmSoil');
  var farmCommodities = document.getElementById('farmCommodities');
  var farmIrrigation = document.getElementById('farmIrrigation');
  var farmYields = document.getElementById('farmYields');
  var formFarm = document.getElementById('formFarm');
  var farmSaved = document.getElementById('farmSaved');

  var accountUserName = document.getElementById('accountUserName');
  var accountUserId = document.getElementById('accountUserId');
  var accountLogout = document.getElementById('accountLogout');
  var mobileLogout = document.getElementById('mobileLogout');
  var accountDocsList = document.getElementById('accountDocsList');
  var accountAppList = document.getElementById('accountAppList');
  var accountAppEmpty = document.getElementById('accountAppEmpty');

  function showSaved(el, duration) {
    if (!el) return;
    el.textContent = 'Saved';
    setTimeout(function () { el.textContent = ''; }, duration || 2000);
  }

  function loadProfile() {
    var def = Profile.getDefaultProfile();
    var p = Profile.getProfile(userId) || def;
    if (personalId) personalId.value = userId;
    if (personalName) personalName.value = (p.personal && p.personal.fullName) || user.name || '';
    if (personalPhone) personalPhone.value = (p.personal && p.personal.contactNumber) || '';
    if (personalEmail) personalEmail.value = (p.personal && p.personal.email) || '';
    if (personalAddress) personalAddress.value = (p.personal && p.personal.physicalAddress) || '';

    if (farmName) farmName.value = (p.farm && p.farm.farmName) || '';
    if (farmDistrict) farmDistrict.value = (p.farm && p.farm.district) || '';
    if (farmCoordinates) farmCoordinates.value = (p.farm && p.farm.coordinates) || '';
    if (farmSize) farmSize.value = (p.farm && p.farm.sizeHa) || '';
    if (farmSoil) farmSoil.value = (p.farm && p.farm.soilType) || '';
    if (farmCommodities) farmCommodities.value = (p.farm && p.farm.mainCommodities) || '';
    if (farmIrrigation) farmIrrigation.value = (p.farm && p.farm.irrigationType) || '';
    if (farmYields) farmYields.value = (p.farm && p.farm.previousYields) || '';
  }

  if (formPersonal) {
    formPersonal.onsubmit = function (e) {
      e.preventDefault();
      Profile.setProfile(userId, {
        personal: {
          fullName: personalName ? personalName.value.trim() : '',
          contactNumber: personalPhone ? personalPhone.value.trim() : '',
          email: personalEmail ? personalEmail.value.trim() : '',
          physicalAddress: personalAddress ? personalAddress.value.trim() : ''
        }
      });
      showSaved(personalSaved);
    };
  }

  if (formFarm) {
    formFarm.onsubmit = function (e) {
      e.preventDefault();
      Profile.setProfile(userId, {
        farm: {
          farmName: farmName ? farmName.value.trim() : '',
          district: farmDistrict ? farmDistrict.value.trim() : '',
          coordinates: farmCoordinates ? farmCoordinates.value.trim() : '',
          sizeHa: farmSize ? farmSize.value.trim() : '',
          soilType: farmSoil ? farmSoil.value : '',
          mainCommodities: farmCommodities ? farmCommodities.value.trim() : '',
          irrigationType: farmIrrigation ? farmIrrigation.value : '',
          previousYields: farmYields ? farmYields.value.trim() : ''
        }
      });
      showSaved(farmSaved);
    };
  }

  function renderDocs() {
    var p = Profile.getProfile(userId);
    var docs = (p && p.documents) || Profile.getDefaultProfile().documents;
    var labels = { id_copy: 'ID copy', proof_of_ownership: 'Proof of ownership', bank_details: 'Bank details' };
    var inputIds = { id_copy: 'docInputId', proof_of_ownership: 'docInputProof', bank_details: 'docInputBank' };

    accountDocsList.innerHTML = docs.map(function (d) {
      var name = d.name || 'Not uploaded';
      var hasFile = !!(d.dataUrl && d.dataUrl.length > 0);
      var viewDownload = hasFile
        ? '<button type="button" class="btn btn--secondary btn--sm account-doc-view" data-type="' + d.type + '">View / Download</button>'
        : '';
      var uploadLabel = hasFile ? 'Re-upload' : 'Upload';
      return (
        '<li class="account-doc" data-type="' + d.type + '">' +
          '<div><span class="account-doc__label">' + (labels[d.type] || d.type) + '</span>' +
          '<span class="account-doc__name">' + name + '</span></div>' +
          '<div class="account-doc__actions">' +
            viewDownload +
            '<button type="button" class="btn btn--primary btn--sm account-doc-upload" data-input="' + (inputIds[d.type] || '') + '">' + uploadLabel + '</button>' +
          '</div>' +
        '</li>'
      );
    }).join('');

    accountDocsList.querySelectorAll('.account-doc-upload').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-input');
        var input = id ? document.getElementById(id) : null;
        if (input) input.click();
      };
    });

    accountDocsList.querySelectorAll('.account-doc-view').forEach(function (btn) {
      btn.onclick = function () {
        var type = btn.getAttribute('data-type');
        var p2 = Profile.getProfile(userId);
        var doc = (p2 && p2.documents) ? p2.documents.find(function (d) { return d.type === type; }) : null;
        if (doc && doc.dataUrl) window.open(doc.dataUrl, '_blank');
      };
    });
  }

  function setupDocInput(id, type) {
    var input = document.getElementById(id);
    if (!input) return;
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) return;
      Profile.setDocument(userId, type, file).then(function (r) {
        if (r.ok) {
          renderDocs();
          input.value = '';
        } else {
          alert(r.error || 'Upload failed.');
        }
      });
    };
  }

  setupDocInput('docInputId', 'id_copy');
  setupDocInput('docInputProof', 'proof_of_ownership');
  setupDocInput('docInputBank', 'bank_details');

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return iso || '—'; }
  }
  function statusClass(s) {
    s = (s || '').toLowerCase().replace(/\s/g, '-');
    if (s === 'approved') return 'status-approved';
    if (s === 'rejected') return 'status-rejected';
    if (s === 'under-review') return 'status-review';
    return 'status-submitted';
  }

  function renderApps(apps) {
    apps = apps || [];
    if (apps.length === 0) {
      accountAppList.hidden = true;
      accountAppEmpty.hidden = false;
    } else {
      accountAppEmpty.hidden = true;
      accountAppList.hidden = false;
      accountAppList.innerHTML = apps.slice(0, 5).map(function (app) {
        var s = app.status || 'Submitted';
        var sum = app.summary || {};
        return (
          '<article class="track-card">' +
            '<div class="track-card-header">' +
              '<span class="track-ref">' + esc(app.id) + '</span>' +
              '<span class="track-status ' + statusClass(s) + '">' + esc(s) + '</span>' +
            '</div>' +
            '<p class="track-date">Submitted ' + esc(formatDate(app.submittedAt)) + '</p>' +
            '<dl class="track-summary">' +
              '<dt>Commodity</dt><dd>' + esc(sum.commodity) + '</dd>' +
              '<dt>Applicant</dt><dd>' + esc(sum.registeredName) + '</dd>' +
            '</dl>' +
            '<a href="track.html" class="btn btn--primary btn--sm">View status</a>' +
          '</article>'
        );
      }).join('');
    }
  }

  if (accountUserName) accountUserName.textContent = user.name || userId;
  if (accountUserId) accountUserId.textContent = '(ID: ' + userId + ')';
  if (accountLogout) accountLogout.onclick = function () { FarmAuth.logout(); window.location.href = 'index.html'; };
  if (mobileLogout) mobileLogout.onclick = function () { FarmAuth.logout(); window.location.href = 'index.html'; };

  loadProfile();
  renderDocs();

  var promise = window.FarmApplications ? FarmApplications.getApplicationsByUser(userId) : Promise.resolve([]);
  promise.then(renderApps).catch(function () { renderApps([]); });
})();
