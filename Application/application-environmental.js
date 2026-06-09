(function () {
  'use strict';

  if (!window.FarmAuth || !FarmAuth.getCurrentUser()) {
    window.location.href = '../login.html?return=' + encodeURIComponent('Application/environmental.html');
    return;
  }
  if (!window.FarmAppShared) return;

  function updateSummary() {
    var primary = document.getElementById('primaryFocus');
    var category = document.querySelector('input[name="farmerCategory"]:checked');
    var reg = document.getElementById('registeredName');
    var farm = document.getElementById('farmName');
    var budget = document.getElementById('estimatedBudget');
    var budgetVal = budget && budget.value ? Number(budget.value).toLocaleString('en-ZA') : '—';
    var summaryPrimaryFocus = document.getElementById('summaryPrimaryFocus');
    var summaryCategory = document.getElementById('summaryCategory');
    var summaryApplicant = document.getElementById('summaryApplicant');
    var summaryFarm = document.getElementById('summaryFarm');
    var summaryBudget = document.getElementById('summaryBudget');
    if (summaryPrimaryFocus) summaryPrimaryFocus.textContent = primary && primary.value ? primary.value : '—';
    if (summaryCategory) summaryCategory.textContent = category ? category.value : '—';
    if (summaryApplicant) summaryApplicant.textContent = reg && reg.value ? reg.value.trim() : '—';
    if (summaryFarm) summaryFarm.textContent = farm && farm.value ? farm.value.trim() : '—';
    if (summaryBudget) summaryBudget.textContent = budgetVal;
  }

  function safeSummary(val) {
    var s = (val != null && String(val).trim ? String(val).trim() : '') || '—';
    if (window.FarmSecurity && window.FarmSecurity.sanitizeString) {
      s = window.FarmSecurity.sanitizeString(s);
    }
    return s;
  }

  window.FarmAppShared.initForm({
    draftKey: 'environmental',
    returnUrl: 'Application/environmental.html',
    totalSteps: 5,
    lastStep: 5,
    multiCheckboxNames: ['activity'],
    validateStep: function (stepNum, helpers) {
      if (stepNum === 1) {
        var ok = true;
        var primary = document.getElementById('primaryFocus');
        if (!primary || !primary.value) {
          helpers.setFieldError('primaryFocus', 'primaryFocusError', 'Please select a primary focus area.');
          ok = false;
        } else {
          helpers.setFieldError('primaryFocus', 'primaryFocusError', '');
        }
        var category = document.querySelector('input[name="farmerCategory"]:checked');
        if (!category) {
          helpers.setFieldError(null, 'farmerCategoryError', 'Please select your farmer category.');
          ok = false;
        } else {
          helpers.setFieldError(null, 'farmerCategoryError', '');
        }
        return ok;
      }
      if (stepNum === 2) return helpers.validateStep2();
      if (stepNum === 4) {
        var challenge = document.getElementById('environmentalChallenge');
        var val = challenge ? challenge.value.trim() : '';
        if (!val) {
          helpers.setFieldError('environmentalChallenge', 'environmentalChallengeError', 'Please describe the environmental challenge.');
          return false;
        }
        helpers.setFieldError('environmentalChallenge', 'environmentalChallengeError', '');
        return true;
      }
      return true;
    },
    updateSummary: updateSummary,
    buildApplication: function (details) {
      var primary = document.getElementById('primaryFocus');
      var category = document.querySelector('input[name="farmerCategory"]:checked');
      var reg = document.getElementById('registeredName');
      var farm = document.getElementById('farmName');
      var budget = document.getElementById('estimatedBudget');
      var summaryBudget = budget && budget.value ? 'R' + Number(budget.value).toLocaleString('en-ZA') : '—';
      return {
        type: 'environmental',
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        summary: {
          applicationType: 'environmental',
          primaryFocus: safeSummary(primary && primary.value),
          farmerCategory: safeSummary(category && category.value),
          registeredName: safeSummary(reg && reg.value),
          farmName: safeSummary(farm && farm.value),
          budget: safeSummary(summaryBudget)
        },
        details: details
      };
    }
  });
})();
