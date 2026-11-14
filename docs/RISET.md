# Riset Materi — Belajar Mandarin Tradisional (Taiwan)

Ringkasan riset yang menjadi dasar isi aplikasi `index.html`.

> Catatan: dokumen ini ditulis di awal proyek. Versi sekarang hanya menampilkan hanzi dan pinyin (zhuyin tidak dipakai);
> lihat README untuk fitur terbaru.

## 1. Standar acuan: TOCFL (Taiwan)

TOCFL (Test of Chinese as a Foreign Language) adalah ujian kemahiran Mandarin resmi Taiwan dan menjadi acuan
kurikulum Mandarin tradisional. Target kosakata per level:

| Band | Level | Setara CEFR | Kosakata dasar |
|---|---|---|---|
| Novice | Novice 1–2 | Pra-A1 | ± 300 kata |
| A | Level 1 / 2 | A1 / A2 | 500 / 1.000 kata |
| B | Level 3 / 4 | B1 / B2 | 2.500 / 5.000 kata |
| C | Level 5 / 6 | C1 / C2 | 8.000 kata |

**Keputusan desain (versi 2):** aplikasi memuat seluruh daftar resmi TOCFL 2023 (7.517 kata, Novice 1 sampai
Level 5–6 / C2) dari [ivankra/tocfl](https://github.com/ivankra/tocfl), dengan arti bahasa Indonesia untuk Novice
dan Level 1 (`data/id-gloss.txt`) serta arti bahasa Inggris CC-CEDICT untuk level di atasnya. Kosakata disusun
menjadi jalur belajar linear (385 unit), diselingi unit tata bahasa, percakapan, dan soal bergaya TOCFL Band A
(問答理解, 對話理解, 選詞填空, 閱讀理解). Soal ditulis sendiri mengikuti format resmi, bukan disalin dari soal ujian.
Tampilan hanya memakai hanzi dan pinyin (zhuyin dihapus atas permintaan pengguna).

## 2. Aksara: Hanzi Tradisional (繁體字)

- Taiwan memakai aksara tradisional; Tiongkok daratan memakai aksara sederhana. Sebagian besar karakter sama,
  tetapi karakter yang sering dipakai banyak yang berbeda (學/学, 說/说, 書/书, 車/车, 門/门, 電/电, 愛/爱).
- Hampir semua hanzi tersusun dari **radikal (部首)** yang memberi petunjuk makna, sering ditambah komponen bunyi
  (mis. 媽 = 女 "perempuan" + 馬 "mǎ", petunjuk bunyi). Belajar ±35 radikal umum mempercepat mengingat karakter.
- Urutan goresan (筆順) penting untuk menulis rapi dan untuk input tulisan tangan.
  Aplikasi memakai data goresan dari proyek *Make Me a Hanzi* lewat pustaka **Hanzi Writer**.

## 3. Pelafalan: Pinyin dan Zhuyin (注音 / Bopomofo)

- **Hanyu Pinyin** adalah sistem romanisasi resmi Taiwan sejak 2009 dan paling mudah untuk pemula.
- **Zhuyin (ㄅㄆㄇㄈ)** dipakai di sekolah dasar Taiwan, kamus, dan keyboard ponsel Taiwan. Karena itu aplikasi
  menampilkan pinyin **dan** zhuyin, dan pinyin dikonversi otomatis ke zhuyin.
- Aturan ejaan pinyin penting: setelah j/q/x, huruf *u* dibaca *ü* (ju, qu, xu); *zhi/chi/shi/ri/zi/ci/si*
  tidak memakai bunyi "i" biasa; *y/w* hanya penulisan untuk suku kata tanpa konsonan awal.

## 4. Nada (聲調)

| Nada | Tanda | Kontur (skala Chao) | Contoh |
|---|---|---|---|
| 1 | ā | datar tinggi 55 | 媽 mā (ibu) |
| 2 | á | naik 35 | 麻 má (rami) |
| 3 | ǎ | turun-naik 214 — di Taiwan sering hanya turun rendah 21 | 馬 mǎ (kuda) |
| 4 | à | turun tajam 51 | 罵 mà (memarahi) |
| ringan | a | pendek, tanpa tanda | 嗎 ma (partikel tanya) |

**Penempatan tanda nada:** pada *a* atau *e* bila ada; pada *o* dalam *ou*; selain itu pada vokal terakhir
(mis. *guì*, *liù*).

**Perubahan nada (變調 / sandhi):**
1. Nada 3 + nada 3 → nada pertama dibaca nada 2 (你好 nǐ hǎo → *ní hǎo*).
2. 不 bù → bú sebelum nada 4 (不是 bú shì, 不要 bú yào).
3. 一 yī → yí sebelum nada 4 (一個 yí ge); → yì sebelum nada 1/2/3 (一起 yì qǐ); yī bila berdiri sendiri/urutan.

Kamus menulis nada asli; buku ajar Taiwan biasanya menulis perubahan 不 dan 一 langsung di pinyin.
Aplikasi mengikuti kebiasaan buku ajar itu, dan menampilkan petunjuk "dibaca" untuk sandhi nada 3.

## 5. Ciri khas Mandarin Taiwan (臺灣華語)

**Kosakata berbeda** (Taiwan / daratan): 計程車 / 出租车 (taksi), 捷運 / 地铁 (MRT), 公車 / 公交车 (bus),
腳踏車 / 自行车 (sepeda), 機車 / 摩托车 (motor), 鳳梨 / 菠萝 (nanas), 馬鈴薯 / 土豆 (kentang), 優格 / 酸奶
(yoghurt), 網路 / 网络 (internet), 影片 / 视频 (video), 軟體 / 软件 (software), 早安 / 早上好 (selamat pagi).

**Lafal berbeda:** 星期 xīngqí (daratan xīngqī), 垃圾 lèsè (lājī), 頭髮 tóufǎ (tóufa), 和 hàn dalam percakapan
(hé), 企業 qìyè (qǐyè). Nada ringan lebih jarang: 朋友 péngyǒu, 東西 dōngxī, 衣服 yīfú, 喜歡 xǐhuān.

**Aksen:** banyak penutur Taiwan melafalkan zh/ch/sh mendekati z/c/s, dan partikel seperti 喔 o, 啦 la, 耶 ye
sering muncul dalam percakapan.

## 6. Tata bahasa dasar (tingkat Novice–A1)

Struktur S–(waktu)–(tempat)–V–O, 是, 嗎, 呢, 的, 不 vs 沒, kata bantu bilangan (個 本 杯 張 隻),
在 (lokasi), pola A-不-A, 了, 比, 會/能/可以, 想/要, dan 很 + kata sifat.

## 7. Metode belajar yang dipakai aplikasi

- **Spaced repetition (sistem Leitner):** kartu yang diingat dijadwalkan ulang dengan jeda 1, 2, 4, 8, 16, 32 hari.
- **Kuis aktif:** hanzi→arti, arti→hanzi, dengar→hanzi, tebak nada.
- **Pewarnaan nada** (merah=1, hijau=2, biru=3, ungu=4, abu=ringan) untuk mengingat nada per karakter.
- **Audio** memakai suara bawaan perangkat (Web Speech API, prioritas suara zh-TW).

## Sumber

- [Test of Chinese as a Foreign Language — Wikipedia](https://en.wikipedia.org/wiki/Test_of_Chinese_as_a_Foreign_Language)
- [Understanding TOCFL — NCNU](https://cmn-hant.overseas.ncnu.edu.tw/further-study-area/summary-of-indonesia/understanding-tocfl-the-test-of-chinese-as-a-foreign-language/)
- [2020 TOCFL (PDF, roc-taiwan.org)](https://roc-taiwan.org/uploads/sites/163/2020/09/2020-Test-of-Chinese-as-a-Foreign-Language-TOCFL_English.pdf)
- [A Study on Differences Between Taiwanese Mandarin and Mainland Mandarin in Vocabulary — Atlantis Press](https://atlantis-press.com/article/55915676)
- [Differences Between Mainland Mandarin and Taiwanese Mandarin — Yoyo Chinese](https://yoyochinese.com/blog/Differences-Between-Mainland-Mandarin-and-Taiwanese-Mandarin)
- [Tone change rules — AllSet Learning Chinese Pronunciation Wiki](https://resources.allsetlearning.com/chinese/pronunciation/ASP00016)
- [Mandarin Tone Sandhi — YellowBridge](https://www.yellowbridge.com/chinese/mandarin-tone-sandhi.php)
- [Hanzi Writer](https://hanziwriter.org) dan data goresan *Make Me a Hanzi*
