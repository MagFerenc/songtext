// ============================================================
// A DALOK LISTÁJA — ezt szerkeszd a saját dalaiddal!
// A sorrend itt = a "Előző / Következő" gombok sorrendje.
//
// type: "web"  -> sima weboldal, ami a dalszöveget mutatja
//                 (pl. egy publikált Google Doc, saját html oldal, stb.)
// type: "pdf"  -> egy PDF fájl linkje (kottával / szöveggel)
//
// id:    egyedi szám, ez alapján lehet a "Dal száma" mezőbe beírva
//        közvetlenül kiválasztani egy dalt
// title: ez jelenik meg a vezérlőn és a nézőknél
// url:   a dalszöveg/kotta pontos, publikus linkje
// ============================================================
const SONGS = [
  { id: 1, title: "Példa dal – Ámen", type: "web", url: "https://example.com/dalok/amen.html" },
  { id: 2, title: "Példa dal – Áldás", type: "pdf", url: "https://example.com/dalok/aldas.pdf" },
  { id: 3, title: "Példa dal – Öröm", type: "web", url: "https://example.com/dalok/orom.html" },
];
