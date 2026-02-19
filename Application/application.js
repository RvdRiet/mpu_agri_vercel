(function () {
  var form = document.getElementById('applicationForm');
  var panels = document.querySelectorAll('.app-step-panel');
  var steps = document.querySelectorAll('.app-step');
  var currentStep = 1;
  var totalSteps = 5;
  var sanitize = window.FarmSecurity && window.FarmSecurity.sanitizeForStorage;

  function showPanel(stepNum) {
    stepNum = parseInt(stepNum, 10);
    if (stepNum < 1 || stepNum > totalSteps) return;
    currentStep = stepNum;

    panels.forEach(function (panel) {
      var n = parseInt(panel.getAttribute('data-step'), 10);
      panel.classList.toggle('active', n === stepNum);
    });

    steps.forEach(function (step) {
      var n = parseInt(step.getAttribute('data-step'), 10);
      step.classList.remove('active', 'completed');
      if (n === stepNum) step.classList.add('active');
      else if (n < stepNum) step.classList.add('completed');
    });
  }

  function clearStepErrors(stepNum) {
    var panel = document.getElementById('panel-' + stepNum);
    if (!panel) return;
    panel.querySelectorAll('.field-error').forEach(function (el) { el.textContent = ''; });
    panel.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
  }

  function setFieldError(fieldId, errorId, message) {
    var field = fieldId ? document.getElementById(fieldId) : null;
    var errEl = errorId ? document.getElementById(errorId) : null;
    if (field) field.classList.toggle('input-error', !!message);
    if (errEl) errEl.textContent = message || '';
  }

  function validateStep1() {
    var commodity = document.getElementById('commodity');
    var category = document.querySelector('input[name="farmerCategory"]:checked');
    var ok = true;
    if (!commodity || !commodity.value) {
      setFieldError('commodity', 'commodityError', 'Please select the commodity you are applying for.');
      ok = false;
    } else {
      setFieldError('commodity', 'commodityError', '');
    }
    if (!category) {
      setFieldError(null, 'farmerCategoryError', 'Please select your farmer category.');
      if (document.getElementById('farmerCategoryError')) document.getElementById('farmerCategoryError').textContent = 'Please select your farmer category.';
      ok = false;
    } else {
      setFieldError(null, 'farmerCategoryError', '');
    }
    return ok;
  }

  function validateStep2() {
    var registered = document.getElementById('registeredName');
    var val = registered ? registered.value.trim() : '';
    if (!val) {
      setFieldError('registeredName', 'registeredNameError', 'Registered name or applicant name is required.');
      return false;
    }
    setFieldError('registeredName', 'registeredNameError', '');
    return true;
  }

  function validateStep(stepNum) {
    clearStepErrors(stepNum);
    if (stepNum === 1) return validateStep1();
    if (stepNum === 2) return validateStep2();
    return true;
  }

  function validatePopiaConsent() {
    var consent = document.getElementById('popiaConsent');
    var errEl = document.getElementById('popiaConsentError');
    if (!consent || !consent.checked) {
      if (errEl) errEl.textContent = 'You must read and consent to the POPIA compliance before we can accept your application.';
      if (consent) consent.closest('.form-group') && consent.closest('.form-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (errEl) errEl.textContent = '';
    return true;
  }

  function updateSummary() {
    var commodity = document.getElementById('commodity');
    var category = document.querySelector('input[name="farmerCategory"]:checked');
    var project = document.getElementById('registeredName');
    var farmName = document.getElementById('farmName');

    var summaryCommodity = document.getElementById('summaryCommodity');
    var summaryCategory = document.getElementById('summaryCategory');
    var summaryProject = document.getElementById('summaryProject');
    var summaryFarm = document.getElementById('summaryFarm');

    if (summaryCommodity) summaryCommodity.textContent = commodity && commodity.value ? commodity.value : '—';
    if (summaryCategory) summaryCategory.textContent = category ? category.value : '—';
    if (summaryProject) summaryProject.textContent = project && project.value ? project.value.trim() : '—';
    if (summaryFarm) summaryFarm.textContent = farmName && farmName.value ? farmName.value.trim() : '—';
  }

  var legalEntityType = document.getElementById('legalEntityType');
  var legalEntityOtherWrap = document.getElementById('legalEntityOtherWrap');
  if (legalEntityType && legalEntityOtherWrap) {
    legalEntityType.addEventListener('change', function () {
      legalEntityOtherWrap.style.display = this.value === 'Other' ? 'block' : 'none';
    });
  }

  var landAccessType = document.getElementById('landAccessType');
  var leasePeriodWrap = document.getElementById('leasePeriodWrap');
  if (landAccessType && leasePeriodWrap) {
    landAccessType.addEventListener('change', function () {
      leasePeriodWrap.style.display = this.value === 'Lease' ? 'block' : 'none';
    });
  }

  form.addEventListener('click', function (e) {
    var nextBtn = e.target.closest('.btn-next');
    var prevBtn = e.target.closest('.btn-prev');

    if (nextBtn) {
      e.preventDefault();
      var next = nextBtn.getAttribute('data-next');
      if (next) {
        var nextNum = parseInt(next, 10);
        if (!validateStep(currentStep)) return;
        if (nextNum === 5) updateSummary();
        showPanel(next);
      }
    }

    if (prevBtn) {
      e.preventDefault();
      showPanel(prevBtn.getAttribute('data-prev'));
    }
  });

  function serializeFormDetails(formEl) {
    var details = {};
    var els = formEl.querySelectorAll('input, select, textarea');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.name;
      if (!name) continue;
      if (el.type === 'file') continue;
      if (el.type === 'radio') {
        if (el.checked) details[name] = el.value;
      } else if (el.type === 'checkbox') {
        details[name] = el.checked ? (el.value || 'yes') : '';
      } else {
        details[name] = el.value || '';
      }
    }
    if (sanitize && typeof sanitize === 'function') details = sanitize(details);
    return details;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var user = window.FarmAuth && FarmAuth.getCurrentUser();
    if (!user) {
      alert('Session expired. Please log in again.');
      window.location.href = '../login.html?return=Application/index.html';
      return;
    }

    updateSummary();

    var popiaConsent = document.getElementById('popiaConsent');
    if (!popiaConsent || !popiaConsent.checked) {
      validatePopiaConsent();
      document.getElementById('panel-5').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showPanel(5);
      return;
    }

    var commodityEl = document.getElementById('commodity');
    var categoryEl = document.querySelector('input[name="farmerCategory"]:checked');
    var registeredEl = document.getElementById('registeredName');
    var farmNameEl = document.getElementById('farmName');

    var safeVal = function (v) { return v != null && String(v).trim ? String(v).trim() : ''; };
    var summaryCommodity = safeVal(commodityEl && commodityEl.value);
    var summaryCategory = safeVal(categoryEl && categoryEl.value);
    var summaryProject = safeVal(registeredEl && registeredEl.value);
    var summaryFarm = safeVal(farmNameEl && farmNameEl.value);
    if (window.FarmSecurity && window.FarmSecurity.sanitizeString) {
      summaryCommodity = window.FarmSecurity.sanitizeString(summaryCommodity);
      summaryCategory = window.FarmSecurity.sanitizeString(summaryCategory);
      summaryProject = window.FarmSecurity.sanitizeString(summaryProject);
      summaryFarm = window.FarmSecurity.sanitizeString(summaryFarm);
    }

    var details = serializeFormDetails(form);
    details.popiaConsent = true;
    details.popiaConsentAt = new Date().toISOString();

    var application = {
      type: 'livestock',
      status: 'Submitted',
      summary: {
        type: 'livestock',
        commodity: summaryCommodity || '—',
        farmerCategory: summaryCategory || '—',
        registeredName: summaryProject || '—',
        farmName: summaryFarm || '—'
      },
      details: details
    };

    if (window.FarmApplications) {
      FarmApplications.saveApplication(user.id, application).then(function () {
        window.location.href = '../track.html';
      }).catch(function () {
        window.location.href = '../track.html';
      });
    } else {
      window.location.href = '../track.html';
    }
  });

  steps.forEach(function (step) {
    step.addEventListener('click', function () {
      var n = parseInt(step.getAttribute('data-step'), 10);
      if (n <= currentStep || step.classList.contains('completed')) showPanel(n);
    });
  });

  showPanel(1);
})();

