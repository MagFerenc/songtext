// ============================================================
// KARAOKE HANGNEM — akkordok transzponálása és magyar akkordjelölés (csak a vezérlő használja).
// (Ezt a fájlt nem kell szerkeszteni.)
//
// Az .akkord.lrc fájlokban angol jelölés van (B = H, Bb = magyar B).
// A vezérlő mindig magyar jelöléssel mutatja: H, B (= angol Bb), C#, Eb, F#, Ab …
// A transzponálás csak az akkordok betűit cseréli — a szöveg és az időzítés nem változik
// (élőben nincs MIDI-zene, Ferenc harmonikán kísér).
//
// "C-be": a dal hangnemét az akkordokból becsüli; dúr dal → C-dúr, moll dal → a-moll
// (az a-moll a C-dúr "párja": ugyanazok a hangok, ugyanolyan könnyű fogások).
// ============================================================

const HN_IN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };
// Akkordnevek magyar jelöléssel, hangnemtől függően keresztes / bés / vegyes írásmóddal
const HN_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
const HN_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'B', 'H'];
const HN_MIX   = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'B', 'H'];
// Hangnemnevek (magyar: dúr nagybetű, moll kisbetű)
const HN_KEY_MAJ = ['C', 'Desz', 'D', 'Esz', 'E', 'F', 'Fisz', 'G', 'Asz', 'A', 'B', 'H'];
const HN_KEY_MIN = ['c', 'cisz', 'd', 'esz', 'e', 'f', 'fisz', 'g', 'gisz', 'a', 'b', 'h'];

// "F#m7" → { r: 6, q: 'm7', bass: null } ; "C/G" → bass: 7 ; nem akkord → null
function hnParse(name){
  const m = /^([A-H])(#|b|is|es|s)?(.*?)(?:\/([A-H])(#|b)?)?$/.exec((name || '').trim());
  if(!m || !(m[1] in HN_IN)) return null;
  const acc = s => s === '#' || s === 'is' ? 1 : s === 'b' || s === 'es' || s === 's' ? -1 : 0;
  // angol forrás: a "B" = H; a "Bb" = magyar B
  const r = (HN_IN[m[1]] + acc(m[2]) + 12) % 12;
  const bass = m[4] ? (HN_IN[m[4]] + acc(m[5]) + 12) % 12 : null;
  return { r, q: m[3] || '', bass };
}
const hnMinorQ = q => /^m(?!aj)/.test(q);

// Melyik írásmód illik a hangnemhez (key: { r, minor })
function hnNames(key){
  if(!key) return HN_MIX;
  const majR = key.minor ? (key.r + 3) % 12 : key.r;          // a moll hangnem dúr párja
  if(majR === 0) return HN_MIX;                                 // C-dúr / a-moll
  return [5, 10, 3, 8, 1].includes(majR) ? HN_FLAT : HN_SHARP;  // F, B, Esz, Asz, Desz → bés
}

// Egy akkord eltolása 'shift' félhanggal, magyar jelöléssel (key: a CÉL hangnem, az írásmódhoz)
function hnChord(name, shift, key){
  const p = hnParse(name);
  if(!p) return name;                                           // pl. "N.C."
  const N = hnNames(key);
  const s = ((shift % 12) + 12) % 12;
  return N[(p.r + s) % 12] + p.q + (p.bass !== null ? '/' + N[(p.bass + s) % 12] : '');
}

// A dal hangneme az akkordokból: minden lehetséges hangnemre pontozzuk, mennyi ideig
// szólnak "odaillő" akkordok; a hangnem alapakkordja és a dal utolsó akkordja külön pontot ér.
// chords: [{ t, c }] (angol jelöléssel), songEnd: a dal hossza (mp) → { r, minor } vagy null
function hnDetectKey(chords, songEnd){
  const list = (chords || []).map((x, i, a) => {
    const p = hnParse(x.c), next = a[i + 1] ? a[i + 1].t : (songEnd || x.t + 2);
    return p ? { r: p.r, minor: hnMinorQ(p.q), dim: /dim/.test(p.q), d: Math.max(0.2, Math.min(next - x.t, 16)) } : null;
  }).filter(Boolean);
  if(!list.length) return null;
  const total = list.reduce((s, x) => s + x.d, 0);
  // hangnemhez illő akkordok: [távolság az alaphangtól, moll?]
  const MAJ = [[0, 0], [2, 1], [4, 1], [5, 0], [7, 0], [9, 1], [2, 0], [4, 0]];   // + II7, III7 (gyakori)
  const MIN = [[0, 1], [5, 1], [7, 0], [7, 1], [8, 0], [3, 0], [10, 0], [5, 0], [2, 0]];
  const last = list[list.length - 1], first = list[0];
  let best = null;
  for(let r = 0; r < 12; r++) for(const minor of [false, true]){
    const set = minor ? MIN : MAJ;
    let sc = 0;
    for(const x of list){
      if(x.dim) continue;
      const iv = (x.r - r + 12) % 12, k = set.findIndex(([i, m]) => i === iv && !!m === x.minor);
      if(k >= 0) sc += x.d * (k === 0 ? 1.6 : k >= 6 ? 0.5 : 1);   // alapakkord többet ér, a "kölcsön" kevesebbet
    }
    if(last.r === r && last.minor === minor) sc += total * 0.25;     // a dalok többnyire az alapakkordon végződnek
    if(first.r === r && first.minor === minor) sc += total * 0.1;
    if(!best || sc > best.sc) best = { r, minor, sc };
  }
  return { r: best.r, minor: best.minor };
}

// Hangnem neve: { r: 7, minor: false } → "G-dúr" ; { r: 9, minor: true } → "a-moll"
function hnKeyName(key){
  if(!key) return '?';
  return key.minor ? HN_KEY_MIN[key.r] + '-moll' : HN_KEY_MAJ[key.r] + '-dúr';
}
// Eltolás után a hangnem
function hnShiftKey(key, shift){ return key ? { r: (key.r + shift % 12 + 12) % 12, minor: key.minor } : null; }
// "C-be" eltolás: dúr → C, moll → a; a kisebbik lépést választja (−5 … +6)
function hnShiftToC(key){
  if(!key) return 0;
  let s = ((key.minor ? 9 : 0) - key.r + 12) % 12;
  return s > 6 ? s - 12 : s;
}
// eltolás normalizálása −5 … +6 közé
function hnNorm(s){ s = ((Math.round(s) % 12) + 12) % 12; return s > 6 ? s - 12 : s; }

if(typeof module !== 'undefined') module.exports = { hnParse, hnChord, hnDetectKey, hnKeyName, hnShiftKey, hnShiftToC, hnNorm };
