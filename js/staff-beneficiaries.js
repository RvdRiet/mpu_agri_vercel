(function () {
  'use strict';

  var staff = window.FarmStaffAuth && FarmStaffAuth.requireStaff('staff-login.html?return=staff-beneficiaries.html');
  if (!staff) return;

  var DATA_URL = 'data/beneficiaries-sab-2024-25.json';
  var PAGE_SIZE = 50;
  var SEARCH_DEBOUNCE_MS = 200;

  var allRows = [];
  var meta = {};
  var filtered = [];
  var currentPage = 1;
  var searchTimer = null;

  var el = {
    loading: document.getElementById('beneficiaryLoading'),
    resultsSection: document.getElementById('beneficiaryResultsSection'),
    search: document.getElementById('beneficiarySearch'),
    district: document.getElementById('beneficiaryDistrictFilter'),
    hint: document.getElementById('beneficiarySearchHint'),
    stats: document.getElementById('beneficiaryStats'),
    resultCount: document.getElementById('beneficiaryResultCount'),
    tableWrap: document.getElementById('beneficiaryTableWrap'),
    tableBody: document.getElementById('beneficiaryTableBody'),
    cards: document.getElementById('beneficiaryCards'),
    empty: document.getElementById('beneficiaryEmpty'),
    pagination: document.getElementById('beneficiaryPagination'),
    detailPanel: document.getElementById('beneficiaryDetailPanel'),
    detailBackdrop: document.getElementById('beneficiaryDetailBackdrop'),
    detailClose: document.getElementById('beneficiaryDetailClose'),
    detailTitle: document.getElementById('beneficiaryDetailTitle'),
    detailSubtitle: document.getElementById('beneficiaryDetailSubtitle'),
    detailBody: document.getElementById('beneficiaryDetailBody'),
    logout: document.getElementById('btnBeneficiariesLogout')
  };

  function esc(v) {
    if (window.FarmSecurity && typeof FarmSecurity.escapeHtml === 'function') return FarmSecurity.escapeHtml(v);
    if (v == null) return '';
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatMoney(n) {
    var num = typeof n === 'number' ? n : parseFloat(n);
    if (isNaN(num)) return '—';
    return num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function normalizeQuery(q) {
    return String(q || '').trim().toLowerCase();
  }

  function queryDigits(q) {
    return String(q || '').replace(/\D/g, '');
  }

  function canSearch(q) {
    q = String(q || '').trim();
    if (!q) return false;
    if (queryDigits(q).length >= 3) return true;
    return q.length >= 2;
  }

  function matchesRow(row, q) {
    var text = normalizeQuery(q);
    var digits = queryDigits(q);
    if (digits.length >= 3 && row.idNumber.indexOf(digits) !== -1) return true;
    if (!text) return false;
    var name = (row.name || '').toLowerCase();
    var surname = (row.surname || '').toLowerCase();
    if (name.indexOf(text) !== -1) return true;
    if (surname.indexOf(text) !== -1) return true;
    if ((name + ' ' + surname).indexOf(text) !== -1) return true;
    if ((surname + ' ' + name).indexOf(text) !== -1) return true;
    return false;
  }

  function matchesDistrict(row, district) {
    if (!district || district === 'all') return true;
    return (row.districtMunicipality || '').toLowerCase() === district.toLowerCase();
  }

  function runSearch() {
    var q = el.search ? el.search.value : '';
    var district = el.district ? el.district.value : 'all';

    if (!canSearch(q)) {
      filtered = [];
      currentPage = 1;
      renderResults(false);
      if (el.hint) {
        el.hint.hidden = false;
        el.hint.textContent = 'Type at least 2 letters or 3 digits of an ID to search' +
          (meta.count ? ' across ' + meta.count.toLocaleString('en-ZA') + ' records.' : '.');
      }
      return;
    }

    filtered = allRows.filter(function (row) {
      return matchesRow(row, q) && matchesDistrict(row, district);
    });
    currentPage = 1;
    if (el.hint) el.hint.hidden = true;
    renderResults(true);
  }

  function renderStats() {
    if (!el.stats) return;
    el.stats.innerHTML =
      '<button type="button" class="staff-stat" disabled>' +
        '<span class="staff-stat__value">' + (meta.count || 0).toLocaleString('en-ZA') + '</span>' +
        '<span class="staff-stat__label">Total beneficiaries</span>' +
      '</button>' +
      '<button type="button" class="staff-stat" disabled>' +
        '<span class="staff-stat__value">' + esc(meta.financialYear || '2024-25') + '</span>' +
        '<span class="staff-stat__label">Financial year</span>' +
      '</button>' +
      '<button type="button" class="staff-stat" disabled>' +
        '<span class="staff-stat__value">SAB Boxes</span>' +
        '<span class="staff-stat__label">Programme</span>' +
      '</button>';
  }

  function populateDistricts() {
    if (!el.district) return;
    var set = {};
    allRows.forEach(function (row) {
      if (row.districtMunicipality) set[row.districtMunicipality] = true;
    });
    var list = Object.keys(set).sort(function (a, b) { return a.localeCompare(b); });
    list.forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      el.district.appendChild(opt);
    });
  }

  function pageSlice() {
    var start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }

  function totalPages() {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }

  function renderResults(hasQuery) {
    if (el.loading) el.loading.hidden = true;
    if (!el.resultsSection) return;

    if (!hasQuery) {
      el.resultsSection.hidden = true;
      return;
    }

    el.resultsSection.hidden = false;
    var pageRows = pageSlice();
    var total = filtered.length;

    if (el.resultCount) {
      el.resultCount.textContent = total.toLocaleString('en-ZA') + (total === 1 ? ' match' : ' matches');
    }

    var isEmpty = total === 0;
    if (el.empty) el.empty.hidden = !isEmpty;
    if (el.tableWrap) el.tableWrap.hidden = isEmpty;
    if (el.cards) el.cards.hidden = isEmpty;
    if (el.pagination) el.pagination.hidden = isEmpty || totalPages() <= 1;

    if (isEmpty) {
      if (el.tableBody) el.tableBody.innerHTML = '';
      if (el.cards) el.cards.innerHTML = '';
      return;
    }

    if (el.tableBody) {
      el.tableBody.innerHTML = pageRows.map(function (row, i) {
        var idx = (currentPage - 1) * PAGE_SIZE + i;
        return '<tr>' +
          '<td>' + esc(row.surname) + '</td>' +
          '<td>' + esc(row.name) + '</td>' +
          '<td><code class="staff-beneficiaries-id">' + esc(row.idDisplay || row.idNumber) + '</code></td>' +
          '<td>' + esc(row.area) + '</td>' +
          '<td>' + esc(row.districtMunicipality) + '</td>' +
          '<td>' + esc(row.quantityBoxes) + '</td>' +
          '<td>R ' + esc(formatMoney(row.totalCost)) + '</td>' +
          '<td><button type="button" class="staff-portal-btn staff-portal-btn--outline staff-beneficiaries-view-btn" data-index="' + idx + '">View</button></td>' +
        '</tr>';
      }).join('');
    }

    if (el.cards) {
      el.cards.innerHTML = pageRows.map(function (row, i) {
        var idx = (currentPage - 1) * PAGE_SIZE + i;
        return '<article class="staff-beneficiaries-card">' +
          '<h3>' + esc(row.name) + ' ' + esc(row.surname) + '</h3>' +
          '<p class="staff-beneficiaries-card__id"><strong>ID:</strong> ' + esc(row.idDisplay || row.idNumber) + '</p>' +
          '<p><strong>Area:</strong> ' + esc(row.area) + ', ' + esc(row.districtMunicipality) + '</p>' +
          '<p><strong>Boxes:</strong> ' + esc(row.quantityBoxes) + ' · <strong>Total:</strong> R ' + esc(formatMoney(row.totalCost)) + '</p>' +
          '<button type="button" class="staff-portal-btn staff-portal-btn--outline staff-beneficiaries-view-btn" data-index="' + idx + '">View details</button>' +
        '</article>';
      }).join('');
    }

    renderPagination();
  }

  function renderPagination() {
    if (!el.pagination) return;
    var pages = totalPages();
    if (pages <= 1) {
      el.pagination.hidden = true;
      return;
    }
    el.pagination.hidden = false;
    var html = '';
    if (currentPage > 1) {
      html += '<button type="button" class="staff-portal-btn staff-portal-btn--outline" data-page="' + (currentPage - 1) + '">Previous</button>';
    }
    html += '<span class="staff-beneficiaries-pagination__info">Page ' + currentPage + ' of ' + pages + '</span>';
    if (currentPage < pages) {
      html += '<button type="button" class="staff-portal-btn staff-portal-btn--outline" data-page="' + (currentPage + 1) + '">Next</button>';
    }
    el.pagination.innerHTML = html;
  }

  function detailField(label, value) {
    return '<div class="staff-beneficiaries-detail-field">' +
      '<dt>' + esc(label) + '</dt>' +
      '<dd>' + esc(value || '—') + '</dd>' +
    '</div>';
  }

  function openDetail(index) {
    var row = filtered[index];
    if (!row || !el.detailPanel) return;
    el.detailTitle.textContent = (row.name + ' ' + row.surname).trim() || 'Beneficiary';
    el.detailSubtitle.textContent = (row.programme || meta.programme || 'SAB Boxes') + ' · ' + (meta.financialYear || '2024-25');
    el.detailBody.innerHTML = '<dl class="staff-beneficiaries-detail-grid">' +
      detailField('Surname', row.surname) +
      detailField('Name', row.name) +
      detailField('ID number', row.idDisplay || row.idNumber) +
      detailField('Contact', row.contact) +
      detailField('Gender', row.gender) +
      detailField('Province', row.province) +
      detailField('District municipality', row.districtMunicipality) +
      detailField('Local municipality', row.localMunicipality) +
      detailField('Area', row.area) +
      detailField('Commodity', row.commodity) +
      detailField('Quantity of boxes', row.quantityBoxes) +
      detailField('Total cost (R)', 'R ' + formatMoney(row.totalCost)) +
    '</dl>';
    el.detailPanel.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    if (!el.detailPanel) return;
    el.detailPanel.hidden = true;
    document.body.style.overflow = '';
  }

  function scheduleSearch() {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, SEARCH_DEBOUNCE_MS);
  }

  function bindEvents() {
    if (el.search) {
      el.search.addEventListener('input', scheduleSearch);
      el.search.addEventListener('search', runSearch);
    }
    if (el.district) el.district.addEventListener('change', runSearch);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.staff-beneficiaries-view-btn');
      if (btn) {
        var index = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(index)) openDetail(index);
        return;
      }
      var pageBtn = e.target.closest('[data-page]');
      if (pageBtn && el.pagination && el.pagination.contains(pageBtn)) {
        currentPage = parseInt(pageBtn.getAttribute('data-page'), 10) || 1;
        renderResults(true);
        if (el.resultsSection) el.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    if (el.detailBackdrop) el.detailBackdrop.addEventListener('click', closeDetail);
    if (el.detailClose) el.detailClose.addEventListener('click', closeDetail);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.detailPanel && !el.detailPanel.hidden) closeDetail();
    });

    if (el.logout) {
      el.logout.addEventListener('click', function () {
        if (window.FarmStaffAuth) FarmStaffAuth.logout();
        window.location.href = 'staff-login.html';
      });
    }
  }

  function loadData() {
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load beneficiary data');
        return res.json();
      })
      .then(function (data) {
        meta = {
          programme: data.programme,
          financialYear: data.financialYear,
          count: data.count || (data.beneficiaries && data.beneficiaries.length) || 0
        };
        allRows = data.beneficiaries || [];
        if (el.hint) {
          el.hint.textContent = 'Type at least 2 letters or 3 digits of an ID to search across ' +
            meta.count.toLocaleString('en-ZA') + ' records.';
        }
        renderStats();
        populateDistricts();
        if (el.loading) el.loading.hidden = true;
      })
      .catch(function () {
        if (el.loading) {
          el.loading.innerHTML = '<p>Could not load the beneficiary register. Ensure <code>data/beneficiaries-sab-2024-25.json</code> exists (run <code>npm run beneficiaries:import</code> after updating the Excel file).</p>';
        }
      });
  }

  bindEvents();
  loadData();
})();
