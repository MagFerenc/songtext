// ============================================================
// A KARAOKE DALOK LISTÁJA
//
// Minden dalnál ott áll az LRC fájl elérési útja (a Karaoke mappában).
// LRC fájlt a midi2lrc.html oldalon lehet készíteni karaoke-MIDI-ből.
//
// Új dal hozzáadása:
//   1. Töltsd fel az .lrc fájlt a megfelelő alkönyvtárba (pl. Karaoke/200-Pop).
//   2. Írj ide egy új sort, pl.:
//   { id: 202, title: "Dal címe - Előadó", url: "Karaoke/200-Pop/Fajl neve.lrc" },
//
// id:      egyedi szám — ezt lehet a "Dal száma" mezőbe beírva kiválasztani.
//          A kategória (jobb felső címke) a categories.js szerint jön.
// url:     Karaoke / alkönyvtár / fájlnév, pontosan úgy, ahogy feltöltötted.
// Sorrend: ahogy itt egymás után állnak = az "Előző / Következő" sorrendje.
//
// FIGYELEM: minden sor végén kell vessző, az utolsó után nem!
// A mappanevek kis/nagybetű-érzékenyek.
// ============================================================
const KARAOKE_SONGS = [
  { id: 201, title: "Szeress úgy is, ha rossz vagyok",                 url: "Karaoke/200-Pop/Szeress_ugy_is_ha_rossz_vagyok.lrc" },
  { id: 301, title: "You're The One That I Want - Travolta & Newton-John", url: "Karaoke/300-nemzetkozi/John Travolta & Olivia Newton John - You're The One That I Want.lrc" }
];
