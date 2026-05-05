/**
 * Tiny scroll-triggered reveal — zero dependencies.
 * Add class "reveal" to any element you want animated on scroll.
 */
(function () {
  var observer;
  var revealed = new WeakSet();

  function onIntersect(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        if (revealed.has(el)) return;
        revealed.add(el);
        el.classList.add('is-revealed');

        // Stagger children
        var children = el.querySelectorAll('.reveal-child');
        for (var i = 0; i < children.length; i++) {
          (function (child, idx) {
            child.style.setProperty('--reveal-delay', (idx * 80) + 'ms');
            setTimeout(function () {
              child.classList.add('is-revealed');
            }, idx * 80);
          })(children[i], i);
        }
      }
    });
  }

  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all immediately
      var items = document.querySelectorAll('.reveal');
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add('is-revealed');
      }
      return;
    }

    observer = new IntersectionObserver(onIntersect, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    var items = document.querySelectorAll('.reveal');
    for (var i = 0; i < items.length; i++) {
      observer.observe(items[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
