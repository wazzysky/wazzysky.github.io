/**
 * Scatter cards — positions cards in a cloud layout with collision detection,
 * then animates them from center outward on page load.
 */
(function () {
  var container = document.getElementById('scatterContainer');
  if (!container) return;

  var cards = container.querySelectorAll('.scatter-card');
  if (!cards.length) return;

  var hub = container.querySelector('.scatter-hub');
  var count = cards.length;
  var containerWidth = container.clientWidth || 1000;
  var containerHeight = 920;
  var maxRadiusX = containerWidth * 0.46;
  var maxRadiusY = containerHeight * 0.44;
  var minGap = 40; // minimum px gap between cards

  // Seed-based randomization
  var seed = Date.now() % 10000;
  function seededRandom() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  // ── Card dimensions (width, approx height) ──
  var cardSizes = [
    { w: 250, h: 280 },
    { w: 220, h: 260 },
    { w: 260, h: 290 },
    { w: 230, h: 270 },
    { w: 240, h: 275 }
  ];
  var scales = [0.88, 0.98, 0.82, 0.94, 0.9];

  // ── Placed cards store (for collision) ──────
  var placed = [];

  // Hub bounding box (center area to avoid) — ~380×180px with padding
  var hubRect = { x: -190, y: -90, w: 380, h: 180 };

  function rectsOverlap(a, b, gap) {
    return !(
      a.x + a.w / 2 + gap < b.x - b.w / 2 ||
      a.x - a.w / 2 - gap > b.x + b.w / 2 ||
      a.y + a.h / 2 + gap < b.y - b.h / 2 ||
      a.y - a.h / 2 - gap > b.y + b.h / 2
    );
  }

  function hasCollision(cx, cy, cw, ch, gap, placedList) {
    var cardRect = { x: cx, y: cy, w: cw, h: ch };
    // Check against hub
    if (rectsOverlap(cardRect, hubRect, gap + 20)) return true;
    // Check against placed cards
    for (var p = 0; p < placedList.length; p++) {
      var pr = placedList[p];
      if (rectsOverlap(cardRect, { x: pr.x, y: pr.y, w: pr.w, h: pr.h }, gap)) return true;
    }
    return false;
  }

  function clampToBounds(cx, cy, cw, ch) {
    var halfW = cw / 2;
    var halfH = ch / 2;
    var boundX = maxRadiusX + 60;
    var boundY = maxRadiusY + 60;
    return {
      x: Math.max(-boundX + halfW, Math.min(boundX - halfW, cx)),
      y: Math.max(-boundY + halfH, Math.min(boundY - halfH, cy))
    };
  }

  // ── Golden angle for angular distribution ──
  var goldenAngle = Math.PI * (3 - Math.sqrt(5));

  // Shuffle indices
  var indices = [];
  for (var i = 0; i < count; i++) indices.push(i);
  for (var i = count - 1; i > 0; i--) {
    var j = Math.floor(seededRandom() * (i + 1));
    var tmp = indices[i]; indices[i] = indices[j]; indices[j] = tmp;
  }

  for (var i = 0; i < count; i++) {
    var idx = indices[i];
    var angle = i * goldenAngle;
    var size = cardSizes[i];
    var cw = size.w;
    var ch = size.h;

    // Determine radius — further cards first, then work inward
    var radiusFactor = 0.65 + 0.35 * (i / Math.max(count - 1, 1));
    var baseRx = maxRadiusX * radiusFactor;
    var baseRy = maxRadiusY * radiusFactor;

    var cx, cy;
    var placedFlag = false;
    var maxAttempts = 40;

    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      // Vary radius and angle slightly each attempt
      var rxF = baseRx * (0.85 + seededRandom() * 0.3);
      var ryF = baseRy * (0.85 + seededRandom() * 0.3);
      var angJitter = (seededRandom() - 0.5) * 0.5; // rad
      var a = angle + angJitter;

      cx = Math.cos(a) * rxF;
      cy = Math.sin(a) * ryF;

      // Clamp to container bounds
      var clamped = clampToBounds(cx, cy, cw, ch);
      cx = clamped.x;
      cy = clamped.y;

      if (!hasCollision(cx, cy, cw, ch, minGap, placed)) {
        placedFlag = true;
        break;
      }
    }

    // Fallback: if all attempts fail, shrink card slightly and accept
    if (!placedFlag) {
      cw *= 0.85;
      ch *= 0.85;
      cx = Math.cos(angle) * baseRx;
      cy = Math.sin(angle) * baseRy;
    }

    var rot = (seededRandom() - 0.5) * 8;
    var delay = i * 90;

    placed.push({ x: cx, y: cy, w: cw, h: ch });

    cards[idx].style.setProperty('--x', cx + 'px');
    cards[idx].style.setProperty('--y', cy + 'px');
    cards[idx].style.setProperty('--rot', rot + 'deg');
    cards[idx].style.setProperty('--delay', delay + 'ms');
    cards[idx].style.setProperty('--card-width', cw + 'px');
    cards[idx].style.setProperty('--card-scale', scales[i]);
  }

  // ── Trigger animation ───────────────────────
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
      maxRadiusX = containerWidth * 0.46;
      maxRadiusY = containerHeight * 0.44;
      for (var j = 0; j < count; j++) {
        var card = cards[j];
        var currentX = parseFloat(card.style.getPropertyValue('--x'));
        var currentY = parseFloat(card.style.getPropertyValue('--y'));
        var clampedX = Math.max(-maxRadiusX - 50, Math.min(maxRadiusX + 50, currentX));
        var clampedY = Math.max(-maxRadiusY - 50, Math.min(maxRadiusY + 50, currentY));
        card.style.setProperty('--x', clampedX + 'px');
        card.style.setProperty('--y', clampedY + 'px');
      }
    }, 200);
  });
})();
