(function () {
  var form = document.getElementById('applicationForm');
  var panels = document.querySelectorAll('.app-step-panel');
  var steps = document.querySelectorAll('.app-step');
  var currentStep = 1;
  var totalSteps = 5;
  var sanitize = window.FarmSecurity && window.FarmSecurity.sanitizeForStorage;

  if (window.FarmAutosave && form) FarmAutosave.init(form, 'livestock');

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
    var mespPreviously = document.querySelector('input[name="mespPreviously"]:checked');
    var mespPreviousCommodity = document.getElementById('mespPreviousCommodity');
    var mespCommodityReturned = document.querySelector('input[name="mespCommodityReturned"]:checked');
    var mespDetails = document.getElementById('mespDetails');
    var mespPrevErr = document.getElementById('mespPreviousDetailsError');
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

    if (mespPrevErr) mespPrevErr.textContent = '';
    if (mespPreviously && mespPreviously.value === 'Yes') {
      if (!mespPreviousCommodity || !mespPreviousCommodity.value) {
        if (mespPrevErr) mespPrevErr.textContent = 'Please select the previous commodity you benefited from.';
        ok = false;
      }
      if (!mespCommodityReturned) {
        if (mespPrevErr) mespPrevErr.textContent = 'Please indicate whether you returned the previously provided commodity.';
        ok = false;
      }
      if (!mespDetails || !mespDetails.value.trim()) {
        if (mespPrevErr) mespPrevErr.textContent = 'Please provide previous-benefit details and include the date.';
        ok = false;
      }
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

  function getBeneficiaryCount() {
    var totalMembersEl = document.getElementById('totalMembers');
    var count = parseInt((totalMembersEl && totalMembersEl.value) || '0', 10);
    if (!count || count < 1) count = 1;
    if (count > 50) count = 50;
    return count;
  }

  function renderBeneficiaryIdInputs() {
    var wrap = document.getElementById('idCopiesDynamicWrap');
    if (!wrap) return;
    var count = getBeneficiaryCount();
    var html = '';
    for (var i = 1; i <= count; i++) {
      html += '<div class="form-group">' +
        '<label for="idCopyMember' + i + '">Member ' + i + ' certified ID copy <span class="label-required">*</span></label>' +
        '<input type="file" id="idCopyMember' + i + '" name="idCopyMember' + i + '" accept=".pdf,.jpg,.jpeg,.png" required class="beneficiary-id-input" />' +
      '</div>';
    }
    wrap.innerHTML = html;
  }

  function validateBeneficiaryIdCopies() {
    var errEl = document.getElementById('idCopiesError');
    if (errEl) errEl.textContent = '';
    var inputs = document.querySelectorAll('.beneficiary-id-input');
    if (!inputs.length) return true;
    for (var i = 0; i < inputs.length; i++) {
      if (!inputs[i].files || !inputs[i].files.length) {
        if (errEl) errEl.textContent = 'Please upload certified ID copies for all listed project members before submitting.';
        return false;
      }
    }
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
  var financialDocsWrap = document.getElementById('financialDocsWrap');
  var farmerCategoryRadios = document.querySelectorAll('input[name="farmerCategory"]');

  function updateFinancialDocVisibility() {
    if (!financialDocsWrap) return;
    var entity = legalEntityType ? legalEntityType.value : '';
    var categoryEl = document.querySelector('input[name="farmerCategory"]:checked');
    var category = categoryEl ? categoryEl.value : '';
    var isRegisteredEntity = entity === 'Cooperative' || entity === 'Company' || entity === 'Trust' || entity === 'Other';
    var showFinancialDocs = isRegisteredEntity && category !== 'Subsistence';
    financialDocsWrap.style.display = showFinancialDocs ? 'block' : 'none';

    if (!showFinancialDocs) {
      var incomeProof = document.getElementById('incomeProof');
      var bankStatementProof = document.getElementById('bankStatementProof');
      if (incomeProof) incomeProof.value = '';
      if (bankStatementProof) bankStatementProof.value = '';
    }
  }

  if (legalEntityType && legalEntityOtherWrap) {
    legalEntityType.addEventListener('change', function () {
      legalEntityOtherWrap.style.display = this.value === 'Other' ? 'block' : 'none';
      updateFinancialDocVisibility();
    });
  }
  if (farmerCategoryRadios.length) {
    farmerCategoryRadios.forEach(function (r) {
      r.addEventListener('change', updateFinancialDocVisibility);
    });
  }
  updateFinancialDocVisibility();

  var landAccessType = document.getElementById('landAccessType');
  var leasePeriodWrap = document.getElementById('leasePeriodWrap');
  if (landAccessType && leasePeriodWrap) {
    landAccessType.addEventListener('change', function () {
      leasePeriodWrap.style.display = this.value === 'Lease' ? 'block' : 'none';
    });
  }

  var DISTRICT_MUNICIPALITY_MAP = {
    'Ehlanzeni District Municipality': [
      'Bushbuckridge Local Municipality',
      'City of Mbombela Local Municipality',
      'Nkomazi Local Municipality',
      'Thaba Chweu Local Municipality'
    ],
    'Gert Sibande District Municipality': [
      'Chief Albert Luthuli Local Municipality',
      'Dipaleseng Local Municipality',
      'Dr Pixley Ka Isaka Seme Local Municipality',
      'Govan Mbeki Local Municipality',
      'Lekwa Local Municipality',
      'Mkhondo Local Municipality',
      'Msukaligwa Local Municipality'
    ],
    'Nkangala District Municipality': [
      'Dr JS Moroka Local Municipality',
      'Emakhazeni Local Municipality',
      'Emalahleni Local Municipality',
      'Steve Tshwete Local Municipality',
      'Thembisile Hani Local Municipality',
      'Victor Khanye Local Municipality'
    ]
  };

  function updateLocalMunicipalityOptions() {
    var districtEl = document.getElementById('district');
    var municipalityEl = document.getElementById('localMunicipality');
    if (!districtEl || !municipalityEl) return;

    var district = districtEl.value || '';
    var municipalities = DISTRICT_MUNICIPALITY_MAP[district] || [];
    var previousValue = municipalityEl.value;

    municipalityEl.innerHTML = '<option value="">-- Select local municipality --</option>';
    municipalities.forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      municipalityEl.appendChild(opt);
    });

    if (municipalities.indexOf(previousValue) >= 0) {
      municipalityEl.value = previousValue;
    } else {
      municipalityEl.value = '';
    }
  }

  function optionBelongsToVisibleGroup(optionEl) {
    if (!optionEl) return false;
    var parent = optionEl.parentElement;
    if (!parent) return true;
    if (parent.tagName && parent.tagName.toLowerCase() !== 'optgroup') return true;
    return !parent.hidden;
  }

  function filterBreedSelectByCommodity(selectEl, commodityValue) {
    if (!selectEl) return;
    var groups = selectEl.querySelectorAll('optgroup');
    var hasCommodity = !!commodityValue;
    groups.forEach(function (group) {
      var isMatch = String(group.label || '').toLowerCase() === String(commodityValue || '').toLowerCase();
      var shouldShow = !hasCommodity || isMatch;
      group.hidden = !shouldShow;
      var groupOptions = group.querySelectorAll('option');
      groupOptions.forEach(function (opt) { opt.disabled = !shouldShow; });
    });

    if (selectEl.selectedIndex > -1) {
      var currentOption = selectEl.options[selectEl.selectedIndex];
      if (currentOption && !optionBelongsToVisibleGroup(currentOption)) {
        selectEl.value = '';
      }
    }
  }

  function applyBreedFilters() {
    var commodityEl = document.getElementById('commodity');
    var preferredBreedEl = document.getElementById('preferredBreed');
    var secondChoiceEl = document.getElementById('secondChoice');
    var commodityValue = commodityEl ? commodityEl.value : '';
    filterBreedSelectByCommodity(preferredBreedEl, commodityValue);
    filterBreedSelectByCommodity(secondChoiceEl, commodityValue);
  }

  var commodityForBreeds = document.getElementById('commodity');
  if (commodityForBreeds) {
    commodityForBreeds.addEventListener('change', applyBreedFilters);
    applyBreedFilters();
  }

  var districtSelect = document.getElementById('district');
  if (districtSelect) {
    districtSelect.addEventListener('change', updateLocalMunicipalityOptions);
    updateLocalMunicipalityOptions();
  }

  var totalMembersInput = document.getElementById('totalMembers');
  if (totalMembersInput) {
    totalMembersInput.addEventListener('input', renderBeneficiaryIdInputs);
    totalMembersInput.addEventListener('change', renderBeneficiaryIdInputs);
  }
  renderBeneficiaryIdInputs();

  var mespPreviouslyRadios = document.querySelectorAll('input[name="mespPreviously"]');
  var mespDetailsWrap = document.getElementById('mespDetailsWrap');
  if (mespPreviouslyRadios.length && mespDetailsWrap) {
    mespPreviouslyRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        var show = this.value === 'Yes';
        mespDetailsWrap.style.display = show ? 'block' : 'none';
        if (!show) {
          var previousCommodity = document.getElementById('mespPreviousCommodity');
          var details = document.getElementById('mespDetails');
          var returned = document.querySelectorAll('input[name="mespCommodityReturned"]');
          var err = document.getElementById('mespPreviousDetailsError');
          if (previousCommodity) previousCommodity.value = '';
          if (details) details.value = '';
          if (err) err.textContent = '';
          returned.forEach(function (x) { x.checked = false; });
        }
      });
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

    if (!validateBeneficiaryIdCopies()) {
      document.getElementById('panel-5').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showPanel(5);
      return;
    }

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

    if (window.FarmAutosave) FarmAutosave.clearDraft('livestock');

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

