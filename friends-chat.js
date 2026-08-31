// ══════════════════════════════════════════════════════════════════════════
// CHAT AMIS (TJP) — page "Ami"
// ──────────────────────────────────────────────────────────────────────────
// Module 100% additif : ne modifie AUCUNE fonction existante par édition
// directe. Il surcharge (wrap) quelques fonctions globales (saveProfile,
// afterPinValidated, _doResetPin) et construit tout le reste au runtime
// (DOM + CSS injectés dans #page-ami, qui est vide à l'origine). Pour
// désactiver entièrement cette fonctionnalité, il suffit de retirer la
// balise <script src="friends-chat.js"> — aucun autre fichier n'est touché.
//
// Fonctionnalités :
//  - Liste d'amis (ajout par pseudo), format WhatsApp : colonne de gauche
//    avec les contacts, conversation à droite.
//  - Messages texte, messages vocaux (rester appuyé sur le micro), et
//    partage de la fiche technique complète d'un trade (infos + notes +
//    images), pas seulement une image isolée.
//  - Sur PC : contacts affichés avec pseudo + photo. Sur téléphone :
//    uniquement la photo (grille compacte), conversation en plein écran
//    avec bouton retour.
//  - Temps réel via Supabase Realtime (mêmes principes que la sync des
//    trades) + repli propre si la migration SQL n'a pas encore été
//    appliquée (message explicite au lieu d'un écran cassé).
//
// Nécessite la migration SQL "migration_chat.sql" (tables tjp_profiles /
// tjp_contacts / tjp_messages + policies RLS + bucket de stockage
// "chat-audio"). Tant qu'elle n'est pas appliquée, la page affiche un
// message explicite au lieu de planter.
// ══════════════════════════════════════════════════════════════════════════

const FC_PROFILES_TABLE = 'tjp_profiles';
const FC_CONTACTS_TABLE = 'tjp_contacts';
const FC_MESSAGES_TABLE = 'tjp_messages';
const FC_AUDIO_BUCKET = 'chat-audio';

// ── État ──
let fcContacts = []; // [{friendId, pseudo, photo}]
let fcActiveFriendId = null;
let fcMessages = [];
let fcChannel = null;
let fcActivityMap = {}; // friendId -> dernier created_at (tri de la liste)
let fcInitDone = false;
let fcSetupNoticeShown = false;
let fcSearchDebounce = null;
let fcAudioPlayingId = null;

// ── Utilitaires ──
function fcEsc(s) {
  return typeof escapeHtml === 'function' ? escapeHtml(s) : String(s == null ? '' : s);
}
function fcFmtDuration(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}
function fcFmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
  } catch (e) {
    return '';
  }
}
function fcAvatarHtml(photoUrl, pseudo) {
  const initial = fcEsc((pseudo || '?').trim().charAt(0).toUpperCase() || '?');
  if (photoUrl) {
    return `<div class="fc-avatar"><img src="${fcEsc(photoUrl)}" alt=""></div>`;
  }
  return `<div class="fc-avatar">${initial}</div>`;
}
function fcIsMissingTableError(error) {
  if (!error) return false;
  return error.code === '42P01' || /relation .* does not exist/i.test(error.message || '');
}
function fcShowSetupNotice() {
  if (fcSetupNoticeShown) return;
  fcSetupNoticeShown = true;
  const wrap = document.getElementById('fcWrap');
  if (wrap) {
    wrap.innerHTML =
      '<div class="fc-setup-notice">⚠ La messagerie n\'est pas encore configurée côté Supabase.<br>' +
      'Exécute la migration SQL fournie (tables tjp_profiles / tjp_contacts / tjp_messages + bucket ' +
      'chat-audio), puis recharge la page.</div>';
  }
}

// ══ CSS injecté (aucune modification de style.css) ══
const FC_CSS = `
.fc-wrap{display:flex;height:clamp(420px,calc(100vh - 190px),760px);border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--card);}
.fc-sidebar{width:280px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--border);background:var(--surface);}
.fc-sidebar-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--border);flex-shrink:0;}
.fc-sidebar-title{font-family:var(--mono);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);}
.fc-add-btn{width:26px;height:26px;border-radius:50%;border:1px solid var(--border);background:var(--card);color:var(--green);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.fc-add-btn:hover{border-color:var(--green);}
.fc-contact-list{flex:1;overflow-y:auto;}
.fc-contact-empty{padding:24px 14px;font-size:12px;color:var(--muted);text-align:center;line-height:1.6;}
.fc-contact-item{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .15s;}
.fc-contact-item:hover{background:rgba(255,255,255,.04);}
.fc-contact-item.active{background:color-mix(in srgb, var(--green) 10%, transparent);}
.fc-avatar{width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--surface);border:1px solid var(--border);font-size:15px;color:var(--muted);font-family:var(--mono);}
.fc-avatar img{width:100%;height:100%;object-fit:cover;display:block;}
.fc-contact-name{font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fc-chat{flex:1;display:flex;flex-direction:column;min-width:0;}
.fc-chat-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px;padding:20px;text-align:center;}
.fc-chat-active{flex:1;display:flex;flex-direction:column;min-height:0;}
.fc-chat-header{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0;}
.fc-chat-header .fc-avatar{width:32px;height:32px;font-size:12px;}
.fc-back-btn{display:none;background:none;border:none;color:var(--text);font-size:19px;cursor:pointer;padding:2px 6px 2px 0;line-height:1;}
.fc-chat-pseudo{font-size:14px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fc-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}
.fc-msg-row{display:flex;}
.fc-msg-row.mine{justify-content:flex-end;}
.fc-bubble{max-width:72%;padding:8px 11px;border-radius:12px;font-size:13px;line-height:1.4;}
.fc-msg-row.mine .fc-bubble{background:color-mix(in srgb, var(--green) 20%, var(--card));border-bottom-right-radius:3px;}
.fc-msg-row:not(.mine) .fc-bubble{background:var(--surface);border:1px solid var(--border);border-bottom-left-radius:3px;}
.fc-bubble-text{white-space:pre-wrap;word-break:break-word;color:var(--text);}
.fc-bubble-time{font-size:9px;color:var(--muted);margin-top:3px;text-align:right;font-family:var(--mono);}
.fc-audio-msg{display:flex;align-items:center;gap:8px;min-width:170px;}
.fc-audio-play{width:28px;height:28px;border-radius:50%;border:none;background:var(--green);color:var(--bg);font-size:11px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.fc-audio-bar{flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden;}
.fc-audio-bar-fill{height:100%;background:var(--green);width:0%;}
.fc-audio-duration{font-size:10px;color:var(--muted);font-family:var(--mono);flex-shrink:0;}
.fc-bt-badge{font-size:11px;line-height:1;padding:1px 3px;background:var(--bt-bg);color:var(--bt-tx);border-radius:3px;font-family:var(--mono);display:inline-block;}
.fc-trade-card{width:220px;max-width:100%;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--card);}
.fc-trade-card-head{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:7px 10px;background:var(--surface);font-family:var(--mono);font-size:11px;color:var(--text);}
.fc-trade-card-body{padding:8px 10px;font-size:11px;color:var(--text);}
.fc-trade-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:3px;}
.fc-trade-row span:first-child{color:var(--muted);}
.fc-trade-chips{display:flex;flex-wrap:wrap;gap:3px;margin-top:5px;}
.fc-trade-chip{font-size:9px;padding:2px 6px;border-radius:3px;background:var(--surface);border:1px solid var(--border);color:var(--muted);}
.fc-trade-notes{margin-top:6px;font-size:10px;color:var(--muted);font-style:italic;white-space:pre-wrap;}
.fc-trade-imgs{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;}
.fc-trade-imgs img{width:44px;height:34px;object-fit:cover;border-radius:4px;cursor:zoom-in;border:1px solid var(--border);}
.fc-input-bar{display:flex;align-items:flex-end;gap:8px;padding:10px 12px;border-top:1px solid var(--border);background:var(--surface);flex-shrink:0;}
.fc-attach-btn,.fc-mic-btn,.fc-desktop-cancel-btn{background:none;border:none;color:var(--muted);font-size:19px;cursor:pointer;flex-shrink:0;padding:4px;display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;}
.fc-attach-btn:hover,.fc-mic-btn:hover{color:var(--green);}
.fc-desktop-cancel-btn{display:none;color:var(--red);}
.fc-desktop-cancel-btn:hover{opacity:.8;}
.fc-mic-btn[data-mode="send"]{color:var(--green);}
.fc-mic-btn.cancel-armed{color:#fff;background:var(--red);border-radius:50%;}
.fc-input-center{flex:1;min-width:0;position:relative;display:flex;align-items:center;}
.fc-rec-indicator{display:none;align-items:center;gap:8px;width:100%;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:7px 12px;box-sizing:border-box;}
.fc-rec-wave{flex:1;display:flex;align-items:center;gap:2px;height:22px;overflow:hidden;}
.fc-wave-bar{flex:1;min-width:2px;max-width:4px;background:var(--green);border-radius:2px;height:15%;transition:height .08s linear;}
.fc-mic-wrap{position:relative;flex-shrink:0;}
.fc-rec-cancel-zone{position:absolute;right:100%;top:50%;transform:translateY(-50%);margin-right:6px;white-space:nowrap;display:flex;align-items:center;gap:6px;pointer-events:none;}
.fc-rec-hint{font-size:11px;color:var(--muted);}
.fc-rec-trash{display:none;width:30px;height:30px;border-radius:50%;background:var(--red);color:#fff;align-items:center;justify-content:center;font-size:15px;}
.fc-rec-cancel-zone.armed .fc-rec-hint{display:none;}
.fc-rec-cancel-zone.armed .fc-rec-trash{display:flex;}
.fc-rec-dot{width:9px;height:9px;border-radius:50%;background:var(--red);animation:fcPulse 1s infinite;flex-shrink:0;}
.fc-rec-timer{font-family:var(--mono);font-size:12px;color:var(--text);flex-shrink:0;}
.fc-text-input{flex:1;resize:none;max-height:96px;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:8px 12px;color:var(--text);font-family:var(--sans);font-size:13px;line-height:1.35;}
.fc-text-input:focus{outline:none;border-color:var(--green);}
@keyframes fcPulse{0%,100%{opacity:1}50%{opacity:.3}}
.fc-setup-notice{padding:24px;font-size:12px;color:var(--muted);line-height:1.7;text-align:center;margin:auto;}
.fc-modal-box{width:340px;max-width:92vw;text-align:left;max-height:80vh;display:flex;flex-direction:column;}
.fc-modal-title{font-family:var(--mono);font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--green);margin-bottom:12px;text-align:center;}
.fc-search-input{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:13px;margin-bottom:10px;font-family:var(--sans);}
.fc-search-input:focus{outline:none;border-color:var(--green);}
.fc-search-results,.fc-trade-pick-list{flex:1;overflow-y:auto;max-height:320px;}
.fc-result-item{display:flex;align-items:center;gap:10px;padding:7px 6px;border-radius:6px;}
.fc-result-name{font-size:13px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fc-result-add-btn{font-family:var(--mono);font-size:9px;padding:5px 10px;border-radius:4px;background:var(--btn-p-bg);color:var(--btn-p-tx);border:none;cursor:pointer;flex-shrink:0;}
.fc-trade-pick-item{display:flex;align-items:center;gap:10px;padding:8px 6px;border-radius:6px;cursor:pointer;}
.fc-trade-pick-item:hover{background:rgba(255,255,255,.05);}
.fc-trade-pick-info{flex:1;min-width:0;}
.fc-trade-pick-pair{font-size:12px;color:var(--text);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fc-trade-pick-meta{font-size:10px;color:var(--muted);}
.fc-empty-hint{font-size:11px;color:var(--muted);text-align:center;padding:14px 6px;}
@media (max-width:1100px){
  .fc-wrap{height:calc(100dvh - 150px);min-height:400px;border-radius:6px;}
  .fc-sidebar{width:100%;border-right:none;}
  .fc-chat{display:none;}
  .fc-wrap.fc-chat-open .fc-sidebar{display:none;}
  .fc-wrap.fc-chat-open .fc-chat{display:flex;}
  .fc-back-btn{display:inline-flex;}
  .fc-contact-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:14px;padding:14px;}
  .fc-contact-item{flex-direction:column;gap:5px;padding:4px;border-bottom:none;text-align:center;}
  .fc-contact-name{display:none;}
  .fc-avatar{width:56px;height:56px;font-size:19px;margin:0 auto;}
  .fc-bubble{max-width:82%;}
}
`;

function fcInjectStyles() {
  if (document.getElementById('fcStyles')) return;
  const style = document.createElement('style');
  style.id = 'fcStyles';
  style.textContent = FC_CSS;
  document.head.appendChild(style);
}

// ══ Markup ══
const FC_HTML = `
<div class="fc-wrap" id="fcWrap">
  <div class="fc-sidebar">
    <div class="fc-sidebar-header">
      <span class="fc-sidebar-title">Discussions</span>
      <button class="fc-add-btn" onclick="fcOpenAddContact()" title="Ajouter un ami">+</button>
    </div>
    <div class="fc-contact-list" id="fcContactList"><div class="fc-contact-empty">Chargement…</div></div>
  </div>
  <div class="fc-chat">
    <div class="fc-chat-empty" id="fcChatEmpty">Sélectionne un ami pour discuter.</div>
    <div class="fc-chat-active" id="fcChatActive" style="display:none;">
      <div class="fc-chat-header">
        <button class="fc-back-btn" onclick="fcBackToContacts()">←</button>
        <div id="fcChatAvatar"></div>
        <div class="fc-chat-pseudo" id="fcChatPseudo"></div>
      </div>
      <div class="fc-messages" id="fcMessages"></div>
      <div class="fc-input-bar" id="fcInputBarRow">
        <button class="fc-desktop-cancel-btn" id="fcDesktopCancelBtn" title="Annuler"><span class="deco-emoji">🗑</span><span class="deco-emoji-alt">✕</span></button>
        <button class="fc-attach-btn" id="fcAttachBtn" title="Partager un trade"><span class="deco-emoji">📎</span><span class="deco-emoji-alt">+</span></button>
        <div class="fc-input-center">
          <textarea class="fc-text-input" id="fcTextInput" placeholder="Message" rows="1"></textarea>
          <div class="fc-rec-indicator" id="fcRecIndicator" style="display:none;">
            <span class="fc-rec-dot"></span>
            <span class="fc-rec-timer" id="fcRecTimer">0:00</span>
            <div class="fc-rec-wave" id="fcRecWave"></div>
          </div>
        </div>
        <div class="fc-mic-wrap" id="fcMicWrap">
          <div class="fc-rec-cancel-zone" id="fcRecCancelZone" style="display:none;">
            <span class="fc-rec-hint">◁ Glisser pour annuler</span>
            <span class="fc-rec-trash"><span class="deco-emoji">🗑</span><span class="deco-emoji-alt">✕</span></span>
          </div>
          <button class="fc-mic-btn" id="fcMicBtn" title="Message vocal (rester appuyé)"></button>
        </div>
      </div>
    </div>
  </div>
</div>
`;

const FC_MODALS_HTML = `
<div class="confirm-modal" id="fcAddModal">
  <div class="confirm-box fc-modal-box">
    <div class="fc-modal-title">Ajouter un ami</div>
    <input type="text" class="fc-search-input" id="fcPseudoSearchInput" placeholder="Pseudo…" oninput="fcOnPseudoSearchInput()">
    <div class="fc-search-results" id="fcSearchResults"></div>
    <div class="btn-row" style="margin-top:12px;"><button class="btn btn-g" onclick="fcCloseAddContact()">FERMER</button></div>
  </div>
</div>
<div class="confirm-modal" id="fcTradeModal">
  <div class="confirm-box fc-modal-box">
    <div class="fc-modal-title">Partager un trade</div>
    <input type="text" class="fc-search-input" id="fcTradeSearchInput" placeholder="Rechercher une paire, une date…" oninput="fcRenderTradePickerList(this.value)">
    <div class="fc-trade-pick-list" id="fcTradePickList"></div>
    <div class="btn-row" style="margin-top:12px;"><button class="btn btn-g" onclick="fcCloseTradePicker()">FERMER</button></div>
  </div>
</div>
`;

function fcInjectMarkup() {
  const page = document.getElementById('page-ami');
  if (!page || document.getElementById('fcWrap')) return;
  page.insertAdjacentHTML('beforeend', FC_HTML);
  fcBindInputBarEvents();
}
function fcInjectModals() {
  if (document.getElementById('fcAddModal')) return;
  document.body.insertAdjacentHTML('beforeend', FC_MODALS_HTML);
}

// ══ Profil publié dans l'annuaire (pour la recherche par pseudo) ══
async function fcPublishProfile() {
  if (!currentUser || typeof sb === 'undefined') return;
  try {
    const profile = typeof getProfile === 'function' ? getProfile() : null;
    if (!profile) return;
    await sb.from(FC_PROFILES_TABLE).upsert(
      {
        user_id: currentUser.id,
        pseudo: profile.pseudo || 'Trader',
        photo_url: profile.photo || null,
        updated_at: new Date().toISOString()
      },
      {onConflict: 'user_id'}
    );
  } catch (e) {
    console.warn('fcPublishProfile:', e);
  }
}

// ══ Contacts ══
async function fcLoadContacts() {
  if (!currentUser || typeof sb === 'undefined') return;
  const me = currentUser.id;
  try {
    const {data, error} = await sb
      .from(FC_CONTACTS_TABLE)
      .select('user_id,contact_user_id')
      .or(`user_id.eq.${me},contact_user_id.eq.${me}`);
    if (error) {
      if (fcIsMissingTableError(error)) fcShowSetupNotice();
      return;
    }
    const friendIds = Array.from(
      new Set((data || []).map(r => (r.user_id === me ? r.contact_user_id : r.user_id)))
    );
    if (!friendIds.length) {
      fcContacts = [];
      fcRenderContactList();
      return;
    }
    const {data: profiles, error: perr} = await sb
      .from(FC_PROFILES_TABLE)
      .select('user_id,pseudo,photo_url')
      .in('user_id', friendIds);
    if (perr && fcIsMissingTableError(perr)) fcShowSetupNotice();
    const profMap = {};
    (profiles || []).forEach(p => {
      profMap[p.user_id] = p;
    });
    fcContacts = friendIds.map(id => ({
      friendId: id,
      pseudo: (profMap[id] && profMap[id].pseudo) || 'Utilisateur',
      photo: (profMap[id] && profMap[id].photo_url) || ''
    }));
    await fcRefreshActivityOrder();
  } catch (e) {
    console.warn('fcLoadContacts:', e);
  }
}

async function fcRefreshActivityOrder() {
  if (!currentUser || typeof sb === 'undefined') {
    fcRenderContactList();
    return;
  }
  const me = currentUser.id;
  try {
    const {data, error} = await sb
      .from(FC_MESSAGES_TABLE)
      .select('sender_id,receiver_id,created_at')
      .or(`sender_id.eq.${me},receiver_id.eq.${me}`)
      .order('created_at', {ascending: false})
      .limit(400);
    if (!error && data) {
      fcActivityMap = {};
      data.forEach(m => {
        const other = m.sender_id === me ? m.receiver_id : m.sender_id;
        if (!fcActivityMap[other]) fcActivityMap[other] = m.created_at;
      });
    }
  } catch (e) {}
  fcContacts.sort((a, b) => {
    const ta = fcActivityMap[a.friendId];
    const tb = fcActivityMap[b.friendId];
    if (ta && tb) return tb.localeCompare(ta);
    if (ta) return -1;
    if (tb) return 1;
    return a.pseudo.localeCompare(b.pseudo);
  });
  fcRenderContactList();
}

function fcRenderContactList() {
  const list = document.getElementById('fcContactList');
  if (!list) return;
  if (!fcContacts.length) {
    list.innerHTML =
      '<div class="fc-contact-empty">Aucun ami pour le moment.<br>Touche + pour en ajouter un par son pseudo.</div>';
    return;
  }
  list.innerHTML = fcContacts
    .map(
      c => `<div class="fc-contact-item${c.friendId === fcActiveFriendId ? ' active' : ''}" data-friend-id="${fcEsc(c.friendId)}" onclick="fcOpenConversation('${fcEsc(c.friendId)}')">
      ${fcAvatarHtml(c.photo, c.pseudo)}
      <div class="fc-contact-name">${fcEsc(c.pseudo)}</div>
    </div>`
    )
    .join('');
}

// ── Ajout d'un ami par pseudo ──
function fcOpenAddContact() {
  const modal = document.getElementById('fcAddModal');
  if (modal) modal.classList.add('open');
  const input = document.getElementById('fcPseudoSearchInput');
  if (input) {
    input.value = '';
    input.focus();
  }
  const results = document.getElementById('fcSearchResults');
  if (results) results.innerHTML = '';
}
function fcCloseAddContact() {
  const modal = document.getElementById('fcAddModal');
  if (modal) modal.classList.remove('open');
}
function fcOnPseudoSearchInput() {
  clearTimeout(fcSearchDebounce);
  fcSearchDebounce = setTimeout(fcRunPseudoSearch, 300);
}
async function fcRunPseudoSearch() {
  const input = document.getElementById('fcPseudoSearchInput');
  const results = document.getElementById('fcSearchResults');
  if (!input || !results || typeof sb === 'undefined') return;
  const q = input.value.trim().replace(/[%_]/g, '');
  if (!q) {
    results.innerHTML = '';
    return;
  }
  results.innerHTML = '<div class="fc-empty-hint">Recherche…</div>';
  try {
    const {data, error} = await sb
      .from(FC_PROFILES_TABLE)
      .select('user_id,pseudo,photo_url')
      .ilike('pseudo', `%${q}%`)
      .limit(10);
    if (error) {
      if (fcIsMissingTableError(error)) fcShowSetupNotice();
      else results.innerHTML = '<div class="fc-empty-hint">Erreur de recherche.</div>';
      return;
    }
    const me = currentUser.id;
    const existingIds = new Set(fcContacts.map(c => c.friendId));
    const filtered = (data || []).filter(p => p.user_id !== me);
    if (!filtered.length) {
      results.innerHTML = '<div class="fc-empty-hint">Aucun pseudo correspondant.</div>';
      return;
    }
    results.innerHTML = filtered
      .map(
        p => `<div class="fc-result-item">
        ${fcAvatarHtml(p.photo_url, p.pseudo)}
        <div class="fc-result-name">${fcEsc(p.pseudo)}</div>
        ${
          existingIds.has(p.user_id)
            ? '<span style="font-size:9px;color:var(--muted);font-family:var(--mono);flex-shrink:0;">DÉJÀ AJOUTÉ</span>'
            : `<button class="fc-result-add-btn" onclick="fcAddContact('${fcEsc(p.user_id)}')">AJOUTER</button>`
        }
      </div>`
      )
      .join('');
  } catch (e) {
    console.warn('fcRunPseudoSearch:', e);
  }
}
async function fcAddContact(friendUserId) {
  if (!currentUser || typeof sb === 'undefined') return;
  try {
    const {error} = await sb
      .from(FC_CONTACTS_TABLE)
      .insert({user_id: currentUser.id, contact_user_id: friendUserId});
    if (error && error.code !== '23505') {
      // 23505 = unique_violation (déjà ami) : pas grave, on continue
      if (fcIsMissingTableError(error)) fcShowSetupNotice();
      else if (typeof showSync === 'function') showSync('⚠ Ajout impossible', '#ef4444');
      return;
    }
    fcCloseAddContact();
    await fcLoadContacts();
  } catch (e) {
    console.warn('fcAddContact:', e);
  }
}

// ══ Conversation ══
async function fcOpenConversation(friendId) {
  fcActiveFriendId = friendId;
  const c = fcContacts.find(x => x.friendId === friendId);
  const emptyEl = document.getElementById('fcChatEmpty');
  const activeEl = document.getElementById('fcChatActive');
  if (emptyEl) emptyEl.style.display = 'none';
  if (activeEl) activeEl.style.display = 'flex';
  const pseudoEl = document.getElementById('fcChatPseudo');
  if (pseudoEl) pseudoEl.textContent = c ? c.pseudo : '…';
  const avatarEl = document.getElementById('fcChatAvatar');
  if (avatarEl) avatarEl.innerHTML = fcAvatarHtml(c ? c.photo : '', c ? c.pseudo : '?');
  document.querySelectorAll('.fc-contact-item').forEach(el => {
    el.classList.toggle('active', el.dataset.friendId === friendId);
  });
  const wrap = document.getElementById('fcWrap');
  if (wrap) wrap.classList.add('fc-chat-open');
  const input = document.getElementById('fcTextInput');
  if (input) input.value = '';
  fcUpdateMicSendBtn();
  await fcLoadMessages(friendId);
}
function fcBackToContacts() {
  const wrap = document.getElementById('fcWrap');
  if (wrap) wrap.classList.remove('fc-chat-open');
}
async function fcLoadMessages(friendId) {
  const box = document.getElementById('fcMessages');
  if (box) box.innerHTML = '<div class="fc-empty-hint">Chargement…</div>';
  if (!currentUser || typeof sb === 'undefined') return;
  const me = currentUser.id;
  try {
    const {data, error} = await sb
      .from(FC_MESSAGES_TABLE)
      .select('*')
      .or(`and(sender_id.eq.${me},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${me})`)
      .order('created_at', {ascending: true})
      .limit(500);
    if (error) {
      if (fcIsMissingTableError(error)) fcShowSetupNotice();
      else if (box) box.innerHTML = '<div class="fc-empty-hint">Erreur de chargement.</div>';
      return;
    }
    fcMessages = data || [];
    fcRenderMessages();
  } catch (e) {
    console.warn('fcLoadMessages:', e);
  }
}

// ══ Rendu des messages ══
function fcCustomFieldHtml(cf) {
  if (cf.type === 'text') {
    return `<div class="fc-trade-notes"><span style="color:var(--text);font-style:normal;">${fcEsc(cf.label)} :</span> ${fcEsc(String(cf.value))}</div>`;
  }
  let displayVal;
  if (cf.type === 'stars') {
    const n = parseFloat(cf.value) || 0;
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= Math.round(n) ? '★' : '☆';
    displayVal = s;
  } else {
    displayVal = fcEsc(String(cf.value));
  }
  return `<div class="fc-trade-row"><span>${fcEsc(cf.label)}</span><span>${displayVal}</span></div>`;
}
function fcBuildTradeCardHtml(t) {
  const res = typeof t.res === 'number' ? t.res : parseFloat(t.res) || 0;
  const resColor = res >= 0 ? 'var(--green)' : 'var(--red)';
  const resTxt = (res >= 0 ? '+' : '') + res.toFixed(2) + ' €';
  const tfList = (t.tf || '').split('|').filter(Boolean);
  const confList = (t.conf || '').split('|').filter(Boolean);
  const imgs = Array.isArray(t.images) ? t.images.slice(0, 6) : [];
  const starsN = parseFloat(t.stars) || 0;
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) starsHtml += i <= Math.round(starsN) ? '★' : '☆';
  return `<div class="fc-trade-card">
    <div class="fc-trade-card-head">
      <span>${fcEsc(t.paire || '—')}${t.dir ? ' · ' + fcEsc(t.dir) : ''}${t.backtest ? '&nbsp;<span class="fc-bt-badge">BT</span>' : ''}</span>
      <span style="color:${resColor};font-weight:700;">${fcEsc(resTxt)}</span>
    </div>
    <div class="fc-trade-card-body">
      <div class="fc-trade-row"><span>Date</span><span>${fcEsc(t.date || '—')}${t.heure ? ' ' + fcEsc(t.heure) : ''}</span></div>
      ${t.session ? `<div class="fc-trade-row"><span>Session</span><span>${fcEsc(t.session)}</span></div>` : ''}
      ${t.rrPris || t.rrCible ? `<div class="fc-trade-row"><span>RR</span><span>${fcEsc(String(t.rrPris || t.rrCible))}</span></div>` : ''}
      ${t.mgmt ? `<div class="fc-trade-row"><span>Mgmt</span><span>${fcEsc(t.mgmt)}</span></div>` : ''}
      ${t.reprend ? `<div class="fc-trade-row"><span>Reprend.</span><span>${fcEsc(t.reprend)}</span></div>` : ''}
      ${starsN ? `<div class="fc-trade-row"><span>Note</span><span>${starsHtml}</span></div>` : ''}
      ${Array.isArray(t.customFields) && t.customFields.length ? t.customFields.map(fcCustomFieldHtml).join('') : ''}
      ${tfList.length || confList.length ? `<div class="fc-trade-chips">${tfList.concat(confList).map(c => `<span class="fc-trade-chip">${fcEsc(c)}</span>`).join('')}</div>` : ''}
      ${t.notes ? `<div class="fc-trade-notes">${fcEsc(t.notes)}</div>` : ''}
      ${imgs.length ? `<div class="fc-trade-imgs">${imgs.map(src => `<img src="${fcEsc(src)}" onclick="openFullscreen(this.src)">`).join('')}</div>` : ''}
    </div>
  </div>`;
}
function fcAudioBubbleHtml(m) {
  return `<div class="fc-audio-msg" data-msg-id="${m.id}">
    <button class="fc-audio-play" onclick="fcToggleAudioPlay(${m.id}, '${fcEsc(m.audio_url)}')">▶</button>
    <div class="fc-audio-bar"><div class="fc-audio-bar-fill"></div></div>
    <span class="fc-audio-duration">${fcFmtDuration(m.audio_duration)}</span>
  </div>`;
}
function fcRenderBubbleContent(m) {
  if (m.msg_type === 'audio') return fcAudioBubbleHtml(m);
  if (m.msg_type === 'trade' && m.trade_data) return fcBuildTradeCardHtml(m.trade_data);
  const text = fcEsc(m.content || '').replace(/\n/g, '<br>');
  return `<div class="fc-bubble-text">${text}</div>`;
}
function fcRenderMessages() {
  const box = document.getElementById('fcMessages');
  if (!box) return;
  const me = currentUser && currentUser.id;
  if (!fcMessages.length) {
    box.innerHTML = '<div class="fc-empty-hint">Aucun message pour le moment.</div>';
    return;
  }
  box.innerHTML = fcMessages
    .map(m => {
      const mine = m.sender_id === me;
      return `<div class="fc-msg-row${mine ? ' mine' : ''}">
      <div class="fc-bubble">${fcRenderBubbleContent(m)}<div class="fc-bubble-time">${fcFmtTime(m.created_at)}</div></div>
    </div>`;
    })
    .join('');
  box.scrollTop = box.scrollHeight;
}

// ══ Audio : lecture ══
function fcGetAudioEl() {
  let el = document.getElementById('fcAudioPlayer');
  if (!el) {
    el = document.createElement('audio');
    el.id = 'fcAudioPlayer';
    el.style.display = 'none';
    document.body.appendChild(el);
    el.addEventListener('timeupdate', fcUpdateAudioProgress);
    el.addEventListener('ended', () => {
      fcAudioPlayingId = null;
      fcUpdateAudioProgress();
    });
  }
  return el;
}
function fcToggleAudioPlay(msgId, url) {
  const el = fcGetAudioEl();
  if (fcAudioPlayingId === msgId && !el.paused) {
    el.pause();
    fcAudioPlayingId = null;
  } else {
    if (fcAudioPlayingId !== msgId) el.src = url;
    el.play().catch(() => {});
    fcAudioPlayingId = msgId;
  }
  fcUpdateAudioProgress();
}
function fcUpdateAudioProgress() {
  const el = document.getElementById('fcAudioPlayer');
  document.querySelectorAll('.fc-audio-msg').forEach(row => {
    const id = row.dataset.msgId;
    const btn = row.querySelector('.fc-audio-play');
    const fill = row.querySelector('.fc-audio-bar-fill');
    const isPlaying = el && id === String(fcAudioPlayingId) && !el.paused;
    if (btn) btn.textContent = isPlaying ? '❙❙' : '▶';
    if (fill) {
      const pct = isPlaying && el.duration ? (el.currentTime / el.duration) * 100 : 0;
      fill.style.width = pct + '%';
    }
  });
  if (fcAudioPlayingId != null) requestAnimationFrame(() => {}); // pas de polling supplémentaire, timeupdate suffit
}

// ══ Envoi de messages ══
async function fcSendMessage(payload) {
  if (!currentUser || !fcActiveFriendId || typeof sb === 'undefined') return;
  const row = Object.assign(
    {
      sender_id: currentUser.id,
      receiver_id: fcActiveFriendId,
      msg_type: 'text',
      content: null,
      audio_url: null,
      audio_duration: null,
      trade_data: null
    },
    payload
  );
  try {
    const {data, error} = await sb.from(FC_MESSAGES_TABLE).insert(row).select().single();
    if (error) {
      if (fcIsMissingTableError(error)) fcShowSetupNotice();
      else if (typeof showSync === 'function') showSync('⚠ Message non envoyé', '#ef4444');
      return;
    }
    if (!fcMessages.some(m => m.id === data.id)) {
      fcMessages.push(data);
      fcRenderMessages();
    }
    fcActivityMap[fcActiveFriendId] = data.created_at;
  } catch (e) {
    console.warn('fcSendMessage:', e);
    if (typeof showSync === 'function') showSync('⚠ Réseau', '#f59e0b');
  }
}
function fcSendTextMessage() {
  const input = document.getElementById('fcTextInput');
  if (!input || !fcActiveFriendId) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';
  fcUpdateMicSendBtn();
  fcSendMessage({msg_type: 'text', content: text});
}

// ══ Partage d'un trade (fiche technique complète) ══
function fcOpenTradePicker() {
  if (!fcActiveFriendId) return;
  fcRenderTradePickerList('');
  const modal = document.getElementById('fcTradeModal');
  if (modal) modal.classList.add('open');
  const search = document.getElementById('fcTradeSearchInput');
  if (search) {
    search.value = '';
    search.focus();
  }
}
function fcCloseTradePicker() {
  const modal = document.getElementById('fcTradeModal');
  if (modal) modal.classList.remove('open');
}
function fcRenderTradePickerList(filter) {
  const list = document.getElementById('fcTradePickList');
  if (!list) return;
  const f = (filter || '').toLowerCase();
  const trades = (APP.trades || [])
    .filter(t => !f || (t.paire || '').toLowerCase().includes(f) || (t.date || '').includes(f))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id)
    .slice(0, 60);
  if (!trades.length) {
    list.innerHTML = '<div class="fc-empty-hint">Aucun trade trouvé.</div>';
    return;
  }
  list.innerHTML = trades
    .map(t => {
      const res = typeof t.res === 'number' ? t.res : parseFloat(t.res) || 0;
      const resColor = res >= 0 ? 'var(--green)' : 'var(--red)';
      return `<div class="fc-trade-pick-item" onclick="fcSendTradeMessage(${t.id})">
        <div class="fc-trade-pick-info">
          <div class="fc-trade-pick-pair">${fcEsc(t.paire || '—')}${t.dir ? ' · ' + fcEsc(t.dir) : ''}${t.backtest ? '&nbsp;<span class="fc-bt-badge">BT</span>' : ''}</div>
          <div class="fc-trade-pick-meta">${fcEsc(t.date || '')}${t.heure ? ' ' + fcEsc(t.heure) : ''}</div>
        </div>
        <div style="color:${resColor};font-family:var(--mono);font-size:12px;font-weight:700;flex-shrink:0;">${res >= 0 ? '+' : ''}${res.toFixed(2)}€</div>
      </div>`;
    })
    .join('');
}
function fcCollectCustomFields(t) {
  if (!Array.isArray(APP.cfFields) || !APP.cfFields.length) return [];
  const out = [];
  APP.cfFields.forEach(f => {
    const val = typeof cfDisplayValue === 'function' ? cfDisplayValue(f, t) : t['cf_' + f.id];
    if (val === undefined || val === null || val === '') return;
    out.push({label: f.colName || f.label || f.id, type: f.type, value: val});
  });
  return out;
}
function fcSendTradeMessage(tradeId) {
  const t = (APP.trades || []).find(x => x.id === tradeId);
  if (!t) return;
  const payload = {
    id: t.id,
    date: t.date || '',
    heure: t.heure || '',
    session: t.session || '',
    paire: t.paire || '',
    dir: t.dir || '',
    rrCible: t.rrCible || 0,
    rrPris: t.rrPris || 0,
    res: t.res || 0,
    mgmt: t.mgmt || '',
    reprend: t.reprend || '',
    notes: t.notes || '',
    stars: t.stars || 0,
    tf: t.tf || '',
    conf: t.conf || '',
    backtest: !!t.backtest,
    customFields: fcCollectCustomFields(t),
    images: Array.isArray(t.images) ? t.images.slice(0, 6) : []
  };
  fcSendMessage({msg_type: 'trade', trade_data: payload});
  fcCloseTradePicker();
}

// ══ Messages vocaux (rester appuyé sur le micro, glisser à gauche pour annuler) ══
const FC_WAVE_BAR_COUNT = 27;
const FC_CANCEL_THRESHOLD = -70; // px de glissement à gauche pour armer l'annulation
const FC_CANCEL_MAX = -95; // butée du glissement

let fcMediaRecorder = null;
let fcRecordedChunks = [];
let fcRecordStart = 0;
let fcRecordTimerHandle = null;
let fcRecordStream = null;
let fcAudioCtx = null;
let fcAnalyser = null;
let fcAnalyserData = null;
let fcWaveIntervalHandle = null;
let fcWaveSamples = new Array(FC_WAVE_BAR_COUNT).fill(0);
let fcDragStartX = 0;
let fcDragArmed = false;

function fcInitWaveBars() {
  const wave = document.getElementById('fcRecWave');
  if (!wave) return;
  wave.innerHTML = '';
  fcWaveSamples = new Array(FC_WAVE_BAR_COUNT).fill(0);
  for (let i = 0; i < FC_WAVE_BAR_COUNT; i++) {
    const bar = document.createElement('div');
    bar.className = 'fc-wave-bar';
    wave.appendChild(bar);
  }
}
function fcSampleAndRenderWave() {
  if (!fcAnalyser || !fcAnalyserData) return;
  fcAnalyser.getByteTimeDomainData(fcAnalyserData);
  let maxDev = 0;
  for (let i = 0; i < fcAnalyserData.length; i++) {
    const dev = Math.abs(fcAnalyserData[i] - 128);
    if (dev > maxDev) maxDev = dev;
  }
  const vol = Math.min(1, maxDev / 100);
  fcWaveSamples.shift();
  fcWaveSamples.push(vol);
  const wave = document.getElementById('fcRecWave');
  if (!wave) return;
  const bars = wave.children;
  for (let i = 0; i < bars.length; i++) {
    bars[i].style.height = (15 + fcWaveSamples[i] * 85) + '%';
  }
}

async function fcStartRecording() {
  if (fcMediaRecorder || !fcActiveFriendId) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (typeof showSync === 'function') showSync('⚠ Micro non supporté', '#ef4444');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    fcRecordStream = stream;
    const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    const mime = mimeCandidates.find(
      m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)
    );
    fcMediaRecorder = mime ? new MediaRecorder(stream, {mimeType: mime}) : new MediaRecorder(stream);
    fcRecordedChunks = [];
    fcMediaRecorder.ondataavailable = e => {
      if (e.data && e.data.size) fcRecordedChunks.push(e.data);
    };
    fcMediaRecorder.start();
    fcRecordStart = Date.now();
    fcShowRecordingUI(true);
    fcRecordTimerHandle = setInterval(fcUpdateRecTimer, 200);
    try {
      fcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (fcAudioCtx.state === 'suspended') fcAudioCtx.resume().catch(() => {});
      const source = fcAudioCtx.createMediaStreamSource(stream);
      fcAnalyser = fcAudioCtx.createAnalyser();
      fcAnalyser.fftSize = 64;
      fcAnalyserData = new Uint8Array(fcAnalyser.fftSize);
      source.connect(fcAnalyser);
      fcInitWaveBars();
      fcWaveIntervalHandle = setInterval(fcSampleAndRenderWave, 90);
    } catch (e) {
      fcAnalyser = null; // pas grave : l'enregistrement marche même sans le rendu visuel
    }
  } catch (e) {
    console.warn('getUserMedia error:', e && e.name, e && e.message);
    let msg = '⚠ Micro inaccessible';
    if (e && e.name === 'NotAllowedError') msg = '⚠ Autorise le micro dans les réglages du site';
    else if (e && e.name === 'NotFoundError') msg = '⚠ Aucun micro détecté sur cet appareil';
    else if (e && e.name === 'NotReadableError') msg = '⚠ Micro déjà utilisé par une autre appli';
    else if (e && e.name === 'SecurityError') msg = '⚠ Connexion non sécurisée (HTTPS requis)';
    if (typeof showSync === 'function') showSync(msg, '#ef4444');
  }
}
function fcUpdateRecTimer() {
  const el = document.getElementById('fcRecTimer');
  if (el) el.textContent = fcFmtDuration((Date.now() - fcRecordStart) / 1000);
}
function fcShowRecordingUI(on) {
  const indicator = document.getElementById('fcRecIndicator');
  const input = document.getElementById('fcTextInput');
  const zone = document.getElementById('fcRecCancelZone');
  const attachBtn = document.getElementById('fcAttachBtn');
  const desktopCancelBtn = document.getElementById('fcDesktopCancelBtn');
  const micBtn = document.getElementById('fcMicBtn');
  const mobile = typeof isMobileView === 'function' ? isMobileView() : window.innerWidth <= 1100;
  if (indicator) indicator.style.display = on ? 'flex' : 'none';
  if (input) input.style.display = on ? 'none' : 'block';
  if (attachBtn) attachBtn.style.display = on ? 'none' : 'flex';
  if (zone) zone.style.display = on && mobile ? 'flex' : 'none';
  if (desktopCancelBtn) desktopCancelBtn.style.display = on && !mobile ? 'flex' : 'none';
  if (micBtn) {
    if (on && !mobile) {
      micBtn.dataset.mode = 'recording-send';
      micBtn.innerHTML = '<span class="deco-emoji">➤</span><span class="deco-emoji-alt">→</span>';
    } else if (!on) {
      fcUpdateMicSendBtn();
    }
  }
}
function fcStopRecording(shouldSend) {
  if (!fcMediaRecorder) return;
  clearInterval(fcRecordTimerHandle);
  clearInterval(fcWaveIntervalHandle);
  if (fcAudioCtx) {
    try {
      fcAudioCtx.close();
    } catch (e) {}
    fcAudioCtx = null;
  }
  fcAnalyser = null;
  fcAnalyserData = null;
  const recorder = fcMediaRecorder;
  const stream = fcRecordStream;
  const startedAt = fcRecordStart;
  fcMediaRecorder = null;
  fcRecordStream = null;
  fcShowRecordingUI(false);
  try {
    recorder.onstop = async () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const duration = (Date.now() - startedAt) / 1000;
      if (!shouldSend || duration < 0.6 || !fcRecordedChunks.length) {
        fcRecordedChunks = [];
        return;
      }
      const blob = new Blob(fcRecordedChunks, {type: recorder.mimeType || 'audio/webm'});
      fcRecordedChunks = [];
      await fcUploadAndSendAudio(blob, duration);
    };
    recorder.stop();
  } catch (e) {
    console.warn('fcStopRecording:', e);
  }
}

// ── Téléphone : glisser le micro vers la gauche pour annuler (comme WhatsApp mobile) ──
function fcOnMicPointerDown(e) {
  const micBtn = document.getElementById('fcMicBtn');
  if (!micBtn || !isMobileView() || micBtn.dataset.mode !== 'mic') return;
  e.preventDefault();
  fcDragStartX = e.clientX;
  fcDragArmed = false;
  try {
    micBtn.setPointerCapture(e.pointerId);
  } catch (err) {}
  micBtn.style.transition = 'none';
  fcStartRecording();
}
function fcOnMicPointerMove(e) {
  if (!isMobileView() || !fcMediaRecorder) return;
  const micBtn = document.getElementById('fcMicBtn');
  const zone = document.getElementById('fcRecCancelZone');
  if (!micBtn) return;
  let dx = Math.min(0, e.clientX - fcDragStartX);
  dx = Math.max(dx, FC_CANCEL_MAX);
  micBtn.style.transform = 'translateX(' + dx + 'px)';
  const armed = dx <= FC_CANCEL_THRESHOLD;
  if (armed !== fcDragArmed) {
    fcDragArmed = armed;
    if (zone) zone.classList.toggle('armed', armed);
    micBtn.classList.toggle('cancel-armed', armed);
  }
}
function fcOnMicPointerUp() {
  if (!isMobileView()) return;
  const micBtn = document.getElementById('fcMicBtn');
  if (micBtn) {
    micBtn.style.transition = '';
    micBtn.style.transform = '';
    micBtn.classList.remove('cancel-armed');
  }
  const zone = document.getElementById('fcRecCancelZone');
  if (zone) zone.classList.remove('armed');
  if (micBtn && micBtn.dataset.mode === 'mic' && fcMediaRecorder) {
    fcStopRecording(!fcDragArmed);
  }
  fcDragArmed = false;
}
// ── PC : clic pour démarrer, clic sur ➤ pour envoyer, clic sur 🗑 pour annuler ──
function fcOnMicClick() {
  const micBtn = document.getElementById('fcMicBtn');
  if (!micBtn) return;
  const mode = micBtn.dataset.mode;
  if (mode === 'send') {
    fcSendTextMessage();
  } else if (mode === 'recording-send') {
    fcStopRecording(true);
  } else if (mode === 'mic' && !isMobileView()) {
    fcStartRecording();
  }
}
async function fcUploadAndSendAudio(blob, duration) {
  if (!currentUser || !fcActiveFriendId || typeof sb === 'undefined') return;
  try {
    const ext = (blob.type || '').includes('mp4') ? 'm4a' : 'webm';
    const fileName = `${currentUser.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const {error} = await sb.storage
      .from(FC_AUDIO_BUCKET)
      .upload(fileName, blob, {contentType: blob.type || 'audio/webm', upsert: false});
    if (error) {
      if (fcIsMissingTableError(error)) fcShowSetupNotice();
      else if (typeof showSync === 'function') showSync('⚠ Envoi du vocal échoué', '#ef4444');
      return;
    }
    const {data: urlData} = sb.storage.from(FC_AUDIO_BUCKET).getPublicUrl(fileName);
    await fcSendMessage({
      msg_type: 'audio',
      audio_url: urlData && urlData.publicUrl,
      audio_duration: duration
    });
  } catch (e) {
    console.warn('fcUploadAndSendAudio:', e);
    if (typeof showSync === 'function') showSync('⚠ Réseau', '#f59e0b');
  }
}

// ══ Barre de saisie : bascule micro / envoyer ══
function fcUpdateMicSendBtn() {
  const input = document.getElementById('fcTextInput');
  const btn = document.getElementById('fcMicBtn');
  if (!input || !btn) return;
  const hasText = input.value.trim().length > 0;
  btn.dataset.mode = hasText ? 'send' : 'mic';
  btn.innerHTML = hasText
    ? '<span class="deco-emoji">➤</span><span class="deco-emoji-alt">→</span>'
    : '<span class="deco-emoji">🎤</span><span class="deco-emoji-alt">●</span>';
}
function fcBindInputBarEvents() {
  const input = document.getElementById('fcTextInput');
  const micBtn = document.getElementById('fcMicBtn');
  const attachBtn = document.getElementById('fcAttachBtn');
  const desktopCancelBtn = document.getElementById('fcDesktopCancelBtn');
  if (input) {
    input.addEventListener('input', () => {
      if (typeof autoGrow === 'function') autoGrow(input);
      fcUpdateMicSendBtn();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        fcSendTextMessage();
      }
    });
  }
  if (attachBtn) attachBtn.addEventListener('click', fcOpenTradePicker);
  if (desktopCancelBtn) desktopCancelBtn.addEventListener('click', () => fcStopRecording(false));
  if (micBtn) {
    micBtn.addEventListener('click', fcOnMicClick);
    micBtn.addEventListener('pointerdown', fcOnMicPointerDown);
    micBtn.addEventListener('pointermove', fcOnMicPointerMove);
    ['pointerup', 'pointercancel'].forEach(evt => micBtn.addEventListener(evt, fcOnMicPointerUp));
  }
  fcUpdateMicSendBtn();
}

// ══ Temps réel ══
function fcStartRealtime() {
  if (!currentUser || fcChannel || typeof sb === 'undefined') return;
  const me = currentUser.id;
  fcChannel = sb
    .channel('tjp_chat_' + me)
    .on(
      'postgres_changes',
      {event: 'INSERT', schema: 'public', table: FC_MESSAGES_TABLE, filter: 'receiver_id=eq.' + me},
      payload => fcHandleIncomingMessage(payload.new)
    )
    .on(
      'postgres_changes',
      {event: 'INSERT', schema: 'public', table: FC_MESSAGES_TABLE, filter: 'sender_id=eq.' + me},
      payload => fcHandleIncomingMessage(payload.new)
    )
    .on(
      'postgres_changes',
      {event: 'INSERT', schema: 'public', table: FC_CONTACTS_TABLE, filter: 'contact_user_id=eq.' + me},
      () => fcLoadContacts()
    )
    .on(
      'postgres_changes',
      {event: 'INSERT', schema: 'public', table: FC_CONTACTS_TABLE, filter: 'user_id=eq.' + me},
      () => fcLoadContacts()
    )
    .subscribe();
}
function fcStopRealtime() {
  if (fcChannel && typeof sb !== 'undefined') {
    sb.removeChannel(fcChannel);
    fcChannel = null;
  }
}
function fcHandleIncomingMessage(m) {
  if (!m || !currentUser) return;
  const me = currentUser.id;
  const other = m.sender_id === me ? m.receiver_id : m.sender_id;
  if (fcActiveFriendId === other && !fcMessages.some(x => x.id === m.id)) {
    fcMessages.push(m);
    fcRenderMessages();
  }
  fcActivityMap[other] = m.created_at;
  if (fcContacts.some(c => c.friendId === other)) fcRefreshActivityOrder();
  else fcLoadContacts();
}

// ══ Initialisation / nettoyage ══
function fcInit() {
  if (!currentUser || fcInitDone) return;
  fcInitDone = true;
  fcInjectStyles();
  fcInjectMarkup();
  fcInjectModals();
  fcPublishProfile();
  fcLoadContacts();
  fcStartRealtime();
}
function fcReset() {
  fcInitDone = false;
  fcStopRealtime();
  fcContacts = [];
  fcMessages = [];
  fcActiveFriendId = null;
  fcActivityMap = {};
  fcSetupNoticeShown = false;
  const wrap = document.getElementById('fcWrap');
  if (wrap) wrap.remove();
  ['fcAddModal', 'fcTradeModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
}

// ══ Surcharges (wrapping) — n'édite aucune fonction existante ══
if (typeof window.afterPinValidated === 'function') {
  const _fcOrigAfterPinValidated = window.afterPinValidated;
  window.afterPinValidated = async function () {
    const r = await _fcOrigAfterPinValidated.apply(this, arguments);
    try {
      fcInit();
    } catch (e) {
      console.warn('fcInit:', e);
    }
    return r;
  };
}
if (typeof window.saveProfile === 'function') {
  const _fcOrigSaveProfile = window.saveProfile;
  window.saveProfile = function () {
    const r = _fcOrigSaveProfile.apply(this, arguments);
    try {
      fcPublishProfile();
      fcRenderContactList();
    } catch (e) {}
    return r;
  };
}
if (typeof window._doResetPin === 'function') {
  const _fcOrigDoResetPin = window._doResetPin;
  window._doResetPin = async function () {
    try {
      fcReset();
    } catch (e) {}
    return _fcOrigDoResetPin.apply(this, arguments);
  };
}
