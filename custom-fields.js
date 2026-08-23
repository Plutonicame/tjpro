// ══════════════════════════════════════════════════════════════════════════
// CUSTOM FIELDS — Champs personnalisés (TJP)
// ──────────────────────────────────────────────────────────────────────────
// Module 100% additif : ne modifie AUCUNE fonction existante par édition
// directe. Il surcharge (wrap) certaines fonctions globales et construit le
// reste au runtime (DOM). Pour désactiver entièrement cette fonctionnalité,
// il suffit de retirer la balise <script src="custom-fields.js"> — aucun
// autre fichier n'est touché.
//
// Permet à l'utilisateur, depuis Paramètres :
//  - de créer des questions custom (format : étoiles / texte / nombre /
//    menu déroulant / case à cocher / date), placées où il veut dans le
//    questionnaire "Nouveau Trade" (et dans "Modifier le trade") ;
//  - chaque question crée une colonne dans l'historique des trades, dont on
//    choisit le nom et la position (parmi les colonnes existantes + les
//    nouvelles) ;
//  - chaque question peut en plus créer un widget dans le Track Record :
//    case KPI, widget carré/rond/rectangle, courbe, barres verticales,
//    barres horizontales ou camembert — et être réordonnée avec les KPI /
//    graphiques déjà existants ;
//  - chaque nouveau widget ajoute automatiquement ses réglages de couleur
//    dans l'éditeur de thème.
// ══════════════════════════════════════════════════════════════════════════

// ── Référentiels des éléments natifs (pour les ancrages de position) ──
const CF_BUILTIN_COLS = [
  {id:'date',label:'Date'},{id:'heure',label:'Heure'},{id:'session',label:'Session'},
  {id:'paire',label:'Paire'},{id:'dir',label:'Dir.'},{id:'tf',label:'TF'},
  {id:'conf',label:'Confluences'},{id:'rrcible',label:'RR Cible'},{id:'rrpris',label:'RR Réalisé'},
  {id:'res',label:'Résultat'},{id:'pct',label:'%'},{id:'mgmt',label:'Mgmt'},
  {id:'reprend',label:'Reprend.'},{id:'stars',label:'Note'},{id:'img',label:'📷'}
];
const CF_BUILTIN_FORM_ANCHORS = [
  {id:'date',label:'Date'},{id:'heure',label:'Heure'},{id:'session',label:'Session'},
  {id:'paire',label:'Paire / Actif'},{id:'dir',label:'Direction'},{id:'rrcible',label:'RR Cible'},
  {id:'res',label:'Résultat'},{id:'mgmt',label:'Management'},{id:'reprend',label:'Reprendrais-tu ?'},
  {id:'tf',label:'Timeframes'},{id:'conf',label:'Confluences'},{id:'notes',label:'Notes'},{id:'stars',label:'Note ⭐'}
];
const CF_BUILTIN_KPIS = [
  {id:'kpi1',label:'Capital'},{id:'kpi2',label:'P&L Total'},{id:'kpi3',label:'Win Rate'},
  {id:'kpi4',label:'RR Moyen'},{id:'kpi5',label:'Profit Factor'},{id:'kpi6',label:'Pay Out'},
  {id:'kpi7',label:'Trades'},{id:'kpi8',label:'Risk Actuel'},{id:'kpi9',label:'Drawdown Max'}
];
const CF_BUILTIN_CHARTS = [
  {id:'eq',label:'Évolution du capital'},{id:'pnl',label:'P&L'},{id:'risk',label:'Risk Management'},
  {id:'pie',label:'Win Rate'},{id:'mgmt',label:'Impact du management'},
  {id:'conf',label:'Par confluence'},{id:'pairs',label:'Par paire / actif'},
  {id:'sessions',label:'Par session'},{id:'jours',label:'Par jour de semaine'},{id:'tf',label:'Par timeframe'}
];
// Graphiques natifs à largeur FIXE de 1/2 sur PC (les autres graphiques
// natifs sont pleine largeur ; les camemberts ont une largeur dynamique
// selon leur nombre). Top5/Pires5 ne font plus partie de ce conteneur (voir
// #cfBottomRow), donc pas concernés ici.
const CF_HALF_WIDTH_NATIVE = new Set(['mgmt']);
const CF_TYPE_META = {
  stars:{label:'Note en étoiles (1 à 5)', widgets:['none','kpi','card','bar-v','bar-h','pie']},
  text:{label:'Zone de texte', widgets:['none']},
  number:{label:'Nombre', widgets:['none','kpi','card','line']},
  select:{label:'Menu déroulant', widgets:['none','kpi','card','bar-v','bar-h','pie']},
  toggle:{label:'Case à cocher (Oui/Non)', widgets:['none','kpi','card','bar-v','bar-h','pie']},
  date:{label:'Date', widgets:['none','kpi','card']}
};
const CF_WIDGET_META = {
  none:{label:'Aucun'},
  kpi:{label:'Case KPI (bande fine, en haut)'},
  card:{label:'Widget (carré / rond / rectangle)'},
  line:{label:'Courbe'},
  'bar-v':{label:'Barres verticales'},
  'bar-h':{label:'Barres horizontales'},
  pie:{label:'Camembert'}
};
const CF_CHART_WIDGET_KINDS = ['card','line','bar-v','bar-h','pie'];

// ── Chargement / sauvegarde ──
function cfLoad(){
  const cfg = lsAcc('tj_cf_config', null);
  APP.cfFields = (cfg && Array.isArray(cfg.fields)) ? cfg.fields : [];
  APP.cfColOrder = (cfg && Array.isArray(cfg.colOrder)) ? cfg.colOrder : null;
  APP.cfKpiOrder = (cfg && Array.isArray(cfg.kpiOrder)) ? cfg.kpiOrder : null;
  APP.cfChartOrder = (cfg && Array.isArray(cfg.chartOrder)) ? cfg.chartOrder : null;
  APP.cfPencilStyles = (cfg && cfg.pencilStyles && typeof cfg.pencilStyles==='object') ? cfg.pencilStyles : {};
}
function cfConfigSnapshot(){
  return {fields:APP.cfFields, colOrder:APP.cfColOrder, kpiOrder:APP.cfKpiOrder, chartOrder:APP.cfChartOrder, pencilStyles:APP.cfPencilStyles};
}
function cfPersist(){
  lssAcc('tj_cf_config', cfConfigSnapshot());
  if(typeof currentUser!=='undefined' && currentUser && !_isSyncing){schedulePush(300);}
}
function cfNewId(){
  return 'cf_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
}
function cfInsertIntoOrder(orderArr, id, afterId){
  const idx=orderArr.indexOf(id);
  if(idx!==-1)orderArr.splice(idx,1);
  if(afterId==='__start__'){ orderArr.unshift(id); return; } // choix explicite "— Au début —"
  if(afterId){
    const pos=orderArr.indexOf(afterId);
    if(pos!==-1){orderArr.splice(pos+1,0,id);return;}
  }
  orderArr.push(id); // par défaut ("— À la fin —") ou ancre introuvable : on ajoute à la fin
}
function cfEnsureOrders(){
  if(!APP.cfColOrder)APP.cfColOrder=CF_BUILTIN_COLS.map(c=>c.id);
  if(!APP.cfKpiOrder)APP.cfKpiOrder=CF_BUILTIN_KPIS.map(k=>k.id);
  if(!APP.cfChartOrder)APP.cfChartOrder=CF_BUILTIN_CHARTS.map(c=>c.id);
  const kpiFieldIds=new Set(APP.cfFields.filter(f=>f.widget&&f.widget.kind==='kpi').map(f=>f.id));
  const chartFieldIds=new Set(APP.cfFields.filter(f=>f.widget&&CF_CHART_WIDGET_KINDS.includes(f.widget.kind)).map(f=>f.id));
  const allFieldIds=new Set(APP.cfFields.map(f=>f.id));
  APP.cfFields.forEach(f=>{ if(!APP.cfColOrder.includes(f.id))APP.cfColOrder.push(f.id); });
  kpiFieldIds.forEach(id=>{ if(!APP.cfKpiOrder.includes(id))APP.cfKpiOrder.push(id); });
  chartFieldIds.forEach(id=>{ if(!APP.cfChartOrder.includes(id))APP.cfChartOrder.push(id); });
  const builtinColIds=new Set(CF_BUILTIN_COLS.map(c=>c.id));
  const builtinKpiIds=new Set(CF_BUILTIN_KPIS.map(k=>k.id));
  const builtinChartIds=new Set(CF_BUILTIN_CHARTS.map(c=>c.id));
  APP.cfColOrder=APP.cfColOrder.filter(id=>builtinColIds.has(id)||allFieldIds.has(id));
  APP.cfKpiOrder=APP.cfKpiOrder.filter(id=>builtinKpiIds.has(id)||kpiFieldIds.has(id));
  APP.cfChartOrder=APP.cfChartOrder.filter(id=>builtinChartIds.has(id)||chartFieldIds.has(id));
}
// Initialisation IMMÉDIATE et synchrone (pas de setTimeout / DOMContentLoaded
// ici) : APP existe déjà (const APP=loadState(); s'est exécuté avant que ce
// script ne charge), mais le propre code d'init de l'app appelle renderTable()
// / refreshAllCharts() de façon synchrone dès son propre DOMContentLoaded,
// AVANT que notre init différée (cfInit, plus bas) n'ait eu la moindre chance
// de s'exécuter. Sans cet appel immédiat, APP.cfFields resterait `undefined`
// pendant la toute première passe de rendu native → erreur au chargement.
cfLoad();
cfEnsureOrders();

// ── Stats sur les trades pour un champ custom ──
function cfDisplayValue(field,t){
  const v=t['cf_'+field.id];
  if(field.type==='toggle')return v?'Oui':(v===false?'Non':undefined);
  return v;
}
function cfNumericStats(field,trades){
  const list=trades||realTrades();
  const vals=list.map(t=>t['cf_'+field.id]).filter(v=>v!==undefined&&v!==null&&v!==''&&!isNaN(parseFloat(v))).map(v=>parseFloat(v));
  const sum=vals.reduce((a,b)=>a+b,0);
  return {vals,count:vals.length,avg:vals.length?sum/vals.length:0,sum};
}
function cfCategoryStats(field,trades){
  const list=trades||realTrades();
  const map={};
  list.forEach(t=>{
    const raw=cfDisplayValue(field,t);
    if(raw===undefined||raw===null||raw==='')return;
    const v=String(raw);
    if(!map[v])map[v]={pnl:0,wins:0,total:0};
    map[v].pnl+=(t.res||0);
    if(t.res>0)map[v].wins++;
    map[v].total++;
  });
  return map;
}
// Nombre de tranches à prévoir pour un camembert (thème + dessin), selon le
// nombre RÉEL de réponses possibles pour ce champ (pas une valeur figée) :
// menu déroulant -> nombre d'options configurées ; étoiles -> 5 ; case à
// cocher -> 2 (Oui/Non).
function cfPieSliceCount(field){
  if(field.type==='select')return Math.max(1,(field.options||[]).length);
  if(field.type==='stars')return 5;
  if(field.type==='toggle')return 2;
  return 6;
}
// Ordre stable des catégories d'un camembert : pour un menu déroulant, on
// respecte l'ordre des options telles que configurées (tranche 1 = 1ère
// option, etc.) plutôt que l'ordre d'apparition dans les données, pour que
// les couleurs choisies dans le thème restent toujours associées à la même
// réponse.
function cfPieCategoryOrder(field,map){
  if(field.type==='select'&&field.options&&field.options.length){
    const ordered=field.options.filter(o=>map[o]);
    Object.keys(map).forEach(k=>{ if(!ordered.includes(k))ordered.push(k); });
    return ordered;
  }
  return Object.keys(map);
}
function cfKpiValueText(field){
  if(field.type==='stars'||field.type==='number'){
    const {avg,count}=cfNumericStats(field);
    if(!count)return '—';
    return avg.toFixed(field.type==='stars'?1:2)+(field.type==='stars'?' ★':'');
  }
  if(field.type==='text'){
    const c=realTrades().filter(t=>t['cf_'+field.id]).length;
    return c+' réponse'+(c>1?'s':'');
  }
  const map=cfCategoryStats(field);
  const ks=Object.keys(map);
  if(!ks.length)return '—';
  ks.sort((a,b)=>map[b].total-map[a].total);
  return ks[0]+' ('+map[ks[0]].total+')';
}

// ── Rendu des champs dans les formulaires (Nouveau Trade / Modifier) ──
function cfInputId(prefix,field){return prefix+'-cf-'+field.id;}
function cfFieldInputHtml(prefix,field){
  const id=cfInputId(prefix,field);
  const labelText=escapeHtml(field.label);
  const labelHtml=`<label data-editable data-cf-custom-label="1" id="${cfLabelId(prefix,field)}" data-cf-field-id="${field.id}">${labelText}</label>`;
  if(field.type==='text'){
    return `<div class="fg spanall cf-field" id="${id}-wrap">${labelHtml}<textarea id="${id}" class="cf-input" oninput="autoGrow(this)"></textarea></div>`;
  }
  if(field.type==='number'){
    return `<div class="fg cf-field" id="${id}-wrap">${labelHtml}<input type="number" step="any" id="${id}" class="cf-input"></div>`;
  }
  if(field.type==='date'){
    return `<div class="fg cf-field" id="${id}-wrap">${labelHtml}<input type="date" id="${id}" class="cf-input"></div>`;
  }
  if(field.type==='select'){
    const opts=(field.options||[]).map(o=>`<option>${escapeHtml(o)}</option>`).join('');
    return `<div class="fg cf-field" id="${id}-wrap">${labelHtml}<select id="${id}" class="cf-input"><option value="">—</option>${opts}</select></div>`;
  }
  if(field.type==='toggle'){
    return `<div class="fg cf-field" id="${id}-wrap">${labelHtml}<div style="display:flex;align-items:center;height:34px;"><input type="checkbox" id="${id}" class="cf-input" style="width:18px;height:18px;cursor:pointer;"></div></div>`;
  }
  if(field.type==='stars'){
    return `<div class="fg spanall cf-field" id="${id}-wrap">${labelHtml}
      <div class="star-picker" id="${id}-picker" data-val="0">
        <span class="star-pick" data-v="1">★</span><span class="star-pick" data-v="2">★</span><span class="star-pick" data-v="3">★</span><span class="star-pick" data-v="4">★</span><span class="star-pick" data-v="5">★</span>
      </div><input type="hidden" id="${id}" class="cf-input" value="0"></div>`;
  }
  return '';
}
function cfLabelId(prefix,field){ return 'cflabel'+prefix+'-'+field.id; }
function cfReadInput(prefix,field){
  const el=document.getElementById(cfInputId(prefix,field));
  if(!el)return undefined;
  if(field.type==='toggle')return !!el.checked;
  if(field.type==='number')return el.value===''?'':parseFloat(el.value);
  return el.value;
}
function cfSetInputValue(prefix,field,val){
  const id=cfInputId(prefix,field);
  const el=document.getElementById(id);
  if(!el)return;
  if(field.type==='toggle'){el.checked=!!val;return;}
  if(field.type==='stars'){if(typeof initStarPicker==='function')initStarPicker(id+'-picker',id,val||0);return;}
  el.value=(val===undefined||val===null)?'':val;
}
function cfBuiltinAnchorEl(prefix,anchorId){
  const specialWrap={tf:(prefix==='f'?'tf-wrap':'e-tf-wrap'),conf:(prefix==='f'?'conf-wrap':'e-conf-wrap')};
  if(specialWrap[anchorId]){const w=document.getElementById(specialWrap[anchorId]);return w?w.closest('.fg'):null;}
  if(anchorId==='stars'){const w=document.getElementById(prefix+'-stars-picker');return w?w.closest('.fg'):null;}
  const inp=document.getElementById(prefix+'-'+anchorId);
  return inp?inp.closest('.fg'):null;
}
function cfInjectFormFields(prefix){
  const grid=prefix==='f'?document.querySelector('#page-journal .form-grid'):document.querySelector('#editModal .form-grid');
  if(!grid)return;
  grid.querySelectorAll('.cf-field').forEach(el=>el.remove());
  const remaining=APP.cfFields.slice();
  let guard=0;
  while(remaining.length&&guard++<50){
    let progressed=false;
    for(let i=0;i<remaining.length;i++){
      const f=remaining[i];
      const anchor=f.afterField;
      let anchorEl=null,isStart=false;
      if(anchor==='__start__'){isStart=true;}
      else if(!anchor){ /* "— À la fin —" (par défaut) : reste en attente, traité par le passage final ci-dessous */ }
      else if(anchor.indexOf('cf_')===0){anchorEl=document.getElementById(prefix+'-cf-'+anchor+'-wrap');}
      else{anchorEl=cfBuiltinAnchorEl(prefix,anchor);}
      if(isStart||anchorEl){
        const html=cfFieldInputHtml(prefix,f);
        if(isStart)grid.insertAdjacentHTML('afterbegin',html);
        else anchorEl.insertAdjacentHTML('afterend',html);
        if(f.type==='stars'){const id=cfInputId(prefix,f);if(typeof initStarPicker==='function')initStarPicker(id+'-picker',id,0);}
        remaining.splice(i,1);
        progressed=true;
        break;
      }
    }
    if(!progressed)break;
  }
  remaining.forEach(f=>{
    grid.insertAdjacentHTML('beforeend',cfFieldInputHtml(prefix,f));
    if(f.type==='stars'){const id=cfInputId(prefix,f);if(typeof initStarPicker==='function')initStarPicker(id+'-picker',id,0);}
  });
}

// ── Colonnes de l'historique des trades ──
function cfFormatValue(field,val){
  if(val===undefined||val===null||val===''){
    return '<span style="color:var(--muted)">—</span>';
  }
  if(field.type==='stars'){
    const n=parseFloat(val)||0;let s='';
    for(let i=1;i<=5;i++)s+=(i<=n?'★':'☆');
    return `<span style="color:#f5b93d;letter-spacing:1px;">${s}</span>`;
  }
  if(field.type==='toggle')return escapeHtml((val===true||val==='true')?'Oui':'Non');
  return escapeHtml(String(val));
}
function cfApplyColumnOrder(){
  cfEnsureOrders();
  const theadRow=document.querySelector('#page-journal thead tr');
  if(theadRow&&!theadRow.dataset.cfTagged){
    Array.from(theadRow.children).forEach((th,i)=>{ if(CF_BUILTIN_COLS[i])th.dataset.cid=CF_BUILTIN_COLS[i].id; });
    theadRow.dataset.cfTagged='1';
  }
  if(theadRow){
    const ths={};
    Array.from(theadRow.children).forEach(th=>{ if(th.dataset.cid)ths[th.dataset.cid]=th; });
    const actionsTh=theadRow.lastElementChild;
    APP.cfFields.forEach(f=>{
      let th=document.getElementById('cfth-'+f.id);
      if(!th){th=document.createElement('th');th.id='cfth-'+f.id;theadRow.insertBefore(th,actionsTh);}
      th.textContent=f.colName||f.label;
      ths[f.id]=th;
    });
    APP.cfColOrder.forEach(id=>{ if(ths[id])theadRow.insertBefore(ths[id],actionsTh); });
    // th orphelins (champ supprimé) : nettoyage
    theadRow.querySelectorAll('th[id^="cfth-"]').forEach(th=>{
      const fid=th.id.replace('cfth-','');
      if(!APP.cfFields.some(f=>f.id===fid))th.remove();
    });
  }
  document.querySelectorAll('#tradeTable tr').forEach(tr=>{
    const editBtn=tr.querySelector('.del-btn[onclick^="openEditTrade"]');
    const m=editBtn&&editBtn.getAttribute('onclick').match(/openEditTrade\((\d+)\)/);
    const tid=m?parseInt(m[1],10):null;
    const t=tid!=null?APP.trades.find(x=>x.id===tid):null;
    const tds={};
    Array.from(tr.children).forEach((td,i)=>{ if(CF_BUILTIN_COLS[i])tds[CF_BUILTIN_COLS[i].id]=td; });
    const actionsTd=tr.lastElementChild;
    APP.cfFields.forEach(f=>{
      const td=document.createElement('td');
      td.innerHTML=cfFormatValue(f,t?t['cf_'+f.id]:null);
      tds[f.id]=td;
      tr.insertBefore(td,actionsTd);
    });
    APP.cfColOrder.forEach(id=>{ if(tds[id])tr.insertBefore(tds[id],actionsTd); });
  });
}

// ── Cases KPI (bande fine) ──
function cfTagBuiltinKpiCards(){
  const strip=document.querySelector('#page-trackrecord .kpi-strip');
  if(!strip||strip.dataset.cfTagged)return;
  for(let i=1;i<=9;i++){
    const valEl=document.getElementById('k'+(i-1));
    const card=valEl?valEl.closest('.kpi-card'):null;
    if(card)card.dataset.kpiId='kpi'+i;
  }
  strip.dataset.cfTagged='1';
}
function cfEnsureKpiNode(field){
  let el=document.getElementById('kpicf-'+field.id);
  const strip=document.querySelector('#page-trackrecord .kpi-strip');
  if(!strip)return null;
  if(!el){
    el=document.createElement('div');
    el.className='kpi-card';
    el.id='kpicf-'+field.id;
    el.dataset.kpiId=field.id;
    el.innerHTML=`<div class="kpi-bar" id="kpicfbar-${field.id}"></div><div class="kpi-icon">🔹</div><div class="kpi-label" data-editable data-tvar="--kpi-label-color" id="cfkpilabel-${field.id}" style="color:var(--kpi-label-color,#64748b)">${escapeHtml(field.colName||field.label)}</div><div class="kpi-value" id="kpicfval-${field.id}">—</div>`;
    strip.appendChild(el);
  }
  return el;
}
function cfRenderKpiWidgets(){
  const strip=document.querySelector('#page-trackrecord .kpi-strip');
  if(!strip)return;
  const kpiFields=APP.cfFields.filter(f=>f.widget&&f.widget.kind==='kpi');
  kpiFields.forEach(f=>{
    cfEnsureKpiNode(f);
    const valEl=document.getElementById('kpicfval-'+f.id);
    const barEl=document.getElementById('kpicfbar-'+f.id);
    const c=gc('--cf-'+f.id+'-color')||'#00e5a0';
    if(valEl){valEl.textContent=cfKpiValueText(f);valEl.style.color=c;}
    if(barEl)barEl.style.background=c;
  });
  strip.querySelectorAll('[id^="kpicf-"]').forEach(el=>{
    const id=el.id.replace('kpicf-','');
    if(!kpiFields.some(f=>f.id===id))el.remove();
  });
  if(typeof applyPencilEdits==='function')applyPencilEdits();
}
function cfApplyKpiOrder(){
  const strip=document.querySelector('#page-trackrecord .kpi-strip');
  if(!strip)return;
  cfTagBuiltinKpiCards();
  cfEnsureOrders();
  const map={};
  Array.from(strip.querySelectorAll('.kpi-card')).forEach(card=>{ if(card.dataset.kpiId)map[card.dataset.kpiId]=card; });
  APP.cfKpiOrder.forEach(id=>{ if(map[id])strip.appendChild(map[id]); });
}
// Empile les cases KPI par lignes de 14 maximum, TOUTES DE LA MÊME TAILLE :
// contrairement à une répartition "équilibrée" (qui donnerait des cases plus
// petites sur une ligne de 8 que sur une ligne de 7), on garde ici une seule
// grille à 14 colonnes fixes pour toutes les lignes ; la dernière ligne
// incomplète est complétée par des cases vides (juste le fond), exactement
// comme en mode téléphone.
function cfBalancedRowSizes(total,maxPerRow){
  const rows=Math.max(1,Math.ceil(total/maxPerRow));
  const sizes=[];
  for(let i=0;i<rows;i++)sizes.push(maxPerRow);
  return sizes;
}
// Réorganise le DOM des cases KPI en lignes :
//  - Téléphone : toujours des lignes de 3, complétées par des cases vides
//    (juste le fond, pas de contenu) si la dernière ligne n'est pas pleine —
//    les cases ne changent jamais de taille.
//  - PC : une seule ligne tant qu'il y a 14 cases ou moins (elles se
//    partagent alors la largeur totale, donc rétrécissent progressivement) ;
//    au-delà de 14, répartition équilibrée sur plusieurs lignes de 14 max.
function cfLayoutKpiStrip(){
  const strip=document.querySelector('#page-trackrecord .kpi-strip');
  if(!strip)return;
  const cards=Array.from(strip.querySelectorAll('.kpi-card:not(.cf-kpi-placeholder)'));
  const n=cards.length;
  if(!n)return;
  strip.querySelectorAll('.cf-kpi-row').forEach(row=>{
    Array.from(row.children).forEach(ch=>{ if(ch.classList.contains('kpi-card')&&!ch.classList.contains('cf-kpi-placeholder'))strip.appendChild(ch); });
    row.remove();
  });
  const rowBg=gc('--kpi-strip-background')||'#1e2d45';
  if(cfIsMobile()){
    strip.style.display='flex';
    strip.style.flexDirection='column';
    strip.style.gap='1px';
    strip.style.gridTemplateColumns='';
    const rowSize=3;
    const rows=Math.ceil(n/rowSize);
    for(let r=0;r<rows;r++){
      const rowEl=document.createElement('div');
      rowEl.className='cf-kpi-row';
      rowEl.style.cssText='display:grid;grid-template-columns:repeat('+rowSize+',1fr);gap:1px;background:'+rowBg+';';
      for(let i=0;i<rowSize;i++){
        const idx=r*rowSize+i;
        if(idx<n)rowEl.appendChild(cards[idx]);
        else{
          const ph=document.createElement('div');
          ph.className='kpi-card cf-kpi-placeholder';
          rowEl.appendChild(ph);
        }
      }
      strip.appendChild(rowEl);
    }
    return;
  }
  if(n<=14){
    strip.style.display='grid';
    strip.style.flexDirection='';
    strip.style.gridTemplateColumns='repeat('+n+',1fr)';
    strip.style.gap='1px';
    cards.forEach(c=>strip.appendChild(c));
  } else {
    strip.style.display='flex';
    strip.style.flexDirection='column';
    strip.style.gap='1px';
    strip.style.gridTemplateColumns='';
    const sizes=cfBalancedRowSizes(n,14);
    let idx=0;
    sizes.forEach(size=>{
      const rowEl=document.createElement('div');
      rowEl.className='cf-kpi-row';
      rowEl.style.cssText='display:grid;grid-template-columns:repeat('+size+',1fr);gap:1px;background:'+rowBg+';';
      for(let i=0;i<size;i++){
        if(idx<n){ rowEl.appendChild(cards[idx]); idx++; }
        else{
          const ph=document.createElement('div');
          ph.className='kpi-card cf-kpi-placeholder';
          rowEl.appendChild(ph);
        }
      }
      strip.appendChild(rowEl);
    });
  }
}

// ── Zone graphiques/widgets du Track Record ──
// Système de largeur : grille à 6 colonnes. Pleine largeur = span 6,
// demi-largeur = span 3, tiers = span 2. grid-auto-flow:row dense permet aux
// graphiques de largeur réduite de se caler naturellement les uns à côté des
// autres (ou à côté d'un graphique plein qui laisse un trou), sans calcul
// manuel de "qui va sur quelle ligne".
function cfEnsureChartsContainer(){
  if(document.getElementById('chartsContainer'))return;
  const eqCanvas=document.getElementById('cEq');
  if(!eqCanvas)return;
  const eqCard=eqCanvas.closest('.chart-card');
  const pnlCard=document.getElementById('cPnl')&&document.getElementById('cPnl').closest('.chart-card');
  const riskCard=document.getElementById('riskCard');
  const pieCard=document.getElementById('cPie')&&document.getElementById('cPie').closest('.chart-card');
  const mgmtCard=document.getElementById('cMgmt')&&document.getElementById('cMgmt').closest('.chart-card');
  const top5El=document.getElementById('top5trades');
  const worst5El=document.getElementById('worst5trades');
  const top5Card=top5El&&top5El.closest('.card');
  const worst5Card=worst5El&&worst5El.closest('.card');
  if(!eqCard||!pnlCard||!riskCard||!pieCard||!mgmtCard)return;

  const container=document.createElement('div');
  container.id='chartsContainer';
  container.style.cssText='display:grid;grid-template-columns:repeat(60,1fr);gap:16px;grid-auto-flow:row dense;';
  eqCard.parentNode.insertBefore(container,eqCard);

  eqCard.dataset.chartId='eq';container.appendChild(eqCard);
  pnlCard.dataset.chartId='pnl';container.appendChild(pnlCard);
  riskCard.dataset.chartId='risk';container.appendChild(riskCard);

  const twoColWrap=pieCard.parentElement;
  pieCard.dataset.chartId='pie';container.appendChild(pieCard);
  mgmtCard.dataset.chartId='mgmt';container.appendChild(mgmtCard);
  if(twoColWrap&&twoColWrap.classList.contains('two-col')&&!twoColWrap.children.length)twoColWrap.remove();

  const compDiv=document.getElementById('compCharts');
  if(compDiv){
    const canvasMap={cConf:'conf',cPairs:'pairs',cSessions:'sessions',cJours:'jours',cTF:'tf'};
    Array.from(compDiv.children).forEach(card=>{
      const canvas=card.querySelector('canvas');
      const cid=canvas?canvasMap[canvas.id]:null;
      if(cid)card.dataset.chartId=cid;
      container.appendChild(card);
    });
  }

  // Top 5 / Pires 5 : DÉLIBÉRÉMENT hors de #chartsContainer, dans une zone
  // séparée juste en dessous. Le "grid-auto-flow:row dense" utilisé pour que
  // les graphiques 1/2 se calent naturellement les uns à côté des autres a
  // pour effet de bord de recaser N'IMPORTE QUEL élément (même en dernière
  // position dans le DOM) dans un trou plus haut si sa taille le permet — il
  // n'y a donc AUCUN moyen fiable de garder Top5/Pires5 "toujours tout en
  // bas" s'ils font partie de cette même grille dense. D'où cette séparation
  // stricte en dehors, qui garantit leur position par construction (et non
  // par convention), sur PC comme sur téléphone.
  let bottomRow=document.getElementById('cfBottomRow');
  if(!bottomRow&&top5Card&&worst5Card){
    bottomRow=document.createElement('div');
    bottomRow.id='cfBottomRow';
    bottomRow.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;';
    container.parentNode.insertBefore(bottomRow,container.nextSibling);
    const top5TwoCol=top5Card.parentElement;
    top5Card.dataset.chartId='top5';bottomRow.appendChild(top5Card);
    worst5Card.dataset.chartId='pires5';bottomRow.appendChild(worst5Card);
    if(top5TwoCol&&top5TwoCol.classList.contains('two-col')&&!top5TwoCol.children.length)top5TwoCol.remove();
  }

  const style=document.createElement('style');
  style.id='cfInjectedStyle';
  style.textContent=`
.cf-stat-card{display:flex;align-items:center;justify-content:center;padding:14px;}
.cf-stat-inner{text-align:center;}
.cf-stat-label{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.cf-stat-value{font-family:var(--mono);font-size:20px;font-weight:700;}
.cf-shape-square{max-width:200px;aspect-ratio:1/1;margin:0 auto;}
.cf-shape-circle{max-width:200px;aspect-ratio:1/1;border-radius:50%;margin:0 auto;}
.cf-shape-rect{max-width:360px;min-height:90px;margin:0 auto;}
.cf-pie-body{display:flex;align-items:center;justify-content:center;}
#chartsContainer>*{cursor:grab;}
#chartsContainer>*.sortable-ghost{opacity:.35;}
#chartsContainer>*.sortable-drag{cursor:grabbing;}
@media(max-width:1100px){#cfBottomRow{grid-template-columns:1fr!important;}}
`;
  document.head.appendChild(style);

  // Glisser-déposer direct des graphiques (comme réarranger des applis) :
  // on saisit une carte n'importe où et on la dépose ailleurs, les autres
  // cartes se décalent en direct (animation intégrée de Sortable.js). Les
  // clics sur les boutons/inputs à l'intérieur (BT, périodes, stylo...)
  // restent normaux grâce à "filter". Fonctionne aussi bien sur les cartes
  // pleine largeur que sur les cartes partagées, PC comme téléphone.
  if(window.Sortable){
    new Sortable(container,{
      animation:200,
      delay:150,
      delayOnTouchOnly:true,
      touchStartThreshold:5,
      filter:'canvas, input, button, select, textarea, .pbtn, .bt-toggle, [contenteditable="true"]',
      preventOnFilter:false,
      onStart:cfChartsSortableOnStart,
      onEnd:cfChartsSortableOnEnd
    });
  }
}
// Uniformise la hauteur des graphiques d'une même rangée : les cartes de
// #chartsContainer s'étirent déjà à la hauteur de la rangée grâce au
// comportement par défaut de CSS Grid (align-items:stretch) — encore faut-il
// que leur CONTENU (le corps du graphique) suive cet étirement au lieu de
// garder une hauteur fixe en pixels. On passe donc chaque carte en colonne
// flexible avec un corps extensible (flex:1) plutôt qu'une hauteur figée.
function cfNormalizeChartHeights(){
  const container=document.getElementById('chartsContainer');
  if(!container)return;
  Array.from(container.children).forEach(card=>{
    card.style.height='100%';
    card.style.display='flex';
    card.style.flexDirection='column';
    const body=card.querySelector('.chart-body');
    if(body){
      body.style.flex='1';
      body.style.height='auto';
      body.style.minHeight='180px';
    }
  });
}
function cfChartHeaderControlsHtml(fieldId){
  return `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
    <label class="bt-toggle"><input type="checkbox" id="bt-${fieldId}" onchange="toggleBT('${fieldId}')"> BT</label>
    <div class="period-btns">
      <button class="pbtn" data-chart="${fieldId}" data-p="jour">J</button>
      <button class="pbtn" data-chart="${fieldId}" data-p="semaine">SEM</button>
      <button class="pbtn" data-chart="${fieldId}" data-p="mois">MOIS</button>
      <button class="pbtn" data-chart="${fieldId}" data-p="trimestre">TRIM</button>
      <button class="pbtn" data-chart="${fieldId}" data-p="annee">AN</button>
      <button class="pbtn active" data-chart="${fieldId}" data-p="tout">TOUT</button>
    </div>
  </div>`;
}
function cfEnsureChartState(fieldId){
  if(!(fieldId in BT_STATE))BT_STATE[fieldId]=false;
  if(!(fieldId in ST))ST[fieldId]='tout';
}
// Le mode stylo attache DEUX mécanismes de blocage sur les éléments
// "data-editable" pendant qu'il est actif :
//  1) un écouteur délégué sur document (phase de capture) qui coupe la
//     propagation si la cible a l'attribut data-editable ;
//  2) un écouteur touchend/click attaché DIRECTEMENT sur chaque élément
//     data-editable lui-même (posé une fois par setupPencil(), référencé
//     sur l'élément via el._ph), qui coupe aussi la propagation — et qui ne
//     vérifie même pas l'attribut, seulement si le mode stylo est actif.
// Retirer juste l'attribut ne suffit donc pas pour le 2) : il faut aussi
// détacher cet écouteur précis le temps du glisser, puis le rattacher juste
// après (sous peine de perdre définitivement l'édition au clic sur ce titre,
// car setupPencil() ne réattache jamais un _ph déjà posé).
function cfChartsSortableOnStart(){
  const container=document.getElementById('chartsContainer');
  if(!container)return;
  container.querySelectorAll('[data-editable]').forEach(el=>{
    el.setAttribute('data-cf-had-editable','1');
    el.removeAttribute('data-editable');
    if(el._ph){
      el.removeEventListener('touchend',el._ph);
      el.removeEventListener('click',el._ph);
      el.dataset.cfPhDetached='1';
    }
  });
}
function cfChartsSortableOnEnd(){
  const container=document.getElementById('chartsContainer');
  if(!container)return;
  container.querySelectorAll('[data-cf-had-editable]').forEach(el=>{
    el.setAttribute('data-editable','');
    el.removeAttribute('data-cf-had-editable');
    if(el.dataset.cfPhDetached&&el._ph){
      el.addEventListener('click',el._ph);
      el.addEventListener('touchend',el._ph,{passive:false});
      delete el.dataset.cfPhDetached;
    }
  });
  const order=Array.from(container.children).map(el=>el.dataset.chartId).filter(Boolean);
  APP.cfChartOrder=order;
  cfPersist();
  cfApplyChartOrder();
  cfApplyChartLayout();
}
function cfEnsureChartNode(field){
  let card=document.getElementById('cfcard-'+field.id);
  const container=document.getElementById('chartsContainer');
  if(!container)return null;
  cfEnsureChartState(field.id);
  if(!card){
    card=document.createElement('div');
    card.id='cfcard-'+field.id;
    card.className='chart-card';
    card.dataset.chartId=field.id;
    card.style.background='var(--card)';
    const isPie=field.widget.kind==='pie';
    const canvasStyle=isPie?' style="max-width:195px;max-height:195px;"':'';
    const bodyClass=isPie?'chart-body cf-pie-body':'chart-body';
    card.innerHTML=`<div class="chart-header"><div class="chart-title" data-editable data-tvar="--cf-${field.id}-title" id="cftitle-${field.id}" style="color:var(--cf-${field.id}-title,#00e5a0)">${escapeHtml((field.colName||field.label).toUpperCase())}</div>${cfChartHeaderControlsHtml(field.id)}</div>
      <div class="${bodyClass}" style="height:220px"><canvas id="cfchart-${field.id}"${canvasStyle}></canvas></div>`;
    container.appendChild(card);
  }
  return card;
}
function cfEnsureStatCardNode(field){
  let card=document.getElementById('cfcard-'+field.id);
  const container=document.getElementById('chartsContainer');
  if(!container)return null;
  if(!card){
    card=document.createElement('div');
    card.id='cfcard-'+field.id;
    card.dataset.chartId=field.id;
    card.className='chart-card cf-stat-card cf-shape-'+((field.widget&&field.widget.shape)||'rect');
    card.innerHTML=`<div class="cf-stat-inner"><div class="cf-stat-label" data-editable id="cflabel-${field.id}">${escapeHtml(field.colName||field.label)}</div><div class="cf-stat-value" id="cfstatval-${field.id}">—</div></div>`;
    container.appendChild(card);
  }
  return card;
}
function cfDrawChart(field){
  const canvasEl=document.getElementById('cfchart-'+field.id);
  destroy(field.id);
  if(!canvasEl||typeof Chart==='undefined')return;
  const ctx=canvasEl.getContext('2d');
  const kind=field.widget.kind;
  cfEnsureChartState(field.id);
  const period=ST[field.id]||'tout';
  const trades=(typeof btFilter==='function')?btFilter(field.id,period):realTrades();
  const axC=gc('--comp-axis')||'#64748b',grC=gc('--comp-grid')||'rgba(100,116,139,.1)';
  if(kind==='line'){
    const trs=trades.filter(t=>{const v=t['cf_'+field.id];return v!==undefined&&v!==''&&!isNaN(parseFloat(v));})
      .sort((a,b)=>a.date.localeCompare(b.date)||(a.heure||'').localeCompare(b.heure||''));
    if(!trs.length)return;
    const data=trs.map(t=>parseFloat(t['cf_'+field.id]));
    const labels=typeof buildLabels==='function'?buildLabels(trs,period):trs.map(t=>t.date);
    const lc=gc('--cf-'+field.id+'-line')||'#00e5a0';
    const ftop=gc('--cf-'+field.id+'-fill-top')||'rgba(0,229,160,.32)',fbot=gc('--cf-'+field.id+'-fill-bot')||'rgba(0,229,160,0)';
    const g=ctx.createLinearGradient(0,0,0,210);g.addColorStop(0,ftop);g.addColorStop(1,fbot);
    CH[field.id]=new Chart(ctx,{type:'line',data:{labels,datasets:[{data,borderColor:lc,backgroundColor:g,borderWidth:2.5,fill:true,tension:0,pointRadius:0,pointHoverRadius:4}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{x:{grid:{color:grC},ticks:{color:axC,maxTicksLimit:10,maxRotation:30}},y:{grid:{color:grC},ticks:{color:axC}}}}});
    return;
  }
  if(kind==='bar-v'||kind==='bar-h'){
    const map=cfCategoryStats(field,trades);
    const ks=Object.keys(map).sort((a,b)=>map[b].pnl-map[a].pnl).slice(0,20);
    if(!ks.length)return;
    const data=ks.map(k=>map[k].pnl);
    const posC=gc('--cf-'+field.id+'-pos')||'rgba(0,229,160,.8)',negC=gc('--cf-'+field.id+'-neg')||'rgba(239,68,68,.8)';
    const valueAxis=kind==='bar-h'?'x':'y',catAxis=kind==='bar-h'?'y':'x';
    const scales={};
    scales[valueAxis]={grid:{color:grC},ticks:{color:axC,callback:v=>(v>=0?'+':'')+v+'€'}};
    scales[catAxis]={grid:{color:grC},ticks:{color:'#e2e8f0'}};
    CH[field.id]=new Chart(ctx,{type:'bar',data:{labels:ks,datasets:[{data,backgroundColor:data.map(v=>v>=0?posC:negC),borderRadius:4,borderWidth:0}]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:kind==='bar-h'?'y':'x',
        plugins:{legend:{display:false}},scales}});
    return;
  }
  if(kind==='pie'){
    const map=cfCategoryStats(field,trades);
    const ks=cfPieCategoryOrder(field,map).slice(0,cfPieSliceCount(field));
    if(!ks.length)return;
    const data=ks.map(k=>map[k].total);
    const fallback=['#00e5a0','#3b82f6','#f59e0b','#ef4444','#a78bfa','#f472b6','#22d3ee','#84cc16'];
    const palette=ks.map((k,i)=>gc('--cf-'+field.id+'-slice-'+(i+1))||fallback[i%fallback.length]);
    const exploded=cfPieExploded[field.id];
    const offsets=ks.map(k=>k===exploded?26:0);
    CH[field.id]=new Chart(ctx,{type:'doughnut',data:{labels:ks,datasets:[{data,backgroundColor:palette,borderColor:'#0b0f1a',borderWidth:3,hoverOffset:5,offset:offsets}]},
      options:{responsive:true,maintainAspectRatio:true,cutout:'60%',plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',font:{size:10},boxWidth:11,boxHeight:11}}},
        onClick:(evt,elements)=>{
          // Uniquement en mode stylo : on "détache" la part touchée (comme
          // un camembert éclaté) — retaper dessus la remet en place.
          if(!pencilActive)return;
          if(!elements||!elements.length)return;
          const clickedLabel=ks[elements[0].index];
          cfPieExploded[field.id]=(cfPieExploded[field.id]===clickedLabel)?null:clickedLabel;
          cfDrawChart(field);
        }}});
  }
}
function cfRenderCustomCharts(){
  cfEnsureChartsContainer();
  const container=document.getElementById('chartsContainer');
  if(!container)return;
  APP.cfFields.forEach(f=>{
    const kind=f.widget&&f.widget.kind;
    if(!kind||kind==='none'||kind==='kpi')return;
    if(kind==='card'){
      cfEnsureStatCardNode(f);
      const el=document.getElementById('cfstatval-'+f.id);
      if(el){el.textContent=cfKpiValueText(f);el.style.color=gc('--cf-'+f.id+'-color')||'#00e5a0';}
    } else {
      cfEnsureChartNode(f);
      cfDrawChart(f);
    }
  });
  container.querySelectorAll('[id^="cfcard-"]').forEach(el=>{
    const id=el.id.replace('cfcard-','');
    const f=APP.cfFields.find(x=>x.id===id);
    const stillChart=f&&f.widget&&CF_CHART_WIDGET_KINDS.includes(f.widget.kind);
    if(!stillChart){destroy(id);el.remove();}
  });
  if(typeof applyPencilEdits==='function')applyPencilEdits();
}
function cfApplyChartOrder(){
  const container=document.getElementById('chartsContainer');
  if(!container)return;
  cfEnsureOrders();
  const map={};
  Array.from(container.children).forEach(card=>{ if(card.dataset.chartId)map[card.dataset.chartId]=card; });
  APP.cfChartOrder.forEach(id=>{ if(map[id])container.appendChild(map[id]); });
}
function cfIsMobile(){
  return !!(window.matchMedia && window.matchMedia('(max-width:1100px)').matches);
}
// Largeurs : pleine=span 6, demie=span 3, camembert dynamique (1 seul=6,
// 2=3 chacun, 3 ou plus=2 chacun → jamais plus de 3 camemberts par ligne).
// En mode téléphone, tout repasse en pleine largeur (span 6, une seule
// colonne visible de toute façon vu le CSS mobile du reste de l'appli).
// Grille à 60 colonnes (au lieu de 6) : 60 se divise proprement par 1, 2, 3,
// 4, 5 et 6, ce qui permet d'avoir jusqu'à 6 camemberts sur une même ligne
// en PC (et jusqu'à 3 en téléphone) avec une largeur toujours strictement
// égale entre eux, quel que soit leur nombre.
const CF_GRID_COLS=60;
function cfApplyChartLayout(){
  const container=document.getElementById('chartsContainer');
  if(!container)return;
  const children=Array.from(container.children);
  const isPieEl=(el)=>{
    const id=el.dataset.chartId;
    if(id==='pie')return true;
    const f=APP.cfFields.find(x=>x.id===id);
    return !!(f&&f.widget&&f.widget.kind==='pie');
  };
  const mobile=cfIsMobile();
  const pies=children.filter(isPieEl);
  const maxPiesPerRow=mobile?3:6;
  const pieCount=Math.max(1,Math.min(pies.length,maxPiesPerRow));
  const pieSpan=CF_GRID_COLS/pieCount;
  children.forEach(el=>{
    const id=el.dataset.chartId;
    let span=CF_GRID_COLS;
    if(isPieEl(el))span=pieSpan;
    else if(!mobile&&CF_HALF_WIDTH_NATIVE.has(id))span=CF_GRID_COLS/2;
    el.style.gridColumn='span '+span;
  });
}

// ── Intégration thème ──
function cfBuildThemeVars(){
  const out=[];
  out.push({v:'--history-grid-color',l:'Quadrillage (lignes/colonnes)',page:'Journal de trading',section:'Historique des trades'});
  APP.cfFields.filter(f=>f.type==='select').forEach(f=>{
    out.push({v:'--mt-cf-'+f.id,l:'Titre '+(f.colName||f.label),page:'Paramètres',section:'Listes personnalisables'});
  });
  APP.cfFields.forEach(f=>{
    const kind=f.widget&&f.widget.kind;
    if(!kind||kind==='none')return;
    const lbl=f.colName||f.label;
    if(kind==='kpi'||kind==='card'){
      out.push({v:'--cf-'+f.id+'-color',l:lbl+' — couleur',page:'Track Record',section:'Champs personnalisés'});
    } else if(kind==='line'){
      out.push({v:'--cf-'+f.id+'-title',l:lbl+' — titre',page:'Track Record',section:'Champs personnalisés'});
      out.push({v:'--cf-'+f.id+'-line',l:lbl+' — courbe',page:'Track Record',section:'Champs personnalisés'});
      out.push({v:'--cf-'+f.id+'-fill-top',l:lbl+' — dégradé haut',page:'Track Record',section:'Champs personnalisés'});
      out.push({v:'--cf-'+f.id+'-fill-bot',l:lbl+' — dégradé bas',page:'Track Record',section:'Champs personnalisés'});
    } else if(kind==='bar-v'||kind==='bar-h'){
      out.push({v:'--cf-'+f.id+'-title',l:lbl+' — titre',page:'Track Record',section:'Champs personnalisés'});
      out.push({v:'--cf-'+f.id+'-pos',l:lbl+' — positif',page:'Track Record',section:'Champs personnalisés'});
      out.push({v:'--cf-'+f.id+'-neg',l:lbl+' — négatif',page:'Track Record',section:'Champs personnalisés'});
    } else if(kind==='pie'){
      out.push({v:'--cf-'+f.id+'-title',l:lbl+' — titre',page:'Track Record',section:'Champs personnalisés'});
      const n=cfPieSliceCount(f);
      for(let i=1;i<=n;i++){
        const optLabel=(f.type==='select'&&f.options&&f.options[i-1])?f.options[i-1]:('tranche '+i);
        out.push({v:'--cf-'+f.id+'-slice-'+i,l:lbl+' — '+optLabel,page:'Track Record',section:'Champs personnalisés'});
      }
    }
  });
  return out;
}

// ── Paramètres : carte "Champs personnalisés" ──
function cfRenderOrderList(containerId,order,labelMap,onReorder){
  const el=document.getElementById(containerId);
  if(!el)return;
  el.innerHTML=order.map(id=>`<div class="mod-item" data-id="${escapeHtml(id)}"><span class="drag-h">⣿</span><span class="item-tx">${escapeHtml(labelMap[id]||id)}</span></div>`).join('');
  if(window.Sortable){
    new Sortable(el,{animation:120,handle:'.drag-h',onEnd:()=>{
      const newOrder=Array.from(el.children).map(c=>c.dataset.id);
      onReorder(newOrder);
    }});
  }
}
function cfRenderOptionsEditor(containerEl,arr,onChange){
  if(!containerEl)return;
  containerEl.innerHTML=arr.map((opt,i)=>`<div class="mod-item"><span class="drag-h">⣿</span><span class="item-tx">${escapeHtml(opt)}</span><button class="del-item" data-i="${i}">×</button></div>`).join('');
  containerEl.querySelectorAll('.del-item').forEach(btn=>{
    btn.addEventListener('click',()=>{
      arr.splice(parseInt(btn.dataset.i,10),1);
      cfRenderOptionsEditor(containerEl,arr,onChange);
      onChange();
    });
  });
  if(window.Sortable){
    new Sortable(containerEl,{animation:120,handle:'.drag-h',onEnd:(evt)=>{
      const [m]=arr.splice(evt.oldIndex,1);
      arr.splice(evt.newIndex,0,m);
      onChange();
    }});
  }
}
// Éditeur d'options d'un menu déroulant personnalisé, injecté directement à
// la suite des 6 listes natives (Paires, Sessions, Confluences, Timeframes,
// Management, Reprendrais-tu ?) dans le même groupe "Listes personnalisables"
// — même structure, même comportement (glisser-déposer, ajout, couleur de
// titre modifiable via le thème ou le mode stylo). Idempotent : repart des
// blocs custom existants et les reconstruit à l'identique à chaque appel.
function cfRenderCustomDropdownLists(){
  const modGrid=document.getElementById('modGrid');
  if(!modGrid)return;
  modGrid.querySelectorAll('.mod-col[data-cf-list]').forEach(el=>el.remove());
  const selectFields=APP.cfFields.filter(f=>f.type==='select');
  selectFields.forEach(f=>{
    if(!f.options)f.options=[];
    const cv='--mt-cf-'+f.id;
    const html=`<div class="mod-col" data-cf-list="${f.id}">
      <div class="mod-col-hdr"><span class="mod-col-title" data-editable id="cfmt-${f.id}" style="color:var(${cv})">${escapeHtml(f.colName||f.label)}</span><span style="font-size:9px;color:var(--muted)">${f.options.length}</span></div>
      <div class="mod-list" id="cfml-${f.id}">${f.options.map((item,i)=>`<div class="mod-item"><span class="drag-h">⣿</span><span class="item-tx">${escapeHtml(item)}</span><button class="del-item" onclick="cfListRemoveOption('${f.id}',${i})">×</button></div>`).join('')}</div>
      <div class="mod-add"><input type="text" id="cfma-${f.id}" placeholder="Ajouter..." onkeydown="if(event.key==='Enter')cfListAddOption('${f.id}')"><button onclick="cfListAddOption('${f.id}')">+</button></div>
    </div>`;
    modGrid.insertAdjacentHTML('beforeend',html);
    const el=document.getElementById('cfml-'+f.id);
    if(el&&window.Sortable){
      new Sortable(el,{animation:120,handle:'.drag-h',onEnd:evt=>{
        const[m]=f.options.splice(evt.oldIndex,1);
        f.options.splice(evt.newIndex,0,m);
        cfPersist();
        cfInjectFormFields('f');
        cfInjectFormFields('e');
        if(typeof refreshAllCharts==='function')refreshAllCharts();
      }});
    }
  });
  if(typeof applyPencilEdits==='function')applyPencilEdits();
}
function cfListAddOption(fieldId){
  const f=APP.cfFields.find(x=>x.id===fieldId);
  if(!f)return;
  const inp=document.getElementById('cfma-'+fieldId);
  const v=inp.value.trim();
  if(!v||(f.options||[]).includes(v))return;
  if(!f.options)f.options=[];
  f.options.push(v);
  cfPersist();
  cfInjectFormFields('f');
  cfInjectFormFields('e');
  cfRenderCustomDropdownLists();
  if(typeof refreshAllCharts==='function')refreshAllCharts();
}
function cfListRemoveOption(fieldId,idx){
  const f=APP.cfFields.find(x=>x.id===fieldId);
  if(!f||!f.options)return;
  f.options.splice(idx,1);
  cfPersist();
  cfInjectFormFields('f');
  cfInjectFormFields('e');
  cfRenderCustomDropdownLists();
  if(typeof refreshAllCharts==='function')refreshAllCharts();
}
function cfEnsureCard(){
  if(document.getElementById('cfCard'))return;
  const modGrid=document.getElementById('modGrid');
  if(!modGrid)return;
  const card=document.createElement('div');
  card.className='card';
  card.id='cfCard';
  card.innerHTML=`
    <div class="card-header">
      <div class="card-title" data-editable id="cfCardTitleText">CHAMPS PERSONNALISÉS</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;">
        <button class="btn btn-p" onclick="cfOpenBuilder()">+ Nouveau graphique</button>
        <button class="btn btn-g" id="cfToggleBtn" onclick="cfToggleCard()">Afficher</button>
      </div>
    </div>
    <div id="cfCardBody" style="display:none;padding:14px;">
      <div style="font-size:11px;color:var(--muted);margin-bottom:12px;">Ajoute tes propres questions au questionnaire. Chaque question crée une colonne dans l'historique et, si tu veux, une case KPI ou un graphique dans le Track Record.</div>
      <div id="cfFieldsList"></div>
      <div id="cfNoFields" style="font-size:11px;color:var(--muted);padding:10px 0;">Aucun champ personnalisé pour l'instant.</div>
      <div style="margin-top:16px;">
        <button class="btn btn-g" id="cfOrderToggleBtn" onclick="cfToggleOrderSection()">▾ Ordre (colonnes / KPI / graphiques)</button>
        <div id="cfOrderSection" style="display:none;margin-top:12px;">
          <div class="mod-col-title" style="margin-bottom:8px;">ORDRE DES COLONNES — HISTORIQUE DES TRADES</div>
          <div class="mod-list" id="cfColOrderList"></div>
          <div class="mod-col-title" style="margin-top:16px;margin-bottom:8px;">ORDRE DES CASES KPI</div>
          <div class="mod-list" id="cfKpiOrderList"></div>
          <div class="mod-col-title" style="margin-top:16px;margin-bottom:8px;">ORDRE DES GRAPHIQUES / WIDGETS</div>
          <div class="mod-list" id="cfChartOrderList"></div>
        </div>
      </div>
    </div>`;
  modGrid.parentNode.insertBefore(card,modGrid);
}
function cfToggleCard(){
  const body=document.getElementById('cfCardBody');
  const btn=document.getElementById('cfToggleBtn');
  if(!body||!btn)return;
  const opening=body.style.display==='none';
  body.style.display=opening?'block':'none';
  btn.textContent=opening?'Masquer':'Afficher';
}
function cfToggleOrderSection(){
  const sec=document.getElementById('cfOrderSection');
  const btn=document.getElementById('cfOrderToggleBtn');
  if(!sec||!btn)return;
  const opening=sec.style.display==='none';
  sec.style.display=opening?'block':'none';
  btn.textContent=opening?'▲ Replier l\'ordre':'▾ Ordre (colonnes / KPI / graphiques)';
}
function cfRenderSettings(){
  cfEnsureCard();
  cfEnsureOrders();
  const listEl=document.getElementById('cfFieldsList');
  const noneEl=document.getElementById('cfNoFields');
  if(!listEl||!noneEl)return;
  if(!APP.cfFields.length){
    listEl.innerHTML='';
    noneEl.style.display='block';
  } else {
    noneEl.style.display='none';
    listEl.innerHTML=APP.cfFields.map(f=>{
      const typeLbl=(CF_TYPE_META[f.type]||{}).label||f.type;
      const widgetLbl=(f.widget&&f.widget.kind&&f.widget.kind!=='none')?CF_WIDGET_META[f.widget.kind].label:null;
      return `<div class="mod-item" style="align-items:flex-start;flex-direction:column;gap:6px;padding:9px 11px;">
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:8px;">
          <div>
            <div style="font-size:12px;font-weight:600;">${escapeHtml(f.label)}</div>
            <div style="font-size:10px;color:var(--muted);margin-top:2px;">${escapeHtml(typeLbl)}${widgetLbl?' · '+escapeHtml(widgetLbl):''}</div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            <button class="btn btn-g" style="padding:5px 9px;font-size:9px;" onclick="cfOpenBuilder('${f.id}')">Modifier</button>
            <button class="btn" style="padding:5px 9px;font-size:9px;background:var(--btn-delall-bg);color:var(--btn-delall-tx);border:1px solid var(--btn-delall-bd);border-radius:5px;cursor:pointer;" onclick="cfDeleteField('${f.id}')">Supprimer</button>
          </div>
        </div>
        ${f.type==='select'?`<div style="font-size:10px;color:var(--muted);width:100%;">Options modifiables dans "Listes personnalisables", plus bas.</div>`:''}
      </div>`;
    }).join('');
  }
  const colLabelMap={};CF_BUILTIN_COLS.forEach(c=>colLabelMap[c.id]=c.label);APP.cfFields.forEach(f=>colLabelMap[f.id]=f.colName||f.label);
  cfRenderOrderList('cfColOrderList',APP.cfColOrder,colLabelMap,(newOrder)=>{APP.cfColOrder=newOrder;cfPersist();if(typeof renderTable==='function')renderTable();});

  const kpiLabelMap={};CF_BUILTIN_KPIS.forEach(k=>kpiLabelMap[k.id]=k.label);APP.cfFields.forEach(f=>{ if(f.widget&&f.widget.kind==='kpi')kpiLabelMap[f.id]=f.colName||f.label; });
  cfRenderOrderList('cfKpiOrderList',APP.cfKpiOrder,kpiLabelMap,(newOrder)=>{APP.cfKpiOrder=newOrder;cfPersist();if(typeof updateKPIs==='function')updateKPIs();});

  const chartLabelMap={};CF_BUILTIN_CHARTS.forEach(c=>chartLabelMap[c.id]=c.label);APP.cfFields.forEach(f=>{ if(f.widget&&CF_CHART_WIDGET_KINDS.includes(f.widget.kind))chartLabelMap[f.id]=f.colName||f.label; });
  cfRenderOrderList('cfChartOrderList',APP.cfChartOrder,chartLabelMap,(newOrder)=>{APP.cfChartOrder=newOrder;cfPersist();if(typeof refreshAllCharts==='function')refreshAllCharts();});
}

// ── Modale de création / édition d'un champ ──
let cfEditingId=null;
// Part de camembert actuellement "éclatée" en mode stylo (tap pour détacher,
// re-tap pour remettre en place) — état volatile, non sauvegardé.
let cfPieExploded={};
let cfTempOptions=[];
function cfEnsureModal(){
  if(document.getElementById('cfModal'))return;
  const overlay=document.createElement('div');
  overlay.className='cp-overlay';
  overlay.id='cfModal';
  overlay.innerHTML=`
    <div class="cp-modal" style="width:380px;">
      <div class="cp-title" id="cfmTitle">NOUVEAU CHAMP PERSONNALISÉ</div>
      <div class="fg" style="margin-bottom:9px;"><label>Question</label><input type="text" id="cfm-label" placeholder="Ex : Émotion pendant le trade"></div>
      <div class="fg" style="margin-bottom:9px;"><label>Format de réponse</label><select id="cfm-type" onchange="cfOnTypeChange()"></select></div>
      <div class="fg" id="cfm-options-wrap" style="margin-bottom:9px;display:none;">
        <label>Options du menu déroulant</label>
        <div class="mod-list" id="cfm-options-list" style="margin-bottom:6px;"></div>
        <div class="mod-add"><input type="text" id="cfm-options-add-input" placeholder="Ajouter une option..." onkeydown="if(event.key==='Enter'){event.preventDefault();cfAddOption();}"><button onclick="cfAddOption()">+</button></div>
      </div>
      <div class="fg" style="margin-bottom:9px;"><label>Nom de la colonne (historique)</label><input type="text" id="cfm-colname" placeholder="Par défaut : même nom que la question"></div>
      <div class="fg" style="margin-bottom:9px;"><label>Position dans le questionnaire</label><select id="cfm-afterfield"></select></div>
      <div class="fg" style="margin-bottom:9px;"><label>Position dans les colonnes</label><select id="cfm-aftercol"></select></div>
      <div class="fg" style="margin-bottom:9px;"><label>Widget Track Record</label><select id="cfm-widgetkind" onchange="cfOnWidgetKindChange()"></select></div>
      <div class="fg" id="cfm-shape-row" style="margin-bottom:9px;display:none;">
        <label>Forme du widget</label>
        <select id="cfm-widgetshape"><option value="square">Carré</option><option value="circle">Rond</option><option value="rect">Rectangle</option></select>
      </div>
      <div class="fg" id="cfm-widgetpos-row" style="margin-bottom:14px;">
        <label>Position du widget</label>
        <select id="cfm-widgetpos"></select>
      </div>
      <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <button class="btn" id="cfmDeleteBtn" style="background:var(--btn-delall-bg);color:var(--btn-delall-tx);border:1px solid var(--btn-delall-bd);display:none;" onclick="cfDeleteFieldFromModal()">Supprimer</button>
        <div style="display:flex;gap:8px;margin-left:auto;">
          <button class="btn btn-g" onclick="cfCloseBuilder()">Annuler</button>
          <button class="btn btn-p" onclick="cfSaveBuilder()">Enregistrer</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('cfm-type').innerHTML=Object.keys(CF_TYPE_META).map(k=>`<option value="${k}">${CF_TYPE_META[k].label}</option>`).join('');
}
function cfWidgetOptionsHtml(type){
  const allowed=(CF_TYPE_META[type]||CF_TYPE_META.text).widgets;
  return allowed.map(k=>`<option value="${k}">${CF_WIDGET_META[k].label}</option>`).join('');
}
function cfPopulateAnchorSelects(f){
  const fieldOpts=['<option value="">— À la fin —</option>']
    .concat(CF_BUILTIN_FORM_ANCHORS.map(b=>`<option value="${b.id}">Après : ${escapeHtml(b.label)}</option>`))
    .concat(APP.cfFields.filter(x=>!f||x.id!==f.id).map(x=>`<option value="${x.id}">Après : ${escapeHtml(x.label)}</option>`))
    .concat(['<option value="__start__">— Au début —</option>']);
  document.getElementById('cfm-afterfield').innerHTML=fieldOpts.join('');

  const colOpts=['<option value="">— À la fin —</option>']
    .concat(CF_BUILTIN_COLS.map(b=>`<option value="${b.id}">Après : ${escapeHtml(b.label)}</option>`))
    .concat(APP.cfFields.filter(x=>!f||x.id!==f.id).map(x=>`<option value="${x.id}">Après : ${escapeHtml(x.colName||x.label)}</option>`))
    .concat(['<option value="__start__">— Au début —</option>']);
  document.getElementById('cfm-aftercol').innerHTML=colOpts.join('');
}
function cfPopulateWidgetPosSelect(f){
  const kind=document.getElementById('cfm-widgetkind').value;
  const sel=document.getElementById('cfm-widgetpos');
  if(kind==='kpi'){
    const opts=['<option value="">— À la fin —</option>'].concat(CF_BUILTIN_KPIS.map(b=>`<option value="${b.id}">Après : ${escapeHtml(b.label)}</option>`))
      .concat(APP.cfFields.filter(x=>(!f||x.id!==f.id)&&x.widget&&x.widget.kind==='kpi').map(x=>`<option value="${x.id}">Après : ${escapeHtml(x.label)}</option>`))
      .concat(['<option value="__start__">— Au début —</option>']);
    sel.innerHTML=opts.join('');
  } else if(kind&&kind!=='none'){
    const opts=['<option value="">— À la fin —</option>'].concat(CF_BUILTIN_CHARTS.map(b=>`<option value="${b.id}">Après : ${escapeHtml(b.label)}</option>`))
      .concat(APP.cfFields.filter(x=>(!f||x.id!==f.id)&&x.widget&&CF_CHART_WIDGET_KINDS.includes(x.widget.kind)).map(x=>`<option value="${x.id}">Après : ${escapeHtml(x.label)}</option>`))
      .concat(['<option value="__start__">— Au début —</option>']);
    sel.innerHTML=opts.join('');
  } else {
    sel.innerHTML='';
  }
}
function cfOnTypeChange(){
  const type=document.getElementById('cfm-type').value;
  document.getElementById('cfm-options-wrap').style.display=type==='select'?'':'none';
  document.getElementById('cfm-widgetkind').innerHTML=cfWidgetOptionsHtml(type);
  cfOnWidgetKindChange();
}
function cfOnWidgetKindChange(){
  const kind=document.getElementById('cfm-widgetkind').value;
  document.getElementById('cfm-shape-row').style.display=kind==='card'?'':'none';
  document.getElementById('cfm-widgetpos-row').style.display=kind==='none'?'none':'';
  const f=cfEditingId?APP.cfFields.find(x=>x.id===cfEditingId):null;
  cfPopulateWidgetPosSelect(f);
}
function cfOpenBuilder(editId){
  cfEnsureModal();
  cfEditingId=editId||null;
  const f=editId?APP.cfFields.find(x=>x.id===editId):null;
  cfTempOptions=f?(f.options||[]).slice():[];
  document.getElementById('cfmTitle').textContent=f?'MODIFIER LE CHAMP':'NOUVEAU CHAMP PERSONNALISÉ';
  document.getElementById('cfm-label').value=f?f.label:'';
  document.getElementById('cfm-type').value=f?f.type:'text';
  document.getElementById('cfm-colname').value=f?(f.colName||''):'';
  cfPopulateAnchorSelects(f);
  document.getElementById('cfm-afterfield').value=f?(f.afterField||''):'';
  document.getElementById('cfm-aftercol').value=f?(f.afterCol||''):'';
  document.getElementById('cfm-options-wrap').style.display=(f?f.type:'text')==='select'?'':'none';
  document.getElementById('cfm-widgetkind').innerHTML=cfWidgetOptionsHtml(f?f.type:'text');
  document.getElementById('cfm-widgetkind').value=(f&&f.widget&&f.widget.kind)?f.widget.kind:'none';
  document.getElementById('cfm-widgetshape').value=(f&&f.widget&&f.widget.shape)?f.widget.shape:'square';
  document.getElementById('cfm-shape-row').style.display=document.getElementById('cfm-widgetkind').value==='card'?'':'none';
  document.getElementById('cfm-widgetpos-row').style.display=document.getElementById('cfm-widgetkind').value==='none'?'none':'';
  cfPopulateWidgetPosSelect(f);
  document.getElementById('cfm-widgetpos').value=f?(f.widgetAfter||''):'';
  document.getElementById('cfmDeleteBtn').style.display=f?'':'none';
  cfRenderOptionsEditor(document.getElementById('cfm-options-list'),cfTempOptions,()=>{});
  document.getElementById('cfModal').classList.add('open');
}
function cfCloseBuilder(){
  const m=document.getElementById('cfModal');
  if(m)m.classList.remove('open');
}
function cfAddOption(){
  const inp=document.getElementById('cfm-options-add-input');
  const v=inp.value.trim();
  if(!v)return;
  cfTempOptions.push(v);
  inp.value='';
  cfRenderOptionsEditor(document.getElementById('cfm-options-list'),cfTempOptions,()=>{});
}
function cfSaveBuilder(){
  const label=document.getElementById('cfm-label').value.trim();
  if(!label){alert('Le nom de la question est obligatoire.');return;}
  const type=document.getElementById('cfm-type').value;
  if(type==='select'&&cfTempOptions.length<1){alert('Ajoute au moins une option au menu déroulant.');return;}
  const colName=document.getElementById('cfm-colname').value.trim()||label;
  const afterField=document.getElementById('cfm-afterfield').value;
  const afterCol=document.getElementById('cfm-aftercol').value;
  const widgetKind=document.getElementById('cfm-widgetkind').value;
  const widgetShape=document.getElementById('cfm-widgetshape').value;
  const widgetAfter=document.getElementById('cfm-widgetpos').value;

  let field=cfEditingId?APP.cfFields.find(x=>x.id===cfEditingId):null;
  if(!field){
    field={id:cfNewId()};
    APP.cfFields.push(field);
  }
  field.label=label;
  field.type=type;
  field.options=type==='select'?cfTempOptions.slice():undefined;
  field.colName=colName;
  field.afterField=afterField;
  field.afterCol=afterCol;
  field.widget={kind:widgetKind,shape:widgetShape};
  field.widgetAfter=widgetAfter;

  cfEnsureOrders();
  cfInsertIntoOrder(APP.cfColOrder,field.id,afterCol);
  if(widgetKind==='kpi'){
    cfInsertIntoOrder(APP.cfKpiOrder,field.id,widgetAfter);
    APP.cfChartOrder=APP.cfChartOrder.filter(x=>x!==field.id);
  } else if(CF_CHART_WIDGET_KINDS.includes(widgetKind)){
    cfInsertIntoOrder(APP.cfChartOrder,field.id,widgetAfter);
    APP.cfKpiOrder=APP.cfKpiOrder.filter(x=>x!==field.id);
  } else {
    APP.cfKpiOrder=APP.cfKpiOrder.filter(x=>x!==field.id);
    APP.cfChartOrder=APP.cfChartOrder.filter(x=>x!==field.id);
  }

  cfPersist();
  cfCloseBuilder();
  cfFullRerender();
}
function cfDeleteField(id){
  showConfirm('Supprimer ce champ ?','Les réponses déjà enregistrées pour ce champ seront masquées (le reste des données du trade n\'est pas touché).',()=>{
    APP.cfFields=APP.cfFields.filter(x=>x.id!==id);
    cfEnsureOrders();
    cfPersist();
    cfFullRerender();
  });
}
function cfDeleteFieldFromModal(){
  const id=cfEditingId;
  if(!id)return;
  cfCloseBuilder();
  cfDeleteField(id);
}

// ── Rendu global ──
function cfFullRerender(){
  cfEnsureOrders();
  cfInjectFormFields('f');
  cfInjectFormFields('e');
  if(typeof renderTable==='function')renderTable();
  if(typeof refreshAllCharts==='function')refreshAllCharts();
  cfRenderSettings();
}

// ══════════════════════════════════════════════════════════════════════════
// SURCHARGES (wrapping) — n'édite aucune fonction existante, se contente de
// l'entourer pour y greffer le comportement des champs personnalisés.
// ══════════════════════════════════════════════════════════════════════════
const _cfOrigRenderTable=window.renderTable;
window.renderTable=function(){
  _cfOrigRenderTable();
  try{cfApplyColumnOrder();}catch(e){console.warn('CF renderTable:',e);}
};

const _cfOrigAddTrade=window.addTrade;
window.addTrade=function(){
  const idBefore=APP.nextId;
  // IMPORTANT : on lit les valeurs des champs personnalisés AVANT d'appeler
  // la fonction d'origine, car celle-ci termine par un resetForm() qui vide
  // le formulaire (y compris nos champs) dès que le trade a été ajouté.
  const cfValues=APP.cfFields.map(f=>({f,val:cfReadInput('f',f)}));
  _cfOrigAddTrade();
  try{
    const t=APP.trades[0];
    if(t&&t.id===idBefore){
      cfValues.forEach(({f,val})=>{t['cf_'+f.id]=val;});
      saveState();
      renderTable();
      if(document.getElementById('page-trackrecord')&&document.getElementById('page-trackrecord').classList.contains('active'))refreshAllCharts();
      if(typeof currentUser!=='undefined'&&currentUser&&!_isSyncing)schedulePush(300);
    }
  }catch(e){console.warn('CF addTrade:',e);}
};

const _cfOrigSaveEditTrade=window.saveEditTrade;
window.saveEditTrade=function(){
  const id=_editId;
  _cfOrigSaveEditTrade();
  try{
    const t=APP.trades.find(x=>x.id===id);
    if(t){
      APP.cfFields.forEach(f=>{t['cf_'+f.id]=cfReadInput('e',f);});
      saveState();
      renderTable();
      if(document.getElementById('page-trackrecord')&&document.getElementById('page-trackrecord').classList.contains('active'))refreshAllCharts();
      if(typeof currentUser!=='undefined'&&currentUser&&!_isSyncing)schedulePush(300);
    }
  }catch(e){console.warn('CF saveEditTrade:',e);}
};

const _cfOrigOpenEditTrade=window.openEditTrade;
window.openEditTrade=function(id){
  _cfOrigOpenEditTrade(id);
  try{
    cfInjectFormFields('e');
    const t=APP.trades.find(x=>x.id===parseInt(id,10));
    if(t){APP.cfFields.forEach(f=>{cfSetInputValue('e',f,t['cf_'+f.id]);});}
  }catch(e){console.warn('CF openEditTrade:',e);}
};

const _cfOrigResetForm=window.resetForm;
window.resetForm=function(){
  _cfOrigResetForm();
  try{
    document.querySelectorAll('.cf-input').forEach(el=>{
      if(el.id.indexOf('f-cf-')===0){
        if(el.type==='checkbox')el.checked=false;else el.value='';
      }
    });
    APP.cfFields.filter(f=>f.type==='stars').forEach(f=>{
      if(typeof initStarPicker==='function')initStarPicker('f-cf-'+f.id+'-picker','f-cf-'+f.id,0);
    });
  }catch(e){console.warn('CF resetForm:',e);}
};

const _cfOrigBuildTV=window.buildTV;
window.buildTV=function(){
  return _cfOrigBuildTV().concat(cfBuildThemeVars());
};

const _cfOrigUpdateKPIs=window.updateKPIs;
window.updateKPIs=function(){
  _cfOrigUpdateKPIs();
  try{cfRenderKpiWidgets();cfApplyKpiOrder();cfLayoutKpiStrip();}catch(e){console.warn('CF KPI:',e);}
};

const _cfOrigRefreshAllCharts=window.refreshAllCharts;
window.refreshAllCharts=function(){
  _cfOrigRefreshAllCharts();
  try{cfRenderCustomCharts();cfApplyChartOrder();cfApplyChartLayout();cfNormalizeChartHeights();}catch(e){console.warn('CF charts:',e);}
};

// redrawForKey() est le point d'entrée générique utilisé par toggleBT() (case
// BT native) pour redessiner un graphique donné à partir de sa clé. On
// l'étend pour les clés de champs personnalisés (déjà préfixées "cf_"),
// sans toucher au chemin natif.
const _cfOrigRedrawForKey=window.redrawForKey;
window.redrawForKey=function(k){
  if(typeof k==='string'&&k.indexOf('cf_')===0){
    const f=APP.cfFields.find(x=>x.id===k);
    if(f&&f.widget){
      if(f.widget.kind==='card'){
        const el=document.getElementById('cfstatval-'+f.id);
        if(el)el.textContent=cfKpiValueText(f);
      } else if(CF_CHART_WIDGET_KINDS.includes(f.widget.kind)){
        cfDrawChart(f);
      }
    }
    return;
  }
  _cfOrigRedrawForKey(k);
};

// Boutons de période (J/SEM/MOIS/TRIM/AN/TOUT) des graphiques personnalisés :
// délégation d'événement plutôt que bindPBtns() natif, pour ne jamais
// re-attacher de listener sur les boutons natifs (qui gèrent déjà les leurs).
document.addEventListener('click',function(e){
  const btn=e.target.closest && e.target.closest('.pbtn[data-chart]');
  if(!btn)return;
  const c=btn.dataset.chart,p=btn.dataset.p;
  if(!c||c.indexOf('cf_')!==0)return;
  ST[c]=p;
  const grp=btn.closest('.period-btns');
  if(grp)grp.querySelectorAll('.pbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  redrawForKey(c);
});

const _cfOrigRenderModifs=window.renderModifs;
window.renderModifs=function(){
  _cfOrigRenderModifs();
  try{cfRenderCustomDropdownLists();cfRenderSettings();}catch(e){console.warn('CF settings:',e);}
};

if(typeof window.buildSyncPayload==='function'){
  const _cfOrigBuildSyncPayload=window.buildSyncPayload;
  window.buildSyncPayload=function(trades){
    const payload=_cfOrigBuildSyncPayload(trades);
    try{payload.cf_config=JSON.stringify(cfConfigSnapshot());}catch(e){console.warn('CF sync payload:',e);}
    return payload;
  };
}
if(typeof window._applyCloudDataDirect==='function'){
  const _cfOrigApplyCloudDataDirect=window._applyCloudDataDirect;
  window._applyCloudDataDirect=function(data,cloudTrades){
    _cfOrigApplyCloudDataDirect(data,cloudTrades);
    try{
      if(data&&data.cf_config){
        const cfg=JSON.parse(data.cf_config);
        APP.cfFields=Array.isArray(cfg.fields)?cfg.fields:[];
        APP.cfColOrder=Array.isArray(cfg.colOrder)?cfg.colOrder:null;
        APP.cfKpiOrder=Array.isArray(cfg.kpiOrder)?cfg.kpiOrder:null;
        APP.cfChartOrder=Array.isArray(cfg.chartOrder)?cfg.chartOrder:null;
        APP.cfPencilStyles=(cfg.pencilStyles&&typeof cfg.pencilStyles==='object')?cfg.pencilStyles:{};
        cfEnsureOrders();
        lssAcc('tj_cf_config',cfConfigSnapshot());
        cfInjectFormFields('f');
        cfInjectFormFields('e');
        renderTable();
        refreshAllCharts();
        cfRenderSettings();
        cfApplyPencilStylesCss();
      }
    }catch(e){console.warn('CF cloud pull:',e);}
  };
}

// ── Amorçage ──
// Quadrillage de l'historique des trades (lignes ET colonnes), couleur
// pilotée par --history-grid-color (thème > Journal de trading). Valeur par
// défaut = la ligne de séparation d'origine, pour ne rien changer tant que
// l'utilisateur n'a pas choisi sa propre couleur.
function cfEnsureHistoryGridStyle(){
  if(document.getElementById('cfHistoryGridStyle'))return;
  const style=document.createElement('style');
  style.id='cfHistoryGridStyle';
  style.textContent=`
#page-journal table{border-collapse:collapse;}
#page-journal table th,#page-journal table td{border:1px solid var(--history-grid-color,rgba(30,45,69,.5));}
`;
  document.head.appendChild(style);
}

// ── Mode stylo : police + taille indépendante PC/téléphone pour le libellé
// des questions personnalisées (les autres éléments éditables de l'appli ne
// sont pas concernés — le comportement natif, volontairement identique sur
// PC et téléphone, reste inchangé partout ailleurs). ──
const CF_PENCIL_FONTS=['Space Mono','DM Sans','Arial','Georgia','Courier New'];
function cfEnsurePencilExtraControls(){
  if(document.getElementById('cfPencilExtra'))return;
  const toolbar=document.getElementById('pencilToolbar');
  if(!toolbar)return;
  const wrap=document.createElement('span');
  wrap.id='cfPencilExtra';
  wrap.style.cssText='display:none;align-items:center;gap:8px;';
  wrap.innerHTML=`
    <label style="font-family:var(--mono);font-size:9px;color:var(--muted)">Police :</label>
    <select id="cfPencilFontFamily" onchange="cfApplyPencilExtra()">${CF_PENCIL_FONTS.map(f=>`<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('')}</select>
    <label style="font-family:var(--mono);font-size:9px;color:var(--muted)">Taille PC :</label>
    <input type="number" id="cfPencilFontSizePC" min="8" max="72" style="width:52px;" oninput="cfApplyPencilExtra()">
    <label style="font-family:var(--mono);font-size:9px;color:var(--muted)">Taille tél. :</label>
    <input type="number" id="cfPencilFontSizeMobile" min="8" max="72" style="width:52px;" oninput="cfApplyPencilExtra()">
  `;
  const checkBtn=toolbar.querySelector('button.btn-g');
  if(checkBtn)toolbar.insertBefore(wrap,checkBtn);
  else toolbar.appendChild(wrap);
}
// Applique en direct (à chaque changement des contrôles ci-dessus), pour un
// retour immédiat pendant que l'utilisateur ajuste — la sauvegarde définitive
// se fait quand même via le bouton natif "✓" (applyPencilStyle, surchargé
// plus bas), qui nettoie aussi la taille "générique" que le mécanisme natif
// aurait posée en trop.
function cfApplyPencilExtra(){
  if(!currentEditEl||currentEditEl.dataset.cfCustomLabel!=='1')return;
  const fieldId=currentEditEl.dataset.cfFieldId;
  const fontFamily=document.getElementById('cfPencilFontFamily').value;
  const fsDesktop=parseInt(document.getElementById('cfPencilFontSizePC').value,10)||14;
  const fsMobile=parseInt(document.getElementById('cfPencilFontSizeMobile').value,10)||14;
  if(!APP.cfPencilStyles)APP.cfPencilStyles={};
  APP.cfPencilStyles[fieldId]={fontFamily,fsDesktop,fsMobile};
  cfApplyPencilStylesCss();
}
// Régénère la feuille de style regroupant toutes les polices/tailles
// personnalisées, avec des règles PC et téléphone séparées (impossible à
// obtenir avec un simple style inline, qui ne connaît pas les media queries).
function cfApplyPencilStylesCss(){
  let style=document.getElementById('cfPencilStylesCss');
  if(!style){
    style=document.createElement('style');
    style.id='cfPencilStylesCss';
    document.head.appendChild(style);
  }
  const styles=APP.cfPencilStyles||{};
  let css='';
  Object.keys(styles).forEach(fieldId=>{
    const st=styles[fieldId];
    const sel='#cflabelf-'+fieldId+',#cflabele-'+fieldId;
    if(st.fontFamily)css+=sel+'{font-family:\''+st.fontFamily+'\',sans-serif !important;}\n';
    css+='@media(min-width:1101px){'+sel+'{font-size:'+(st.fsDesktop||14)+'px !important;}}\n';
    css+='@media(max-width:1100px){'+sel+'{font-size:'+(st.fsMobile||14)+'px !important;}}\n';
  });
  style.textContent=css;
}
const _cfOrigPencilSyncPanelToEl=window.pencilSyncPanelToEl;
window.pencilSyncPanelToEl=function(el){
  _cfOrigPencilSyncPanelToEl(el);
  try{
    cfEnsurePencilExtraControls();
    const extra=document.getElementById('cfPencilExtra');
    const nativeFsInput=document.getElementById('pencilFontSize');
    const isCustomLabel=!!(el&&el.dataset&&el.dataset.cfCustomLabel==='1');
    if(extra)extra.style.display=isCustomLabel?'inline-flex':'none';
    if(nativeFsInput){
      nativeFsInput.style.display=isCustomLabel?'none':'';
      if(nativeFsInput.previousElementSibling)nativeFsInput.previousElementSibling.style.display=isCustomLabel?'none':'';
    }
    if(isCustomLabel){
      const fieldId=el.dataset.cfFieldId;
      const st=(APP.cfPencilStyles&&APP.cfPencilStyles[fieldId])||{};
      document.getElementById('cfPencilFontFamily').value=st.fontFamily||CF_PENCIL_FONTS[0];
      document.getElementById('cfPencilFontSizePC').value=st.fsDesktop||14;
      document.getElementById('cfPencilFontSizeMobile').value=st.fsMobile||14;
    }
  }catch(e){console.warn('CF pencil sync:',e);}
};
const _cfOrigApplyPencilStyle=window.applyPencilStyle;
window.applyPencilStyle=function(){
  _cfOrigApplyPencilStyle();
  try{
    if(currentEditEl&&currentEditEl.dataset&&currentEditEl.dataset.cfCustomLabel==='1'){
      // L'appel natif ci-dessus vient de poser une taille de police unique
      // (identique PC/téléphone) directement en style inline — on la retire
      // pour laisser nos règles CSS séparées (voir cfApplyPencilStylesCss)
      // faire foi, sans quoi le style inline serait toujours prioritaire.
      currentEditEl.style.removeProperty('font-size');
      delete currentEditEl.dataset.userFs;
      // Idem pour la valeur déjà enregistrée par saveOneEdit() juste avant :
      // sans ce nettoyage, applyPencilEdits() la réappliquerait sans
      // distinction PC/téléphone au prochain chargement de page.
      const key=getEK(currentEditEl);
      const editsKey=accKey('tj_pencil_edits');
      const edits=ls(editsKey,{});
      if(edits[key]){ edits[key].fs=''; lss(editsKey,edits); }
      cfApplyPencilExtra();
      cfPersist();
    }
  }catch(e){console.warn('CF pencil style:',e);}
};

function cfInit(){
  try{
    cfLoad();
    cfEnsureOrders();
    cfEnsureModal();
    cfEnsureCard();
    cfEnsureHistoryGridStyle();
    cfApplyPencilStylesCss();
    cfInjectFormFields('f');
    cfInjectFormFields('e');
    cfEnsureChartsContainer();
    cfRenderKpiWidgets();
    cfApplyKpiOrder();
    cfLayoutKpiStrip();
    cfRenderCustomCharts();
    cfApplyChartOrder();
    cfApplyChartLayout();
    cfNormalizeChartHeights();
    if(typeof renderTable==='function')renderTable();
    cfRenderSettings();
  }catch(e){console.error('Erreur d\'initialisation des champs personnalisés :',e);}
}
document.addEventListener('DOMContentLoaded',function(){
  setTimeout(cfInit,120);
});
// Recalcule les mises en page dépendantes du nombre de cases (KPI) et de la
// largeur d'écran (graphiques) au franchissement du seuil PC/téléphone.
if(window.matchMedia){
  const _cfMq=window.matchMedia('(max-width:1100px)');
  const _cfOnBreakpointChange=function(){
    try{ cfLayoutKpiStrip(); cfApplyChartLayout(); cfNormalizeChartHeights(); }catch(e){}
  };
  if(_cfMq.addEventListener)_cfMq.addEventListener('change',_cfOnBreakpointChange);
  else if(_cfMq.addListener)_cfMq.addListener(_cfOnBreakpointChange);
}
