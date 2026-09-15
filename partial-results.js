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
// N'édite aucun fichier existant : une seule ligne ajoutée dans
// index.html pour charger ce fichier.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── 1. Style — masque les flèches natives, met en forme les lignes ──
  var CSS = `
.pf-input::-webkit-inner-spin-button, .pf-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.pf-input { -moz-appearance: textfield; }
.pf-wrap { display: flex; flex-direction: column; gap: 6px; }
.pf-row { display: flex; align-items: center; gap: 6px; }
.pf-row .pf-input { flex: 1; min-width: 0; }
.pf-add-btn, .pf-remove-btn {
  flex-shrink: 0; width: 28px; height: 28px; min-width: 28px;
  padding: 0 !important; border-radius: 50% !important;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; line-height: 1; font-weight: 700;
}
`;
  var styleTag = document.createElement('style');
  styleTag.id = 'tjp-partial-results-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  // ── 2. Construction des lignes ──────────────────────────────────────
  // Réutilise les classes .btn.btn-p / .btn.btn-d de l'app : le + / le -
  // suivent automatiquement le thème actif (par défaut, personnalisé, ou
  // Apple Mode), sans rien redéfinir ici.
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
    var rm = pfMakeBtn('btn-d pf-remove-btn', '\u2212', 'Retirer cette case', function () {
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
      'btn-p pf-add-btn',
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

  // ── 3. Accroche sur les vraies sauvegardes/ouvertures ────────────────
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
