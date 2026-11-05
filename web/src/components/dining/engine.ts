// @ts-nocheck
// Phone directory interaction, adapted from shopping-dining-phone.html.
export function mountDining(host, listings, initialId) {
  const LISTINGS = listings
  const listeners = []
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts)
    listeners.push(() => target.removeEventListener(type, fn, opts))
  }
  const $ = (s, r = host) => r.querySelector(s)
  const $$ = (s, r = host) => Array.from(r.querySelectorAll(s))
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural = (n, a, b) => n === 1 ? a : (b || a + 's');
const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

const ICONS = {
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
  heart:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  chevR:'<path d="M9 5l7 7-7 7"/>', chevL:'<path d="M15 5l-7 7 7 7"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  pin:'<path d="M12 21s7-5.8 7-11a7 7 0 0 0-14 0c0 5.2 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  shield:'<path d="M12 3l7.5 3v5.5c0 4.7-3.2 8-7.5 9.5-4.3-1.5-7.5-4.8-7.5-9.5V6L12 3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  store:'<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5.5 12v8h13v-8"/><path d="M10 20v-4.5h4V20"/>',
  cake:'<path d="M4.5 20h15v-6.5a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2V20z"/><path d="M12 11.5v-3"/><path d="M12 8.5c-1.2-1.2-1.2-2.3 0-3.5 1.2 1.2 1.2 2.3 0 3.5z"/><path d="M4.5 16c2 1.5 3.5 1.5 5 0s3-1.5 5 0 3 1.5 5 0"/>',
  medical:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M7.5 12h9"/>',
  bag:'<path d="M5 8h14l-1 12.5H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  sparkle:'<path d="M11 3.5l1.9 5.6 5.6 1.9-5.6 1.9L11 18.5l-1.9-5.6L3.5 11l5.6-1.9L11 3.5z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"/>',
  home:'<path d="M3 11l9-7.5 9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/>',
  star:'<path d="M12 3l8.5 14.5h-17L12 3z"/><path d="M12 21L3.5 6.5h17L12 21z"/>',
  arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUR:'<path d="M7 17L17 7M8 7h9v9"/>',
  car:'<path d="M4 17v-5l2.2-5.5h11.6L20 12v5"/><path d="M3 12h18"/><circle cx="7.5" cy="14.8" r="1.2"/><circle cx="16.5" cy="14.8" r="1.2"/><path d="M5 17v2.5M19 17v2.5"/>',
  fork:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.5 1.5-3 5-3 8h3"/>',
  flower:'<circle cx="12" cy="6.5" r="2.5"/><circle cx="12" cy="13.5" r="2.5"/><circle cx="8.5" cy="10" r="2.5"/><circle cx="15.5" cy="10" r="2.5"/><circle cx="12" cy="10" r="1"/><path d="M12 16v5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="16" rx="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  gift:'<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20"/><path d="M12 8.5C10.5 5 7 4.5 7 7c0 1.5 2.5 1.5 5 1.5zM12 8.5C13.5 5 17 4.5 17 7c0 1.5-2.5 1.5-5 1.5z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-6-3.8-9s1.3-6.2 3.8-9z"/>',
  warn:'<path d="M12 3.5l9.5 16.5h-19L12 3.5z"/><path d="M12 10v4.5M12 17.5h.01"/>'
};
const ic = (n, s = 20, cls = '', sw = 1.7) =>
  `<svg class="ic ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
let _markN = 0;
const MARK = (s = 30) => {
  const gid = 'mk' + (++_markN);
  return `<svg class="mark" width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#ff9f1c"/></linearGradient></defs><rect x="1" y="1" width="30" height="30" rx="10" fill="url(#${gid})"/><g transform="translate(6.4 6.4) scale(.8)" fill="none" stroke="#1d1500" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${ICONS.store}</g></svg>`;
};

const CAT_NAME = {
  Restaurant:'Restaurants', Bakery:'Bakeries', Caterer:'Caterers',
  'Lodges-Safaris-Tours':'Lodges & safaris', Supermarket:'Supermarkets', Deli:'Delis',
  'Take Away':'Takeaways', Butchery:'Butcheries', 'Coffee Shop':'Coffee shops',
  'Function Coordinator':'Function coordinators', 'Fish Shop':'Fish shops',
  'Mobile Coffee Stall':'Mobile coffee', 'Mobile Pizza':'Mobile pizza', 'Mobile Bars':'Mobile bars',
  'Mobile ice cream bar':'Mobile ice cream', 'Old Age Home':'Old age homes', Abattoir:'Abattoirs',
  'Mobile Sweet Bar':'Mobile sweets', 'Mobile Food Truck':'Food trucks', 'Mobile Braai':'Mobile braai',
  'Crockery/Cutlery Hire':'Crockery & cutlery', 'Green Grocer':'Green grocer',
  'Ice Cream shop':'Ice cream', 'Liquor Store':'Liquor', 'Hospital meals':'Hospital meals',
  'Wedding Venues':'Wedding venues'
};
const catName = id => CAT_NAME[id] || id;
const DISTRICTS = [
  {id:'eat', name:'Restaurants & coffee', icon:'fork', hue:12, cats:['Restaurant','Coffee Shop','Take Away','Ice Cream shop','Old Age Home','Hospital meals']},
  {id:'bake', name:'Bakeries & delis', icon:'cake', hue:28, cats:['Bakery','Deli']},
  {id:'shop', name:'Markets & groceries', icon:'bag', hue:152, cats:['Supermarket','Butchery','Fish Shop','Green Grocer','Liquor Store','Abattoir']},
  {id:'events', name:'Catering & events', icon:'sparkle', hue:322, cats:['Caterer','Function Coordinator','Wedding Venues','Crockery/Cutlery Hire']},
  {id:'move', name:'On the move', icon:'car', hue:204, cats:['Mobile Coffee Stall','Mobile Pizza','Mobile Bars','Mobile ice cream bar','Mobile Sweet Bar','Mobile Food Truck','Mobile Braai']},
  {id:'travel', name:'Lodges & safaris', icon:'sun', hue:36, cats:['Lodges-Safaris-Tours']}
];
const D = id => DISTRICTS.find(d => d.id === id);
const distOfCat = cat => DISTRICTS.find(d => d.cats.includes(cat));
const GLYPH = {
  Restaurant:'fork', 'Coffee Shop':'fork', 'Take Away':'bag', 'Ice Cream shop':'cake',
  'Old Age Home':'home', 'Hospital meals':'medical', Bakery:'cake', Deli:'fork',
  Supermarket:'bag', Butchery:'bag', 'Fish Shop':'bag', 'Green Grocer':'flower',
  'Liquor Store':'bag', Abattoir:'bag', Caterer:'sparkle', 'Function Coordinator':'calendar',
  'Wedding Venues':'sparkle', 'Crockery/Cutlery Hire':'gift', 'Mobile Coffee Stall':'fork',
  'Mobile Pizza':'fork', 'Mobile Bars':'fork', 'Mobile ice cream bar':'cake',
  'Mobile Sweet Bar':'cake', 'Mobile Food Truck':'car', 'Mobile Braai':'fork',
  'Lodges-Safaris-Tours':'sun'
};
const CAT_HUE = {
  Restaurant:12, 'Coffee Shop':28, 'Take Away':18, 'Ice Cream shop':330, 'Old Age Home':170,
  'Hospital meals':188, Bakery:32, Deli:42, Supermarket:152, Butchery:356, 'Fish Shop':200,
  'Green Grocer':145, 'Liquor Store':280, Abattoir:8, Caterer:322, 'Function Coordinator':300,
  'Wedding Venues':340, 'Crockery/Cutlery Hire':210, 'Mobile Coffee Stall':36,
  'Mobile Pizza':16, 'Mobile Bars':48, 'Mobile ice cream bar':330, 'Mobile Sweet Bar':310,
  'Mobile Food Truck':204, 'Mobile Braai':24, 'Lodges-Safaris-Tours':36
};
const KASH = [
  ['m','Meat','meat'],
  ['d','Dairy','dairy'],
  ['c','Chalav Yisrael','cy'],
  ['p','Parev','parev'],
  ['h','Mehadrin','meh']
];
const KASH_HELP = {
  m:'Marked meat',
  d:'Marked dairy',
  c:'Marked chalav yisrael',
  p:'Marked parev',
  h:'Marked mehadrin'
};
const CITIES = ['All','Johannesburg','Cape Town','Other'];
const cityLabel = c => c === 'Other' ? 'Further afield' : c;

const bizById = id => LISTINGS.find(b => b.id === id);
const initials = n => n.replace(/&/g, ' ').split(/\s+/).filter(x => x && !/^(dr|the|and|of|co\.?)$/i.test(x)).slice(0, 2).map(x => x[0].toUpperCase()).join('');
const hueOf = b => ((CAT_HUE[b.cats[0]] || 36) + (hash(b.name) % 25) - 12 + 360) % 360;
const inCity = b => S.city === 'All' || b.city === S.city;
const matchKash = b => S.kash.every(k => b.k[k]);
const visible = () => LISTINGS.filter(b => inCity(b) && matchKash(b));
const inCats = (b, ids) => b.cats.some(c => ids.includes(c));

function kashFlags(b) {
  return KASH.filter(([k]) => b.k[k]).map(([k, label, cls]) => `<span class="kflag ${cls}">${esc(label)}</span>`).join('');
}
function storyOf(b) {
  const note = b.line && b.line.length <= 90 ? b.line : '';
  if (b.desc && note) return `${b.desc} · ${note}`;
  if (b.desc) return b.desc;
  if (b.line) return b.line;
  const cats = b.cats.map(catName).join(' · ');
  return `${cats} · ${b.place}`;
}
function metaOf(b) {
  const cats = b.cats.slice(0, 2).map(catName).join(' · ');
  const more = b.cats.length > 2 ? ` +${b.cats.length - 2}` : '';
  return `${cats}${more} · ${b.place}`;
}

function storefront(b) {
  const h = hueOf(b);
  let nm = String(b.name || '').replace(/\s*\([^)]*\)/g, '').trim().toUpperCase();
  if (nm.length > 26) nm = nm.slice(0, 24) + '…';
  const fs = Math.max(8.5, Math.min(15, 232 / (nm.length * .66))), tl = Math.min(232, nm.length * fs * .66);
  const w = 276 / 14, r = (w / 2).toFixed(2), v = hash(b.id) % 3;
  let awn = '', bulbs = '';
  for (let i = 0; i < 14; i++) awn += `<path class="${i % 2 ? 'sf-s2' : 'sf-s1'}" d="M${(22 + i * w).toFixed(1)} 77h${w.toFixed(1)}v15a${r} ${r} 0 0 1 -${w.toFixed(1)} 0z"/>`;
  for (let i = 0; i < 11; i++) { const t = (i + .5) / 11; bulbs += `<circle class="sf-bulb" style="animation-delay:${((i % 4) * .45).toFixed(2)}s" cx="${(26 + 268 * t).toFixed(1)}" cy="${(17 + 56 * t * (1 - t)).toFixed(1)}" r="2.4"/>`; }
  const shelf = v === 0
    ? `<rect class="sf-item" x="206" y="130" width="15" height="20" rx="3"/><rect class="sf-item2" x="231" y="122" width="17" height="28" rx="3"/><rect class="sf-item" x="258" y="134" width="16" height="16" rx="3"/><rect class="sf-shelf" x="202" y="150" width="76" height="3" rx="1.5"/>`
    : v === 1
    ? `<circle class="sf-item" cx="218" cy="141" r="9"/><circle class="sf-item2" cx="242" cy="137" r="13"/><circle class="sf-item" cx="266" cy="142" r="8"/><rect class="sf-shelf" x="202" y="150" width="76" height="3" rx="1.5"/>`
    : `<path class="sf-wire2" d="M216 109v16M242 109v9M268 109v18"/><path class="sf-item" d="M207 136a9 9 0 0 1 18 0z" transform="translate(0 -11)"/><path class="sf-item2" d="M231 128a11 11 0 0 1 22 0z" transform="translate(0 -10)"/><path class="sf-item" d="M259 138a9 9 0 0 1 18 0z" transform="translate(0 -11)"/><rect class="sf-shelf" x="204" y="152" width="72" height="3" rx="1.5"/>`;
  const glyph = ICONS[GLYPH[b.cats[0]]] || ICONS.store;
  return `<div class="sf" style="--h:${h}"><svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustrated storefront: ${esc(b.name)}">
<g class="sf-stars"><circle cx="14" cy="10" r="1"/><circle cx="52" cy="22" r=".8"/><circle cx="96" cy="8" r="1.1"/><circle cx="214" cy="9" r=".9"/><circle cx="262" cy="26" r="1"/><circle cx="306" cy="8" r=".8"/></g>
<rect class="sf-bg1" x="-6" y="88" width="34" height="100"/><rect class="sf-bg1" x="294" y="66" width="34" height="122"/>
<path class="sf-wire" d="M26 17Q160 45 294 17"/>${bulbs}
<rect class="sf-ground" x="0" y="178" width="320" height="22"/>
<rect class="sf-wall" x="22" y="34" width="276" height="146" rx="8"/>
<rect class="sf-sign-bg" x="34" y="42" width="252" height="28" rx="8"/><rect class="sf-sign-line" x="36.5" y="44.5" width="247" height="23" rx="6"/>
<text class="sf-name" x="160" y="61" text-anchor="middle" font-size="${fs.toFixed(1)}" textLength="${tl.toFixed(0)}" lengthAdjust="spacingAndGlyphs">${esc(nm)}</text>
<rect class="sf-rail" x="18" y="72" width="284" height="5" rx="2.5"/>${awn}<rect class="sf-shade" x="22" y="93" width="276" height="10"/>
<rect class="sf-sill" x="30" y="168" width="100" height="5" rx="2.5"/><rect class="sf-sill" x="190" y="168" width="100" height="5" rx="2.5"/>
<rect class="sf-glass" x="36" y="108" width="88" height="60" rx="8"/><circle class="sf-glow" cx="80" cy="138" r="27"/>
<svg class="sf-glyph" x="62" y="120" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>
<path class="sf-shine" d="M44 160L70 108h14L58 160z"/>
<rect class="sf-glass" x="196" y="108" width="88" height="60" rx="8"/>${shelf}<path class="sf-shine" d="M204 160L230 108h14L218 160z"/>
<rect class="sf-door" x="136" y="104" width="48" height="76" rx="7"/><rect class="sf-glass" x="142" y="110" width="36" height="38" rx="5"/>
<rect class="sf-tag" x="149" y="122" width="22" height="10" rx="3"/><text class="sf-tagtxt" x="160" y="129.1" text-anchor="middle" font-size="4.6">KOSHER</text>
<circle class="sf-knob" cx="177" cy="152" r="2.4"/><rect class="sf-mezz" x="185.5" y="128" width="3.2" height="11" rx="1.4" transform="rotate(10 187 133)"/>
<rect class="sf-pot" x="8" y="166" width="11" height="14" rx="3"/><circle class="sf-leaf" cx="13.5" cy="158" r="8.5"/><rect class="sf-pot" x="301" y="166" width="11" height="14" rx="3"/><circle class="sf-leaf" cx="306.5" cy="158" r="8.5"/>
</svg></div>`;
}
function logo(b, size) {
  const sz = {xs:30, sm:46, md:60, lg:84}[size] || 60;
  return `<div class="logo logo-ok" style="--sz:${sz}px;--h:${hueOf(b)}"><span>${esc(initials(b.name) || '•')}</span></div>`;
}

const S = { view:'cards', city:'All', kash:[], saved:[], recent:[], search:{q:'', tag:null} };
try {
  const saved = JSON.parse(localStorage.getItem('jyp-shopping-dining') || 'null');
  if (saved) {
    if (CITIES.includes(saved.city)) S.city = saved.city;
    if (saved.view === 'list' || saved.view === 'cards') S.view = saved.view;
    if (Array.isArray(saved.kash)) S.kash = saved.kash.filter(k => KASH.some(x => x[0] === k));
    if (Array.isArray(saved.saved)) S.saved = saved.saved.filter(id => bizById(id));
    if (Array.isArray(saved.recent)) S.recent = saved.recent.slice(0, 6);
  }
} catch (e) {}
const persist = () => { try { localStorage.setItem('jyp-shopping-dining', JSON.stringify({view:S.view, city:S.city, kash:S.kash, saved:S.saved, recent:S.recent})); } catch (e) {} };

const nav = {tab:'browse', dir:'tab', stacks:{
  browse:[{n:'browse', p:{}}], search:[{n:'search', p:{}}], saved:[{n:'saved', p:{}}], about:[{n:'about', p:{}}]
}};
const SCREENS = {}, A = {}, INPUTS = {};
const stack = () => nav.stacks[nav.tab];
const cur = () => stack()[stack().length - 1];
function push(n, p) { stack().push({n, p:p || {}}); nav.dir = 'push'; render(); }
function back() { const s = stack(); if (s.length > 1) { s.pop(); nav.dir = 'pop'; render(); } }
function goTab(t) {
  if (nav.tab === t) {
    const s = nav.stacks[t];
    if (s.length > 1) { s.length = 1; nav.dir = 'pop'; render(); }
    else $('#view').scrollTo({top:0, behavior:'smooth'});
  } else { nav.tab = t; nav.dir = 'tab'; render(); }
}

function card(b, mode) {
  const saved = S.saved.includes(b.id);
  const open = `data-act="open" data-id="${esc(b.id)}" role="button" tabindex="0" aria-label="${esc(b.name)}"`;
  const flags = kashFlags(b);
  const heart = `<button class="sc-save ${saved ? 'on' : ''}" data-act="save" data-id="${esc(b.id)}" aria-label="${saved ? 'Remove from saved' : 'Save'} ${esc(b.name)}" aria-pressed="${saved}">${ic('heart', 19, saved ? 'filled' : '')}</button>`;
  if (mode === 'h') return `<article class="scard h" ${open}>
    <div class="sc-thumb">${storefront(b)}</div>
    <div class="sc-main2"><h3 class="biz-name">${esc(b.name)}</h3><div class="biz-meta">${esc(metaOf(b))}</div>${flags ? `<div class="kashrow">${flags}</div>` : ''}</div>
    ${ic('chevR', 18, 'chev')}</article>`;
  const art = `<div class="sc-art">${storefront(b)}${b.k.h ? `<span class="sc-badge">${ic('star', 12, '', 2)}Mehadrin</span>` : ''}${heart}<span class="sc-logo">${logo(b, 'sm')}</span></div>`;
  if (mode === 'feat') return `<article class="scard feat" ${open}>${art}<div class="sc-body"><h3 class="biz-name">${esc(b.name)}</h3><div class="biz-meta">${esc(metaOf(b))}</div><div class="sc-foot">${flags || `<span class="recs">${esc(b.place)}</span>`}</div></div></article>`;
  return `<article class="scard" ${open}>${art}<div class="sc-body"><h3 class="biz-name">${esc(b.name)}</h3><div class="biz-meta">${esc(metaOf(b))}</div><p class="biz-story">${esc(storyOf(b))}</p><div class="sc-foot"><span class="jo">${ic('star', 11, '', 2)}Kosher listing</span>${flags ? `<span class="kashrow">${flags}</span>` : ''}</div></div></article>`;
}

function kashChips() {
  const chips = KASH.map(([k, label]) => `<button class="chip ${S.kash.includes(k) ? 'on' : ''}" data-act="kash" data-v="${k}">${S.kash.includes(k) ? ic('check', 13, '', 2.2) : ''}${esc(label)}</button>`).join('');
  const clear = S.kash.length ? `<button class="chip" data-act="kashclear">Clear</button>` : '';
  return `<div class="hscroll tight" aria-label="Kashrut flags">${chips}${clear}</div>`;
}

function tile(d, wide) {
  const list = visible().filter(b => inCats(b, d.cats));
  const n = list.length;
  const avs = list.slice(0, 3).map(b => logo(b, 'xs')).join('') + (n > 3 ? `<span class="av-more">+${n - 3}</span>` : '');
  const names = list.slice(0, 3).map(b => `<span class="tn">${esc(b.name)}</span>`).join('') || `<span class="tn soon">None in this view</span>`;
  return `<button class="tile ${wide ? 'wide' : ''}" style="--h:${d.hue}" data-act="district" data-d="${d.id}" data-c="all">
    <span class="tile-l"><span class="tile-ic">${ic(d.icon, 23)}</span><span class="tile-name">${esc(d.name)}</span><span class="tile-count">${n} ${plural(n, 'listing')}</span>${n ? `<span class="avs">${avs}</span>` : ''}</span>
    ${wide ? `<span class="tile-names">${names}</span>` : ''}
    <span class="tile-go">${ic('arrowUR', 15)}</span>
  </button>`;
}
function mall(d) {
  const list = visible().filter(b => inCats(b, d.cats));
  const rows = d.cats.map(id => {
    const l = list.filter(b => b.cats.includes(id));
    if (!l.length && S.city !== 'All') return '';
    const names = l.slice(0, 2).map(b => b.name).join(' · ') || 'None in this view';
    return `<button class="aisle" data-act="district" data-d="${d.id}" data-c="${esc(id)}"><span class="aisle-ic">${ic(GLYPH[id] || d.icon, 20)}</span><span class="aisle-main"><b>${esc(catName(id))}</b><small>${l.length} · ${esc(names)}</small></span>${ic('chevR', 16)}</button>`;
  }).join('');
  return `<div class="tile wide mall" style="--h:${d.hue}"><button class="mall-head" data-act="district" data-d="${d.id}" data-c="all"><span class="tile-ic">${ic(d.icon, 23)}</span><span class="mall-t"><span class="tile-name">${esc(d.name)}</span><span class="tile-count">${list.length} ${plural(list.length, 'listing')}</span></span>${ic('arrowR', 18)}</button><div class="aisles">${rows}</div></div>`;
}

const scopeLine = () => S.city === 'All' ? 'South Africa' : cityLabel(S.city);

SCREENS.browse = () => {
  const here = visible();
  const feats = here.slice().sort((a, b) => (b.line ? 1 : 0) - (a.line ? 1 : 0) || b.webs.length - a.webs.length || a.name.localeCompare(b.name)).slice(0, 8);
  const jump = DISTRICTS.map(d => `<button class="chip lg" data-act="district" data-d="${d.id}" data-c="all">${ic(d.icon, 17)}${esc(d.name)}</button>`).join('');
  return `
  <section class="hero">
    <div class="hero-chip"><span class="live"></span>${here.length} kosher ${plural(here.length, 'listing')} · ${esc(scopeLine())}</div>
    <h1>Find a <span class="hl">kosher</span> table, first.</h1>
    <p>Restaurants, bakeries, markets, caterers and lodges from the Kosher SA shopping and dining directory.</p>
    <button class="searchbar" data-act="gosearch">${ic('search', 21)}<span>Search bakeries, caterers, lodges…</span><span class="go">${ic('arrowR', 20)}</span></button>
    <div class="hscroll quick" aria-label="Districts">${jump}</div>
  </section>
  <div class="pad">
    <div class="sublab tightlab">Kashrut <span class="cnt">${S.kash.length ? 'Match all selected' : 'Any listing'}</span></div>
    ${kashChips()}
  </div>
  ${feats.length ? `<div class="pad sec-row"><div><div class="eyebrow">Storefronts · ${esc(scopeLine())}</div><h2 class="h2s">Step inside</h2></div></div>
  <div class="rail">${feats.map(b => card(b, 'feat')).join('')}</div>` : `<div class="pad"><div class="empty"><div class="empty-ic">${ic('search', 26)}</div><h3>No listings in this view</h3><p>Clear a kashrut flag or switch city to see more of the directory.</p></div></div>`}
  <div class="pad">
    <div class="sec-head"><div class="eyebrow">Directory</div><h2 class="h2s">Shop the whole table</h2></div>
    <div class="grid">
      ${tile(D('eat'), true)}
      ${tile(D('bake'))}${tile(D('travel'))}
      ${mall(D('shop'))}
      ${mall(D('events'))}
      ${mall(D('move'))}
    </div>
    <p class="foot-quiet">${ic('shield', 14)}Contact details are the ones published in the directory. A kashrut flag appears only when that column was marked Yes.</p>
  </div>`;
};

SCREENS.district = p => {
  const d = D(p.d);
  p.c = p.c || 'all';
  p.sort = p.sort || 'az';
  const catIds = p.c === 'all' ? d.cats : [p.c];
  let res = visible().filter(b => inCats(b, catIds));
  res = res.slice().sort(p.sort === 'listed' ? (a, b) => a.i - b.i : (a, b) => a.name.localeCompare(b.name));
  const title = p.c === 'all' ? d.name : catName(p.c);
  const cats = d.cats.length > 1 ? `<div class="hscroll tight"><button class="chip ${p.c === 'all' ? 'on' : ''}" data-act="distcat" data-v="all">All</button>${d.cats.map(id => `<button class="chip ${p.c === id ? 'on' : ''}" data-act="distcat" data-v="${esc(id)}">${esc(catName(id))}</button>`).join('')}</div>` : '';
  const list_ = S.view === 'list';
  const list = res.length
    ? `<div class="stack ${list_ ? 'compact' : ''}">${res.map(b => card(b, list_ ? 'h' : undefined)).join('')}</div>`
    : `<div class="empty"><div class="empty-ic">${ic(d.icon, 26)}</div><h3>Nothing in this view</h3><p>No ${esc(title.toLowerCase())} ${S.city === 'All' ? 'match these kashrut flags' : 'in ' + cityLabel(S.city) + ' for these flags'}.</p>${S.kash.length ? `<button class="btn ghost small" data-act="kashclear">Clear kashrut flags</button>` : ''}</div>`;
  return `<div class="pad">
    <div class="dist-hero" style="--h:${d.hue}"><span class="dh-glyph">${ic(p.c === 'all' ? d.icon : (GLYPH[p.c] || d.icon), 132, '', 1.1)}</span><div class="eyebrow">${esc(d.name)}</div><h1 class="h1s">${esc(title)}</h1><p class="lede">${res.length} ${plural(res.length, 'listing')} · ${esc(scopeLine())}</p></div>
    ${cats ? `<div class="mt">${cats}</div>` : ''}
    <div class="sublab tightlab">Kashrut</div>
    ${kashChips()}
    <div class="sortbar"><div class="seg2 mini" role="group" aria-label="Sort"><button class="${p.sort === 'az' ? 'on' : ''}" data-act="distsort" data-v="az">A–Z</button><button class="${p.sort === 'listed' ? 'on' : ''}" data-act="distsort" data-v="listed">As listed</button></div><div class="seg2 mini icons" role="group" aria-label="View"><button class="${!list_ ? 'on' : ''}" data-act="distview" data-v="cards" aria-label="Storefront cards">${ic('grid', 17)}</button><button class="${list_ ? 'on' : ''}" data-act="distview" data-v="list" aria-label="Compact list">${ic('list', 17)}</button></div></div>
    ${list}
  </div>`;
};

function telHref(p) { return p.wa ? `https://wa.me/${p.tel.replace(/\D/g, '')}` : `tel:${p.tel}`; }
function mapHref(b) {
  if (b.maps.length) return b.maps[0];
  const q = b.address || (b.name + ' South Africa');
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
}
function hostOf(url) { try { return new URL(url).host.replace(/^www\./, ''); } catch (e) { return url; } }

function contactBlock(b) {
  const rows = [];
  if (b.address) rows.push(`<div class="crow">${ic('pin', 18)}<div><small>Address</small><b>${esc(b.address)}</b></div></div>`);
  rows.push(`<a class="crow link" href="${esc(mapHref(b))}" target="_blank" rel="noopener">${ic('pin', 18)}<div><small>Map</small><b>Open in Google Maps</b></div>${ic('chevR', 16)}</a>`);
  b.phones.forEach(p => {
    const kind = p.wa ? 'WhatsApp' : 'Phone';
    const label = p.label ? `${kind} · ${p.label}` : (p.wa ? 'WhatsApp · tap to chat' : 'Phone · tap to call');
    rows.push(`<a class="crow link" href="${esc(telHref(p))}" ${p.wa ? 'target="_blank" rel="noopener"' : ''}>${ic('phone', 18)}<div><small>${esc(label)}</small><b>${esc(p.disp)}</b></div>${ic('chevR', 16)}</a>`);
  });
  b.emails.forEach(e => rows.push(`<a class="crow link" href="mailto:${esc(e)}">${ic('mail', 18)}<div><small>Email</small><b>${esc(e)}</b></div>${ic('chevR', 16)}</a>`));
  b.webs.forEach(u => rows.push(`<a class="crow link" href="${esc(u)}" target="_blank" rel="noopener">${ic('globe', 18)}<div><small>Website</small><b>${esc(hostOf(u))}</b></div>${ic('chevR', 16)}</a>`));
  if (b.ig) rows.push(`<a class="crow link" href="${esc(b.ig)}" target="_blank" rel="noopener">${ic('globe', 18)}<div><small>Instagram</small><b>${esc(hostOf(b.ig))}</b></div>${ic('chevR', 16)}</a>`);
  if (b.fb) rows.push(`<a class="crow link" href="${esc(b.fb)}" target="_blank" rel="noopener">${ic('globe', 18)}<div><small>Facebook</small><b>Open page</b></div>${ic('chevR', 16)}</a>`);
  if (rows.length === 1 && !b.address && !b.phones.length) rows.push(`<div class="crow">${ic('info', 18)}<div><small>Contact</small><b>No phone or email was published for this listing.</b></div></div>`);
  return `<div class="contact card" id="ms-contact">${rows.join('')}</div>`;
}

SCREENS.biz = p => {
  const b = bizById(p.id);
  if (!b) return `<div class="pad"><div class="empty"><h3>Listing unavailable</h3></div></div>`;
  const saved = S.saved.includes(b.id);
  const flags = kashFlags(b);
  const call = b.phones[0];
  const callBtn = call
    ? `<a class="act primary" href="${esc(telHref(call))}" ${call.wa ? 'target="_blank" rel="noopener"' : ''}>${ic('phone', 20)}<span>${call.wa ? 'WhatsApp' : 'Call'}</span></a>`
    : `<button class="act primary" data-act="jump" data-v="ms-contact">${ic('phone', 20)}<span>Contact</span></button>`;
  const cats = b.cats.map(id => `<button class="chip tagc" data-act="opencat" data-v="${esc(id)}">${esc(catName(id))}</button>`).join('');
  return `
  <section class="ms-hero" style="--h:${hueOf(b)}">
    <div class="ms-sf">${storefront(b)}</div>
    <div class="ms-id">
      ${logo(b, 'lg')}
      <h1 class="ms-name">${esc(b.name)}</h1>
      <p class="ms-story">${esc(storyOf(b))}</p>
      <div class="ms-meta"><span class="ms-loc">${ic('pin', 14)}${esc(b.place)} · ${esc(cityLabel(b.city))}</span></div>
      ${flags ? `<div class="kashrow" style="margin-top:12px">${flags}</div>` : ''}
    </div>
    <div class="ms-actions">
      <button class="act ${saved ? 'on' : ''}" data-act="save" data-id="${esc(b.id)}" aria-pressed="${saved}">${ic('heart', 20, saved ? 'filled' : '')}<span>${saved ? 'Saved' : 'Save'}</span></button>
      <a class="act" href="${esc(mapHref(b))}" target="_blank" rel="noopener">${ic('pin', 20)}<span>Map</span></a>
      ${callBtn}
    </div>
  </section>
  <nav class="ms-nav" id="msnav" aria-label="Listing sections">
    <button class="on" data-act="jump" data-v="ms-about">About</button>
    <button data-act="jump" data-v="ms-contact">Contact</button>
  </nav>
  <section class="ms-sec pad" id="ms-about">
    <div class="eyebrow">About</div><h2 class="h2s">${esc(b.name)}</h2>
    ${b.desc ? `<p class="body">${esc(b.desc)}</p>` : ''}
    ${b.notes ? `<p class="notes">${esc(b.notes)}</p>` : (b.desc ? '' : `<p class="body">${esc(b.name)} is listed as ${esc(b.cats.map(catName).join(', '))} in ${esc(b.place)}.</p>`)}
    <div class="sublab">Categories</div>
    <div class="chips">${cats}</div>
  </section>
  <section class="ms-sec pad" id="ms-contact">
    <div class="eyebrow">Contact</div><h2 class="h2s">As published</h2>
    ${contactBlock(b)}
  </section>
  <footer class="ms-foot pad">${MARK(24)}<p>${esc(b.name)} is listed in the Kosher SA shopping and dining directory on <b>Jewish Yellow Pages</b>.${b.post ? ` Ref ${esc(b.post)}.` : ''}</p></footer>`;
};

function hay(b) {
  return [b.name, b.cats.join(' '), b.cats.map(catName).join(' '), b.address, b.place, b.city, cityLabel(b.city), b.notes, b.line, b.desc || '',
    b.k.p ? 'parev' : '', b.k.d ? 'dairy' : '', b.k.c ? 'chalav yisrael chalav' : '', b.k.m ? 'meat' : '', b.k.h ? 'mehadrin' : ''
  ].join(' ').toLowerCase();
}
function groupList(list) {
  const order = S.city === 'All' ? ['Johannesburg', 'Cape Town', 'Other'] : [S.city];
  let first = true, html = '';
  order.forEach(c => {
    const mine = list.filter(b => b.city === c);
    if (!mine.length) return;
    html += `<div class="sec-label ${first ? 'first' : ''}">${esc(cityLabel(c))} <span class="n">${mine.length}</span></div><div class="stack compact">${mine.map(b => card(b, 'h')).join('')}</div>`;
    first = false;
  });
  return html;
}
function searchBody() {
  const q = S.search.q.trim(), tag = S.search.tag;
  if (tag) {
    const list = LISTINGS.filter(b => inCity(b) && matchKash(b) && (b.cats.includes(tag) || (tag.length === 1 && b.k[tag]))).sort((a, b) => a.name.localeCompare(b.name));
    const label = tag.length === 1 ? (KASH.find(k => k[0] === tag) || [, tag])[1] : catName(tag);
    return `<div class="active-tag"><span>Showing</span><button class="chip on" data-act="cleartag">${esc(label)}${ic('close', 14)}</button></div>${list.length ? groupList(list) : `<div class="empty"><h3>No listings tagged ${esc(label)}</h3></div>`}`;
  }
  if (!q) {
    const pops = ['Bakery', 'Restaurant', 'Caterer', 'Butchery', 'Supermarket', 'Lodges-Safaris-Tours', 'Deli', 'Take Away'];
    return `${S.recent.length ? `<div class="sec-label first">Recent</div><div class="chips">${S.recent.map(t => `<button class="chip" data-act="recentq" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
      <div class="sec-label ${S.recent.length ? '' : 'first'}">Categories</div><div class="chips">${pops.map(id => `<button class="chip" data-act="opencat" data-v="${esc(id)}">${esc(catName(id))}</button>`).join('')}</div>
      <div class="sec-label ${S.recent.length ? '' : 'first'}">Browse by category</div>`;
  }
  const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
  const match = txt => toks.every(t => txt.includes(t));
  const cats = [...new Set(LISTINGS.flatMap(b => b.cats))].filter(id => match((id + ' ' + catName(id)).toLowerCase()));
  const biz = LISTINGS.filter(b => inCity(b) && matchKash(b) && match(hay(b))).sort((a, b) => a.name.localeCompare(b.name));
  if (!cats.length && !biz.length) return `<div class="empty"><div class="empty-ic">${ic('search', 26)}</div><h3>Nothing matches “${esc(q)}”</h3><p>Try a business name, a suburb, or a category such as bakery or lodge.</p></div>`;
  let h = '';
  if (cats.length) h += `<div class="sec-label first">Categories</div><div class="rows">${cats.slice(0, 6).map(id => {
    const d = distOfCat(id);
    const n = visible().filter(b => b.cats.includes(id)).length;
    return `<button class="row" data-act="district" data-d="${d.id}" data-c="${esc(id)}"><span class="row-ic">${ic(GLYPH[id] || 'store', 20)}</span><span class="row-main"><b>${esc(catName(id))}</b><small>${esc(d.name)} · ${n} in this view</small></span>${ic('chevR', 16)}</button>`;
  }).join('')}</div>`;
  if (biz.length) h += groupList(biz);
  return h;
}
SCREENS.search = () => `
  <div class="pad sr-top"><div class="sbox">${ic('search', 20)}<input id="q" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search a business, suburb or category" value="${esc(S.search.q)}" data-input="search" aria-label="Search"><button class="sclear ${S.search.q ? 'show' : ''}" id="sclear" data-act="clearq" aria-label="Clear search">${ic('close', 16)}</button></div></div>
  <div class="pad"><div class="sublab tightlab">Kashrut <span class="cnt">${S.kash.length ? 'Match all selected' : 'Any listing'}</span></div>${kashChips()}</div>
  <div class="pad" id="sres">${searchBody()}</div>`;

SCREENS.saved = () => {
  const all = S.saved.map(bizById).filter(Boolean);
  const here = all.filter(inCity);
  const away = all.length - here.length;
  if (!all.length) return `<div class="pad"><div class="empty tall"><div class="empty-ic">${ic('heart', 28)}</div><h3>Nothing saved yet</h3><p>Tap the heart on a storefront to keep it on this device.</p><button class="btn gold" data-act="tab" data-v="browse">Browse the directory</button></div></div>`;
  return `<div class="pad"><div class="dist-head"><div class="eyebrow">On this device</div><h1 class="h1s">Saved</h1><p class="lede">${here.length} ${plural(here.length, 'listing')} · ${esc(scopeLine())}</p></div>
    ${here.length ? `<div class="stack">${here.map(b => card(b)).join('')}</div>` : `<div class="mini-empty">Nothing saved in ${esc(scopeLine())}.</div>`}
    ${away ? `<p class="foot-quiet">${away} saved in another city. Switch city to see them.</p>` : ''}</div>`;
};

SCREENS.about = () => {
  const counts = [
    ['All', LISTINGS.length],
    ['Johannesburg', LISTINGS.filter(b => b.city === 'Johannesburg').length],
    ['Cape Town', LISTINGS.filter(b => b.city === 'Cape Town').length],
    ['Other', LISTINGS.filter(b => b.city === 'Other').length]
  ];
  return `<div class="pad">
    <div class="welcome card"><div class="sh-ic">${ic('store', 22)}</div><h2 class="h2s">Shopping &amp; dining</h2><p class="body">A storefront view of the published shopping and dining directory — ${LISTINGS.length} listings, with the contact details and kashrut flags on each listing.</p><a class="btn ghost block" href="/apply" style="margin-top:14px">Apply to list a business</a></div>
    <div class="stats">${counts.slice(1).map(([c, n]) => `<div><b>${n}</b><span>${esc(cityLabel(c))}</span></div>`).join('')}</div>
    <div class="sec-label">Kashrut flags</div>
    <div class="guide">
      ${KASH.map(([k, label, cls]) => `<div class="card"><h3><span class="kflag ${cls}">${esc(label)}</span></h3><p>${esc(KASH_HELP[k])}. ${LISTINGS.filter(b => b.k[k]).length} listings in the directory.</p></div>`).join('')}
    </div>
    <p class="foot-quiet">${ic('info', 14)}A blank flag in the spreadsheet is not shown. Notes are the directory’s own remarks, including holiday-only kitchens and “by arrangement”.</p>
  </div>`;
};

function titleOf(e) {
  const p = e.p || {};
  if (e.n === 'district') {
    const d = D(p.d);
    const title = p.c && p.c !== 'all' ? catName(p.c) : d.name;
    return {title, sub: scopeLine()};
  }
  if (e.n === 'biz') {
    const b = bizById(p.id);
    return b ? {title: b.name, sub: b.place + ' · ' + cityLabel(b.city)} : {title: 'Listing', sub: ''};
  }
  return {title:'', sub:''};
}
function headerHTML(e) {
  const root = stack().length === 1;
  let left;
  if (root) left = `<div class="brand">${MARK(32)}<div><div class="word">Jewish <b>Yellow</b> Pages</div><div class="subline">Shopping &amp; dining</div></div></div>`;
  else { const t = titleOf(e); left = `<div class="brand"><button class="backbtn" data-act="back" aria-label="Back">${ic('chevL', 20)}</button><div class="ttl"><div class="ttl-main">${esc(t.title)}</div><div class="ttl-sub">${esc(t.sub)}</div></div></div>`; }
  const showCity = ['browse', 'search', 'saved', 'about', 'district'].includes(e.n);
  const city = showCity ? `<div class="cityseg" role="tablist" aria-label="Place">${CITIES.map(c => `<button class="${S.city === c ? 'on' : ''}" data-act="city" data-v="${c}" role="tab" aria-selected="${S.city === c}">${ic('pin', 13)}${c === 'Other' ? 'Other' : c}</button>`).join('')}</div>` : '';
  return `<div class="bar1">${left}</div>${city}`;
}
const TABS = [['browse', 'Browse', 'grid'], ['search', 'Search', 'search'], ['saved', 'Saved', 'heart'], ['about', 'Guide', 'info']];
function renderTabs() {
  $('#tabbar').innerHTML = TABS.map(([id, l, i]) =>
    `<button class="tab ${nav.tab === id ? 'on' : ''}" data-act="tab" data-v="${id}" aria-label="${l}" ${nav.tab === id ? 'aria-current="page"' : ''}>${ic(i, 23)}<span>${l}</span>${id === 'saved' && S.saved.length ? `<span class="badge">${S.saved.length}</span>` : ''}</button>`).join('');
}
function render(opts) {
  opts = opts || {};
  const e = cur(), view = $('#view'), top = opts.keep ? view.scrollTop : 0;
  $('#appbar').innerHTML = headerHTML(e);
  const anim = opts.keep ? '' : ({push:'a-push', pop:'a-pop', tab:'a-tab'}[nav.dir] || '');
  view.innerHTML = `<div class="page ${anim}" data-screen="${e.n}">${SCREENS[e.n](e.p || {})}</div>`;
  view.scrollTop = top;
  view.onscroll = e.n === 'biz' ? spy : null;
  renderTabs();
  if (e.n === 'biz') spy();
  if (opts.after) opts.after();
}
function spy() {
  const nv = $('#msnav'); if (!nv) return;
  const view = $('#view'), vt = view.getBoundingClientRect().top, nh = nv.offsetHeight;
  const art = $('.ms-sf'); if (art) art.style.setProperty('--py', Math.min(view.scrollTop * .14, 22).toFixed(1));
  let active = null;
  $$('.ms-sec').forEach(s => { if (s.getBoundingClientRect().top - vt - nh - 28 <= 0) active = s.id; });
  if (!active) active = 'ms-about';
  $$('button', nv).forEach(b => b.classList.toggle('on', b.dataset.v === active));
}
function jumpTo(id) {
  const s = $('#' + id), view = $('#view'), nv = $('#msnav'); if (!s) return;
  const top = s.getBoundingClientRect().top - view.getBoundingClientRect().top + view.scrollTop - (nv ? nv.offsetHeight : 0) - 6;
  view.scrollTo({top: Math.max(0, top), behavior: 'smooth'});
}
let toastT = null;
function toast(msg) {
  const t = $('#toast');
  t.className = 'toast';
  t.innerHTML = `${ic('check', 17, '', 2)}<span>${esc(msg)}</span>`;
  void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
function addRecent(v) { S.recent = [v].concat(S.recent.filter(x => x.toLowerCase() !== v.toLowerCase())).slice(0, 6); persist(); }

A.gosearch = () => { nav.tab = 'search'; nav.dir = 'tab'; render({after() { const q = $('#q'); if (q) q.focus(); }}); };
A.district = d => push('district', {d: d.d, c: d.c || 'all', sort: 'az'});
A.distcat = d => { const e = cur(); e.p.c = d.v; render({keep: true}); };
A.distsort = d => { cur().p.sort = d.v; render({keep: true}); };
A.distview = d => { S.view = d.v === 'list' ? 'list' : 'cards'; persist(); render({keep: true}); };
A.open = d => push('biz', {id: d.id});
A.back = () => performBack();
A.tab = d => goTab(d.v);
A.city = d => { S.city = d.v; persist(); render({keep: true}); };
A.kash = d => {
  const i = S.kash.indexOf(d.v);
  if (i > -1) S.kash.splice(i, 1); else S.kash.push(d.v);
  persist(); render({keep: true});
};
A.kashclear = () => { S.kash = []; persist(); render({keep: true}); };
A.save = d => {
  const i = S.saved.indexOf(d.id);
  if (i > -1) { S.saved.splice(i, 1); toast('Removed from Saved'); }
  else { S.saved.push(d.id); toast('Saved on this device'); }
  persist(); render({keep: true});
};
A.jump = d => jumpTo(d.v);
A.opencat = d => {
  const dist = distOfCat(d.v);
  if (!dist) return;
  nav.tab = 'browse';
  nav.stacks.browse = [{n:'browse', p:{}}, {n:'district', p:{d: dist.id, c: d.v, sort:'az'}}];
  nav.dir = 'tab';
  render();
};
A.clearq = () => { S.search = {q:'', tag:null}; render({keep: true, after() { const q = $('#q'); if (q) q.focus(); }}); };
A.cleartag = () => { S.search.tag = null; render({keep: true}); };
A.recentq = d => { S.search = {q: d.v, tag: null}; render({keep: true}); };
INPUTS.search = t => {
  S.search.q = t.value; S.search.tag = null;
  const r = $('#sres'); if (r) r.innerHTML = searchBody();
  const c = $('#sclear'); if (c) c.classList.toggle('show', !!t.value);
};

function haptic(ms) {
  const n = ms || 10;
  if (typeof navigator.vibrate === 'function') {
    try { navigator.vibrate(n); return; } catch (e) {}
  }
  try {
    let sw = document.getElementById('haptic-switch');
    if (!sw) {
      sw = document.createElement('input');
      sw.id = 'haptic-switch';
      sw.type = 'checkbox';
      sw.setAttribute('switch', '');
      sw.setAttribute('aria-hidden', 'true');
      sw.tabIndex = -1;
      sw.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;opacity:0;pointer-events:none';
      sw.addEventListener('click', ev => ev.stopPropagation());
      document.body.appendChild(sw);
    }
    sw.click();
  } catch (e) {}
}
const HAPTIC_MS = {back:16, open:12, district:12, opencat:12, tab:10, save:14, gosearch:10};
let backAt = 0;
function performBack() {
  const now = Date.now();
  if (now - backAt < 450) return;
  if (stack().length < 2) return;
  backAt = now;
  haptic(16);
  back();
}
let edge = null;
on(document, 'touchstart', ev => {
  if (ev.touches.length === 1 && ev.touches[0].clientX <= 32 && ev.cancelable) ev.preventDefault();
}, {passive:false});
on(document, 'pointerdown', ev => {
  if (ev.isPrimary === false || ev.clientX > 32) return;
  edge = {id:ev.pointerId, x:ev.clientX, y:ev.clientY, t:Date.now()};
}, {passive:true});
on(document, 'pointerup', ev => {
  if (!edge || ev.pointerId !== edge.id) return;
  const dx = ev.clientX - edge.x, dy = ev.clientY - edge.y, dt = Date.now() - edge.t;
  edge = null;
  if (dt < 700 && dx > 64 && Math.abs(dy) < 80 && Math.abs(dx) > Math.abs(dy)) performBack();
}, {passive:true});
on(document, 'pointercancel', () => { edge = null; }, {passive:true});

on(document, 'click', ev => {
  const node = ev.target instanceof Element ? ev.target : ev.target && ev.target.parentElement;
  if (!node || !host.contains(node)) return;
  const el = node.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.dataset.act !== 'back') haptic(HAPTIC_MS[el.dataset.act] || 8);
  if (!(el.tagName === 'A' && el.getAttribute('href'))) ev.preventDefault();
  fn(Object.assign({}, el.dataset), el, ev);
});
on(document, 'keydown', ev => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('[role=button][data-act]')) { ev.preventDefault(); ev.target.click(); return; }
  if (ev.key === 'Enter' && ev.target.id === 'q') { const v = ev.target.value.trim(); if (v) addRecent(v); ev.target.blur(); }
});
on(document, 'input', ev => {
  const t = ev.target; if (!t || !t.dataset || !t.dataset.input) return;
  const h = INPUTS[t.dataset.input]; if (h) h(t, ev);
});



  if (initialId && LISTINGS.some((b) => b.id === initialId)) {
    nav.stacks.browse.push({ n: "biz", p: { id: initialId } })
  }
  render()
  return () => {
    listeners.forEach((fn) => fn())
    clearTimeout(toastT)
  }
}
