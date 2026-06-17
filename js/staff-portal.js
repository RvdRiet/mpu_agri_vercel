(function () {
  'use strict';

  var staff = window.FarmStaffAuth && FarmStaffAuth.getCurrentStaff();
  if (!staff) {
    window.location.href = 'staff-login.html';
    return;
  }

  var PROCEDURE_STAGES = [
    'Submitted',
    'Profiling and Shortlisting',
    'Farm Assessment',
    'HOD Approval',
    'Induction',
    'Procurement',
    'Pre and Post Delivery Inspection',
    'Monitoring Evaluation and Advisory',
    'Approved'
  ];

  var TERMINAL_STATUSES = { Approved: true, Rejected: true, Denied: true };

  var allItems = [];
  var mapInstance = null;
  var markerLayer = null;
  var activeReview = null;
  var activeFilter = 'all';
  var activeProgramme = 'all';
  var searchQuery = '';
  var pendingAction = null;

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
    return d.toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatShortDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatLabel(key) {
    return String(key || '').replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function getGrantType(app) {
    var t = (app && app.type) || '';
    if (t === 'mesp_2025_26') return { key: 'mesp_2025_26', label: 'Masibuyele 2025/26', short: 'MESP' };
    if (t === 'livestock') return { key: 'livestock', label: 'Livestock Grant', short: 'Livestock' };
    if (t === 'crop') return { key: 'crop', label: 'Crop Grant', short: 'Crop' };
    if (t === 'environmental') return { key: 'environmental', label: 'Environmental Grant', short: 'Environmental' };
    return { key: 'other', label: 'Other', short: 'Other' };
  }

  function statusClass(status) {
    var v = String(status || '').toLowerCase();
    if (v === 'approved') return 'staff-status-approved';
    if (v === 'rejected' || v === 'denied') return 'staff-status-rejected';
    if (v === 'additional documentation required') return 'staff-status-docs-required';
    if (v.indexOf('review') !== -1 || v.indexOf('assessment') !== -1 || v.indexOf('approval') !== -1 || v.indexOf('induction') !== -1 || v.indexOf('procurement') !== -1 || v.indexOf('inspection') !== -1 || v.indexOf('monitoring') !== -1 || v.indexOf('profiling') !== -1 || v.indexOf('shortlisting') !== -1) return 'staff-status-under-review';
    return 'staff-status-submitted';
  }

  function filterCategory(status) {
    var s = String(status || 'Submitted');
    if (s === 'Submitted') return 'submitted';
    if (s === 'Additional Documentation Required') return 'docs';
    if (s === 'Approved') return 'approved';
    if (s === 'Rejected' || s === 'Denied') return 'rejected';
    if (PROCEDURE_STAGES.indexOf(s) > 0) return 'in-progress';
    return 'in-progress';
  }

  function applicantName(item) {
    var sum = (item.application && item.application.summary) || {};
    var det = (item.application && item.application.details) || {};
    return sum.registeredName || det.registeredName || det.applicantName || det.fullName || item.userId || 'Unknown applicant';
  }

  function farmName(item) {
    var sum = (item.application && item.application.summary) || {};
    var det = (item.application && item.application.details) || {};
    return sum.farmName || det.farmName || '—';
  }

  function nextProcedureStage(current) {
    var idx = PROCEDURE_STAGES.indexOf(current || 'Submitted');
    if (idx < 0) return PROCEDURE_STAGES[1];
    if (idx >= PROCEDURE_STAGES.length - 1) return null;
    return PROCEDURE_STAGES[idx + 1];
  }

  function stageIndex(status) {
    var idx = PROCEDURE_STAGES.indexOf(status || 'Submitted');
    return idx < 0 ? 0 : idx;
  }

  function isTerminal(status) {
    return !!TERMINAL_STATUSES[status] || status === 'Rejected';
  }

  function renderValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.map(function (v) { return esc(v); }).join(', ');
    if (typeof value === 'object') return '<pre class="staff-json">' + esc(JSON.stringify(value, null, 2)) + '</pre>';
    return esc(value);
  }

  function renderDetails(details) {
    var keys = Object.keys(details || {}).sort();
    if (!keys.length) return '<p class="staff-review-empty">No additional fields captured.</p>';
    var html = '<dl class="staff-detail-dl">';
    keys.forEach(function (key) {
      html += '<dt>' + esc(formatLabel(key)) + '</dt><dd>' + renderValue(details[key]) + '</dd>';
    });
    html += '</dl>';
    return html;
  }

  function computeStats(items) {
    var stats = { total: items.length, submitted: 0, inProgress: 0, docs: 0, approved: 0, rejected: 0 };
    items.forEach(function (item) {
      var cat = filterCategory(item.application && item.application.status);
      if (cat === 'submitted') stats.submitted += 1;
      else if (cat === 'in-progress') stats.inProgress += 1;
      else if (cat === 'docs') stats.docs += 1;
      else if (cat === 'approved') stats.approved += 1;
      else if (cat === 'rejected') stats.rejected += 1;
    });
    return stats;
  }

  function renderStats(items) {
    var el = document.getElementById('staffStats');
    if (!el) return;
    var s = computeStats(items);
    var cards = [
      { key: 'all', label: 'All applications', value: s.total, cls: 'staff-stat--all' },
      { key: 'submitted', label: 'Awaiting review', value: s.submitted, cls: 'staff-stat--submitted' },
      { key: 'in-progress', label: 'In progress', value: s.inProgress, cls: 'staff-stat--progress' },
      { key: 'docs', label: 'Docs required', value: s.docs, cls: 'staff-stat--docs' },
      { key: 'approved', label: 'Approved', value: s.approved, cls: 'staff-stat--approved' },
      { key: 'rejected', label: 'Rejected', value: s.rejected, cls: 'staff-stat--rejected' }
    ];
    el.innerHTML = cards.map(function (c) {
      return '<button type="button" class="staff-stat ' + c.cls + (activeFilter === c.key ? ' is-active' : '') + '" data-filter="' + c.key + '">'
        + '<span class="staff-stat__value">' + esc(String(c.value)) + '</span>'
        + '<span class="staff-stat__label">' + esc(c.label) + '</span>'
        + '</button>';
    }).join('');
  }

  function matchesFilters(item) {
    var app = item.application || {};
    var status = app.status || 'Submitted';
    if (activeFilter !== 'all' && filterCategory(status) !== activeFilter) return false;
    if (activeProgramme !== 'all' && getGrantType(app).key !== activeProgramme) return false;
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      var hay = [
        app.id, item.userId, applicantName(item), farmName(item),
        status, getGrantType(app).label
      ].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function filteredItems() {
    return allItems.filter(matchesFilters);
  }

  function renderStageStepper(status) {
    var current = status || 'Submitted';
    var isRejected = current === 'Rejected' || current === 'Denied';
    var isDocs = current === 'Additional Documentation Required';
    var idx = stageIndex(isRejected || isDocs ? 'Submitted' : (current === 'Approved' ? 'Approved' : current));

    var html = '<ol class="staff-stepper" aria-label="Application workflow">';
    PROCEDURE_STAGES.forEach(function (stage, i) {
      var state = 'upcoming';
      var extra = '';
      if (isRejected) {
        if (i === 0) { state = 'current'; extra = ' staff-step--rejected'; }
      } else if (isDocs && i === 0) {
        state = 'current';
        extra = ' staff-step--docs';
      } else if (i < idx) {
        state = 'complete';
      } else if (i === idx) {
        state = 'current';
      }
      html += '<li class="staff-step staff-step--' + state + extra + '"><span class="staff-step__dot"></span><span class="staff-step__label">' + esc(stage) + '</span></li>';
    });
    html += '</ol>';
    return html;
  }

  function renderOverviewCards(userId, app) {
    var summary = app.summary || {};
    var details = app.details || {};
    var fields = [
      { label: 'Applicant / project', value: summary.registeredName || details.registeredName },
      { label: 'Farmer category', value: summary.farmerCategory || details.farmerCategory },
      { label: 'Commodity / programme', value: summary.commodity || details.commodity },
      { label: 'Farm name', value: summary.farmName || details.farmName },
      { label: 'District', value: details.district || details.municipality },
      { label: 'Contact', value: details.contactPhone || details.phone || details.cellphone },
      { label: 'Email', value: details.contactEmail || details.email },
      { label: 'GPS', value: details.gpsCoordinates || ((details.gpsLatitude && details.gpsLongitude) ? details.gpsLatitude + ', ' + details.gpsLongitude : '') }
    ];
    return '<div class="staff-overview-grid">' + fields.map(function (f) {
      return '<div class="staff-overview-item"><span class="staff-overview-item__label">' + esc(f.label) + '</span><span class="staff-overview-item__value">' + renderValue(f.value) + '</span></div>';
    }).join('') + '</div>';
  }

  function renderTimeline(app) {
    var history = Array.isArray(app.stageHistory) ? app.stageHistory : [];
    if (!history.length) return '<p class="staff-review-empty">No stage changes recorded yet. Use <strong>Advance to next stage</strong> to begin the workflow trail.</p>';
    return '<ul class="staff-timeline">' + history.slice().reverse().map(function (entry) {
      return '<li class="staff-timeline__item">'
        + '<div class="staff-timeline__marker" aria-hidden="true"></div>'
        + '<div class="staff-timeline__content">'
        + '<p class="staff-timeline__title">' + esc(entry.to || '—') + '</p>'
        + '<p class="staff-timeline__meta">From ' + esc(entry.from || '—') + ' · ' + esc(formatDate(entry.updatedAt)) + ' · ' + esc(entry.updatedBy || 'Staff') + '</p>'
        + (entry.note ? '<p class="staff-timeline__note">' + esc(entry.note) + '</p>' : '')
        + '</div></li>';
    }).join('') + '</ul>';
  }

  function openReviewPanel(item) {
    activeReview = item;
    var app = item.application || {};
    var grant = getGrantType(app);
    var panel = document.getElementById('reviewPanel');
    var body = document.getElementById('reviewPanelBody');
    var title = document.getElementById('reviewPanelTitle');
    var subtitle = document.getElementById('reviewPanelSubtitle');
    var statusEl = document.getElementById('reviewPanelStatus');
    var progressEl = document.getElementById('reviewPanelProgress');
    var actionsEl = document.getElementById('reviewPanelActions');

    if (!panel || !body) return;

    title.textContent = applicantName(item);
    subtitle.textContent = grant.label + ' · Ref ' + (app.id || '—') + ' · Submitted ' + formatShortDate(app.submittedAt);
    statusEl.className = 'staff-status ' + statusClass(app.status);
    statusEl.textContent = app.status || 'Submitted';
    progressEl.innerHTML = renderStageStepper(app.status);

    var html = '';
    if (app.statusMessage) {
      html += '<div class="staff-status-message"><strong>Documentation request:</strong> ' + esc(app.statusMessage) + '</div>';
    }
    if (app.stageEvidenceLatest) {
      html += '<div class="staff-review-note"><strong>Latest stage evidence:</strong> ' + esc(app.stageEvidenceLatest) + '</div>';
    }

    html += '<div class="staff-review-tabs" role="tablist">'
      + '<button type="button" class="staff-review-tab is-active" data-tab="overview">Overview</button>'
      + '<button type="button" class="staff-review-tab" data-tab="timeline">Workflow history</button>'
      + '<button type="button" class="staff-review-tab" data-tab="details">All captured data</button>'
      + '</div>';

    html += '<div class="staff-review-panels">'
      + '<div class="staff-review-panel-section is-active" data-panel="overview">' + renderOverviewCards(item.userId, app) + '</div>'
      + '<div class="staff-review-panel-section" data-panel="timeline">' + renderTimeline(app) + '</div>'
      + '<div class="staff-review-panel-section" data-panel="details">' + renderDetails(app.details) + '</div>'
      + '</div>';

    body.innerHTML = html;

    var terminal = isTerminal(app.status) || app.status === 'Additional Documentation Required';
    var nextStage = nextProcedureStage(app.status);
    var canAdvance = !terminal && nextStage && nextStage !== 'Approved';

    actionsEl.innerHTML = ''
      + '<div class="staff-review-actions__secondary">'
      + '<button type="button" class="staff-btn staff-btn-view" data-review-action="pdf"><span aria-hidden="true">📄</span> Download PDF</button>'
      + '<button type="button" class="staff-btn staff-btn-request-docs" data-review-action="request-docs"' + (app.status === 'Approved' || app.status === 'Rejected' ? ' disabled' : '') + '>Request documentation</button>'
      + '<button type="button" class="staff-btn staff-btn-advance" data-review-action="advance"' + (canAdvance ? '' : ' disabled') + '>Advance to: ' + esc(canAdvance ? nextStage : 'Final stage') + '</button>'
      + '</div>'
      + '<div class="staff-review-actions__decision">'
      + '<button type="button" class="staff-btn staff-btn-deny" data-review-action="reject"' + (app.status === 'Approved' ? ' disabled' : '') + '>Reject application</button>'
      + '<button type="button" class="staff-btn staff-btn-approve" data-review-action="approve"' + (app.status === 'Approved' ? ' disabled' : '') + '>Approve application</button>'
      + '</div>';

    panel.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeReviewPanel() {
    var panel = document.getElementById('reviewPanel');
    if (panel) panel.hidden = true;
    document.body.style.overflow = '';
    activeReview = null;
  }

  function openActionModal(config) {
    pendingAction = config;
    document.getElementById('actionModalTitle').textContent = config.title;
    document.getElementById('actionModalDesc').textContent = config.description || '';
    var field = document.getElementById('actionModalInput');
    field.value = config.defaultValue || '';
    field.placeholder = config.placeholder || '';
    field.required = !!config.required;
    document.getElementById('actionModalLabel').textContent = config.inputLabel || 'Note';
    document.getElementById('actionModal').hidden = false;
    field.focus();
  }

  function closeActionModal() {
    document.getElementById('actionModal').hidden = true;
    pendingAction = null;
  }

  function setStatus(userId, appId, status, extra) {
    if (!window.FarmApplications) return Promise.resolve();
    return FarmApplications.updateApplicationStatus(userId, appId, status, extra || {}).then(function () {
      return loadAll().then(function () {
        if (activeReview && activeReview.userId === userId && activeReview.application.id === appId) {
          var updated = findItem(userId, appId);
          if (updated) openReviewPanel(updated);
        }
      });
    });
  }

  function advanceStage(item, evidenceNote) {
    var app = item.application;
    var next = nextProcedureStage(app.status || 'Submitted');
    if (!next) return;
    var history = Array.isArray(app.stageHistory) ? app.stageHistory.slice() : [];
    history.push({
      from: app.status || 'Submitted',
      to: next,
      note: evidenceNote,
      updatedBy: staff.name || staff.username || 'Staff',
      updatedAt: new Date().toISOString()
    });
    return setStatus(item.userId, app.id, next, {
      stageHistory: history,
      stageEvidenceLatest: evidenceNote
    });
  }

  function buildPdfRows(userId, app) {
    var rows = [
      ['Reference', app.id || '—'],
      ['Applicant ID', userId || '—'],
      ['Submitted', formatDate(app.submittedAt)],
      ['Status', app.status || 'Submitted'],
      ['Application Type', app.type || '—']
    ];
    var summary = app.summary || {};
    Object.keys(summary).sort().forEach(function (k) { rows.push(['Summary: ' + formatLabel(k), String(summary[k] || '—')]); });
    var details = app.details || {};
    Object.keys(details).sort().forEach(function (k) { rows.push(['Detail: ' + formatLabel(k), typeof details[k] === 'object' ? JSON.stringify(details[k]) : String(details[k] || '—')]); });
    return rows;
  }

  function downloadApplicationPdf(userId, app) {
    if (!window.jspdf || !window.jspdf.jsPDF) return alert('PDF library unavailable.');
    var doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    var margin = 40;
    var width = doc.internal.pageSize.getWidth() - margin * 2;
    var y = margin;
    function ensure(h) {
      if (y + h > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text('Application Export', margin, y); y += 22;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text('Generated: ' + new Date().toLocaleString('en-ZA'), margin, y); y += 16;
    buildPdfRows(userId, app).forEach(function (row) {
      var label = doc.splitTextToSize(row[0] + ':', width);
      var value = doc.splitTextToSize(row[1], width);
      ensure((label.length + value.length) * 13 + 6);
      doc.setFont('helvetica', 'bold'); doc.text(label, margin, y); y += label.length * 13;
      doc.setFont('helvetica', 'normal'); doc.text(value, margin, y); y += value.length * 13 + 6;
    });
    doc.save('application-' + String(app.id || 'export').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf');
  }

  function parseCoords(app) {
    var d = (app && app.details) || {};
    var lat = parseFloat(d.gpsLatitude);
    var lon = parseFloat(d.gpsLongitude);
    if (isFinite(lat) && isFinite(lon)) return { lat: lat, lon: lon };
    if (d.gpsCoordinates) {
      var m = String(d.gpsCoordinates).match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
    }
    return null;
  }

  function initMap() {
    if (mapInstance || !window.L) return;
    mapInstance = window.L.map('staffMap').setView([-25.5, 30.9], 7);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
    markerLayer = window.L.layerGroup().addTo(mapInstance);
  }

  function renderMap(items) {
    initMap();
    if (!markerLayer) return;
    markerLayer.clearLayers();

    var withCoords = [];
    (items || []).forEach(function (item) {
      var app = item.application || {};
      var coords = parseCoords(app);
      if (!coords) return;
      withCoords.push({ item: item, coords: coords });
      var popup = ''
        + '<div class="staff-map-popup">'
        + '<p><strong>' + esc(applicantName(item)) + '</strong></p>'
        + '<p>Farm: ' + esc(farmName(item)) + '</p>'
        + '<p>Status: ' + esc(app.status || 'Submitted') + '</p>'
        + '<p>Ref: ' + esc(app.id || '—') + '</p>'
        + '<button type="button" class="staff-btn staff-btn-view js-map-review" data-userid="' + esc(item.userId) + '" data-appid="' + esc(app.id) + '">Open review</button>'
        + '</div>';
      window.L.marker([coords.lat, coords.lon]).addTo(markerLayer).bindPopup(popup);
    });

    var meta = document.getElementById('staffMapMeta');
    if (meta) meta.textContent = withCoords.length + ' of ' + (items || []).length + ' applications have map coordinates.';

    if (withCoords.length) {
      var group = window.L.featureGroup(withCoords.map(function (x) { return window.L.marker([x.coords.lat, x.coords.lon]); }));
      mapInstance.fitBounds(group.getBounds().pad(0.2));
    }
  }

  function renderQueue(items) {
    var listWrap = document.getElementById('staffList');
    var emptyEl = document.getElementById('staffEmpty');
    var countEl = document.getElementById('staffQueueCount');
    var filtered = items.filter(matchesFilters);

    if (countEl) countEl.textContent = filtered.length + ' application' + (filtered.length === 1 ? '' : 's');

    if (!filtered.length) {
      listWrap.hidden = true;
      emptyEl.hidden = false;
      var msg = emptyEl.querySelector('p');
      if (msg) msg.textContent = allItems.length ? 'No applications match your filters.' : 'No applications available yet.';
      return;
    }
    emptyEl.hidden = true;
    listWrap.hidden = false;

    var grouped = {};
    filtered.forEach(function (item) {
      var g = getGrantType(item.application);
      if (!grouped[g.key]) grouped[g.key] = { label: g.label, items: [] };
      grouped[g.key].items.push(item);
    });

    var order = ['mesp_2025_26', 'livestock', 'crop', 'environmental', 'other'];
    var html = '';
    order.forEach(function (key) {
      if (!grouped[key] || !grouped[key].items.length) return;
      html += '<section class="staff-queue-group"><header class="staff-queue-group__head"><h3>' + esc(grouped[key].label) + '</h3><span class="staff-group-count">' + grouped[key].items.length + '</span></header><div class="staff-queue-cards">';
      grouped[key].items.forEach(function (item) {
        var app = item.application || {};
        var grant = getGrantType(app);
        var next = nextProcedureStage(app.status || 'Submitted');
        html += '<article class="staff-app-card">'
          + '<div class="staff-app-card__main">'
          + '<div class="staff-app-card__top"><span class="staff-app-card__programme">' + esc(grant.short) + '</span><span class="staff-status ' + statusClass(app.status) + '">' + esc(app.status || 'Submitted') + '</span></div>'
          + '<h4 class="staff-app-card__name">' + esc(applicantName(item)) + '</h4>'
          + '<p class="staff-app-card__farm">' + esc(farmName(item)) + '</p>'
          + '<dl class="staff-app-card__meta">'
          + '<div><dt>Reference</dt><dd>' + esc(app.id || '—') + '</dd></div>'
          + '<div><dt>Applicant ID</dt><dd>' + esc(item.userId || '—') + '</dd></div>'
          + '<div><dt>Submitted</dt><dd>' + esc(formatShortDate(app.submittedAt)) + '</dd></div>'
          + '<div><dt>Next step</dt><dd>' + esc(isTerminal(app.status) ? '—' : (next || 'Complete')) + '</dd></div>'
          + '</dl>'
          + '</div>'
          + '<div class="staff-app-card__actions">'
          + '<button type="button" class="staff-btn staff-btn-primary" data-action="review" data-userid="' + esc(item.userId) + '" data-appid="' + esc(app.id) + '">Review application</button>'
          + '<button type="button" class="staff-btn staff-btn-view" data-action="pdf" data-userid="' + esc(item.userId) + '" data-appid="' + esc(app.id) + '">PDF</button>'
          + '</div>'
          + '</article>';
      });
      html += '</div></section>';
    });
    listWrap.innerHTML = html;
  }

  function issueStatusClass(status) {
    var v = (status || '').toLowerCase().replace(/\s/g, '-');
    if (v === 'resolved') return 'staff-status-approved';
    if (v === 'in-progress') return 'staff-status-under-review';
    return 'staff-status-submitted';
  }

  function getIssueReports() {
    try {
      var raw = localStorage.getItem('farm_issue_reports');
      var list = raw ? JSON.parse(raw) : [];
      list.sort(function (a, b) { return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0); });
      return list;
    } catch (e) { return []; }
  }

  function saveIssueReports(list) {
    try { localStorage.setItem('farm_issue_reports', JSON.stringify(list || [])); } catch (e) {}
  }

  function updateIssueStatus(issueId, status) {
    var list = getIssueReports();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === issueId) {
        list[i].status = status;
        list[i].statusUpdatedAt = new Date().toISOString();
      }
    }
    saveIssueReports(list);
    renderIssues();
  }

  function renderIssues() {
    var listWrap = document.getElementById('staffIssuesList');
    var emptyEl = document.getElementById('staffIssuesEmpty');
    var list = getIssueReports();
    if (!list.length) {
      listWrap.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    listWrap.hidden = false;
    listWrap.innerHTML = list.map(function (issue) {
      var status = issue.status || 'Submitted';
      return '<article class="staff-issue-card">'
        + '<div class="staff-issue-head"><h3 class="staff-issue-title">' + esc(issue.issueType || 'Issue') + '</h3><span class="staff-status ' + issueStatusClass(status) + '">' + esc(status) + '</span></div>'
        + '<p class="staff-issue-meta"><strong>Ref:</strong> ' + esc(issue.id || '—') + ' &nbsp; <strong>User:</strong> ' + esc(issue.userName || issue.userId || '—') + ' &nbsp; <strong>Submitted:</strong> ' + esc(formatDate(issue.submittedAt)) + '</p>'
        + '<p class="staff-issue-desc">' + esc(issue.description || '') + '</p>'
        + '<div class="staff-issue-actions">'
        + '<button type="button" class="staff-btn staff-btn-view" data-issue-action="submitted" data-issueid="' + esc(issue.id || '') + '">Mark Submitted</button>'
        + '<button type="button" class="staff-btn staff-btn-request-docs" data-issue-action="progress" data-issueid="' + esc(issue.id || '') + '">Mark In Progress</button>'
        + '<button type="button" class="staff-btn staff-btn-approve" data-issue-action="resolved" data-issueid="' + esc(issue.id || '') + '">Mark Resolved</button>'
        + '</div></article>';
    }).join('');
  }

  function findItem(userId, appId) {
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].userId === userId && (allItems[i].application && allItems[i].application.id === appId)) return allItems[i];
    }
    return null;
  }

  function refreshView() {
    renderStats(allItems);
    renderQueue(allItems);
  }

  function loadAll() {
    var p = window.FarmApplications ? FarmApplications.getAllApplicationsForStaff() : Promise.resolve([]);
    return p.then(function (items) {
      allItems = items || [];
      refreshView();
      renderMap(allItems);
      renderIssues();
    }).catch(function () {
      allItems = [];
      refreshView();
      renderMap(allItems);
      renderIssues();
    });
  }

  function handleReviewAction(action) {
    if (!activeReview) return;
    var item = activeReview;
    var app = item.application;

    if (action === 'pdf') {
      downloadApplicationPdf(item.userId, app);
      return;
    }

    if (action === 'advance') {
      var next = nextProcedureStage(app.status || 'Submitted');
      if (!next) return;
      openActionModal({
        type: 'advance',
        title: 'Advance to ' + next,
        description: 'Record evidence or a brief note supporting this stage progression. This will be stored in the workflow history.',
        inputLabel: 'Stage evidence / note',
        placeholder: 'e.g. Site visit completed, applicant shortlisted…',
        required: true,
        item: item,
        nextStage: next
      });
      return;
    }

    if (action === 'request-docs') {
      openActionModal({
        type: 'request-docs',
        title: 'Request additional documentation',
        description: 'Describe exactly what the applicant must submit. They will see this message when tracking their application.',
        inputLabel: 'Documentation required',
        placeholder: 'e.g. Please upload proof of land ownership and ID copy…',
        required: true,
        item: item
      });
      return;
    }

    if (action === 'approve') {
      openActionModal({
        type: 'approve',
        title: 'Approve application',
        description: 'Confirm final approval. You may add an optional note for internal records.',
        inputLabel: 'Approval note (optional)',
        placeholder: 'Optional internal note…',
        required: false,
        item: item
      });
      return;
    }

    if (action === 'reject') {
      openActionModal({
        type: 'reject',
        title: 'Reject application',
        description: 'Provide a clear reason for rejection. This helps applicants understand the outcome.',
        inputLabel: 'Rejection reason',
        placeholder: 'e.g. Application does not meet programme eligibility criteria…',
        required: true,
        item: item
      });
    }
  }

  function submitActionModal() {
    if (!pendingAction) return;
    var note = document.getElementById('actionModalInput').value.trim();
    if (pendingAction.required && !note) {
      document.getElementById('actionModalError').textContent = 'This field is required.';
      return;
    }
    document.getElementById('actionModalError').textContent = '';
    var item = pendingAction.item;
    var app = item.application;

    if (pendingAction.type === 'advance') {
      advanceStage(item, note);
    } else if (pendingAction.type === 'request-docs') {
      setStatus(item.userId, app.id, 'Additional Documentation Required', {
        statusMessage: note,
        docsRequestedBy: staff.name || staff.username,
        docsRequestedAt: new Date().toISOString()
      });
    } else if (pendingAction.type === 'approve') {
      var approveExtra = { approvedBy: staff.name || staff.username, approvedAt: new Date().toISOString() };
      if (note) approveExtra.statusMessage = note;
      setStatus(item.userId, app.id, 'Approved', approveExtra);
    } else if (pendingAction.type === 'reject') {
      setStatus(item.userId, app.id, 'Rejected', {
        statusMessage: note,
        rejectedBy: staff.name || staff.username,
        rejectedAt: new Date().toISOString()
      });
    }

    closeActionModal();
  }

  function bindEvents() {
    document.getElementById('btnRefreshData').addEventListener('click', loadAll);
    document.getElementById('btnStaffLogout').addEventListener('click', function () {
      if (window.FarmStaffAuth) FarmStaffAuth.logout();
      window.location.href = 'staff-login.html';
    });

    document.getElementById('reviewPanelClose').addEventListener('click', closeReviewPanel);
    document.getElementById('reviewPanelBackdrop').addEventListener('click', closeReviewPanel);

    document.getElementById('actionModalCancel').addEventListener('click', closeActionModal);
    document.getElementById('actionModalConfirm').addEventListener('click', submitActionModal);
    document.getElementById('actionModal').addEventListener('click', function (e) {
      if (e.target.id === 'actionModal') closeActionModal();
    });

    var searchEl = document.getElementById('staffSearch');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        searchQuery = searchEl.value.trim();
        renderQueue(allItems);
      });
    }

    var programmeEl = document.getElementById('staffProgrammeFilter');
    if (programmeEl) {
      programmeEl.addEventListener('change', function () {
        activeProgramme = programmeEl.value;
        renderQueue(allItems);
      });
    }

    var mapToggle = document.getElementById('staffMapToggle');
    if (mapToggle) {
      mapToggle.addEventListener('click', function () {
        var section = document.getElementById('staffMapSection');
        var expanded = mapToggle.getAttribute('aria-expanded') === 'true';
        mapToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        section.hidden = expanded;
        if (!expanded && mapInstance) setTimeout(function () { mapInstance.invalidateSize(); }, 200);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!document.getElementById('actionModal').hidden) closeActionModal();
        else if (!document.getElementById('reviewPanel').hidden) closeReviewPanel();
      }
    });

    document.addEventListener('click', function (e) {
      var filterBtn = e.target.closest('[data-filter]');
      if (filterBtn && filterBtn.classList.contains('staff-stat')) {
        activeFilter = filterBtn.getAttribute('data-filter');
        renderStats(allItems);
        renderQueue(allItems);
        return;
      }

      var tabBtn = e.target.closest('.staff-review-tab');
      if (tabBtn) {
        var tab = tabBtn.getAttribute('data-tab');
        tabBtn.parentElement.querySelectorAll('.staff-review-tab').forEach(function (b) { b.classList.remove('is-active'); });
        tabBtn.classList.add('is-active');
        document.querySelectorAll('.staff-review-panel-section').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-panel') === tab);
        });
        return;
      }

      var reviewAction = e.target.closest('[data-review-action]');
      if (reviewAction && !reviewAction.disabled) {
        handleReviewAction(reviewAction.getAttribute('data-review-action'));
        return;
      }

      var mapReview = e.target.closest('.js-map-review');
      if (mapReview) {
        var mapItem = findItem(mapReview.getAttribute('data-userid'), mapReview.getAttribute('data-appid'));
        if (mapItem) openReviewPanel(mapItem);
        return;
      }

      var issueAction = e.target.closest('[data-issue-action]');
      if (issueAction) {
        var issueId = issueAction.getAttribute('data-issueid');
        var act = issueAction.getAttribute('data-issue-action');
        if (act === 'submitted') updateIssueStatus(issueId, 'Submitted');
        if (act === 'progress') updateIssueStatus(issueId, 'In Progress');
        if (act === 'resolved') updateIssueStatus(issueId, 'Resolved');
        return;
      }

      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var userId = btn.getAttribute('data-userid');
      var appId = btn.getAttribute('data-appid');
      var item = findItem(userId, appId);
      if (!item) return;
      if (action === 'review') openReviewPanel(item);
      if (action === 'pdf') downloadApplicationPdf(userId, item.application);
    });
  }

  bindEvents();
  loadAll();
})();
