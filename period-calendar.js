// ═══════════════════════════════════════════════════════════════════════
// PÉRIODE PAR CALENDRIER — TJP · module additif, zéro-édition
// ═══════════════════════════════════════════════════════════════════════
// Ajoute sur CHAQUE graphique (natifs comme personnalisés, y compris ceux
// créés plus tard) un bouton calendrier carré, à côté des boutons de période
// (J / SEM / MOIS / TRIM / AN / TOUT), de la même hauteur qu'eux. Un clic ouvre un calendrier :
// on clique un jour de début, puis un jour de fin, et le graphique n'analyse
// plus que les trades compris entre ces deux jours (inclus).
//
//  • Trades BT : ils suivent la case « BT » du graphique, exactement comme
//    pour les autres périodes (le filtrage passe par btFilter()).
//  • Retour à une période normale : clic sur J / SEM / MOIS / TRIM / AN /
//    TOUT, ou sur « Effacer » dans le calendrier.
//  • Le bouton s'allume tant qu'une plage est active ; survole-le pour voir
//    les dates analysées.
//  • Comme les autres périodes, la plage n'est pas mémorisée au rechargement.
//
// Fonctionnement : la plage est stockée dans ST[clé] sous la forme
// 'plage:AAAA-MM-JJ:AAAA-MM-JJ'. filterT() est enveloppée pour la comprendre ;
// le reste (libellés, BT, redessin) est déjà générique. Les boutons sont
// posés par un observateur du DOM : aucun fichier existant n'est modifié.
//
// Couleurs : tout est réglable dans Paramètres → Thème → Track Record →
// « Bouton calendrier (période des graphiques) » et « Calendrier de période
// (graphiques) » — ajouté au thème par monkey-patch de buildTV(), donc
// sauvegardé/synchronisé comme toutes les autres couleurs.
//
// N'édite aucun fichier existant : une seule ligne ajoutée dans index.html.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var PREFIX = 'plage:';
  var MOIS = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  var JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // ── 1. Couleurs du thème ────────────────────────────────────────────
  // [variable, libellé dans l'éditeur de thème, valeur de départ, section]
  var S_BTN = 'Bouton calendrier (période des graphiques)';
  var S_CAL = 'Calendrier de période (graphiques)';
  var THEME = [
    ['--pcal-btn-bg', 'Bouton calendrier - fond', '#111827', S_BTN],
    ['--pcal-btn-bd', 'Bouton calendrier - bordure', '#1e2d45', S_BTN],
    ['--pcal-btn-ic', 'Bouton calendrier - dessin', '#64748b', S_BTN],
    ['--pcal-btn-hover-bd', 'Bouton calendrier survolé - bordure', '#00e5a0', S_BTN],
    ['--pcal-btn-hover-ic', 'Bouton calendrier survolé - dessin', '#00e5a0', S_BTN],
    ['--pcal-btn-active-bg', 'Bouton calendrier actif - fond', '#00e5a0', S_BTN],
    ['--pcal-btn-active-bd', 'Bouton calendrier actif - bordure', '#00e5a0', S_BTN],
    ['--pcal-btn-active-ic', 'Bouton calendrier actif - dessin', '#0b0f1a', S_BTN],

    ['--pcal-bg', 'Calendrier - fond', '#111827', S_CAL],
    ['--pcal-bd', 'Calendrier - bordure', '#1e2d45', S_CAL],
    ['--pcal-title', 'Calendrier - mois et année', '#e2e8f0', S_CAL],
    ['--pcal-nav', 'Calendrier - flèches', '#64748b', S_CAL],
    ['--pcal-nav-hover', 'Calendrier - flèches survolées', '#00e5a0', S_CAL],
    ['--pcal-wd', 'Calendrier - jours de la semaine', '#64748b', S_CAL],
    ['--pcal-day-tx', 'Calendrier - numéros des jours', '#e2e8f0', S_CAL],
    ['--pcal-day-hover-bg', 'Calendrier - jour survolé (fond)', '#1e2d45', S_CAL],
    ['--pcal-today-bd', "Calendrier - aujourd'hui (bordure)", '#00e5a0', S_CAL],
    ['--pcal-sel-bg', 'Calendrier - premier / dernier jour (fond)', '#00e5a0', S_CAL],
    ['--pcal-sel-tx', 'Calendrier - premier / dernier jour (texte)', '#0b0f1a', S_CAL],
    ['--pcal-range-bg', 'Calendrier - jours entre les deux (fond)', '#0f3b34', S_CAL],
    ['--pcal-range-tx', 'Calendrier - jours entre les deux (texte)', '#e2e8f0', S_CAL],
    ['--pcal-hint-tx', "Calendrier - message d'aide", '#64748b', S_CAL],
    ['--pcal-clear-bg', 'Calendrier - bouton Effacer (fond)', '#111827', S_CAL],
    ['--pcal-clear-bd', 'Calendrier - bouton Effacer (bordure)', '#1e2d45', S_CAL],
    ['--pcal-clear-tx', 'Calendrier - bouton Effacer (texte)', '#e2e8f0', S_CAL]
  ];

  // ── 2. Style ────────────────────────────────────────────────────────
  var CSS =
    ':root {\n' +
    THEME.map(function (t) {
      return '  ' + t[0] + ': ' + t[2] + ';';
    }).join('\n') +
    '\n}\n' +
    `
.pcal-btn {
  flex-shrink: 0; box-sizing: border-box;
  /* Carré, de la même hauteur que les boutons de période (J / SEM / MOIS...) :
     --pcal-size est mesurée et tenue à jour par le script (voir fitAll). */
  width: var(--pcal-size, 20px); height: var(--pcal-size, 20px); padding: 0; margin: 0 0 0 4px;
  display: inline-flex; align-items: center; justify-content: center; align-self: center;
  border-radius: 3px;
  border: 1px solid var(--pcal-btn-bd);
  background: var(--pcal-btn-bg);
  color: var(--pcal-btn-ic);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.pcal-btn svg { width: 74%; height: 74%; display: block; pointer-events: none; }
.pcal-btn:hover { border-color: var(--pcal-btn-hover-bd); color: var(--pcal-btn-hover-ic); }
.pcal-btn.active,
.pcal-btn.active:hover {
  background: var(--pcal-btn-active-bg);
  border-color: var(--pcal-btn-active-bd);
  color: var(--pcal-btn-active-ic);
}

.pcal-pop {
  position: fixed; z-index: 4500; box-sizing: border-box;
  width: 232px; padding: 10px;
  background: var(--pcal-bg);
  border: 1px solid var(--pcal-bd);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  font-family: var(--mono, monospace);
  user-select: none; -webkit-user-select: none;
}
.pcal-head { display: flex; align-items: center; gap: 2px; margin-bottom: 8px; }
.pcal-title {
  flex: 1; text-align: center; font-size: 11px; font-weight: 700;
  letter-spacing: 0.5px; text-transform: capitalize; color: var(--pcal-title);
}
.pcal-nav {
  width: 22px; height: 22px; padding: 0; border: 0; border-radius: 4px;
  background: transparent; color: var(--pcal-nav);
  font-family: inherit; font-size: 14px; line-height: 1; cursor: pointer;
}
.pcal-nav:hover { color: var(--pcal-nav-hover); }
.pcal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.pcal-wd { text-align: center; font-size: 9px; padding: 2px 0 4px; color: var(--pcal-wd); }
.pcal-blank, .pcal-day { height: 26px; }
.pcal-day {
  padding: 0; border: 1px solid transparent; border-radius: 4px;
  background: transparent; color: var(--pcal-day-tx);
  font-family: inherit; font-size: 10px; cursor: pointer;
}
.pcal-day:hover { background: var(--pcal-day-hover-bg); }
.pcal-day.today { border-color: var(--pcal-today-bd); }
.pcal-day.inrange { background: var(--pcal-range-bg); color: var(--pcal-range-tx); border-radius: 0; }
.pcal-day.sel { background: var(--pcal-sel-bg); color: var(--pcal-sel-tx); font-weight: 700; }
.pcal-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; }
.pcal-hint { font-size: 9px; line-height: 1.35; color: var(--pcal-hint-tx); }
.pcal-clear {
  flex-shrink: 0; padding: 3px 8px; border-radius: 4px; white-space: nowrap;
  border: 1px solid var(--pcal-clear-bd);
  background: var(--pcal-clear-bg); color: var(--pcal-clear-tx);
  font-family: inherit; font-size: 9px; cursor: pointer;
}
`;
  var styleTag = document.createElement('style');
  styleTag.id = 'tjp-period-calendar-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  // ── 3. Plage de dates : lecture / écriture / filtrage ───────────────
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function parseRange(p) {
    if (typeof p !== 'string' || p.indexOf(PREFIX) !== 0) return null;
    var parts = p.slice(PREFIX.length).split(':');
    if (parts.length !== 2 || !DATE_RE.test(parts[0]) || !DATE_RE.test(parts[1])) return null;
    return parts[0] <= parts[1] ? {from: parts[0], to: parts[1]} : {from: parts[1], to: parts[0]};
  }
  function makePeriod(a, b) {
    return PREFIX + (a <= b ? a + ':' + b : b + ':' + a);
  }
  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }
  function ymd(y, m, d) {
    return y + '-' + pad(m + 1) + '-' + pad(d);
  }
  function fr(ds) {
    return ds.slice(8, 10) + '/' + ds.slice(5, 7) + '/' + ds.slice(0, 4);
  }
  function todayStr() {
    var n = new Date();
    return ymd(n.getFullYear(), n.getMonth(), n.getDate());
  }

  // filterT() est appelée (par filterRealT / btFilter) avec la période du
  // graphique : on ne fait qu'ajouter la lecture d'une plage, le reste est
  // inchangé. Les trades BT restent gérés par btFilter() selon la case « BT ».
  if (typeof window.filterT === 'function') {
    var _origFilterT = window.filterT;
    window.filterT = function (period) {
      var r = parseRange(period);
      if (!r) return _origFilterT.apply(this, arguments);
      return APP.trades
        .filter(function (t) {
          return t.date && t.date >= r.from && t.date <= r.to;
        })
        .sort(function (a, b) {
          return a.date.localeCompare(b.date) || (a.heure || '').localeCompare(b.heure || '');
        });
    };
  }

  // ── 4. Boutons calendrier sur chaque graphique ──────────────────────
  var ICON =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 7h12M5.5 1.5v3M10.5 1.5v3"/></svg>';

  function chartKeyOf(group) {
    var b = group.querySelector('.pbtn[data-chart]');
    return b ? b.dataset.chart : null;
  }

  // Aligne l'apparence du bouton (et des boutons de période) sur ST[clé].
  function syncGroup(group) {
    var key = chartKeyOf(group);
    var btn = group.querySelector('.pcal-btn');
    if (!key || !btn) return;
    var r = parseRange(ST[key]);
    btn.classList.toggle('active', !!r);
    btn.title = r
      ? 'Période analysée : du ' + fr(r.from) + ' au ' + fr(r.to) + ' (clic pour modifier)'
      : 'Choisir une période dans le calendrier';
    if (r) {
      group.querySelectorAll('.pbtn').forEach(function (b) {
        b.classList.remove('active');
      });
    }
  }
  function syncAll() {
    document.querySelectorAll('.period-btns').forEach(syncGroup);
  }

  // Le bouton calendrier est un carré dont le côté = la hauteur des boutons de
  // période. On mesure cette hauteur NATURELLE (le bouton est ramené à 0 le
  // temps de la mesure : sinon, plus haut qu'eux, il étirerait toute la ligne
  // et on mesurerait sa propre taille) puis on la lui donne, et on la suit avec
  // un ResizeObserver (chargement de la police, mode d'affichage, réglages du
  // thème...) au lieu de la figer en pixels.
  var fitQueued = false;
  function fitAll() {
    fitQueued = false;
    var groups = Array.prototype.filter.call(document.querySelectorAll('.period-btns'), function (g) {
      return g.querySelector('.pcal-btn') && g.querySelector('.pbtn');
    });
    groups.forEach(function (g) {
      g.querySelector('.pcal-btn').style.setProperty('--pcal-size', '0px');
    });
    var heights = groups.map(function (g) {
      return g.querySelector('.pbtn').getBoundingClientRect().height;
    });
    groups.forEach(function (g, i) {
      var btn = g.querySelector('.pcal-btn');
      if (heights[i] > 0) btn.style.setProperty('--pcal-size', Math.round(heights[i] * 100) / 100 + 'px');
      else btn.style.removeProperty('--pcal-size'); // graphique masqué : valeur par défaut, recalculée à son affichage
    });
  }
  function queueFit() {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(fitAll);
  }
  var sizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(queueFit) : null;

  function decorate() {
    var added = false;
    document.querySelectorAll('.period-btns').forEach(function (group) {
      var key = chartKeyOf(group);
      if (!key) return;
      if (!group.querySelector('.pcal-btn')) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pcal-btn';
        btn.dataset.chart = key;
        btn.setAttribute('aria-label', 'Choisir une période dans un calendrier');
        btn.innerHTML = ICON;
        group.appendChild(btn);
        var ref = group.querySelector('.pbtn');
        if (sizeObserver && ref) sizeObserver.observe(ref);
        added = true;
      }
      syncGroup(group);
    });
    if (added) queueFit();
  }

  // Les graphiques sont créés à différents moments (démarrage, graphiques
  // personnalisés ajoutés ou réordonnés, changement de compte...) : on
  // surveille le DOM plutôt que de dépendre d'un appel précis.
  var decoTimer = null;
  function scheduleDecorate() {
    if (decoTimer) return;
    decoTimer = setTimeout(function () {
      decoTimer = null;
      decorate();
    }, 60);
  }
  new MutationObserver(scheduleDecorate).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate);
  else decorate();

  // Un clic sur J / SEM / MOIS / TRIM / AN / TOUT remplace la période (les
  // gestionnaires d'origine écrivent ST[clé]) : on remet le bouton calendrier
  // à jour juste après eux.
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.pbtn[data-chart]')) setTimeout(syncAll, 0);
  });

  // ── 5. Le calendrier ────────────────────────────────────────────────
  var pop = null; // élément du calendrier ouvert
  var popKey = null; // clé du graphique concerné
  var popBtn = null; // bouton calendrier qui l'a ouvert
  var view = null; // {y, m} mois affiché
  var startDay = null; // premier jour choisi, en attente du second

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function closePop() {
    if (pop) pop.remove();
    pop = popKey = popBtn = startDay = null;
    document.removeEventListener('pointerdown', onOutside, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onReflow);
    window.removeEventListener('scroll', onReflow, true);
  }
  function onOutside(e) {
    if (!pop) return;
    if (pop.contains(e.target) || (popBtn && popBtn.contains(e.target))) return;
    closePop();
  }
  function onKey(e) {
    if (e.key === 'Escape') closePop();
  }
  // Défilement de la page / redimensionnement : le calendrier suit son bouton,
  // et se ferme si le bouton a disparu ou est sorti de l'écran.
  function onReflow(e) {
    if (!pop) return;
    if (e && e.target && e.target.nodeType === 1 && pop.contains(e.target)) return;
    if (!popBtn || !document.body.contains(popBtn)) {
      closePop();
      return;
    }
    var r = popBtn.getBoundingClientRect();
    if (r.bottom < 0 || r.top > document.documentElement.clientHeight) {
      closePop();
      return;
    }
    place();
  }

  function place() {
    if (!pop || !popBtn) return;
    var r = popBtn.getBoundingClientRect();
    var w = pop.offsetWidth,
      h = pop.offsetHeight;
    var vw = document.documentElement.clientWidth,
      vh = document.documentElement.clientHeight;
    var left = Math.min(Math.max(8, r.right - w), Math.max(8, vw - w - 8));
    var top = r.bottom + 6;
    if (top + h > vh - 8) top = Math.max(8, r.top - h - 6);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  // Surligne le début / la fin / les jours entre les deux. Pendant le choix du
  // second jour, `hover` fait apparaître un aperçu de la plage.
  function paint(hover) {
    if (!pop) return;
    var a = null,
      b = null;
    if (startDay) {
      a = startDay;
      b = hover || startDay;
    } else {
      var r = parseRange(ST[popKey]);
      if (r) {
        a = r.from;
        b = r.to;
      }
    }
    if (a && b && a > b) {
      var t = a;
      a = b;
      b = t;
    }
    pop.querySelectorAll('.pcal-day').forEach(function (c) {
      var d = c.dataset.d;
      c.classList.toggle('sel', !!a && (d === a || d === b));
      c.classList.toggle('inrange', !!a && d > a && d < b);
    });
  }

  function hintText() {
    if (startDay) return 'Choisis maintenant le jour de fin';
    var r = parseRange(ST[popKey]);
    return r
      ? 'Du ' + fr(r.from) + ' au ' + fr(r.to) + ' — choisis un nouveau jour de début'
      : 'Choisis le jour de début';
  }

  function navBtn(label, delta, title) {
    var b = el('button', 'pcal-nav', label);
    b.type = 'button';
    b.title = title;
    b.dataset.nav = String(delta);
    return b;
  }

  function render() {
    pop.textContent = '';
    var y = view.y,
      m = view.m;

    var head = el('div', 'pcal-head');
    head.appendChild(navBtn('«', -12, 'Année précédente'));
    head.appendChild(navBtn('‹', -1, 'Mois précédent'));
    head.appendChild(el('div', 'pcal-title', MOIS[m] + ' ' + y));
    head.appendChild(navBtn('›', 1, 'Mois suivant'));
    head.appendChild(navBtn('»', 12, 'Année suivante'));
    pop.appendChild(head);

    var grid = el('div', 'pcal-grid');
    JOURS.forEach(function (j) {
      grid.appendChild(el('div', 'pcal-wd', j));
    });
    var lead = (new Date(y, m, 1).getDay() + 6) % 7; // semaine qui commence le lundi
    var nd = new Date(y, m + 1, 0).getDate();
    var today = todayStr();
    for (var i = 0; i < lead; i++) grid.appendChild(el('div', 'pcal-blank'));
    for (var d = 1; d <= nd; d++) {
      var ds = ymd(y, m, d);
      var c = el('button', 'pcal-day' + (ds === today ? ' today' : ''), String(d));
      c.type = 'button';
      c.dataset.d = ds;
      grid.appendChild(c);
    }
    // Toujours 6 lignes : le calendrier garde la même hauteur d'un mois à l'autre.
    for (var k = lead + nd; k < 42; k++) grid.appendChild(el('div', 'pcal-blank'));
    pop.appendChild(grid);

    var foot = el('div', 'pcal-foot');
    foot.appendChild(el('div', 'pcal-hint', hintText()));
    var clear = el('button', 'pcal-clear', 'Effacer');
    clear.type = 'button';
    clear.title = 'Revenir à la période TOUT';
    foot.appendChild(clear);
    pop.appendChild(foot);

    paint();
  }

  function openPop(btn) {
    var key = btn.dataset.chart;
    if (pop && popKey === key) {
      closePop(); // 2e clic sur le même bouton : on referme
      return;
    }
    closePop();
    popKey = key;
    popBtn = btn;
    startDay = null;
    var r = parseRange(ST[key]);
    var ref = r ? r.from : todayStr();
    view = {y: parseInt(ref.slice(0, 4), 10), m: parseInt(ref.slice(5, 7), 10) - 1};
    pop = el('div', 'pcal-pop');
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Choisir la période à analyser');
    document.body.appendChild(pop);
    render();
    place();
    document.addEventListener('pointerdown', onOutside, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
  }

  function redraw(key) {
    if (typeof redrawForKey === 'function') redrawForKey(key);
  }

  function applyRange(key, a, b) {
    closePop();
    ST[key] = makePeriod(a, b);
    syncAll();
    redraw(key);
  }

  function clearRange(key) {
    var btn = document.querySelector('.pcal-btn[data-chart="' + key + '"]');
    var group = btn && btn.closest('.period-btns');
    closePop();
    ST[key] = 'tout';
    if (group) {
      group.querySelectorAll('.pbtn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.p === 'tout');
      });
    }
    syncAll();
    redraw(key);
  }

  // Clics dans le calendrier et sur les boutons calendrier (délégation : les
  // boutons naissent et disparaissent avec les graphiques).
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var calBtn = t.closest('.pcal-btn');
    if (calBtn) {
      e.preventDefault();
      openPop(calBtn);
      return;
    }
    if (!pop || !pop.contains(t)) return;

    var nav = t.closest('.pcal-nav');
    if (nav) {
      var total = view.y * 12 + view.m + parseInt(nav.dataset.nav, 10);
      view = {y: Math.floor(total / 12), m: ((total % 12) + 12) % 12};
      render();
      return;
    }
    if (t.closest('.pcal-clear')) {
      clearRange(popKey);
      return;
    }
    var day = t.closest('.pcal-day');
    if (day) {
      if (!startDay) {
        startDay = day.dataset.d;
        pop.querySelector('.pcal-hint').textContent = hintText();
        paint();
      } else {
        applyRange(popKey, startDay, day.dataset.d);
      }
    }
  });
  document.addEventListener('mouseover', function (e) {
    if (!pop || !startDay || !e.target.closest) return;
    var day = e.target.closest('.pcal-day');
    if (day && pop.contains(day)) paint(day.dataset.d);
  });

  // ── 6. Intégration au thème ─────────────────────────────────────────
  // Ajoute les couleurs à la liste que l'éditeur de thème affiche (Paramètres
  // → Thème → Track Record), sans toucher à app-part1.js.
  if (typeof window.buildTV === 'function') {
    var _origBuildTV = window.buildTV;
    window.buildTV = function () {
      var tv = _origBuildTV.apply(this, arguments);
      THEME.forEach(function (t) {
        tv.push({v: t[0], l: t[1], page: 'Track Record', section: t[3]});
      });
      return tv;
    };
  }
})();
