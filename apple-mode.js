// ═══════════════════════════════════════════════════════════════════════
// APPLE MODE — TJP · module additif, zéro-édition (monkey-patch uniquement)
// ═══════════════════════════════════════════════════════════════════════
// Ajoute un interrupteur "Apple" dans Paramètres > THÈME & MODE STYLO, à
// droite de ✓ APPLIQUER / ↺ RÉINITIALISER / ▲ REPLIER LES COULEURS.
// Une fois activé, repeint TOUTE l'interface avec une direction artistique
// façon iOS/macOS : police système (-apple-system/SF Pro), courbes très
// généreuses, verre dépoli (liquid glass : flou + saturation + reflet),
// accents iOS (bleu système, vert, rouge), bulles de chat façon iMessage,
// pavé PIN circulaire, et un rebond "spring" à l'appui sur chaque bouton.
//
// Purement visuel : aucune donnée ni logique métier n'est touchée, tout
// repose sur une classe CSS (.tjp-apple-mode) posée sur <html> — réversible
// instantanément en décochant l'interrupteur. N'édite aucun fichier
// existant : une seule ligne à ajouter dans index.html pour charger ce
// fichier, comme pour custom-fields.js / friends-chat.js.
//
// Stockage : scopé par compte comme le reste du thème (via profileKey()),
// avec la même logique "aperçu au démarrage puis confirmation" que le
// thème de couleurs (tjp_last_theme_uid / previewThemeForUid) : on
// applique la meilleure estimation dès le chargement, puis on se resynchronise
// à chaque loadSavedTheme() une fois le compte réellement identifié.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── 1. Feuille de style ────────────────────────────────────────────
  var CSS = `
html.tjp-apple-mode {
  --am-bg: #000000;
  --am-elevated: rgba(255,255,255,0.055);
  --am-elevated-2: rgba(255,255,255,0.09);
  --am-border: rgba(255,255,255,0.14);
  --am-blue: #4DA6FF;
  --am-green: #3DE070;
  --am-red: #FF6259;
  --am-orange: #FFAA2B;
  --am-label: #F5F5F7;
  --am-label-2: #98989D;
  --am-radius-lg: 22px;
  --am-radius-md: 16px;
  --am-radius-sm: 12px;
  --am-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Police système + rendu global */
html.tjp-apple-mode,
html.tjp-apple-mode body,
html.tjp-apple-mode .card-title,
html.tjp-apple-mode .page-title,
html.tjp-apple-mode .page-sub,
html.tjp-apple-mode .btn,
html.tjp-apple-mode button,
html.tjp-apple-mode .chip,
html.tjp-apple-mode input,
html.tjp-apple-mode select,
html.tjp-apple-mode textarea,
html.tjp-apple-mode .pbtn,
html.tjp-apple-mode .fg label,
html.tjp-apple-mode .kpi-label,
html.tjp-apple-mode .kpi-value,
html.tjp-apple-mode .tag {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Inter, system-ui, sans-serif !important;
  -webkit-font-smoothing: antialiased !important;
  text-rendering: optimizeLegibility !important;
}
html.tjp-apple-mode body { font-size: 15.5px !important; background: var(--am-bg) !important; color: var(--am-label) !important; }
html.tjp-apple-mode .page-title {
  font-size: 30px !important; font-weight: 700 !important; letter-spacing: -0.02em !important;
  text-transform: none !important; color: var(--am-label) !important;
}
html.tjp-apple-mode .page-sub { color: var(--am-label-2) !important; font-size: 14px !important; letter-spacing: 0 !important; }
html.tjp-apple-mode .card-title {
  font-size: 14px !important; font-weight: 600 !important; letter-spacing: -0.01em !important;
  text-transform: none !important; color: var(--am-label) !important;
}
html.tjp-apple-mode .fg label {
  font-size: 12px !important; letter-spacing: 0 !important; text-transform: none !important; color: var(--am-label-2) !important;
}

/* Verre dépoli — cartes & panneaux */
html.tjp-apple-mode .card,
html.tjp-apple-mode .chart-card,
html.tjp-apple-mode .cp-modal,
html.tjp-apple-mode .confirm-box,
html.tjp-apple-mode .pc-conv-panel,
html.tjp-apple-mode .mod-col,
html.tjp-apple-mode .cal-outer,
html.tjp-apple-mode .acc-menu,
html.tjp-apple-mode .fc-modal-box,
html.tjp-apple-mode .fc-edit-modal-box {
  background: var(--am-elevated) !important;
  border: 1px solid var(--am-border) !important;
  border-radius: var(--am-radius-lg) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
  box-shadow: 0 12px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.09) !important;
}
html.tjp-apple-mode .card-header { background: transparent !important; border-bottom: 1px solid var(--am-border) !important; }
html.tjp-apple-mode .card-body { padding: 16px !important; }

/* Boutons — verre + accents iOS + rebond "spring" à l'appui */
html.tjp-apple-mode .btn,
html.tjp-apple-mode button,
html.tjp-apple-mode .pbtn,
html.tjp-apple-mode .acc-opt-btn,
html.tjp-apple-mode .change-pin-btn,
html.tjp-apple-mode .google-btn,
html.tjp-apple-mode .pc-icon-btn {
  border-radius: var(--am-radius-sm) !important;
  border: 1px solid var(--am-border) !important;
  background: var(--am-elevated-2) !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
  color: var(--am-label) !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  transition: transform 0.18s var(--am-spring), background 0.2s ease, opacity 0.2s ease !important;
}
html.tjp-apple-mode .pc-icon-btn { border-radius: 50% !important; }
html.tjp-apple-mode .btn-p { background: var(--am-blue) !important; border-color: var(--am-blue) !important; color: #fff !important; }
html.tjp-apple-mode .btn-d { background: var(--am-red) !important; border-color: var(--am-red) !important; color: #fff !important; }
html.tjp-apple-mode .pbtn.active { background: var(--am-blue) !important; border-color: var(--am-blue) !important; color: #fff !important; }
html.tjp-apple-mode .btn:active,
html.tjp-apple-mode button:active,
html.tjp-apple-mode .pbtn:active,
html.tjp-apple-mode .chip:active,
html.tjp-apple-mode .acc-opt-btn:active {
  transform: scale(0.94) !important;
  opacity: 0.85 !important;
}

/* Champs de saisie */
html.tjp-apple-mode input,
html.tjp-apple-mode select,
html.tjp-apple-mode textarea,
html.tjp-apple-mode .cp-hex,
html.tjp-apple-mode .mod-add input,
html.tjp-apple-mode .te-search {
  background: var(--am-elevated) !important;
  border: 1px solid var(--am-border) !important;
  border-radius: var(--am-radius-sm) !important;
  color: var(--am-label) !important;
}
html.tjp-apple-mode input:focus,
html.tjp-apple-mode select:focus,
html.tjp-apple-mode textarea:focus {
  outline: none !important;
  border-color: var(--am-blue) !important;
  box-shadow: 0 0 0 3px rgba(77,166,255,0.3) !important;
}

/* Interrupteurs façon iOS */
html.tjp-apple-mode .tgl-track { background: rgba(120,120,128,0.32) !important; border-radius: 999px !important; transition: background 0.2s var(--am-spring) !important; }
html.tjp-apple-mode .tgl-track.on { background: var(--am-green) !important; }
html.tjp-apple-mode .tgl-thumb { background: #fff !important; box-shadow: 0 2px 6px rgba(0,0,0,0.35) !important; transition: left 0.2s var(--am-spring) !important; }

/* Puces / chips / tags — capsules pleines iOS */
html.tjp-apple-mode .chip {
  border-radius: 999px !important; text-transform: none !important; letter-spacing: 0 !important;
  background: var(--am-elevated) !important; border: 1px solid var(--am-border) !important;
}
html.tjp-apple-mode .chip.sel { background: var(--am-blue) !important; border-color: var(--am-blue) !important; color: #fff !important; }
html.tjp-apple-mode .tag { border-radius: 999px !important; }
html.tjp-apple-mode .tag-long, html.tjp-apple-mode .tag-oui { background: rgba(61,224,112,0.18) !important; color: var(--am-green) !important; }
html.tjp-apple-mode .tag-short, html.tjp-apple-mode .tag-non { background: rgba(255,98,89,0.18) !important; color: var(--am-red) !important; }

/* Navigation — barre translucide */
html.tjp-apple-mode .nav,
html.tjp-apple-mode .nav-mobile,
html.tjp-apple-mode .mobile-menu {
  background: rgba(20,20,22,0.72) !important;
  backdrop-filter: blur(30px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
  border-color: var(--am-border) !important;
}
html.tjp-apple-mode .nav-tab.active { color: var(--am-blue) !important; }

/* Fenêtres modales / superpositions */
html.tjp-apple-mode .confirm-modal,
html.tjp-apple-mode .cp-overlay,
html.tjp-apple-mode .auth-overlay,
html.tjp-apple-mode .pc-conv-overlay {
  background: rgba(0,0,0,0.5) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

/* Pavé code PIN — touches circulaires en verre */
html.tjp-apple-mode .pin-btn {
  background: var(--am-elevated-2) !important;
  border: 1px solid var(--am-border) !important;
  border-radius: 50% !important;
  backdrop-filter: blur(20px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
  color: var(--am-label) !important;
  font-weight: 500 !important;
  transition: transform 0.15s var(--am-spring), background 0.15s ease !important;
}
html.tjp-apple-mode .pin-btn:active { transform: scale(0.9) !important; background: rgba(255,255,255,0.18) !important; }
html.tjp-apple-mode .pin-dot { border-radius: 50% !important; border-color: var(--am-border) !important; }
html.tjp-apple-mode .pin-dot.filled { background: var(--am-blue) !important; border-color: var(--am-blue) !important; }

/* Chat Ami — bulles façon iMessage */
html.tjp-apple-mode .fc-msg-row.mine .fc-bubble {
  background: linear-gradient(180deg,#4DA6FF,#2E8FEF) !important;
  color: #fff !important; border: none !important; border-radius: 20px 20px 4px 20px !important;
}
html.tjp-apple-mode .fc-msg-row:not(.mine) .fc-bubble {
  background: rgba(120,120,128,0.24) !important;
  color: var(--am-label) !important; border: none !important; border-radius: 20px 20px 20px 4px !important;
}
html.tjp-apple-mode .fc-input-bar {
  background: var(--am-elevated) !important; border-color: var(--am-border) !important;
  border-radius: var(--am-radius-lg) !important;
}

/* Chat IA — même traitement */
html.tjp-apple-mode .pc-msg-user {
  background: linear-gradient(180deg,#4DA6FF,#2E8FEF) !important;
  color: #fff !important; border: none !important; border-radius: 18px 18px 4px 18px !important;
}
html.tjp-apple-mode .pc-msg-bot {
  background: rgba(120,120,128,0.24) !important;
  color: var(--am-label) !important; border: none !important; border-radius: 18px 18px 18px 4px !important;
}

/* KPI — le verre habille la bande entière (comme un groupe de réglages
   iOS), pas chaque case individuellement (ça donnait 9 bulles arrondies
   collées les unes aux autres, moche) */
html.tjp-apple-mode .kpi-strip {
  background: var(--am-border) !important;
  border: 1px solid var(--am-border) !important;
  border-radius: var(--am-radius-md) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08) !important;
}
html.tjp-apple-mode .kpi-card { background: var(--am-elevated) !important; }
html.tjp-apple-mode .kpi-value { font-weight: 700 !important; letter-spacing: -0.01em !important; }
html.tjp-apple-mode .kpi-label { text-transform: none !important; letter-spacing: 0 !important; color: var(--am-label-2) !important; }

/* Gain / perte — partout dans l'app (tableau de trades, KPI, etc.) */
html.tjp-apple-mode .rp { color: var(--am-green) !important; }
html.tjp-apple-mode .rn { color: var(--am-red) !important; }

/* Calendrier — cases arrondies + couleurs gain/perte vives */
html.tjp-apple-mode .cal-day { border-radius: var(--am-radius-sm) !important; }
html.tjp-apple-mode .cal-day.pos { background: rgba(61,224,112,0.22) !important; border-color: transparent !important; }
html.tjp-apple-mode .cal-day.neg { background: rgba(255,98,89,0.22) !important; border-color: transparent !important; }
html.tjp-apple-mode .cal-day.pos .cal-day-num,
html.tjp-apple-mode .cal-day.pos .cal-pnl { color: var(--am-green) !important; }
html.tjp-apple-mode .cal-day.neg .cal-day-num,
html.tjp-apple-mode .cal-day.neg .cal-pnl { color: var(--am-red) !important; }

/* Défilement & sélection façon macOS */
html.tjp-apple-mode ::-webkit-scrollbar { width: 8px; height: 8px; }
html.tjp-apple-mode ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 8px; }
html.tjp-apple-mode ::-webkit-scrollbar-track { background: transparent; }
html.tjp-apple-mode ::selection { background: rgba(77,166,255,0.35); }
`;

  var styleTag = document.createElement('style');
  styleTag.id = 'tjp-apple-mode-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  // ── 2. Clés de stockage (même logique "aperçu / confirmé" que le thème) ──
  function amKeyGuess() {
    var uid = localStorage.getItem('tjp_last_theme_uid');
    return uid ? 'tjp_apple_mode__' + uid : 'tjp_apple_mode';
  }
  function amKeyConfirmed() {
    return typeof profileKey === 'function' ? profileKey('tjp_apple_mode') : amKeyGuess();
  }
  function amRead(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'false');
    } catch (e) {
      return false;
    }
  }
  function amWrite(key, v) {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
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
      try {
        refreshAllCharts();
      } catch (e) {}
    }
  };

  // Aperçu immédiat dès le chargement, avant même la connexion confirmée
  // (comme previewThemeForUid pour les couleurs).
  amApply(amRead(amKeyGuess()));

  // Resynchronisation avec la clé du compte réellement identifié, à chaque
  // fois que le reste du thème se recharge (connexion confirmée, changement
  // de sous-compte, restauration de sauvegarde...).
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
    var row = editor.lastElementChild; // ligne Appliquer / Réinitialiser / Replier
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
