/**
 * Navigation: sticky header shadow, hamburger menu, scroll reveal.
 */
(function () {
  'use strict';

  var nav = document.querySelector('.site-nav');
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('mobileNav');
  var overlay = document.getElementById('mobileOverlay');
  var desktopDropdownButtons = document.querySelectorAll('.site-nav__links .nav-item > button.nav-link');
  var desktopDropdownItems = Array.prototype.slice.call(desktopDropdownButtons)
    .map(function (btn) { return btn.closest('.nav-item'); })
    .filter(Boolean);

  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  function closeMenu() {
    if (toggle) toggle.classList.remove('active');
    if (mobile) mobile.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = mobile && mobile.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        toggle.classList.add('active');
        if (mobile) mobile.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  if (mobile) {
    mobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  function closeDesktopDropdowns(exceptItem) {
    desktopDropdownItems.forEach(function (item) {
      if (exceptItem && item === exceptItem) return;
      item.classList.remove('open');
      var btn = item.querySelector('button.nav-link');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  // Enable click-to-open dropdowns for touch/tablet/keyboard users.
  // CSS already supports `.nav-item.open`; this just toggles that state.
  desktopDropdownButtons.forEach(function (btn) {
    btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') || 'false');
    btn.addEventListener('click', function (e) {
      // Only apply when desktop nav is visible (mobile drawer uses a separate menu).
      var desktopVisible = window.matchMedia && window.matchMedia('(min-width: 861px)').matches;
      if (!desktopVisible) return;

      var item = btn.closest('.nav-item');
      if (!item) return;

      var isOpen = item.classList.contains('open');
      closeDesktopDropdowns(item);

      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }

      e.stopPropagation();
    });
  });

  document.addEventListener('click', function () {
    closeDesktopDropdowns();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDesktopDropdowns();
  });

  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.split('/').pop() === currentPath) {
      link.classList.add('active');
    }
  });

  /* Scroll reveal */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
