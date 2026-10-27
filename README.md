# Dal kijelző — linkek

- 🎛️ **[Dal vezérlő](https://magferenc.github.io/songtext/controller.html)** — itt választod ki a dalt
- 📄 **[Viewer — kijelző](https://magferenc.github.io/songtext/viewer.html)** — ezt nyisd meg a kijelzőn / tableten
- 🎤 **[Karaoke vezérlő](https://magferenc.github.io/songtext/ControllerKaraoke.html)** — karaoke dal kiválasztása és indítása
- 📱 **[Karaoke kijelző](https://magferenc.github.io/songtext/viewerKaraoke.html)** — a nézők ezen látják a futó szöveget
- 🛠️ **[MIDI → LRC átalakító](https://magferenc.github.io/songtext/midi2lrc.html)** — karaoke-MIDI-ből időzített dalszöveg

---

# Hogyan adj hozzá új dalt?

## 1. Töltsd fel a PDF-et

1. Menj be a `songtext` GitHub repóba.
2. Nyisd meg a `dalok` mappát.
3. Kattints **"Add file" → "Upload files"**.
4. Húzd be / válaszd ki a PDF fájlt.
5. Lent kattints **"Commit changes"**-re.

## 2. Add hozzá a `songs.js` fájlban

1. A repó főoldalán nyisd meg a `songs.js` fájlt.
2. Kattints a ceruza ikonra (jobb felül) — ez a szerkesztés.
3. A lista végére (a `];` sor elé) írj be egy új sort, ilyen formában:

   ```
   { id: 4, title: "Ide írd a dal címét", type: "pdf", url: "dalok/ide-a-fajlnev.pdf" },
   ```

   - **id**: egy szám, ami még nincs használva (mindig eggyel nagyobb, mint az előző)
   - **title**: a dal címe, amit majd mindenki lát
   - **url**: `dalok/` + a pontosan úgy, ahogy a PDF fájlt elnevezted

   Ha nem PDF-et, hanem egy weboldal-linket adsz hozzá, akkor `type: "web"`
   legyen, és az `url`-hoz a teljes linket írd be (pl. `https://...`).

4. Lent kattints **"Commit changes"**-re.

## Kész!

Fél-egy perc múlva az új dal megjelenik a vezérlő oldal legördülő listájában,
és a "Dal száma" mezőbe beírva az `id` alapján is kiválasztható.

⚠️ Figyelj a vesszőkre és a kapcsos zárójelekre — ha egy vessző vagy zárójel
hiányzik, a teljes oldal elromolhat. Legbiztosabb, ha egy meglévő sort
másolsz, és abban írod át a szöveget.

## Kategóriák (a vezérlő jobb felső sarkában)

A `categories.js` fájlban van, melyik dalszám-tartomány melyik kategória
(pl. 100–199 = Szülinap). Ugyanúgy szerkeszthető, mint a `songs.js`.

---

# Karaoke dalok

A karaoke oldalak (`ControllerKaraoke.html`, `viewerKaraoke.html`) a főkönyvtárban vannak, a normál
dalkijelzőtől függetlenül működnek. A dalszövegek **LRC** fájlok (időzített dalszöveg) a `Karaoke`
mappában, alkönyvtárakba rendezve:

```
Karaoke/
  900-Magyar/
    01-Ad Studio/
      90101-A Nap szerelmese.lrc
      90101-A Nap szerelmese.akkord.lrc
    02-Ákos/
    …
    57-Mulatós/
      58-Dupla Kávé/
```

**Számozás (5 jegyű):** `9 01 01` = főkategória (9 = Magyar) · mappa száma · dal sorszáma a mappában.
A vezérlő lenyílójában a mappák fastruktúraként látszanak, a „Dal száma” mezőbe a szám beírható.

## Új karaoke dal hozzáadása

1. Nyisd meg a **MIDI → LRC átalakítót**, húzd rá a karaoke-MIDI fájl(oka)t vagy mappát, és töltsd le a ZIP-et.
2. A repóban nyisd meg a megfelelő mappát a `Karaoke` alatt, és töltsd fel az `.lrc` (és `.akkord.lrc`)
   fájlt (**"Add file" → "Upload files"** → **"Commit changes"**). Érdemes a fájlnevet a dal számával
   kezdeni, pl. `90104-Dal címe.lrc`.
3. Nyisd meg a `karaoke-songs.js` fájlt (ceruza ikon), és a mappa többi dala után írj egy új sort:

   ```
   { id: 90104, title: "Dal címe", artist: "Ad Studio", url: "Karaoke/900-Magyar/01-Ad Studio/90104-Dal címe.lrc" },
   ```

## Használat élőben

1. A vezérlőn válaszd ki a dalt — a nézők telefonján megjelenik a cím és az első sorok.
2. A zene indulásával egyszerre nyomd meg a **▶ Start**-ot (vagy Szóköz / Enter / PageDown /
   lapozópedál). A ← → nyilak itt is az előző / következő dalt választják, mint a sima vezérlőnél. Az első sor előtt 5 másodperccel visszaszámlálás indul.
3. Ha a szöveg elcsúszik, a **± 0,25 mp** gombokkal (vagy a ↑ ↓ nyilakkal) igazíts.
4. A **Start** gomb (vagy Szóköz) futás közben **szünetet** tart, újabb nyomásra onnan **folytatja**.
5. **■ Stop** (vagy Esc / PageUp) visszaállítja a dal elejére.
6. **Tempó:** ha a szintin gyorsabbra/lassabbra állítod a dalt, a vezérlőn a **− lassabb / + gyorsabb**
   gombokkal (vagy a + / − billentyűkkel) ugyanannyi BPM-mel kell állítani; **↺** = vissza az eredetire.
   Ehhez kell a dal eredeti tempója: az új átalakítóval készült LRC-kben benne van, a régieknél
   egyszer be kell írni az „Eredeti tempó” mezőbe (a szinti kijelzőjéről) — a vezérlő megjegyzi.

Ha a MIDI-t USB-n csatlakoztatott hangszer vagy lejátszó játssza, a „MIDI Start/Stop jelre”
jelölővel a vezérlő magától indul és áll le (Chrome / Edge böngészőben).

## Akkordok (csak a vezérlőn látszanak)

A karaoke vezérlő a szöveg fölött és egy nagy kijelzőn („most → következő”) mutatja az akkordokat,
a nézők kijelzőjén **nem** jelennek meg.

- Az akkordok külön fájlban vannak, a dal LRC-je mellett, ugyanazzal a névvel, csak `.akkord.lrc`
  végződéssel (pl. `Dal.lrc` mellett `Dal.akkord.lrc`). A vezérlő magától megtalálja, a
  `karaoke-songs.js`-be nem kell beírni.
- A **MIDI → LRC átalakító** ezt is elkészíti: ha a MIDI-ben vannak akkordok (Yamaha XF fájlok),
  azokat veszi ki („✔ a fájlból”), ha nincsenek, a MIDI hangjaiból becsüli („≈ becsült”).
  Alapból **egyszerű akkordokat** ír (dúr, moll, 7-es, ritkán dim) — a részletesebbekhez
  (maj7, m7, sus4, basszushang…) vedd ki az „egyszerű akkordok” jelölőt a fájlok behúzása előtt.
  A becsült akkord nem mindig tökéletes — a fájl szövegszerkesztővel javítható, soronként
  `[perc:mp.század]Akkord`, pl. `[00:25.40]Dm`.
