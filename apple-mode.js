// ═══════════════════════════════════════════════════════════════════════
// APPLE MODE — TJP · module additif, zéro-édition (monkey-patch uniquement)
// ═══════════════════════════════════════════════════════════════════════
// Reconstruit d'après les vraies specs iOS 26 / Liquid Glass publiées sur
// developer.apple.com/design/human-interface-guidelines :
//
//  • Couleurs système EXACTES (mode sombre) : Blue #0A84FF, Green #30D158,
//    Red #FF453A, Orange #FF9F0A, Purple #BF5AF2 ; fonds systemBackground
//    #000000 / secondarySystemBackground #1C1C1E / tertiary #2C2C2E ;
//    label #FFFFFF, secondaryLabel à 60% d'opacité. Fonds teintés toujours
//    à 15% d'opacité (convention HIG).
//  • Liquid Glass = UNIQUEMENT la couche de navigation (barre de nav,
//    menus flottants, pavé PIN, boutons d'action). Le contenu (listes,
//    cartes KPI, tableaux, bulles de chat) reste PLAT et opaque — les
//    guidelines sont explicites : "Liquid Glass is not applied to content
//    layers like lists". C'est ce qui rendait les cases KPI moches avant.
//  • Boutons : "glassProminent" (opaque, plein) pour les actions
//    primaires/destructives, "glass" (translucide) pour le reste —
//    exactement la distinction faite par Apple entre les deux styles de
//    bouton.
//  • Typographie : échelle SF Pro réelle (Title 28/700, Headline 17/600,
//    Footnote 13, Caption2 11) ; plus d'écriture forcée en majuscules sur
//    les titres (changement explicite d'iOS 26).
//  • Coins "continous" façon squircle via la propriété CSS corner-shape
//    là où le navigateur la supporte (dégradation silencieuse sinon).
//  • Une touche "Apple Intelligence" (liseré dégradé bleu→violet→corail
//    animé) sur l'en-tête et l'indicateur de saisie du Chat IA — le violet
//    est la couleur sémantique qu'Apple réserve à l'IA/au premium.
//  • Respecte prefers-reduced-motion : les animations de rebond et le
//    dégradé IA sont coupés si l'utilisateur l'a demandé au système.
//
// Limites assumées : impossible d'embarquer les vraies glyphes SF Symbols
// (police propriétaire Apple, licence non redistribuable) ni le logo
// Apple (marque déposée) — non utilisés ici. Les emojis, eux, n'ont rien
// à faire : sur un appareil Apple, chaque emoji Unicode s'affiche déjà
// avec les dessins natifs d'Apple, c'est le système qui s'en charge, pas
// cette page.
//
// Purement visuel, réversible instantanément (classe .tjp-apple-mode sur
// <html>), scopé par compte comme le reste du thème. N'édite aucun
// fichier existant : une seule ligne ajoutée dans index.html pour charger
// ce fichier.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── 1. Feuille de style ────────────────────────────────────────────
  var CSS = `
/* ── Jetons — valeurs officielles HIG (mode sombre) ── */
html.tjp-apple-mode {
  --am-bg: #000000;              /* systemBackground */
  --am-bg-2: #1C1C1E;            /* secondarySystemBackground */
  --am-bg-3: #2C2C2E;            /* tertiarySystemBackground */
  --am-fill-4: #3A3A3C;          /* quaternary fill / séparateurs */
  --am-label: #FFFFFF;
  --am-label-2: rgba(235,235,245,0.6);   /* secondaryLabel */
  --am-label-3: rgba(235,235,245,0.3);   /* tertiaryLabel */
  --am-separator: rgba(84,84,88,0.6);

  --am-blue: #0A84FF;    /* systemBlue (dark) — actions primaires, sélection */
  --am-green: #30D158;   /* systemGreen (dark) — succès, gains */
  --am-red: #FF453A;     /* systemRed (dark) — destructif, pertes */
  --am-orange: #FF9F0A;  /* systemOrange (dark) — avertissement */
  --am-purple: #BF5AF2;  /* systemPurple (dark) — IA / premium */

  --am-r-small: 8px;     /* petits éléments */
  --am-r-control: 12px;  /* boutons, champs, lignes */
  --am-r-card: 16px;     /* cartes */
  --am-r-sheet: 20px;    /* feuilles / modales */
  --am-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── Typographie système — SF Pro partout, plus de mono, plus de
   majuscules forcées sur les titres (changement iOS 26) ── */
html.tjp-apple-mode,
html.tjp-apple-mode * {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Inter, system-ui, sans-serif !important;
  -webkit-font-smoothing: antialiased !important;
  text-rendering: optimizeLegibility !important;
}
html.tjp-apple-mode body { font-size: 15px !important; background: var(--am-bg) !important; color: var(--am-label) !important; }
html.tjp-apple-mode .page-title {
  font-size: 28px !important; font-weight: 700 !important; letter-spacing: -0.02em !important;
  text-transform: none !important; color: var(--am-label) !important;
}
html.tjp-apple-mode .page-sub { color: var(--am-label-2) !important; font-size: 14px !important; letter-spacing: 0 !important; text-transform: none !important; }
html.tjp-apple-mode .card-title {
  font-size: 15px !important; font-weight: 600 !important; letter-spacing: -0.01em !important;
  text-transform: none !important; color: var(--am-label) !important;
}
html.tjp-apple-mode .fg label {
  font-size: 13px !important; letter-spacing: 0 !important; text-transform: none !important; color: var(--am-label-2) !important;
}
html.tjp-apple-mode .kpi-label { font-size: 11px !important; text-transform: none !important; letter-spacing: 0 !important; color: var(--am-label-2) !important; }
html.tjp-apple-mode .kpi-value { font-size: 15px !important; font-weight: 700 !important; letter-spacing: -0.01em !important; }
html.tjp-apple-mode .chip, html.tjp-apple-mode .tag { text-transform: none !important; letter-spacing: 0 !important; }
html.tjp-apple-mode .btn, html.tjp-apple-mode button, html.tjp-apple-mode .pbtn { text-transform: none !important; letter-spacing: 0 !important; font-weight: 600 !important; }

/* ── Coins continus façon squircle, dégradation silencieuse sinon ── */
@supports (corner-shape: squircle) {
  html.tjp-apple-mode .card, html.tjp-apple-mode .kpi-strip, html.tjp-apple-mode .chart-card,
  html.tjp-apple-mode .btn, html.tjp-apple-mode button, html.tjp-apple-mode input,
  html.tjp-apple-mode select, html.tjp-apple-mode .confirm-box, html.tjp-apple-mode .cp-modal,
  html.tjp-apple-mode .mod-col, html.tjp-apple-mode .fc-modal-box {
    corner-shape: squircle !important;
  }
}

/* ── Liquid Glass — RÉSERVÉ à la couche de navigation (nav, menus
   flottants, pavé PIN, boutons d'action). Jamais sur le contenu : les
   guidelines sont explicites là-dessus. ── */
html.tjp-apple-mode .nav,
html.tjp-apple-mode .nav-mobile,
html.tjp-apple-mode .mobile-menu,
html.tjp-apple-mode .acc-menu {
  background: rgba(28,28,30,0.72) !important;
  border-color: var(--am-separator) !important;
  backdrop-filter: blur(30px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
}
html.tjp-apple-mode .nav-tab.active { color: var(--am-blue) !important; }

/* Boutons — "glassProminent" (opaque) pour primaire/destructif,
   "glass" (translucide) pour le reste. Rebond spring à l'appui,
   cible tactile confortable, respect de prefers-reduced-motion. */
html.tjp-apple-mode .btn,
html.tjp-apple-mode button,
html.tjp-apple-mode .pbtn,
html.tjp-apple-mode .acc-opt-btn,
html.tjp-apple-mode .change-pin-btn,
html.tjp-apple-mode .google-btn,
html.tjp-apple-mode .pc-icon-btn {
  border-radius: var(--am-r-control) !important;
  border: 1px solid var(--am-separator) !important;
  background: rgba(255,255,255,0.08) !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
  color: var(--am-label) !important;
  min-height: 38px !important;
  transition: transform 0.18s var(--am-spring), background 0.2s ease, opacity 0.2s ease !important;
}
html.tjp-apple-mode .pc-icon-btn { border-radius: 50% !important; }
html.tjp-apple-mode .btn-p, html.tjp-apple-mode .pbtn.active {
  background: var(--am-blue) !important; border-color: var(--am-blue) !important; color: #fff !important;
  backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
}
html.tjp-apple-mode .btn-d {
  background: var(--am-red) !important; border-color: var(--am-red) !important; color: #fff !important;
  backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
}
@media (prefers-reduced-motion: no-preference) {
  html.tjp-apple-mode .btn:active, html.tjp-apple-mode button:active,
  html.tjp-apple-mode .pbtn:active, html.tjp-apple-mode .chip:active,
  html.tjp-apple-mode .acc-opt-btn:active {
    transform: scale(0.94) !important; opacity: 0.85 !important;
  }
}

/* ── Contenu — PLAT, opaque, hiérarchie par paliers de gris (comme une
   liste groupée iOS), aucun flou : Liquid Glass n'est pas fait pour ça. ── */
html.tjp-apple-mode .card,
html.tjp-apple-mode .chart-card,
html.tjp-apple-mode .kpi-strip,
html.tjp-apple-mode .mod-col,
html.tjp-apple-mode .cal-outer,
html.tjp-apple-mode .pc-conv-panel {
  background: var(--am-bg-2) !important;
  border: 1px solid var(--am-separator) !important;
  border-radius: var(--am-r-card) !important;
  backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
}
html.tjp-apple-mode .kpi-card { background: var(--am-bg-3) !important; }
html.tjp-apple-mode .card-header { background: transparent !important; border-bottom: 1px solid var(--am-separator) !important; }
html.tjp-apple-mode .card-body { padding: 16px !important; }

/* ── Champs de saisie — plats, anneau de focus bleu ── */
html.tjp-apple-mode input,
html.tjp-apple-mode select,
html.tjp-apple-mode textarea,
html.tjp-apple-mode .cp-hex,
html.tjp-apple-mode .mod-add input,
html.tjp-apple-mode .te-search {
  background: var(--am-bg-3) !important;
  border: 1px solid var(--am-separator) !important;
  border-radius: var(--am-r-control) !important;
  color: var(--am-label) !important;
}
html.tjp-apple-mode input:focus,
html.tjp-apple-mode select:focus,
html.tjp-apple-mode textarea:focus {
  outline: none !important; border-color: var(--am-blue) !important;
  box-shadow: 0 0 0 3px rgba(10,132,255,0.3) !important;
}

/* ── Interrupteurs iOS ── */
html.tjp-apple-mode .tgl-track { background: rgba(120,120,128,0.32) !important; border-radius: 999px !important; }
html.tjp-apple-mode .tgl-track.on { background: var(--am-green) !important; }
html.tjp-apple-mode .tgl-thumb { background: #fff !important; box-shadow: 0 2px 6px rgba(0,0,0,0.35) !important; }

/* ── Puces / tags — capsules, fond teinté à 15% (convention HIG) ── */
html.tjp-apple-mode .chip { border-radius: 999px !important; background: rgba(255,255,255,0.08) !important; border: 1px solid var(--am-separator) !important; }
html.tjp-apple-mode .chip.sel { background: var(--am-blue) !important; border-color: var(--am-blue) !important; color: #fff !important; }
html.tjp-apple-mode .tag { border-radius: 999px !important; }
html.tjp-apple-mode .tag-long, html.tjp-apple-mode .tag-oui { background: rgba(48,209,88,0.15) !important; color: var(--am-green) !important; }
html.tjp-apple-mode .tag-short, html.tjp-apple-mode .tag-non { background: rgba(255,69,58,0.15) !important; color: var(--am-red) !important; }

/* ── Gain / perte partout dans l'app ── */
html.tjp-apple-mode .rp { color: var(--am-green) !important; }
html.tjp-apple-mode .rn { color: var(--am-red) !important; }

/* ── Calendrier ── */
html.tjp-apple-mode .cal-day { border-radius: var(--am-r-small) !important; }
html.tjp-apple-mode .cal-day.pos { background: rgba(48,209,88,0.15) !important; border-color: transparent !important; }
html.tjp-apple-mode .cal-day.neg { background: rgba(255,69,58,0.15) !important; border-color: transparent !important; }
html.tjp-apple-mode .cal-day.pos .cal-day-num, html.tjp-apple-mode .cal-day.pos .cal-pnl { color: var(--am-green) !important; }
html.tjp-apple-mode .cal-day.neg .cal-day-num, html.tjp-apple-mode .cal-day.neg .cal-pnl { color: var(--am-red) !important; }

/* ── Feuilles / modales — matériau "regular" sur la boîte, voile
   d'estompage derrière (tâche qui interrompt le fil principal) ── */
html.tjp-apple-mode .confirm-box, html.tjp-apple-mode .cp-modal, html.tjp-apple-mode .fc-modal-box, html.tjp-apple-mode .fc-edit-modal-box {
  background: rgba(28,28,30,0.85) !important;
  border: 1px solid var(--am-separator) !important;
  border-radius: var(--am-r-sheet) !important;
  backdrop-filter: blur(30px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
}
html.tjp-apple-mode .confirm-modal, html.tjp-apple-mode .cp-overlay, html.tjp-apple-mode .auth-overlay, html.tjp-apple-mode .pc-conv-overlay {
  background: rgba(0,0,0,0.5) !important;
  backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
}

/* ── Pavé PIN — touches circulaires en verre (couche de contrôle) ── */
html.tjp-apple-mode .pin-btn {
  background: rgba(255,255,255,0.08) !important;
  border: 1px solid var(--am-separator) !important;
  border-radius: 50% !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
  color: var(--am-label) !important;
  transition: transform 0.15s var(--am-spring), background 0.15s ease !important;
}
@media (prefers-reduced-motion: no-preference) {
  html.tjp-apple-mode .pin-btn:active { transform: scale(0.9) !important; background: rgba(255,255,255,0.18) !important; }
}
html.tjp-apple-mode .pin-dot { border-radius: 50% !important; border-color: var(--am-separator) !important; }
html.tjp-apple-mode .pin-dot.filled { background: var(--am-blue) !important; border-color: var(--am-blue) !important; }

/* ── Chat Ami — bulles façon iMessage (contenu : reste plat) ── */
html.tjp-apple-mode .fc-msg-row.mine .fc-bubble {
  background: linear-gradient(180deg,#0A84FF,#0077E6) !important; color: #fff !important;
  border: none !important; border-radius: 20px 20px 4px 20px !important;
}
html.tjp-apple-mode .fc-msg-row:not(.mine) .fc-bubble {
  background: rgba(120,120,128,0.24) !important; color: var(--am-label) !important;
  border: none !important; border-radius: 20px 20px 20px 4px !important;
}
html.tjp-apple-mode .fc-input-bar { background: var(--am-bg-3) !important; border-color: var(--am-separator) !important; border-radius: var(--am-r-card) !important; }

/* ── Chat IA — le violet est la couleur qu'Apple réserve à l'IA/au
   premium ; touche "Apple Intelligence" en liseré dégradé animé. ── */
html.tjp-apple-mode .pc-msg-user {
  background: linear-gradient(180deg,#0A84FF,#0077E6) !important; color: #fff !important;
  border: none !important; border-radius: 18px 18px 4px 18px !important;
}
html.tjp-apple-mode .pc-msg-bot {
  background: rgba(191,90,242,0.14) !important; border: 1px solid rgba(191,90,242,0.28) !important;
  color: var(--am-label) !important; border-radius: 18px 18px 18px 4px !important;
}
html.tjp-apple-mode .pc-chat-title-bar { position: relative !important; }
html.tjp-apple-mode .pc-chat-title-bar::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  background: linear-gradient(90deg,#0A84FF,#BF5AF2,#FF453A,#FF9F0A,#0A84FF);
  background-size: 300% 100%; opacity: 0.85;
}
html.tjp-apple-mode .pc-thinking {
  background: linear-gradient(90deg,#0A84FF,#BF5AF2,#FF453A,#0A84FF) !important;
  background-size: 300% 100% !important;
  -webkit-background-clip: text !important; background-clip: text !important; color: transparent !important;
}
@media (prefers-reduced-motion: no-preference) {
  html.tjp-apple-mode .pc-chat-title-bar::after { animation: am-ai-glow 6s ease-in-out infinite; }
  html.tjp-apple-mode .pc-thinking { animation: am-ai-glow 3s ease-in-out infinite; }
}
@keyframes am-ai-glow { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

/* ── Défilement & sélection façon macOS ── */
html.tjp-apple-mode ::-webkit-scrollbar { width: 8px; height: 8px; }
html.tjp-apple-mode ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 8px; }
html.tjp-apple-mode ::-webkit-scrollbar-track { background: transparent; }
html.tjp-apple-mode ::selection { background: rgba(10,132,255,0.35); }
`;

  var styleTag = document.createElement('style');
  styleTag.id = 'tjp-apple-mode-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  // ── 2. Clés de stockage (aperçu au démarrage puis confirmation, même
  // logique que tjp_last_theme_uid pour le thème de couleurs) ──
  function amKeyGuess() {
    var uid = localStorage.getItem('tjp_last_theme_uid');
    return uid ? 'tjp_apple_mode__' + uid : 'tjp_apple_mode';
  }
  function amKeyConfirmed() {
    return typeof profileKey === 'function' ? profileKey('tjp_apple_mode') : amKeyGuess();
  }
  function amRead(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'false'); } catch (e) { return false; }
  }
  function amWrite(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }

  // ── 3. Application / bascule ──────────────────────────────────────
  function amApply(on) {
    document.documentElement.classList.toggle('tjp-apple-mode', !!on);
    var track = document.getElementById('appleModeToggle');
    if (track) track.classList.toggle('on', !!on);
  }

  window.toggleAppleMode = function () {
    var next = !document.documentElement.classList.contains('tjp-apple-mode');
    amApply(next);
    amWrite(amKeyConfirmed(), next);
    if (typeof refreshAllCharts === 'function') {
      try { refreshAllCharts(); } catch (e) {}
    }
  };

  amApply(amRead(amKeyGuess()));

  if (typeof window.loadSavedTheme === 'function') {
    var _amOrigLoadSavedTheme = window.loadSavedTheme;
    window.loadSavedTheme = function () {
      var r = _amOrigLoadSavedTheme.apply(this, arguments);
      amApply(amRead(amKeyConfirmed()));
      return r;
    };
  }

  // ── 4. Injection de l'interrupteur dans Paramètres > Thème ───────────
  function amInjectToggle() {
    var editor = document.getElementById('themeEditor');
    if (!editor || document.getElementById('appleModeToggle')) return;
    var row = editor.lastElementChild;
    if (!row) return;
    var wrap = document.createElement('div');
    wrap.className = 'tgl-wrap';
    wrap.style.marginLeft = 'auto';
    wrap.innerHTML =
      '<span>Apple</span>' +
      '<div class="tgl-track' +
      (document.documentElement.classList.contains('tjp-apple-mode') ? ' on' : '') +
      '" id="appleModeToggle" onclick="toggleAppleMode()"><div class="tgl-thumb"></div></div>';
    row.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', amInjectToggle);
  } else {
    amInjectToggle();
  }
})();
