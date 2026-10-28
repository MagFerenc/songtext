// ============================================================
// KATEGÓRIÁK (a vezérlő jobb felső sarkában látszik)
//
// Melyik dalszám-tartomány melyik kategória.
//   from: első szám, to: utolsó szám (mindkettő beleértve)
//   name: ami a címkén megjelenik
//
// Új kategória: másolj le egy sort, és írd át a számokat és a nevet.
// Ha egy dal száma egyik tartományba sem esik, nem jelenik meg címke.
//
// FIGYELEM: minden sor végén kell vessző, az utolsó után nem!
// ============================================================
const CATEGORIES = [
  { from: 100, to: 149, name: "Szülinap" },
  { from: 150, to: 199, name: "Rock" },
  { from: 200, to: 299, name: "Pop" },
  { from: 300, to: 399, name: "Nemzetközi" },
  { from: 400, to: 449, name: "Mulatós" },
  { from: 450, to: 499, name: "Mulatós-Fox" },
  { from: 500, to: 599, name: "Népi" },
  { from: 600, to: 699, name: "Cigány" },
  { from: 700, to: 799, name: "Tánc" },
  { from: 800, to: 899, name: "Pittner F." }
];
