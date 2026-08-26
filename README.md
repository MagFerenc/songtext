# MagFerenc – élő dalszöveg-kivetítő

Ez a rendszer a pittnerf.github.io/songtext oldal működését adja vissza, a te
saját GitHub-fiókod alatt, "MagFerenc" néven. Két oldalból áll:

- **controller.html** – ezt Mag Ferenc nyitja meg (laptop/telefon), itt
  választja ki, melyik dal megy éppen.
- **viewer.html** – ezt látják a nézők a telefonjukon, miután beolvasták a
  QR-kódot. Amint a vezérlőn váltasz dalt, itt is azonnal frissül.

A két oldal egy ingyenes, valós idejű háttértárolón (Firebase Realtime
Database) keresztül "beszélget" egymással – enélkül egy statikus GitHub
Pages oldal nem tudna élőben szinkronizálni két különböző eszköz között.

---

## 1. lépés – Firebase projekt létrehozása (ingyenes, ~5 perc)

1. Menj a https://console.firebase.google.com oldalra, jelentkezz be Google-
   fiókkal, és kattints **"Add project" / "Projekt hozzáadása"**.
2. Adj neki egy nevet, pl. `magferenc-songtext`. A Google Analytics
   opciót nyugodtan kikapcsolhatod, nincs rá szükség.
3. Ha elkészült a projekt, a bal oldali menüben keresd meg a
   **"Build" → "Realtime Database"** pontot, és kattints
   **"Create Database"**-re.
   - Válassz egy hozzád közeli régiót (pl. Europe-West1).
   - Indulásnak válaszd a **"Start in test mode"** opciót (ez engedi az
     olvasást/írást jelszó nélkül — kis, zártkörű használatra ez teljesen
     megfelelő).
4. Ezután a bal fent lévő fogaskerék ikon → **"Project settings"** →
   görgess le az **"Your apps"** részhez → kattints a **`</>`** (Web)
   ikonra → adj neki egy nevet (pl. "songtext") → **"Register app"**.
5. Megjelenik egy `firebaseConfig = {...}` kódrészlet. **Ezt másold be**
   a mellékelt `firebase-config.js` fájlba, felülírva a
   `"IDE_MASOLD_BE"` placeholder szövegeket.

> ⚠️ Ez a config nem titkos kulcs (nyugodtan lehet nyilvános repóban),
> de a Realtime Database "test mode" 30 nap után lejár írás/olvasás
> szempontjából — ha ez lejár, a Firebase konzolban a
> **Realtime Database → Rules** fülön simán meg lehet hosszabbítani /
> nyitva tartani ezzel a szabállyal:
> ```json
> { "rules": { ".read": true, ".write": true } }
> ```

---

## 2. lépés – A dalok listájának összeállítása

Nyisd meg a `songs.js` fájlt, és minden dalhoz adj meg egy sort:

```js
{ id: 4, title: "Dal címe", type: "web", url: "https://ide-jon-a-link" }
```

- `type: "web"` – ha a link egy sima weboldal a dalszöveggel
- `type: "pdf"` – ha a link egy PDF fájl (kotta, dalszöveg PDF-ben)
- `id` – ezt a számot lehet majd beírni a vezérlőn a "Dal száma" mezőbe

---

## 3. lépés – Feltöltés GitHub Pages-re

1. Hozz létre egy új, publikus GitHub repót, pl. `songtext` a saját
   `MagFerenc` fiókod alatt.
2. Töltsd fel bele mind a 4 fájlt: `controller.html`, `viewer.html`,
   `firebase-config.js` (kitöltve), `songs.js` (kitöltve).
3. A repóban: **Settings → Pages → Source: Deploy from a branch → main
   / (root)** → Save.
4. Néhány perc múlva élesedik:
   - Vezérlő: `https://magferenc.github.io/songtext/controller.html`
   - Néző: `https://magferenc.github.io/songtext/viewer.html`

(Ha másik felhasználónevet vagy repónevet használsz, a linkek ennek
megfelelően változnak.)

---

## Használat élőben

1. Mag Ferenc a saját telefonján/laptopján megnyitja a **controller**
   linket.
2. Egy kivetítőn / nagy képernyőn megnyitjátok a **viewer** linket –
   ezen jelenik meg a QR-kód, amíg nincs dal kiválasztva.
3. A közönség beolvassa a QR-kódot a telefonjával → megnyílik nekik is
   a viewer oldal.
4. Amint Ferenc a vezérlőn kiválaszt egy dalt (legördülő menü, ← / →
   gombok, vagy a szám beírásával), a kivetítőn és mindenki telefonján
   egyszerre vált a dalszöveg.

---

## Amit érdemes tudni

- A `songFrame`-be (viewer) a dal linkje egy **iframe**-ben töltődik be.
  Néhány oldal (pl. Google Docs bizonyos beállításokkal, vagy oldalak,
  amik tiltják a "beágyazást") ezt letilthatja — ilyenkor a jobb alsó
  sarokban lévő **"Megnyitás új lapon"** gomb segít.
- Legegyszerűbb "web" típusú dalszöveg-forrás: egy publikált Google Doc
  (Fájl → Közzététel a weben), az garantáltan működik iframe-ben is.
- A rendszer bárkinek működik, aki ismeri a linket / beolvassa a
  QR-kódot — jelszavas védelem nincs benne. Zártkörű alkalomra ez
  általában elég, de ha szeretnéd, be lehet építeni egy egyszerű
  jelszavas képernyőt is a viewer elé.
