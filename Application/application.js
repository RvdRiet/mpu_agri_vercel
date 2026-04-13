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
    var isRegisteredEntity = entity === 'Cooperative' || entity === 'CPA' || entity === 'Trust' || entity === 'PTY Ltd' || entity === 'Other';
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

  function setCommodityVisibility(selector, selected, clearFn) {
    document.querySelectorAll(selector).forEach(function (el) {
      var allowed = el.getAttribute(selector.replace(/[\[\]]/g, '')).split(',').map(function (s) { return s.trim(); });
      var visible = !selected || allowed.indexOf(selected) !== -1;
      el.style.display = visible ? '' : 'none';
      if (!visible && clearFn) clearFn(el);
    });
  }

  function clearAllInputs(el) {
    el.querySelectorAll('input, select, textarea').forEach(function (inp) {
      if (inp.type === 'radio' || inp.type === 'checkbox') inp.checked = false;
      else if (inp.type !== 'file') inp.value = '';
      else inp.value = '';
    });
  }

  function updateInfrastructureVisibility() {
    var commodityEl = document.getElementById('commodity');
    var selected = commodityEl ? commodityEl.value : '';

    setCommodityVisibility('[data-infra-for]', selected, clearAllInputs);

    setCommodityVisibility('[data-stock-for]', selected, function (el) {
      el.querySelectorAll('input[type="number"]').forEach(function (inp) { inp.value = ''; });
    });

    setCommodityVisibility('[data-doc-for]', selected, function (el) {
      el.querySelectorAll('input[type="file"]').forEach(function (inp) { inp.value = ''; });
    });

    setCommodityVisibility('[data-biosec-for]', selected, clearAllInputs);
  }

  var commodityForBreeds = document.getElementById('commodity');
  if (commodityForBreeds) {
    commodityForBreeds.addEventListener('change', function () {
      applyBreedFilters();
      updateInfrastructureVisibility();
    });
    applyBreedFilters();
    updateInfrastructureVisibility();
  }

  function updateChecklistVisibility() {
    var categoryEl = document.querySelector('input[name="farmerCategory"]:checked');
    var category = categoryEl ? categoryEl.value : '';
    document.querySelectorAll('[data-checklist-cat]').forEach(function (row) {
      var cats = row.getAttribute('data-checklist-cat').split(',').map(function (s) { return s.trim(); });
      var relevant = !category || cats.indexOf(category) !== -1;
      row.style.opacity = relevant ? '1' : '0.4';
      var cb = row.querySelector('input[type="checkbox"]');
      if (cb && !relevant) { cb.checked = false; cb.disabled = true; }
      if (cb && relevant) { cb.disabled = false; }
    });
  }

  farmerCategoryRadios.forEach(function (r) {
    r.addEventListener('change', updateChecklistVisibility);
  });
  updateChecklistVisibility();

  var districtSelect = document.getElementById('district');
  if (districtSelect) {
    districtSelect.addEventListener('change', updateLocalMunicipalityOptions);
    updateLocalMunicipalityOptions();
  }

  var addressMap = null;
  var addressMarker = null;
  var manualAddressLookupTimer = null;
  var MPUMALANGA_VIEWBOX = {
    left: 28.1,
    top: -24.0,
    right: 32.1,
    bottom: -27.6
  };

  function setAddressMapStatus(msg, isError) {
    var statusEl = document.getElementById('addressMapStatus');
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.style.color = isError ? 'var(--color-error)' : 'var(--color-text-muted)';
  }

  function ensureAddressMap() {
    if (addressMap) return true;
    var mapEl = document.getElementById('addressMap');
    if (!mapEl || !window.L) return false;
    addressMap = window.L.map(mapEl).setView([-25.5, 30.9], 7);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(addressMap);
    return true;
  }

  function clearAddressCandidates() {
    var wrap = document.getElementById('addressCandidates');
    if (!wrap) return;
    wrap.classList.remove('is-visible');
    wrap.innerHTML = '';
  }

  function applyResolvedLocation(lat, lon, displayName) {
    var gpsLat = document.getElementById('gpsLatitude');
    var gpsLon = document.getElementById('gpsLongitude');
    if (gpsLat) gpsLat.value = Number(lat).toFixed(6);
    if (gpsLon) gpsLon.value = Number(lon).toFixed(6);

    if (addressMarker) {
      addressMarker.setLatLng([lat, lon]);
    } else {
      addressMarker = window.L.marker([lat, lon], { draggable: true }).addTo(addressMap);
      addressMarker.on('dragend', function (evt) {
        var point = evt.target.getLatLng();
        var dragLat = point.lat;
        var dragLon = point.lng;
        if (gpsLat) gpsLat.value = dragLat.toFixed(6);
        if (gpsLon) gpsLon.value = dragLon.toFixed(6);
        reverseGeocodeAndPopulate(dragLat, dragLon, true).finally(function () {
          setAddressMapStatus('Pin moved. Address and GPS fields updated from the new map location.');
        });
      });
    }

    addressMarker.bindPopup(displayName || 'Selected address').openPopup();
    addressMap.setView([lat, lon], 15);
    setTimeout(function () { if (addressMap) addressMap.invalidateSize(); }, 100);
  }

  function renderAddressCandidates(results) {
    var wrap = document.getElementById('addressCandidates');
    if (!wrap) return;
    if (!Array.isArray(results) || !results.length) {
      clearAddressCandidates();
      return;
    }

    var top = results.slice(0, 5);
    var html = '<p class="candidate-heading">Select the closest address match:</p><div class="candidate-list">';
    top.forEach(function (item, idx) {
      var label = item.display_name || ('Result ' + (idx + 1));
      html += '<button type="button" class="candidate-option" data-candidate-idx="' + idx + '">' + label + '</button>';
    });
    html += '</div>';
    wrap.innerHTML = html;
    wrap.classList.add('is-visible');

    wrap.querySelectorAll('.candidate-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-candidate-idx'), 10);
        var selected = top[idx];
        if (!selected) return;
        var lat = parseFloat(selected.lat);
        var lon = parseFloat(selected.lon);
        if (isNaN(lat) || isNaN(lon)) return;
        applyResolvedLocation(lat, lon, selected.display_name || 'Selected address');
        if (selected.address) populateAddressFieldsFromNominatim(selected.address);
        clearAddressCandidates();
        setAddressMapStatus('Address selected. GPS and related fields were auto-filled.');
      });
    });
  }

  function buildAddressQuery() {
    var physicalAddress = document.getElementById('physicalAddress');
    var localMunicipality = document.getElementById('localMunicipality');
    var district = document.getElementById('district');
    var postcode = document.getElementById('physicalPostCode');
    var parts = [
      physicalAddress && physicalAddress.value ? physicalAddress.value.trim() : '',
      localMunicipality && localMunicipality.value ? localMunicipality.value.trim() : '',
      district && district.value ? district.value.trim() : '',
      postcode && postcode.value ? postcode.value.trim() : '',
      'Mpumalanga',
      'South Africa'
    ].filter(function (v) { return !!v; });
    return parts.join(', ');
  }

  function geocodeAddressToMap() {
    var query = buildAddressQuery();
    if (!query) {
      setAddressMapStatus('Please enter a physical address first.', true);
      return;
    }
    if (!ensureAddressMap()) {
      setAddressMapStatus('Map could not be loaded in this browser.', true);
      return;
    }
    setAddressMapStatus('Searching address on map...');
    clearAddressCandidates();

    var physicalAddress = document.getElementById('physicalAddress');
    var localMunicipality = document.getElementById('localMunicipality');
    var district = document.getElementById('district');
    var areaName = document.getElementById('areaName');
    var postCode = document.getElementById('physicalPostCode');
    var params = new URLSearchParams();
    params.set('format', 'jsonv2');
    params.set('addressdetails', '1');
    params.set('limit', '5');
    params.set('countrycodes', 'za');
    params.set('viewbox', MPUMALANGA_VIEWBOX.left + ',' + MPUMALANGA_VIEWBOX.top + ',' + MPUMALANGA_VIEWBOX.right + ',' + MPUMALANGA_VIEWBOX.bottom);
    params.set('bounded', '1');
    params.set('state', 'Mpumalanga');
    if (physicalAddress && physicalAddress.value.trim()) params.set('street', physicalAddress.value.trim());
    if (areaName && areaName.value.trim()) params.set('city', areaName.value.trim());
    if (localMunicipality && localMunicipality.value.trim()) params.set('county', localMunicipality.value.trim());
    if (district && district.value.trim()) params.set('state_district', district.value.trim());
    if (postCode && postCode.value.trim()) params.set('postalcode', postCode.value.trim());
    params.set('q', query);
    var url = 'https://nominatim.openstreetmap.org/search?' + params.toString();

    fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(function (res) { return res.json(); })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) {
          setAddressMapStatus('Address not found. Try adding street/area details.', true);
          return;
        }
        if (list.length === 1) {
          var hit = list[0];
          var lat = parseFloat(hit.lat);
          var lon = parseFloat(hit.lon);
          if (isNaN(lat) || isNaN(lon)) {
            setAddressMapStatus('Coordinates could not be resolved for this address.', true);
            return;
          }
          applyResolvedLocation(lat, lon, hit.display_name || 'Selected address');
          if (hit.address) populateAddressFieldsFromNominatim(hit.address);
          setAddressMapStatus('Address found. GPS and related fields were auto-filled.');
          return;
        }

        renderAddressCandidates(list);
        setAddressMapStatus('Multiple matches found. Please select the correct address.');
      })
      .catch(function () {
        setAddressMapStatus('Could not look up the address right now. Please try again.', true);
      });
  }

  function parseNominatimAddress(addr) {
    if (!addr) return {};
    var roadPart = [addr.house_number, addr.road].filter(function (v) { return !!v; }).join(' ');
    var locality = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.hamlet || '';
    var municipality = addr.municipality || addr.city_district || addr.county || '';
    var district = addr.state_district || addr.county || '';
    return {
      physicalAddress: [roadPart, locality].filter(function (v) { return !!v; }).join(', '),
      areaName: locality,
      localMunicipality: municipality,
      district: district,
      postCode: addr.postcode || ''
    };
  }

  function setSelectValueByText(selectEl, valueText) {
    if (!selectEl || !valueText) return false;
    var target = String(valueText).toLowerCase().trim();
    var matchedValue = '';
    for (var i = 0; i < selectEl.options.length; i++) {
      var opt = selectEl.options[i];
      var label = String(opt.textContent || '').toLowerCase().trim();
      var value = String(opt.value || '').toLowerCase().trim();
      if (!value) continue;
      if (label === target || value === target || label.indexOf(target) >= 0 || target.indexOf(label) >= 0) {
        matchedValue = opt.value;
        break;
      }
    }
    if (matchedValue) {
      selectEl.value = matchedValue;
      return true;
    }
    return false;
  }

  function populateAddressFieldsFromNominatim(addr, forceOverwrite) {
    var mapped = parseNominatimAddress(addr);
    var physicalAddressEl = document.getElementById('physicalAddress');
    var areaNameEl = document.getElementById('areaName');
    var districtEl = document.getElementById('district');
    var municipalityEl = document.getElementById('localMunicipality');
    var postCodeEl = document.getElementById('physicalPostCode');

    if (physicalAddressEl && mapped.physicalAddress && (forceOverwrite || !physicalAddressEl.value.trim())) {
      physicalAddressEl.value = mapped.physicalAddress;
    }
    if (areaNameEl && mapped.areaName && (forceOverwrite || !areaNameEl.value.trim())) {
      areaNameEl.value = mapped.areaName;
    }
    if (postCodeEl && mapped.postCode && (forceOverwrite || !postCodeEl.value.trim())) {
      postCodeEl.value = mapped.postCode;
    }
    if (districtEl && mapped.district) {
      var districtMatched = setSelectValueByText(districtEl, mapped.district);
      if (districtMatched) {
        updateLocalMunicipalityOptions();
      }
    }
    if (municipalityEl && mapped.localMunicipality) {
      setSelectValueByText(municipalityEl, mapped.localMunicipality);
    }
  }

  function reverseGeocodeAndPopulate(lat, lon, forceOverwrite) {
    var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon);
    return fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(function (res) { return res.json(); })
      .then(function (payload) {
        if (payload && payload.address) {
          populateAddressFieldsFromNominatim(payload.address, !!forceOverwrite);
          var physicalAddressEl = document.getElementById('physicalAddress');
          if (physicalAddressEl && payload.display_name && (!!forceOverwrite || !physicalAddressEl.value.trim())) {
            physicalAddressEl.value = payload.display_name;
          }
        }
      })
      .catch(function () {
        // Non-blocking: coordinates are already captured even if reverse lookup fails.
      });
  }

  function useCurrentLocationOnMap() {
    if (!navigator.geolocation) {
      setAddressMapStatus('Geolocation is not supported by this browser.', true);
      return;
    }
    if (!ensureAddressMap()) {
      setAddressMapStatus('Map could not be loaded in this browser.', true);
      return;
    }

    setAddressMapStatus('Getting your current location...');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var accuracyM = pos.coords.accuracy;

      var gpsLat = document.getElementById('gpsLatitude');
      var gpsLon = document.getElementById('gpsLongitude');
      if (gpsLat) gpsLat.value = lat.toFixed(6);
      if (gpsLon) gpsLon.value = lon.toFixed(6);
      clearAddressCandidates();
      applyResolvedLocation(lat, lon, 'Current location');
      reverseGeocodeAndPopulate(lat, lon).finally(function () {
        setAddressMapStatus('Current location captured. GPS and address fields were auto-filled (accuracy approx. ±' + Math.round(accuracyM || 0) + 'm).');
      });
    }, function () {
      setAddressMapStatus('Could not access your location. Please allow location permission and try again.', true);
    }, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    });
  }

  var biosecRadios = document.querySelectorAll('input[name="biosecurityOption"]');
  var biosecUploadWrap = document.getElementById('biosecUploadWrap');
  var biosecTemplateWrap = document.getElementById('biosecTemplateWrap');

  function updateBiosecVisibility() {
    var selected = document.querySelector('input[name="biosecurityOption"]:checked');
    var val = selected ? selected.value : 'template';
    if (biosecUploadWrap) biosecUploadWrap.style.display = val === 'upload' ? 'block' : 'none';
    if (biosecTemplateWrap) biosecTemplateWrap.style.display = val === 'template' ? 'block' : 'none';
  }

  biosecRadios.forEach(function (r) {
    r.addEventListener('change', updateBiosecVisibility);
  });
  updateBiosecVisibility();

  var biosecFarmNameEl = document.getElementById('biosecFarmName');
  var mainFarmNameEl = document.getElementById('farmName');
  if (biosecFarmNameEl && mainFarmNameEl) {
    function syncBiosecFarmName() {
      if (!biosecFarmNameEl.dataset.userEdited) {
        biosecFarmNameEl.value = mainFarmNameEl.value;
      }
    }
    mainFarmNameEl.addEventListener('input', syncBiosecFarmName);
    mainFarmNameEl.addEventListener('change', syncBiosecFarmName);
    biosecFarmNameEl.addEventListener('input', function () {
      biosecFarmNameEl.dataset.userEdited = '1';
    });
    syncBiosecFarmName();
  }

  var locateAddressBtn = document.getElementById('btnLocateAddress');
  if (locateAddressBtn) {
    locateAddressBtn.addEventListener('click', geocodeAddressToMap);
  }
  var useCurrentLocationBtn = document.getElementById('btnUseCurrentLocation');
  if (useCurrentLocationBtn) {
    useCurrentLocationBtn.addEventListener('click', useCurrentLocationOnMap);
  }

  function triggerManualAddressLookup() {
    if (manualAddressLookupTimer) clearTimeout(manualAddressLookupTimer);
    manualAddressLookupTimer = setTimeout(function () {
      var query = buildAddressQuery();
      if (!query || query.length < 10) return;
      geocodeAddressToMap();
    }, 900);
  }

  var physicalAddressEl = document.getElementById('physicalAddress');
  var localMunicipalityEl = document.getElementById('localMunicipality');
  var districtEl = document.getElementById('district');
  var physicalPostCodeEl = document.getElementById('physicalPostCode');

  [physicalAddressEl, localMunicipalityEl, districtEl, physicalPostCodeEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', triggerManualAddressLookup);
    el.addEventListener('change', triggerManualAddressLookup);
    el.addEventListener('blur', triggerManualAddressLookup);
  });

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

