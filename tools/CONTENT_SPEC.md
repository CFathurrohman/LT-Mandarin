# Spesifikasi konten tambahan (data/extra-*.js)

Aplikasi: belajar Mandarin Taiwan (aksara tradisional) untuk penutur bahasa Indonesia, berjenjang TOCFL.
Level (`lv`): 0 = Novice 1, 1 = Novice 2, 2 = Level 1 (A1), 3 = Level 2 (A2), 4 = Level 3 (B1), 5 = Level 4 (B2), 6 = Level 5–6 (C1–C2).

## Berkas
Satu berkas `data/extra-<nama>.js` berisi tepat satu panggilan `addExtra({...});` (JavaScript biasa, UTF-8, string bertanda kutip ganda; kutip ganda di dalam string di-escape `\"`).

## Bentuk data (pilihan pertama SELALU jawaban benar; aplikasi mengacaknya)
```js
addExtra({
  grammar:[{lv:0, j:"Judul pola (Indonesia)", pola:"Pola singkat, mis. A 也 B", d:"Penjelasan singkat (Indonesia)", c:[["kalimat hanzi","pinyin","arti"], ...]}],  // 2–3 contoh, tiap contoh ≥ 4 karakter Han
  dialogs:[{lv:0, j:"Judul (Indonesia)", s:"Situasi singkat (Indonesia)", b:[["Nama/peran","hanzi","pinyin","arti Indonesia"], ...]}],
  qa:[[lv,"pertanyaan hanzi","pinyin","arti","jawaban benar hanzi","pinyin","arti","pengecoh1 hanzi","pinyin","pengecoh2 hanzi","pinyin"]],
  dc:[{lv:0, d:[["男","hanzi","pinyin"],["女","hanzi","pinyin"]], q:["pertanyaan hanzi","pinyin","arti"], o:[["benar","pinyin"],["salah","pinyin"],["salah","pinyin"]], t:"terjemahan dialog"}],
  gap:[[lv,"kalimat dengan ＿ (U+FF3F) di posisi jawaban","pinyin KALIMAT LENGKAP termasuk jawaban","arti","jawaban benar","pengecoh1","pengecoh2"]],
  order:[[lv,"token|token|token","pinyin kalimat lengkap","arti", ["urutan|alternatif|yang|juga benar"]]],  // elemen ke-5 opsional
  read:[{lv:0, t:"Judul", h:"teks hanzi", p:"pinyin", id:"terjemahan", qs:[["pertanyaan","pinyin","arti",["benar","pinyin"],["salah","pinyin"],["salah","pinyin"]]]}],
  stories:[{lv:0, t:"Judul", h:"cerita hanzi", p:"pinyin", id:"terjemahan"}]
});
```

## Aturan pinyin (diperiksa otomatis)
- Jumlah suku kata pinyin = jumlah karakter Han pada hanzi pasangannya (tanda baca tidak dihitung).
- Tanda nada (ā á ǎ à), nada ringan tanpa tanda, ü ditulis ü (lǜ, nǚ).
- Suku kata dalam satu kata disambung (xuéshēng), antarkata dipisah spasi; nama diri dan awal kalimat kapital; tanda baca boleh.
- Apostrof sebelum suku kata berawalan a/e/o di tengah kata (Xī'ān, kě'ài).
- 一 dan 不 ditulis dengan nada yang diucapkan (yí ge, yì bēi, bú shì, bú yào).
- Lafal baku Taiwan: 星期 xīngqí, 垃圾 lèsè, 喜歡 xǐhuān, 朋友 péngyǒu, 時候 shíhòu, 頭髮 tóufǎ, 企業 qìyè, 和 hé. Pakai 臺 untuk Taiwan, 你 bukan 妳.

## ATURAN KARAKTER (paling penting, diperiksa otomatis)
Aplikasi ini linear: soal hanya boleh memakai hanzi yang SUDAH diajarkan di jalur belajar.
- Item level `lv` = N hanya boleh memakai karakter yang ada di `data/chars-lvN.txt` (daftar kumulatif level 0..N).
  Ini berlaku untuk SEMUA hanzi: kalimat, jawaban, pengecoh, nama orang, nama tempat, judul tidak termasuk (judul berbahasa Indonesia).
- Novice 1 (lv 0) hanya punya 177 karakter. Pakai kalimat sangat sederhana dari karakter itu; ganti topik bila perlu.
- Nama orang/tempat juga harus dari karakter yang diizinkan (mis. 大明, 小美, 王老師 bila 王 sudah ada). Jangan pakai 印尼 bila 尼 tidak ada.
- Validator menolak karakter yang belum diajarkan dan menyebut karakternya.

## Aturan isi
- Kosakata dan tata bahasa sesuai level (lihat `data/tocfl.txt`: ID `L0-1` Novice 1, `L0-2` Novice 2, `L1-` A1, `L2-` A2, `L3-` B1, `L4-` B2, `L5-` C). Boleh memakai kata dari level di bawahnya.
- Panjang kalimat: Novice ≤ 10 karakter, A1–A2 ≤ 18, B1–B2 ≤ 30, C bebas tapi wajar.
- Pengecoh harus jelas salah tetapi gramatikal; pada soal isi kalimat ketiga pilihan tidak boleh sama-sama benar.
- Terjemahan bahasa Indonesia alami dan ringkas. Tanpa nama orang nyata, merek, atau perusahaan nyata.
- Situasi khas Taiwan dan kehidupan sehari-hari (MRT, minimarket, pasar malam, sekolah, kerja, festival, kuliner, alam).
- Jangan menyalin kalimat yang sudah ada di `app.html` atau `data/extra-*.js` lain.

## Validasi WAJIB sebelum selesai
Jalankan dari folder proyek:
```
node tools/validate-extra.js data/extra-<nama>.js
```
Perbaiki semua galat sampai keluar tanda ✓. Validator memeriksa jumlah suku kata, bentuk data, level, dan kalimat ganda.
