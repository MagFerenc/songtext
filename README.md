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
dalkijelzőtől függetlenül működnek. A dalszövegek **LRC** fájlok (időzített dalszöveg), a `Karaoke` mappán belül ugyanolyan
alkönyvtárakban, mint a PDF-ek a `Dalok` alatt (`200-Pop`, `300-nemzetkozi` …).

## Új karaoke dal hozzáadása

1. Nyisd meg a **MIDI → LRC átalakítót**, húzd rá a karaoke-MIDI fájl(oka)t, és töltsd le az LRC-t.
   (Csak olyan MIDI-ből lesz LRC, amiben van dalszöveg — az oldal kiírja.)
2. A repóban nyisd meg a `Karaoke` mappán belül a megfelelő alkönyvtárat, és töltsd fel az
   `.lrc` fájlt (**"Add file" → "Upload files"** → **"Commit changes"**).
3. Nyisd meg a `karaoke-songs.js` fájlt (ceruza ikon), és a lista végére írj egy új sort:

   ```
   { id: 202, title: "Dal címe - Előadó", url: "Karaoke/200-Pop/Fajl neve.lrc" },
   ```

   - **id**: egyedi szám; a kategória (jobb felső címke) a `categories.js` tartományai szerint jön
   - **url**: `Karaoke/` + alkönyvtár / fájlnév, pontosan úgy, ahogy feltöltötted (kis/nagybetű is számít)

## Használat élőben

1. A vezérlőn válaszd ki a dalt — a nézők telefonján megjelenik a cím és az első sorok.
2. A zene indulásával egyszerre nyomd meg a **▶ Start**-ot (vagy Szóköz / Enter / PageDown /
   lapozópedál). A ← → nyilak itt is az előző / következő dalt választják, mint a sima vezérlőnél. Az első sor előtt 5 másodperccel visszaszámlálás indul.
3. Ha a szöveg elcsúszik, a **± 0,25 mp** gombokkal (vagy a ↑ ↓ nyilakkal) igazíts.
4. **■ Stop** (vagy Esc / PageUp) visszaállítja a dal elejére.

Ha a MIDI-t USB-n csatlakoztatott hangszer vagy lejátszó játssza, a „MIDI Start/Stop jelre”
jelölővel a vezérlő magától indul és áll le (Chrome / Edge böngészőben).
