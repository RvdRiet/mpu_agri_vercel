(function () {
  'use strict';

  if (!window.FarmAuth || !FarmAuth.getCurrentUser()) {
    window.location.href = '../login.html?return=' + encodeURIComponent('Application/crop.html');
    return;
  }
  if (!window.FarmAppShared) return;

  var SFG_MAX_TOTAL = 5;

  var SFG_PRODUCT_QTY_MAP = {
    'WickBox™': 'sfgQtyWickbox',
    'WickTray™': 'sfgQtyWicktray',
    'EcoGrow™': 'sfgQtyEcogrow',
    'HydroGrow™ Box': 'sfgQtyHydrogrowBox',
    'HydroGrow™ Micro': 'sfgQtyHydrogrowMicro',
    'HydroGrow™ Pro DWC': 'sfgQtyHydrogrowProDwc',
    'HydroGrow™ Pro Planter': 'sfgQtyHydrogrowProPlanter',
    'GrowRaft™ Floated Crops': 'sfgQtyGrowraftCrops',
    'GrowRaft™ Floated Solar': 'sfgQtyGrowraftSolar',
    'VersaTray™': 'sfgQtyVersatray'
  };

  function getTotalSfgQty(excludeInput) {
    var total = 0;
    document.querySelectorAll('.sfg-product-card input[type="number"]').forEach(function (el) {
      if (excludeInput && el === excludeInput) return;
      var v = parseInt(el.value, 10);
      if (!isNaN(v) && v > 0) total += v;
    });
    return total;
  }

  function updateSfgQtyCounter(showCapWarning) {
    var counter = document.getElementById('sfgQtyCounter');
    if (!counter) return;
    var total = getTotalSfgQty();
    counter.textContent = total + ' of ' + SFG_MAX_TOTAL + ' units selected';
    counter.classList.toggle('is-at-cap', total >= SFG_MAX_TOTAL);
    if (showCapWarning && total >= SFG_MAX_TOTAL) {
      counter.textContent = SFG_MAX_TOTAL + ' of ' + SFG_MAX_TOTAL + ' units selected — grant cap reached';
    }
  }

  function enforceSfgCap(changedEl) {
    if (!changedEl) return;
    var total = getTotalSfgQty();
    while (total > SFG_MAX_TOTAL) {
      var current = parseInt(changedEl.value, 10) || 0;
      if (current <= 0) break;
      changedEl.value = String(current - 1);
      total = getTotalSfgQty();
    }
    updateSfgQtyCounter();
  }

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
    else if (cropType === 'Herbs') options = ['Not sure', 'Basil', 'Parsley', 'Coriander', 'Mint', 'Rosemary', 'Thyme', 'Chives', 'Other herb'];
    else if (cropType === 'Fruit') options = ['Not sure', 'Strawberry', 'Blueberry', 'Dwarf citrus', 'Fig', 'Pomegranate', 'Passion fruit', 'Other compact fruit'];
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

  function getSelectedSfgProducts() {
    var selected = [];
    document.querySelectorAll('input[name="sfgProduct"]:checked').forEach(function (cb) {
      var qtyName = SFG_PRODUCT_QTY_MAP[cb.value];
      var qtyEl = qtyName ? document.querySelector('input[name="' + qtyName + '"]') : null;
      var qty = qtyEl ? parseInt(qtyEl.value, 10) : 0;
      if (isNaN(qty) || qty < 0) qty = 0;
      selected.push({ product: cb.value, quantity: qty });
    });
    return selected;
  }

  function formatSfgSupplySummary() {
    var items = getSelectedSfgProducts();
    if (!items.length) return '—';
    return items.map(function (item) {
      return item.product + (item.quantity > 0 ? ' × ' + item.quantity : '');
    }).join(', ');
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
    var elSfg = document.getElementById('summarySfgSupply');
    if (elCrop) elCrop.textContent = cropType && cropType.value ? cropType.value : '—';
    if (elCat) elCat.textContent = category ? category.value : '—';
    if (elApp) elApp.textContent = applicant && applicant.value ? applicant.value.trim() : '—';
    if (elFarm) elFarm.textContent = farm && farm.value ? farm.value.trim() : '—';
    if (elSfg) elSfg.textContent = formatSfgSupplySummary();
  }

  function safeSummary(val) {
    var s = (val != null && String(val).trim ? String(val).trim() : '') || '—';
    if (window.FarmSecurity && window.FarmSecurity.sanitizeString) {
      s = window.FarmSecurity.sanitizeString(s);
    }
    return s;
  }

  function validateSfgStep(helpers) {
    var ok = true;
    var growingLocation = document.getElementById('growingLocation');
    var spaceAvailable = document.getElementById('spaceAvailable');
    var sfgAppAck = document.querySelector('input[name="sfgAppAck"]');
    var selected = document.querySelectorAll('input[name="sfgProduct"]:checked');

    if (!growingLocation || !growingLocation.value) {
      helpers.setFieldError('growingLocation', 'growingLocationError', 'Please select where the growing systems will be used.');
      ok = false;
    } else {
      helpers.setFieldError('growingLocation', 'growingLocationError', '');
    }

    var spaceVal = spaceAvailable && spaceAvailable.value ? parseFloat(spaceAvailable.value) : NaN;
    if (!spaceAvailable || !spaceAvailable.value || isNaN(spaceVal) || spaceVal < 1) {
      helpers.setFieldError('spaceAvailable', 'spaceAvailableError', 'Please enter the approximate space available (at least 1 m²).');
      ok = false;
    } else {
      helpers.setFieldError('spaceAvailable', 'spaceAvailableError', '');
    }

    if (!selected.length) {
      helpers.setFieldError(null, 'sfgProductError', 'Please select at least one SFG growing system.');
      ok = false;
    } else {
      var qtyOk = true;
      selected.forEach(function (cb) {
        var qtyName = SFG_PRODUCT_QTY_MAP[cb.value];
        var qtyEl = qtyName ? document.querySelector('input[name="' + qtyName + '"]') : null;
        var qty = qtyEl ? parseInt(qtyEl.value, 10) : 0;
        if (!qtyEl || isNaN(qty) || qty < 1) qtyOk = false;
      });
      if (!qtyOk) {
        helpers.setFieldError(null, 'sfgProductError', 'Enter a quantity of at least 1 for each selected product.');
        ok = false;
      } else if (getTotalSfgQty() > SFG_MAX_TOTAL) {
        helpers.setFieldError(null, 'sfgProductError', 'You may request a maximum of ' + SFG_MAX_TOTAL + ' SFG units per application.');
        ok = false;
      } else {
        helpers.setFieldError(null, 'sfgProductError', '');
      }
    }

    if (!sfgAppAck || !sfgAppAck.checked) {
      helpers.setFieldError(null, 'sfgAppAckError', 'Please acknowledge SFG App access for approved applicants.');
      ok = false;
    } else {
      helpers.setFieldError(null, 'sfgAppAckError', '');
    }

    return ok;
  }

  function initSfgProductUi() {
    var wickboxCb = document.querySelector('input[name="sfgProduct"][value="WickBox™"]');
    var wickboxWrap = document.getElementById('wickboxOptionsWrap');
    var productCheckboxes = document.querySelectorAll('input[name="sfgProduct"]');

    function syncWickboxOptions() {
      if (wickboxWrap && wickboxCb) {
        wickboxWrap.hidden = !wickboxCb.checked;
      }
    }

    function syncQtyFromCheckbox(cb) {
      var qtyName = SFG_PRODUCT_QTY_MAP[cb.value];
      if (!qtyName) return;
      var qtyEl = document.querySelector('input[name="' + qtyName + '"]');
      if (!qtyEl) return;
      if (cb.checked) {
        var otherTotal = getTotalSfgQty(qtyEl);
        if (otherTotal >= SFG_MAX_TOTAL) {
          cb.checked = false;
          var errEl = document.getElementById('sfgProductError');
          if (errEl) errEl.textContent = 'Maximum of ' + SFG_MAX_TOTAL + ' units per application. Reduce quantities before adding another product.';
          updateSfgQtyCounter(true);
          return;
        }
        if (!qtyEl.value || parseInt(qtyEl.value, 10) < 1) {
          qtyEl.value = '1';
        }
        enforceSfgCap(qtyEl);
      } else {
        qtyEl.value = '0';
        updateSfgQtyCounter();
      }
    }

    productCheckboxes.forEach(function (cb) {
      cb.addEventListener('change', function () {
        syncQtyFromCheckbox(cb);
        syncWickboxOptions();
        updateSummary();
      });
    });

    document.querySelectorAll('.sfg-product-card input[type="number"]').forEach(function (qtyEl) {
      qtyEl.addEventListener('input', function () {
        var v = parseInt(qtyEl.value, 10);
        if (!isNaN(v) && v > SFG_MAX_TOTAL) qtyEl.value = String(SFG_MAX_TOTAL);
        if (v < 0 || qtyEl.value === '') qtyEl.value = '0';
        enforceSfgCap(qtyEl);
        updateSummary();
      });
    });

    syncWickboxOptions();
    updateSfgQtyCounter();
  }

  window.FarmAppShared.initForm({
    draftKey: 'crop',
    returnUrl: 'Application/crop.html',
    totalSteps: 5,
    lastStep: 5,
    multiCheckboxNames: ['sfgProduct'],
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
      if (stepNum === 4) return validateSfgStep(helpers);
      return true;
    },
    updateSummary: updateSummary,
    buildApplication: function (details) {
      var cropTypeEl = document.getElementById('cropType');
      var categoryEl = document.querySelector('input[name="farmerCategory"]:checked');
      var applicantEl = document.getElementById('registeredName');
      var farmEl = document.getElementById('farmName');
      var sfgItems = getSelectedSfgProducts();
      return {
        type: 'crop',
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        summary: {
          type: 'crop',
          cropType: safeSummary(cropTypeEl && cropTypeEl.value),
          farmerCategory: safeSummary(categoryEl && categoryEl.value),
          applicantName: safeSummary(applicantEl && applicantEl.value),
          farmName: safeSummary(farmEl && farmEl.value),
          sfgSupply: safeSummary(formatSfgSupplySummary()),
          sfgSupplier: 'SFG Technologies (SFG Tec)'
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
      initSfgProductUi();
    }
  });
})();
