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

// Kirajzoló: a megadott dobozba négy sort tesz (előző, aktuális, következő, utána következő).
// Akkordokat csak akkor mutat, ha setChords()-szal kap — ezt csak a vezérlő hívja, a néző nem.
function KaraokeView(box){
  box.classList.add('kv');
  box.innerHTML =
    '<div class="kv-prev"></div><div class="kv-cur"></div>' +
    '<div class="kv-next"></div><div class="kv-next2"></div>';
  const el = {
    prev: box.querySelector('.kv-prev'), cur: box.querySelector('.kv-cur'),
    next: box.querySelector('.kv-next'), next2: box.querySelector('.kv-next2')
  };
  let lrc = null, chords = null, shownIdx = null, spans = [];
  const lineText = l => l ? l.syl.map(x => x.s).join('').trim() : '';

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
    target.classList.toggle('kv-hasch', !!chords);
    if(!l) return [];
    if(!chords && !keepSpans){ target.textContent = lineText(l); return []; }
    const cs = chordsFor(l, lrc.lines[idx + 1]), sp = [];
    l.syl.forEach((x, k) => {
      const s = document.createElement('span');
      s.textContent = k === l.syl.length - 1 ? x.s.replace(/\s+$/, '') : x.s; s._t = x.t;
      if(cs[k].length){ const c = document.createElement('i'); c.className = 'kv-ch'; c.textContent = cs[k].join(' '); s.appendChild(c); s.classList.add('kv-w'); }
      target.appendChild(s); sp.push(s);
    });
    return sp;
  }
  function setLines(prevI, curI){
    el.prev.classList.remove('kv-hasch');
    el.prev.textContent = lineText(lrc.lines[prevI]);
    spans = fill(el.cur, curI, true);
    fill(el.next, curI + 1, false);
    fill(el.next2, curI + 2, false);
  }

  return {
    load(parsed){ lrc = parsed; shownIdx = null; this.render(null); },
    setChords(list){ chords = list && list.length ? list : null; shownIdx = null; },
    clear(){ lrc = null; chords = null; shownIdx = null; Object.values(el).forEach(e => { e.textContent = ''; e.classList.remove('kv-hasch'); }); },
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
      if(shownIdx !== i){ shownIdx = i; setLines(i - 1, i); }
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

// LRC letöltése (a fájlnévben lehet szóköz, ékezet, & stb.)
function fetchLrc(url){
  return fetch(encodeURI(url), { cache: 'no-cache' }).then(r => {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  }).then(parseLrc);
}
