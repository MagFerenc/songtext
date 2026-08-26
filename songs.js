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
  { id: 1, title: "Örökké tart – Példa 1", type: "pdf", url: "dalok/Orokke tart.pdf" },
  { id: 2, title: "Példa dal x – Teszt 2", type: "pdf", url: "dalok/teszt-dal.pdf" },
  { id: 3, title: "Példa dal 3 – Öröm", type: "web", url: "https://www.dalszoveg.hu/d1179796/zambo_jimmy/engem_csak_szeretni_kell-dalszoveg.html" },
  { id: 4, title: "Példa dal 4 – Teszt 4", type: "pdf", url: "dalok/teszt-dal.pdf" },
  { id: 5, title: "Szerelem első vérig", type: "web", url: "dalok/02-szerelem-elso-verig.html" },
];
