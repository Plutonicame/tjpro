// ═══════════════════════════════════════════════════════════════════════
// CALENDRIER — TIMEFRAMES J / SEM / MOIS · module additif, zéro-édition
// ═══════════════════════════════════════════════════════════════════════
// Ajoute dans la barre du haut de la page Calendrier (à côté de la case BT)
// trois boutons de timeframe, comme sur les graphiques :
//
//   J    (par défaut) — affichage actuel : mois précédent / mois affiché /
//        mois suivant, une case par jour.
//   SEM  — 3 années (précédente / affichée / suivante), une case par
//        SEMAINE. Chaque année est rangée par mois : une colonne = un mois
//        (environ 4 semaines).
//   MOIS — 3 années (précédente / affichée / suivante), une case par MOIS.
//
// Les cases affichent la même chose que les cases « jour » (résultat en €,
// RR, nombre de trades) et suivent la case BT. Les flèches d'année décalent
// la fenêtre d'une année ; en SEM / MOIS les flèches de mois disparaissent
// (elles n'ont plus de sens). La navigation va du début du compte (2020 au
// plus tôt, ou l'année du 1er trade s'il est plus ancien) jusqu'à 5 ans dans
// le futur.
//
// Semaines = semaines ISO (lundi → dimanche, numérotées comme partout :
// 52 ou 53 par an). Une semaine est rangée dans le mois de son jeudi (règle
// ISO) : chaque semaine apparaît donc une seule fois dans l'année, et ses
// trades ne sont jamais comptés deux fois.
//
// Aucune couleur nouvelle : les boutons réutilisent les boutons de période des
// graphiques (.pbtn) et les cases celles du calendrier (.cal-day, .cal-dow,
// .cal-month-header...) — tout reste réglable avec les couleurs de thème déjà
// existantes.
//
// N'édite aucun fichier existant : enveloppe renderCalendar(), calYear() et
// calMonth(), et ajoute une seule ligne dans index.html.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var MONTH_SHORT = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
  var DAY_MS = 864e5;
  var mode = 'jour'; // 'jour' | 'semaine' | 'mois' — J par défaut à chaque ouverture de l'app

  // ── 1. Style ────────────────────────────────────────────────────────
  var CSS = `
.cal-tf-btns { align-items: center; }
.cal-yscroll { overflow-x: auto; }
.cal-grid-weeks {
  display: grid; grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 2px; padding: 5px;
}
.cal-wcol { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cal-grid-months {
  display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 2px; padding: 5px;
}
.cal-nav-surface.cal-tf-year > .cal-arr,
.cal-nav-surface.cal-tf-year > .cal-label { display: none; }
@media (max-width: 700px) {
  .cal-nav-surface.cal-has-tf { flex-wrap: wrap; }
  .cal-nav-surface.cal-has-tf .cal-tf-btns { flex: 0 0 100%; justify-content: center; }
  .cal-grid-weeks { min-width: 720px; }
  .cal-grid-months { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
`;
  var styleTag = document.createElement('style');
  styleTag.id = 'tjp-calendar-timeframes-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  // ── 2. Dates : semaines ISO ─────────────────────────────────────────
  function isoWeekOf(ds) {
    var d = new Date(ds + 'T12:00:00');
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) + 3); // jeudi de la semaine
    var year = t.getUTCFullYear();
    var ft = new Date(Date.UTC(year, 0, 4));
    var week = 1 + Math.round(((t - ft) / DAY_MS - 3 + ((ft.getUTCDay() + 6) % 7)) / 7);
    return {year: year, week: week};
  }
  // Les semaines de l'année ISO Y, avec le mois (du jeudi) où chacune est rangée.
  function isoWeeksOfYear(Y) {
    var jan4 = new Date(Date.UTC(Y, 0, 4));
    var mon1 = new Date(Date.UTC(Y, 0, 4 - ((jan4.getUTCDay() + 6) % 7)));
    var out = [];
    for (var i = 0; i < 54; i++) {
      var mon = new Date(mon1.getTime() + i * 7 * DAY_MS);
      var thu = new Date(mon.getTime() + 3 * DAY_MS);
      if (thu.getUTCFullYear() !== Y) break;
      out.push({week: i + 1, mon: mon, sun: new Date(mon.getTime() + 6 * DAY_MS), month: thu.getUTCMonth()});
    }
    return out;
  }
  function frDate(d) {
    return (
      String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear()
    );
  }

  // ── 3. Totaux par semaine et par mois (même calcul que les cases « jour ») ──
  function aggregate() {
    var src = BT_STATE.cal ? APP.trades : realTrades();
    var wk = {},
      mo = {};
    src.forEach(function (t) {
      if (!t.date) return;
      var pnl = t.res || 0,
        rr = computeRR(t);
      var iw = isoWeekOf(t.date);
      var kw = iw.year + '-' + iw.week;
      var w = wk[kw] || (wk[kw] = {pnl: 0, rr: 0, count: 0});
      w.pnl += pnl;
      w.rr += rr;
      w.count++;
      var km = t.date.slice(0, 7);
      var m = mo[km] || (mo[km] = {pnl: 0, rr: 0, count: 0});
      m.pnl += pnl;
      m.rr += rr;
      m.count++;
    });
    return {wk: wk, mo: mo};
  }

  // Même contenu que les cases « jour » : numéro / libellé, résultat, RR, trades.
  function cellHtml(label, info, isToday, title) {
    var cls = 'cal-day';
    if (isToday) cls += ' today';
    if (info) cls += info.pnl >= 0 ? ' pos' : ' neg';
    return (
      '<div class="' + cls + '" title="' + title + '"><div class="cal-day-num">' + label + '</div>' +
      (info
        ? '<div class="cal-pnl">' + (info.pnl >= 0 ? '+' : '') + info.pnl.toLocaleString('fr-FR') + '€</div>' +
          '<div class="cal-rr">' + (info.rr >= 0 ? '+' : '') + info.rr.toFixed(1) + 'R</div>' +
          '<div class="cal-tc">' + info.count + 'T</div>'
        : '') +
      '</div>'
    );
  }

  function todayStr() {
    var n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }

  // ── 4. Une année en semaines (12 colonnes = 12 mois) ou en mois ─────
  function weeksHtml(Y, wkAgg, todayWeekKey) {
    var weeks = isoWeeksOfYear(Y);
    var cols = '';
    for (var m = 0; m < 12; m++) {
      var cells = weeks
        .filter(function (w) {
          return w.month === m;
        })
        .map(function (w) {
          var key = Y + '-' + w.week;
          return cellHtml(
            'S' + w.week,
            wkAgg[key],
            key === todayWeekKey,
            'Semaine ' + w.week + ' — du ' + frDate(w.mon) + ' au ' + frDate(w.sun)
          );
        })
        .join('');
      cols += '<div class="cal-wcol"><div class="cal-dow">' + MONTH_SHORT[m] + '</div>' + cells + '</div>';
    }
    return '<div class="cal-yscroll"><div class="cal-grid-weeks">' + cols + '</div></div>';
  }
  function monthsHtml(Y, moAgg, todayMonthKey) {
    var cells = '';
    for (var m = 0; m < 12; m++) {
      var key = Y + '-' + String(m + 1).padStart(2, '0');
      cells += cellHtml(MNL[m], moAgg[key], key === todayMonthKey, MNL[m] + ' ' + Y);
    }
    return '<div class="cal-grid-months">' + cells + '</div>';
  }

  function renderYears() {
    var y = calD.getFullYear();
    document.getElementById('calYear').textContent = y;
    var agg = aggregate();
    var today = todayStr();
    var iw = isoWeekOf(today);
    var todayWeekKey = iw.year + '-' + iw.week;
    var todayMonthKey = today.slice(0, 7);
    var nowYear = new Date().getFullYear();
    [[-1, 'calPrev'], [0, 'calCur'], [1, 'calNext']].forEach(function (p) {
      var Y = y + p[0];
      var head =
        '<div class="cal-month-header' + (p[0] === 0 ? ' cur' : '') + '">' + Y + (Y === nowYear ? ' — Année en cours' : '') + '</div>';
      var body = mode === 'semaine' ? weeksHtml(Y, agg.wk, todayWeekKey) : monthsHtml(Y, agg.mo, todayMonthKey);
      document.getElementById(p[1]).innerHTML = head + body;
    });
  }

  // ── 5. Enveloppes de renderCalendar / calYear / calMonth ────────────
  function applyBarState() {
    var bar = document.querySelector('.cal-nav-surface');
    if (bar) bar.classList.toggle('cal-tf-year', mode !== 'jour');
  }
  if (typeof window.renderCalendar === 'function') {
    var _origRenderCalendar = window.renderCalendar;
    window.renderCalendar = function () {
      applyBarState();
      if (mode === 'jour') return _origRenderCalendar.apply(this, arguments);
      return renderYears();
    };
  }

  // Bornes de navigation : du début du compte (2020 au plus tôt, ou plus ancien
  // si un trade date d'avant) jusqu'à 5 ans dans le futur.
  function yearBounds() {
    var min = 2020;
    APP.trades.forEach(function (t) {
      if (t.date) {
        var y = parseInt(t.date.slice(0, 4), 10);
        if (y > 1900 && y < min) min = y;
      }
    });
    return {min: min, max: new Date().getFullYear() + 5};
  }
  window.calYear = function (d) {
    var y = calD.getFullYear() + d,
      b = yearBounds();
    if (y < b.min || y > b.max) return;
    calD.setFullYear(y);
    renderCalendar();
  };
  window.calMonth = function (d) {
    var next = new Date(calD.getFullYear(), calD.getMonth() + d, 1),
      b = yearBounds();
    if (next.getFullYear() < b.min || next.getFullYear() > b.max) return;
    calD.setTime(next.getTime());
    renderCalendar();
  };

  // ── 6. Boutons J / SEM / MOIS dans la barre ─────────────────────────
  var TF = [
    ['jour', 'J', 'Une case par jour (affichage habituel)'],
    ['semaine', 'SEM', 'Une case par semaine, années rangées par mois'],
    ['mois', 'MOIS', 'Une case par mois']
  ];
  function injectButtons() {
    var bar = document.querySelector('.cal-nav-surface');
    if (!bar || bar.querySelector('.cal-tf-btns')) return;
    var group = document.createElement('div');
    group.className = 'period-btns cal-tf-btns';
    TF.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pbtn' + (t[0] === mode ? ' active' : '');
      b.dataset.calTf = t[0];
      b.textContent = t[1];
      b.title = t[2];
      group.appendChild(b);
    });
    var bt = bar.querySelector('.bt-toggle');
    if (bt && bt.nextSibling) bar.insertBefore(group, bt.nextSibling);
    else bar.appendChild(group);
    bar.classList.add('cal-has-tf');
    applyBarState();
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.pbtn[data-cal-tf]');
    if (!btn) return;
    mode = btn.dataset.calTf;
    btn.closest('.period-btns')
      .querySelectorAll('.pbtn')
      .forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
    renderCalendar();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectButtons);
  else injectButtons();
})();
