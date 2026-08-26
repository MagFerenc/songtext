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
