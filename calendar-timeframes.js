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
// Infos de synthèse (en plus des 4 lignes déjà présentes dans chaque case — numéro,
// résultat, RR, trades — sans jamais ajouter de ligne supplémentaire, pour que les
// cases jour / semaine / mois gardent TOUTES la même taille) :
//   J    — sous le titre de chaque mois : nombre de trades, résultat, RR moyen.
//   SEM  — dans chaque case semaine : la ligne RR devient le RR MOYEN de la semaine,
//        et la variation vs la semaine précédente s'ajoute à la SUITE de la ligne
//        résultat (ex. « +379€ ▲+3.6% ») ; en tête de chaque colonne-mois : le
//        nombre de trades du mois ; sous le titre de l'année : trades, résultat, RR moyen.
//   MOIS — même principe, RR moyen de mois et variation vs le mois précédent sur la
//        ligne résultat ; sous le titre de l'année : trades, résultat, RR moyen.
//   (Pas de comparaison en % en mode J.) Variation = résultat de la période ÷ CAPITAL
//   À LA FIN de la période précédente (ex. capital de 10 000€ en fin de semaine
//   dernière + 500€ cette semaine = +5%) ; « — » si ce capital est nul.
//   RR moyen = total des RR de la période ÷ nombre de trades. Les trades BT suivent
//   la case BT.
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
/* Ligne de synthèse sous le titre d'un mois (J) ou d'une année (SEM / MOIS) */
.cal-stats {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 3px 16px;
  padding: 7px 10px; font-family: var(--mono); font-size: 10px;
  color: var(--cal-rr-cal-tc-color); border-bottom: 1px solid var(--cal-day-border);
}
.cal-stats b { font-weight: 700; }
.cal-stats .pos, .cal-delta.up { color: var(--cal-day-pos-cal-pnl-color); }
.cal-stats .neg, .cal-delta.down { color: var(--cal-day-neg-cal-pnl-color); }
/* Semaine / mois : mêmes 4 lignes que les cases jour (numéro, résultat, RR, trades) —
   AUCUNE ligne de plus, donc même taille de case partout : la variation s'ajoute à la
   SUITE de la ligne résultat, et RR devient le RR moyen sur sa ligne existante. */
.cal-pnl, .cal-rr { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.cal-delta { font-size: 0.92em; font-weight: 700; margin-left: 3px; color: var(--cal-rr-cal-tc-color); }
.cal-colstat { margin-top: 2px; font-size: 7px; opacity: 0.85; white-space: nowrap; }
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
  // + un index du capital cumulé (trades de la période choisie + payouts), pour
  // pouvoir répondre à « quel était le capital à la fin de telle date ? » (sert au
  // calcul de la variation en %, qui compare au capital de fin de période précédente).
  function aggregate() {
    var src = BT_STATE.cal ? APP.trades : realTrades();
    var wk = {},
      mo = {},
      byDate = {};
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
      byDate[t.date] = (byDate[t.date] || 0) + pnl;
    });
    // Cumul des trades, jour par jour, trié par date croissante.
    var capDates = Object.keys(byDate).sort();
    var cum = 0,
      capCum = [];
    capDates.forEach(function (d) {
      cum += byDate[d];
      capCum.push(cum);
    });
    // Cumul des payouts. Un payout sans date (ancien format) est traité comme déjà
    // survenu, donc toujours déduit — même règle que sur la carte KPI « Pay Out ».
    var alwaysPO = 0,
      byPO = {};
    lsAcc('tj_payouts', []).forEach(function (po) {
      var a = po.amount || 0;
      if (!po.date) alwaysPO += a;
      else byPO[po.date] = (byPO[po.date] || 0) + a;
    });
    var poDates = Object.keys(byPO).sort();
    var poCumV = 0,
      poCum = [];
    poDates.forEach(function (d) {
      poCumV += byPO[d];
      poCum.push(poCumV);
    });
    // Plus grand index d'un tableau de dates triées dont la date est ≤ dateStr (-1 si aucune).
    function floorIdx(dates, dateStr) {
      var lo = 0,
        hi = dates.length - 1,
        idx = -1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        if (dates[mid] <= dateStr) {
          idx = mid;
          lo = mid + 1;
        } else hi = mid - 1;
      }
      return idx;
    }
    function capAtEnd(dateStr) {
      var i1 = floorIdx(capDates, dateStr),
        i2 = floorIdx(poDates, dateStr);
      return CAPITAL() + (i1 >= 0 ? capCum[i1] : 0) - ((i2 >= 0 ? poCum[i2] : 0) + alwaysPO);
    }
    return {wk: wk, mo: mo, capAtEnd: capAtEnd};
  }

  // ── Formats et synthèse (nombre de trades, RR moyen, variation) ──
  function sgn(v) {
    return v >= 0 ? '+' : '';
  }
  function fmtEur(v) {
    return sgn(v) + v.toLocaleString('fr-FR') + '€';
  }
  function fmtAvgR(info) {
    return sgn(info.rr / info.count) + (info.rr / info.count).toFixed(2) + 'R';
  }
  function plural(n) {
    return n + ' trade' + (n > 1 ? 's' : '');
  }
  // Variation en % : résultat de la période ÷ capital à la FIN de la période
  // précédente (ex. 10 000€ en fin de semaine dernière, +500€ cette semaine → +5%).
  // null si ce capital est nul (rien à quoi rapporter la variation).
  function pctVsPrevCapital(cur, prevCapEnd) {
    if (!cur || Math.abs(prevCapEnd) < 0.005) return null;
    return (cur.pnl / prevCapEnd) * 100;
  }
  function fmtPct(p) {
    if (Math.abs(p) > 999) return (p > 0 ? '>+999%' : '<-999%');
    return sgn(p) + (Math.abs(p) < 10 ? p.toFixed(1) : String(Math.round(p))) + '%';
  }
  // Élément EN LIGNE (pas de bloc) : s'ajoute à la suite du texte déjà présent sur
  // la ligne résultat, sans jamais créer de nouvelle ligne dans la case.
  function deltaHtml(pct) {
    if (pct === null) return ' <span class="cal-delta">—</span>';
    return ' <span class="cal-delta ' + (pct >= 0 ? 'up' : 'down') + '">' + (pct >= 0 ? '▲' : '▼') + fmtPct(pct) + '</span>';
  }
  // Ligne de synthèse : nombre de trades · résultat · RR moyen
  function statsHtml(info) {
    if (!info || !info.count) return '<div class="cal-stats"><span>Aucun trade</span></div>';
    return (
      '<div class="cal-stats"><span><b>' + plural(info.count) + '</b></span>' +
      '<span>Résultat <b class="' + (info.pnl >= 0 ? 'pos' : 'neg') + '">' + fmtEur(info.pnl) + '</b></span>' +
      '<span>RR moyen <b>' + fmtAvgR(info) + '</b></span></div>'
    );
  }
  function sumYear(moAgg, Y) {
    var tot = {pnl: 0, rr: 0, count: 0};
    Object.keys(moAgg).forEach(function (k) {
      if (k.slice(0, 4) === String(Y)) {
        tot.pnl += moAgg[k].pnl;
        tot.rr += moAgg[k].rr;
        tot.count += moAgg[k].count;
      }
    });
    return tot;
  }
  function ymdUTC(d) {
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  }

  // Même 4 lignes que les cases « jour » (numéro, résultat, RR, trades) — jamais une
  // ligne de plus : en semaine / mois (cmp fourni), la ligne RR affiche la MOYENNE
  // au lieu du total, et la variation s'ajoute à la suite de la ligne résultat.
  function cellHtml(label, info, isToday, title, cmp) {
    var cls = 'cal-day';
    if (isToday) cls += ' today';
    if (info) cls += info.pnl >= 0 ? ' pos' : ' neg';
    var rrTxt = info ? (cmp ? fmtAvgR(info) : (info.rr >= 0 ? '+' : '') + info.rr.toFixed(1) + 'R') : '';
    return (
      '<div class="' + cls + '" title="' + title + '"><div class="cal-day-num">' + label + '</div>' +
      (info
        ? '<div class="cal-pnl">' + fmtEur(info.pnl) + (cmp ? deltaHtml(pctVsPrevCapital(info, cmp.prevCapEnd)) : '') + '</div>' +
          '<div class="cal-rr">' + rrTxt + '</div>' +
          '<div class="cal-tc">' + info.count + 'T</div>'
        : '') +
      '</div>'
    );
  }
  // Infobulle d'une case semaine / mois : détail complet (le RR de la ligne étant
  // déjà la moyenne, l'infobulle ne fait que la nommer explicitement).
  function cellTitle(name, info, prevCapEnd, prevName) {
    if (!info) return name;
    var t = name + ' — ' + plural(info.count) + ' · résultat ' + fmtEur(info.pnl) + ' · RR moyen ' + fmtAvgR(info);
    var v = pctVsPrevCapital(info, prevCapEnd);
    if (v !== null) t += ' · ' + fmtPct(v) + ' du capital de fin ' + prevName + ' (' + fmtEur(prevCapEnd) + ')';
    return t;
  }

  function todayStr() {
    var n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }

  // ── 4. Une année en semaines (12 colonnes = 12 mois) ou en mois ─────
  function weeksHtml(Y, wkAgg, moAgg, todayWeekKey, capAtEnd) {
    var weeks = isoWeeksOfYear(Y);
    var cols = '';
    for (var m = 0; m < 12; m++) {
      var cells = weeks
        .filter(function (w) {
          return w.month === m;
        })
        .map(function (w) {
          var key = Y + '-' + w.week;
          var pw = isoWeekOf(ymdUTC(new Date(w.mon.getTime() - 7 * DAY_MS))); // semaine précédente
          var prevSun = new Date(w.mon.getTime() - DAY_MS); // dimanche précédent = fin de la semaine d'avant
          var prevCapEnd = capAtEnd(ymdUTC(prevSun));
          return cellHtml(
            'S' + w.week,
            wkAgg[key],
            key === todayWeekKey,
            cellTitle('Semaine ' + w.week + ' (du ' + frDate(w.mon) + ' au ' + frDate(w.sun) + ')', wkAgg[key], prevCapEnd, 'S' + pw.week),
            {prevCapEnd: prevCapEnd}
          );
        })
        .join('');
      var mInfo = moAgg[Y + '-' + String(m + 1).padStart(2, '0')];
      var head =
        MONTH_SHORT[m] +
        '<div class="cal-colstat">' + (mInfo ? plural(mInfo.count) : '0 trade') + '</div>';
      cols +=
        '<div class="cal-wcol"><div class="cal-dow" title="' +
        (mInfo ? MNL[m] + ' ' + Y + ' — ' + plural(mInfo.count) + ' · résultat ' + fmtEur(mInfo.pnl) + ' · RR moyen ' + fmtAvgR(mInfo) : MNL[m] + ' ' + Y + ' — aucun trade') +
        '">' + head + '</div>' + cells + '</div>';
    }
    return '<div class="cal-yscroll"><div class="cal-grid-weeks">' + cols + '</div></div>';
  }
  function monthsHtml(Y, moAgg, todayMonthKey, capAtEnd) {
    var cells = '';
    for (var m = 0; m < 12; m++) {
      var key = Y + '-' + String(m + 1).padStart(2, '0');
      var pName = m === 0 ? MNL[11] + ' ' + (Y - 1) : MNL[m - 1] + ' ' + Y;
      // Dernier jour du mois précédent : Date.UTC(Y, m, 0) recule automatiquement d'une
      // année en janvier (mois -1 → décembre de Y-1).
      var prevCapEnd = capAtEnd(ymdUTC(new Date(Date.UTC(Y, m, 0))));
      cells += cellHtml(MNL[m], moAgg[key], key === todayMonthKey, cellTitle(MNL[m] + ' ' + Y, moAgg[key], prevCapEnd, pName), {prevCapEnd: prevCapEnd});
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
      var body =
        mode === 'semaine'
          ? weeksHtml(Y, agg.wk, agg.mo, todayWeekKey, agg.capAtEnd)
          : monthsHtml(Y, agg.mo, todayMonthKey, agg.capAtEnd);
      document.getElementById(p[1]).innerHTML = head + statsHtml(sumYear(agg.mo, Y)) + body;
    });
  }

  // ── 5. Enveloppes de renderCalendar / calYear / calMonth ────────────
  function applyBarState() {
    var bar = document.querySelector('.cal-nav-surface');
    if (bar) bar.classList.toggle('cal-tf-year', mode !== 'jour');
  }
  // Mode J : la synthèse (trades, résultat, RR moyen — sans comparaison en %) est
  // ajoutée sous le titre de chacun des 3 mois affichés.
  function addMonthStats() {
    var mo = aggregate().mo;
    [[-1, 'calPrev'], [0, 'calCur'], [1, 'calNext']].forEach(function (p) {
      var d = new Date(calD.getFullYear(), calD.getMonth() + p[0], 1);
      var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      var hdr = document.querySelector('#' + p[1] + ' .cal-month-header');
      if (hdr) hdr.insertAdjacentHTML('afterend', statsHtml(mo[key]));
    });
  }
  if (typeof window.renderCalendar === 'function') {
    var _origRenderCalendar = window.renderCalendar;
    window.renderCalendar = function () {
      applyBarState();
      if (mode === 'jour') {
        var r = _origRenderCalendar.apply(this, arguments);
        addMonthStats();
        return r;
      }
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
