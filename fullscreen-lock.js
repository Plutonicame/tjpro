// ═══════════════════════════════════════════════════════════════════════
// PLEIN ÉCRAN APRÈS CONNEXION — TJP · module additif, zéro-édition
// ═══════════════════════════════════════════════════════════════════════
// Dès que le code PIN est validé, l'app passe en plein écran total (plus
// de barre de titre, plus de croix / agrandir / réduire) et y reste
// jusqu'à la déconnexion (bouton ⏻ ou menu mobile), qui rétablit
// l'affichage normal.
//
// N'édite aucune fonction existante : enveloppe afterPinValidated() et
// _doResetPin(), comme friends-chat.js. Pour désactiver entièrement :
// retirer la balise <script src="fullscreen-lock.js"> d'index.html.
//
// Détails :
//  - Un navigateur n'accepte le plein écran qu'à la suite d'un geste de
//    l'utilisateur : on le demande donc tout de suite après la validation
//    du PIN (le dernier chiffre tapé sert de geste). Si le navigateur
//    refuse (connexion lente, geste trop ancien), on retente au premier
//    clic ou à la première touche suivante.
//  - Si le plein écran est quitté (Échap, F11) alors qu'on est connecté,
//    il revient au clic / à la touche suivante — jusqu'à la déconnexion.
//  - Ne s'applique pas aux écrans tactiles (téléphone, tablette) : la
//    barre de titre à masquer n'existe que sur ordinateur. Passer
//    DESKTOP_ONLY à false pour l'activer partout.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var DESKTOP_ONLY = true;

  var root = document.documentElement;
  var wanted = false; // vrai entre la validation du PIN et la déconnexion
  var armed = false; // vrai quand on attend un geste pour retenter

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

  // ── Nouvelle tentative au prochain geste (clic / touche) ────────────
  function onGesture(e) {
    if (!wanted) {
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

  // Plein écran perdu alors qu'on est toujours connecté → on le redemande
  // au prochain geste.
  function onFsChange() {
    if (wanted && !isFs()) arm();
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  // ── Accroche sur la connexion / déconnexion ─────────────────────────
  // Appel SYNCHRONE avant toute attente (await) de la fonction d'origine,
  // pour rester dans la foulée du geste de l'utilisateur.
  if (typeof window.afterPinValidated === 'function') {
    var _origAfterPinValidated = window.afterPinValidated;
    window.afterPinValidated = function () {
      if (allowed()) {
        wanted = true;
        enterFs().catch(arm);
      }
      return _origAfterPinValidated.apply(this, arguments);
    };
  }

  if (typeof window._doResetPin === 'function') {
    var _origDoResetPin = window._doResetPin;
    window._doResetPin = function () {
      wanted = false;
      disarm();
      exitFs();
      return _origDoResetPin.apply(this, arguments);
    };
  }
})();
