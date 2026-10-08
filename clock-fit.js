// Mode téléphone : les horloges (ville + heure) s'adaptent à la place libre
// à droite du bouton TJP : plus le bouton est petit, plus elles grandissent,
// avec les proportions actuelles (ville / heure / secondes) et des marges
// constantes entre les heures et sur les bords.
(function () {
  var EDGE = 8, GAP = 12, KMIN = 0.5, KMAX = 1.8;
  var busy = false;
  function box() { return document.querySelector('.nav-mobile-clocks'); }
  function parts(b) {
    return {
      items: [].slice.call(b.querySelectorAll('.clock-item')),
      cities: [].slice.call(b.querySelectorAll('.clock-city')),
      times: [].slice.call(b.querySelectorAll('.clock-time'))
    };
  }
  function clear(b) {
    var p = parts(b);
    b.style.gap = '';
    b.style.flex = '';
    p.items.forEach(function (e) { e.style.flex = ''; });
    p.cities.concat(p.times).forEach(function (e) { e.style.fontSize = ''; });
  }
  function fit() {
    if (busy) return;
    var b = box();
    if (!b) return;
    if (!document.body.classList.contains('cf-mode-phone') || b.offsetParent === null) { clear(b); return; }
    busy = true;
    try {
      clear(b);
      var p = parts(b);
      var baseC = p.cities.map(function (e) { return parseFloat(getComputedStyle(e).fontSize); });
      var baseT = p.times.map(function (e) { return parseFloat(getComputedStyle(e).fontSize); });
      b.style.flex = '1 1 0';
      p.items.forEach(function (e) { e.style.flex = '0 0 auto'; });
      b.style.gap = '0px';
      var avail = b.clientWidth;
      var w1 = p.items.reduce(function (s, e) { return s + e.getBoundingClientRect().width; }, 0);
      if (!avail || !w1) { clear(b); return; }
      var k = (avail - 2 * EDGE - (p.items.length - 1) * GAP) / w1;
      k = Math.max(KMIN, Math.min(KMAX, k));
      p.cities.forEach(function (e, i) { e.style.fontSize = (baseC[i] * k).toFixed(2) + 'px'; });
      p.times.forEach(function (e, i) { e.style.fontSize = (baseT[i] * k).toFixed(2) + 'px'; });
      b.style.gap = GAP + 'px';
    } catch (e) {
    } finally {
      busy = false;
    }
  }
  var t;
  function later() { clearTimeout(t); t = setTimeout(fit, 30); }
  window.addEventListener('resize', later);
  window.addEventListener('orientationchange', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  window.addEventListener('load', function () { later(); setTimeout(fit, 600); setTimeout(fit, 2000); });
  document.addEventListener('DOMContentLoaded', later);
  try {
    new MutationObserver(later).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    var l = document.querySelector('.nav-mobile-logo'), h = document.querySelector('.hamburger');
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(later);
      if (l) ro.observe(l);
      if (h) ro.observe(h);
      var r1 = document.querySelector('.nav-mobile-row1');
      if (r1) ro.observe(r1);
    }
  } catch (e) {}
  later();
})();
