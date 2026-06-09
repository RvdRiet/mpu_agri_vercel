(function () {
  'use strict';

  if (!window.FarmAuth || !FarmAuth.getCurrentUser()) {
    window.location.href = '../login.html?return=' + encodeURIComponent('Application/crop.html');
    return;
  }
  if (!window.FarmAppShared) return;

  function setCropVarietyOptions() {
    var cropTypeEl = document.getElementById('cropType');
    var cropVarietyEl = document.getElementById('cropVariety');
    if (!cropTypeEl || !cropVarietyEl) return;
    var cropType = cropTypeEl.value;
    var current = cropVarietyEl.value;
    var options = ['Not sure'];

    if (cropType === 'Maize') options = ['Not sure', 'White maize hybrid', 'Yellow maize hybrid', 'Open-pollinated maize', 'Sweet corn'];
    else if (cropType === 'Sorghum') options = ['Not sure', 'Grain sorghum', 'Sweet sorghum', 'Forage sorghum'];
    else if (cropType === 'Vegetables') options = ['Not sure', 'Tomato', 'Onion', 'Cabbage', 'Spinach', 'Butternut', 'Potato', 'Carrot', 'Green pepper', 'Other vegetable'];
    else if (cropType === 'Fruit') options = ['Not sure', 'Citrus (orange/lemon)', 'Mango', 'Avocado', 'Banana', 'Litchi', 'Peach/Nectarine', 'Apple/Pear', 'Grapes', 'Other fruit'];
    else if (cropType === 'Sugarcane') options = ['Not sure', 'Early maturing variety', 'Mid-season variety', 'Late maturing variety'];
    else if (cropType === 'Nuts') options = ['Not sure', 'Macadamia', 'Pecan', 'Almond', 'Cashew', 'Other nuts'];
    else if (cropType === 'Sunflower') options = ['Not sure', 'Oilseed sunflower hybrid', 'Confection sunflower'];
    else if (cropType === 'Soybeans') options = ['Not sure', 'Early maturity soybean', 'Medium maturity soybean', 'Late maturity soybean'];
    else if (cropType === 'Dry Beans') options = ['Not sure', 'Sugar beans', 'Red speckled beans', 'Navy beans', 'Small white beans', 'Other dry beans'];
    else if (cropType === 'Other') options = ['Not sure', 'Other (specify in project description)'];

    cropVarietyEl.innerHTML = '<option value="">-- Select crop variety / Not sure --</option>' +
      options.map(function (opt) { return '<option value="' + opt + '">' + opt + '</option>'; }).join('');
    if (current && options.indexOf(current) !== -1) cropVarietyEl.value = current;
  }

  function updateSummary() {
    var cropType = document.getElementById('cropType');
    var category = document.querySelector('input[name="farmerCategory"]:checked');
    var applicant = document.getElementById('registeredName');
    var farm = document.getElementById('farmName');
    var elCrop = document.getElementById('summaryCropType');
    var elCat = document.getElementById('summaryCategory');
    var elApp = document.getElementById('summaryApplicant');
    var elFarm = document.getElementById('summaryFarm');
    if (elCrop) elCrop.textContent = cropType && cropType.value ? cropType.value : '—';
    if (elCat) elCat.textContent = category ? category.value : '—';
    if (elApp) elApp.textContent = applicant && applicant.value ? applicant.value.trim() : '—';
    if (elFarm) elFarm.textContent = farm && farm.value ? farm.value.trim() : '—';
  }

  function safeSummary(val) {
    var s = (val != null && String(val).trim ? String(val).trim() : '') || '—';
    if (window.FarmSecurity && window.FarmSecurity.sanitizeString) {
      s = window.FarmSecurity.sanitizeString(s);
    }
    return s;
  }

  window.FarmAppShared.initForm({
    draftKey: 'crop',
    returnUrl: 'Application/crop.html',
    totalSteps: 5,
    lastStep: 5,
    validateStep: function (stepNum, helpers) {
      if (stepNum === 1) {
        var cropType = document.getElementById('cropType');
        var category = document.querySelector('input[name="farmerCategory"]:checked');
        var ok = true;
        if (!cropType || !cropType.value) {
          helpers.setFieldError('cropType', 'cropTypeError', 'Please select the crop type.');
          ok = false;
        } else {
          helpers.setFieldError('cropType', 'cropTypeError', '');
        }
        if (!category) {
          helpers.setFieldError(null, 'farmerCategoryError', 'Please select your farmer category.');
          ok = false;
        } else {
          helpers.setFieldError(null, 'farmerCategoryError', '');
        }
        return ok;
      }
      if (stepNum === 2) return helpers.validateStep2();
      return true;
    },
    updateSummary: updateSummary,
    buildApplication: function (details) {
      var cropTypeEl = document.getElementById('cropType');
      var categoryEl = document.querySelector('input[name="farmerCategory"]:checked');
      var applicantEl = document.getElementById('registeredName');
      var farmEl = document.getElementById('farmName');
      return {
        type: 'crop',
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        summary: {
          type: 'crop',
          cropType: safeSummary(cropTypeEl && cropTypeEl.value),
          farmerCategory: safeSummary(categoryEl && categoryEl.value),
          applicantName: safeSummary(applicantEl && applicantEl.value),
          farmName: safeSummary(farmEl && farmEl.value)
        },
        details: details
      };
    },
    onInit: function () {
      var cropTypeEl = document.getElementById('cropType');
      if (cropTypeEl) {
        cropTypeEl.addEventListener('change', setCropVarietyOptions);
        setCropVarietyOptions();
      }
      var previousGrantRadios = document.querySelectorAll('input[name="previousGrant"]');
      var previousGrantWrap = document.getElementById('previousGrantDetailsWrap');
      if (previousGrantRadios.length && previousGrantWrap) {
        previousGrantRadios.forEach(function (r) {
          r.addEventListener('change', function () {
            previousGrantWrap.style.display = this.value === 'Yes' ? 'block' : 'none';
          });
        });
        var checked = document.querySelector('input[name="previousGrant"]:checked');
        if (checked && checked.value === 'Yes') previousGrantWrap.style.display = 'block';
      }
    }
  });
})();
