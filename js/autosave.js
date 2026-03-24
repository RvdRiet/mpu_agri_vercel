/**
 * Autosave form drafts to localStorage.
 * Restores saved data on init, saves on input/change (debounced),
 * and clears the draft when the form is successfully submitted.
 */
(function (global) {
  'use strict';

  var DEBOUNCE_MS = 800;
  var PREFIX = 'farm_draft_';

  function getStorageKey(formKey) {
    return PREFIX + formKey;
  }

  function serializeForm(formEl) {
    var data = {};
    var els = formEl.querySelectorAll('input, select, textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.name;
      if (!name) continue;
      if (el.type === 'file') continue;
      if (el.type === 'radio') {
        if (el.checked) data[name] = el.value;
      } else if (el.type === 'checkbox') {
        data[name] = el.checked ? (el.value || 'yes') : '';
      } else {
        data[name] = el.value || '';
      }
    }
    return data;
  }

  function restoreForm(formEl, data) {
    if (!data || typeof data !== 'object') return false;
    var restored = false;
    var els = formEl.querySelectorAll('input, select, textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.name;
      if (!name || !(name in data)) continue;
      if (el.type === 'file') continue;
      var val = data[name];
      if (el.type === 'radio') {
        if (el.value === val) {
          el.checked = true;
          restored = true;
        }
      } else if (el.type === 'checkbox') {
        var shouldCheck = !!(val && val !== '');
        if (el.checked !== shouldCheck) {
          el.checked = shouldCheck;
          restored = true;
        }
      } else {
        if (el.value !== val && val !== '') {
          el.value = val;
          restored = true;
        }
      }
    }
    return restored;
  }

  function fireChangeEvents(formEl) {
    var els = formEl.querySelectorAll('input, select, textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === 'file') continue;
      try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    }
  }

  function showDraftNotice(formEl) {
    var parent = formEl.parentNode;
    if (!parent) return;
    var existing = parent.querySelector('.autosave-notice');
    if (existing) return;
    var notice = document.createElement('div');
    notice.className = 'autosave-notice';
    notice.setAttribute('role', 'status');
    var span = document.createElement('span');
    span.textContent = 'A saved draft has been restored from your previous session.';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'autosave-notice-dismiss';
    btn.textContent = 'Dismiss';
    btn.addEventListener('click', function () { notice.remove(); });
    notice.appendChild(span);
    notice.appendChild(btn);
    parent.insertBefore(notice, formEl);
  }

  function removeDraftNotice(formEl) {
    var parent = formEl.parentNode;
    if (!parent) return;
    var notice = parent.querySelector('.autosave-notice');
    if (notice) notice.remove();
  }

  /**
   * Initialize autosave for a form.
   * @param {HTMLFormElement} formEl
   * @param {string} formKey - unique key per form type (e.g. 'livestock', 'crop')
   * @returns {{ clearDraft: Function }}
   */
  function init(formEl, formKey) {
    if (!formEl || !formKey) return { clearDraft: function () {} };
    var storageKey = getStorageKey(formKey);
    var timer = null;

    try {
      var raw = localStorage.getItem(storageKey);
      if (raw) {
        var savedData = JSON.parse(raw);
        var hasContent = Object.keys(savedData).some(function (k) {
          return savedData[k] !== '';
        });
        if (hasContent) {
          var didRestore = restoreForm(formEl, savedData);
          if (didRestore) {
            setTimeout(function () { fireChangeEvents(formEl); }, 50);
            showDraftNotice(formEl);
          }
        }
      }
    } catch (e) {}

    function scheduleSave() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        try {
          localStorage.setItem(storageKey, JSON.stringify(serializeForm(formEl)));
        } catch (e) {}
      }, DEBOUNCE_MS);
    }

    formEl.addEventListener('input', scheduleSave);
    formEl.addEventListener('change', scheduleSave);

    return {
      clearDraft: function () {
        clearTimeout(timer);
        try { localStorage.removeItem(storageKey); } catch (e) {}
        removeDraftNotice(formEl);
      }
    };
  }

  global.FarmAutosave = {
    init: init,
    clearDraft: function (formKey) {
      try { localStorage.removeItem(getStorageKey(formKey)); } catch (e) {}
    }
  };
})(typeof window !== 'undefined' ? window : this);
