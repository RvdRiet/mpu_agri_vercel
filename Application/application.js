(function () {
  var form = document.getElementById('applicationForm');
  var panels = document.querySelectorAll('.app-step-panel');
  var steps = document.querySelectorAll('.app-step');
  var currentStep = 1;
  var totalSteps = 7;

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

  function updateSummary() {
    var commodity = document.getElementById('commodity');
    var category = document.querySelector('input[name="farmerCategory"]:checked');
    var project = document.getElementById('registeredName');

    var summaryCommodity = document.getElementById('summaryCommodity');
    var summaryCategory = document.getElementById('summaryCategory');
    var summaryProject = document.getElementById('summaryProject');

    if (summaryCommodity) summaryCommodity.textContent = commodity && commodity.value ? commodity.value : '—';
    if (summaryCategory) summaryCategory.textContent = category ? category.value : '—';
    if (summaryProject) summaryProject.textContent = project && project.value ? project.value : '—';
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
      if (next === '7') updateSummary();
      showPanel(next);
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
      if (el.type === 'radio' || el.type === 'checkbox') {
        if (el.checked) details[name] = el.value;
      } else {
        details[name] = el.value || '';
      }
    }
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
    var commodityEl = document.getElementById('commodity');
    var categoryEl = document.querySelector('input[name="farmerCategory"]:checked');
    var registeredEl = document.getElementById('registeredName');
    var farmNameEl = document.getElementById('farmName');
    var application = {
      status: 'Submitted',
      summary: {
        commodity: commodityEl && commodityEl.value ? commodityEl.value : '—',
        farmerCategory: categoryEl ? categoryEl.value : '—',
        registeredName: registeredEl && registeredEl.value ? registeredEl.value : '—',
        farmName: farmNameEl && farmNameEl.value ? farmNameEl.value : '—'
      },
      details: serializeFormDetails(form)
    };
    if (window.FarmApplications) {
      FarmApplications.saveApplication(user.id, application);
    }
    window.location.href = '../track.html';
  });

  steps.forEach(function (step) {
    step.addEventListener('click', function () {
      var n = parseInt(step.getAttribute('data-step'), 10);
      if (n <= currentStep || step.classList.contains('completed')) showPanel(n);
    });
  });

  showPanel(1);
})();
