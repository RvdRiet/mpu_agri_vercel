(function () {
  /* Scroll reveal: add is-visible when elements enter viewport (respects prefers-reduced-motion in CSS) */
  var revealEls = document.querySelectorAll('.scroll-reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else if (revealEls.length) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  var modal = document.getElementById('definitionModal');
  var btnDefinition = document.getElementById('btnDefinition');
  var btnClose = document.getElementById('modalClose');

  function openModal() {
    if (modal) {
      modal.removeAttribute('hidden');
      if (btnDefinition) btnDefinition.setAttribute('aria-expanded', 'true');
    }
  }

  function closeModal() {
    if (modal) {
      modal.setAttribute('hidden', '');
      if (btnDefinition) btnDefinition.setAttribute('aria-expanded', 'false');
    }
  }

  if (btnDefinition) {
    btnDefinition.addEventListener('click', openModal);
  }

  if (btnClose) {
    btnClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });
})();
