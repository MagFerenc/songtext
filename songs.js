// ============================================================
// A DALOK LISTÁJA
//
// Minden dalnál ott áll a PDF elérési útja és az oldalszám.
// A legtöbb dal ugyanabból az összefűzött PDF-ből jön, csak más oldalról.
//
// Új dal hozzáadása ebből a PDF-ből:
//   { id: 882, title: "Dal címe", type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf",
//     pageFrom: 120, pageTo: 121 }
//
// Külön PDF-ből (nem az összefűzöttből):
//   { id: 900, title: "Dal címe", type: "pdf", url: "Dalok/valami.pdf" }
//
// Saját HTML dalszöveg vagy külső link:
//   { id: 950, title: "Dal címe", type: "web", url: "Dalok/dal.html" }
//
// id:      egyedi szám — ezt lehet a "Dal száma" mezőbe beírva kiválasztani.
//          NEM kell sorfolytonosnak lennie, csak egyedinek.
// pageFrom / pageTo: a PDF tényleges oldalszáma (első oldal = 1).
//          Egyoldalas dalnál a pageTo elhagyható.
// Sorrend:  ahogy itt egymás után állnak = az "Előző / Következő" sorrendje.
//
// FIGYELEM: minden sor végén kell vessző, az utolsó után nem!
// A mappanevek kis/nagybetű-érzékenyek.
// ============================================================
const SONGS = [
  { id:   1, title: "Ujra itt van plusz",                            type: "pdf", url: "Dalok/Ujra-itt-van-plusz.pdf" },
  { id:   3, title: "Seemann",                                       type: "pdf", url: "Dalok/Seemann_n.pdf" },
  { id:   4, title: "Country Road",                                  type: "pdf", url: "Dalok/Country-Road.pdf" },
  { id: 201, title: "Mi kéne még",                                   type: "pdf", url: "Dalok/200-Pop/201-Mi-kene-meg.pdf" },
  { id: 202, title: "Mindig kell egy barát",                         type: "pdf", url: "Dalok/200-Pop/202-Mindig-kell-egy-barat.pdf" },
  { id: 203, title: "Szép nyári nap",                                type: "pdf", url: "Dalok/200-Pop/203-Szep-nyari-nap.pdf" },
  { id: 801, title: "Örökké tart",                                   type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 1, pageTo: 2 },
  { id: 802, title: "Szerelem első vérig",                           type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 3 },
  { id: 803, title: "Utcabál - Hungária",                            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 4 },
  { id: 804, title: "Ha majd nem leszek melletted én - Zámbó Jimmy", type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 5, pageTo: 6 },
  { id: 805, title: "Ha még egyszer láthatnám - Republic",           type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 7, pageTo: 8 },
  { id: 806, title: "I Love You Baby - Cserháti",                    type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 9, pageTo: 10 },
  { id: 807, title: "Öreg vagyok már, hogy összetörj - Balázs Fecó", type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 11, pageTo: 12 },
  { id: 808, title: "Születésnapodra - LGT",                         type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 13 },
  { id: 809, title: "Húsz év múlva - Komár László",                  type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 14, pageTo: 15 },
  { id: 810, title: "Micsoda buli – Hungária",                       type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 16 },
  { id: 811, title: "Elmegyek - Máté Péter",                         type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 17, pageTo: 18 },
  { id: 812, title: "Made in Hungária - Fenyő Miklós",               type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 19, pageTo: 21 },
  { id: 813, title: "Ott állsz az út végén - Máté Péter",            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 22 },
  { id: 814, title: "Szállj fel magasra - Piramis",                  type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 23 },
  { id: 815, title: "Ajándék - Piramis",                             type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 24 },
  { id: 816, title: "Neked írom a dalt - Presser Gábor",             type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 25, pageTo: 26 },
  { id: 817, title: "Európa - Varga Miklós",                         type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 27 },
  { id: 818, title: "Szeretlek is, meg nem is - R-GO",               type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 28, pageTo: 29 },
  { id: 819, title: "Hiányzol - Demjén Ferenc",                      type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 30, pageTo: 31 },
  { id: 820, title: "Mamma Maria - Korda György",                    type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 32, pageTo: 33 },
  { id: 821, title: "Kisvirág",                                      type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 34 },
  { id: 822, title: "A szabadság vándorai - Demjén Ferenc",          type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 35, pageTo: 36 },
  { id: 823, title: "Szép nyári nap",                                type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 37 },
  { id: 824, title: "Lady Ann - Korda György",                       type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 38, pageTo: 39 },
  { id: 825, title: "Bolond, aki sír - TNT",                         type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 40, pageTo: 41 },
  { id: 826, title: "Mégegyszer - Club54",                           type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 42 },
  { id: 827, title: "Ha egy napon hazamegyek",                       type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 43 },
  { id: 828, title: "Vigyázz magadra, fiam!",                        type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 44 },
  { id: 829, title: "Csavargódal",                                   type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 45 },
  { id: 830, title: "Az Utcán - Néha furcsa hangulatban",            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 46 },
  { id: 831, title: "Levél a távolból",                              type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 47, pageTo: 48 },
  { id: 832, title: "Utazás",                                        type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 49, pageTo: 50 },
  { id: 833, title: "Várj, míg felkel majd a nap!",                  type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 51, pageTo: 52 },
  { id: 834, title: "Éjjel érkezem",                                 type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 53 },
  { id: 835, title: "Adj helyet",                                    type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 54 },
  { id: 836, title: "Mielőtt elmegyek",                              type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 55 },
  { id: 837, title: "Gyertyák",                                      type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 56 },
  { id: 838, title: "Jégszív",                                       type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 57 },
  { id: 839, title: "Jöjj vissza vándor",                            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 58 },
  { id: 840, title: "Requiem - Karthago",                            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 59, pageTo: 60 },
  { id: 841, title: "Álmodtam egy világot",                          type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 61 },
  { id: 842, title: "Hűtlen",                                        type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 62 },
  { id: 843, title: "Napot hoztam, csillagot - Omega",               type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 63 },
  { id: 844, title: "Kergesd el a felhőt a házamról – Korál",        type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 64, pageTo: 65 },
  { id: 845, title: "Felmegyek hozzád",                              type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 66 },
  { id: 846, title: "Nem csak a húszéveseké a világ",                type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 67 },
  { id: 847, title: "Ciao Marina",                                   type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 68, pageTo: 69 },
  { id: 848, title: "Gyere, gyere Juli!",                            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 70, pageTo: 71 },
  { id: 849, title: "Próbálj meg lazítani!",                         type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 72, pageTo: 73 },
  { id: 850, title: "Ne hagyd el soha (El choclo)",                  type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 74 },
  { id: 851, title: "Régi csibészek",                                type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 75 },
  { id: 852, title: "Vidéki sanzon",                                 type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 76 },
  { id: 853, title: "Homokvár",                                      type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 77, pageTo: 78 },
  { id: 854, title: "Valahol egy lány",                              type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 79 },
  { id: 855, title: "Okosabban kéne élni",                           type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 80, pageTo: 81 },
  { id: 856, title: "Skandináv éjszakák",                            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 82 },
  { id: 857, title: "Santa Maria",                                   type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 83 },
  { id: 858, title: "Csavard fel a szőnyeget",                       type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 84, pageTo: 85 },
  { id: 859, title: "Nika Se Perimeno - Delhusa Gjon",               type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 86, pageTo: 87 },
  { id: 860, title: "Nincs szerencsém - Apostol",                    type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 88, pageTo: 89 },
  { id: 861, title: "A dal még most is a régi",                      type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 90, pageTo: 91 },
  { id: 862, title: "YMCA - Village people",                         type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 92, pageTo: 94 },
  { id: 863, title: "Azért vannak a jó barátok - Máté Péter",        type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 95, pageTo: 96 },
  { id: 864, title: "Évszakok",                                      type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 97 },
  { id: 865, title: "Kicsit szomorkás a hangulatom",                 type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 98 },
  { id: 866, title: "Nagy utazás",                                   type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 99 },
  { id: 867, title: "Így szólt hozzám a dédapám",                    type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 100 },
  { id: 868, title: "Múlnak a gyermekévek",                          type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 101 },
  { id: 869, title: "Lökd ide a sört",                               type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 102, pageTo: 103 },
  { id: 870, title: "Nem tudok élni nélküled",                       type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 104 },
  { id: 871, title: "Nehéz a boldogságtól",                          type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 105, pageTo: 106 },
  { id: 872, title: "Kevés voltam neked",                            type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 107 },
  { id: 873, title: "Szól a rádió",                                  type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 108, pageTo: 109 },
  { id: 874, title: "Vannak kivételek",                              type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 110, pageTo: 111 },
  { id: 875, title: "Holnap hajnalig",                               type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 112, pageTo: 113 },
  { id: 876, title: "Most múlik pontosan - Quimby",                  type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 114, pageTo: 115 },
  { id: 877, title: "Így is jó - Zorán",                             type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 116, pageTo: 119 },
  { id: 878, title: "Mikor elindul a vonat - Demjén",                type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 120 },
  { id: 879, title: "Ha újra kezdeném",                              type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 121 },
  { id: 880, title: "Te és én - Ihász Gábor",                        type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 122 },
  { id: 881, title: "Maradj velem!",                                 type: "pdf", url: "Dalok/pittnerf/Szövegek_összefuzött.pdf", pageFrom: 123 }
 ];

// FIGYELEM: minden sor végén kell vessző, az utolsó után nem
