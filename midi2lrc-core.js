// ============================================================
// MIDI → LRC átalakítás — közös kód a "MIDI → LRC átalakító" (midi2lrc.html)
// és a "Karaoke dal feltöltése" (KaraokeFeltoltes.html) laphoz.
// (Ezt a fájlt nem kell szerkeszteni.)
// ============================================================
const dec=new TextDecoder('windows-1250');

// ---------- MIDI beolvasás (hangokkal együtt, az akkordbecsléshez) ----------
function parseMidi(buf){
  const d=new DataView(buf),u=new Uint8Array(buf);
  const s4=a=>String.fromCharCode(u[a],u[a+1],u[a+2],u[a+3]);
  if(s4(0)!=='MThd')throw'Nem MIDI fájl';
  const div=d.getUint16(12);let p=8+d.getUint32(4);
  const ev=[];let trk=0;
  while(p+8<=u.length){
    const id=s4(p),len=d.getUint32(p+4);let q=p+8;const end=Math.min(q+len,u.length);p=q+len;
    if(id!=='MTrk')continue;
    let tick=0,rs=0,ord=0;
    const vlq=()=>{let v=0,b;do{b=u[q++];v=v*128+(b&127)}while(b&128&&q<end);return v};
    while(q<end){
      tick+=vlq();let st=u[q];
      if(st&128)q++;else st=rs;
      if(st===0xFF){const ty=u[q++],l=vlq(),raw=u.slice(q,q+l);q+=l;
        ev.push({tick,trk,ord:ord++,ty,raw,tx:dec.decode(raw)});
        if(ty===0x2F)break;}
      else if(st===0xF0||st===0xF7){const l=vlq();q+=l;}
      else{rs=st;const h=st&0xF0,ch=st&15;
        if(h===0x90||h===0x80){const n=u[q],v=u[q+1];ev.push({tick,trk,ord:ord++,ty:(h===0x90&&v>0)?'on':'off',ch,n,v});}
        q+=(h===0xC0||h===0xD0)?1:2;}
    }
    trk++;
  }
  ev.sort((a,b)=>a.tick-b.tick||a.trk-b.trk||a.ord-b.ord);
  let lastTick=0,sec=0,tempo=500000;
  for(const e of ev){
    sec+=(e.tick-lastTick)*tempo/1e6/div;lastTick=e.tick;e.t=sec;
    if(e.ty===0x51&&e.raw.length===3)tempo=(e.raw[0]<<16)|(e.raw[1]<<8)|e.raw[2];
  }
  ev.div=div;
  return ev;
}

// ===== Akkordok =====
const NOTE_SHARP=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_FLAT =['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
// Yamaha XF akkord-esemény: FF 7F len 43 7B 01 cr ct bn bt
const XF_TYPES=['','6','maj7','maj7(#11)','add9','maj9','6/9','aug','m','m6','m7','m7b5','m(add9)','m9','m11','m(maj7)','m(maj9)','dim','dim7','7','7sus4','7b5','9','7(#11)','13','7(b9)','7(b13)','7(#9)','maj7aug','7aug','1+8','5','sus4','sus2',null];
// Egyszerű akkordok: csak dúr, moll, 7-es (és a ritka dim) — a többi a legközelebbi egyszerűre
const simpleChords=()=>{const c=typeof document!=='undefined'&&document.getElementById('simpleCh');return c?c.checked:true};
function simplifyType(t){
  if(t==='dim'||t==='dim7'||t==='m7b5')return 'dim';
  if(/^m(?!aj)/.test(t))return 'm';
  if(/^(7|9|13)/.test(t)&&!/^7sus/.test(t))return '7';
  if(t==='7sus4')return '7';
  return '';
}
function xfNote(b){
  const acc=b>>4,n=b&15;if(n<1||n>7)return null;
  return 'CDEFGAB'[n-1]+(['bbb','bb','b','','#','##','###'][acc]??'');
}
function xfChords(ev){
  const out=[];
  for(const e of ev){
    if(e.ty!==0x7F||e.raw.length<7||e.raw[0]!==0x43||e.raw[1]!==0x7B||e.raw[2]!==0x01)continue;
    const root=xfNote(e.raw[3]),type=XF_TYPES[e.raw[4]];
    if(!root||type===null||type===undefined){out.push({t:e.t,c:'N.C.'});continue;}
    let c=root+(simpleChords()?simplifyType(type):type);
    if(!simpleChords()&&e.raw[5]!==127&&e.raw[5]!==e.raw[3]){const bs=xfNote(e.raw[5]);if(bs)c+='/'+bs;}
    out.push({t:e.t,c});
  }
  return dedupe(out);
}
function dedupe(a){const o=[];for(const x of a)if(!o.length||o[o.length-1].c!==x.c)o.push(x);return o;}

// Becslés a hangokból (ha nincs XF akkord): ütésenként hangnem-hisztogram + sablonillesztés + simítás
const TEMPLATES=[ // [név, hangközök, prior]
  ['',[0,4,7],0.10],['m',[0,3,7],0.08],['7',[0,4,7,10],0.02],['m7',[0,3,7,10],0.0],
  ['maj7',[0,4,7,11],-0.02],['dim',[0,3,6],-0.06],['aug',[0,4,8],-0.08],['sus4',[0,5,7],-0.06],['6',[0,4,7,9],-0.04]
];
const SIMPLE_TEMPLATES=[['',[0,4,7],0.10],['m',[0,3,7],0.08],['7',[0,4,7,10],0.0],['dim',[0,3,6],-0.08]];
function estimateChords(ev,lyricTrk){
  const TPL=simpleChords()?SIMPLE_TEMPLATES:TEMPLATES;
  // hangok tartammal
  const open={},notes=[];
  for(const e of ev){
    if(e.ty!=='on'&&e.ty!=='off')continue;
    if(e.ch===9)continue; // dob
    const k=e.trk+':'+e.ch+':'+e.n;
    if(e.ty==='on'){(open[k]=open[k]||[]).push(e);}
    else if(open[k]&&open[k].length){const s=open[k].shift();if(e.tick>s.tick)notes.push({a:s.tick,b:e.tick,n:s.n,ch:s.ch,trk:s.trk,ta:s.t,tb:e.t,v:s.v});}
  }
  if(!notes.length)return [];
  // melódia (szöveges sáv) és a dallamhangszer kisebb súllyal
  const div=ev.div,end=Math.max(...notes.map(x=>x.b));
  const nb=Math.ceil(end/div);
  const H=Array.from({length:nb},()=>new Float64Array(12)),LOW=Array.from({length:nb},()=>new Float64Array(12));
  for(const x of notes){
    const w0=(x.trk===lyricTrk?0.4:1)*(0.5+x.v/254);
    for(let b=Math.floor(x.a/div);b<=Math.floor((x.b-1)/div)&&b<nb;b++){
      const ov=Math.min(x.b,(b+1)*div)-Math.max(x.a,b*div);if(ov<=0)continue;
      const w=w0*ov/div;H[b][x.n%12]+=w;
      if(x.n<55)LOW[b][x.n%12]+=w*(55-x.n)/12; // basszus
    }
  }
  // ütésenkénti pontszám minden akkordra
  const C=[];for(let r=0;r<12;r++)for(const [nm,iv,pr] of TPL)C.push({r,nm,set:iv.map(i=>(r+i)%12),pr});
  const S=H.map((h,b)=>{
    const tot=h.reduce((s,x)=>s+x,0),lowt=LOW[b].reduce((s,x)=>s+x,0);
    if(tot<0.05)return null;
    return C.map(c=>{
      let inn=0;for(const p of c.set)inn+=h[p];
      const out=tot-inn;
      // a sablon minden hangja szóljon valamennyire
      let miss=0;for(const p of c.set)if(h[p]<0.05*tot)miss++;
      const bass=lowt>0?LOW[b][c.r]/lowt:0;
      return inn/tot-0.8*out/tot-0.15*miss+0.25*bass+c.pr;
    });
  });
  // Viterbi: váltás büntetése
  const SW=0.35,K=C.length;let prev=new Float64Array(K),bp=[];
  for(let b=0;b<nb;b++){
    const s=S[b],cur=new Float64Array(K),arg=new Int32Array(K);
    let bestP=-1e9,bestI=0;for(let k=0;k<K;k++)if(prev[k]>bestP){bestP=prev[k];bestI=k;}
    for(let k=0;k<K;k++){
      const stay=prev[k],sw=bestP-SW;
      if(stay>=sw){cur[k]=stay;arg[k]=k;}else{cur[k]=sw;arg[k]=bestI;}
      cur[k]+=s?s[k]:0;
    }
    bp.push(arg);prev=cur;
  }
  let k=0,best=-1e9;for(let i=0;i<K;i++)if(prev[i]>best){best=prev[i];k=i;}
  const path=new Array(nb);for(let b=nb-1;b>=0;b--){path[b]=k;k=bp[b][k];}
  // ütés → idő
  const tempoMap=ev.filter(e=>e.ty===0x51);
  const tt=tick=>{let sec=0,last=0,tempo=500000;for(const e of tempoMap){if(e.tick>tick)break;sec+=(e.tick-last)*tempo/1e6/div;last=e.tick;tempo=(e.raw[0]<<16)|(e.raw[1]<<8)|e.raw[2];}return sec+(tick-last)*tempo/1e6/div;};
  const flatKey=guessFlat(H);
  const out=[];
  for(let b=0;b<nb;b++){
    if(!S[b]){if(out.length&&out[out.length-1].c!=='N.C.'&&isSilentRun(S,b))out.push({t:tt(b*div),c:'N.C.'});continue;}
    const c=C[path[b]];const name=(flatKey?NOTE_FLAT:NOTE_SHARP)[c.r]+c.nm;
    if(!out.length||out[out.length-1].c!==name)out.push({t:tt(b*div),c:name});
  }
  // nagyon rövid (0,7 mp alatti) váltások kiszűrése — az ilyen többnyire csak átmenő hang
  for(let changed=true;changed;){
    changed=false;
    for(let i=0;i<out.length-1;i++){
      if(out[i+1].t-out[i].t<0.7&&out[i].c!=='N.C.'){out.splice(i,1);changed=true;break;}
    }
  }
  return dedupe(out);
}
function isSilentRun(S,b){let n=0;for(let i=b;i<S.length&&!S[i];i++)n++;return n>=4;}
function guessFlat(H){ // b-s vagy #-es írásmód a hangkészlet alapján
  const t=new Float64Array(12);for(const h of H)for(let i=0;i<12;i++)t[i]+=h[i];
  const flatScore=t[10]+t[3]+t[8],sharpScore=t[6]+t[1]+t[8]*0.5;
  return flatScore>=sharpScore;
}

// ---------- cím / előadó ----------
// Régi "magyarított" Latin-1 betűtípusok jelei → magyar betűk (õ/ô → ő, û → ű)
const fixHu=t=>t.replace(/[õô]/g,'ő').replace(/[ÕÔ]/g,'Ő').replace(/û/g,'ű').replace(/Û/g,'Ű');
// Sérült-e a fájlnév kódolása? (� jel, vagy ékezet helyett aláhúzás/kérdőjel, vagy DOS-os keretrajzoló jelek)
const brokenName=n=>/\uFFFD|[\u2500-\u257F\u2580-\u259F]|[a-z]__[a-z]|[A-Za-z]\?[a-z]/i.test(n)||/[a-zA-Z]_[a-zA-Z]/.test(n)&&!/ /.test(n);
function meta(ev,fname){
  let title='',artist='';
  const txt=ev.filter(e=>e.ty===1).map(e=>e.tx);
  const xfln=txt.find(x=>x.startsWith('XFln:')),xfhd=txt.find(x=>x.startsWith('XFhd:'));
  if(xfln){const f=xfln.split(':');if(f[2]&&f[2]!=='-')title=f[2];if(f[6]&&f[6]!=='-')artist=f[6];}
  if(!artist&&xfhd){const f=xfhd.split(':');if(f[9]&&f[9]!=='-')artist=f[9];}
  const atT=txt.filter(x=>x.startsWith('@T')).map(x=>x.slice(2).trim()).filter(Boolean);
  if(!title&&atT[0])title=atT[0];
  if(!artist&&atT[1])artist=atT[1];
  let base=fname.replace(/(\.(mid|midi|kar))+$/i,'');
  // nincs cím a fájlban → a fájlnév marad; de ha a fájlnév kódolása sérült, a MIDI sávneve
  // (ha értelmes szöveg) jobb cím
  if(!title){
    const tn=(ev.find(e=>e.ty===3&&e.trk===0&&e.tx.trim())||{}).tx||'';
    const tnOk=/[a-záéíóöőúüű]{3}/i.test(tn)&&!/^(track|untitled|sequence|seq|piano|melody|dallam|midi)\b/i.test(tn.trim());
    if(brokenName(base)&&tnOk)return {title:fixHu(tn.trim()).replace(/_/g,' ').replace(/\s+/g,' '),artist:'',fromFile:true};
    return {title:fixHu(base).replace(/_+/g,' ').replace(/\s+/g,' ').trim(),artist:'',fromFile:true};
  }
  return {title:fixHu(title.trim()),artist:fixHu(artist.trim())};
}

// ---------- szótagok ----------
function syllables(ev){
  let syl=ev.filter(e=>e.ty===5).map(e=>({t:e.t,s:e.tx}));
  if(syl.map(x=>x.s).join('').trim().length<20){ // .kar: szöveg a text eseményekben
    syl=ev.filter(e=>e.ty===1&&!/^(@|XF|\$)/.test(e.tx)).map(e=>({t:e.t,s:e.tx}));
    if(syl.map(x=>x.s).join('').trim().length<20)return null;
  }
  return syl;
}

function toLines(syl){
  const hasBreaks=syl.some(x=>/[\r\n\/\\]/.test(x.s));
  const lines=[];let cur=[];
  const flush=()=>{if(cur.length){lines.push(cur);cur=[]}};
  for(const {t,s:raw} of syl){
    let s=fixHu(raw.replace(/_/g,' '));   // aláhúzás → szóköz; õ/ô/û → ő/ű
    if(hasBreaks){
      if(/^[\/\\]/.test(s)){flush();s=s.replace(/^[\/\\]+/,'');}
      const endBr=/[\r\n]\s*$/.test(s);
      s=s.replace(/[\r\n]/g,'');
      if(s)cur.push({t,s});
      if(endBr)flush();
    }else{
      if(s)cur.push({t,s});
      if(/[,.!?;]\s*$/.test(s))flush();
    }
  }
  flush();
  // szerzői jogi / reklám szövegek (pl. "(C)ChrisMIDIStudio") kiszűrése
  // (a dal legelején, 0,3 mp előtt soha nincs ének — ott mindig felirat/cím/aláírás van)
  const JUNK=/greg\s*midi|b[oó]w?l?y\s*roll|all\s*rig\w*\s*reserved|kmidi|\(c\)|©|midi ?studio|www\.|https?:|@|karaoke creator|szöveg by/i;
  for(const l of lines)for(let k=l.length-1;k>=0;k--)if(JUNK.test(l[k].s)||l[k].t<0.3||/^[\s\-:.]*$/.test(l[k].s))l.splice(k,1);
  // csak betűt tartalmazó sorok maradnak (pl. "---- " előszámolás kiesik)
  return lines.filter(l=>/\p{L}/u.test(l.map(x=>x.s).join('')));
}

const ts=x=>{x=Math.max(0,x);const m=Math.floor(x/60),s=x-m*60;return String(m).padStart(2,'0')+':'+s.toFixed(2).padStart(5,'0')};
function makeLrc(m,lines,len){
  const out=[];
  if(m.title)out.push('[ti:'+m.title+']');
  if(m.artist)out.push('[ar:'+m.artist+']');
  if(len)out.push('[length:'+ts(len)+']');   // a dal hossza — a karaoke vezérlő ennél áll le
  if(m.bpm)out.push('[tempo:'+m.bpm+']');     // eredeti tempó (BPM) — a vezérlő ehhez képest állít
  if(m.meter)out.push('[meter:'+m.meter+']'); // ütemmutató (pl. 3/4) — a metronóm-LED ehhez igazodik
  out.push('[by:MIDI → LRC]');
  for(const l of lines)out.push('['+ts(l[0].t)+']'+l.map(x=>'<'+ts(x.t)+'>'+x.s).join('').trimEnd());
  return out.join('\r\n')+'\r\n';
}
function makeChords(m,ch,src){
  const out=[];
  if(m.title)out.push('[ti:'+m.title+' — akkordok]');
  out.push('[by:'+(src==='xf'?'akkordok a MIDI-ből (Yamaha XF)':'becsült akkordok a MIDI hangjaiból')+']');
  for(const x of ch)out.push('['+ts(x.t)+']'+x.c);
  return out.join('\r\n')+'\r\n';
}
const safe=n=>n.replace(/[\\\/:*?"<>|#%]/g,'').replace(/\s+/g,' ').trim()||'nevtelen';
const baseName=m=>m.fromFile?m.title:safe(m.artist?m.artist+' - '+m.title:m.title);

// ---------- egy MIDI fájl átalakítása ----------
// Eredmény: { lrc, chords, chSrc, chN, lines, meta, name }  — lrc = null, ha nincs benne időzített szöveg
function convertMidi(buf,fname){
  const ev=parseMidi(buf);const syl=syllables(ev);const r={lrc:null};
  if(!syl)return r;
  const m=meta(ev,fname),lines=toLines(syl);
  if(!lines.length)return r;
  const tsg=ev.find(e=>e.ty===0x58&&e.raw.length>=2);if(tsg)m.meter=tsg.raw[0]+'/'+Math.pow(2,tsg.raw[1]);
  const te=ev.find(e=>e.ty===0x51&&e.raw.length===3);if(te){const us=(te.raw[0]<<16)|(te.raw[1]<<8)|te.raw[2];m.bpm=Math.round(6e7/us*10)/10;}
  // a dal hossza: az utolsó hang vége (a fájl végén lévő csendet nem számítjuk)
  const lastNote=ev.reduce((a,e)=>(e.ty==='on'||e.ty==='off')?Math.max(a,e.t):a,0);
  r.lrc=makeLrc(m,lines,lastNote||ev.reduce((a,e)=>Math.max(a,e.t||0),0));r.lines=lines.length;r.name=baseName(m);r.meta=m;
  let ch=xfChords(ev),src='xf';
  if(ch.length<2){ch=estimateChords(ev,(ev.find(e=>e.ty===5)||{}).trk);src='est';}
  if(ch.length){r.chords=makeChords(m,ch,src);r.chSrc=src;r.chN=ch.length;}
  return r;
}
