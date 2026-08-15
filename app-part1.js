// ══ CAPTURE DU HASH OAUTH AVANT QUE SUPABASE NE LE CONSOMME ══
window._oauthHash = window.location.hash || '';

// ══ SUPABASE CONFIG — client unique, gestion manuelle de la session ══
window.SUPABASE_URL = 'https://ghjashqgwlaofjubzrcp.supabase.co';
window.SUPABASE_KEY = 'sb_publishable_v_Uc1c_TsGyA7ieZPfaGnw_Ajknc7af';
window.sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    // Empêche le navigateur de servir une réponse mise en cache pour une lecture
    // (select) identique à une précédente — sinon une synchro peut "voir" une
    // vieille version (ex: 0 trades) au lieu de l'état réel actuel du cloud.
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
  }
});
function getSb() { return window.sb; }

// ══ GOOGLE LOGIN ══
async function signInWithGoogle() {
  const btn = document.getElementById('googleLoginBtn');
  const err = document.getElementById('googleErr');
  err.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Ouverture de Google...';

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://plutonicame.github.io/tjpro/',
      queryParams: { prompt: 'select_account' }
    }
  });

  if (error) {
    btn.disabled = false;
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Continuer avec Google';
    err.textContent = error.message;
    err.style.display = 'block';
  }
  // Si pas d'erreur, le navigateur redirige vers Google — la page se recharge ensuite
}

// ══ DATA GEN ══
const TFC=["M1","M5","M15","M30","H1","H4","Daily","Weekly","M1,M5","M5,M15","M15,H1","M30,H4","H1,H4","H4,Daily","Daily,Weekly","M1,M5,M15","M5,M15,H1","M15,H1,H4","H1,H4,Daily","H4,Daily,Weekly","M1,M15,H1","M5,H1,Daily","M30,H1,H4","M15,H4,Daily","H1,Daily,Weekly"];
const PRS=["EURUSD","GBPUSD","USDJPY","XAUUSD","NAS100","DAX40","SPX500","GBPJPY","AUDUSD"];
const SSG=["Londres","New York","Asie","Chevauchement LN","Pre-Marche"];
const CNF=["FVG","OB","BOS","CHOCH","Chandelier Japonais","EMA Cross","Support/Résistance","Liquidité","VWAP","SMT","Divergence RSI","Golden Zone Fib"];
function rn(a){return a[Math.floor(Math.random()*a.length)];}
function rf(a,b,d=1){return parseFloat((Math.random()*(b-a)+a).toFixed(d));}
function gen2025(){
  const out=[];let id=2000,ti=0;
  const s=new Date('2025-01-01'),e=new Date('2025-05-21');
  const hM=["08:00","08:30","09:00","09:15","09:30","10:00","10:30"],hA=["13:00","13:30","14:00","14:30","15:00","15:30","16:00"];
  for(let d=new Date(s);d<=e;d.setDate(d.getDate()+1)){
    const ds=d.toISOString().split('T')[0];
    [hM,hA].forEach(pool=>{
      const tf=TFC[ti++%TFC.length],win=Math.random()>.43;
      const res=win?Math.round(rf(25,900)):Math.round(rf(-300,-15));
      const nc=Math.floor(Math.random()*3)+1,p=[...CNF],confs=[];
      for(let i=0;i<nc&&p.length;i++){const x=Math.floor(Math.random()*p.length);confs.push(p.splice(x,1)[0]);}
      out.push({id:id++,date:ds,heure:rn(pool),paire:rn(PRS),session:rn(SSG),conf:confs.join(','),tf,dir:Math.random()>.5?'LONG':'SHORT',rrCible:rf(1.5,3.5),res,mgmt:Math.random()>.4?'Oui':'Non',reprend:rn(['Oui','Non','Peut-être']),notes:''});
    });
  }
  return out;
}
const BASE=[
  {id:1,date:"2023-05-22",heure:"14:24",paire:"USDJPY",session:"Chevauchement LN",conf:"BOS,FVG",tf:"M5",dir:"LONG",rrCible:3.4,res:126,mgmt:"Oui",reprend:"Peut-être",notes:""},
  {id:2,date:"2023-05-22",heure:"16:39",paire:"EURUSD",session:"Pre-Marche",conf:"OB,CHOCH",tf:"M15,Daily,H4",dir:"LONG",rrCible:3.4,res:226,mgmt:"Non",reprend:"Oui",notes:""},
  {id:10,date:"2023-07-10",heure:"09:26",paire:"USDJPY",session:"Londres",conf:"EMA Cross",tf:"H4,M15",dir:"LONG",rrCible:2.9,res:341,mgmt:"Non",reprend:"Oui",notes:""},
  {id:11,date:"2023-07-10",heure:"15:53",paire:"DAX40",session:"Chevauchement LN",conf:"FVG",tf:"H1,H4",dir:"LONG",rrCible:1.9,res:-207,mgmt:"Oui",reprend:"Peut-être",notes:""},
  {id:20,date:"2023-10-15",heure:"14:14",paire:"GBPUSD",session:"New York",conf:"OB,Liquidité",tf:"M5,H1",dir:"SHORT",rrCible:2.4,res:250,mgmt:"Oui",reprend:"Peut-être",notes:""},
  {id:30,date:"2024-01-20",heure:"08:59",paire:"EURUSD",session:"Pre-Marche",conf:"FVG,OB,BOS",tf:"M5,H4",dir:"LONG",rrCible:3.3,res:437,mgmt:"Oui",reprend:"Oui",notes:""},
  {id:40,date:"2024-04-08",heure:"09:26",paire:"USDJPY",session:"Londres",conf:"OB",tf:"H4,M15",dir:"LONG",rrCible:2.9,res:340,mgmt:"Non",reprend:"Oui",notes:""},
  {id:50,date:"2024-07-22",heure:"14:14",paire:"GBPUSD",session:"New York",conf:"BOS,FVG",tf:"M5,H1",dir:"SHORT",rrCible:2.4,res:220,mgmt:"Oui",reprend:"Peut-être",notes:""},
  {id:60,date:"2024-10-14",heure:"09:36",paire:"GBPJPY",session:"Londres",conf:"FVG,OB,BOS",tf:"M15,H4,Daily",dir:"LONG",rrCible:2.0,res:510,mgmt:"Non",reprend:"Non",notes:""},
  {id:70,date:"2024-12-03",heure:"08:27",paire:"DAX40",session:"Londres",conf:"EMA Cross",tf:"H1,M15,Daily",dir:"LONG",rrCible:3.0,res:280,mgmt:"Oui",reprend:"Oui",notes:""},
];
const ALL_S=[...BASE,...gen2025()];

// ══ STATE ══
const DEF={paires:["EURUSD","GBPUSD","USDJPY","XAUUSD","XAGUSD","NAS100","SPX500","DAX40","DOW30","AUDUSD","USDCAD","EURGBP","GBPJPY","BTC/USD","ETH/USD"],sessions:["Londres","New York","Asie","Chevauchement LN","Pre-Marche"],confluences:["FVG","OB","BOS","CHOCH","Chandelier Japonais","EMA Cross","Support/Résistance","Liquidité","VWAP","SMT","Divergence RSI","Golden Zone Fib"],timeframes:["M1","M5","M15","M30","H1","H4","Daily","Weekly"],mgmt_opts:["Oui","Non"],reprend_opts:["Oui","Non","Peut-être"]};
// ══════════════════════════════════════════════════════
// SYSTÈME MULTI-COMPTES
// ══════════════════════════════════════════════════════
// Chaque compte secondaire a un id unique (acc_1, acc_2...).
// Toutes les clés localStorage sont préfixées par l'accountId actif.
// Le compte principal Google est le conteneur de tous les comptes.

const ACCOUNTS_KEY = 'tjp_accounts';     // liste des comptes [{id,name,pinHash}]
const ACTIVE_ACC_KEY = 'tjp_active_acc'; // id du compte actif

function getAccounts(){
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||'[]'); } catch(e){ return []; }
}
function saveAccounts(accs){ localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs)); }
function getActiveAccId(){
  const id = localStorage.getItem(ACTIVE_ACC_KEY);
  const accs = getAccounts();
  if(id && accs.find(a=>a.id===id)) return id;
  if(accs.length) return accs[0].id;
  return 'acc_1';
}
function setActiveAccId(id){ localStorage.setItem(ACTIVE_ACC_KEY, id); }

// Clé préfixée selon le compte actif (transparente pour le reste du code)
let _currentAccId = null; // sera initialisé après connexion Google
function accKey(k){ return _currentAccId ? `${k}__${_currentAccId}` : k; }

// Initialise les comptes si aucun n'existe encore (migration depuis version sans comptes)
function initAccountsIfNeeded(){
  let accs = getAccounts();
  if(!accs.length){
    const firstAcc = {id:'acc_1', name:'Compte 1', pinHash: null, createdAt: Date.now()};
    accs = [firstAcc];
    saveAccounts(accs);
    setActiveAccId('acc_1');
    // Migration : les données existantes sans préfixe appartiennent au compte 1
    // On les copie avec le bon préfixe pour cohérence
    const keys = ['tj_trades','tj_lists','tj_nextId','tj_capital','tj_risk','tj_smart_risk',
      'tj_risk_max','tj_risk_decimal','tj_pencil_edits','tj_payouts',
      'tjp_ia_config','tjp_recap_history','tj_rm_up_trigger','tj_rm_up_trades','tj_rm_up_pct',
      'tj_rm_up_var_type','tj_rm_up_var_val','tj_rm_down_trigger','tj_rm_down_trades',
      'tj_rm_down_pct','tj_rm_down_var_type','tj_rm_down_var_val'];
    keys.forEach(k=>{
      const v = localStorage.getItem(k);
      if(v !== null) localStorage.setItem(`${k}__acc_1`, v);
    });
  }
  _currentAccId = getActiveAccId();
}

// Valeurs par défaut pour un nouveau compte
function defaultAccSettings(sourceAccId){
  // Hérite les listes du compte source (le thème, lui, est global — voir plus bas)
  const srcKey = k => sourceAccId ? `${k}__${sourceAccId}` : k;
  return {
    trades: [],
    nextId: 9000,
    capital: '1000',
    risk: '1',
    smart_risk: 'true',
    risk_decimal: 'false',
    risk_max: '5',
    payouts: '[]',
    lists: localStorage.getItem(srcKey('tj_lists')) || null,
    pencil_edits: null,
    rm_up_trigger: '"trades"',
    rm_up_trades: '3',
    rm_up_pct: '5',
    rm_up_var_type: '"pct"',
    rm_up_var_val: '1',
    rm_down_trigger: '"pct"',
    rm_down_trades: '3',
    rm_down_pct: '5',
    rm_down_var_type: '"pct"',
    rm_down_var_val: '0.5',
  };
}

function createAccount(sourcAccId){
  const accs = getAccounts();
  const newId = 'acc_'+(Date.now());
  const newName = 'Compte '+(accs.length+1);
  const newAcc = {id:newId, name:newName, pinHash:null, createdAt:Date.now()};
  accs.push(newAcc);
  saveAccounts(accs);
  // Initialiser localStorage du nouveau compte avec valeurs par défaut
  const defs = defaultAccSettings(sourcAccId);
  const k = key => `${key}__${newId}`;
  localStorage.setItem(k('tj_trades'), JSON.stringify(defs.trades));
  localStorage.setItem(k('tj_nextId'), JSON.stringify(defs.nextId));
  localStorage.setItem(k('tj_capital'), defs.capital);
  localStorage.setItem(k('tj_risk'), defs.risk);
  localStorage.setItem(k('tj_smart_risk'), defs.smart_risk);
  localStorage.setItem(k('tj_risk_decimal'), defs.risk_decimal);
  localStorage.setItem(k('tj_risk_max'), defs.risk_max);
  localStorage.setItem(k('tj_payouts'), defs.payouts);
  if(defs.lists) localStorage.setItem(k('tj_lists'), defs.lists);
  localStorage.setItem(k('tj_rm_up_trigger'), defs.rm_up_trigger);
  localStorage.setItem(k('tj_rm_up_trades'), defs.rm_up_trades);
  localStorage.setItem(k('tj_rm_up_pct'), defs.rm_up_pct);
  localStorage.setItem(k('tj_rm_up_var_type'), defs.rm_up_var_type);
  localStorage.setItem(k('tj_rm_up_var_val'), defs.rm_up_var_val);
  localStorage.setItem(k('tj_rm_down_trigger'), defs.rm_down_trigger);
  localStorage.setItem(k('tj_rm_down_trades'), defs.rm_down_trades);
  localStorage.setItem(k('tj_rm_down_pct'), defs.rm_down_pct);
  localStorage.setItem(k('tj_rm_down_var_type'), defs.rm_down_var_type);
  localStorage.setItem(k('tj_rm_down_var_val'), defs.rm_down_var_val);
  return newAcc;
}

function switchAccount(accId, force){
  const accs = getAccounts();
  const acc = accs.find(a=>a.id===accId);
  if(!acc) return;
  // Vérification PIN si défini pour ce compte
  if(acc.pinHash && !force){
    openAccountPinPrompt(accId);
    return;
  }
  _doSwitchAccount(accId);
}

function _doSwitchAccount(accId){
  setActiveAccId(accId);
  _currentAccId = accId;
  // Recharger tout l'état depuis les clés du nouveau compte
  APP.trades = ls(accKey('tj_trades'), []);
  APP.lists = ls(accKey('tj_lists'), DEF);
  APP.nextId = ls(accKey('tj_nextId'), 9000);
  ['confluences','mgmt_opts','reprend_opts'].forEach(k=>{if(!APP.lists[k])APP.lists[k]=DEF[k];});
  // Appliquer le thème du nouveau compte
  loadSavedTheme();
  renderTable(); updateNavBadges(); updateKPIs();
  refreshAllCharts(); renderTop5();
  if(document.getElementById('page-modifs')?.classList.contains('active')) renderModifs();
  closeAccountMenu();
  renderAccountMenu();
}

function getAccCapital(accId){
  const k = key => `${key}__${accId}`;
  const trades = JSON.parse(localStorage.getItem(k('tj_trades'))||'[]').filter(t=>!t.backtest);
  const capital = parseFloat(localStorage.getItem(k('tj_capital'))||'1000');
  const payouts = JSON.parse(localStorage.getItem(k('tj_payouts'))||'[]').reduce((s,p)=>s+(p.amount||0),0);
  return trades.reduce((s,t)=>s+(t.res||0), capital) - payouts;
}

function renameAccount(accId, newName){
  const accs = getAccounts();
  const acc = accs.find(a=>a.id===accId);
  if(acc){ acc.name = newName; saveAccounts(accs); renderAccountMenu(); }
}

// ── Variables CSS du menu comptes ──
// --acc-menu-bg, --acc-menu-bd, --acc-menu-tx, --acc-menu-tx2
// --acc-item-bg-N, --acc-item-bd-N (N = index 1,2,3...)

function ls(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lss(k,v){
  try {
    localStorage.setItem(k,JSON.stringify(v));
  } catch(e) {
    console.error('Erreur localStorage:', e);
    if(typeof pcShowSyncFailureWarning==='function')pcShowSyncFailureWarning('Stockage local plein.');
  }
}
function lsAcc(k,d){return ls(accKey(k),d);}
function lssAcc(k,v){lss(accKey(k),v);}
function loadState(){return{trades:lsAcc('tj_trades',ALL_S),lists:lsAcc('tj_lists',DEF),nextId:lsAcc('tj_nextId',9000)};}
function saveState(){
  // Garde-fou générique : quelle que soit la cause (bug, course entre sync, etc.),
  // on ne persiste JAMAIS silencieusement un passage de plusieurs trades à 0.
  // Ça bloque le symptôme à la racine, peu importe d'où vient exactement le bug,
  // et ça log la pile d'appel pour identifier précisément le coupable.
  try {
    const prevTrades = lsAcc('tj_trades', null);
    const prevCount = Array.isArray(prevTrades) ? prevTrades.length : 0;
    const nextCount = Array.isArray(APP.trades) ? APP.trades.length : 0;
    if (prevCount > 0 && nextCount === 0 && !window._intentionalBulkDelete && !window._allowEmptySave) {
      console.error('🛑 saveState() BLOQUÉ : tentative de passer de '+prevCount+' à 0 trade(s) sans suppression volontaire. Pile d\'appel :');
      console.trace();
      APP.trades = prevTrades; // on restaure la version connue plutôt que de perdre la donnée
      showSync('⚠ Sauvegarde bloquée (anti-perte) — ouvre la console (F12) et envoie la trace', '#ef4444');
      renderTable();
      return;
    }
  } catch(e) { console.warn('Vérif anti-perte saveState() a échoué (ignorée) :', e); }
  lssAcc('tj_trades',APP.trades);
  lssAcc('tj_lists',APP.lists);
  lssAcc('tj_nextId',APP.nextId);
  if(typeof currentUser !== 'undefined' && currentUser && typeof _isSyncing !== 'undefined' && !_isSyncing && window._userActionHappened) {
    clearTimeout(window._pushTimer);
    schedulePush(300);
  }
}
function markUserAction(){ window._userActionHappened = true; }
// Initialiser le système multi-comptes AVANT de charger l'état
// (accKey() dépend de _currentAccId qui est défini dans initAccountsIfNeeded)
initAccountsIfNeeded();
const APP=loadState();
// Trades réels uniquement (hors backtest) — utilisé pour tous les calculs financiers :
// P&L, capital, risk intelligent, séries de gains/pertes, calendrier.
// Les backtests restent dans APP.trades pour l'analyse stratégique (confluences, TF, etc.)
const realTrades=()=>APP.trades.filter(t=>!t.backtest);
['confluences','mgmt_opts','reprend_opts'].forEach(k=>{if(!APP.lists[k])APP.lists[k]=DEF[k];});
const CAPITAL=()=>parseFloat(lsAcc('tj_capital','10000'));
const RBASE=()=>parseFloat(lsAcc('tj_risk','1'));
const RDEC=()=>lsAcc('tj_risk_decimal',false);
const SMART=()=>lsAcc('tj_smart_risk',true);
const RMAX=()=>parseFloat(lsAcc('tj_risk_max','10'));

// ══ CONFIG RISK MANAGEMENT PERSONNALISABLE ══
const RM_UP_TRIGGER=()=>lsAcc('tj_rm_up_trigger','trades');
const RM_UP_TRADES=()=>parseFloat(lsAcc('tj_rm_up_trades','3'));
const RM_UP_PCT=()=>parseFloat(lsAcc('tj_rm_up_pct','5'));
const RM_UP_VAR_TYPE=()=>lsAcc('tj_rm_up_var_type','pct');
const RM_UP_VAR_VAL=()=>parseFloat(lsAcc('tj_rm_up_var_val','0.5'));

// Descente
const RM_DOWN_TRIGGER=()=>lsAcc('tj_rm_down_trigger','pct');
const RM_DOWN_TRADES=()=>parseFloat(lsAcc('tj_rm_down_trades','3'));
const RM_DOWN_PCT=()=>parseFloat(lsAcc('tj_rm_down_pct','5'));
const RM_DOWN_VAR_TYPE=()=>lsAcc('tj_rm_down_var_type','pct');
const RM_DOWN_VAR_VAL=()=>parseFloat(lsAcc('tj_rm_down_var_val','0.5'));

// ══ CLOCKS ══
// ══ MENU MULTI-COMPTES ══
function toggleAccountMenu(e){
  e.stopPropagation();
  const menu=document.getElementById('accMenu');
  if(!menu)return;
  const isOpen=menu.classList.contains('open');
  closeAccountMenu();
  if(!isOpen){renderAccountMenu();menu.classList.add('open');}
}
function closeAccountMenu(){
  const menu=document.getElementById('accMenu');
  if(menu)menu.classList.remove('open');
}
document.addEventListener('click',()=>closeAccountMenu());

function renderAccountMenu(){
  const menu=document.getElementById('accMenu');
  if(!menu)return;
  const accs=getAccounts();
  const activeId=_currentAccId;
  let html='';
  accs.forEach((acc,i)=>{
    const cap=getAccCapital(acc.id);
    const capStr=(cap>=0?'+':'')+cap.toLocaleString('fr-FR',{maximumFractionDigits:0})+'€';
    const isActive=acc.id===activeId;
    const bgVar=`var(--acc-item-bg-${i+1},transparent)`;
    const bdVar=`var(--acc-item-bd-${i+1},transparent)`;
    html+=`<div class="acc-item${isActive?' active-acc':''}" style="background:${bgVar};border-left:3px solid ${bdVar};" onclick="switchAccount('${acc.id}')">
      <div class="acc-item-info">
        <div class="acc-item-name">${escapeHtml(acc.name)}${isActive?' ✓':''}</div>
        <div class="acc-item-cap">${capStr}</div>
      </div>
      <div class="acc-item-dots" onclick="event.stopPropagation();openAccOptions('${acc.id}')">⋮</div>
    </div>`;
  });
  html+=`<button class="acc-add-btn" onclick="event.stopPropagation();addNewAccount()">＋ Ajouter un compte</button>`;
  menu.innerHTML=html;
}

function openAccOptions(accId){
  // Fermer tout menu contextuel existant
  const existing = document.getElementById('accOptionsMenu');
  if(existing) existing.remove();
  if(existing && existing.dataset.forAcc === accId) return; // toggle

  const accs = getAccounts();
  const acc = accs.find(a=>a.id===accId);
  if(!acc) return;

  const menu = document.createElement('div');
  menu.id = 'accOptionsMenu';
  menu.dataset.forAcc = accId;
  menu.style.cssText = 'position:fixed;background:var(--surface);border:1px solid var(--border);border-radius:8px;z-index:4000;min-width:160px;box-shadow:0 4px 16px rgba(0,0,0,.3);';
  menu.innerHTML = `
    <button onclick="startRenameAccount('${accId}')" style="display:block;width:100%;text-align:left;padding:12px 16px;background:none;border:none;color:var(--text);font-family:var(--mono);font-size:12px;cursor:pointer;">✎ Renommer</button>
    ${accs.length>1?`<button onclick="startDeleteAccount('${accId}')" style="display:block;width:100%;text-align:left;padding:12px 16px;background:none;border:none;color:#ef4444;font-family:var(--mono);font-size:12px;cursor:pointer;border-top:1px solid var(--border);">✕ Supprimer</button>`:''}
  `;
  document.body.appendChild(menu);

  // Positionner près du bouton ⋮
  const btn = event.target;
  const rect = btn.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.right = (window.innerWidth - rect.right) + 'px';

  // Fermer en cliquant ailleurs
  setTimeout(() => document.addEventListener('click', function h(){ menu.remove(); document.removeEventListener('click',h); }, {once:true}), 50);
}

function startRenameAccount(accId){
  const existing = document.getElementById('accOptionsMenu');
  if(existing) existing.remove();
  const accs = getAccounts();
  const acc = accs.find(a=>a.id===accId);
  if(!acc) return;
  // Mini modal de renommage inline
  showConfirm('Renommer le compte', `Nouveau nom pour "${acc.name}" :`, ()=>{
    const inp = document.getElementById('renameAccInput');
    const val = inp ? inp.value.trim() : '';
    if(val) renameAccount(accId, val);
  });
  // Injecter un input dans la modale de confirmation
  const msg = document.getElementById('confirmMsg');
  if(msg) msg.innerHTML = `Nouveau nom pour "<strong>${escapeHtml(acc.name)}</strong>" :<br><input id="renameAccInput" type="text" value="${escapeHtml(acc.name)}" style="margin-top:8px;width:100%;font-size:14px;" maxlength="30">`;
}

function startDeleteAccount(accId){
  const existing = document.getElementById('accOptionsMenu');
  if(existing) existing.remove();
  const accs = getAccounts();
  const acc = accs.find(a=>a.id===accId);
  if(!acc || accs.length<=1) return;
  // Demander PIN comme pour "Supprimer tous les trades"
  document.getElementById('deleteAllCount').textContent = `le compte "${acc.name}"`;
  document.getElementById('deleteAllModal').classList.add('open');
  buildPad('deleteAllPad','deleteAllDots',async (val,reset)=>{
    const stored = currentUser ? localStorage.getItem(pinKey(currentUser.id)) : null;
    const attempt = currentUser ? await localPinHash(val, currentUser.id) : null;
    if(!stored||(attempt!==stored && val!==stored)){
      const err=document.getElementById('deleteAllErr');
      err.textContent='Code PIN incorrect.';err.style.display='block';
      reset(true);return;
    }
    closeDeleteAllModal();
    deleteAccount(accId);
  },'deleteAllErr');
}

function deleteAccount(accId){
  let accs = getAccounts();
  if(accs.length<=1){ alert('Impossible de supprimer le dernier compte.'); return; }
  // Nettoyer le localStorage de ce compte
  const keys = ['tj_trades','tj_lists','tj_nextId','tj_capital','tj_risk','tj_smart_risk',
    'tj_risk_max','tj_risk_decimal','tj_payouts','tjp_ia_config','tjp_recap_history',
    'tj_rm_up_trigger','tj_rm_up_trades','tj_rm_up_pct','tj_rm_up_var_type','tj_rm_up_var_val',
    'tj_rm_down_trigger','tj_rm_down_trades','tj_rm_down_pct','tj_rm_down_var_type','tj_rm_down_var_val'];
  keys.forEach(k => localStorage.removeItem(`${k}__${accId}`));
  accs = accs.filter(a=>a.id!==accId);
  saveAccounts(accs);
  // Basculer sur un autre compte si on était sur celui-ci
  if(_currentAccId === accId) _doSwitchAccount(accs[0].id);
  else renderAccountMenu();
}

function addNewAccount(){
  closeAccountMenu();
  const newAcc=createAccount(_currentAccId);
  // Demander un nom personnalisé
  const name=prompt('Nom du nouveau compte :', newAcc.name);
  if(name && name.trim()){
    const accs=getAccounts();
    const a=accs.find(x=>x.id===newAcc.id);
    if(a){a.name=name.trim();saveAccounts(accs);}
  }
  // Basculer sur le nouveau compte
  _doSwitchAccount(newAcc.id);
}

function openAccountPinPrompt(accId){
  // Simple prompt PIN pour le changement de compte protégé
  const entered=prompt('Code PIN requis pour accéder à ce compte :');
  if(!entered)return;
  const accs=getAccounts();
  const acc=accs.find(a=>a.id===accId);
  if(acc && entered===acc.pinHash) _doSwitchAccount(accId);
  else alert('Code PIN incorrect.');
}

function updateAccountMenuInNav(){
  renderAccountMenu();
}

function updateClocks(){
  const n=new Date();
  const f=tz=>n.toLocaleTimeString('fr-FR',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  const ny=f('America/New_York'),ln=f('Europe/London'),tk=f('Asia/Tokyo');
  document.getElementById('clkNY').textContent=ny;
  document.getElementById('clkLN').textContent=ln;
  document.getElementById('clkTK').textContent=tk;
  document.getElementById('clkNY2').textContent=ny;
  document.getElementById('clkLN2').textContent=ln;
  document.getElementById('clkTK2').textContent=tk;
  const h=n.getUTCHours();
  let s='Hors session';
  if(h<7)s='Asie';else if(h<8)s='Pré-Londres';else if(h<12)s='Londres';else if(h<17)s='L/NY';else if(h<22)s='New York';
  document.getElementById('sessionBadge').textContent=s;
  document.getElementById('sessionBadge2').textContent=s;
}
setInterval(updateClocks,1000);updateClocks();

// ══ MOBILE MENU ══
function openMobileMenu(){document.getElementById('mobileMenu').classList.add('open');}
function closeMobileMenu(){document.getElementById('mobileMenu').classList.remove('open');}

// ══ PENCIL ══
let pencilActive=false,pencilColor='#e2e8f0',currentEditEl=null;
// Chaque texte modifiable en mode stylo a désormais SA PROPRE variable de thème
// individuelle (attribut data-tvar posé directement sur l'élément), donc changer
// la couleur d'un titre ne touche plus que lui — que ce soit via le stylo ou via
// l'éditeur de thème complet, les deux lisent/écrivent exactement la même variable.
// Seul le logo TJP (identique en version desktop et mobile) garde une variable
// partagée entre ses deux instances : ce n'est pas un "titre" séparé, c'est le
// même élément affiché deux fois selon la taille d'écran.
const PENCIL_COLOR_VAR_MAP = {
  'nav-logo':'--nav-logo',
};
function pencilVarForEl(el){
  if(!el)return null;
  if(el.dataset && el.dataset.tvar) return el.dataset.tvar;
  if(!el.classList)return null;
  for(const cls of el.classList){ if(PENCIL_COLOR_VAR_MAP[cls]) return PENCIL_COLOR_VAR_MAP[cls]; }
  return null;
}
// Remplit le panneau STYLO avec les réglages RÉELS du texte qu'on vient de sélectionner
// (au lieu de laisser les valeurs du texte précédemment édité).
function pencilSyncPanelToEl(el){
  if(!el)return;
  const cs = getComputedStyle(el);
  const themeVar = pencilVarForEl(el);
  if(themeVar){
    // Piloté par sa propre variable : on lit toujours la couleur RÉELLEMENT
    // calculée par le navigateur, jamais le texte brut de l'attribut style
    // (qui contient "var(--x,...)" et non une couleur directement exploitable).
    pencilColor = rgba2hex(cs.color) || cs.color || '#e2e8f0';
  } else if(el.style.color){
    pencilColor = rgba2hex(el.style.color) || el.style.color;
  } else {
    pencilColor = rgba2hex(cs.color) || cs.color || '#e2e8f0';
  }
  const swatch = document.getElementById('pencilColorSwatch');
  if(swatch) swatch.style.background = pencilColor;
  const fsInput = document.getElementById('pencilFontSize');
  if(fsInput) fsInput.value = parseInt(el.style.fontSize || cs.fontSize, 10) || '';
}
document.getElementById('pencilColorSwatch').style.background=pencilColor;
function getEK(el){if(el.dataset.ek)return el.dataset.ek;const base=el.id?('#'+el.id):(el.tagName+el.className+(el.textContent||'').replace(/\s+/g,' ').trim());return el.dataset.ek=base.substring(0,60);}
function togglePencil(){
  pencilActive=!pencilActive;
  document.body.classList.toggle('pencil-mode',pencilActive);
  document.getElementById('pencilBtn').style.color=pencilActive?'var(--green)':'';
  document.getElementById('pencilToolbar').classList.toggle('show',pencilActive);
  if(!pencilActive){
    const edits=ls('tj_pencil_edits',{});
    document.querySelectorAll('[data-editable]').forEach(el=>{
      el.removeAttribute('contenteditable');
      const k=getEK(el);
      if(el.style.fontSize||el.style.color||el.innerHTML)edits[k]={html:el.innerHTML,fs:el.style.fontSize||'',col:el.style.color||''};
    });
    lss('tj_pencil_edits',edits);
    if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}
  } else setupPencil();
}
function setupPencil(){
  document.querySelectorAll('[data-editable]').forEach(el=>{
    if(!el._ph){
      el._ph=function(e){
        if(!pencilActive)return;
        const isNavSpan=el.closest('.nav-tab');
        if(!isNavSpan){e.stopPropagation();e.preventDefault();}
        if(currentEditEl&&currentEditEl!==el){currentEditEl.removeAttribute('contenteditable');saveOneEdit(currentEditEl);}
        currentEditEl=el;el.setAttribute('contenteditable','true');el.focus();
        pencilSyncPanelToEl(el);
      };
      el.addEventListener('click',el._ph);
      el.addEventListener('touchend',el._ph,{passive:false});
    }
  });
}

// Délégation globale — capture les éléments data-editable même dynamiques
if(!window._pencilDelegateSet){
  window._pencilDelegateSet = true;
  document.addEventListener('click', e=>{
    if(!pencilActive) return;
    const el = e.target.closest('[data-editable]');
    if(!el) return;
    e.stopPropagation(); e.preventDefault();
    if(currentEditEl && currentEditEl!==el){currentEditEl.removeAttribute('contenteditable');saveOneEdit(currentEditEl);}
    currentEditEl=el; el.setAttribute('contenteditable','true'); el.focus();
    pencilSyncPanelToEl(el);
  }, true);
  document.addEventListener('touchend', e=>{
    if(!pencilActive) return;
    const el = e.target.closest('[data-editable]');
    if(!el) return;
    e.stopPropagation(); e.preventDefault();
    if(currentEditEl && currentEditEl!==el){currentEditEl.removeAttribute('contenteditable');saveOneEdit(currentEditEl);}
    currentEditEl=el; el.setAttribute('contenteditable','true'); el.focus();
    pencilSyncPanelToEl(el);
  }, {capture:true, passive:false});
}
function saveOneEdit(el){
  const k=getEK(el);
  const edits=ls('tj_pencil_edits',{});
  const isDynamic=/^disp[0-9]$/.test(el.id||''); // valeurs calculées en direct : ne jamais figer le texte
  edits[k]={html:isDynamic?undefined:el.innerHTML,fs:el.style.fontSize||'',col:el.style.color||''};
  lss('tj_pencil_edits',edits);
  if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}
}
function openCPforPencil(){openCP('Couleur texte',pencilColor,hex=>{pencilColor=hex;document.getElementById('pencilColorSwatch').style.background=hex;});}
function applyPencilStyle(){
  if(!currentEditEl)return;
  const sz=document.getElementById('pencilFontSize').value;
  if(sz){
    currentEditEl.style.setProperty('font-size', sz+'px', 'important');
    currentEditEl.dataset.userFs='1';
  }
  const themeVar = pencilVarForEl(currentEditEl);
  if(themeVar){
    // Ce texte est piloté par sa propre variable de thème individuelle : on modifie
    // CETTE variable, donc l'éditeur de thème et le mode stylo restent strictement
    // synchronisés. On NE touche PAS au style inline de l'élément : il contient la
    // référence var(--xxx,...) qui le lie à sa variable et doit rester intacte —
    // le changement de la variable sur :root se répercute automatiquement dessus.
    document.documentElement.style.setProperty(themeVar, pencilColor);
    teVals[themeVar] = pencilColor;
    lss('tj_theme_vars', teVals);
    if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}
  } else {
    currentEditEl.style.setProperty('color', pencilColor, 'important');
  }
  saveOneEdit(currentEditEl);
}

function applyPencilEdits(){
  const edits=ls('tj_pencil_edits',{});
  document.querySelectorAll('[data-editable]').forEach(el=>{
    const k=getEK(el);
    if(edits[k]){
      if(edits[k].html!==undefined&&edits[k].html!==null)el.innerHTML=edits[k].html;
      if(edits[k].fs){el.style.fontSize=edits[k].fs;el.dataset.userFs='1';}
      if(edits[k].col)el.style.color=edits[k].col;
    }
  });
}

// ══ CONFIRM ══
let confirmCB=null;
function showConfirm(t,m,cb){document.getElementById('confirmTitle').textContent=t;document.getElementById('confirmMsg').textContent=m;confirmCB=cb;document.getElementById('confirmModal').classList.add('open');}
function confirmAccept(){document.getElementById('confirmModal').classList.remove('open');if(confirmCB)confirmCB();confirmCB=null;}
function confirmReject(){document.getElementById('confirmModal').classList.remove('open');confirmCB=null;}

// ══ RISK LOGIC ══
// Convertit une variation de risque (en % ou en €) en delta de pourcentage, selon le capital actuel
function rmVarToPct(varType,varVal,runCap){
  if(varType==='eur'){
    return runCap>0?(varVal/runCap)*100:0;
  }
  return varVal;
}

// Applique une baisse de risque : division par 2 si déjà sous 1%, sinon baisse normale (% ou €)
function applyRiskDecrease(rp,downVarType,downVarVal,runCap){
  if(rp<1){
    return Math.max(0.01,Math.round((rp/2)*100)/100);
  }
  const delta=rmVarToPct(downVarType,downVarVal,runCap);
  return Math.max(0.01,Math.round((rp-delta)*100)/100);
}

function computeRiskHistory(includeBT=false){
  const sorted=[...(includeBT?APP.trades:realTrades())].sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
  const base=RBASE(),smart=SMART();
  let rp=base,ws=0,ls2=0;
  let runCap=CAPITAL();
  let highestEq=runCap;
  let appliedSteps=0; // nombre de paliers de baisse déjà appliqués pour le drawdown en cours
  let upRefCap=runCap; // référence pour mesurer le % de gain (mode 'pct' en montée)
  let upAppliedSteps=0; // nombre de paliers de hausse déjà appliqués depuis upRefCap
  // Vrai compteur de séries de gains/pertes consécutifs (indépendant du risk management ci-dessous)
  let realWS=0,realLS=0,maxRealWS=0,maxRealLS=0;
  const hist=[{date:'Départ',rp:base,ws:0,ls:0,realWs:0,realLs:0}];

  const upTrigger=RM_UP_TRIGGER(),upTrades=RM_UP_TRADES(),upPct=RM_UP_PCT();
  const upVarType=RM_UP_VAR_TYPE(),upVarVal=RM_UP_VAR_VAL();
  const downTrigger=RM_DOWN_TRIGGER(),downTrades=RM_DOWN_TRADES(),downPct=RM_DOWN_PCT();
  const downVarType=RM_DOWN_VAR_TYPE(),downVarVal=RM_DOWN_VAR_VAL();

  sorted.forEach(t=>{
    const res=t.res||0;
    const rpUsed=rp,capUsed=runCap; // risque % et capital RÉELLEMENT actifs quand ce trade a été pris (avant son propre résultat et un éventuel palier déclenché par lui)
    runCap+=res;
    // Vraie série de trades consécutifs gagnants/perdants, sur le résultat réel uniquement
    if(res>0){realWS++;realLS=0;maxRealWS=Math.max(maxRealWS,realWS);}
    else if(res<0){realLS++;realWS=0;maxRealLS=Math.max(maxRealLS,realLS);}
    if(smart){
      if(runCap>highestEq){
        // Nouveau plus haut atteint
        const wasInDrawdown=appliedSteps>0;
        highestEq=runCap;
        appliedSteps=0;
        if(wasInDrawdown){
          // Rattrapage : retour au plus haut après un drawdown → on applique une hausse
          const delta=rmVarToPct(upVarType,upVarVal,runCap);
          rp=Math.min(RMAX(),Math.round((rp+delta)*100)/100);
          ws=0;
          upRefCap=runCap;upAppliedSteps=0;
        } else if(res>0 && upTrigger==='trades'){
          // Gains consécutifs (hors drawdown) → hausse tous les X gains
          ws++;
          if(upTrades>0 && ws%upTrades===0){
            const delta=rmVarToPct(upVarType,upVarVal,runCap);
            rp=Math.min(RMAX(),Math.round((rp+delta)*100)/100);
          }
        }
      } else if(res<0){
        ws=0; // reset streak de gains sur perte
      }

      // Déclencheur montée par % de gain : indépendant des plus hauts, basé sur une référence glissante
      if(upTrigger==='pct' && upPct>0){
        const gainPct=upRefCap>0?((runCap-upRefCap)/upRefCap)*100:0;
        const gainSteps=Math.floor(gainPct/upPct);
        if(gainSteps>upAppliedSteps){
          const newSteps=gainSteps-upAppliedSteps;
          for(let _i=0;_i<newSteps;_i++){
            const delta=rmVarToPct(upVarType,upVarVal,runCap);
            rp=Math.min(RMAX(),Math.round((rp+delta)*100)/100);
          }
          upAppliedSteps=gainSteps;
        }
      }

      // Déclencheur descente
      if(runCap<=highestEq){
        const dd=highestEq>0?((highestEq-runCap)/highestEq)*100:0;
        if(downTrigger==='pct'){
          const stepSize=downPct>0?downPct:5;
          const ddSteps=Math.floor(dd/stepSize);
          if(ddSteps>appliedSteps){
            const newSteps=ddSteps-appliedSteps;
            for(let _i=0;_i<newSteps;_i++){
              rp=applyRiskDecrease(rp,downVarType,downVarVal,runCap);
            }
            appliedSteps=ddSteps;
            ls2++;
            upRefCap=runCap;upAppliedSteps=0; // on repart d'une nouvelle référence de gain après une baisse
          }
        } else if(res<0){
          // Déclencheur par trades perdants consécutifs
          ls2++;
          if(downTrades>0 && ls2%downTrades===0){
            rp=applyRiskDecrease(rp,downVarType,downVarVal,runCap);
          }
        }
      }
    }
    hist.push({date:t.date,heure:t.heure||'',id:t.id,rp,rpUsed,capUsed,ws,ls:ls2,realWs:realWS,realLs:realLS});
  });
  return{hist,finalRp:rp,finalWs:ws,finalLs:ls2,finalRealWs:realWS,finalRealLs:realLS,maxRealWs:maxRealWS,maxRealLs:maxRealLS};
}
let _rrHistCache=null,_rrHistSig=null;
function getRiskHistMap(){
  const sig=[APP.trades.length,CAPITAL(),RBASE(),SMART(),RM_UP_TRIGGER(),RM_UP_TRADES(),RM_UP_PCT(),RM_UP_VAR_TYPE(),RM_UP_VAR_VAL(),RM_DOWN_TRIGGER(),RM_DOWN_TRADES(),RM_DOWN_PCT(),RM_DOWN_VAR_TYPE(),RM_DOWN_VAR_VAL(),RMAX()].join('|');
  if(_rrHistCache && _rrHistSig===sig) return _rrHistCache;
  const map=new Map();
  computeRiskHistory().hist.forEach(h=>{if(h.id!==undefined)map.set(h.id,{rpUsed:h.rpUsed,capUsed:h.capUsed});});
  _rrHistCache=map;_rrHistSig=sig;
  return map;
}
function computeRR(t){
  if(t&&t.rrAuto===false&&typeof t.rrPris==='number'&&t.rrPris!==0){return t.rrPris;}
  let capBase=CAPITAL(),rpBase=RBASE();
  if(t&&!t.backtest&&t.id!==undefined){
    const hInfo=getRiskHistMap().get(t.id);
    if(hInfo){capBase=hInfo.capUsed;rpBase=hInfo.rpUsed;}
  }
  const re=Math.max(1,Math.round(capBase*rpBase/100));
  return parseFloat((t.res/re).toFixed(2));
}
function getCurrentCap(){const totalPayouts=lsAcc('tj_payouts',[]).reduce((s,p)=>s+(p.amount||0),0);return realTrades().reduce((s,t)=>s+(t.res||0),CAPITAL())-totalPayouts;}
function getCurrentRiskPct(){return computeRiskHistory().finalRp;}
function getCurrentRiskEur(){return Math.round(getCurrentCap()*getCurrentRiskPct()/100*100)/100;}
// Formate un pourcentage de risque selon le réglage "Affichage risk : Décimales"
function fmtRiskPct(v){
  return RDEC() ? v.toFixed(2)+'%' : (Math.round(v*100)/100)+'%';
}

// ══ RISK CHART ══
function drawRiskChart(period){
  const tr=btFilter('risk',period);destroy('risk');
  const axC=gc('--risk-axis')||'#f59e0b';
  const grC=gc('--risk-grid')||'rgba(100,116,139,.1)';
  const lineC=gc('--risk-line')||'#f59e0b';
  const baseC=gc('--risk-base')||'rgba(100,116,139,.5)';
  const rmax=RMAX(),base=RBASE(),smart=SMART();
  let rp=base,ws=0,ls2=0;
  let runCap=CAPITAL(),highestEq=CAPITAL(),appliedSteps=0;
  const labels=['Départ'],riskData=[base];
  tr.forEach(t=>{
    const res=t.res||0;runCap+=res;
    if(smart){
      if(runCap>highestEq){
        const wasInDrawdown=appliedSteps>0;
        highestEq=runCap;
        appliedSteps=0;
        if(wasInDrawdown){
          rp=Math.min(rmax,Math.round((rp+0.5)*100)/100);
          ws=0;
        } else if(res>0){ws++;if(ws%3===0)rp=Math.min(rmax,Math.round((rp+0.5)*100)/100);}
      } else {
        const dd=highestEq>0?((highestEq-runCap)/highestEq)*100:0;
        const ddSteps=Math.floor(dd/5);
        if(ddSteps>appliedSteps){
          const newSteps=ddSteps-appliedSteps;
          for(let _i=0;_i<newSteps;_i++)rp=Math.max(0.01,Math.round((rp-0.5)*100)/100);
          appliedSteps=ddSteps;ws=0;ls2++;
        } else if(res<0){ws=0;}
      }
    }
    labels.push(t.date);riskData.push(rp);
  });
  const ctx=document.getElementById('cRisk').getContext('2d');
  const ftop=gc('--risk-fill-top')||'rgba(245,158,11,.25)',fbot=gc('--risk-fill-bot')||'rgba(245,158,11,0)';
  const rg=ctx.createLinearGradient(0,0,0,210);rg.addColorStop(0,ftop);rg.addColorStop(1,fbot);
  CH['risk']=new Chart(ctx,{
    type:'line',
    data:{labels,datasets:[
      {label:'Risk %',data:riskData,borderColor:lineC,backgroundColor:rg,fill:true,tension:0,pointRadius:2,borderWidth:2,stepped:'before'},
      {label:'Base',data:Array(labels.length).fill(base),borderColor:baseC,borderDash:[4,4],pointRadius:0,borderWidth:1,fill:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>` Risk: ${i.raw}%`}}},
      scales:{
        x:{grid:{color:grC},ticks:{color:axC,maxTicksLimit:10,maxRotation:0}},
        y:{grid:{color:grC},ticks:{color:axC,callback:v=>v+'%'},
           suggestedMin:Math.max(0,base-3),suggestedMax:Math.min(RMAX()+3,base+3),
           title:{display:true,text:'Risk %',color:axC,font:{size:9}}}
      }
    }
  });
}
function computeWorstLose(includeBT=false){const s=[...(includeBT?APP.trades:realTrades())].sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));let max=0,cur=0;s.forEach(t=>{if(t.res<0){cur++;max=Math.max(max,cur);}else if(t.res>0)cur=0;});return max;}
// % maximum perdu d'affilée par rapport au plus haut du capital atteint (drawdown max)
function computeMaxDrawdown(includeBT=false){
  const s=[...(includeBT?APP.trades:realTrades())].sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
  let peak=CAPITAL(),runCap=CAPITAL(),maxDD=0;
  s.forEach(t=>{
    runCap+=t.res||0;
    if(runCap>peak)peak=runCap;
    const dd=peak>0?(peak-runCap)/peak*100:0;
    if(dd>maxDD)maxDD=dd;
  });
  return maxDD;
}
// Calcule le % de chaque trade par rapport au capital au moment où il a eu lieu,
// en une seule passe sur les trades triés (au lieu de re-trier + re-boucler pour chaque trade).
function computeAllPcts(){
  const s=[...APP.trades].sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
  let cap=CAPITAL();
  const map={};
  for(const t of s){
    map[t.id]=t.backtest?0:(cap>0?(t.res/cap)*100:0);
    if(!t.backtest)cap+=(t.res||0);
  }
  return map;
}
function computePctBefore(tid){const s=[...APP.trades].sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));let cap=CAPITAL();for(const t of s){if(t.id===tid)return(t.res/cap)*100;cap+=(t.res||0);}return 0;}

// ══ NAV ══
function showPage(id,btn){
  // Fermer le thème éditeur automatiquement quand on change de page
  const te=document.getElementById('themeEditor');
  if(te&&te.style.display!=='none')te.style.display='none';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  const pg=document.getElementById('page-'+id);if(pg)pg.classList.add('active');
  if(btn)btn.classList.add('active');
  if(id==='trackrecord'){setTimeout(()=>{refreshAllCharts();renderTop5();},150);}
  if(id==='calendrier')renderCalendar();
  if(id==='journal'){BT_STATE.hist=true;const bh=document.getElementById('bt-hist');if(bh)bh.checked=true;renderTable();}
  if(id==='modifs'){setTimeout(()=>{renderModifs();setupPencil();},50);}
  if(id==='pointscles')renderPcChat();
}

// ══ FORM ══
function populateSelects(){
  [['f-paire',APP.lists.paires],['f-session',APP.lists.sessions]].forEach(([id,items])=>{const s=document.getElementById(id);if(!s)return;const v=s.value;s.innerHTML='<option value="">—</option>'+(items||[]).map(i=>`<option>${i}</option>`).join('');if(v)s.value=v;});
  [['f-mgmt',APP.lists.mgmt_opts],['f-reprend',APP.lists.reprend_opts]].forEach(([id,items])=>{const s=document.getElementById(id);if(!s)return;const v=s.value;s.innerHTML='<option value="">—</option>'+(items||[]).map(i=>`<option>${i}</option>`).join('');if(v)s.value=v;});
  const tw=document.getElementById('tf-wrap');
  if(tw){const sel=Array.from(tw.querySelectorAll('.chip.sel')).map(c=>c.dataset.v);tw.innerHTML=APP.lists.timeframes.map(tf=>`<div class="chip${sel.includes(tf)?' sel':''}" data-v="${tf}" onclick="this.classList.toggle('sel')">${tf}</div>`).join('');}
  const cw=document.getElementById('conf-wrap');
  if(cw){const sel=Array.from(cw.querySelectorAll('.chip.sel')).map(c=>c.dataset.v);cw.innerHTML=APP.lists.confluences.map(c=>`<div class="chip${sel.includes(c)?' sel':''}" data-v="${c}" onclick="this.classList.toggle('sel')">${c}</div>`).join('');}
}
function addTrade(){markUserAction();
  const g=id=>(document.getElementById(id)||{}).value||'';
  const tfs=Array.from(document.querySelectorAll('#tf-wrap .chip.sel')).map(c=>c.dataset.v).join('|');
  const confs=Array.from(document.querySelectorAll('#conf-wrap .chip.sel')).map(c=>c.dataset.v).join('|');
  const fRrAutoOn=document.getElementById('f-tglRrAuto')?.classList.contains('on');
  const t={id:APP.nextId++,date:g('f-date').trim(),heure:g('f-heure').trim(),paire:g('f-paire'),session:g('f-session'),conf:confs||'—',tf:tfs||'—',dir:g('f-dir'),rrCible:parseFloat(g('f-rrcible'))||0,rrAuto:fRrAutoOn!==false,rrPris:parseFloat(g('f-rrpris'))||0,res:parseFloat(g('f-res'))||0,mgmt:g('f-mgmt'),reprend:g('f-reprend'),notes:g('f-notes'),stars:parseFloat(g('f-stars'))||0,images:[],backtest:document.getElementById('f-backtest')?.checked||false};
  if(!t.date){alert('Date obligatoire.');return;}
  APP.trades.unshift(t);saveState();renderTable();updateNavBadges();
  document.getElementById('alertSaved').classList.add('show');setTimeout(()=>document.getElementById('alertSaved').classList.remove('show'),2200);resetForm();
}
// Pile d'annulation pour les suppressions de trades (en mémoire, valable pour la session en cours)
window._deletedTradesStack = window._deletedTradesStack || [];
function pcUpdateUndoBtnVisibility(){
  const btn = document.getElementById('undoHistBtn');
  if (!btn) return;
  btn.classList.toggle('visible', window._deletedTradesStack.length > 0);
}
function deleteTrade(id){
  markUserAction();
  const idx = APP.trades.findIndex(t=>t.id===parseInt(id,10));
  if (idx === -1) return;
  const removed = APP.trades[idx];
  window._deletedTradesStack.push({trade: removed, index: idx});
  if (window._deletedTradesStack.length > 20) window._deletedTradesStack.shift();
  APP.trades.splice(idx, 1);
  saveState();renderTable();updateNavBadges();
  schedulePush(250);
  pcShowUndoToast();
  pcUpdateUndoBtnVisibility();
}
function undoDeleteTrade(){
  const last = window._deletedTradesStack.pop();
  if (!last) return;
  markUserAction();
  const insertAt = Math.min(last.index, APP.trades.length);
  APP.trades.splice(insertAt, 0, last.trade);
  saveState();renderTable();updateNavBadges();
  schedulePush(250);
  const toast = document.getElementById('undoToast');
  if (toast) toast.classList.remove('show');
  pcUpdateUndoBtnVisibility();
}

// ── Suppression de tous les trades, protégée par code PIN ──
function askDeleteAllTrades(){
  if (!APP.trades.length) return;
  document.getElementById('deleteAllCount').textContent = APP.trades.length;
  document.getElementById('deleteAllErr').style.display = 'none';
  document.getElementById('deleteAllModal').classList.add('open');
  buildPad('deleteAllPad','deleteAllDots',async (val,reset) => {
    const stored = currentUser ? localStorage.getItem(pinKey(currentUser.id)) : null;
    const attempt = currentUser ? await localPinHash(val, currentUser.id) : null;
    if (!stored || (attempt !== stored && val !== stored)) {
      const err = document.getElementById('deleteAllErr');
      err.textContent = 'Code PIN incorrect.'; err.style.display = 'block';
      reset(true);
      return;
    }
    executeDeleteAllTrades();
  }, 'deleteAllErr');
}
function closeDeleteAllModal(){
  document.getElementById('deleteAllModal').classList.remove('open');
}
function executeDeleteAllTrades(){
  markUserAction();
  window._intentionalBulkDelete = true;
  // On garde une copie pour permettre l'annulation via le système existant
  APP.trades.forEach((t,i) => {
    window._deletedTradesStack.push({trade: t, index: i});
  });
  if (window._deletedTradesStack.length > 20) {
    window._deletedTradesStack = window._deletedTradesStack.slice(-20);
  }
  APP.trades = [];
  saveState(); renderTable(); updateNavBadges();
  schedulePush(250, {force:true});
  closeDeleteAllModal();
  pcUpdateUndoBtnVisibility();
  showSync('✓ Tous les trades supprimés', '#ef4444');
}
function pcShowUndoToast(){
  let toast = document.getElementById('undoToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'undoToast';
    toast.className = 'undo-toast';
    toast.innerHTML = `<span>Trade supprimé</span><button class="undo-toast-btn" onclick="undoDeleteTrade()" title="Annuler la suppression"><span class="undo-toast-icon" style="display:inline-block;transition:transform .4s ease;">↺</span> Annuler</button>`;
    document.body.appendChild(toast);
  }
  toast.classList.add('show');
  clearTimeout(window._undoToastTimer);
  window._undoToastTimer = setTimeout(()=>toast.classList.remove('show'), 6000);
}
// Ajuste la hauteur d'un textarea à son contenu (1 ligne mini, autant que nécessaire au-delà, jamais de scroll interne)
function autoGrow(el){if(!el)return;el.style.height='auto';el.style.height=el.scrollHeight+'px';}
function resetForm(){['f-date','f-heure','f-paire','f-session','f-dir','f-rrcible','f-res','f-mgmt','f-reprend','f-notes','f-rrpris'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});const fbt=document.getElementById('f-backtest');if(fbt)fbt.checked=false;document.querySelectorAll('#tf-wrap .chip,#conf-wrap .chip').forEach(c=>c.classList.remove('sel'));document.getElementById('f-date').value=new Date().toISOString().split('T')[0];initStarPicker('f-stars-picker','f-stars',0);window._formImages=[];renderFormImages();const fTgl=document.getElementById('f-tglRrAuto');if(fTgl){fTgl.classList.add('on');document.getElementById('f-rrpris-group').style.display='none';}autoGrow(document.getElementById('f-notes'));}
function tagD(v){return v==='LONG'?'<span class="tag tag-long">LONG</span>':v==='SHORT'?'<span class="tag tag-short">SHORT</span>':v||'—';}
function tagO(v){const m={Oui:'oui',Non:'non','Peut-être':'peut','N/A':'na'};return v?`<span class="tag tag-${m[v]||'na'}">${v}</span>`:'—';}
const MGMT_PALETTE=[
  {bg:'rgba(0,229,160,.12)',tx:'#00e5a0',bd:'#00e5a0'},
  {bg:'rgba(239,68,68,.12)',tx:'#ef4444',bd:'#ef4444'},
  {bg:'rgba(245,158,11,.12)',tx:'#f59e0b',bd:'#f59e0b'},
  {bg:'rgba(59,130,246,.12)',tx:'#3b82f6',bd:'#3b82f6'},
  {bg:'rgba(168,85,247,.12)',tx:'#a855f7',bd:'#a855f7'},
  {bg:'rgba(236,72,153,.12)',tx:'#ec4899',bd:'#ec4899'},
  {bg:'rgba(20,184,166,.12)',tx:'#14b8a6',bd:'#14b8a6'},
  {bg:'rgba(249,115,22,.12)',tx:'#f97316',bd:'#f97316'}
];
function mgmtPal(i,ch){return MGMT_PALETTE[i%MGMT_PALETTE.length][ch];}
function tagMgmt(v){
  if(!v)return '—';
  const idx=(APP.lists.mgmt_opts||[]).indexOf(v);
  if(idx<0)return `<span class="tag" style="background:var(--tag-na-bg);color:var(--tag-na-tx);border-color:var(--tag-na-bd)">${v}</span>`;
  const bg=`var(--tag-mgmt-${idx}-bg,${mgmtPal(idx,'bg')})`,tx=`var(--tag-mgmt-${idx}-tx,${mgmtPal(idx,'tx')})`,bd=`var(--tag-mgmt-${idx}-bd,${mgmtPal(idx,'bd')})`;
  return `<span class="tag" style="background:${bg};color:${tx};border-color:${bd}">${v}</span>`;
}
function ensureMgmtThemeDefaults(){
  (APP.lists.mgmt_opts||[]).forEach((m,i)=>{
    [[`--tag-mgmt-${i}-bg`,'bg'],[`--tag-mgmt-${i}-tx`,'tx'],[`--tag-mgmt-${i}-bd`,'bd']].forEach(([vn,ch])=>{
      if((typeof teVals!=='undefined'?teVals[vn]:undefined)===undefined && !document.documentElement.style.getPropertyValue(vn)){
        document.documentElement.style.setProperty(vn,mgmtPal(i,ch));
      }
    });
    [[`--mgmt-type-${i}`,'tx',false],[`--mgmt-type-${i}-alpha`,'tx',true],[`--mgmt-type-${i}-bd`,'tx',false]].forEach(([vn,ch,alpha])=>{
      if((typeof teVals!=='undefined'?teVals[vn]:undefined)===undefined && !document.documentElement.style.getPropertyValue(vn)){
        document.documentElement.style.setProperty(vn,alpha?hexA(mgmtPal(i,ch),.45):mgmtPal(i,ch));
      }
    });
  });
}
// Couleur par défaut de chaque titre individualisé (mode stylo + éditeur de thème),
// tant que l'utilisateur ne l'a pas personnalisée lui-même.
const TITLE_DEFAULTS={
  '--pt-trackrecord':'#00e5a0','--pt-pointscles':'#00e5a0','--pt-journal':'#00e5a0','--pt-calendrier':'#00e5a0','--pt-modifs':'#00e5a0',
  '--ps-trackrecord':'#64748b',
  '--kl-capital':'#64748b','--kl-pnltotal':'#64748b','--kl-winrate':'#64748b','--kl-rrmoyen':'#64748b','--kl-profitfactor':'#64748b','--kl-payout':'#64748b','--kl-trades':'#64748b','--kl-riskactuel':'#64748b','--kl-drawdown':'#64748b',
  '--ct-evolution':'#00e5a0','--ct-pnl':'#00e5a0','--ct-riskmgmt':'#00e5a0','--ct-winrate':'#00e5a0','--ct-mgmtimpact':'#00e5a0',
  '--ct-comp-conf':'#00e5a0','--ct-comp-pairs':'#00e5a0','--ct-comp-sessions':'#00e5a0','--ct-comp-jours':'#00e5a0','--ct-comp-tf':'#00e5a0',
  '--crt-top5':'#00e5a0','--crt-pires5':'#ef4444','--crt-assistant':'#00e5a0','--crt-nouveautrade':'#00e5a0','--crt-historique':'#00e5a0',
  '--crt-capitalrisk':'#00e5a0','--crt-riskreglages':'#00e5a0','--crt-securite':'#00e5a0','--crt-sauvegarde':'#00e5a0','--crt-themestylo':'#00e5a0','--crt-resume':'#00e5a0'
};
function ensureTitleThemeDefaults(){
  Object.entries(TITLE_DEFAULTS).forEach(([vn,def])=>{
    if((typeof teVals!=='undefined'?teVals[vn]:undefined)===undefined && !document.documentElement.style.getPropertyValue(vn)){
      document.documentElement.style.setProperty(vn,def);
    }
  });
}
function fmtR(v){if(v===''||v==null)return'—';return`<span class="${v>=0?'rp':'rn'}">${v>=0?'+':''}${Number(v).toLocaleString('fr-FR')}€</span>`;}
function fmtPct(tid){const p=computePctBefore(tid);return`<span class="${p>=0?'rp':'rn'}">${p>=0?'+':''}${p.toFixed(2)}%</span>`;}
function starsHtml(val){
  const v=parseFloat(val)||0;let h='';
  for(let i=1;i<=5;i++){
    if(v>=i)h+='<span style="color:#f59e0b">★</span>';
    else if(v>=i-0.5)h+='<span style="color:#f59e0b">½</span>';
    else h+='<span style="color:#2a3a5c">★</span>';
  }
  return h||'—';
}
function imgEyeHtml(t){
  const imgs=t.images||[];
  if(!imgs.length)return'<span style="color:var(--muted)">—</span>';
  return`<span onclick="viewTradeImages(${t.id})" style="cursor:pointer;position:relative;display:inline-block;font-size:16px;" title="Voir ${imgs.length} image(s)">👁<sup style="font-size:9px;color:#4f8ef7;font-family:var(--mono)">${imgs.length}</sup></span>`;
}
function viewTradeImages(id){
  id = parseInt(id, 10);
  const t=APP.trades.find(x=>x.id===id);
  if(!t||!t.images||!t.images.length)return;
  const modal=document.getElementById('imgViewModal');
  document.getElementById('imgViewContent').innerHTML=t.images.map((src,i)=>`
    <div style="position:relative;text-align:center;">
      <img src="${src}" style="max-width:100%;max-height:60vh;width:auto;height:auto;border-radius:8px;border:1px solid var(--border);display:block;margin:0 auto 8px;object-fit:contain;cursor:zoom-in;" onclick="openFullscreen('${src}')">
      <button onclick="openFullscreen('${src}')" style="background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;font-family:var(--mono);margin-bottom:8px;">⛶ Plein écran</button>
    </div>`).join('');
  modal.classList.add('open');
}

function openFullscreen(src){
  // Créer overlay plein écran
  const overlay = document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
  overlay.onclick = () => document.body.removeChild(overlay);
  const img = document.createElement('img');
  img.src = src;
  img.style.cssText='max-width:95vw;max-height:95vh;width:auto;height:auto;object-fit:contain;border-radius:6px;';
  // Bouton fermer
  const closeBtn = document.createElement('button');
  closeBtn.textContent='✕';
  closeBtn.style.cssText='position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;color:#fff;font-size:20px;width:40px;height:40px;border-radius:50%;cursor:pointer;';
  closeBtn.onclick=(e)=>{e.stopPropagation();document.body.removeChild(overlay);};
  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}
function deleteTradeImage(id,idx){
  const t=APP.trades.find(x=>x.id===id);
  if(!t||!t.images)return;
  const [removed]=t.images.splice(idx,1);
  if(typeof deleteTradeImageFromStorage==='function') deleteTradeImageFromStorage(removed);
  saveState();viewTradeImages(id);renderTable();
}
function renderTable(){
  // Filet de sécurité : élimine les doublons d'id qui pourraient survenir
  // en cas d'état incohérent transitoire pendant la synchronisation cloud.
  const seen=new Set();
  const dedup=APP.trades.filter(t=>{
    if(seen.has(t.id))return false;
    seen.add(t.id);
    return true;
  });
  if(dedup.length!==APP.trades.length){
    console.warn('Doublons de trades détectés et retirés:', APP.trades.length-dedup.length);
    APP.trades=dedup;
  }
  const base=BT_STATE.hist?APP.trades:APP.trades.filter(t=>!t.backtest);
  const sorted=[...base].sort((a,b)=>b.date.localeCompare(a.date)||(b.heure||'').localeCompare(a.heure||''));
  const pctMap=computeAllPcts();
  const tcEl=document.getElementById('tradeCount');if(tcEl)tcEl.textContent=`— ${sorted.length} trades`;
  document.getElementById('emptyState').style.display=sorted.length?'none':'block';
  document.getElementById('tradeTable').innerHTML=sorted.map(t=>{
    const p=pctMap[t.id]||0;
    const pctHtml=`<span class="${p>=0?'rp':'rn'}">${p>=0?'+':''}${p.toFixed(2)}%</span>`;
    return `<tr>
    <td style="font-family:var(--mono)">${t.date||'—'}</td>
    <td style="font-family:var(--mono)">${t.heure||'—'}</td>
    <td style="color:var(--muted)">${t.session||'—'}</td>
    <td><strong>${t.paire||'—'}</strong>${t.backtest?'&nbsp;<span style="font-size:11px;line-height:1;padding:1px 3px;background:var(--bt-bg);color:var(--bt-tx);border-radius:3px;font-family:var(--mono);display:inline-block;">BT</span>':''}</td>
    <td>${tagD(t.dir)}</td>
    <td style="font-family:var(--mono);color:var(--state-tf)">${t.tf||'—'}</td>
    <td style="color:var(--muted);max-width:120px;overflow:hidden;text-overflow:ellipsis" title="${t.conf||''}">${t.conf||'—'}</td>
    <td style="font-family:var(--mono);color:var(--muted)">${t.rrCible?t.rrCible+'R':'—'}</td>
    <td style="font-family:var(--mono)">${computeRR(t)}R</td>
    <td>${fmtR(t.res)}</td><td>${pctHtml}</td>
    <td>${tagMgmt(t.mgmt)}</td><td>${tagO(t.reprend)}</td>
    <td style="white-space:nowrap">${starsHtml(t.stars)}</td>
    <td style="text-align:center">${imgEyeHtml(t)}</td>
    <td style="white-space:nowrap">
      <button class="del-btn" style="margin-right:2px" onclick="openEditTrade(${t.id})" title="Modifier">✎</button>
      <button class="del-btn" onclick="deleteTrade(${t.id})" title="Supprimer"><span class="deco-emoji">🗑</span><span class="deco-emoji-alt">✕</span></button>
    </td>
  </tr>`;
  }).join('');
  syncTableScrollbar();
}
// Synchronise la barre de défilement horizontal "du haut" avec le tableau réel,
// et ajuste sa largeur factice pour qu'elle reflète la largeur réelle scrollable du tableau.
function syncTableScrollbar(){
  const top=document.getElementById('tableScrollTop');
  const topInner=document.getElementById('tableScrollTopInner');
  const main=document.getElementById('tableScrollMain');
  if(!top||!topInner||!main)return;
  const table=main.querySelector('table');
  if(!table)return;
  topInner.style.width=table.scrollWidth+'px';
  if(!top.dataset.bound){
    top.addEventListener('scroll',()=>{main.scrollLeft=top.scrollLeft;});
    main.addEventListener('scroll',()=>{top.scrollLeft=main.scrollLeft;});
    top.dataset.bound='1';
  }
}
window.addEventListener('resize',()=>{if(typeof syncTableScrollbar==='function')syncTableScrollbar();});
function updateNavBadges(){
  const pnl=realTrades().reduce((s,t)=>s+(t.res||0),0);
  const tTxt=APP.trades.length+' trades';
  const pTxt='P&L '+(pnl>=0?'+':'')+pnl.toLocaleString('fr-FR')+'€';
  const pCol=pnl>=0?(gc('--badge-p-pos-tx')||'#00e5a0'):(gc('--badge-p-neg-tx')||'#ef4444');
  const rTxt='Risk '+getCurrentRiskEur().toLocaleString('fr-FR')+'€ ('+fmtRiskPct(getCurrentRiskPct())+')';
  // Desktop
  document.getElementById('navTrades').textContent=tTxt;
  const nb=document.getElementById('navPnl');nb.textContent=pTxt;nb.style.color=pCol;
  document.getElementById('navRisk').textContent=rTxt;
  // Mobile
  document.getElementById('navTrades2').textContent=tTxt;
  const nb2=document.getElementById('navPnl2');nb2.textContent=pTxt;nb2.style.color=pCol;
  document.getElementById('navRisk2').textContent=rTxt;
}

// ══ MODIFS ══
function toggleDecimal(){const c=RDEC();lssAcc('tj_risk_decimal',!c);document.getElementById('tglDec').classList.toggle('on',!c);renderModifs();updateNavBadges();updateKPIs();if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}}
function toggleSmartRisk(){const c=SMART();lssAcc('tj_smart_risk',!c);document.getElementById('tglSmart').classList.toggle('on',!c);document.getElementById('smartLbl').textContent=!c?'Activé':'Désactivé';document.getElementById('riskCard').style.display=!c?'':'none';renderModifs();updateNavBadges();refreshAllCharts();if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}}
// Toggle RR Pris auto/manuel, par formulaire ('f' pour ajout, 'e' pour édition)
function toggleFormRrAuto(prefix){
  const tgl=document.getElementById(prefix+'-tglRrAuto');
  const group=document.getElementById(prefix+'-rrpris-group');
  if(!tgl||!group)return;
  const wasOn=tgl.classList.contains('on');
  const nowOn=!wasOn;
  tgl.classList.toggle('on',nowOn);
  // "on" = RR Pris auto activé → champ manuel caché
  // "off" = RR Pris manuel → champ visible
  group.style.display=nowOn?'none':'';
}
function saveCapitalRisk(){
  lssAcc('tj_capital',parseFloat(document.getElementById('capInput').value)||10000);
  const riskVal=parseFloat(document.getElementById('riskInput').value)||1;
  lssAcc('tj_risk',riskVal);
  const rm=parseFloat(document.getElementById('riskMaxInput').value)||10;
  lssAcc('tj_risk_max',rm);
  if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}
  const lbl=document.getElementById('riskMaxLabel');if(lbl)lbl.textContent=rm;
  renderModifs();updateNavBadges();updateKPIs();refreshAllCharts();
}
// Affiche le bon champ (trades ou %) selon le déclencheur choisi, pour la zone 'up' ou 'down'
function updateRmTriggerUI(zone){
  const trigger=document.getElementById('rm'+(zone==='up'?'Up':'Down')+'Trigger').value;
  const tradesGroup=document.getElementById('rm'+(zone==='up'?'Up':'Down')+'TradesGroup');
  const pctGroup=document.getElementById('rm'+(zone==='up'?'Up':'Down')+'PctGroup');
  if(tradesGroup)tradesGroup.style.display=trigger==='trades'?'':'none';
  if(pctGroup)pctGroup.style.display=trigger==='pct'?'':'none';
}
function loadRmConfigUI(){
  document.getElementById('rmUpTrigger').value=RM_UP_TRIGGER();
  document.getElementById('rmUpTradesVal').value=RM_UP_TRADES();
  document.getElementById('rmUpPctVal').value=RM_UP_PCT();
  document.getElementById('rmUpVarType').value=RM_UP_VAR_TYPE();
  document.getElementById('rmUpVarVal').value=RM_UP_VAR_VAL();

  document.getElementById('rmDownTrigger').value=RM_DOWN_TRIGGER();
  document.getElementById('rmDownTradesVal').value=RM_DOWN_TRADES();
  document.getElementById('rmDownPctVal').value=RM_DOWN_PCT();
  document.getElementById('rmDownVarType').value=RM_DOWN_VAR_TYPE();
  document.getElementById('rmDownVarVal').value=RM_DOWN_VAR_VAL();

  updateRmTriggerUI('up');
  updateRmTriggerUI('down');
}
function saveRmConfig(){
  lssAcc('tj_rm_up_trigger',document.getElementById('rmUpTrigger').value);
  lssAcc('tj_rm_up_trades',parseFloat(document.getElementById('rmUpTradesVal').value)||3);
  lssAcc('tj_rm_up_pct',parseFloat(document.getElementById('rmUpPctVal').value)||5);
  lssAcc('tj_rm_up_var_type',document.getElementById('rmUpVarType').value);
  lssAcc('tj_rm_up_var_val',parseFloat(document.getElementById('rmUpVarVal').value)||0.5);

  lssAcc('tj_rm_down_trigger',document.getElementById('rmDownTrigger').value);
  lssAcc('tj_rm_down_trades',parseFloat(document.getElementById('rmDownTradesVal').value)||3);
  lssAcc('tj_rm_down_pct',parseFloat(document.getElementById('rmDownPctVal').value)||5);
  lssAcc('tj_rm_down_var_type',document.getElementById('rmDownVarType').value);
  lssAcc('tj_rm_down_var_val',parseFloat(document.getElementById('rmDownVarVal').value)||0.5);

  if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}
  renderModifs();updateNavBadges();updateKPIs();refreshAllCharts();
}
function addPayout(){
  const v=parseFloat(document.getElementById('payoutInput').value)||0;
  if(v<=0)return;
  const payouts=lsAcc('tj_payouts',[]);
  payouts.push({date:new Date().toISOString().split('T')[0],amount:v});
  lssAcc('tj_payouts',payouts);
  document.getElementById('payoutInput').value='';
  renderPayouts();updateNavBadges();updateKPIs();refreshAllCharts();
}
function removePayout(i){const payouts=ls('tj_payouts',[]);payouts.splice(i,1);lssAcc('tj_payouts',payouts);renderPayouts();updateNavBadges();updateKPIs();refreshAllCharts();if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}}
function renderPayouts(){
  const payouts=lsAcc('tj_payouts',[]);
  const total=payouts.reduce((s,p)=>s+p.amount,0);
  // payoutTotal removed from modifs, shown in KPI instead
  const hist=document.getElementById('payoutHistory');
  if(hist)hist.innerHTML=payouts.map((p,i)=>`<div style="display:inline-flex;align-items:center;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:2px 7px;font-size:10px;font-family:var(--mono);">
    <span style="color:var(--gold)">-${p.amount.toLocaleString('fr-FR')}€</span>
    <span style="color:var(--muted)">${p.date}</span>
    <button onclick="removePayout(${i})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11px;">×</button>
  </div>`).join('');
}
function renderModifs(){
  document.getElementById('capInput').value=lsAcc('tj_capital','10000');
  document.getElementById('riskInput').value=lsAcc('tj_risk','1');
  document.getElementById('riskMaxInput').value=lsAcc('tj_risk_max','10');
  const rmLbl=document.getElementById('riskMaxLabel');if(rmLbl)rmLbl.textContent=lsAcc('tj_risk_max','10');
  renderPayouts();
  document.getElementById('tglDec').classList.toggle('on',RDEC());
  const smart=SMART();document.getElementById('tglSmart').classList.toggle('on',smart);document.getElementById('smartLbl').textContent=smart?'Activé':'Désactivé';document.getElementById('riskCard').style.display=smart?'':'none';
  const{finalRp,finalRealWs,finalRealLs}=computeRiskHistory();
  document.getElementById('disp0').textContent=getCurrentCap().toLocaleString('fr-FR')+'€';
  document.getElementById('disp1').textContent=fmtRiskPct(finalRp);document.getElementById('disp2').textContent=getCurrentRiskEur().toLocaleString('fr-FR')+'€';
  document.getElementById('disp3').textContent=finalRealWs+' T';document.getElementById('disp4').textContent=finalRealLs+' T';
  loadRmConfigUI();
  const MK=[{key:'paires',label:'Paires / Actifs',cv:'--mt-paires'},{key:'sessions',label:'Sessions',cv:'--mt-sessions'},{key:'confluences',label:'Confluences',cv:'--mt-confluences'},{key:'timeframes',label:'Timeframes',cv:'--mt-timeframes'},{key:'mgmt_opts',label:'Management',cv:'--mt-mgmt'},{key:'reprend_opts',label:'Reprendrais-tu ?',cv:'--mt-reprend'}];
  document.getElementById('modGrid').innerHTML=MK.map(({key,label,cv})=>`
    <div class="mod-col">
      <div class="mod-col-hdr"><span class="mod-col-title" data-editable style="color:var(${cv})">${label}</span><span style="font-size:9px;color:var(--muted)">${(APP.lists[key]||[]).length}</span></div>
      <div class="mod-list" id="ml-${key}">${(APP.lists[key]||[]).map((item,i)=>`<div class="mod-item"><span class="drag-h">⣿</span><span class="item-tx">${item}</span><button class="del-item" onclick="removeListItem('${key}',${i})">×</button></div>`).join('')}</div>
      <div class="mod-add"><input type="text" id="ma-${key}" placeholder="Ajouter..." onkeydown="if(event.key==='Enter')addListItem('${key}')"><button onclick="addListItem('${key}')">+</button></div>
    </div>`).join('');
  MK.forEach(({key})=>{const el=document.getElementById('ml-'+key);if(el&&window.Sortable){new Sortable(el,{animation:120,handle:'.drag-h',onEnd:evt=>{const list=APP.lists[key];const[m]=list.splice(evt.oldIndex,1);list.splice(evt.newIndex,0,m);saveState();populateSelects();if(currentUser&&!_isSyncing){schedulePush(300);}}});}});
  setupPencil(); // re-attacher les listeners dynamiques
  applyPencilEdits(); // réappliquer les tailles/couleurs personnalisées (marque dataset.userFs)
  // Compact on mobile
  applyMobileModState();
}
function applyMobileModState(){
  if(window.innerWidth<=620){
    const items=document.querySelectorAll('.mod-state-item');
    items.forEach(it=>{
      const lbl=it.querySelector('.mod-state-label');
      const val=it.querySelector('.mod-state-value');
      // Ne force la taille compacte que si l'utilisateur n'a pas défini sa propre taille via le mode stylo
      if(lbl&&!lbl.dataset.userFs)lbl.style.fontSize='7px';
      if(val&&!val.dataset.userFs)val.style.fontSize='11px';
    });
  }
}
function addListItem(key){markUserAction();const inp=document.getElementById('ma-'+key);const v=inp.value.trim();if(!v||(APP.lists[key]||[]).includes(v))return;if(!APP.lists[key])APP.lists[key]=[];APP.lists[key].push(v);saveState();populateSelects();renderModifs();inp.value='';if(currentUser&&!_isSyncing){schedulePush(300);}}
function removeListItem(key,idx){markUserAction();if(!APP.lists[key])return;APP.lists[key].splice(idx,1);saveState();populateSelects();renderModifs();if(currentUser&&!_isSyncing){schedulePush(300);}}

// ══ CALENDRIER ══
let calD=new Date();calD.setDate(1);
function calMonth(d){calD.setMonth(calD.getMonth()+d);renderCalendar();}
function calYear(d){const y=calD.getFullYear()+d;if(y<2020)return;calD.setFullYear(y);renderCalendar();}
const MNL=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
function buildDM(y,m){const dm={};(BT_STATE.cal?APP.trades:realTrades()).forEach(t=>{if(!t.date)return;const td=new Date(t.date+'T12:00:00');if(td.getFullYear()===y&&td.getMonth()===m){dm[t.date]=dm[t.date]||{pnl:0,rr:0,count:0};dm[t.date].pnl+=(t.res||0);dm[t.date].rr+=computeRR(t);dm[t.date].count++;}});return dm;}
function renderMonthGrid(y,m){
  const dm=buildDM(y,m);const fd=(new Date(y,m,1).getDay()+6)%7,dim=new Date(y,m+1,0).getDate();
  const ts=new Date().toISOString().split('T')[0];const DW=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  let html=DW.map(d=>`<div class="cal-dow">${d}</div>`).join('');
  for(let i=0;i<fd;i++)html+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=dim;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const info=dm[ds];let cls='cal-day';if(ds===ts)cls+=' today';if(info)cls+=info.pnl>=0?' pos':' neg';
    html+=`<div class="${cls}"><div class="cal-day-num">${d}</div>${info?`<div class="cal-pnl">${info.pnl>=0?'+':''}${info.pnl.toLocaleString('fr-FR')}€</div><div class="cal-rr">${info.rr>=0?'+':''}${info.rr.toFixed(1)}R</div><div class="cal-tc">${info.count}T</div>`:''}</div>`;
  }
  return html;
}
function renderCalendar(){
  const y=calD.getFullYear(),m=calD.getMonth();
  document.getElementById('calLabel').textContent=MNL[m]+' '+y;document.getElementById('calYear').textContent=y;
  const prev=new Date(y,m-1,1),next=new Date(y,m+1,1);
  document.getElementById('calPrev').innerHTML=`<div class="cal-month-header">${MNL[prev.getMonth()]} ${prev.getFullYear()}</div><div class="cal-grid">${renderMonthGrid(prev.getFullYear(),prev.getMonth())}</div>`;
  document.getElementById('calCur').innerHTML=`<div class="cal-month-header cur">${MNL[m]} ${y} — Mois en cours</div><div class="cal-grid">${renderMonthGrid(y,m)}</div>`;
  document.getElementById('calNext').innerHTML=`<div class="cal-month-header">${MNL[next.getMonth()]} ${next.getFullYear()}</div><div class="cal-grid">${renderMonthGrid(next.getFullYear(),next.getMonth())}</div>`;
}

// ══ CHARTS ══
const CH={};
const ST={eq:'tout',pnl:'tout',pie:'tout',risk:'tout',mgmt:'tout',conf:'tout',pairs:'tout',sessions:'tout',jours:'tout',tf:'tout'};
const MODE={conf:false,pairs:false,sessions:false,jours:false,tf:false};

function filterT(period){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth(),q=Math.floor(m/3);
  const nowStr=y+'-'+String(m+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const curWeek=wk(nowStr); // semaine calendaire ISO actuelle (lundi→dimanche), pas une fenêtre glissante
  return APP.trades.filter(t=>{if(!t.date)return false;const td=new Date(t.date+'T12:00:00');
    if(period==='tout')return true;if(period==='annee')return td.getFullYear()===y;
    if(period==='trimestre')return td.getFullYear()===y&&Math.floor(td.getMonth()/3)===q;
    if(period==='mois')return td.getFullYear()===y&&td.getMonth()===m;
    if(period==='semaine')return wk(t.date)===curWeek;
    if(period==='jour')return td.toDateString()===now.toDateString();return true;
  }).sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
}
// Sans backtests (comportement par défaut)
function filterRealT(period){return filterT(period).filter(t=>!t.backtest);}
// État BT par graphique — true = inclure les backtests dans ce graphique
const BT_STATE={eq:false,pnl:false,pie:false,risk:false,mgmt:false,conf:false,pairs:false,sessions:false,jours:false,tf:false,top5:false,cal:false,pc:false,hist:true,kpi:false};
function btFilter(key,period){return BT_STATE[key]?filterT(period):filterRealT(period);}
function toggleBT(key){BT_STATE[key]=!BT_STATE[key];const el=document.getElementById('bt-'+key);if(el)el.checked=BT_STATE[key];redrawForKey(key);}
function redrawForKey(k){
  if(k==='eq')drawEquity(ST.eq);
  else if(k==='pnl')drawPnl(ST.pnl);
  else if(k==='pie')drawPie(ST.pie);
  else if(k==='risk')drawRiskChart(ST.risk);
  else if(k==='mgmt')drawMgmt(ST.mgmt);
  else if(k==='conf')drawComp('cConf','conf','conf',ST.conf,MODE.conf,true);
  else if(k==='pairs')drawComp('cPairs','pairs','paire',ST.pairs,MODE.pairs);
  else if(k==='sessions')drawComp('cSessions','sessions','session',ST.sessions,MODE.sessions);
  else if(k==='jours')drawJours(ST.jours);
  else if(k==='tf')drawComp('cTF','tf','tf',ST.tf,MODE.tf,true);
  else if(k==='top5')renderTop5();
  else if(k==='cal')renderCalendar();
  else if(k==='hist')renderTable();
  else if(k==='kpi')updateKPIs();
}
function wk(ds){const d=new Date(ds+'T12:00:00'),t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const dy=(t.getUTCDay()+6)%7;t.setUTCDate(t.getUTCDate()-dy+3);const ft=new Date(Date.UTC(t.getUTCFullYear(),0,4));return t.getUTCFullYear()+'-W'+String(1+Math.round(((t-ft)/864e5-3+(ft.getUTCDay()+6)%7)/7)).padStart(2,'0');}
function destroy(k){if(CH[k]){CH[k].destroy();delete CH[k];}}
function gc(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
const CO={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}};
function hexA(hex,a){hex=(hex||'').trim();if(hex.startsWith('rgba')||hex.startsWith('rgb')){const m=hex.match(/[\d.]+/g);if(m&&m.length>=3)return`rgba(${m[0]},${m[1]},${m[2]},${a})`;}if(!hex.startsWith('#'))return hex;const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return isNaN(r)?hex:`rgba(${r},${g},${b},${a})`;}
function buildLabels(tr,period){
  const M=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  if(period==='jour'||period==='semaine')return tr.map(t=>t.heure||t.date);
  if(period==='mois'||period==='trimestre')return tr.map(t=>{const d=new Date(t.date+'T12:00:00');return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});});
  if(period==='annee')return tr.map(t=>{const d=new Date(t.date+'T12:00:00');return M[d.getMonth()]+' '+d.getFullYear();});
  const span=tr.length>1?(new Date(tr[tr.length-1].date)-new Date(tr[0].date))/864e5:0;
  if(span<=60)return tr.map(t=>{const d=new Date(t.date+'T12:00:00');return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});});
  if(span<=400)return tr.map(t=>{const d=new Date(t.date+'T12:00:00');return M[d.getMonth()]+' '+d.getFullYear();});
  return tr.map(t=>{const d=new Date(t.date+'T12:00:00');return 'T'+(Math.floor(d.getMonth()/3)+1)+' '+d.getFullYear();});
}

function updateKPIs(){
  const t=BT_STATE.kpi?APP.trades:realTrades();if(!t.length)return;
  const gains=t.filter(x=>x.res>0),pertes=t.filter(x=>x.res<0);
  const pnl=t.reduce((s,x)=>s+(x.res||0),0),wr=gains.length/t.length*100;
  const rrArr=t.map(x=>computeRR(x));
  const rrMoy=rrArr.length?rrArr.reduce((a,b)=>a+b)/rrArr.length:0;
  const sumG=gains.reduce((s,x)=>s+x.res,0),sumP=Math.abs(pertes.reduce((s,x)=>s+x.res,0));
  const pf=sumP>0?sumG/sumP:(sumG>0?99:0);
  const rp=BT_STATE.kpi?computeRiskHistory(true).finalRp:getCurrentRiskPct();
  const worst=computeWorstLose(BT_STATE.kpi);
  const fr=n=>n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const totalPO0=lsAcc('tj_payouts',[]).reduce((s,p)=>s+(p.amount||0),0);
  const dispCap=CAPITAL()+t.reduce((s,x)=>s+(x.res||0),0)-totalPO0;
  const re=Math.round(dispCap*rp/100*100)/100;
  document.getElementById('k0').textContent=fr(dispCap)+'€';
  const k1=document.getElementById('k1');
  const pnlPct=CAPITAL()>0?(pnl/CAPITAL()*100):0;
  k1.textContent=(pnl>=0?'+':'')+fr(pnl)+'€ ('+(pnlPct>=0?'+':'')+pnlPct.toFixed(1)+'%)';
  k1.style.color=pnl>=0?'var(--green)':'var(--red)';
  document.getElementById('k2').textContent=wr.toFixed(1)+'%';document.getElementById('k3').textContent=rrMoy.toFixed(2)+'R';
  document.getElementById('k4').textContent=pf.toFixed(2);
  {const k5el=document.getElementById('k5');
   if(k5el){k5el.textContent=(totalPO0>0?'-':'')+fr(totalPO0)+' €';k5el.style.color=totalPO0>0?'var(--gold)':'var(--muted)';}
  }
  const btCount=APP.trades.filter(x=>x.backtest).length;
  const k6el=document.getElementById('k6');
  if(k6el)k6el.innerHTML=t.length+(BT_STATE.kpi?(btCount?`<br><span style="font-size:9px;opacity:.7;">(dont ${btCount} BT)</span>`:''):(btCount?`<br><span style="font-size:9px;opacity:.7;">(${btCount} BT exclus)</span>`:''));
  document.getElementById('k7').textContent=re.toLocaleString('fr-FR')+'€ ('+fmtRiskPct(rp)+')';
  document.getElementById('k8').textContent=worst+' T ('+computeMaxDrawdown(BT_STATE.kpi).toFixed(1)+'%)';
  for(let i=1;i<=9;i++){const c=gc(`--kpi${i}`);const bar=document.getElementById('kb'+i);const val=document.getElementById(`k${i-1}`);if(bar)bar.style.background=c;if(val)val.style.color=c;}
}

// EQUITY
function drawEquity(period){
  const tr=btFilter('eq',period);destroy('eq');if(!tr.length)return;
  let cap=CAPITAL();const data=tr.map(t=>{cap+=(t.res||0);return cap;});
  const labels=buildLabels(tr,period);const ctx=document.getElementById('cEq').getContext('2d');
  const lc=gc('--eq-line')||'#00e5a0',axC=gc('--eq-axis')||'#64748b',grC=gc('--eq-grid')||'rgba(100,116,139,.1)';
  const ftop=gc('--eq-fill-top')||'rgba(0,229,160,.32)',fbot=gc('--eq-fill-bot')||'rgba(0,229,160,0)';
  const g=ctx.createLinearGradient(0,0,0,210);g.addColorStop(0,ftop);g.addColorStop(1,fbot);
  CH['eq']=new Chart(ctx,{type:'line',data:{labels,datasets:[{data,borderColor:lc,backgroundColor:g,borderWidth:2.5,fill:true,tension:0,pointRadius:0,pointHoverRadius:4}]},
    options:{...CO,plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>' Capital : '+i.parsed.y.toLocaleString('fr-FR')+'€'}}},
      scales:{x:{grid:{color:grC},ticks:{maxRotation:30,maxTicksLimit:12,color:axC}},y:{grid:{color:grC},ticks:{color:axC,callback:v=>v.toLocaleString('fr-FR')+'€'}}}}});
}

// PNL — Diagramme en barres par trade
function drawPnl(period){
  const tr=btFilter('pnl',period);destroy('pnl');
  if(!tr.length)return;
  const posC=gc('--pnl-bar-pos')||'#3b82f6';
  const negC=gc('--pnl-bar-neg')||'#ef4444';
  const axC=gc('--pnl-axis')||'#64748b';
  const grC=gc('--pnl-grid')||'rgba(100,116,139,.1)';
  const sorted=[...tr].sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
  const labels=sorted.map(t=>{
    if(period==='jour'||period==='semaine')return t.heure||t.date.slice(5);
    if(period==='mois')return t.date.slice(5);
    return t.date.slice(5);
  });
  const data=sorted.map(t=>t.res||0);
  const colors=data.map(v=>v>=0?posC:negC);
  const ctx=document.getElementById('cPnl').getContext('2d');
  CH['pnl']=new Chart(ctx,{
    type:'bar',
    data:{labels,datasets:[{data,backgroundColor:colors,borderColor:colors,borderWidth:0,borderRadius:2,barPercentage:0.8}]},
    options:{responsive:true,maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:false},tooltip:{callbacks:{
        title:items=>sorted[items[0].dataIndex]?.date||'',
        label:i=>' P&L : '+(data[i.dataIndex]>=0?'+':'')+data[i.dataIndex].toLocaleString('fr-FR')+'€'
      }}},
      scales:{
        x:{grid:{color:grC},ticks:{color:axC,maxRotation:30,maxTicksLimit:16}},
        y:{grid:{color:grC},ticks:{color:axC,callback:v=>(v>=0?'+':'')+v.toLocaleString('fr-FR')+'€'}}
      }
    }
  });
}


// PIE
function drawPie(period){
  const tr=btFilter('pie',period);destroy('pie');
  const g=tr.filter(t=>t.res>0).length,p=tr.filter(t=>t.res<0).length,n=tr.filter(t=>t.res===0).length;
  const ctx=document.getElementById('cPie').getContext('2d');
  CH['pie']=new Chart(ctx,{type:'doughnut',data:{labels:['Gagnants','Perdants','Nuls'],
    datasets:[{data:[g,p,n],backgroundColor:[gc('--pie-win'),gc('--pie-lose'),gc('--pie-neutral')],borderColor:gc('--winrate-slice-border')||'#0b0f1a',borderWidth:3,hoverOffset:5}]},
    options:{responsive:true,maintainAspectRatio:true,cutout:'60%',layout:{padding:{bottom:8}},plugins:{
      legend:{position:'bottom',align:'center',labels:{padding:16,color:'#94a3b8',font:{size:11},boxWidth:13,boxHeight:13}},
      tooltip:{callbacks:{label:i=>' '+i.label+' : '+i.parsed+(tr.length?' ('+Math.round(i.parsed/tr.length*100)+'%)':'')}}}}});
}

// MGMT — 4 barres : P&L Oui | WinRate Oui | P&L Non | WinRate Non (sans toggle)
function drawMgmt(period){
  destroy('mgmt');
  const tr=btFilter('mgmt',period);
  const allTypes=APP.lists.mgmt_opts||[];
  const types=allTypes.filter(m=>tr.some(t=>t.mgmt===m));
  const axC=gc('--mgmt-axis')||'#64748b',grC=gc('--mgmt-grid')||'rgba(100,116,139,.1)';
  const ctx=document.getElementById('cMgmt').getContext('2d');
  if(!types.length)return;

  const stats=types.map(m=>{
    const g=tr.filter(t=>t.mgmt===m);
    const pnl=g.reduce((s,t)=>s+(t.res||0),0);
    const wr=g.length?Math.round(g.filter(t=>t.res>0).length/g.length*100):0;
    return {m,n:g.length,pnl,wr,idx:allTypes.indexOf(m)};
  });
  const fillC=stats.map(s=>gc(`--mgmt-type-${s.idx}`)||mgmtPal(s.idx,'tx'));
  const alphaC=stats.map(s=>gc(`--mgmt-type-${s.idx}-alpha`)||hexA(mgmtPal(s.idx,'tx'),.45));
  const bdC=stats.map(s=>gc(`--mgmt-type-${s.idx}-bd`)||mgmtPal(s.idx,'tx'));

  // 2 datasets (P&L / Win%) avec autant de barres que de types de management présents
  CH['mgmt']=new Chart(ctx,{type:'bar',
    data:{
      labels:stats.map(s=>`${s.m}\n(${s.n} T)`),
      datasets:[
        {label:'P&L (€)',data:stats.map(s=>s.pnl),backgroundColor:fillC,borderRadius:6,borderWidth:0,yAxisID:'yPnl'},
        {label:'Win Rate %',data:stats.map(s=>s.wr),backgroundColor:alphaC,borderRadius:6,borderWidth:2,borderColor:bdC,type:'bar',yAxisID:'yWr'}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'bottom',labels:{color:'#94a3b8',font:{size:9},boxWidth:10}},
        tooltip:{callbacks:{label:i=>i.datasetIndex===0?' P&L : '+(i.parsed.y>=0?'+':'')+i.parsed.y.toLocaleString('fr-FR')+'€':' Win Rate : '+i.parsed.y+'%'}}},
      scales:{
        x:{grid:{display:false},ticks:{color:axC,font:{size:9}}},
        yPnl:{position:'left',grid:{color:grC},ticks:{color:axC,callback:v=>(v>=0?'+':'')+v.toLocaleString('fr-FR')+'€',font:{size:8}}},
        yWr:{position:'right',grid:{display:false},min:0,max:100,ticks:{color:axC,callback:v=>v+'%',font:{size:8}}}
      }}});
}

// COMP
function drawComp(cid,chKey,trKey,period,pct,multi=false){
  const tr=btFilter(chKey,period);destroy(chKey);
  const map={};tr.forEach(t=>{const keys=multi&&t[trKey]?t[trKey].split(/[|,]/).map(s=>s.trim()).filter(Boolean):[t[trKey]||'?'];keys.forEach(k=>{if(!map[k])map[k]={pnl:0,wins:0,total:0};map[k].pnl+=(t.res||0);if(t.res>0)map[k].wins++;map[k].total++;});});
  const ks=Object.keys(map).sort((a,b)=>map[b].pnl-map[a].pnl).slice(0,20);
  const data=ks.map(k=>pct?Math.round(map[k].wins/map[k].total*100):map[k].pnl);if(!ks.length)return;
  const pk=chKey==='conf'?'conf':'comp';
  const posC=gc(`--${pk}-pos`)||'rgba(0,229,160,.8)',negC=gc(`--${pk}-neg`)||'rgba(239,68,68,.8)';
  const axC=gc('--comp-axis')||'#64748b',grC=gc('--comp-grid')||'rgba(100,116,139,.1)';
  const ctx=document.getElementById(cid).getContext('2d');
  CH[chKey]=new Chart(ctx,{type:'bar',data:{labels:ks,datasets:[{data,backgroundColor:data.map(v=>v>=0?posC:negC),borderRadius:4,borderWidth:0}]},
    options:{...CO,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>' '+(pct?i.parsed.x+'% ('+map[ks[i.dataIndex]].total+' T)':(i.parsed.x>=0?'+':'')+i.parsed.x.toLocaleString('fr-FR')+'€')}}},
      scales:{x:{grid:{color:grC},ticks:{color:axC,callback:v=>pct?v+'%':(v>=0?'+':'')+v+'€'},max:pct?100:undefined},y:{grid:{color:grC},ticks:{color:'#e2e8f0'}}}}});
}
function drawJours(period){
  const tr=btFilter('jours',period);destroy('jours');const JR=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const map={};tr.forEach(t=>{if(!t.date)return;const d=new Date(t.date+'T12:00:00');const j=JR[(d.getDay()+6)%7];if(!map[j])map[j]={pnl:0,wins:0,total:0};map[j].pnl+=(t.res||0);if(t.res>0)map[j].wins++;map[j].total++;});
  const ks=JR.filter(j=>map[j]),pct=MODE.jours;const data=ks.map(j=>pct?Math.round(map[j].wins/map[j].total*100):map[j].pnl);if(!ks.length)return;
  const posC=gc('--comp-pos')||'rgba(0,229,160,.8)',negC=gc('--comp-neg')||'rgba(239,68,68,.8)';
  const axC=gc('--comp-axis')||'#64748b',grC=gc('--comp-grid')||'rgba(100,116,139,.1)';
  const ctx=document.getElementById('cJours').getContext('2d');
  CH['jours']=new Chart(ctx,{type:'bar',data:{labels:ks,datasets:[{data,backgroundColor:data.map(v=>v>=0?posC:negC),borderRadius:4,borderWidth:0}]},
    options:{...CO,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>' '+(pct?i.parsed.x+'% ('+map[ks[i.dataIndex]].total+' T)':(i.parsed.x>=0?'+':'')+i.parsed.x.toLocaleString('fr-FR')+'€')}}},
      scales:{x:{grid:{color:grC},ticks:{color:axC,callback:v=>pct?v+'%':(v>=0?'+':'')+v+'€'},max:pct?100:undefined},y:{grid:{color:grC},ticks:{color:'#e2e8f0'}}}}});
}
function toggleMode(k){MODE[k]=!MODE[k];document.getElementById('tgl-'+k).classList.toggle('on',MODE[k]);
  if(k==='conf')drawComp('cConf','conf','conf',ST.conf,MODE.conf,true);
  else if(k==='pairs')drawComp('cPairs','pairs','paire',ST.pairs,MODE.pairs);
  else if(k==='sessions')drawComp('cSessions','sessions','session',ST.sessions,MODE.sessions);
  else if(k==='jours')drawJours(ST.jours);
  else if(k==='tf')drawComp('cTF','tf','tf',ST.tf,MODE.tf,true);}

function buildCompCharts(){
  const COMP=[{id:'cConf',key:'conf',title:'PAR CONFLUENCE',tvar:'--ct-comp-conf',multi:true,h:260},{id:'cPairs',key:'pairs',title:'PAR PAIRE / ACTIF',tvar:'--ct-comp-pairs',h:220},{id:'cSessions',key:'sessions',title:'PAR SESSION',tvar:'--ct-comp-sessions',h:200},{id:'cJours',key:'jours',title:'PAR JOUR DE SEMAINE',tvar:'--ct-comp-jours',h:180},{id:'cTF',key:'tf',title:'PAR TIMEFRAME',tvar:'--ct-comp-tf',multi:true,h:200}];
  document.getElementById('compCharts').innerHTML=COMP.map(c=>`
    <div class="chart-card" style="background:var(--comp-bg)">
      <div class="chart-header">
        <div class="chart-title" data-editable data-tvar="${c.tvar}" style="color:var(${c.tvar},#00e5a0)">${c.title}</div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <label class="bt-toggle"><input type="checkbox" id="bt-${c.key}" onchange="toggleBT('${c.key}')"> BT</label>
          <div class="tgl-wrap"><span>€</span><div class="tgl-track" id="tgl-${c.key}" onclick="toggleMode('${c.key}')"><div class="tgl-thumb"></div></div><span>%</span></div>
          <div class="period-btns">
            ${c.key!=='jours'?'<button class="pbtn" data-chart="'+c.key+'" data-p="jour">J</button><button class="pbtn" data-chart="'+c.key+'" data-p="semaine">SEM</button>':''}
            <button class="pbtn" data-chart="${c.key}" data-p="mois">MOIS</button>
            <button class="pbtn" data-chart="${c.key}" data-p="trimestre">TRIM</button>
            <button class="pbtn" data-chart="${c.key}" data-p="annee">AN</button>
            <button class="pbtn active" data-chart="${c.key}" data-p="tout">TOUT</button>
          </div>
        </div>
      </div>
      <div class="chart-body" style="height:${c.h}px"><canvas id="${c.id}"></canvas></div>
    </div>`).join('');
  bindPBtns();
}
function bindPBtns(){
  document.querySelectorAll('.pbtn').forEach(btn=>{
    btn.addEventListener('click',function(){
      const c=this.dataset.chart,p=this.dataset.p;if(!c)return;
      ST[c]=p;this.closest('.period-btns').querySelectorAll('.pbtn').forEach(b=>b.classList.remove('active'));this.classList.add('active');
      if(c==='eq')drawEquity(p);else if(c==='pnl')drawPnl(p);else if(c==='pie')drawPie(p);
      else if(c==='risk')drawRiskChart(p);else if(c==='mgmt')drawMgmt(p);
      else if(c==='conf')drawComp('cConf','conf','conf',p,MODE.conf,true);
      else if(c==='pairs')drawComp('cPairs','pairs','paire',p,MODE.pairs);
      else if(c==='sessions')drawComp('cSessions','sessions','session',p,MODE.sessions);
      else if(c==='jours')drawJours(p);
      else if(c==='tf')drawComp('cTF','tf','tf',p,MODE.tf,true);
    });
  });
}
function refreshAllCharts(){updateKPIs();drawEquity(ST.eq);drawPnl(ST.pnl);drawPie(ST.pie);drawRiskChart(ST.risk);drawMgmt(ST.mgmt);drawComp('cConf','conf','conf',ST.conf,MODE.conf,true);drawComp('cPairs','pairs','paire',ST.pairs,MODE.pairs);drawComp('cSessions','sessions','session',ST.sessions,MODE.sessions);drawJours(ST.jours);drawComp('cTF','tf','tf',ST.tf,MODE.tf,true);}

// ══ COLOR PICKER ══
let cpCB=null,cpH=0,cpS=1,cpL=.5,cpCX=1,cpCY=0,cpDrag=false;
const cpMem=ls('cp_mem',[]);
function hsl2hex(h,s,l){const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*c).toString(16).padStart(2,'0');};return'#'+f(0)+f(8)+f(4);}
function hex2hsl(hex){let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h,s,l=(mx+mn)/2;if(mx===mn){h=s=0;}else{const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}return[h*360,s,l];}
// Convertit rgb()/rgba() en #hex pour le color picker (ignore l'alpha)
function rgba2hex(c){
  if(!c)return null;
  c=c.trim();
  if(c.startsWith('#'))return c;
  const m=c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if(!m)return null;
  const h=n=>Math.max(0,Math.min(255,Math.round(parseFloat(n)))).toString(16).padStart(2,'0');
  return '#'+h(m[1])+h(m[2])+h(m[3]);
}
function drawSpec(){const c=document.getElementById('cpCanvas'),w=document.getElementById('cpWrap');c.width=w.offsetWidth||316;c.height=144;const ctx=c.getContext('2d');const gW=ctx.createLinearGradient(0,0,c.width,0);gW.addColorStop(0,'#fff');gW.addColorStop(1,`hsl(${cpH},100%,50%)`);ctx.fillStyle=gW;ctx.fillRect(0,0,c.width,c.height);const gB=ctx.createLinearGradient(0,0,0,c.height);gB.addColorStop(0,'rgba(0,0,0,0)');gB.addColorStop(1,'#000');ctx.fillStyle=gB;ctx.fillRect(0,0,c.width,c.height);}
function upCur(){const c=document.getElementById('cpCursor');c.style.left=(cpCX*100)+'%';c.style.top=(cpCY*100)+'%';}
function upPrev(){const hex=hsl2hex(cpH,cpS,cpL);document.getElementById('cpSwatch').style.background=hex;document.getElementById('cpHex').value=hex;}
function pickXY(x,y){const r=document.getElementById('cpWrap').getBoundingClientRect();cpCX=Math.max(0,Math.min(1,(x-r.left)/r.width));cpCY=Math.max(0,Math.min(1,(y-r.top)/r.height));cpS=cpCX;cpL=Math.max(.02,Math.min(.98,1-cpCY*.97));upCur();upPrev();}
function initColorPicker(){
  const w=document.getElementById('cpWrap');
  w.addEventListener('mousedown',e=>{cpDrag=true;pickXY(e.clientX,e.clientY);e.preventDefault();});
  w.addEventListener('touchstart',e=>{cpDrag=true;pickXY(e.touches[0].clientX,e.touches[0].clientY);e.preventDefault();},{passive:false});
  document.addEventListener('mousemove',e=>{if(cpDrag)pickXY(e.clientX,e.clientY);});
  document.addEventListener('touchmove',e=>{if(cpDrag)pickXY(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
  document.addEventListener('mouseup',()=>cpDrag=false);document.addEventListener('touchend',()=>cpDrag=false);
  document.getElementById('cpHue').addEventListener('input',function(){cpH=parseFloat(this.value);drawSpec();upPrev();});
  document.getElementById('cpHex').addEventListener('input',function(){if(/^#[0-9a-f]{6}$/i.test(this.value)){try{const[h,s,l]=hex2hsl(this.value);cpH=h;cpS=s;cpL=l;cpCX=s;cpCY=1-l;document.getElementById('cpHue').value=h;drawSpec();upCur();}catch(e){}document.getElementById('cpSwatch').style.background=this.value;}});
  setTimeout(applyPencilEdits,400);
}
function openCP(label,curHex,cb){
  cpCB=cb;document.getElementById('cpTitle').textContent=label||'COULEUR';
  try{if(curHex&&curHex.trim().startsWith('#')){const[h,s,l]=hex2hsl(curHex.trim());cpH=h;cpS=s;cpL=l;cpCX=s;cpCY=1-l;document.getElementById('cpHue').value=h;}}catch(e){}
  document.getElementById('cpOverlay').classList.add('open');
  requestAnimationFrame(()=>{drawSpec();upCur();upPrev();});
  document.getElementById('cpMem').innerHTML=[...cpMem].reverse().map(c=>`<div class="cp-ms" style="background:${c};border-color:${c}" onclick="cpSH('${c}')" title="${c}"></div>`).join('');
}
function cpSH(hex){try{const[h,s,l]=hex2hsl(hex);cpH=h;cpS=s;cpL=l;cpCX=s;cpCY=1-l;document.getElementById('cpHue').value=h;}catch(e){}drawSpec();upCur();upPrev();}
function cpCancel(){document.getElementById('cpOverlay').classList.remove('open');}
function cpConfirm(){const hex=document.getElementById('cpHex').value;if(!cpMem.includes(hex)){cpMem.push(hex);if(cpMem.length>22)cpMem.shift();lss('cp_mem',cpMem);}if(cpCB)cpCB(hex);document.getElementById('cpOverlay').classList.remove('open');}

// ══ THEME ══
function buildTV(){return [
  // ══ Général ══
  {v:'--bg',l:'Fond principal',page:'Général',section:'Fond & structure'},
  
  {v:'--row-hover',l:'Survol lignes',page:'Général',section:'Fond & structure'},{v:'--nav-bg',l:'Nav fond',page:'Général',section:'Navigation'},
  {v:'--nav-border',l:'Nav bordure',page:'Général',section:'Navigation'},{v:'--nav-logo',l:'Logo',page:'Général',section:'Navigation'},
  {v:'--session-bg',l:'Session fond',page:'Général',section:'Navigation'},{v:'--session-border',l:'Session bordure',page:'Général',section:'Navigation'},
  {v:'--session-text',l:'Session texte',page:'Général',section:'Navigation'},{v:'--badge-t-bg',l:'Badge Trades fond',page:'Général',section:'Navigation'},
  {v:'--badge-t-bd',l:'Badge Trades bord',page:'Général',section:'Navigation'},{v:'--badge-t-tx',l:'Badge Trades texte',page:'Général',section:'Navigation'},
  {v:'--badge-p-bg',l:'Badge P&L fond',page:'Général',section:'Navigation'},{v:'--badge-p-bd',l:'Badge P&L bord',page:'Général',section:'Navigation'},
  {v:'--badge-p-pos-tx',l:'Badge P&L texte (positif)',page:'Général',section:'Navigation'},{v:'--badge-p-neg-tx',l:'Badge P&L texte (négatif)',page:'Général',section:'Navigation'},{v:'--badge-r-bg',l:'Badge Risk fond',page:'Général',section:'Navigation'},
  {v:'--badge-r-bd',l:'Badge Risk bord',page:'Général',section:'Navigation'},{v:'--badge-r-tx',l:'Badge Risk texte',page:'Général',section:'Navigation'},
  {v:'--btn-deco-bg',l:'Bouton déconnexion - fond',page:'Général',section:'Navigation'},{v:'--btn-deco-bd',l:'Bouton déconnexion - bordure',page:'Général',section:'Navigation'},
  {v:'--btn-deco-tx',l:'Bouton déconnexion - texte',page:'Général',section:'Navigation'},{v:'--text',l:'Texte principal',page:'Général',section:'Texte & accents'},
  
  
  {v:'--btn-p-bg',l:'Bouton principal - fond',page:'Général',section:'Boutons génériques'},
  {v:'--btn-p-tx',l:'Bouton principal - texte',page:'Général',section:'Boutons génériques'},{v:'--btn-g-bg',l:'Bouton Non - fond',page:'Général',section:'Boutons génériques'},
  {v:'--btn-g-bd',l:'Bouton Non - bordure',page:'Général',section:'Boutons génériques'},{v:'--btn-g-tx',l:'Bouton Non - texte',page:'Général',section:'Boutons génériques'},
  {v:'--btn-d-bg',l:'Bouton Oui - fond',page:'Général',section:'Boutons génériques'},{v:'--btn-d-bd',l:'Bouton Oui - bordure',page:'Général',section:'Boutons génériques'},
  {v:'--btn-d-tx',l:'Bouton Oui - texte',page:'Général',section:'Boutons génériques'},{v:'--acc-menu-bg',l:'Menu comptes - fond',page:'Général',section:'Menu comptes'},
  {v:'--acc-menu-bd',l:'Menu comptes - bordure',page:'Général',section:'Menu comptes'},{v:'--acc-menu-tx',l:'Menu comptes - texte principal',page:'Général',section:'Menu comptes'},
  {v:'--acc-menu-tx2',l:'Menu comptes - texte secondaire',page:'Général',section:'Menu comptes'},{v:'--msg-success',l:'Message succès (ex: Sauvegardé)',page:'Général',section:'Messages système'},
  {v:'--msg-error',l:'Message erreur',page:'Général',section:'Messages système'},{v:'--msg-warning',l:'Message avertissement',page:'Général',section:'Messages système'},
  {v:'--msg-neutral',l:'Message neutre',page:'Général',section:'Messages système'},{v:'--msg-banner-bg',l:'Bandeau erreur - fond',page:'Général',section:'Messages système'},
  {v:'--msg-banner-tx',l:'Bandeau erreur - texte',page:'Général',section:'Messages système'},
  // ══ Connexion ══
  {v:'--auth-bg',l:'Connexion fond',page:'Connexion',section:'Écran de connexion'},{v:'--auth-title',l:'Connexion titre',page:'Connexion',section:'Écran de connexion'},
  {v:'--auth-sub',l:'Connexion sous-titre',page:'Connexion',section:'Écran de connexion'},{v:'--auth-btn-bg',l:'Bouton continuer fond',page:'Connexion',section:'Écran de connexion'},
  {v:'--auth-btn-tx',l:'Bouton continuer texte',page:'Connexion',section:'Écran de connexion'},{v:'--auth-input-bg',l:'Champ email fond',page:'Connexion',section:'Écran de connexion'},
  {v:'--auth-input-bd',l:'Champ email bordure',page:'Connexion',section:'Écran de connexion'},{v:'--btn-newgoogle-bg',l:'Lien secondaire - fond',page:'Connexion',section:'Écran de connexion'},
  {v:'--btn-newgoogle-bd',l:'Lien secondaire - bordure',page:'Connexion',section:'Écran de connexion'},{v:'--btn-newgoogle-tx',l:'Lien secondaire - texte',page:'Connexion',section:'Écran de connexion'},
  {v:'--pin-btn-bg',l:'Touche PIN fond',page:'Connexion',section:'Code PIN'},{v:'--pin-btn-bd',l:'Touche PIN bordure',page:'Connexion',section:'Code PIN'},
  {v:'--pin-btn-tx',l:'Touche PIN texte',page:'Connexion',section:'Code PIN'},{v:'--pin-dot-off',l:'Point PIN inactif',page:'Connexion',section:'Code PIN'},
  {v:'--pin-dot-on',l:'Point PIN actif',page:'Connexion',section:'Code PIN'},
  // ══ Track Record ══
  {v:'--kpi1',l:'Capital',page:'Track Record',section:'KPI'},{v:'--kpi2',l:'P&L Total',page:'Track Record',section:'KPI'},
  {v:'--kpi3',l:'Win Rate',page:'Track Record',section:'KPI'},{v:'--kpi4',l:'RR Moyen',page:'Track Record',section:'KPI'},
  {v:'--kpi5',l:'Profit Factor',page:'Track Record',section:'KPI'},{v:'--kpi6',l:'Pay Out',page:'Track Record',section:'KPI'},
  {v:'--kpi7',l:'Trades',page:'Track Record',section:'KPI'},{v:'--kpi8',l:'Risk Actuel',page:'Track Record',section:'KPI'},
  {v:'--kpi9',l:'Drawdown Max',page:'Track Record',section:'KPI'},{v:'--pc-positif',l:'Points positifs',page:'Analyse IA',section:'Points Clés'},
  {v:'--pc-negatif',l:'Points négatifs',page:'Analyse IA',section:'Points Clés'},{v:'--eq-bg',l:'Fond',page:'Track Record',section:'Évolution du capital'},
  {v:'--eq-line',l:'Courbe',page:'Track Record',section:'Évolution du capital'},{v:'--eq-fill-top',l:'Dégradé haut',page:'Track Record',section:'Évolution du capital'},
  {v:'--eq-fill-bot',l:'Dégradé bas',page:'Track Record',section:'Évolution du capital'},{v:'--eq-axis',l:'Axes',page:'Track Record',section:'Évolution du capital'},
  {v:'--eq-grid',l:'Grille',page:'Track Record',section:'Évolution du capital'},{v:'--ct-evolution',l:'Titre',page:'Track Record',section:'Évolution du capital'},
  {v:'--pnl-bg',l:'Fond',page:'Track Record',section:'P&L'},
  {v:'--pnl-bar-pos',l:'Positif',page:'Track Record',section:'P&L'},{v:'--pnl-bar-neg',l:'Négatif',page:'Track Record',section:'P&L'},
  {v:'--pnl-axis',l:'Axes',page:'Track Record',section:'P&L'},{v:'--pnl-grid',l:'Grille',page:'Track Record',section:'P&L'},
  {v:'--ct-pnl',l:'Titre',page:'Track Record',section:'P&L'},
  {v:'--risk-bg',l:'Fond',page:'Track Record',section:'Risk Management (graphique)'},{v:'--risk-line',l:'Courbe',page:'Track Record',section:'Risk Management (graphique)'},
  {v:'--risk-fill-top',l:'Dégradé haut',page:'Track Record',section:'Risk Management (graphique)'},{v:'--risk-fill-bot',l:'Dégradé bas',page:'Track Record',section:'Risk Management (graphique)'},
  {v:'--risk-base',l:'Ligne de base',page:'Track Record',section:'Risk Management (graphique)'},{v:'--risk-axis',l:'Axes',page:'Track Record',section:'Risk Management (graphique)'},
  {v:'--risk-grid',l:'Grille',page:'Track Record',section:'Risk Management (graphique)'},{v:'--ct-riskmgmt',l:'Titre',page:'Track Record',section:'Risk Management (graphique)'},
  {v:'--pie-win',l:'Gagnants',page:'Track Record',section:'Win Rate'},
  {v:'--pie-lose',l:'Perdants',page:'Track Record',section:'Win Rate'},{v:'--pie-neutral',l:'Nuls',page:'Track Record',section:'Win Rate'},
  {v:'--ct-winrate',l:'Titre',page:'Track Record',section:'Win Rate'},
  {v:'--mgmt-bg',l:'Fond',page:'Track Record',section:'Comparaison du Management'},
  {v:'--mgmt-axis',l:'Axes',page:'Track Record',section:'Comparaison du Management'},
  {v:'--mgmt-grid',l:'Grille',page:'Track Record',section:'Comparaison du Management'},
  {v:'--ct-mgmtimpact',l:'Titre',page:'Track Record',section:'Comparaison du Management'},
  ...(APP.lists.mgmt_opts||[]).flatMap((m,i)=>[
    {v:`--mgmt-type-${i}`,l:`${m} — P&L fond`,page:'Track Record',section:'Comparaison du Management'},
    {v:`--mgmt-type-${i}-alpha`,l:`${m} — Win% fond`,page:'Track Record',section:'Comparaison du Management'},
    {v:`--mgmt-type-${i}-bd`,l:`${m} — Win% bordure`,page:'Track Record',section:'Comparaison du Management'}
  ]),
  {v:'--comp-bg',l:'Fond',page:'Track Record',section:'Comparaisons'},
  {v:'--comp-pos',l:'Positif',page:'Track Record',section:'Comparaisons'},{v:'--comp-neg',l:'Négatif',page:'Track Record',section:'Comparaisons'},
  {v:'--comp-axis',l:'Axes',page:'Track Record',section:'Comparaisons'},{v:'--comp-grid',l:'Grille',page:'Track Record',section:'Comparaisons'},
  {v:'--conf-pos',l:'Conf. positif',page:'Track Record',section:'Comparaisons'},{v:'--conf-neg',l:'Conf. négatif',page:'Track Record',section:'Comparaisons'},
  {v:'--ct-comp-conf',l:'Titre — Par confluence',page:'Track Record',section:'Comparaisons'},{v:'--ct-comp-pairs',l:'Titre — Par paire / actif',page:'Track Record',section:'Comparaisons'},
  {v:'--ct-comp-sessions',l:'Titre — Par session',page:'Track Record',section:'Comparaisons'},{v:'--ct-comp-jours',l:'Titre — Par jour de semaine',page:'Track Record',section:'Comparaisons'},
  {v:'--ct-comp-tf',l:'Titre — Par timeframe',page:'Track Record',section:'Comparaisons'},
  // ══ Journal de trading ══
  {v:'--tag-long-bg',l:'LONG fond',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-long-tx',l:'LONG texte',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-long-bd',l:'LONG bordure',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-short-bg',l:'SHORT fond',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-short-tx',l:'SHORT texte',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-short-bd',l:'SHORT bordure',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-oui-bg',l:'OUI fond',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-oui-tx',l:'OUI texte',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-oui-bd',l:'OUI bordure',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-non-bg',l:'NON fond',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-non-tx',l:'NON texte',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-non-bd',l:'NON bordure',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-peut-bg',l:'PEUT-ÊTRE fond',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-peut-tx',l:'PEUT-ÊTRE texte',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-peut-bd',l:'PEUT-ÊTRE bordure',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-na-bg',l:'N/A fond',page:'Journal de trading',section:'Historique des trades'},
  {v:'--tag-na-tx',l:'N/A texte',page:'Journal de trading',section:'Historique des trades'},{v:'--tag-na-bd',l:'N/A bordure',page:'Journal de trading',section:'Historique des trades'},
  ...(APP.lists.mgmt_opts||[]).flatMap((m,i)=>[
    {v:`--tag-mgmt-${i}-bg`,l:`${m} — fond`,page:'Journal de trading',section:'Management'},
    {v:`--tag-mgmt-${i}-tx`,l:`${m} — texte`,page:'Journal de trading',section:'Management'},
    {v:`--tag-mgmt-${i}-bd`,l:`${m} — bordure`,page:'Journal de trading',section:'Management'}
  ]),
  {v:'--result-pos',l:'Résultats positifs (journal)',page:'Journal de trading',section:'Historique des trades'},{v:'--result-neg',l:'Résultats négatifs (journal)',page:'Journal de trading',section:'Historique des trades'},
  {v:'--bt-bg',l:'Badge Backtest - fond',page:'Journal de trading',section:'Historique des trades'},{v:'--bt-tx',l:'Badge Backtest - texte',page:'Journal de trading',section:'Historique des trades'},
  {v:'--chip-h-bg',l:'Chip survol fond',page:'Journal de trading',section:'Formulaire nouveau trade'},{v:'--chip-h-bd',l:'Chip survol bord',page:'Journal de trading',section:'Formulaire nouveau trade'},
  {v:'--chip-h-tx',l:'Chip survol texte',page:'Journal de trading',section:'Formulaire nouveau trade'},{v:'--chip-s-bg',l:'Chip sel. fond',page:'Journal de trading',section:'Formulaire nouveau trade'},
  {v:'--chip-s-bd',l:'Chip sel. bord',page:'Journal de trading',section:'Formulaire nouveau trade'},{v:'--chip-s-tx',l:'Chip sel. texte',page:'Journal de trading',section:'Formulaire nouveau trade'},
  {v:'--btn-img-bg',l:'Image fond',page:'Journal de trading',section:'Formulaire nouveau trade'},{v:'--btn-img-bd',l:'Image bordure',page:'Journal de trading',section:'Formulaire nouveau trade'},
  {v:'--btn-img-tx',l:'Image texte',page:'Journal de trading',section:'Formulaire nouveau trade'},
  // ══ Calendrier ══
  {v:'--cal-bg',l:'Fond',page:'Calendrier',section:'Calendrier'},{v:'--cal-nav-text',l:'Texte Mois / Année',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-pos-bg',l:'Jour + fond',page:'Calendrier',section:'Calendrier'},{v:'--cal-pos-bd',l:'Jour + bordure',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-neg-bg',l:'Jour − fond',page:'Calendrier',section:'Calendrier'},{v:'--cal-neg-bd',l:'Jour − bordure',page:'Calendrier',section:'Calendrier'},
  // ══ Analyse IA ══
  {v:'--ia-user-bg',l:'Bulle question - fond',page:'Analyse IA',section:'Conversation'},{v:'--ia-user-tx',l:'Bulle question - texte',page:'Analyse IA',section:'Conversation'},
  {v:'--ia-bot-bg',l:'Bulle réponse - fond',page:'Analyse IA',section:'Conversation'},{v:'--ia-bot-bd',l:'Bulle réponse - bordure',page:'Analyse IA',section:'Conversation'},
  {v:'--ia-bot-tx',l:'Bulle réponse - texte',page:'Analyse IA',section:'Conversation'},{v:'--ia-empty-tx',l:'Message avant la premiere question',page:'Analyse IA',section:'Conversation'},
  // ══ Paramètres ══
  {v:'--state-capital',l:'Capital actuel (modif.)',page:'Paramètres',section:'État actuel'},{v:'--state-winstreak',l:'Win streak (modif.)',page:'Paramètres',section:'État actuel'},
  {v:'--state-tf',l:'Timeframes (journal)',page:'Paramètres',section:'État actuel'},{v:'--risk-euro-tx',l:'Risk €/trade couleur',page:'Paramètres',section:'État actuel'},
  {v:'--rm-up-border',l:'Risk Mgmt - Bordure (monte)',page:'Paramètres',section:'Risk Management (réglages)'},{v:'--rm-up-text',l:'Risk Mgmt - Texte (monte)',page:'Paramètres',section:'Risk Management (réglages)'},
  {v:'--rm-down-border',l:'Risk Mgmt - Bordure (descend)',page:'Paramètres',section:'Risk Management (réglages)'},{v:'--rm-down-text',l:'Risk Mgmt - Texte (descend)',page:'Paramètres',section:'Risk Management (réglages)'},
  {v:'--tgl-off',l:'Toggle off',page:'Paramètres',section:'Interrupteurs'},{v:'--tgl-on',l:'Toggle on',page:'Paramètres',section:'Interrupteurs'},
  {v:'--tgl-thumb',l:'Toggle rond',page:'Paramètres',section:'Interrupteurs'},{v:'--btn-pin-bg',l:'Changer PIN - fond',page:'Paramètres',section:'Sécurité'},
  {v:'--btn-pin-bd',l:'Changer PIN - bordure',page:'Paramètres',section:'Sécurité'},{v:'--btn-pin-tx',l:'Changer PIN - texte',page:'Paramètres',section:'Sécurité'},
  {v:'--btn-export-bg',l:'Export - fond',page:'Paramètres',section:'Sauvegarde locale'},{v:'--btn-export-bd',l:'Export - bordure',page:'Paramètres',section:'Sauvegarde locale'},
  {v:'--btn-export-tx',l:'Export - texte',page:'Paramètres',section:'Sauvegarde locale'},{v:'--btn-import-bg',l:'Import - fond',page:'Paramètres',section:'Sauvegarde locale'},
  {v:'--btn-import-bd',l:'Import - bordure',page:'Paramètres',section:'Sauvegarde locale'},{v:'--btn-import-tx',l:'Import - texte',page:'Paramètres',section:'Sauvegarde locale'},
  {v:'--btn-delall-bg',l:'Supprimer tout - fond',page:'Paramètres',section:'Suppression des trades'},{v:'--btn-delall-bd',l:'Supprimer tout - bordure',page:'Paramètres',section:'Suppression des trades'},
  {v:'--btn-delall-tx',l:'Supprimer tout - texte',page:'Paramètres',section:'Suppression des trades'},{v:'--btn-save-bg',l:'Sauvegarder - fond (PC)',page:'Paramètres',section:'Bouton Sauvegarder'},
  {v:'--btn-save-bg-mobile',l:'Sauvegarder - fond (mobile)',page:'Paramètres',section:'Bouton Sauvegarder'},{v:'--btn-save-bd',l:'Sauvegarder - bordure',page:'Paramètres',section:'Bouton Sauvegarder'},
  {v:'--btn-save-tx',l:'Sauvegarder - texte (PC)',page:'Paramètres',section:'Bouton Sauvegarder'},{v:'--btn-save-tx-mobile',l:'Sauvegarder - texte (mobile)',page:'Paramètres',section:'Bouton Sauvegarder'},
  {v:'--mt-paires',l:'Titre Paires',page:'Paramètres',section:'Listes personnalisables'},{v:'--mt-sessions',l:'Titre Sessions',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--mt-confluences',l:'Titre Confluences',page:'Paramètres',section:'Listes personnalisables'},{v:'--mt-timeframes',l:'Titre TF',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--mt-mgmt',l:'Titre Mgmt',page:'Paramètres',section:'Listes personnalisables'},{v:'--mt-reprend',l:'Titre Reprend.',page:'Paramètres',section:'Listes personnalisables'},
  // ══ Variables individuelles supplémentaires (séparation complète, aucune couleur partagée) ══
  // Général > Fond & structure
  
  // Général > Menu comptes
  {v:'--acc-item-borderbott',l:'.acc-item — bordure',page:'Général',section:'Menu comptes'},{v:'--acc-item-active-acc-background',l:'.acc-item.active-acc — fond',page:'Général',section:'Menu comptes'},
  {v:'--acc-item-dots-color',l:'.acc-item-dots — texte',page:'Général',section:'Menu comptes'},{v:'--acc-item-dots-hover-background',l:'.acc-item-dots:hover — fond',page:'Général',section:'Menu comptes'},
  {v:'--acc-item-dots-hover-color',l:'.acc-item-dots:hover — texte',page:'Général',section:'Menu comptes'},{v:'--acc-add-btn-color',l:'.acc-add-btn — texte',page:'Général',section:'Menu comptes'},
  {v:'--acc-add-btn-hover-background',l:'.acc-add-btn:hover — fond',page:'Général',section:'Menu comptes'},
  // Général > Navigation
  {v:'--nav-tab-color',l:'.nav-tab — texte',page:'Général',section:'Navigation'},{v:'--nav-tab-hover-color',l:'.nav-tab:hover — texte',page:'Général',section:'Navigation'},
  {v:'--nav-tab-active-color',l:'.nav-tab.active — texte',page:'Général',section:'Navigation'},{v:'--nav-tab-active-borderbott',l:'.nav-tab.active — bordure',page:'Général',section:'Navigation'},
  {v:'--clock-city-color',l:'.clock-city — texte',page:'Général',section:'Navigation'},{v:'--clock-time-color',l:'.clock-time — texte',page:'Général',section:'Navigation'},
  {v:'--hamburger-border',l:'.hamburger — bordure',page:'Général',section:'Navigation'},{v:'--hamburger-color',l:'.hamburger — texte',page:'Général',section:'Navigation'},
  {v:'--mobile-menu-nav-tab-border',l:'.mobile-menu .nav-tab — bordure',page:'Général',section:'Navigation'},{v:'--mobile-menu-nav-tab-borderbott',l:'.mobile-menu .nav-tab — bordure',page:'Général',section:'Navigation'},
  // Général > Mode stylo
  {v:'--pencil-hover-outline',l:'Contour au survol (avant de cliquer)',page:'Général',section:'Mode stylo'},{v:'--pencil-toolbar-bg',l:'Barre d\'outils - fond',page:'Général',section:'Mode stylo'},
  {v:'--pencil-toolbar-border',l:'Barre d\'outils - bordure',page:'Général',section:'Mode stylo'},{v:'--pencilfontsize-background',l:'#pencilFontSize — fond',page:'Général',section:'Mode stylo'},
  {v:'--pencilfontsize-border',l:'#pencilFontSize — bordure',page:'Général',section:'Mode stylo'},{v:'--pencilfontsize-color',l:'#pencilFontSize — texte',page:'Général',section:'Mode stylo'},
  {v:'--pencilcolorswatch-border',l:'#pencilColorSwatch — bordure',page:'Général',section:'Mode stylo'},
  // Général > Titres de page
  // Général > Titres de page — supprimé : chaque page a maintenant son propre titre (voir sections "Titre de page" par page)
  // Général > Cartes
  {v:'--card-background',l:'.card — fond',page:'Général',section:'Cartes'},{v:'--card-border',l:'.card — bordure',page:'Général',section:'Cartes'},
  {v:'--card-header-background',l:'.card-header — fond',page:'Général',section:'Cartes'},{v:'--card-header-borderbott',l:'.card-header — bordure',page:'Général',section:'Cartes'},
  // (.card-title — supprimé : chaque carte a maintenant son propre titre individuel)
  // Général > Champs de formulaire
  {v:'--fg-label-color',l:'.fg label — texte',page:'Général',section:'Champs de formulaire'},{v:'--fg-input-fg-select-fg-textarea-background',l:'.fg input,.fg select,.fg textarea — fond',page:'Général',section:'Champs de formulaire'},
  {v:'--fg-input-fg-select-fg-textarea-border',l:'.fg input,.fg select,.fg textarea — bordure',page:'Général',section:'Champs de formulaire'},{v:'--fg-input-fg-select-fg-textarea-color',l:'.fg input,.fg select,.fg textarea — texte',page:'Général',section:'Champs de formulaire'},
  {v:'--fg-input-focus-fg-select-focus-fg-t-bordercolo',l:'.fg input:focus,.fg select:focus,.fg textarea:focus — bordure',page:'Général',section:'Champs de formulaire'},{v:'--fg-select-option-background',l:'.fg select option — fond',page:'Général',section:'Champs de formulaire'},
  // Général > Chips (sélecteurs)
  {v:'--chip-background',l:'.chip — fond',page:'Général',section:'Chips (sélecteurs)'},{v:'--chip-border',l:'.chip — bordure',page:'Général',section:'Chips (sélecteurs)'},
  // Général > Boutons génériques
  {v:'--btn-g-hover-bordercolo',l:'.btn-g:hover — bordure',page:'Général',section:'Boutons génériques'},{v:'--btn-g-hover-color',l:'.btn-g:hover — texte',page:'Général',section:'Boutons génériques'},
  // Journal de trading > Historique des trades
  {v:'--thead-th-color',l:'thead th — texte',page:'Journal de trading',section:'Historique des trades'},{v:'--thead-th-borderbott',l:'thead th — bordure',page:'Journal de trading',section:'Historique des trades'},
  {v:'--thead-th-background',l:'thead th — fond',page:'Journal de trading',section:'Historique des trades'},{v:'--del-btn-color',l:'.del-btn — texte',page:'Journal de trading',section:'Historique des trades'},
  {v:'--del-btn-hover-color',l:'.del-btn:hover — texte',page:'Journal de trading',section:'Historique des trades'},{v:'--empty-state-color',l:'.empty-state — texte',page:'Journal de trading',section:'Historique des trades'},
  {v:'--undo-toast-background',l:'.undo-toast — fond',page:'Journal de trading',section:'Historique des trades'},{v:'--undo-toast-border',l:'.undo-toast — bordure',page:'Journal de trading',section:'Historique des trades'},
  {v:'--undo-toast-color',l:'.undo-toast — texte',page:'Journal de trading',section:'Historique des trades'},{v:'--undo-toast-btn-border',l:'.undo-toast-btn — bordure',page:'Journal de trading',section:'Historique des trades'},
  {v:'--undo-toast-btn-color',l:'.undo-toast-btn — texte',page:'Journal de trading',section:'Historique des trades'},
  // Track Record > KPI
  {v:'--kpi-strip-background',l:'.kpi-strip — fond',page:'Track Record',section:'KPI'},{v:'--kpi-card-background',l:'.kpi-card — fond',page:'Track Record',section:'KPI'},
  {v:'--kl-capital',l:'Libellé — Capital',page:'Track Record',section:'KPI'},{v:'--kl-pnltotal',l:'Libellé — P&L Total',page:'Track Record',section:'KPI'},
  {v:'--kl-winrate',l:'Libellé — Win Rate',page:'Track Record',section:'KPI'},{v:'--kl-rrmoyen',l:'Libellé — RR Moyen',page:'Track Record',section:'KPI'},
  {v:'--kl-profitfactor',l:'Libellé — Profit Factor',page:'Track Record',section:'KPI'},{v:'--kl-payout',l:'Libellé — Pay Out',page:'Track Record',section:'KPI'},
  {v:'--kl-trades',l:'Libellé — Trades',page:'Track Record',section:'KPI'},{v:'--kl-riskactuel',l:'Libellé — Risk Actuel',page:'Track Record',section:'KPI'},
  {v:'--kl-drawdown',l:'Libellé — Drawdown Max',page:'Track Record',section:'KPI'},
  // Track Record > Cartes graphiques
  {v:'--chart-card-border',l:'.chart-card — bordure',page:'Track Record',section:'Cartes graphiques'},{v:'--chart-header-background',l:'.chart-header — fond',page:'Track Record',section:'Cartes graphiques'},
  {v:'--chart-header-borderbott',l:'.chart-header — bordure',page:'Track Record',section:'Cartes graphiques'},
  // Track Record > Titre de page
  {v:'--pt-trackrecord',l:'Titre de la page',page:'Track Record',section:'Titre de page'},{v:'--ps-trackrecord',l:'Sous-titre de la page',page:'Track Record',section:'Titre de page'},
  // Journal de trading > Formulaire nouveau trade
  {v:'--bt-toggle-color',l:'.bt-toggle — texte',page:'Journal de trading',section:'Formulaire nouveau trade'},
  // Général > Interrupteurs et filtres
  {v:'--pbtn-border',l:'.pbtn — bordure',page:'Général',section:'Interrupteurs et filtres'},{v:'--pbtn-color',l:'.pbtn — texte',page:'Général',section:'Interrupteurs et filtres'},
  {v:'--pbtn-hover-bordercolo',l:'.pbtn:hover — bordure',page:'Général',section:'Interrupteurs et filtres'},{v:'--pbtn-hover-color',l:'.pbtn:hover — texte',page:'Général',section:'Interrupteurs et filtres'},
  {v:'--pbtn-active-background',l:'.pbtn.active — fond',page:'Général',section:'Interrupteurs et filtres'},{v:'--pbtn-active-bordercolo',l:'.pbtn.active — bordure',page:'Général',section:'Interrupteurs et filtres'},
  {v:'--tgl-wrap-color',l:'.tgl-wrap — texte',page:'Général',section:'Interrupteurs et filtres'},
  // Analyse IA > Conversation
  
  
  {v:'--pc-icon-btn-background',l:'.pc-icon-btn — fond',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-icon-btn-border',l:'.pc-icon-btn — bordure',page:'Analyse IA',section:'Conversation'},{v:'--pc-icon-btn-color',l:'.pc-icon-btn — texte',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-icon-btn-hover-bordercolo',l:'.pc-icon-btn:hover — bordure',page:'Analyse IA',section:'Conversation'},{v:'--pc-icon-btn-hover-color',l:'.pc-icon-btn:hover — texte',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-chat-title-bar-color',l:'.pc-chat-title-bar — texte',page:'Analyse IA',section:'Conversation'},{v:'--pc-conv-panel-background',l:'.pc-conv-panel — fond',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-conv-panel-borderrigh',l:'.pc-conv-panel — border-right',page:'Analyse IA',section:'Conversation'},{v:'--pc-conv-header-borderbott',l:'.pc-conv-header — bordure',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-conv-header-title-color',l:'.pc-conv-header-title — texte',page:'Analyse IA',section:'Conversation'},{v:'--pc-conv-item-color',l:'.pc-conv-item — texte',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-conv-item-hover-background',l:'.pc-conv-item:hover — fond',page:'Analyse IA',section:'Conversation'},{v:'--pc-conv-item-active-background',l:'.pc-conv-item.active — fond',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-conv-item-active-border',l:'.pc-conv-item.active — bordure',page:'Analyse IA',section:'Conversation'},{v:'--pc-conv-item-del-hover-color',l:'.pc-conv-item-del:hover — texte',page:'Analyse IA',section:'Conversation'},
  {v:'--pc-conv-empty-color',l:'.pc-conv-empty — texte',page:'Analyse IA',section:'Conversation'},
  // Calendrier > Calendrier
  {v:'--cal-nav-surface-background',l:'.cal-nav-surface — fond',page:'Calendrier',section:'Calendrier'},{v:'--cal-nav-surface-border',l:'.cal-nav-surface — bordure',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-arr-background',l:'.cal-arr — fond',page:'Calendrier',section:'Calendrier'},{v:'--cal-arr-border',l:'.cal-arr — bordure',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-arr-color',l:'.cal-arr — texte',page:'Calendrier',section:'Calendrier'},{v:'--cal-arr-hover-bordercolo',l:'.cal-arr:hover — bordure',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-arr-hover-color',l:'.cal-arr:hover — texte',page:'Calendrier',section:'Calendrier'},{v:'--cal-month-block-background',l:'.cal-month-block — fond',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-month-block-border',l:'.cal-month-block — bordure',page:'Calendrier',section:'Calendrier'},{v:'--cal-month-header-background',l:'.cal-month-header — fond',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-month-header-borderbott',l:'.cal-month-header — bordure',page:'Calendrier',section:'Calendrier'},{v:'--cal-month-header-color',l:'.cal-month-header — texte',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-month-header-cur-color',l:'.cal-month-header.cur — texte',page:'Calendrier',section:'Calendrier'},{v:'--cal-dow-color',l:'.cal-dow — texte',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-day-border',l:'.cal-day — bordure',page:'Calendrier',section:'Calendrier'},{v:'--cal-day-today-bordercolo',l:'.cal-day.today — bordure',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-day-today-boxshadow',l:'.cal-day.today — box-shadow',page:'Calendrier',section:'Calendrier'},{v:'--cal-day-num-color',l:'.cal-day-num — texte',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-day-pos-cal-day-num-color',l:'.cal-day.pos .cal-day-num — texte',page:'Calendrier',section:'Calendrier'},{v:'--cal-day-neg-cal-day-num-color',l:'.cal-day.neg .cal-day-num — texte',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-day-pos-cal-pnl-color',l:'.cal-day.pos .cal-pnl — texte',page:'Calendrier',section:'Calendrier'},{v:'--cal-day-neg-cal-pnl-color',l:'.cal-day.neg .cal-pnl — texte',page:'Calendrier',section:'Calendrier'},
  {v:'--cal-rr-cal-tc-color',l:'.cal-rr,.cal-tc — texte',page:'Calendrier',section:'Calendrier'},
  // Général > Sélecteur de couleur
  {v:'--cp-modal-background',l:'.cp-modal — fond',page:'Général',section:'Sélecteur de couleur'},{v:'--cp-modal-border',l:'.cp-modal — bordure',page:'Général',section:'Sélecteur de couleur'},
  {v:'--cp-title-color',l:'.cp-title — texte',page:'Général',section:'Sélecteur de couleur'},{v:'--cp-sw-border',l:'.cp-sw — bordure',page:'Général',section:'Sélecteur de couleur'},
  {v:'--cp-hue-lbl-color',l:'.cp-hue-lbl — texte',page:'Général',section:'Sélecteur de couleur'},{v:'--cp-swatch-border',l:'.cp-swatch — bordure',page:'Général',section:'Sélecteur de couleur'},
  {v:'--cp-hex-background',l:'.cp-hex — fond',page:'Général',section:'Sélecteur de couleur'},{v:'--cp-hex-border',l:'.cp-hex — bordure',page:'Général',section:'Sélecteur de couleur'},
  {v:'--cp-hex-color',l:'.cp-hex — texte',page:'Général',section:'Sélecteur de couleur'},{v:'--cp-hex-focus-bordercolo',l:'.cp-hex:focus — bordure',page:'Général',section:'Sélecteur de couleur'},
  {v:'--cp-mem-lbl-color',l:'.cp-mem-lbl — texte',page:'Général',section:'Sélecteur de couleur'},{v:'--cp-ms-border',l:'.cp-ms — bordure',page:'Général',section:'Sélecteur de couleur'},
  {v:'--cp-ms-hover-bordercolo',l:'.cp-ms:hover — bordure',page:'Général',section:'Sélecteur de couleur'},{v:'--cp-collapse-btn-hover-bordercolo',l:'.cp-collapse-btn:hover — bordure',page:'Général',section:'Sélecteur de couleur'},
  {v:'--cp-collapse-btn-hover-color',l:'.cp-collapse-btn:hover — texte',page:'Général',section:'Sélecteur de couleur'},
  // Paramètres > Listes personnalisables
  {v:'--mod-col-background',l:'.mod-col — fond',page:'Paramètres',section:'Listes personnalisables'},{v:'--mod-col-border',l:'.mod-col — bordure',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--mod-col-hdr-background',l:'.mod-col-hdr — fond',page:'Paramètres',section:'Listes personnalisables'},{v:'--mod-col-hdr-borderbott',l:'.mod-col-hdr — bordure',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--mod-item-background',l:'.mod-item — fond',page:'Paramètres',section:'Listes personnalisables'},{v:'--drag-h-color',l:'.drag-h — texte',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--del-item-color',l:'.del-item — texte',page:'Paramètres',section:'Listes personnalisables'},{v:'--del-item-hover-color',l:'.del-item:hover — texte',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--mod-add-bordertop',l:'.mod-add — border-top',page:'Paramètres',section:'Listes personnalisables'},{v:'--mod-add-input-background',l:'.mod-add input — fond',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--mod-add-input-border',l:'.mod-add input — bordure',page:'Paramètres',section:'Listes personnalisables'},{v:'--mod-add-input-color',l:'.mod-add input — texte',page:'Paramètres',section:'Listes personnalisables'},
  {v:'--mod-add-input-focus-bordercolo',l:'.mod-add input:focus — bordure',page:'Paramètres',section:'Listes personnalisables'},{v:'--mod-add-button-background',l:'.mod-add button — fond',page:'Paramètres',section:'Listes personnalisables'},
  // Général > Éditeur de thème
  {v:'--te-search-background',l:'.te-search — fond',page:'Général',section:'Éditeur de thème'},{v:'--te-search-border',l:'.te-search — bordure',page:'Général',section:'Éditeur de thème'},
  {v:'--te-search-color',l:'.te-search — texte',page:'Général',section:'Éditeur de thème'},{v:'--te-page-border',l:'.te-page — bordure',page:'Général',section:'Éditeur de thème'},
  {v:'--te-page-background',l:'.te-page — fond',page:'Général',section:'Éditeur de thème'},{v:'--te-page-title-color',l:'.te-page-title — texte',page:'Général',section:'Éditeur de thème'},
  {v:'--te-page-title-before-color',l:'.te-page-title::before — texte',page:'Général',section:'Éditeur de thème'},{v:'--te-sec-title-color',l:'.te-sec-title — texte',page:'Général',section:'Éditeur de thème'},
  {v:'--te-sec-title-borderbott',l:'.te-sec-title — bordure',page:'Général',section:'Éditeur de thème'},{v:'--te-swatch-border',l:'.te-swatch — bordure',page:'Général',section:'Éditeur de thème'},
  {v:'--te-swatch-hover-bordercolo',l:'.te-swatch:hover — bordure',page:'Général',section:'Éditeur de thème'},
  // Général > Divers
  {v:'--tgl-row-color',l:'.tgl-row — texte',page:'Général',section:'Divers'},
  // Général > Boîtes de dialogue
  {v:'--confirm-box-background',l:'.confirm-box — fond',page:'Général',section:'Boîtes de dialogue'},{v:'--confirm-box-border',l:'.confirm-box — bordure',page:'Général',section:'Boîtes de dialogue'},
  {v:'--confirm-box-h3-color',l:'.confirm-box h3 — texte',page:'Général',section:'Boîtes de dialogue'},{v:'--confirm-box-p-color',l:'.confirm-box p — texte',page:'Général',section:'Boîtes de dialogue'},
  {v:'--alert-color',l:'.alert — texte',page:'Général',section:'Boîtes de dialogue'},
  // Général > Pied de page
  {v:'--footer-color',l:'.footer — texte',page:'Général',section:'Pied de page'},
  {v:'--winrate-slice-border',l:'Bordure des tranches',page:'Track Record',section:'Win Rate'},{v:'--loading-screen-bg',l:'Fond',page:'Général',section:'Écran de chargement'},
  {v:'--winrate-body-bg',l:'Fond (zone autour du donut)',page:'Track Record',section:'Win Rate'},
  {v:'--state-card-bg',l:'Fond',page:'Paramètres',section:'État actuel'},{v:'--state-card-border',l:'Bordure',page:'Paramètres',section:'État actuel'},
  {v:'--top5-row-border',l:'Bordure entre les trades',page:'Track Record',section:'Top 5 trades'},{v:'--pc-resume-border',l:'Bordure (résumé & recommandations)',page:'Analyse IA',section:'Points Clés'},
  // Ces 6 variables restent partagées par plusieurs endroits (texte statique HTML/JS non encore
  // individualisé) — les modifier peut donc affecter plusieurs zones à la fois, contrairement au reste.
  {v:'--surface',l:'Fond secondaire (usage partagé)',page:'Général',section:'Fond & structure'},{v:'--card',l:'Fond de carte (usage partagé)',page:'Général',section:'Fond & structure'},
  {v:'--border',l:'Bordure (usage partagé)',page:'Général',section:'Fond & structure'},{v:'--muted',l:'Texte atténué (usage partagé)',page:'Général',section:'Texte & accents'},
  {v:'--green',l:'Accent vert (usage partagé)',page:'Général',section:'Texte & accents'},{v:'--red',l:'Accent rouge (usage partagé)',page:'Général',section:'Texte & accents'},
  // Titres individuels restants (pages + cartes)
  {v:'--crt-top5',l:'Titre — Top 5 trades',page:'Track Record',section:'Top 5 trades'},{v:'--crt-pires5',l:'Titre — Pires 5 trades',page:'Track Record',section:'Top 5 trades'},
  {v:'--pt-journal',l:'Titre de la page',page:'Journal de trading',section:'Titre de page'},{v:'--crt-assistant',l:'Titre — Assistant Journal',page:'Journal de trading',section:'Assistant Journal'},
  {v:'--crt-nouveautrade',l:'Titre — Nouveau Trade',page:'Journal de trading',section:'Formulaire nouveau trade'},{v:'--crt-historique',l:'Titre — Historique des trades',page:'Journal de trading',section:'Historique des trades'},
  {v:'--pt-calendrier',l:'Titre de la page',page:'Calendrier',section:'Titre de page'},
  {v:'--pt-modifs',l:'Titre de la page',page:'Paramètres',section:'Titre de page'},{v:'--crt-capitalrisk',l:'Titre — Capital & Risk',page:'Paramètres',section:'État actuel'},
  {v:'--crt-riskreglages',l:'Titre — Risk Management Réglages',page:'Paramètres',section:'Risk Management (réglages)'},{v:'--crt-securite',l:'Titre — Sécurité',page:'Paramètres',section:'Sécurité'},
  {v:'--crt-sauvegarde',l:'Titre — Sauvegarde locale',page:'Paramètres',section:'Sauvegarde locale'},{v:'--crt-themestylo',l:'Titre — Thème & Mode Stylo',page:'Paramètres',section:'Thème & Mode Stylo'},
  {v:'--pt-pointscles',l:'Titre de la page',page:'Analyse IA',section:'Titre de page'},{v:'--crt-resume',l:'Titre — Résumé & Recommandations',page:'Analyse IA',section:'Points Clés'},
  ...getAccounts().flatMap((acc,i)=>[{v:`--acc-item-bg-${i+1}`,l:`${acc.name} - fond`,page:'Général',section:'Menu comptes'},{v:`--acc-item-bd-${i+1}`,l:`${acc.name} - bordure`,page:'Général',section:'Menu comptes'}]),
];}
let teVals={},teHist=[];
function toggleTE(){const ed=document.getElementById('themeEditor');const o=ed.style.display==='none';ed.style.display=o?'block':'none';if(o)renderTE();}
function renderTE(){
  ensureMgmtThemeDefaults();
  ensureTitleThemeDefaults();
  const TV=buildTV();
  const s=getComputedStyle(document.documentElement);
  TV.forEach(tv=>{if(teVals[tv.v]===undefined)teVals[tv.v]=s.getPropertyValue(tv.v).trim()||'#000000';});

  const query=(document.getElementById('teSearch')?.value||'').trim().toLowerCase();

  // page -> section -> [tv...], en conservant l'ordre d'apparition dans TV
  const pages=new Map();
  TV.forEach(tv=>{
    if(!pages.has(tv.page))pages.set(tv.page,new Map());
    const sections=pages.get(tv.page);
    if(!sections.has(tv.section))sections.set(tv.section,[]);
    sections.get(tv.section).push(tv);
  });

  const html=[...pages.entries()].map(([page,sections])=>{
    const sectionEntries=[...sections.entries()].map(([section,items])=>{
      const matched=query?items.filter(tv=>(tv.l+' '+section+' '+page).toLowerCase().includes(query)):items;
      return [section,matched];
    }).filter(([,items])=>items.length);
    if(query && !sectionEntries.length) return '';
    const openAttr=query?'open':'';
    return `<details class="te-page" ${openAttr}>
      <summary class="te-page-title">${page}</summary>
      <div class="te-grid-inner">
        ${sectionEntries.map(([section,items])=>`<div>
          <div class="te-sec-title">${section}</div>
          ${items.map(tv=>`<div class="te-row"><div class="te-label">${tv.l}</div><div class="te-swatch" style="background:${rgba2hex(teVals[tv.v])||teVals[tv.v]}" onclick="teOCP('${tv.v}','${tv.l}')"></div></div>`).join('')}
        </div>`).join('')}
      </div>
    </details>`;
  }).join('');

  document.getElementById('teGrid').innerHTML = html || '<div style="padding:12px;color:var(--muted);font-size:12px;">Aucun réglage ne correspond à ta recherche.</div>';
}
// Extrait l'alpha d'une couleur rgba(), ou null si pas de canal alpha / hex
function getAlpha(c){
  if(!c)return null;
  const m=c.trim().match(/rgba\([^)]+,\s*([\d.]+)\s*\)/);
  return m?parseFloat(m[1]):null;
}
// Convertit hex + alpha en rgba()
function hexToRgbaWithAlpha(hex,alpha){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function teOCP(v,l){
  const prev=teVals[v]||'#000000';
  const hex=rgba2hex(prev)||'#000000';
  const alpha=getAlpha(prev);
  openCP(l,hex,newHex=>{
    teHist.push({...teVals});
    teVals[v]=alpha!==null?hexToRgbaWithAlpha(newHex,alpha):newHex;
    renderTE();
    applyTheme(); // applique + sauvegarde + synchronise tout de suite, pas besoin d'un clic "Appliquer" séparé
  });
}
function applyTheme(){
  Object.entries(teVals).forEach(([v,c])=>document.documentElement.style.setProperty(v,c));
  lss('tj_theme_vars',teVals);
  try { refreshAllCharts(); } catch(e) { console.warn('refreshAllCharts a échoué (sauvegarde/synchro non bloquées) :', e); }
  if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}
}
function undoTheme(){if(!teHist.length)return;teVals=teHist.pop();renderTE();applyTheme();}
function askResetTheme(){showConfirm('Réinitialiser','Supprimer toutes les personnalisations ?',()=>{teVals={};lss('tj_theme_vars',{});document.documentElement.removeAttribute('style');renderTE();refreshAllCharts();if(typeof currentUser!=="undefined"&&currentUser&&!_isSyncing){schedulePush(300);}});}
function loadSavedTheme(){const s=ls('tj_theme_vars',null);if(s){Object.entries(s).forEach(([v,c])=>document.documentElement.style.setProperty(v,c));teVals=s;}ensureMgmtThemeDefaults();ensureTitleThemeDefaults();}

// ══ INIT ══
// ── INIT inside DOMContentLoaded ──
document.addEventListener('DOMContentLoaded',function(){
  initColorPicker();
  loadSavedTheme();
  buildCompCharts();
  bindPBtns();
  renderPayouts();
  document.getElementById('f-date').value=new Date().toISOString().split('T')[0];
  populateSelects();
  renderTable();
  updateNavBadges();
  const smart=SMART();
  document.getElementById('tglSmart').classList.toggle('on',smart);
  document.getElementById('smartLbl').textContent=smart?'Activé':'Désactivé';
  document.getElementById('riskCard').style.display=smart?'':'none';
  // Toggle RR Pris auto : toujours activé (ON) au chargement initial
  const fTgl=document.getElementById('f-tglRrAuto');
  if(fTgl){fTgl.classList.add('on');const g=document.getElementById('f-rrpris-group');if(g)g.style.display='none';}
  // Charts drawn with a small delay to ensure canvas dimensions are ready
  setTimeout(function(){
    refreshAllCharts();
  }, 80);
  window.addEventListener('resize',function(){
    if(document.getElementById('page-modifs').classList.contains('active'))applyMobileModState();
    // Redraw charts on resize
    setTimeout(refreshAllCharts, 200);
  });
});

// ── EDIT TRADE ──
let _editId = null;
function openEditTrade(id){
  id = parseInt(id, 10);
  const t = APP.trades.find(x=>x.id===id);
  if(!t){console.warn('Trade non trouvé:',id, APP.trades.map(x=>x.id));return;}
  _editId = id;
  const sv = (id, val) => { const el = document.getElementById(id); if(el) el.value = val||''; };
  sv('e-date', t.date);
  sv('e-heure', t.heure);
  sv('e-res', t.res);
  sv('e-rrcible', t.rrCible);
  sv('e-rrpris', t.rrPris);
  const eTgl=document.getElementById('e-tglRrAuto');
  const eGroup=document.getElementById('e-rrpris-group');
  const eIsAuto=t.rrAuto!==false;
  if(eTgl){eTgl.classList.toggle('on',eIsAuto);}
  if(eGroup){eGroup.style.display=eIsAuto?'none':'';}
  sv('e-notes', t.notes);
  autoGrow(document.getElementById('e-notes'));
  sv('e-stars', t.stars);
  [['e-paire',APP.lists.paires],['e-session',APP.lists.sessions],
   ['e-mgmt',APP.lists.mgmt_opts],['e-reprend',APP.lists.reprend_opts]].forEach(([elId,items])=>{
    const s=document.getElementById(elId);
    if(!s)return;
    s.innerHTML='<option value="">—</option>'+(items||[]).map(i=>`<option>${i}</option>`).join('');
  });
  const sv2 = (id, val) => { const el = document.getElementById(id); if(el) el.value = val||''; };
  setTimeout(()=>{ sv2('e-dir', t.dir); sv2('e-session', t.session); sv2('e-paire', t.paire); }, 10);
  sv2('e-mgmt', t.mgmt);
  sv2('e-reprend', t.reprend);
  const ebt=document.getElementById('e-backtest');if(ebt)ebt.checked=!!t.backtest;
  sv2('e-stars', t.stars||0);
  window._editImages=[];
  renderEditImages(t.images||[]);
  const selTf  = (t.tf||'').split(/[|,]/).map(s=>s.trim()).filter(Boolean);
  const selConf= (t.conf||'').split(/[|,]/).map(s=>s.trim()).filter(Boolean);
  const tfList = APP.lists.timeframes||DEF.timeframes||[];
  const confList = APP.lists.confluences||DEF.confluences||[];
  document.getElementById('e-tf-wrap').innerHTML =
    tfList.map(tf=>`<div class="chip${selTf.includes(tf)?' sel':''}" data-v="${tf}" onclick="this.classList.toggle('sel')">${tf}</div>`).join('');
  document.getElementById('e-conf-wrap').innerHTML =
    confList.map(c=>`<div class="chip${selConf.includes(c)?' sel':''}" data-v="${c}" onclick="this.classList.toggle('sel')">${c}</div>`).join('');
  document.getElementById('editModal').classList.add('open');
  // Init étoiles après ouverture du modal
  setTimeout(()=>initStarPicker('e-stars-picker','e-stars',t.stars||0),60);
}
function renderEditImages(existing){
  const wrap=document.getElementById('e-images-wrap');
  if(!wrap)return;
  wrap.innerHTML=(existing||[]).map((src,i)=>`<div style="position:relative;display:inline-block;margin:4px;">
    <img src="${src}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:zoom-in;" onclick="openFullscreen(this.src)">
    <button onclick="removeExistingImg(${i})" style="position:absolute;top:2px;right:2px;background:#ef4444;color:#fff;border:none;border-radius:3px;padding:1px 5px;cursor:pointer;font-size:10px;">×</button>
  </div>`).join('')+
  (window._editImages||[]).map((src,i)=>`<div style="position:relative;display:inline-block;margin:4px;">
    <img src="${src}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;border:1px solid #4f8ef7;cursor:zoom-in;" onclick="openFullscreen(this.src)">
    <button onclick="removeNewImg(${i})" style="position:absolute;top:2px;right:2px;background:#ef4444;color:#fff;border:none;border-radius:3px;padding:1px 5px;cursor:pointer;font-size:10px;">×</button>
  </div>`).join('');
}
function removeExistingImg(i){
  const t=APP.trades.find(x=>x.id===_editId);
  if(t&&t.images){
    const [removed]=t.images.splice(i,1);
    if(typeof deleteTradeImageFromStorage==='function') deleteTradeImageFromStorage(removed);
  }
  renderEditImages(t?t.images:[]);
}
function removeNewImg(i){
  const removed=(window._editImages||[])[i];
  if(typeof deleteTradeImageFromStorage==='function') deleteTradeImageFromStorage(removed);
  (window._editImages||[]).splice(i,1);
  const t=APP.trades.find(x=>x.id===_editId);
  renderEditImages(t?t.images:[]);
}
function addEditImage(){
  const inp=document.getElementById('e-img-input');
  if(!inp||!inp.files||!inp.files.length)return;
  Array.from(inp.files).forEach(file=>{
    const reader=new FileReader();
    reader.onload=async e=>{
      if(!window._editImages)window._editImages=[];
      const compressed = (typeof compressImage === 'function') ? await compressImage(e.target.result) : e.target.result;
      const finalSrc = (typeof uploadTradeImageToStorage === 'function') ? await uploadTradeImageToStorage(compressed) : compressed;
      window._editImages.push(finalSrc);
      const t=APP.trades.find(x=>x.id===_editId);
      renderEditImages(t?t.images:[]);
    };
    reader.readAsDataURL(file);
  });
  inp.value='';
}
function closeEditTrade(){
  document.getElementById('editModal').classList.remove('open');
  _editId=null;
}
// Exposer sur window pour les onclick inline dans renderTable
window.openEditTrade = openEditTrade;
window.deleteTrade = deleteTrade;
window.viewTradeImages = viewTradeImages;
window.deleteTradeImage = deleteTradeImage;
function saveEditTrade(){markUserAction();
  const t = APP.trades.find(x=>x.id===_editId);
  if(!t){closeEditTrade();return;}
  t.date     = document.getElementById('e-date').value;
  t.heure    = document.getElementById('e-heure').value;
  t.session  = document.getElementById('e-session').value;
  t.paire    = document.getElementById('e-paire').value;
  t.dir      = document.getElementById('e-dir').value;
  t.rrCible  = parseFloat(document.getElementById('e-rrcible').value)||0;
  t.rrAuto   = document.getElementById('e-tglRrAuto')?.classList.contains('on') !== false;
  t.rrPris   = parseFloat(document.getElementById('e-rrpris').value)||0;
  t.res      = parseFloat(document.getElementById('e-res').value)||0;
  t.mgmt     = document.getElementById('e-mgmt').value;
  t.reprend  = document.getElementById('e-reprend').value;
  t.backtest = document.getElementById('e-backtest')?.checked||false;
  const notesEl = document.getElementById('e-notes'); t.notes = notesEl ? notesEl.value : (t.notes||'');
  const starsEl = document.getElementById('e-stars'); t.stars = starsEl ? parseFloat(starsEl.value)||0 : 0;
  t.tf  = Array.from(document.querySelectorAll('#e-tf-wrap .chip.sel')).map(c=>c.dataset.v).join('|');
  t.conf= Array.from(document.querySelectorAll('#e-conf-wrap .chip.sel')).map(c=>c.dataset.v).join('|');
  // Gestion images
  const newImgs=window._editImages||[];
  if(!t.images)t.images=[];
  t.images=[...t.images,...newImgs];
  window._editImages=[];
  saveState(); renderTable(); updateNavBadges();
  if(document.getElementById('page-trackrecord').classList.contains('active')) setTimeout(refreshAllCharts,50);
  closeEditTrade();
}
