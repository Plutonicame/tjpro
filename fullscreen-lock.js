// ═══════════════════════════════════════════════════════════════════════
// PLEIN ÉCRAN APRÈS CONNEXION — TJP · module additif, zéro-édition
// ═══════════════════════════════════════════════════════════════════════
// Dès que le code PIN est validé, l'app passe en plein écran total (plus
// de barre de titre, plus de croix / agrandir / réduire) — sauf si la
// préférence ci-dessous est décochée.
//
// Réglage dans Paramètres → carte "PRÉFÉRENCES" (à côté de "Menu de
// navigation en colonne"), activé par défaut ; à décocher manuellement pour
// ne plus jamais passer en plein écran à la connexion (25/09/2026, demande
// de Paul — d'abord posé dans sa propre carte "PLEIN ÉCRAN", déplacé ici
// ensuite).
//
// Si le plein écran est quitté volontairement (Échap, F11, croix native du
// navigateur) une fois qu'il a été obtenu, ce choix est respecté pour le
// reste de la session : contrairement à la version précédente, un clic
// quelconque ne le remet plus de force (25/09/2026, demande de Paul). On ne
// retente automatiquement que dans un seul cas : la toute première tentative
// juste après la connexion, si le navigateur l'a refusée (geste trop
// ancien) — auquel cas on réessaie au prochain clic/touche, une fois.
//
// N'édite aucune fonction existante : enveloppe afterPinValidated() et
// _doResetPin(), comme friends-chat.js. Pour désactiver entièrement :
// retirer la balise <script src="fullscreen-lock.js"> d'index.html.
//
// Ne s'applique pas aux écrans tactiles (téléphone, tablette) : la barre de
// titre à masquer n'existe que sur ordinateur. Passer DESKTOP_ONLY à false
// pour l'activer partout.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var DESKTOP_ONLY = true;
  var PREF_KEY = 'tjp_fullscreen_pref';

  var root = document.documentElement;
  var wanted = false; // vrai entre la validation du PIN et la déconnexion
  var established = false; // vrai dès que le plein écran a été obtenu au moins une fois depuis la connexion
  var armed = false; // vrai quand on attend un geste pour retenter la 1ère entrée

  function prefEnabled() {
    var v = localStorage.getItem(PREF_KEY);
    return v === null ? true : v === '1'; // activé par défaut
  }
  function setPrefEnabled(v) {
    localStorage.setItem(PREF_KEY, v ? '1' : '0');
  }

  function supported() {
    return !!(root.requestFullscreen || root.webkitRequestFullscreen);
  }

  function allowed() {
    if (!supported()) return false;
    if (!DESKTOP_ONLY) return true;
    try {
      return !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    } catch (e) {
      return true;
    }
  }

  function isFs() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function enterFs() {
    if (isFs()) return Promise.resolve();
    try {
      var req = root.requestFullscreen || root.webkitRequestFullscreen;
      var p = req.call(root);
      return p && typeof p.then === 'function' ? p : Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function exitFs() {
    if (!isFs()) return;
    try {
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      var p = ex.call(document);
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } catch (e) {}
  }

  // ── Nouvelle tentative au prochain geste (clic / touche) — seulement pour
  // récupérer une 1ère tentative refusée par le navigateur juste après la
  // connexion (voir onFsChange plus bas, qui décide seul quand armer).
  function onGesture(e) {
    if (!wanted || established) {
      disarm();
      return;
    }
    // Échap et F11 sont les touches natives du navigateur pour quitter /
    // basculer le plein écran : on ne s'en mêle pas.
    if (e.type === 'keydown' && (e.key === 'Escape' || e.key === 'F11')) return;
    enterFs().then(disarm, function () {});
  }
  function arm() {
    if (armed) return;
    armed = true;
    document.addEventListener('click', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
  }
  function disarm() {
    armed = false;
    document.removeEventListener('click', onGesture, true);
    document.removeEventListener('keydown', onGesture, true);
  }

  function onFsChange() {
    if (!wanted) return;
    if (isFs()) {
      established = true;
      disarm();
      return;
    }
    // Plein écran perdu.
    if (!established) {
      // Pas encore obtenu depuis la connexion (1ère tentative refusée) : on
      // retente au prochain geste.
      arm();
    } else {
      // Obtenu, puis quitté volontairement (Échap, F11, croix native...) :
      // on respecte ce choix pour le reste de la session, jusqu'à la
      // prochaine connexion — on n'essaie plus d'y revenir.
      wanted = false;
      disarm();
    }
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  // ── Accroche sur la connexion / déconnexion ─────────────────────────
  // Appel SYNCHRONE avant toute attente (await) de la fonction d'origine,
  // pour rester dans la foulée du geste de l'utilisateur.
  if (typeof window.afterPinValidated === 'function') {
    var _origAfterPinValidated = window.afterPinValidated;
    window.afterPinValidated = function () {
      established = false;
      if (prefEnabled() && allowed()) {
        wanted = true;
        enterFs().catch(arm);
      } else {
        wanted = false;
      }
      return _origAfterPinValidated.apply(this, arguments);
    };
  }

  if (typeof window._doResetPin === 'function') {
    var _origDoResetPin = window._doResetPin;
    window._doResetPin = function () {
      wanted = false;
      established = false;
      disarm();
      exitFs();
      return _origDoResetPin.apply(this, arguments);
    };
  }

  // ── Réglage dans Paramètres → PRÉFÉRENCES (25/09/2026, demande de Paul :
  // à côté de "Menu de navigation en colonne", plutôt que dans sa propre
  // carte "PLEIN ÉCRAN") ─────────────────────────────────────────────────
  function renderToggle() {
    var t = document.getElementById('tglFsPref');
    var l = document.getElementById('fsPrefLbl');
    if (!t || !l) return;
    var on = prefEnabled();
    t.classList.toggle('on', on);
    l.textContent = on ? 'Activé' : 'Désactivé';
  }
  // Passer de désactivé à activé met tout de suite en plein écran, pour voir
  // sur quoi ce réglage agit (25/09/2026, demande de Paul) : le clic sur la
  // bascule est déjà un geste valide pour le navigateur, pas besoin d'attendre
  // la prochaine connexion. Même règle qu'à la connexion ensuite : s'il est
  // quitté volontairement, on ne le remet plus de force.
  window.fsTogglePref = function () {
    var on = !prefEnabled();
    setPrefEnabled(on);
    renderToggle();
    if (on) {
      if (allowed()) {
        wanted = true;
        established = false;
        enterFs().catch(function () {});
      }
    } else {
      wanted = false;
      disarm();
      exitFs(); // aussi instantané que l'entrée (25/09/2026, demande de Paul)
    }
  };

  function injectRow() {
    if (document.getElementById('fsPrefRow')) {
      renderToggle();
      return;
    }
    var body = document.querySelector('#cfNavCard .card-body');
    if (!body) return;
    body.insertAdjacentHTML(
      'beforeend',
      '<div class="tgl-row" id="fsPrefRow">' +
        '<span data-editable>Plein écran à la connexion :</span>' +
        '<div class="tgl-track" id="tglFsPref" onclick="fsTogglePref()"><div class="tgl-thumb"></div></div>' +
        '<span id="fsPrefLbl" style="color:var(--muted)">Activé</span>' +
        '</div>'
    );
    renderToggle();
  }
  // #cfNavCard est créé par cfRenderSettings() (custom-fields.js), appelée
  // au chargement puis à chaque rafraîchissement des Paramètres — on
  // s'accroche juste après pour y ajouter la ligne, sans jamais recréer la
  // carte nous-même.
  if (typeof window.cfRenderSettings === 'function') {
    var _origCfRenderSettings = window.cfRenderSettings;
    window.cfRenderSettings = function () {
      var r = _origCfRenderSettings.apply(this, arguments);
      injectRow();
      return r;
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectRow);
  else injectRow();
})();
