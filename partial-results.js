// ═══════════════════════════════════════════════════════════════════════
// RÉSULTATS PARTIELS — TJP · module additif, zéro-édition
// ═══════════════════════════════════════════════════════════════════════
// Remplace les flèches haut/bas du champ Résultat (€) par un bouton "+"
// qui ajoute une case Résultat supplémentaire, pour les trades clôturés
// en plusieurs fois (prises de profits partielles). Autant de cases que
// voulu, chacune retirable avec "−".
//
// À la sauvegarde, le TOTAL de toutes les cases devient la valeur
// enregistrée comme résultat du trade — l'historique affiche donc déjà
// le total automatiquement, sans rien changer côté affichage (il affiche
// simplement le résultat du trade, qui est maintenant ce total).
//
// Fonctionne sur le formulaire d'ajout (#f-res) et sur celui d'édition
// (#e-res). Le détail des partiels n'est pas conservé après coup (seul le
// total l'est) : en rouvrant un trade pour l'éditer, on repart d'une case
// unique pré-remplie avec le total.
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

  function pfAddRow(wrap) {
    var row = document.createElement('div');
    row.className = 'pf-row';
    var input = document.createElement('input');
    input.type = 'number';
    input.className = 'pf-input';
    input.placeholder = 'Partiel ' + (wrap.querySelectorAll('.pf-row').length + 1);
    var rm = pfMakeBtn('pf-remove-box', '\u2212', 'Retirer cette case', function () {
      row.remove();
    });
    row.appendChild(input);
    row.appendChild(rm);
    wrap.appendChild(row);
    input.focus();
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
      return el ? parseFloat(el.value) || 0 : 0;
    }
    var total = 0;
    wrap.querySelectorAll('input').forEach(function (inp) {
      total += parseFloat(inp.value) || 0;
    });
    return total;
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
  // addTrade() lit simplement la valeur de f-res : on y met le total
  // juste avant qu'il ne la lise. resetForm() n'est appelé par addTrade()
  // qu'en cas de succès réel (date renseignée) — on ne retire les cases
  // en trop qu'à ce moment-là, jamais si la validation a échoué.
  if (typeof window.addTrade === 'function') {
    var _origAddTrade = window.addTrade;
    window.addTrade = function () {
      var el = document.getElementById('f-res');
      if (el) el.value = pfTotal('f-res');
      return _origAddTrade.apply(this, arguments);
    };
  }
  if (typeof window.resetForm === 'function') {
    var _origResetForm = window.resetForm;
    window.resetForm = function () {
      var r = _origResetForm.apply(this, arguments);
      pfReset('f-res');
      return r;
    };
  }

  // Même principe pour l'édition d'un trade existant.
  if (typeof window.saveEditTrade === 'function') {
    var _origSaveEditTrade = window.saveEditTrade;
    window.saveEditTrade = function () {
      var el = document.getElementById('e-res');
      if (el) el.value = pfTotal('e-res');
      return _origSaveEditTrade.apply(this, arguments);
    };
  }
  // À l'ouverture d'une fiche pour édition, on repart d'une case unique
  // avant qu'openEditTrade() n'y remette le total du trade (le détail des
  // partiels n'est pas conservé d'une session à l'autre, seul le total).
  if (typeof window.openEditTrade === 'function') {
    var _origOpenEditTrade = window.openEditTrade;
    window.openEditTrade = function () {
      pfReset('e-res');
      return _origOpenEditTrade.apply(this, arguments);
    };
  }
})();
