const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  contract: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20Z"/><path d="M14 3.5v4h4M10 12h5M10 16h5"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.8-6.1-6.8-11.3a6.8 6.8 0 1 1 13.6 0C18.8 14.9 12 21 12 21Z"/><circle cx="12" cy="9.7" r="2.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8.5v5"/><circle cx="12" cy="16.3" r="0.15" fill="currentColor" stroke-width="2.2"/><path d="M10.6 3.8 2.9 17.5a1.6 1.6 0 0 0 1.4 2.4h15.4a1.6 1.6 0 0 0 1.4-2.4L13.4 3.8a1.6 1.6 0 0 0-2.8 0Z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9Z"/><path d="M10 19.5a2 2 0 0 0 4 0"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 7 4 12l5.5 5M14.5 7 20 12l-5.5 5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'
};

// Service-type icons live as real files in /assets — no embedded data here.
const SVC_ICONS = {
  ambulance: 'assets/icon-ambulance.png',
  clinic: 'assets/icon-clinic.png',
  both: 'assets/icon-both.png'
};

function hasType(p, t){ return p.services.some(s => s.type === t); }
function overallLabel(p){
  const amb = hasType(p,'ambulance'), cli = hasType(p,'clinic');
  if(amb && cli) return 'عيادة طبية وسيارة إسعاف';
  return amb ? 'سيارة إسعاف' : 'عيادة طبية';
}

let projects = [];
const today = new Date();

function getStatus(p){
  if(p.suspendedSince && new Date(p.suspendedSince) <= today) return "suspended";
  if(new Date(p.end) < today) return "expired";
  return "active";
}
const STATUS_LABEL = { active:"نشط", suspended:"متوقف مؤقتًا", expired:"منتهي" };

function daysUntilEnd(p){ return Math.ceil((new Date(p.end) - today) / 86400000); }
function isEndingSoon(p){
  const d = daysUntilEnd(p);
  return getStatus(p) === 'active' && d >= 0 && d <= 30;
}
function elapsedPct(p){
  const a = new Date(p.start), b = new Date(p.end);
  return Math.max(0, Math.min(100, Math.round((today - a) / (b - a) * 100)));
}
function fmtDate(iso){
  return new Date(iso).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { year:'numeric', month:'2-digit', day:'2-digit' });
}
function serviceName(s){ return s.type === 'clinic' ? 'عيادة طبية' : 'سيارة إسعاف'; }
function badgesHTML(p){
  const status = getStatus(p);
  return `<span class="badge badge-${status}"><span class="badge-dot"></span>${STATUS_LABEL[status]}</span>` +
    (isEndingSoon(p) ? `<span class="badge badge-soon">${ICONS.bell}باقي ${daysUntilEnd(p)} يوم</span>` : '');
}

/* ---------- site backdrops: one per project setting ---------- */
const FAR = '#12414E', NEAR = '#1B5868', LIT = '#FFE9A8', MINT = '#8FE0CF';
const SETTINGS = {
  city:         { label:'موقع داخل المدينة',        ground:'#0A2830', road:true  },
  construction: { label:'موقع مشروع إنشائي',        ground:'#0C2B33', road:true  },
  desert:       { label:'موقع صحراوي',              ground:'#3F3B2A', road:false },
  chemical:     { label:'منشأة صناعية كيميائية',    ground:'#0A2830', road:true  },
  industrial:   { label:'مدن صناعية ومصانع',        ground:'#0A2830', road:true  },
  residential:  { label:'سكن الموظفين',             ground:'#0A2830', road:true  },
  museum:       { label:'المتحف الوطني · وسط المدينة', ground:'#0A2830', road:true },
  studio:       { label:'استوديوهات تصوير',         ground:'#0A2830', road:true  },
  academy:      { label:'مبنى الأكاديمية',          ground:'#0A2830', road:true  }
};
const n0 = v => (+v).toFixed(0);
const R = (x, y, w, h, f, extra) => `<rect x="${n0(x)}" y="${n0(y)}" width="${n0(w)}" height="${n0(h)}" fill="${f}" ${extra || ''}/>`;
function winGrid(r, x, y, cols, rows, dx, dy, w, h, chance){
  let s = '';
  for(let c = 0; c < cols; c++) for(let k = 0; k < rows; k++)
    s += R(x + c*dx, y + k*dy, w, h, r() < chance ? LIT : '#0D343F', 'opacity=".85"');
  return s;
}
function smoke(x, y){
  return `<g class="float" fill="#fff"><circle cx="${x}" cy="${y}" r="7" opacity=".16"/><circle cx="${x+9}" cy="${y-11}" r="10" opacity=".11"/><circle cx="${x+22}" cy="${y-24}" r="14" opacity=".07"/></g>`;
}
function cityRow(r, from, to, maxH, fill){
  let s = '', x = from;
  while(x < to){
    const w = 20 + r()*34, h = 18 + r()*maxH;
    s += R(x, 170-h, w, h, fill);
    if(r() > .4) s += R(x+5, 170-h+7, 4, 4, MINT, 'opacity=".5"');
    x += w + 3 + r()*8;
  }
  return s;
}
function crane(x, top, jl, jr){
  const hx = x + jr*0.72;
  return `<g fill="${NEAR}">${R(x-3, top+12, 6, 158-top)}${R(x-1.5, top, 3, 12)}${R(x-jl, top+12, jl+jr, 3)}${R(x-jl, top+15, 18, 10)}</g>
    <path d="M${x} ${top} L${x-jl} ${top+12} M${x} ${top} L${x+jr} ${top+12} M${x-3} ${top+30} l6 14 l-6 14 l6 14 l-6 14 l6 14 l-6 14 l6 14" stroke="${NEAR}" stroke-width="1.2" fill="none"/>
    ${R(x+3, top+16, 9, 9, LIT)}
    <path d="M${hx} ${top+15} V${top+52}" stroke="${NEAR}" stroke-width="1"/>${R(hx-4, top+52, 8, 6, '#F4C467')}
    <circle class="beacon" cx="${x}" cy="${top}" r="2.4" fill="#EF174A"/>`;
}
function palm(x, h){
  const ty = 170 - h; let f = '';
  [-24,-15,-6,6,15,24].forEach(d => { f += `<path d="M${x-1} ${ty} q${d/2} ${-10 - Math.abs(d)/4} ${d} 7"/>`; });
  return `<g stroke="${NEAR}" fill="none" stroke-linecap="round"><path d="M${x} 170 q4 ${-h/2} -1 ${-h}" stroke-width="3.5"/><g stroke-width="2.6">${f}</g></g>`;
}
function sawtooth(x, w, h, teeth, fill){
  const tw = w/teeth; let s = R(x, 170-h, w, h, fill);
  for(let i = 0; i < teeth; i++){ const a = x + i*tw; s += `<path d="M${n0(a)} ${170-h} v-13 l${n0(tw)} 13 z" fill="${fill}"/>`; }
  return s;
}
function chimney(x, h, fill){
  return `<path d="M${x} 170 l3 ${-h} h8 l3 ${h} z" fill="${fill}"/>${R(x+3, 170-h+6, 8, 4, '#EF174A', 'opacity=".8"')}${smoke(x+7, 170-h-8)}`;
}

const BACKDROPS = {
  city: r => cityRow(r, -10, 670, 52, FAR),

  // ICAD — building site: frame under construction, tower cranes, scaffolding, hoarding
  construction: r => {
    let s = '';
    for(let f = 0; f < 6; f++){
      const y = 170 - (f+1)*21, w = f < 5 ? 176 : 118;
      s += R(14, y, w, 4, NEAR);
      for(let c = 0; c <= (f < 5 ? 5 : 3); c++) s += R(14 + c*34.4, y, 5, 21, NEAR);
    }
    s += `<path d="M132 44 v-12 M150 44 v-9 M166 44 v-14 M184 44 v-8" stroke="${NEAR}" stroke-width="1.5"/>`;
    s += R(520, 62, 130, 108, FAR);
    s += `<g stroke="${MINT}" stroke-width="1" opacity=".38" fill="none">${[0,1,2,3,4,5].map(i => `<path d="M512 ${68+i*18} H656"/>`).join('')}${[0,1,2,3,4,5,6].map(i => `<path d="M${514+i*23.5} 60 V170"/>`).join('')}<path d="M514 170 L537 152 L561 170 M561 152 L584 134 L608 152"/></g>`;
    s += crane(304, 24, 78, 176) + crane(596, 40, 30, 50);
    s += R(-20, 158, 700, 12, '#16495A');
    for(let i = -1; i < 18; i++) s += `<path d="M${i*42} 170 l10 -12 h12 l-10 12 z" fill="#F4C467" opacity=".8"/>`;
    return s;
  },

  // Ma'aden Ivanhoe — open desert, dunes, mesa, exploration drilling rig
  desert: r => {
    return `<path d="M-10 170 L38 118 H132 L176 170 Z" fill="#35545A"/>
      <path d="M430 170 L470 132 H560 L610 170 Z" fill="#35545A" opacity=".8"/>
      <path d="M-10 150 Q90 108 190 138 T400 128 T560 116 T670 140 V172 H-10 Z" fill="#6C6A4F"/>
      <g fill="${NEAR}"><path d="M556 170 L572 74 h8 L596 170 h-5 L576 86 L561 170 Z"/>${R(566, 70, 20, 5, NEAR)}${R(540, 150, 30, 20, NEAR)}</g>
      <path d="M561 150 L591 130 M591 150 L565 130 M565 130 L587 110 M587 130 L568 110 M568 110 L583 92" stroke="${NEAR}" stroke-width="1.3"/>
      <circle class="beacon" cx="576" cy="68" r="2.4" fill="#EF174A"/>${R(546, 156, 7, 7, LIT)}
      <path d="M-10 164 Q120 134 270 156 T540 148 T670 158 V172 H-10 Z" fill="#9A8250"/>
      <path d="M-10 168 Q160 150 330 164 T670 162 V172 H-10 Z" fill="#B59A5E" opacity=".75"/>
      <g stroke="#4E5A3C" stroke-width="1.6" stroke-linecap="round"><path d="M92 166 l-5 -9 M92 166 l1 -11 M92 166 l6 -8 M470 164 l-5 -8 M470 164 l1 -10 M470 164 l6 -7"/></g>`;
  },

  // Saudi Chemical — process plant: tanks, columns, sphere, pipe rack, flare
  chemical: r => {
    let s = '';
    [[8,74,54],[66,60,46],[116,84,50]].forEach(([x,h,w]) => {
      s += `<rect x="${x}" y="${170-h}" width="${w}" height="${h}" rx="9" fill="${FAR}"/>` + R(x, 170-h+16, w, 2, NEAR) + R(x, 170-h+34, w, 2, NEAR);
    });
    [[262,128,15],[284,104,12],[304,138,17],[330,92,12]].forEach(([x,h,w]) => {
      s += `<rect x="${x}" y="${170-h}" width="${w}" height="${h}" rx="6" fill="${NEAR}"/>`;
      for(let y = 170-h+16; y < 160; y += 22) s += R(x-4, y, w+8, 2.4, MINT, 'opacity=".45"');
    });
    s += `<circle class="beacon" cx="312" cy="30" r="2.4" fill="#EF174A"/>`;
    s += `<path d="M180 150 H262 M180 140 H262 M346 132 H470 M346 142 H470" stroke="${NEAR}" stroke-width="3"/>` + [190,222,254,372,410,448].map(x => R(x, 132, 3, 38, NEAR)).join('');
    s += `<circle cx="598" cy="126" r="30" fill="${FAR}"/><path d="M570 126 a28 9 0 0 0 56 0" stroke="${NEAR}" stroke-width="2" fill="none"/>` + R(576, 148, 4, 22, FAR) + R(618, 148, 4, 22, FAR) + R(596, 154, 4, 16, FAR);
    s += R(497, 52, 4, 118, NEAR) + `<path class="beacon" d="M499 52 q-9 -12 0 -26 q9 14 0 26 z" fill="#F4C467"/><circle cx="499" cy="38" r="16" fill="#F4C467" opacity=".14"/>`;
    s += chimney(560, 128, FAR);
    return s;
  },

  // MODON — industrial city: rows of large factories and warehouses
  industrial: r => {
    let s = sawtooth(-6, 150, 46, 5, FAR) + sawtooth(330, 190, 54, 6, FAR) + chimney(206, 122, FAR) + chimney(540, 134, FAR) + chimney(624, 100, FAR);
    s += R(150, 96, 126, 74, NEAR) + `<path d="M150 96 l63 -20 l63 20 z" fill="${NEAR}"/>` + R(170, 126, 34, 44, '#0D343F') + R(222, 126, 34, 44, '#0D343F') + winGrid(r, 160, 104, 9, 1, 12, 0, 8, 6, .5);
    s += sawtooth(440, 150, 82, 4, NEAR) + winGrid(r, 452, 106, 8, 2, 16.5, 20, 10, 8, .55) + R(488, 144, 40, 26, '#0D343F');
    s += sawtooth(18, 118, 70, 3, NEAR) + winGrid(r, 28, 114, 6, 2, 17.5, 20, 10, 8, .5);
    s += R(606, 86, 4, 84, NEAR) + R(634, 86, 4, 84, NEAR) + `<rect x="598" y="64" width="48" height="26" rx="6" fill="${NEAR}"/>`;
    return s;
  },

  // KAPSARC — staff housing compound: villas, palms, street lamps
  residential: r => {
    let s = cityRow(r, -10, 670, 20, FAR);
    const villa = (x, w, h, pitched) => {
      let v = R(x, 170-h, w, h, NEAR);
      v += pitched ? `<path d="M${x-6} ${170-h} l${w/2+6} -22 l${w/2+6} 22 z" fill="#236B7C"/>` : R(x-4, 170-h-6, w+8, 7, '#236B7C') + R(x+w*0.55, 170-h-24, w*0.4, 20, NEAR);
      v += winGrid(r, x+9, 170-h+12, Math.floor((w-12)/22), h > 60 ? 2 : 1, 22, 24, 12, 13, .7);
      v += R(x+w/2-6, 148, 12, 22, '#0D343F');
      return v;
    };
    s += villa(14, 96, 62, true) + villa(124, 84, 78, false) + villa(424, 92, 78, false) + villa(532, 104, 62, true);
    s += palm(232, 84) + palm(404, 96) + palm(646, 70) + palm(4, 60);
    [118, 300, 520].forEach(x => { s += R(x, 112, 2, 58, NEAR) + `<circle cx="${x+1}" cy="110" r="3.4" fill="${LIT}"/><circle cx="${x+1}" cy="110" r="13" fill="${LIT}" opacity=".12"/>`; });
    return s;
  },

  // Ministry of Culture — national museum in the city centre
  museum: r => {
    let s = cityRow(r, -10, 250, 70, FAR) + cityRow(r, 430, 670, 78, FAR);
    s += R(632, 40, 14, 130, FAR) + `<path d="M632 40 l7 -22 l7 22 z" fill="${FAR}"/>`;
    s += R(208, 78, 250, 92, NEAR) + `<path d="M196 78 L333 34 L470 78 Z" fill="#236B7C"/>` + R(196, 76, 274, 7, '#2B7B8D') + `<circle cx="333" cy="60" r="8" fill="${MINT}" opacity=".5"/>`;
    for(let i = 0; i < 9; i++) s += R(216 + i*28.5, 86, 9, 72, '#C9E9E2', 'opacity=".9"');
    s += R(200, 158, 266, 6, '#2B7B8D') + R(192, 164, 282, 6, '#236B7C');
    s += R(318, 108, 30, 50, '#0D343F') + R(324, 114, 18, 44, LIT, 'opacity=".55"');
    [262, 404].forEach(x => { s += R(x, 46, 2, 34, MINT, 'opacity=".7"') + `<path d="M${x+2} 47 h18 l-5 6 l5 6 h-18 z" fill="#EF174A" opacity=".85"/>`; });
    return s;
  },

  // Senyar — film production: sound stages, lighting truss, camera crane
  studio: r => {
    let s = '';
    const stage = (x, w, h, num) => {
      return `<path d="M${x} 170 V${170-h+16} q0 -16 ${w/2} -16 q${w/2} 0 ${w/2} 16 V170 Z" fill="${NEAR}"/>` + R(x+w/2-22, 112, 44, 58, '#0D343F') +
        `<text x="${x+w/2}" y="${170-h+34}" text-anchor="middle" direction="ltr" font-family="JetBrains Mono, monospace" font-weight="600" font-size="22" fill="${MINT}" opacity=".7">${num}</text>`;
    };
    s += stage(4, 118, 104, '01') + stage(130, 96, 88, '02');
    s += `<g fill="${NEAR}">${R(434, 40, 5, 130)}${R(600, 40, 5, 130)}${R(430, 40, 180, 5)}${R(430, 52, 180, 3)}</g><path d="M434 52 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l12 10" stroke="${NEAR}" stroke-width="1.2" fill="none"/>`;
    [[460,'#FFE9A8',-58],[498,'#8FE0CF',-22],[540,'#FFE9A8',14],[578,'#EF8FA6',40]].forEach(([x,c,dx]) => {
      s += `<path class="float" d="M${x-4} 64 L${x+dx-26} 170 H${x+dx+26} L${x+4} 64 Z" fill="${c}" opacity=".13"/>` + `<path d="M${x-6} 55 h12 l3 10 h-18 z" fill="#236B7C"/><circle cx="${x}" cy="66" r="3" fill="${c}"/>`;
    });
    s += `<g fill="${NEAR}"><path d="M246 170 l10 -40 h4 l10 40 h-4 l-8 -30 l-8 30 z"/>${R(240, 112, 40, 20)}<circle cx="248" cy="106" r="9"/><circle cx="268" cy="106" r="9"/><path d="M280 116 l16 -7 v26 l-16 -7 z"/></g><circle class="beacon" cx="244" cy="116" r="2" fill="#EF174A"/>`;
    s += `<g fill="${NEAR}">${R(388, 138, 3, 32)}${R(402, 138, 3, 32)}<path d="M384 136 h24 v4 h-24 z M386 118 h20 v18 h-20 z"/></g>`;
    return s;
  },

  // Academy of Defense Industries — large government college building
  academy: r => {
    let s = R(40, 84, 580, 86, NEAR) + R(34, 78, 592, 8, '#236B7C');
    s += winGrid(r, 54, 96, 9, 3, 21, 22, 11, 13, .55) + winGrid(r, 424, 96, 9, 3, 21, 22, 11, 13, .55);
    s += R(244, 54, 172, 116, '#236B7C') + `<path d="M232 54 L330 32 L428 54 Z" fill="#2B7B8D"/>` + R(232, 52, 196, 6, '#2B7B8D');
    for(let i = 0; i < 6; i++) s += R(254 + i*28.6, 62, 9, 92, '#C9E9E2', 'opacity=".9"');
    s += R(238, 154, 184, 6, '#2B7B8D') + R(228, 162, 204, 8, '#2B7B8D');
    s += R(329, 19, 2, 15, MINT) + `<path d="M331 20 h17 l-4 4.5 l4 4.5 h-17 z" fill="${MINT}" opacity=".9"/>`;
    s += R(18, 60, 2, 110, NEAR) + R(640, 60, 2, 110, NEAR) + palm(8, 54) + palm(652, 54);
    return s;
  }
};

/* ---------- generated service scene (drawn per project) ---------- */
function rng(seedStr){
  let h = 1779033703;
  for(let i = 0; i < seedStr.length; i++){ h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  return function(){
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
function ambulanceSVG(x, als){
  return `<g transform="translate(${x},170)">
    <path d="M196 -24 L330 -40 L330 6 L196 -10 Z" fill="url(#beam)"/>
    <rect x="0" y="-80" width="130" height="68" rx="9" fill="#EAF6F3"/>
    <path d="M130 -64 h34 q11 0 17 9 l15 23 q5 7 5 14 v6 h-71 z" fill="#EAF6F3"/>
    <path d="M136 -57 h26 q7 0 11 6 l11 17 h-48 z" fill="#2B6777"/>
    <rect x="0" y="-38" width="201" height="11" fill="#274C5C"/>
    <rect x="0" y="-27" width="201" height="3" fill="#EF174A"/>
    <g fill="${als ? '#EF174A' : '#274C5C'}"><rect x="34" y="-70" width="9" height="25" rx="2"/><rect x="26" y="-62" width="25" height="9" rx="2"/></g>
    <rect x="70" y="-70" width="46" height="22" rx="4" fill="#2B6777"/>
    <rect x="44" y="-89" width="44" height="9" rx="4" fill="#1B4350"/>
    <rect class="beacon" x="47" y="-88" width="17" height="7" rx="3" fill="#EF174A"/>
    <rect class="beacon b2" x="68" y="-88" width="17" height="7" rx="3" fill="#59C8FF"/>
    <rect x="-4" y="-14" width="210" height="7" rx="3" fill="#143843"/>
    <rect x="192" y="-27" width="9" height="7" rx="2" fill="#FFE9A8"/>
    <g fill="#061A20"><circle cx="38" cy="-8" r="16"/><circle cx="162" cy="-8" r="16"/></g>
    <g fill="#8FE0CF"><circle cx="38" cy="-8" r="6"/><circle cx="162" cy="-8" r="6"/></g>
  </g>`;
}
function clinicSVG(x, als){
  return `<g transform="translate(${x},178)">
    <rect x="0" y="-98" width="156" height="98" rx="7" fill="#EAF6F3"/>
    <rect x="-7" y="-108" width="170" height="14" rx="5" fill="#274C5C"/>
    <rect x="-7" y="-96" width="170" height="3" fill="#EF174A"/>
    <circle cx="78" cy="-70" r="17" fill="${als ? '#EF174A' : '#274C5C'}"/>
    <g fill="#fff"><rect x="74.5" y="-81" width="7" height="22" rx="1.5"/><rect x="67" y="-73.5" width="22" height="7" rx="1.5"/></g>
    <rect x="62" y="-42" width="32" height="42" rx="3" fill="#2B6777"/>
    <rect x="77.3" y="-42" width="1.4" height="42" fill="#EAF6F3" opacity=".6"/>
    <g fill="#FFE9A8"><rect x="14" y="-50" width="34" height="24" rx="3"/><rect x="108" y="-50" width="34" height="24" rx="3"/></g>
    <g fill="#274C5C" opacity=".35"><rect x="30.3" y="-50" width="1.4" height="24"/><rect x="124.3" y="-50" width="1.4" height="24"/></g>
    <rect x="52" y="-2" width="52" height="4" rx="2" fill="#143843"/>
  </g>`;
}
function sceneSVG(p){
  const r = rng(p.code);
  const night = p.hours >= 24;
  const amb = p.services.find(s => s.type === 'ambulance');
  const cli = p.services.find(s => s.type === 'clinic');
  const level = (amb || cli).level;

  let stars = '';
  for(let i = 0; i < (night ? 34 : 12); i++){
    stars += `<circle cx="${(r()*660).toFixed(0)}" cy="${(r()*105).toFixed(0)}" r="${(0.5 + r()*1.1).toFixed(1)}" fill="#fff"/>`;
  }
  const setting = SETTINGS[p.setting] ? p.setting : 'city';
  const cfg = SETTINGS[setting];
  const skyline = BACKDROPS[setting](r);
  const orbX = 70 + r()*120;
  const units = (amb && cli)
    ? clinicSVG(96, cli.level === 'ALS') + ambulanceSVG(356, amb.level === 'ALS')
    : amb ? ambulanceSVG(214, amb.level === 'ALS') : clinicSVG(252, cli.level === 'ALS');

  return `<svg viewBox="0 16 660 218" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${night ? '#071C24' : '#0E3A46'}"/>
        <stop offset=".72" stop-color="${night ? '#10404D' : '#2A6E7A'}"/>
        <stop offset="1" stop-color="${night ? '#17525F' : '#C99A5B'}"/>
      </linearGradient>
      <radialGradient id="orb"><stop offset="0" stop-color="${night ? '#DFFBF4' : '#FFE2A6'}"/><stop offset=".25" stop-color="${night ? '#8FE0CF' : '#F4C467'}" stop-opacity=".55"/><stop offset="1" stop-color="#8FE0CF" stop-opacity="0"/></radialGradient>
      <linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".5"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="660" height="240" fill="url(#sky)"/>
    <g class="stars">${stars}</g>
    <g class="lyr" style="--d:5"><g class="float"><circle cx="${orbX.toFixed(0)}" cy="${night ? 54 : 118}" r="${night ? 62 : 84}" fill="url(#orb)"/></g></g>
    <text x="640" y="96" text-anchor="end" direction="ltr" font-family="JetBrains Mono, monospace" font-weight="600" font-size="92" fill="#fff" opacity=".06">${level}</text>
    <path class="ecg" d="M0 112 H150 l14 -22 l16 46 l14 -36 l10 12 H330 l14 -22 l16 46 l14 -36 l10 12 H520 l14 -22 l16 46 l14 -36 l10 12 H660" opacity=".85"/>
    <g class="lyr" style="--d:9">${skyline}</g>
    <rect y="170" width="660" height="70" fill="${cfg.ground}"/>
    <rect y="170" width="660" height="1.5" fill="#8FE0CF" opacity=".35"/>
    ${cfg.road ? `<g fill="#8FE0CF" opacity=".28">${[0,1,2,3,4,5,6,7].map(i => `<rect x="${20 + i*84}" y="197" width="44" height="3" rx="1.5"/>`).join('')}</g>` : `<path d="M0 190 Q170 182 330 192 T660 188 M0 204 Q170 196 330 206 T660 202" stroke="#B59A5E" stroke-width="2" fill="none" opacity=".35"/>`}
    <g class="lyr" style="--d:-12">${units}</g>
  </svg>`;
}

/* ---------- rendering ---------- */
function countUp(el, to){
  const t0 = performance.now(), dur = 900;
  (function step(t){
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
    if(k < 1) requestAnimationFrame(step);
  })(t0);
}
function renderStats(){
  const counts = { active:0, suspended:0, expired:0 };
  let soon = 0;
  projects.forEach(p => { counts[getStatus(p)]++; if(isEndingSoon(p)) soon++; });
  const follow = counts.suspended + counts.expired + soon;
  document.getElementById('stats').innerHTML = `
    <div class="stat"><b data-n="${projects.length}">0</b><span>إجمالي المشاريع</span></div>
    <div class="stat"><b data-n="${counts.active}">0</b><span>نشطة</span></div>
    <div class="stat${follow ? ' warn' : ''}"><b data-n="${follow}">0</b><span>تحتاج متابعة</span></div>`;
  document.querySelectorAll('.stat b').forEach(b => countUp(b, +b.dataset.n));
  const asOf = document.getElementById('asOf');
  if(asOf) asOf.textContent = 'حالة العقود محسوبة بتاريخ ' + fmtDate(today);
}

function renderGrid(){
  const grid = document.getElementById('grid');
  grid.innerHTML = projects.map((p, i) => `
    <div class="card" data-i="${i}" tabindex="0" role="button" aria-label="${p.client}" style="animation-delay:${0.2 + Math.min(i,10) * 0.07}s">
      <div class="card-top">
        <div class="avatar"><img src="${p.logo}" alt="${p.client}"></div>
        <div class="card-title">
          <div class="title-box"><h3>${p.client}</h3></div>
          <div class="code">${ICONS.code}${p.code}</div>
        </div>
      </div>
      <div class="badges">${badgesHTML(p)}<span class="card-go">${ICONS.arrow}</span></div>
      <div class="services">
        ${p.services.map(s => `<div class="svc"><img src="${SVC_ICONS[s.type]}" alt="">${s.type==='clinic'?'عيادة':'إسعاف'}<span class="lvl">${s.level}</span></div>`).join('')}
      </div>
    </div>`).join('');

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openPanel(+card.dataset.i));
    card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openPanel(+card.dataset.i); } });
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if(e.pointerType === 'mouse'){
        card.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg');
        card.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 12 + 'deg');
      }
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  });
}

function openPanel(i){
  const p = projects[i];
  const status = getStatus(p);
  const pct = elapsedPct(p);
  const left = daysUntilEnd(p);
  const panel = document.getElementById('panel');
  panel.innerHTML = `
    <div class="scene">
      ${sceneSVG(p)}
      <div class="scene-tags">
        <span class="scene-label">${overallLabel(p)} · ${p.hours >= 24 ? 'تغطية على مدار الساعة' : 'تغطية ' + p.hours + ' ساعة يوميًا'}</span>
        <span class="scene-label place">${ICONS.map}${(SETTINGS[p.setting] || SETTINGS.city).label}</span>
      </div>
      <div class="close-btn" id="closeBtn" role="button" tabindex="0" aria-label="إغلاق">${ICONS.close}</div>
    </div>
    <div class="panel-body">
      <div class="panel-head">
        <div class="avatar"><img src="${p.logo}" alt="${p.client}"></div>
        <div style="min-width:0;">
          <h2>${p.client}</h2>
          <div class="sub-label">${p.sub}</div>
        </div>
      </div>
      <div class="panel-meta">${badgesHTML(p)}<div class="code">${ICONS.code}${p.code}</div></div>

      <div class="tiles">
        ${p.services.map(s => `
        <div class="tile${p.services.length === 1 ? ' wide' : ''}">
          <div class="tile-icon"><img src="${SVC_ICONS[s.type]}" alt=""></div>
          <div class="tile-main"><div class="label">نوع الخدمة</div><div class="val">${serviceName(s)}<small>${s.level}</small></div></div>
        </div>`).join('')}

        <div class="tile">
          <div class="tile-icon">${ICONS.calendar}</div>
          <div class="tile-main"><div class="label">أيام العمل في الأسبوع</div><div class="val">${p.days} أيام</div></div>
        </div>
        <div class="tile">
          <div class="tile-icon">${ICONS.clock}</div>
          <div class="tile-main"><div class="label">ساعات العمل في اليوم</div><div class="val">${p.hours} ساعة</div></div>
        </div>

        <div class="tile wide">
          <div class="tile-icon">${ICONS.contract}</div>
          <div class="tile-main">
            <div class="label">المدة الزمنية للعقد</div>
            <div class="val">${fmtDate(p.start)} — ${fmtDate(p.end)}</div>
            <div class="progress">
              <div class="progress-bar"><i id="progFill" class="${status !== 'active' || isEndingSoon(p) ? 'warn' : ''}" data-w="${pct}"></i></div>
              <div class="progress-meta"><span>انقضى ${pct}% من مدة العقد</span><span>${left >= 0 ? 'باقي ' + left + ' يوم' : 'انتهى منذ ' + (-left) + ' يوم'}</span></div>
            </div>
          </div>
        </div>

        ${p.multiCity ? `
        <div class="tile wide">
          <div class="tile-icon">${ICONS.map}</div>
          <div class="tile-main">
            <div class="label">نطاق التشغيل</div>
            <div class="val">${p.multiCity}</div>
            ${p.cities ? `<div class="city-tags">${p.cities.map(c => `<span class="city-tag">${c}</span>`).join('')}</div>` : ''}
          </div>
        </div>` : ''}
      </div>

      ${p.suspendedSince ? `
      <div class="note-box">${ICONS.alert}<span>الخدمة متوقفة حاليًا اعتبارًا من ${fmtDate(p.suspendedSince)}، والعقد ساري حتى ${fmtDate(p.end)}.</span></div>` : ''}
      ${status === 'expired' ? `
      <div class="note-box">${ICONS.alert}<span>انتهت المدة التعاقدية بتاريخ ${fmtDate(p.end)} — يحتاج تجديد أو متابعة.</span></div>` : ''}
      ${isEndingSoon(p) ? `
      <div class="note-box">${ICONS.bell}<span>باقي ${left} يوم على انتهاء العقد (${fmtDate(p.end)}) — يُنصح بالمتابعة للتجديد.</span></div>` : ''}
    </div>`;
  panel.scrollTop = 0;
  document.getElementById('closeBtn').addEventListener('click', closePanel);
  const scene = panel.querySelector('.scene');
  scene.addEventListener('pointermove', e => {
    const r = scene.getBoundingClientRect();
    scene.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * 2);
    scene.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5) * 2);
  });
  scene.addEventListener('pointerleave', () => { scene.style.setProperty('--px', 0); scene.style.setProperty('--py', 0); });
  document.getElementById('overlay').classList.add('open');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const f = document.getElementById('progFill');
    if(f) f.style.width = f.dataset.w + '%';
  }));
}
function closePanel(){ document.getElementById('overlay').classList.remove('open'); }
document.getElementById('overlay').addEventListener('click', e => { if(e.target.id === 'overlay') closePanel(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closePanel(); });

// header logo follows the pointer in 3D
document.addEventListener('pointermove', e => {
  const logo = document.getElementById('logo3d');
  if(!logo || e.pointerType !== 'mouse') return;
  logo.style.setProperty('--lx', (e.clientX / window.innerWidth - .5) * 2);
  logo.style.setProperty('--ly', (e.clientY / window.innerHeight - .5) * 2);
});

// Data now lives in data/projects.json instead of being hardcoded here.
fetch('data/projects.json')
  .then(res => res.json())
  .then(data => {
    projects = data;
    renderStats();
    renderGrid();
  })
  .catch(err => {
    document.getElementById('grid').innerHTML = '<p style="color:#F4C467">تعذّر تحميل بيانات المشاريع من data/projects.json</p>';
    console.error(err);
  });
