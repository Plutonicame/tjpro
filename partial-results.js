// ═══════════════════════════════════════════════════════════════════════
// RÉSULTATS PARTIELS — TJP · module additif, zéro-édition
// ═══════════════════════════════════════════════════════════════════════
// Remplace les flèches haut/bas du champ Résultat (€) par un bouton "+"
// qui ajoute une case Résultat supplémentaire, pour les trades clôturés
// en plusieurs fois (prises de profits partielles). Autant de cases que
// voulu, chacune retirable avec "−".
//
// À la sauvegarde, le TOTAL de toutes les cases devient le résultat du
// trade : une seule ligne et un seul résultat dans l'historique. Le DÉTAIL
// des cases est gardé dans le trade (t.partials = [100, 50, ...]) : en
// cliquant sur « modifier le trade », on retrouve les cases distinctes, pas
// une case unique additionnée (30/09/2026).
//
// Fonctionne sur le formulaire d'ajout (#f-res) et sur celui d'édition
// (#e-res). Le total est posé par les crochets TJP_TRADE_HOOKS (add/edit),
// sans toucher au contenu des cases du formulaire.
//
// Le bouton "+" a l'apparence d'une case assortie à la case Résultat
// (mêmes coins arrondis / bordure / fond), avec ses 3 couleurs (fond,
// bordure, texte) réglables dans Paramètres → Thème → Journal de trading
// → Formulaire nouveau trade — ajoutées au thème par monkey-patch de
// buildTV(), donc toujours sans éditer app-part1.js. Le bouton "−" reprend
// le même design (case, plus le rond) avec ses 3 propres couleurs,
// indépendantes de celles du "+".
//
// N'édite aucun fichier existant : une seule ligne ajoutée dans
// index.html pour charger ce fichier.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── 1. Style — masque les flèches natives, met en forme les lignes ──
  // Les couleurs des boutons "+" (--pf-add-*) et "−" (--pf-remove-*) ont
  // pour valeur de départ celle de la case Résultat (mêmes hex que
  // --fg-input-fg-select-fg-textarea-*), pour un rendu identique dès
  // l'installation ; ce sont des variables indépendantes les unes des
  // autres, donc modifiables séparément ensuite sans se toucher entre
  // elles ni toucher au style des autres champs.
  var CSS = `
.pf-input::-webkit-inner-spin-button, .pf-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.pf-input { -moz-appearance: textfield; }
.pf-wrap { display: flex; flex-direction: column; gap: 6px; }
.pf-row { display: flex; align-items: center; gap: 6px; }
.pf-row .pf-input { flex: 1; min-width: 0; }
:root {
  --pf-add-bg: #111827;
  --pf-add-bd: #1e2d45;
  --pf-add-tx: #e2e8f0;
  --pf-remove-bg: #111827;
  --pf-remove-bd: #1e2d45;
  --pf-remove-tx: #e2e8f0;
}
.pf-add-box, .pf-remove-box {
  flex-shrink: 0; min-width: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 5px;
  font-family: var(--sans);
  font-size: 16px; font-weight: 700; line-height: 1;
  letter-spacing: normal; text-transform: none; white-space: nowrap;
  padding: 7px 9px;
  transition: border-color 0.15s;
}
.pf-add-box {
  background: var(--pf-add-bg);
  border: 1px solid var(--pf-add-bd);
  color: var(--pf-add-tx);
}
.pf-add-box:hover {
  border-color: var(--pf-add-tx);
}
.pf-remove-box {
  background: var(--pf-remove-bg);
  border: 1px solid var(--pf-remove-bd);
  color: var(--pf-remove-tx);
}
.pf-remove-box:hover {
  border-color: var(--pf-remove-tx);
}
`;
  var styleTag = document.createElement('style');
  styleTag.id = 'tjp-partial-results-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  // ── 2. Construction des lignes ──────────────────────────────────────
  // Le "+" et le "−" ont chacun leur propre case (.pf-add-box / .pf-
  // remove-box), même design, couleurs réglables séparément (section 3).
  function pfMakeBtn(cls, label, title, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ' + cls;
    b.textContent = label;
    b.title = title;
    b.onclick = onClick;
    return b;
  }

  function pfAddRow(wrap, value) {
    var row = document.createElement('div');
    row.className = 'pf-row';
    var input = document.createElement('input');
    input.type = 'number';
    input.className = 'pf-input';
    input.placeholder = 'Partiel ' + (wrap.querySelectorAll('.pf-row').length + 1);
    var prefilled = value !== undefined && value !== null && value !== '';
    if (prefilled) input.value = value;
    var rm = pfMakeBtn('pf-remove-box', '\u2212', 'Retirer cette case', function () {
      row.remove();
    });
    row.appendChild(input);
    row.appendChild(rm);
    wrap.appendChild(row);
    if (!prefilled) input.focus();
  }

  function pfSetup(inputId) {
    var input = document.getElementById(inputId);
    if (!input || input.dataset.pfDone) return;
    input.dataset.pfDone = '1';
    input.classList.add('pf-input');
    var wrap = document.createElement('div');
    wrap.className = 'pf-wrap';
    wrap.id = 'pf-wrap-' + inputId;
    input.parentNode.insertBefore(wrap, input);
    var row = document.createElement('div');
    row.className = 'pf-row';
    row.appendChild(input);
    var add = pfMakeBtn(
      'pf-add-box',
      '+',
      'Ajouter un résultat partiel (prise de profits partielle sur ce trade)',
      function () {
        pfAddRow(wrap);
      }
    );
    row.appendChild(add);
    wrap.appendChild(row);
  }

  // Somme toutes les cases (base + partiels ajoutés) d'un champ donné.
  function pfTotal(inputId) {
    var wrap = document.getElementById('pf-wrap-' + inputId);
    if (!wrap) {
      var el = document.getElementById(inputId);
      return el ? Math.round((parseFloat(el.value) || 0) * 100) / 100 : 0;
    }
    var total = 0;
    wrap.querySelectorAll('input').forEach(function (inp) {
      total += parseFloat(inp.value) || 0;
    });
    return Math.round(total * 100) / 100; // évite 0,1 + 0,2 = 0,30000000000000004
  }

  // Valeurs saisies, case par case (les cases vides sont ignorées).
  function pfValues(inputId) {
    var wrap = document.getElementById('pf-wrap-' + inputId);
    var inputs = wrap ? wrap.querySelectorAll('input') : [document.getElementById(inputId)];
    var vals = [];
    Array.prototype.forEach.call(inputs, function (inp) {
      if (!inp || inp.value === '') return;
      var v = parseFloat(inp.value);
      if (isFinite(v)) vals.push(Math.round(v * 100) / 100);
    });
    return vals;
  }

  // Pose sur le trade le total (t.res) ET le détail (t.partials, seulement s'il
  // y a au moins 2 cases remplies : un trade simple reste un trade simple).
  function pfApplyToTrade(t, inputId) {
    var vals = pfValues(inputId);
    t.res = pfTotal(inputId);
    if (vals.length > 1) t.partials = vals;
    else delete t.partials;
  }

  // Ne garde que la case de base, retire celles ajoutées en trop.
  function pfReset(inputId) {
    var wrap = document.getElementById('pf-wrap-' + inputId);
    if (!wrap) return;
    wrap.querySelectorAll('.pf-row').forEach(function (row, idx) {
      if (idx === 0) return;
      row.remove();
    });
  }

  function pfInit() {
    pfSetup('f-res');
    pfSetup('e-res');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pfInit);
  } else {
    pfInit();
  }

  // ── 3. Intégration au thème ───────────────────────────────────────
  // Ajoute les 6 couleurs (fond/bordure/texte des boutons "+" et "−") à
  // la liste que l'éditeur de thème affiche, sans toucher à app-part1.js :
  // buildTV() reste appelé normalement, on complète juste le tableau
  // qu'il retourne. Elles apparaissent dans Paramètres → Thème → Journal
  // de trading → Formulaire nouveau trade, se sauvegardent/synchronisent
  // comme toutes les autres couleurs du thème (mécanisme déjà générique).
  if (typeof window.buildTV === 'function') {
    var _origBuildTV = window.buildTV;
    window.buildTV = function () {
      var tv = _origBuildTV.apply(this, arguments);
      tv.push(
        {
          v: '--pf-add-bg',
          l: 'Ajouter résultat partiel - fond',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        },
        {
          v: '--pf-add-bd',
          l: 'Ajouter résultat partiel - bordure',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        },
        {
          v: '--pf-add-tx',
          l: 'Ajouter résultat partiel - texte',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        },
        {
          v: '--pf-remove-bg',
          l: 'Retirer résultat partiel - fond',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        },
        {
          v: '--pf-remove-bd',
          l: 'Retirer résultat partiel - bordure',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        },
        {
          v: '--pf-remove-tx',
          l: 'Retirer résultat partiel - texte',
          page: 'Journal de trading',
          section: 'Formulaire nouveau trade'
        }
      );
      return tv;
    };
  }

  // ── 4. Accroche sur les vraies sauvegardes/ouvertures ────────────────
  // Crochets de app-part1.js (TJP_TRADE_HOOKS) : appelés par addTrade() et
  // saveEditTrade() sur le trade en cours, avant la sauvegarde. Le formulaire
  // n'est plus modifié (avant : le total était écrit dans la case de base puis
  // remis en place si l'ajout était refusé). resetForm() n'est appelé qu'en cas
  // de succès réel : on ne retire les cases en trop qu'à ce moment-là.
  if (window.TJP_TRADE_HOOKS) {
    window.TJP_TRADE_HOOKS.add.push(function (t) {
      pfApplyToTrade(t, 'f-res');
    });
    window.TJP_TRADE_HOOKS.edit.push(function (t) {
      pfApplyToTrade(t, 'e-res');
    });
  }
  if (typeof window.resetForm === 'function') {
    var _origResetForm = window.resetForm;
    window.resetForm = function () {
      var r = _origResetForm.apply(this, arguments);
      pfReset('f-res');
      return r;
    };
  }

  // À l'ouverture d'une fiche pour édition : on repart d'une case unique, puis,
  // si le trade a des résultats partiels, on remet chaque partiel dans sa propre
  // case. Sécurité : si la somme des partiels ne correspond plus au résultat du
  // trade (modifié ailleurs), on ignore le détail et on garde le total.
  function pfRestoreEdit(id) {
    var t = APP.trades.find(function (x) {
      return x.id === parseInt(id, 10);
    });
    var base = document.getElementById('e-res');
    var wrap = document.getElementById('pf-wrap-e-res');
    if (!t || !base || !wrap || !Array.isArray(t.partials) || t.partials.length < 2) return;
    var sum = t.partials.reduce(function (a, b) {
      return a + (parseFloat(b) || 0);
    }, 0);
    if (Math.abs(sum - (parseFloat(t.res) || 0)) > 0.005) return;
    base.value = t.partials[0];
    for (var i = 1; i < t.partials.length; i++) pfAddRow(wrap, t.partials[i]);
  }
  if (typeof window.openEditTrade === 'function') {
    var _origOpenEditTrade = window.openEditTrade;
    window.openEditTrade = function (id) {
      pfReset('e-res');
      var r = _origOpenEditTrade.apply(this, arguments);
      try {
        pfRestoreEdit(id);
      } catch (e) {
        console.warn('Partiels openEditTrade :', e);
      }
      return r;
    };
  }
})();
