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
  return { meta, lines };
}

// Kirajzoló: a megadott dobozba négy sort tesz (előző, aktuális, következő, utána következő)
function KaraokeView(box){
  box.classList.add('kv');
  box.innerHTML =
    '<div class="kv-prev"></div><div class="kv-cur"></div>' +
    '<div class="kv-next"></div><div class="kv-next2"></div>';
  const el = {
    prev: box.querySelector('.kv-prev'), cur: box.querySelector('.kv-cur'),
    next: box.querySelector('.kv-next'), next2: box.querySelector('.kv-next2')
  };
  let lrc = null, shownIdx = null, spans = [];
  const lineText = l => l ? l.syl.map(x => x.s).join('').trim() : '';

  function setLines(prevI, curI){
    el.prev.textContent  = lineText(lrc.lines[prevI]);
    el.next.textContent  = lineText(lrc.lines[curI + 1]);
    el.next2.textContent = lineText(lrc.lines[curI + 2]);
    el.cur.innerHTML = ''; spans = [];
    const l = lrc.lines[curI];
    if(l) l.syl.forEach(x => {
      const sp = document.createElement('span');
      sp.textContent = x.s; sp._t = x.t;
      el.cur.appendChild(sp); spans.push(sp);
    });
  }

  return {
    load(parsed){ lrc = parsed; shownIdx = null; this.render(null); },
    clear(){ lrc = null; shownIdx = null; Object.values(el).forEach(e => e.textContent = ''); },
    // t: eltelt másodperc a dal indítása óta; null = még nem indult
    render(t){
      if(!lrc || !lrc.lines.length) return;
      let i = -1;
      if(t !== null) for(let k = 0; k < lrc.lines.length; k++){ if(lrc.lines[k].t <= t) i = k; else break; }

      if(i < 0){
        // még az első sor előtt: az első sorok látszanak, kiemelés nélkül
        const key = 'pre';
        if(shownIdx !== key){ shownIdx = key; setLines(-1, 0); }
        const left = t === null ? Infinity : lrc.lines[0].t - t;
        el.prev.innerHTML = (left <= KARAOKE_COUNTDOWN && left > 0)
          ? '<span class="kv-cd">' + Math.ceil(left) + '</span>' : '';
        spans.forEach(sp => sp.classList.remove('on'));
        return;
      }
      if(shownIdx !== i){ shownIdx = i; setLines(i - 1, i); }
      spans.forEach(sp => sp.classList.toggle('on', sp._t <= t));
    }
  };
}

// LRC letöltése (a fájlnévben lehet szóköz, ékezet, & stb.)
function fetchLrc(url){
  return fetch(encodeURI(url), { cache: 'no-cache' }).then(r => {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  }).then(parseLrc);
}
