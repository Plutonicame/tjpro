// ═══════════════════════════════════════════════════════════════════════
// PAIRE / ACTIF → BOUTON BASCULE + COMPARAISON PAR DEVISE — TJP · module
// additif, zéro-édition (demande de Paul, 24/09/2026)
// ═══════════════════════════════════════════════════════════════════════
// Remplace le simple menu déroulant "Paire / Actif" du formulaire (ajout
// ET édition) par un bouton bascule "Actif" / "Paire" à gauche du champ
// (même esprit visuel que le bouton "+" de partial-results.js) :
//  - Mode "Actif" (par défaut) : comportement inchangé, le menu déroulant
//    natif (#f-paire / #e-paire, liste "Paires / Actifs" existante) reste
//    seul visible.
//  - Mode "Paire" : le menu déroulant natif est masqué, remplacé par 2
//    menus déroulants côte à côte séparés par un "/", pour choisir 2
//    devises tradées l'une contre l'autre (ex. USD / CHF). Les valeurs
//    viennent d'une NOUVELLE liste personnalisable "Paire de Forex",
//    ajoutée dans Paramètres à côté des 6 listes natives (même système
//    d'ajout/suppression/glisser-déposer, réutilisé tel quel).
//
// Aucune nouvelle colonne dans l'historique : le champ "paire" du trade
// reçoit directement "USD/CHF" (1ère devise choisie, "/", 2e devise) —
// l'historique et le graphique existant "PAR PAIRE / ACTIF" continuent de
// fonctionner sans aucune modification.
//
// Un champ interne supplémentaire ("devises", format "USD|CHF") est ajouté
// au trade UNIQUEMENT en mode Paire, pour alimenter un nouveau graphique
// de comparaison "COMPARAISON PAR DEVISE" dans Track Record (réutilise le
// mode "multi" déjà existant de drawComp() : le résultat total du trade est
// compté pour CHAQUE devise, pas partagé entre les 2). Ce graphique ne
// s'affiche que si au moins un trade utilise le mode Paire — un compte qui
// ne trade que des actifs (ex. S&P500) ne le voit jamais.
//
// N'édite aucun fichier existant : une seule ligne ajoutée dans index.html
// pour charger ce fichier (après tous les autres modules additifs).
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var PXD_DEFAULT_DEVISES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];

  // ── 1. Style ──────────────────────────────────────────────────────────
  var CSS = `
:root {
  --mt-devises: #0984e3;
  --ct-comp-devises: #00e5a0;
  --pxd-toggle-bg: #111827;
  --pxd-toggle-bd: #1e2d45;
  --pxd-toggle-tx: #e2e8f0;
}
.pxd-top { display: flex; align-items: center; gap: 6px; }
.pxd-top > select { flex: 1; min-width: 0; }
.pxd-toggle-btn {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 5px;
  font-family: var(--sans);
  font-size: 11px; font-weight: 700; line-height: 1;
  white-space: nowrap;
  padding: 7px 10px;
  cursor: pointer;
  background: var(--pxd-toggle-bg);
  border: 1px solid var(--pxd-toggle-bd);
  color: var(--pxd-toggle-tx);
  transition: border-color 0.15s;
}
.pxd-toggle-btn:hover { border-color: var(--pxd-toggle-tx); }
.pxd-pair-wrap { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; }
.pxd-pair-wrap select { flex: 1; min-width: 0; }
.pxd-sep { flex-shrink: 0; font-family: var(--mono); color: var(--muted); font-size: 13px; }
`;
  var styleTag = document.createElement('style');
  styleTag.id = 'tjp-pair-forex-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  // ── 2. Champ du formulaire : bouton bascule + double menu déroulant ────
  // Le menu natif (#f-paire / #e-paire) est déplacé DANS la ligne, à côté
  // du bouton, plutôt que recréé — on garde donc gratuitement tout son
  // fonctionnement existant (population, sauvegarde, etc.) en mode Actif.
  function pxdSetupFieldGroup(prefix) {
    var sel = document.getElementById(prefix + '-paire');
    if (!sel || sel.dataset.pxdDone) return;
    sel.dataset.pxdDone = '1';
    var fg = sel.closest('.fg');
    if (!fg) return;
    var label = fg.querySelector('label');

    var row = document.createElement('div');
    row.className = 'pxd-top';
    fg.insertBefore(row, sel);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pxd-toggle-btn';
    btn.id = 'pxdToggleBtn-' + prefix;
    btn.dataset.mode = 'actif';
    btn.textContent = 'Actif';
    btn.title = 'Basculer entre un actif unique et une paire de 2 devises';
    btn.onclick = function () {
      pxdToggleMode(prefix);
    };
    row.appendChild(btn);
    row.appendChild(sel); // déplace le select natif existant dans la ligne

    var pairWrap = document.createElement('div');
    pairWrap.className = 'pxd-pair-wrap';
    pairWrap.id = 'pxdPairWrap-' + prefix;
    pairWrap.style.display = 'none';
    var s1 = document.createElement('select');
    s1.id = prefix + '-devise1';
    var sep = document.createElement('span');
    sep.className = 'pxd-sep';
    sep.textContent = '/';
    var s2 = document.createElement('select');
    s2.id = prefix + '-devise2';
    pairWrap.appendChild(s1);
    pairWrap.appendChild(sep);
    pairWrap.appendChild(s2);
    row.appendChild(pairWrap);

    // Le texte "Paire / Actif" repasse en dernier enfant de .fg (qui est en
    // colonne) : il se retrouve donc affiché sous la ligne bouton+menu(s),
    // à la même taille qu'avant (sa classe .fg label n'est pas touchée).
    if (label) fg.appendChild(label);

    pxdPopulateDeviseSelects(prefix);
  }

  function pxdEnsureDevisesList() {
    if (!APP.lists.devises) APP.lists.devises = PXD_DEFAULT_DEVISES.slice();
  }

  function pxdPopulateDeviseSelects(prefix) {
    pxdEnsureDevisesList();
    ['1', '2'].forEach(function (n) {
      var s = document.getElementById(prefix + '-devise' + n);
      if (!s) return;
      var v = s.value;
      s.innerHTML =
        '<option value="">—</option>' +
        APP.lists.devises.map(function (i) {
          return '<option>' + escapeHtml(i) + '</option>';
        }).join('');
      if (v) s.value = v;
    });
  }

  function pxdSetMode(prefix, mode) {
    var btn = document.getElementById('pxdToggleBtn-' + prefix);
    var sel = document.getElementById(prefix + '-paire');
    var wrap = document.getElementById('pxdPairWrap-' + prefix);
    if (!btn || !sel || !wrap) return;
    btn.dataset.mode = mode;
    btn.textContent = mode === 'devise' ? 'Paire' : 'Actif';
    sel.style.display = mode === 'devise' ? 'none' : '';
    wrap.style.display = mode === 'devise' ? 'flex' : 'none';
  }

  function pxdToggleMode(prefix) {
    var btn = document.getElementById('pxdToggleBtn-' + prefix);
    var current = btn ? btn.dataset.mode : 'actif';
    pxdSetMode(prefix, current === 'devise' ? 'actif' : 'devise');
  }

  // Valeur à appliquer au trade selon le mode courant du formulaire donné.
  // mode 'devise' seulement si les 2 devises sont renseignées — sinon on
  // se comporte comme si le champ était resté en mode Actif (pas de
  // pollution du graphique de comparaison avec une paire incomplète).
  function pxdReadFormValue(prefix) {
    var btn = document.getElementById('pxdToggleBtn-' + prefix);
    var mode = btn ? btn.dataset.mode : 'actif';
    if (mode === 'devise') {
      var d1 = (document.getElementById(prefix + '-devise1') || {}).value || '';
      var d2 = (document.getElementById(prefix + '-devise2') || {}).value || '';
      if (d1 && d2) return {paireType: 'devise', paire: d1 + '/' + d2, devises: d1 + '|' + d2};
      return {paireType: 'actif', paire: d1 || d2 || '', devises: ''};
    }
    return {paireType: 'actif', paire: null, devises: ''}; // null = ne pas toucher t.paire (déjà lu par le code natif)
  }

  // ── 3. Liste personnalisable "Paire de Forex" (Paramètres) ─────────────
  // Réutilise tel quel le système générique addListItem()/removeListItem()
  // (APP.lists[key]) déjà utilisé par les 6 listes natives — cette carte
  // est juste ajoutée après elles dans #modGrid, sans toucher renderModifs().
  function pxdRenderDeviseListCard() {
    var grid = document.getElementById('modGrid');
    if (!grid) return;
    pxdEnsureDevisesList();
    var items = APP.lists.devises;
    var html =
      '<div class="mod-col" id="pxdDeviseCol">' +
      '<div class="mod-col-hdr"><span class="mod-col-title" data-editable style="color:var(--mt-devises)">Paire de Forex</span><span style="font-size:9px;color:var(--muted)">' +
      items.length +
      '</span></div>' +
      '<div class="mod-list" id="ml-devises">' +
      items
        .map(function (item, i) {
          return (
            '<div class="mod-item"><span class="drag-h">⣿</span><span class="item-tx">' +
            escapeHtml(item) +
            '</span><button class="del-item" onclick="removeListItem(\'devises\',' +
            i +
            ')">×</button></div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="mod-add"><input type="text" id="ma-devises" placeholder="Ajouter..." onkeydown="if(event.key===\'Enter\')addListItem(\'devises\')"><button onclick="addListItem(\'devises\')">+</button></div>' +
      '</div>';
    grid.insertAdjacentHTML('beforeend', html);
    var el = document.getElementById('ml-devises');
    if (el && window.Sortable) {
      new Sortable(el, {
        animation: 120,
        handle: '.drag-h',
        onEnd: function (evt) {
          var list = APP.lists.devises;
          var moved = list.splice(evt.oldIndex, 1)[0];
          list.splice(evt.newIndex, 0, moved);
          saveState();
          if (typeof populateSelects === 'function') populateSelects();
          if (typeof currentUser !== 'undefined' && currentUser && !_isSyncing) schedulePush(300);
        }
      });
    }
  }

  if (typeof window.renderModifs === 'function') {
    var _pxdOrigRenderModifs = window.renderModifs;
    window.renderModifs = function () {
      var r = _pxdOrigRenderModifs.apply(this, arguments);
      pxdRenderDeviseListCard();
      return r;
    };
  }

  if (typeof window.populateSelects === 'function') {
    var _pxdOrigPopulateSelects = window.populateSelects;
    window.populateSelects = function () {
      var r = _pxdOrigPopulateSelects.apply(this, arguments);
      pxdPopulateDeviseSelects('f');
      return r;
    };
  }

  // ── 4. Graphique "COMPARAISON PAR DEVISE" (Track Record) ───────────────
  // N'apparaît que si au moins un trade a été saisi en mode Paire.
  // Réutilise directement drawComp() en mode "multi" (comme les graphiques
  // Confluence/Timeframe) : le résultat total du trade est ajouté à CHAQUE
  // devise de la paire — exactement le comportement demandé.
  if (typeof window.ST !== 'undefined' && ST.devises === undefined) ST.devises = 'tout';
  if (typeof window.MODE !== 'undefined' && MODE.devises === undefined) MODE.devises = false;
  if (typeof window.BT_STATE !== 'undefined' && BT_STATE.devises === undefined)
    BT_STATE.devises = false;

  function pxdHasDeviseTrades() {
    return (
      Array.isArray(APP.trades) &&
      APP.trades.some(function (t) {
        return t.paireType === 'devise' && t.devises;
      })
    );
  }

  function pxdCardHtml() {
    return (
      '<div class="chart-card" style="background:var(--comp-bg)" id="pxdChartCard">' +
      '<div class="chart-header">' +
      '<div class="chart-title" data-editable data-tvar="--ct-comp-devises" style="color:var(--ct-comp-devises,#00e5a0)">COMPARAISON PAR DEVISE</div>' +
      '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
      '<label class="bt-toggle"><input type="checkbox" id="bt-devises" onchange="toggleBT(\'devises\')"> BT</label>' +
      '<div class="tgl-wrap"><span>€</span><div class="tgl-track" id="tgl-devises" onclick="toggleMode(\'devises\')"><div class="tgl-thumb"></div></div><span>%</span></div>' +
      '<div class="period-btns">' +
      '<button class="pbtn" data-chart="devises" data-p="jour">J</button>' +
      '<button class="pbtn" data-chart="devises" data-p="semaine">SEM</button>' +
      '<button class="pbtn" data-chart="devises" data-p="mois">MOIS</button>' +
      '<button class="pbtn" data-chart="devises" data-p="trimestre">TRIM</button>' +
      '<button class="pbtn" data-chart="devises" data-p="annee">AN</button>' +
      '<button class="pbtn active" data-chart="devises" data-p="tout">TOUT</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="chart-body" style="height:220px"><canvas id="cDevises"></canvas></div>' +
      '</div>'
    );
  }

  function pxdDrawComp(period) {
    if (!document.getElementById('cDevises')) return;
    if (typeof drawComp === 'function')
      drawComp('cDevises', 'devises', 'devises', period || ST.devises, MODE.devises, true);
  }

  function pxdSyncChartCard() {
    var container = document.getElementById('compCharts');
    if (!container) return;
    var existing = document.getElementById('pxdChartCard');
    if (pxdHasDeviseTrades()) {
      if (!existing) {
        container.insertAdjacentHTML('beforeend', pxdCardHtml());
        var tgl = document.getElementById('tgl-devises');
        if (tgl) tgl.classList.toggle('on', !!MODE.devises);
        var bt = document.getElementById('bt-devises');
        if (bt) bt.checked = !!BT_STATE.devises;
      }
      pxdDrawComp(ST.devises);
    } else if (existing) {
      if (typeof destroy === 'function') destroy('devises');
      existing.remove();
    }
  }

  // Boutons de période : délégation d'événement (même technique que
  // custom-fields.js pour ses propres graphiques "cf_") plutôt que de
  // rappeler bindPBtns(), pour ne jamais ré-attacher de listener sur les
  // boutons natifs des autres graphiques de comparaison.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.pbtn[data-chart="devises"]');
    if (!btn) return;
    ST.devises = btn.dataset.p;
    var grp = btn.closest('.period-btns');
    if (grp)
      grp.querySelectorAll('.pbtn').forEach(function (b) {
        b.classList.remove('active');
      });
    btn.classList.add('active');
    pxdDrawComp(ST.devises);
  });

  if (typeof window.buildCompCharts === 'function') {
    var _pxdOrigBuildCompCharts = window.buildCompCharts;
    window.buildCompCharts = function () {
      var r = _pxdOrigBuildCompCharts.apply(this, arguments);
      pxdSyncChartCard();
      return r;
    };
  }
  if (typeof window.refreshAllCharts === 'function') {
    var _pxdOrigRefreshAllCharts = window.refreshAllCharts;
    window.refreshAllCharts = function () {
      var r = _pxdOrigRefreshAllCharts.apply(this, arguments);
      pxdSyncChartCard();
      return r;
    };
  }
  if (typeof window.toggleMode === 'function') {
    var _pxdOrigToggleMode = window.toggleMode;
    window.toggleMode = function (k) {
      if (k === 'devises') {
        MODE.devises = !MODE.devises;
        var tgl = document.getElementById('tgl-devises');
        if (tgl) tgl.classList.toggle('on', MODE.devises);
        pxdDrawComp(ST.devises);
        return;
      }
      return _pxdOrigToggleMode.apply(this, arguments);
    };
  }
  if (typeof window.redrawForKey === 'function') {
    var _pxdOrigRedrawForKey = window.redrawForKey;
    window.redrawForKey = function (k) {
      if (k === 'devises') {
        pxdDrawComp(ST.devises);
        return;
      }
      return _pxdOrigRedrawForKey.apply(this, arguments);
    };
  }

  // ── 5. Intégration au thème (mode stylo + éditeur de Thème) ─────────────
  if (typeof window.buildTV === 'function') {
    var _pxdOrigBuildTV = window.buildTV;
    window.buildTV = function () {
      var tv = _pxdOrigBuildTV.apply(this, arguments);
      tv.push(
        {v: '--mt-devises', l: 'Titre Paire de Forex', page: 'Paramètres', section: 'Listes personnalisables'},
        {v: '--ct-comp-devises', l: 'Titre — Par devise', page: 'Track Record', section: 'Comparaisons'},
        {
          v: '--pxd-toggle-bg',
          l: 'Bouton Paire/Actif - fond',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        },
        {
          v: '--pxd-toggle-bd',
          l: 'Bouton Paire/Actif - bordure',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        },
        {
          v: '--pxd-toggle-tx',
          l: 'Bouton Paire/Actif - texte',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        }
      );
      return tv;
    };
  }

  // ── 6. Accroche sur les vraies sauvegardes/ouvertures ───────────────────
  // Même technique que custom-fields.js/partial-results.js : on laisse le
  // code natif faire son travail (il lit une valeur quelconque dans
  // #f-paire/#e-paire, sans importance), puis on corrige le trade juste
  // ajouté/modifié avec la bonne valeur, et on re-sauvegarde/redessine.
  if (typeof window.addTrade === 'function') {
    var _pxdOrigAddTrade = window.addTrade;
    window.addTrade = function () {
      var idBefore = APP.nextId;
      var info = pxdReadFormValue('f');
      var r = _pxdOrigAddTrade.apply(this, arguments);
      try {
        var t = APP.trades[0];
        if (t && t.id === idBefore) {
          t.paireType = info.paireType;
          t.devises = info.devises;
          if (info.paire !== null) t.paire = info.paire;
          saveState();
          renderTable();
          if (
            document.getElementById('page-trackrecord') &&
            document.getElementById('page-trackrecord').classList.contains('active')
          )
            refreshAllCharts();
          if (typeof currentUser !== 'undefined' && currentUser && !_isSyncing) schedulePush(300);
        }
      } catch (e) {
        console.warn('PXD addTrade:', e);
      }
      return r;
    };
  }

  if (typeof window.saveEditTrade === 'function') {
    var _pxdOrigSaveEditTrade = window.saveEditTrade;
    window.saveEditTrade = function () {
      var id = _editId;
      var info = pxdReadFormValue('e');
      var r = _pxdOrigSaveEditTrade.apply(this, arguments);
      try {
        var t = APP.trades.find(function (x) {
          return x.id === id;
        });
        if (t) {
          t.paireType = info.paireType;
          t.devises = info.devises;
          if (info.paire !== null) t.paire = info.paire;
          saveState();
          renderTable();
          if (
            document.getElementById('page-trackrecord') &&
            document.getElementById('page-trackrecord').classList.contains('active')
          )
            refreshAllCharts();
          if (typeof currentUser !== 'undefined' && currentUser && !_isSyncing) schedulePush(300);
        }
      } catch (e) {
        console.warn('PXD saveEditTrade:', e);
      }
      return r;
    };
  }

  if (typeof window.openEditTrade === 'function') {
    var _pxdOrigOpenEditTrade = window.openEditTrade;
    window.openEditTrade = function (id) {
      var r = _pxdOrigOpenEditTrade.apply(this, arguments);
      try {
        pxdPopulateDeviseSelects('e');
        var t = APP.trades.find(function (x) {
          return x.id === parseInt(id, 10);
        });
        if (t && t.paireType === 'devise' && t.devises) {
          var parts = t.devises.split('|');
          pxdSetMode('e', 'devise');
          var s1 = document.getElementById('e-devise1'),
            s2 = document.getElementById('e-devise2');
          if (s1) s1.value = parts[0] || '';
          if (s2) s2.value = parts[1] || '';
        } else {
          pxdSetMode('e', 'actif');
        }
      } catch (e) {
        console.warn('PXD openEditTrade:', e);
      }
      return r;
    };
  }

  if (typeof window.resetForm === 'function') {
    var _pxdOrigResetForm = window.resetForm;
    window.resetForm = function () {
      var r = _pxdOrigResetForm.apply(this, arguments);
      pxdSetMode('f', 'actif');
      return r;
    };
  }

  // ── 7. Init ──────────────────────────────────────────────────────────
  function pxdInit() {
    pxdSetupFieldGroup('f');
    pxdSetupFieldGroup('e');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pxdInit);
  } else {
    pxdInit();
  }
})();
