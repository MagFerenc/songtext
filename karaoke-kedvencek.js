// ============================================================
// KARAOKE KEDVENCEK — közös kód a vezérlőhöz, a nézőhöz és a rendező laphoz.
// (Ezt a fájlt nem kell szerkeszteni.)
//
// A kedvencek a Firebase-ben vannak ('karaokeKedvencek'), nem a GitHubon:
// Ferenc a vezérlőből / a rendező lapról kezeli őket, és azonnal minden eszközön látszanak.
// Minden kedvenc saját "K" számot kap (K1, K2, … felső határ nélkül).
//
// Egy kedvenc a dal fájljához (url) kötődik, nem a dal számához — így ha a dalok
// száma később megváltozik, a kedvencek megmaradnak. Ha a fájl helye változik,
// a cím + előadó alapján is megtalálja.
// ============================================================

const FAV_PATH = 'karaokeKedvencek';

// Firebase-kulcs a dal fájlnevéből (a . # $ [ ] / nem lehet kulcsban)
function favKeyOf(song){
  return encodeURIComponent(song.url).replace(/\./g, '%2E');
}
// "K7", "k 7", "K07" → 7 ; minden más → null
function parseK(text){
  const m = /^\s*k\s*0*(\d+)\s*$/i.exec(text || '');
  return m ? parseInt(m[1], 10) : null;
}
const favNorm = x => (x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Kedvencek figyelése. onChange(favs) — favs: [{ key, k, url, title, artist, index }] K szerint sorban;
// index = a dal helye a SONGS listában (-1, ha a fájl már nincs meg).
function watchFavorites(db, SONGS, onChange){
  const byUrl = new Map(SONGS.map((s, i) => [s.url, i]));
  const byName = new Map(SONGS.map((s, i) => [favNorm(s.title + ' ' + (s.artist || '')), i]));
  const ref = db.ref(FAV_PATH);
  ref.on('value', snap => {
    const val = snap.val() || {};
    const favs = Object.entries(val).map(([key, f]) => {
      let index = byUrl.has(f.url) ? byUrl.get(f.url) : -1;
      if(index < 0){ const n = byName.get(favNorm(f.title + ' ' + (f.artist || ''))); if(n !== undefined) index = n; }
      return { key, k: f.k, url: f.url, title: f.title || '', artist: f.artist || '', index };
    }).filter(f => f.k > 0).sort((a, b) => a.k - b.k);
    onChange(favs);
  });
  // ha a Firebase nem engedi az írást (pl. szabály), ne vesszen el csendben
  const chk = pr => pr.catch(e => { alert('A kedvencet nem sikerült elmenteni a Firebase-be:\n' + (e && e.message || e)); throw e; });
  return {
    ref,
    nextFree(favs){ let k = 1; const used = new Set(favs.map(f => f.k)); while(used.has(k)) k++; return k; },
    add(song, k){ return chk(ref.child(favKeyOf(song)).set({ k, url: song.url, title: song.title, artist: song.artist || '' })); },
    setK(key, k){ return chk(ref.child(key).update({ k })); },
    remove(key){ return chk(ref.child(key).remove()); },
    replaceAll(list){        // [{k, url, title, artist}] — mentésből visszatöltés
      const obj = {};
      for(const f of list) if(f && f.url && f.k > 0) obj[favKeyOf(f)] = { k: f.k, url: f.url, title: f.title || '', artist: f.artist || '' };
      return chk(ref.set(obj));
    }
  };
}
