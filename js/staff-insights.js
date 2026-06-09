(function () {
  'use strict';

  var staff = window.FarmStaffAuth && FarmStaffAuth.getCurrentStaff();
  if (!staff) {
    window.location.href = 'staff-login.html';
    return;
  }

  var charts = [];
  var selectedMonth = new Date().toISOString().slice(0, 7);
  var CHART_COLORS = {
    primary: '#2d5a27',
    primaryLight: '#4a7c43',
    teal: '#0d9488',
    amber: '#d97706',
    blue: '#2563eb',
    rose: '#e11d48',
    violet: '#7c3aed',
    slate: '#64748b',
    palette: ['#2d5a27', '#0d9488', '#d97706', '#2563eb', '#7c3aed', '#e11d48', '#64748b', '#16a34a']
  };

  function esc(v) {
    if (window.FarmSecurity && typeof FarmSecurity.escapeHtml === 'function') return FarmSecurity.escapeHtml(v);
    if (v == null) return '';
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatMonthLabel(month) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) return month || '';
    var parts = month.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    return d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  }

  function formatType(type) {
    if (type === 'mesp_2025_26') return 'MESP 2025/26';
    if (type === 'livestock') return 'Livestock';
    if (type === 'crop') return 'Crop';
    if (type === 'environmental') return 'Environmental';
    return type || 'Other';
  }

  function statusClass(status) {
    var s = String(status || '').toLowerCase();
    if (s === 'approved') return 'insights-status--approved';
    if (s === 'rejected' || s === 'denied') return 'insights-status--rejected';
    if (s === 'submitted') return 'insights-status--submitted';
    return 'insights-status--review';
  }

  function destroyCharts() {
    charts.forEach(function (c) {
      try { c.destroy(); } catch (e) {}
    });
    charts = [];
  }

  function sortedObjectEntries(obj, limit) {
    return Object.keys(obj || {})
      .map(function (k) { return { key: k, value: obj[k] }; })
      .sort(function (a, b) { return b.value - a.value; })
      .slice(0, limit || 99);
  }

  function daysInMonth(month) {
    var parts = month.split('-');
    var year = parseInt(parts[0], 10);
    var mon = parseInt(parts[1], 10);
    var count = new Date(year, mon, 0).getDate();
    var buckets = [];
    for (var d = 1; d <= count; d++) {
      var day = new Date(year, mon - 1, d);
      var key = month + '-' + String(d).padStart(2, '0');
      buckets.push({
        key: key,
        label: day.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
      });
    }
    return buckets;
  }

  function chartDefaults() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: 'Inter', size: 11 }, padding: 14, usePointStyle: true }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 10 }, maxRotation: 45 }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { font: { family: 'Inter', size: 10 }, precision: 0 }
        }
      }
    };
  }

  function makeChart(canvasId, config) {
    var el = document.getElementById(canvasId);
    if (!el || !window.Chart) return null;
    var chart = new Chart(el, config);
    charts.push(chart);
    return chart;
  }

  function renderKpis(data, month) {
    var el = document.getElementById('insightsKpiGrid');
    if (!el) return;
    var pv = data.pageViews || {};
    var app = data.applications || {};
    var reg = data.registrations || {};
    var issues = data.issues || {};
    var monthLabel = formatMonthLabel(month);
    var approvalRate = app.total ? Math.round((app.approved / app.total) * 100) : 0;

    var cards = [
      { icon: '👁️', value: pv.total || 0, label: 'Page views', sub: (pv.uniqueSessions || 0) + ' unique sessions · ' + monthLabel, cls: 'insights-kpi--green' },
      { icon: '📋', value: app.total || 0, label: 'Grant applications', sub: (app.submitted || 0) + ' newly submitted', cls: 'insights-kpi--teal' },
      { icon: '✅', value: app.approved || 0, label: 'Approved grants', sub: approvalRate + '% approval rate', cls: 'insights-kpi--blue' },
      { icon: '⏳', value: app.inReview || 0, label: 'In review', sub: (app.rejected || 0) + ' rejected', cls: 'insights-kpi--amber' },
      { icon: '👥', value: reg.total || 0, label: 'New registrations', sub: monthLabel, cls: 'insights-kpi--violet' },
      { icon: '🛠️', value: issues.open || 0, label: 'Open support issues', sub: (issues.total || 0) + ' reported this month', cls: 'insights-kpi--rose' }
    ];

    el.innerHTML = cards.map(function (c) {
      return '<article class="insights-kpi ' + c.cls + '">'
        + '<div class="insights-kpi__icon" aria-hidden="true">' + c.icon + '</div>'
        + '<div class="insights-kpi__value">' + esc(String(c.value)) + '</div>'
        + '<div class="insights-kpi__label">' + esc(c.label) + '</div>'
        + '<div class="insights-kpi__sub">' + esc(c.sub) + '</div>'
        + '</article>';
    }).join('');
  }

  function renderCharts(data, month) {
    destroyCharts();
    var app = data.applications || {};
    var pv = data.pageViews || {};

    var dayBuckets = daysInMonth(month);
    var appByDay = dayBuckets.map(function (d) { return (app.byDay && app.byDay[d.key]) || 0; });
    var pvByDay = dayBuckets.map(function (d) { return (pv.byDay && pv.byDay[d.key]) || 0; });
    var dayLabels = dayBuckets.map(function (d) { return d.label; });

    makeChart('chartApplicationsTrend', {
      type: 'line',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Applications',
          data: appByDay,
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'rgba(45, 90, 39, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 5
        }]
      },
      options: chartDefaults()
    });

    makeChart('chartPageViewsTrend', {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Page views',
          data: pvByDay,
          backgroundColor: 'rgba(13, 148, 136, 0.65)',
          borderRadius: 4
        }]
      },
      options: chartDefaults()
    });

    var typeEntries = sortedObjectEntries(app.byType);
    makeChart('chartByGrantType', {
      type: 'doughnut',
      data: {
        labels: typeEntries.length ? typeEntries.map(function (e) { return e.key; }) : ['No data'],
        datasets: [{
          data: typeEntries.length ? typeEntries.map(function (e) { return e.value; }) : [1],
          backgroundColor: CHART_COLORS.palette.slice(0, Math.max(typeEntries.length, 1)),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, padding: 12 } } }
      }
    });

    var statusEntries = sortedObjectEntries(app.byStatus);
    makeChart('chartByStatus', {
      type: 'bar',
      data: {
        labels: statusEntries.length ? statusEntries.map(function (e) { return e.key; }) : ['No data'],
        datasets: [{
          label: 'Applications',
          data: statusEntries.length ? statusEntries.map(function (e) { return e.value; }) : [0],
          backgroundColor: ['#3730a3', '#d97706', '#166534', '#991b1b', '#64748b'].slice(0, Math.max(statusEntries.length, 1)),
          borderRadius: 6
        }]
      },
      options: Object.assign({}, chartDefaults(), { indexAxis: 'y' })
    });

    var catCard = document.getElementById('chartByCategory');
    if (catCard) catCard.closest('.insights-chart-card').style.display = '';
    var catEntries = sortedObjectEntries(app.byCategory, 6);
    if (catEntries.length) {
      makeChart('chartByCategory', {
        type: 'polarArea',
        data: {
          labels: catEntries.map(function (e) { return e.key; }),
          datasets: [{
            data: catEntries.map(function (e) { return e.value; }),
            backgroundColor: CHART_COLORS.palette.map(function (c) { return c + '99'; })
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 10 } } } }
        }
      });
    } else if (catCard) {
      catCard.closest('.insights-chart-card').style.display = 'none';
    }
  }

  function renderTopPages(data) {
    var el = document.getElementById('insightsTopPages');
    if (!el) return;
    var entries = sortedObjectEntries((data.pageViews && data.pageViews.byPage) || {}, 8);
    if (!entries.length) {
      el.innerHTML = '<li><span>No page view data yet</span><span>—</span></li>';
      return;
    }
    var max = entries[0].value || 1;
    el.innerHTML = entries.map(function (e) {
      var pct = Math.round((e.value / max) * 100);
      return '<li><span>' + esc(e.key) + '</span>'
        + '<span class="insights-engagement-bar-wrap"><span class="insights-engagement-bar" style="width:' + pct + '%"></span></span>'
        + '<strong>' + esc(String(e.value)) + '</strong></li>';
    }).join('');
  }

  function renderRecentTable(data) {
    var el = document.getElementById('insightsRecentBody');
    if (!el) return;
    var rows = (data.applications && data.applications.recent) || [];
    if (!rows.length) {
      el.innerHTML = '<tr><td colspan="5">No applications submitted this month.</td></tr>';
      return;
    }
    el.innerHTML = rows.map(function (r) {
      return '<tr>'
        + '<td><span class="insights-type-pill">' + esc(formatType(r.type)) + '</span></td>'
        + '<td>' + esc(r.name) + '</td>'
        + '<td><span class="insights-status ' + statusClass(r.status) + '">' + esc(r.status || 'Submitted') + '</span></td>'
        + '<td>' + esc(formatDate(r.submittedAt)) + '</td>'
        + '<td><code style="font-size:0.75rem">' + esc(r.id || '—') + '</code></td>'
        + '</tr>';
    }).join('');
  }

  function renderEngagementExtras(data, month) {
    var feedbackEl = document.getElementById('insightsFeedbackStat');
    if (feedbackEl) {
      var fb = data.feedback || {};
      feedbackEl.textContent = fb.total
        ? fb.total + ' submissions · avg ' + (fb.averageRating || '—') + ' ★'
        : 'No feedback submissions this month';
    }
    var metaEl = document.getElementById('insightsGeneratedAt');
    if (metaEl) {
      var updated = (data.meta && data.meta.updatedAt) || data.generatedAt;
      metaEl.textContent = formatMonthLabel(month) + ' report'
        + (updated ? ' · last updated ' + new Date(updated).toLocaleString('en-ZA') : '');
    }
    var staffNameEl = document.getElementById('insightsStaffName');
    if (staffNameEl) staffNameEl.textContent = staff.name || staff.username;
  }

  function showDashboard(data, month) {
    document.getElementById('insightsLoading').hidden = true;
    document.getElementById('insightsContent').hidden = false;
    renderKpis(data, month);
    renderCharts(data, month);
    renderTopPages(data);
    renderRecentTable(data);
    renderEngagementExtras(data, month);
  }

  function showError(message) {
    document.getElementById('insightsLoading').hidden = false;
    document.getElementById('insightsContent').hidden = true;
    document.getElementById('insightsLoading').innerHTML = '<p>' + esc(message) + ' <button type="button" class="btn-outline" id="insightsRetry">Retry</button></p>';
    var retry = document.getElementById('insightsRetry');
    if (retry) retry.addEventListener('click', loadDashboard);
  }

  function populateMonthSelect(months) {
    var select = document.getElementById('insightsMonthSelect');
    if (!select) return;
    var list = (months && months.length) ? months.slice() : [selectedMonth];
    if (list.indexOf(selectedMonth) === -1) list.unshift(selectedMonth);
    select.innerHTML = list.map(function (m) {
      return '<option value="' + esc(m) + '"' + (m === selectedMonth ? ' selected' : '') + '>' + esc(formatMonthLabel(m)) + '</option>';
    }).join('');
  }

  function loadDashboard() {
    if (!window.FarmAnalytics) {
      showError('Analytics module failed to load.');
      return;
    }
    if (!FarmStaffAuth.getApiToken()) {
      var warn = document.getElementById('insightsAuthWarning');
      if (warn) warn.hidden = false;
    }

    document.getElementById('insightsLoading').hidden = false;
    document.getElementById('insightsContent').hidden = true;
    document.getElementById('insightsLoading').innerHTML = '<p>Loading analytics…</p>';
    destroyCharts();

    var select = document.getElementById('insightsMonthSelect');
    selectedMonth = (select && select.value) ? select.value : selectedMonth;

    FarmAnalytics.fetchMonthReport(selectedMonth)
      .then(function (data) {
        showDashboard(data, selectedMonth);
      })
      .catch(function () {
        showError('Could not load analytics for ' + formatMonthLabel(selectedMonth) + '. Check your staff login and API server.');
      });
  }

  function initMonths() {
    if (!window.FarmAnalytics || !FarmStaffAuth.getApiToken()) {
      populateMonthSelect([selectedMonth]);
      loadDashboard();
      return;
    }
    FarmAnalytics.fetchAvailableMonths()
      .then(function (data) {
        populateMonthSelect(data.months || []);
        loadDashboard();
      })
      .catch(function () {
        populateMonthSelect([selectedMonth]);
        loadDashboard();
      });
  }

  document.getElementById('btnInsightsRefresh').addEventListener('click', loadDashboard);
  document.getElementById('btnInsightsLogout').addEventListener('click', function () {
    if (window.FarmStaffAuth) FarmStaffAuth.logout();
    window.location.href = 'staff-login.html';
  });

  var monthSelect = document.getElementById('insightsMonthSelect');
  if (monthSelect) {
    monthSelect.addEventListener('change', function () {
      selectedMonth = monthSelect.value;
      loadDashboard();
    });
  }

  document.getElementById('btnInsightsDownloadCsv').addEventListener('click', function () {
    if (!window.FarmAnalytics) return;
    var month = monthSelect ? monthSelect.value : selectedMonth;
    FarmAnalytics.downloadMonthReport(month, 'csv').catch(function () {
      alert('CSV download failed. Log in again and ensure the API is running.');
    });
  });

  document.getElementById('btnInsightsDownloadJson').addEventListener('click', function () {
    if (!window.FarmAnalytics) return;
    var month = monthSelect ? monthSelect.value : selectedMonth;
    FarmAnalytics.downloadMonthReport(month, 'json').catch(function () {
      alert('JSON download failed. Log in again and ensure the API is running.');
    });
  });

  initMonths();
})();
