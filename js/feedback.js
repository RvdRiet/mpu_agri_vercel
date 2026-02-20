(function () {
  'use strict';

  var STORAGE_KEY = 'mpu_feedback_entries';

  function getContainer() {
    var links = document.querySelector('.footer__bottom-links');
    if (links) return links;
    var inner = document.querySelector('.footer__bottom-inner');
    if (inner) {
      var wrap = document.createElement('div');
      wrap.className = 'footer__bottom-links';
      inner.appendChild(wrap);
      return wrap;
    }
    return null;
  }

  function createButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'footer-feedback-btn';
    btn.setAttribute('aria-label', 'Open feedback form');
    btn.textContent = 'Feedback';
    return btn;
  }

  function createOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    overlay.id = 'feedbackOverlay';
    overlay.setAttribute('aria-hidden', 'true');

    var modal = document.createElement('div');
    modal.className = 'feedback-modal';

    modal.innerHTML =
      '<div class="feedback-modal__header">' +
        '<h2 class="feedback-modal__title">Send feedback</h2>' +
        '<button type="button" class="feedback-modal__close" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="feedback-modal__body">' +
        '<p style="margin:0 0 1rem;font-size:0.875rem;color:var(--color-text-secondary);">Rate your experience, log a complaint, or share general feedback.</p>' +
        '<div class="feedback-field">' +
          '<label>Star rating</label>' +
          '<div class="feedback-stars" id="feedbackStars" role="group" aria-label="Rate the website 1 to 5 stars">' +
            [1,2,3,4,5].map(function (n) {
              return '<input type="radio" name="feedbackStars" value="' + n + '" id="fbStar' + n + '">' +
                     '<label for="fbStar' + n + '">★</label>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="feedback-field feedback-field--complaint">' +
          '<label><input type="checkbox" id="feedbackIsComplaint"> I want to log a complaint</label>' +
          '<textarea id="feedbackComplaint" placeholder="Describe your complaint..." class="feedback-complaint-text" style="margin-top:0.5rem;display:none;"></textarea>' +
        '</div>' +
        '<div class="feedback-field">' +
          '<label for="feedbackGeneral">General feedback</label>' +
          '<textarea id="feedbackGeneral" placeholder="Tell us what you think about the website..."></textarea>' +
        '</div>' +
        '<div class="feedback-modal__actions">' +
          '<button type="button" class="btn btn--secondary" id="feedbackCancel">Cancel</button>' +
          '<button type="button" class="btn btn--primary" id="feedbackSubmit">Submit</button>' +
        '</div>' +
      '</div>' +
      '<div class="feedback-thanks" id="feedbackThanks" style="display:none;">' +
        '<p>Thank you for your feedback. We appreciate it.</p>' +
        '<button type="button" class="btn btn--primary" id="feedbackThanksClose">Close</button>' +
      '</div>';

    overlay.appendChild(modal);
    return overlay;
  }

  function openModal() {
    var overlay = document.getElementById('feedbackOverlay');
    if (!overlay) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var firstInput = overlay.querySelector('#feedbackStars input');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    var overlay = document.getElementById('feedbackOverlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function resetForm() {
    var stars = document.querySelectorAll('#feedbackStars input');
    var complaint = document.getElementById('feedbackComplaint');
    var isComplaint = document.getElementById('feedbackIsComplaint');
    var general = document.getElementById('feedbackGeneral');
    if (stars) stars.forEach(function (r) { r.checked = false; });
    if (complaint) complaint.value = '';
    if (isComplaint) isComplaint.checked = false;
    if (general) general.value = '';
    toggleComplaintVisibility();
    updateStarLabels();
    var thanks = document.getElementById('feedbackThanks');
    var body = document.querySelector('.feedback-modal__body');
    if (thanks) thanks.style.display = 'none';
    if (body) body.style.display = 'block';
  }

  function toggleComplaintVisibility() {
    var isComplaint = document.getElementById('feedbackIsComplaint');
    var complaint = document.querySelector('.feedback-complaint-text');
    if (complaint) complaint.style.display = (isComplaint && isComplaint.checked) ? 'block' : 'none';
  }

  function updateStarLabels() {
    var container = document.getElementById('feedbackStars');
    if (!container) return;
    var labels = container.querySelectorAll('label');
    var checked = container.querySelector('input:checked');
    var value = checked ? parseInt(checked.value, 10) : 0;
    labels.forEach(function (label, i) {
      label.classList.toggle('is-filled', i < value);
    });
  }

  function saveFeedback(data) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      list.push({ at: new Date().toISOString(), data: data });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function handleSubmit() {
    var starsInput = document.querySelector('#feedbackStars input:checked');
    var isComplaint = document.getElementById('feedbackIsComplaint');
    var complaint = document.getElementById('feedbackComplaint');
    var general = document.getElementById('feedbackGeneral');
    var stars = starsInput ? parseInt(starsInput.value, 10) : null;
    var complaintText = (isComplaint && isComplaint.checked && complaint) ? complaint.value.trim() : '';
    var generalText = general ? general.value.trim() : '';
    if (!stars && !complaintText && !generalText) return;
    saveFeedback({
      stars: stars,
      complaint: complaintText || undefined,
      general: generalText || undefined
    });
    var body = document.querySelector('.feedback-modal__body');
    var thanks = document.getElementById('feedbackThanks');
    if (body) body.style.display = 'none';
    if (thanks) thanks.style.display = 'block';
  }

  function init() {
    var container = getContainer();
    if (!container) return;

    var btn = createButton();
    btn.addEventListener('click', function () {
      resetForm();
      openModal();
    });
    container.appendChild(btn);

    var overlay = createOverlay();
    document.body.appendChild(overlay);

    overlay.querySelector('.feedback-modal__close').addEventListener('click', function () {
      closeModal();
    });
    document.getElementById('feedbackCancel').addEventListener('click', closeModal);
    document.getElementById('feedbackSubmit').addEventListener('click', handleSubmit);
    document.getElementById('feedbackThanksClose').addEventListener('click', function () {
      closeModal();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('feedbackOverlay').classList.contains('is-open')) {
        closeModal();
      }
    });

    var starsContainer = document.getElementById('feedbackStars');
    if (starsContainer) {
      starsContainer.querySelectorAll('input').forEach(function (input) {
        input.addEventListener('change', updateStarLabels);
      });
      starsContainer.querySelectorAll('label').forEach(function (label, i) {
        label.addEventListener('click', function () { setTimeout(updateStarLabels, 0); });
      });
    }
    document.getElementById('feedbackIsComplaint').addEventListener('change', toggleComplaintVisibility);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
