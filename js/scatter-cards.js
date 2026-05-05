/**
 * Scatter cards — positions cards randomly in a cloud layout,
 * then animates them from center outward on page load.
 */
(function () {
  var container = document.getElementById('scatterContainer');
  if (!container) return;

  var cards = container.querySelectorAll('.scatter-card');
  if (!cards.length) return;

  var hub = container.querySelector('.scatter-hub');

  // ── Generate positions ──────────────────────
  // Use golden-angle spiral for even distribution + jitter

  var goldenAngle = Math.PI * (3 - Math.sqrt(5));
  var count = cards.length;
  var containerWidth = container.clientWidth || 1000;
  var containerHeight = 720;
  var maxRadiusX = containerWidth * 0.34;
  var maxRadiusY = containerHeight * 0.32;

  // Seed-based randomization so each visit looks different
  var seed = Date.now() % 10000;
  function seededRandom() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  // Shuffle card order for visual variety
  var indices = [];
  for (var i = 0; i < count; i++) indices.push(i);
  for (var i = count - 1; i > 0; i--) {
    var j = Math.floor(seededRandom() * (i + 1));
    var tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }

  // Sizes for variety
  var widths = [290, 250, 310, 270, 260];
  var scales = [0.92, 1.08, 0.85, 1.0, 0.96];

  for (var i = 0; i < count; i++) {
    var idx = indices[i];
    var angle = i * goldenAngle;
    var radiusFactor = Math.sqrt(i / Math.max(count - 1, 1));
    var rx = (0.3 + seededRandom() * 0.7) * maxRadiusX * radiusFactor;
    var ry = (0.3 + seededRandom() * 0.7) * maxRadiusY * radiusFactor;
    var x = Math.cos(angle) * rx + (seededRandom() - 0.5) * 30;
    var y = Math.sin(angle) * ry + (seededRandom() - 0.5) * 30;
    var rot = (seededRandom() - 0.5) * 10;
    var delay = i * 90;

    cards[idx].style.setProperty('--x', x + 'px');
    cards[idx].style.setProperty('--y', y + 'px');
    cards[idx].style.setProperty('--rot', rot + 'deg');
    cards[idx].style.setProperty('--delay', delay + 'ms');
    cards[idx].style.setProperty('--card-width', widths[i] + 'px');
    cards[idx].style.setProperty('--card-scale', scales[i]);
  }

  // ── Trigger animation ───────────────────────
  // Double rAF to ensure initial render before transition
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      container.classList.add('is-active');
      if (hub) hub.classList.add('is-visible');
    });
  });

  // ── Recalc on resize ────────────────────────
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      containerWidth = container.clientWidth || 1000;
      maxRadiusX = containerWidth * 0.34;
      maxRadiusY = containerHeight * 0.32;
      // Re-apply positions with new bounds
      for (var j = 0; j < count; j++) {
        var card = cards[j];
        var currentX = parseFloat(card.style.getPropertyValue('--x'));
        var currentY = parseFloat(card.style.getPropertyValue('--y'));
        // Clamp to new bounds
        var clampedX = Math.max(-maxRadiusX - 50, Math.min(maxRadiusX + 50, currentX));
        var clampedY = Math.max(-maxRadiusY - 50, Math.min(maxRadiusY + 50, currentY));
        card.style.setProperty('--x', clampedX + 'px');
        card.style.setProperty('--y', clampedY + 'px');
      }
    }, 200);
  });
})();
