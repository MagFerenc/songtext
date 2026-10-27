// ============================================================
// Közös karaoke-kód a vezérlőhöz és a nézőhöz.
// (Ezt a fájlt nem kell szerkeszteni.)
//
//  - LRC fájl beolvasása (sima és szavanként időzített változat is)
//  - a szöveg kirajzolása: előző sor, aktuális sor (szótagonként
//    sárgul), és alatta a következő két sor
//  - visszaszámlálás az első sor előtt (max. 5 mp)
// ============================================================

const KARAOKE_COUNTDOWN = 5;   // ennyi másodperccel az első sor előtt indul a visszaszámlálás

function parseLrcTime(s){
  const m = /^(\d+):(\d+(?:[.,]\d+)?)$/.exec(s.trim());
  return m ? parseInt(m[1], 10) * 60 + parseFloat(m[2].replace(',', '.')) : null;
}

function parseLrc(text){
  const meta = {}, lines = [];
  text.replace(/^﻿/, '').split(/\r?\n/).forEach(raw => {
    let rest = raw, times = [], m;
    while((m = /^\s*\[([^\]]*)\]/.exec(rest))){
      const tag = m[1], t = parseLrcTime(tag);
      if(t !== null) times.push(t);
      else { const mm = /^(\w+)\s*:(.*)$/.exec(tag); if(mm) meta[mm[1].toLowerCase()] = mm[2].trim(); }
      rest = rest.slice(m[0].length);
    }
    if(!times.length) return;
    // szavankénti időbélyegek: <mm:ss.xx>szótag
    const syl = [];
    const re = /<([^>]*)>([^<]*)/g;
    const first = rest.indexOf('<');
    if(first > 0) syl.push({ t: null, s: rest.slice(0, first) });
    let w;
    while((w = re.exec(rest))){
      const t = parseLrcTime(w[1]);
      if(t !== null && w[2] !== '') syl.push({ t, s: w[2] });
    }
    times.forEach((t, k) => {
      let parts;
      if(syl.length && k === 0) parts = syl.map(x => ({ t: x.t === null ? t : x.t, s: x.s }));
      else parts = [{ t, s: rest.replace(/<[^>]*>/g, '') }];
      lines.push({ t, syl: parts });
    });
  });
  lines.sort((a, b) => a.t - b.t);
  // Mikor ér véget egy sor? Az LRC csak a szótagok kezdetét tárolja, ezért becsüljük:
  // utolsó szótag + a sor szótagjainak szokásos hossza × 1,5 (0,5 … 2 mp között)
  lines.forEach((l, k) => {
    const ts = l.syl.map(x => x.t), gaps = [];
    for(let j = 1; j < ts.length; j++) gaps.push(ts[j] - ts[j - 1]);
    gaps.sort((a, b) => a - b);
    const med = gaps.length ? gaps[gaps.length >> 1] : 0.6;
    let end = ts[ts.length - 1] + Math.min(2, Math.max(0.5, med * 1.5));
    if(lines[k + 1]) end = Math.min(end, lines[k + 1].t);
    l.end = end;
  });
  // a dal hossza: [length:] mezőből, ha nincs, az utolsó szótag + 10 mp
  let length = meta.length ? parseLrcTime(meta.length) : null;
  if(!length && lines.length){ const l = lines[lines.length - 1]; length = l.syl[l.syl.length - 1].t + 10; }
  return { meta, lines, length };
}

// Kirajzoló: előző sor, aktuális sor, alatta a következő sorok.
//   opts.next: hány következő sor látszódjon (szám), vagy 'auto' = amennyi kifér (min. opts.min)
// Akkordokat csak akkor mutat, ha setChords()-szal kap — ezt csak a vezérlő hívja, a néző nem.
function KaraokeView(box, opts){
  opts = opts || {};
  box.classList.add('kv');
  box.innerHTML = '<div class="kv-prev"></div><div class="kv-cur"></div><div class="kv-nexts"></div>';
  const el = { prev: box.querySelector('.kv-prev'), cur: box.querySelector('.kv-cur') };
  const nextsBox = box.querySelector('.kv-nexts');
  let nexts = [];
  function makeNexts(n){
    nextsBox.innerHTML = ''; nexts = [];
    for(let k = 0; k < n; k++){
      const d = document.createElement('div');
      d.className = 'kv-next';
      d.style.opacity = Math.max(0.35, 1 - k * 0.12).toFixed(2);
      nextsBox.appendChild(d); nexts.push(d);
    }
  }
  // 'auto': a rendelkezésre álló magasságból számolja, hány sor fér ki
  function autoCount(){
    const min = opts.min || 4, max = opts.max || 10;
    const h = (opts.fitTo || box.parentElement).clientHeight;
    if(!h) return min;
    const probe = document.createElement('div'); probe.className = 'kv-next'; probe.textContent = 'Ág';
    nextsBox.appendChild(probe);
    const lh = probe.getBoundingClientRect().height || 30;
    probe.remove();
    const used = el.prev.getBoundingClientRect().height + el.cur.getBoundingClientRect().height * 2.2;
    return Math.max(min, Math.min(max, Math.floor((h - used) / (lh * 1.18))));
  }
  let nextCount = opts.next === 'auto' ? (opts.min || 4) : (opts.next || 2);
  makeNexts(nextCount);
  let base = null, lrc = null, chords = null, shownIdx = null, spans = [];

  // Csak a vezérlőn (ha van akkord): a hangszeres részek (eleje, versszakok közötti rész, vége)
  // akkordjai egy-egy tömör "akkordsorba" kerülnek a szövegsorok közé, az idővel együtt
  function rebuild(){
    if(!base){ lrc = null; return; }
    if(!chords){ lrc = base; return; }
    const L = base.lines, extra = [];
    const chordLines = (from, to) => {
      let cs = chords.filter(c => c.t >= from - 0.05 && c.t < to - 0.15 && c.c !== 'N.C.');
      const active = chords.filter(c => c.t < from - 0.05).pop();
      if(active && active.c !== 'N.C.' && (!cs.length || cs[0].t > from + 1)) cs = [{ t: from, c: active.c }, ...cs];
      if(cs.length) extra.push({ t: cs[0].t, end: to, chordOnly: true, syl: cs.map(c => ({ t: c.t, s: c.c })) });
    };
    if(L.length){
      chordLines(0, L[0].t);                                           // eleje
      L.forEach((l, k) => { const nx = L[k + 1]; if(nx && nx.t - l.end > 2.5) chordLines(l.end, nx.t); });
      chordLines(L[L.length - 1].end, base.length || Infinity);       // vége
    }
    lrc = Object.assign({}, base, { lines: [...L, ...extra].sort((a, b) => a.t - b.t) });
  }
  const lineText = l => l ? (l.chordOnly ? l.syl.map(x => x.s).join('    ') : l.syl.map(x => x.s).join('').trim()) : '';

  // Melyik akkord melyik szótag fölé kerül: a sor első szótagja fölé a
  // pillanatnyi akkord, a többi fölé csak akkor, ha ott váltás van.
  function chordAt(t){ let c = null; for(const x of chords){ if(x.t <= t + 0.05) c = x.c; else break; } return c; }
  function chordsFor(line, nextLine){
    const out = line.syl.map(() => []);
    if(!chords) return out;
    const syl = line.syl, last = syl[syl.length - 1].t;
    const end = Math.min(nextLine ? nextLine.t : Infinity, last + 2);   // hosszú hangszeres részt nem írunk a sor fölé
    const first = chordAt(syl[0].t + 0.15);
    if(first) out[0].push(first);
    for(const ch of chords){
      if(ch.t <= syl[0].t + 0.15 || ch.t >= end - 0.1) continue;
      // az a szótag kapja, amelyik ott (vagy közvetlenül utána) kezdődik
      let k = 0; for(let j = 0; j < syl.length; j++){ if(syl[j].t <= ch.t + 0.15) k = j; else break; }
      out[k].push(ch.c);
    }
    return out.map(a => a.filter((c, i) => i === 0 || c !== a[i - 1]));
  }
  function fill(target, idx, keepSpans){
    const l = lrc.lines[idx];
    target.innerHTML = '';
    target.classList.toggle('kv-hasch', !!chords && !(l && l.chordOnly));
    target.classList.toggle('kv-chline', !!(l && l.chordOnly));
    if(!l) return [];
    if(!chords && !keepSpans){ target.textContent = lineText(l); return []; }
    const cs = l.chordOnly ? l.syl.map(() => []) : chordsFor(l, lrc.lines[idx + 1]), sp = [];
    l.syl.forEach((x, k) => {
      const s = document.createElement('span');
      s.textContent = k === l.syl.length - 1 ? x.s.replace(/\s+$/, '') : x.s; s._t = x.t;
      if(l.chordOnly){ const tm = document.createElement('small'); tm.className = 'kv-tm';
        tm.textContent = Math.floor(x.t / 60) + ':' + String(Math.floor(x.t % 60)).padStart(2, '0'); s.appendChild(tm); }
      if(cs[k].length){ const c = document.createElement('i'); c.className = 'kv-ch'; c.textContent = cs[k].join(' '); s.appendChild(c); s.classList.add('kv-w'); }
      target.appendChild(s); sp.push(s);
    });
    return sp;
  }
  function setLines(prevI, curI){
    el.prev.classList.remove('kv-hasch');
    el.prev.textContent = lineText(lrc.lines[prevI]);
    spans = fill(el.cur, curI, true);
    nexts.forEach((d, k) => fill(d, curI + 1 + k, false));
  }
  if(opts.next === 'auto'){
    const refit = () => {
      const n = autoCount();
      if(n !== nextCount){ nextCount = n; makeNexts(n); shownIdx = null; }
    };
    window.addEventListener('resize', refit);
    window.addEventListener('orientationchange', () => setTimeout(refit, 300));
    setTimeout(refit, 50);
    box._refit = refit;
  }

  return {
    load(parsed){ base = parsed; rebuild(); shownIdx = null; if(box._refit) box._refit(); this.render(null); },
    setChords(list){ chords = list && list.length ? list : null; rebuild(); shownIdx = null; },
    clear(){ base = null; lrc = null; chords = null; shownIdx = null; [el.prev, el.cur, ...nexts].forEach(e => { e.textContent = ''; e.classList.remove('kv-hasch'); }); },
    // t: eltelt másodperc a dal indítása óta; null = még nem indult
    render(t){
      if(!lrc || !lrc.lines.length) return;
      let i = -1;
      if(t !== null) for(let k = 0; k < lrc.lines.length; k++){ if(lrc.lines[k].t <= t) i = k; else break; }

      if(i < 0){
        if(shownIdx !== 'pre'){ shownIdx = 'pre'; setLines(-1, 0); }
        const left = t === null ? Infinity : lrc.lines[0].t - t;
        el.prev.innerHTML = (left <= KARAOKE_COUNTDOWN && left > 0)
          ? '<span class="kv-cd">' + Math.ceil(left) + '</span>' : '';
        spans.forEach(sp => sp.classList.remove('on'));
        return;
      }
      // Hangszeres rész: a sor már véget ért, és a következő még messze van (> 2,5 mp szünet)
      const cur = lrc.lines[i], nx = lrc.lines[i + 1];
      if(nx && t > cur.end && nx.t - cur.end > 2.5){
        const key = 'gap' + i;
        if(shownIdx !== key){ shownIdx = key; setLines(i, i + 1); el.prev._txt = el.prev.textContent; }
        const left = nx.t - t;
        const cd = left <= KARAOKE_COUNTDOWN ? Math.ceil(left) : 0;
        if(el.prev._cd !== cd){
          el.prev._cd = cd;
          if(cd) el.prev.innerHTML = '<span class="kv-cd">' + cd + '</span>';
          else el.prev.textContent = el.prev._txt;
        }
        spans.forEach(sp => sp.classList.remove('on'));
        return;
      }
      if(shownIdx !== i){ shownIdx = i; setLines(i - 1, i); el.prev._cd = null; }
      spans.forEach(sp => sp.classList.toggle('on', sp._t <= t));
    }
  };
}

// Akkordfájl: ugyanaz a név, csak ".akkord.lrc" végződéssel. Ha nincs ilyen, nincs akkord.
function chordUrlFor(url){ return url.replace(/\.lrc$/i, '') + '.akkord.lrc'; }
function fetchChords(url){
  return fetch(encodeURI(chordUrlFor(url)), { cache: 'no-cache' })
    .then(r => r.ok ? r.text() : '')
    .then(txt => txt ? parseLrc(txt).lines.map(l => ({ t: l.t, c: l.syl.map(x => x.s).join('').trim() })).filter(x => x.c) : [])
    .catch(() => []);
}

// Hol tart a dal (mp) a közös állapot alapján; null = nem indult.
//   startedAt: indulás (szerveridő, ms)
//   pauseAt / pausedAt: ütemezett szünet — eddig a szerveridőig fut, utána pausedAt-nál áll
//   minT: folytatás után ennél nem mutat korábbit (így nincs visszaugrás a hálózati késés miatt)
const KARAOKE_SYNC_DELAY = 400;   // ms — ennyivel előre ütemezzük a szünetet/folytatást
function karaokeTime(state, now){
  if(!state || !state.startedAt) return null;
  let t = (now - state.startedAt) / 1000;
  if(typeof state.pausedAt === 'number' && state.pauseAt) t = Math.min(t, state.pausedAt);
  if(typeof state.minT === 'number') t = Math.max(t, state.minT);
  return t;
}

// A képernyő ne sötétüljön el, amíg az oldal nyitva van (ha a böngésző támogatja).
// Visszatéréskor és az első érintésre/gombnyomásra is újrakéri — egyes telefonok csak ekkor engedik.
function keepScreenAwake(){
  if(!('wakeLock' in navigator)) return;
  let lock = null;
  const req = async () => {
    if(document.visibilityState !== 'visible' || (lock && !lock.released)) return;
    try{ lock = await navigator.wakeLock.request('screen'); }catch(e){}
  };
  req();
  document.addEventListener('visibilitychange', req);
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, req, { passive: true }));
}

// LRC letöltése (a fájlnévben lehet szóköz, ékezet, & stb.)
function fetchLrc(url){
  return fetch(encodeURI(url), { cache: 'no-cache' }).then(r => {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  }).then(parseLrc);
}
