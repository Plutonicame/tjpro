// ═══════════════════════════════════════════════════════════════════════
// APPLE MODE — TJP · module additif, zéro-édition (monkey-patch uniquement)
// ═══════════════════════════════════════════════════════════════════════
// Thème CLAIR — c'est l'apparence par défaut d'iOS/macOS et celle des
// vraies couleurs système Apple (Blue #007AFF, Green #34C759, Red
// #FF3B30, Orange #FF9500, Purple #AF52DE en mode clair), fond
// systemGroupedBackground #F2F2F7 avec cartes blanches #FFFFFF — comme
// l'app Réglages d'iOS.
//
// Stabilité (retenu du tour précédent, ne pas revenir en arrière) :
// jamais la balise <button> brute (ça écrasait les petites icônes du
// journal comme .del-btn), jamais de min-height forcée (cassait les
// lignes denses), tout est scopé sur les classes réelles de l'app.
//
// Liquid Glass — verre dépoli + reflet + rebond "spring" satisfaisant à
// l'appui — posé sur tous les contrôles ronds/ovales (pavé PIN, icônes
// circulaires du chat IA, puces, interrupteurs, boutons pilule, menu
// hamburger) et sur la navigation. Jamais sur le contenu (cartes, listes,
// KPI, tableaux) — les guidelines Apple sont explicites là-dessus, c'est
// ce qui rendait les KPI moches avant.
//
// Limites assumées : pas de vraies glyphes SF Symbols (police
// propriétaire Apple) ni de logo Apple (marque déposée). Les emoji
// s'affichent déjà avec les dessins natifs d'Apple sur ses appareils —
// rien à faire ici, c'est le système qui gère ça.
// ═══════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── 1. Feuille de style ────────────────────────────────────────────
  var CSS = `
/* ── Jetons — vraies valeurs HIG, apparence CLAIRE ── */
html.tjp-apple-mode {
  --am-bg: #F2F2F7;              /* systemGroupedBackground */
  --am-bg-2: #FFFFFF;            /* secondarySystemGroupedBackground — cartes */
  --am-bg-3: #F2F2F7;            /* cellules imbriquées (ex. case KPI dans la bande) */
  --am-label: #000000;
  --am-label-2: rgba(60,60,67,0.6);   /* secondaryLabel */
  --am-separator: rgba(60,60,67,0.29);

  --am-blue: #007AFF;    /* systemBlue (clair) */
  --am-green: #34C759;   /* systemGreen (clair) */
  --am-red: #FF3B30;     /* systemRed (clair) */
  --am-orange: #FF9500;  /* systemOrange (clair) */
  --am-purple: #AF52DE;  /* systemPurple (clair) — IA / premium */

  --am-r-small: 8px;
  --am-r-control: 12px;
  --am-r-card: 16px;
  --am-r-sheet: 20px;
  --am-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  color-scheme: light; /* les contrôles natifs (select, scrollbar...) suivent le clair */
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
html.tjp-apple-mode .btn, html.tjp-apple-mode .pbtn { text-transform: none !important; letter-spacing: 0 !important; font-weight: 600 !important; }

/* ── Filet de sécurité — l'app a des dizaines de variables --crt-* posées
   au cas par cas qu'il est impossible de toutes cataloguer une par une.
   Sans ce filet, un élément non repris plus bas garde son ancienne
   couleur perso → zones incohérentes. Les règles plus bas, plus
   spécifiques, reprennent la main normalement (une classe bat *). ── */
html.tjp-apple-mode * {
  background-color: transparent !important;
  background-image: none !important;
  color: var(--am-label) !important;
  border-color: var(--am-separator) !important;
}

/* ── Liquid Glass — navigation + TOUS les contrôles ronds/ovales
   (pavé PIN, icônes du chat IA, puces, interrupteurs, boutons pilule,
   hamburger). Jamais sur le contenu (cartes/listes/KPI/tableaux). ── */
html.tjp-apple-mode .nav,
html.tjp-apple-mode .nav-mobile,
html.tjp-apple-mode .mobile-menu,
html.tjp-apple-mode .acc-menu {
  background: rgba(255,255,255,0.72) !important;
  border-color: var(--am-separator) !important;
  backdrop-filter: blur(30px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
}
html.tjp-apple-mode .nav-tab.active { color: var(--am-blue) !important; }

/* Boutons — "glassProminent" (opaque) pour primaire/destructif, "glass"
   (verre dépoli translucide) pour le reste, avec reflet + rebond spring
   satisfaisant à l'appui. Jamais la balise <button> brute (ça cassait
   les petites icônes du journal), uniquement les classes réelles. */
html.tjp-apple-mode .btn,
html.tjp-apple-mode .pbtn,
html.tjp-apple-mode .acc-opt-btn,
html.tjp-apple-mode .change-pin-btn,
html.tjp-apple-mode .google-btn,
html.tjp-apple-mode .pc-icon-btn,
html.tjp-apple-mode .hamburger,
html.tjp-apple-mode .pin-btn,
html.tjp-apple-mode .tgl-track,
html.tjp-apple-mode .chip {
  position: relative;
  overflow: hidden;
  border-radius: var(--am-r-control) !important;
  border: 1px solid var(--am-separator) !important;
  background: rgba(120,120,128,0.12) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  color: var(--am-label) !important;
  transition: transform 0.18s var(--am-spring), background 0.2s ease, opacity 0.2s ease !important;
}
/* le reflet — la touche "verre qui capte la lumière" au clic */
html.tjp-apple-mode .btn::after,
html.tjp-apple-mode .pbtn::after,
html.tjp-apple-mode .acc-opt-btn::after,
html.tjp-apple-mode .pc-icon-btn::after,
html.tjp-apple-mode .hamburger::after,
html.tjp-apple-mode .pin-btn::after,
html.tjp-apple-mode .tgl-track::after,
html.tjp-apple-mode .chip::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.85), transparent 65%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
html.tjp-apple-mode .pc-icon-btn, html.tjp-apple-mode .pin-btn { border-radius: 50% !important; }
html.tjp-apple-mode .tgl-track, html.tjp-apple-mode .chip, html.tjp-apple-mode .tag { border-radius: 999px !important; }
html.tjp-apple-mode .btn-p, html.tjp-apple-mode .pbtn.active {
  background: var(--am-blue) !important; border-color: var(--am-blue) !important; color: #fff !important;
}
html.tjp-apple-mode .btn-d {
  background: var(--am-red) !important; border-color: var(--am-red) !important; color: #fff !important;
}
html.tjp-apple-mode .chip.sel { background: var(--am-blue) !important; border-color: var(--am-blue) !important; color: #fff !important; }
html.tjp-apple-mode .tgl-track.on { background: var(--am-green) !important; }
html.tjp-apple-mode .tgl-thumb { background: #fff !important; box-shadow: 0 2px 6px rgba(0,0,0,0.25) !important; }
@media (prefers-reduced-motion: no-preference) {
  html.tjp-apple-mode .btn:active, html.tjp-apple-mode .pbtn:active,
  html.tjp-apple-mode .chip:active, html.tjp-apple-mode .acc-opt-btn:active,
  html.tjp-apple-mode .hamburger:active, html.tjp-apple-mode .pc-icon-btn:active,
  html.tjp-apple-mode .pin-btn:active {
    transform: scale(0.92) !important; opacity: 0.88 !important;
  }
  html.tjp-apple-mode .tgl-track:active { transform: scale(0.94) !important; }
  html.tjp-apple-mode .btn:active::after, html.tjp-apple-mode .pbtn:active::after,
  html.tjp-apple-mode .acc-opt-btn:active::after, html.tjp-apple-mode .pc-icon-btn:active::after,
  html.tjp-apple-mode .hamburger:active::after, html.tjp-apple-mode .pin-btn:active::after,
  html.tjp-apple-mode .tgl-track:active::after, html.tjp-apple-mode .chip:active::after {
    opacity: 1;
  }
}

/* ── Contenu — PLAT, opaque, hiérarchie par paliers (cartes blanches sur
   fond gris clair, comme une liste groupée iOS), aucun flou. ── */
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
}
html.tjp-apple-mode .kpi-card { background: var(--am-bg-3) !important; }
html.tjp-apple-mode .card-header { background: transparent !important; border-bottom: 1px solid var(--am-separator) !important; }
html.tjp-apple-mode .card-body { padding: 16px !important; }

/* ── Champs de saisie ── */
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
  box-shadow: 0 0 0 3px rgba(0,122,255,0.25) !important;
}

/* ── Tags — capsules teintées à 15% (convention HIG) ── */
html.tjp-apple-mode .tag-long, html.tjp-apple-mode .tag-oui { background: rgba(52,199,89,0.15) !important; color: var(--am-green) !important; }
html.tjp-apple-mode .tag-short, html.tjp-apple-mode .tag-non { background: rgba(255,59,48,0.15) !important; color: var(--am-red) !important; }

/* ── Gain / perte partout dans l'app ── */
html.tjp-apple-mode .rp { color: var(--am-green) !important; }
html.tjp-apple-mode .rn { color: var(--am-red) !important; }

/* ── Calendrier ── */
html.tjp-apple-mode .cal-day { border-radius: var(--am-r-small) !important; }
html.tjp-apple-mode .cal-day.pos { background: rgba(52,199,89,0.15) !important; border-color: transparent !important; }
html.tjp-apple-mode .cal-day.neg { background: rgba(255,59,48,0.15) !important; border-color: transparent !important; }
html.tjp-apple-mode .cal-day.pos .cal-day-num, html.tjp-apple-mode .cal-day.pos .cal-pnl { color: var(--am-green) !important; }
html.tjp-apple-mode .cal-day.neg .cal-day-num, html.tjp-apple-mode .cal-day.neg .cal-pnl { color: var(--am-red) !important; }

/* ── Feuilles / modales — matériau clair sur la boîte, voile
   d'estompage derrière (tâche qui interrompt le fil principal) ── */
html.tjp-apple-mode .confirm-box, html.tjp-apple-mode .cp-modal, html.tjp-apple-mode .fc-modal-box, html.tjp-apple-mode .fc-edit-modal-box {
  background: rgba(255,255,255,0.85) !important;
  border: 1px solid var(--am-separator) !important;
  border-radius: var(--am-r-sheet) !important;
  backdrop-filter: blur(30px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
  color: var(--am-label) !important;
}
html.tjp-apple-mode .confirm-modal, html.tjp-apple-mode .cp-overlay, html.tjp-apple-mode .auth-overlay, html.tjp-apple-mode .pc-conv-overlay {
  background: rgba(0,0,0,0.4) !important;
  backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
}

/* ── Pavé PIN — touches circulaires en verre (couche de contrôle) ── */
html.tjp-apple-mode .pin-dot { border-radius: 50% !important; border-color: var(--am-separator) !important; }
html.tjp-apple-mode .pin-dot.filled { background: var(--am-blue) !important; border-color: var(--am-blue) !important; }

/* ── Chat Ami — bulles façon iMessage ── */
html.tjp-apple-mode .fc-msg-row.mine .fc-bubble {
  background: linear-gradient(180deg,#0A84FF,#0077E6) !important; color: #fff !important;
  border: none !important; border-radius: 20px 20px 4px 20px !important;
}
html.tjp-apple-mode .fc-msg-row:not(.mine) .fc-bubble {
  background: rgba(120,120,128,0.16) !important; color: var(--am-label) !important;
  border: none !important; border-radius: 20px 20px 20px 4px !important;
}
html.tjp-apple-mode .fc-input-bar { background: var(--am-bg-3) !important; border-color: var(--am-separator) !important; border-radius: var(--am-r-card) !important; }

/* ── Chat IA — violet = couleur qu'Apple réserve à l'IA/au premium ;
   touche "Apple Intelligence" en liseré dégradé animé. ── */
html.tjp-apple-mode .pc-msg-user {
  background: linear-gradient(180deg,#0A84FF,#0077E6) !important; color: #fff !important;
  border: none !important; border-radius: 18px 18px 4px 18px !important;
}
html.tjp-apple-mode .pc-msg-bot {
  background: rgba(175,82,222,0.12) !important; border: 1px solid rgba(175,82,222,0.25) !important;
  color: var(--am-label) !important; border-radius: 18px 18px 18px 4px !important;
}
html.tjp-apple-mode .pc-chat-title-bar { position: relative !important; }
html.tjp-apple-mode .pc-chat-title-bar::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  background: linear-gradient(90deg,#007AFF,#AF52DE,#FF3B30,#FF9500,#007AFF);
  background-size: 300% 100%; opacity: 0.85;
}
html.tjp-apple-mode .pc-thinking {
  background: linear-gradient(90deg,#007AFF,#AF52DE,#FF3B30,#007AFF) !important;
  background-size: 300% 100% !important;
  -webkit-background-clip: text !important; background-clip: text !important; color: transparent !important;
}
@media (prefers-reduced-motion: no-preference) {
  html.tjp-apple-mode .pc-chat-title-bar::after { animation: am-ai-glow 6s ease-in-out infinite; }
  html.tjp-apple-mode .pc-thinking { animation: am-ai-glow 3s ease-in-out infinite; }
}
@keyframes am-ai-glow { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

/* ── Défilement & sélection ── */
html.tjp-apple-mode ::-webkit-scrollbar { width: 8px; height: 8px; }
html.tjp-apple-mode ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.22); border-radius: 8px; }
html.tjp-apple-mode ::-webkit-scrollbar-track { background: transparent; }
html.tjp-apple-mode ::selection { background: rgba(0,122,255,0.25); }
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
  // Couleurs des graphiques (lues via gc('--xxx') par Chart.js, jamais
  // affectées par une classe CSS) : posées en variables inline (comme
  // previewTheme()) à l'activation, restaurées via previewTheme() (vrai
  // thème du compte + redessin) à la désactivation.
  var AM_CHART_VARS = {
    '--eq-line': '#007AFF', '--eq-axis': 'rgba(60,60,67,0.6)', '--eq-grid': 'rgba(0,0,0,0.08)',
    '--eq-fill-top': 'rgba(0,122,255,0.25)', '--eq-fill-bot': 'rgba(0,122,255,0)',
    '--pnl-axis': 'rgba(60,60,67,0.6)', '--pnl-grid': 'rgba(0,0,0,0.08)',
    '--pnl-bar-pos': '#34C759', '--pnl-bar-neg': '#FF3B30',
    '--pnl-avg-gain': '#34C759', '--pnl-avg-loss': '#FF3B30',
    '--risk-axis': 'rgba(60,60,67,0.6)', '--risk-grid': 'rgba(0,0,0,0.08)',
    '--risk-line': '#007AFF', '--risk-base': 'rgba(60,60,67,0.35)',
    '--risk-fill-top': 'rgba(0,122,255,0.2)', '--risk-fill-bot': 'rgba(0,122,255,0)',
    '--pie-win': '#34C759', '--pie-lose': '#FF3B30', '--pie-neutral': 'rgba(60,60,67,0.25)',
    '--winrate-slice-border': '#FFFFFF',
    '--comp-axis': 'rgba(60,60,67,0.6)', '--comp-grid': 'rgba(0,0,0,0.08)',
    '--comp-pos': 'rgba(52,199,89,0.85)', '--comp-neg': 'rgba(255,59,48,0.85)',
    '--mgmt-axis': 'rgba(60,60,67,0.6)', '--mgmt-grid': 'rgba(0,0,0,0.08)',
    '--badge-p-pos-tx': '#34C759', '--badge-p-neg-tx': '#FF3B30',
    '--kpi-strip-background': 'rgba(60,60,67,0.15)'
  };

  // N'agit que sur un vrai changement d'état — sinon loadSavedTheme(),
  // appelé très souvent (connexion, changement de sous-compte...),
  // redessinerait tous les graphiques à chaque fois même quand le mode
  // Apple n'est pas concerné, ce qui ralentissait le journal.
  function amApply(on) {
    var wasOn = document.documentElement.classList.contains('tjp-apple-mode');
    document.documentElement.classList.toggle('tjp-apple-mode', !!on);
    var track = document.getElementById('appleModeToggle');
    if (track) track.classList.toggle('on', !!on);
    if (!!on === wasOn) return;
    if (on) {
      for (var k in AM_CHART_VARS) {
        document.documentElement.style.setProperty(k, AM_CHART_VARS[k]);
      }
    } else if (typeof previewTheme === 'function') {
      try { previewTheme(); } catch (e) {}
    }
  }

  window.toggleAppleMode = function () {
    var next = !document.documentElement.classList.contains('tjp-apple-mode');
    amApply(next);
    amWrite(amKeyConfirmed(), next);
    if (next && typeof refreshAllCharts === 'function') {
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
