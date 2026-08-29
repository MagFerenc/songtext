// ============================================================
// A DALOK LISTÁJA — ezt szerkeszd a saját dalaiddal!
// A sorrend itt = a "Előző / Következő" gombok sorrendje.
//
// type: "web"  -> sima weboldal, ami a dalszöveget mutatja
//                 (pl. egy publikált Google Doc, saját html oldal, stb.)
// type: "pdf"  -> egy PDF fájl linkje
//
// id:    egyedi szám, ez alapján lehet a "Dal száma" mezőbe beírva
//        közvetlenül kiválasztani egy dalt
// title: ez jelenik meg a vezérlőn és a nézőknél
// url:   a dalszöveg/kotta pontos, publikus linkje
//
// PDF FÁJLOK:
// A legegyszerűbb, ha magába a "songtext" GitHub repóba töltöd fel a
// PDF-eket, egy "dalok" nevű mappába. Ekkor az url mező egyszerűen
// a fájl neve lesz "dalok/" előtaggal, például:
//   { id: 5, title: "Csendes éj", type: "pdf", url: "dalok/csendes-ej.pdf" }
// (Nem kell teljes https:// linket írni, elég a relatív útvonal, mert
// a PDF ugyanabban a repóban lakik, mint ez a fájl.)
// ============================================================
const SONGS = [
  { id: 1, title: "Mindig kell egy barat", type: "pdf", url: "Dalok/Mindig-kell-egy-barat.pdf" },
  { id: 2, title: "Mi kéne még", type: "pdf", url: "Dalok/Mi-kene-meg.pdf" },
  { id: 3, title: "Seemann", type: "pdf", url: "Dalok/Seemann_n.pdf" },
  { id: 4, title: "Country Road ", type: "pdf", url: "Dalok/Country-Road.pdf" },
  { id: 5, title: "Ujra itt van plusz", type: "pdf", url: "Dalok/Ujra-itt-van-plusz.pdf" },
 ];
