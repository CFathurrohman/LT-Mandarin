# LT-Mandarin · Learn Traditional Mandarin

**華語學堂**, aplikasi web untuk belajar Mandarin Taiwan (aksara tradisional) bagi penutur bahasa Indonesia, disusun
berjenjang mengikuti TOCFL dari **Novice 1 sampai Level 5–6 (C2)**. Hanya memakai **hanzi dan pinyin** (tanpa zhuyin).

Satu berkas HTML, JavaScript murni, tanpa framework dan tanpa server: cukup dibuka di browser, di komputer maupun ponsel.

## Fitur

- **Kosakata TOCFL 2023 lengkap** (7.517 kata), dengan arti bahasa Indonesia untuk Novice–Level 3 dan arti bahasa
  Inggris (CC-CEDICT) untuk level di atasnya, plus contoh kalimat.
- **Jalur belajar linear**: unit kosakata diselingi unit tata bahasa, percakapan, tanya-jawab, dialog, dan bacaan.
  Setiap soal hanya muncul setelah semua karakternya sudah diajarkan.
- **Soal bergaya TOCFL**: 問答理解, 對話理解, 選詞填空, 排列句子, 閱讀理解, listening, tebak nada.
  Pinyin tidak ditampilkan di pilihan jawaban; pinyin soal tersembunyi di balik tombol "Lihat pinyin".
- **Ujian buka-kunci level** dan **simulasi ujian TOCFL**.
- **Flashcard** dengan pengulangan berjarak (Leitner).
- **Bedah hanzi**: komponen, radikal, dan animasi urutan goresan (Hanzi Writer).
- **Role-play dialog**, **bacaan berjenjang** dengan kamus ketuk, latihan menulis dari ingatan dan mengetik pinyin.
- **Gamifikasi**: XP, combo, lencana, permainan susun kalimat, cocokkan kata, rakit hanzi.
- **Suara** lewat Web Speech API (tombol suara otomatis disembunyikan bila perangkat tidak punya suara Mandarin).
- **Mode gelap/terang**, tampilan ramah ponsel, sidebar lipat.
- **Simpan kemajuan**: otomatis di browser (localStorage), plus simpan/muat berkas JSON dan simpan otomatis ke
  berkas (File System Access API, di Chrome/Edge).

## Struktur

```
app.html                 sumber aplikasi (HTML + CSS + JS), berisi placeholder /*TOCFL*/, /*EXTRA*/, dll.
build.sh                 menyisipkan data ke app.html dan menghasilkan berkas siap pakai
data/
  tocfl.txt              daftar kata TOCFL: id|hanzi|pinyin|kelas kata|arti Inggris
  id-gloss*.txt          arti bahasa Indonesia per kata
  decomp.txt             dekomposisi hanzi (komponen, radikal, etimologi)
  examples.txt           contoh kalimat per kata Novice–A2 (kata|kalimat|pinyin)
  chars-lv0..6.txt       daftar karakter yang sudah diajarkan sampai tiap level (kumulatif)
  extra-*.js             konten tambahan: dialog, soal, bacaan, cerita (format di tools/CONTENT_SPEC.md)
tools/
  validate-extra.js      validator konten (jumlah suku kata pinyin, bentuk data, kalimat ganda, karakter per level)
  validate-examples.js   validator contoh kalimat (kata ada di kalimat, suku kata pinyin, karakter per level, panjang)
  CONTENT_SPEC.md        spesifikasi menulis konten baru
docs/
  RISET.md               ringkasan riset materi
```

## Build

Butuh **bash** (Linux/macOS, atau Git Bash di Windows) dengan `curl`, `awk`, `sed`, dan `grep -P`.
Node.js hanya diperlukan untuk validator konten.

```bash
bash build.sh
```

Build pertama mengunduh data goresan untuk ±2.700 karakter dari jsDelivr (`hanzi-writer-data`) ke cache `.strokes/`.
Hasilnya:

| Berkas | Kegunaan |
|---|---|
| `index.html` | versi mandiri (±10 MB, semua data goresan tersemat). Buka langsung di browser, bisa offline. |
| `dist/` | versi hosting: `index.html` ringan + `strokes/*.json` yang dimuat saat dibutuhkan. |
| `artifact.html` | halaman yang sama dengan `dist/index.html` tanpa pembungkus dokumen. |

Semua hasil build diabaikan oleh git (lihat `.gitignore`).

## Menjalankan

- **Lokal**: jalankan `bash build.sh`, lalu buka `index.html` di browser.
- **Hosting**: unggah isi folder `dist/` ke hosting statis apa pun (mis. seret ke [Netlify Drop](https://app.netlify.com/drop),
  atau GitHub Pages).

## Menambah konten

1. Baca `tools/CONTENT_SPEC.md`.
2. Buat `data/extra-<nama>.js` yang berisi satu panggilan `addExtra({...})`.
3. Validasi, lalu build ulang:

```bash
node tools/validate-extra.js data/extra-*.js
node tools/validate-examples.js data/examples.txt
```

Bila `data/tocfl.txt` berubah, perbarui daftar karakter per level dengan `node tools/validate-extra.js --chars`.

## Sumber data dan lisensi pihak ketiga

| Berkas | Isi | Sumber asli | Lisensi |
|---|---|---|---|
| `data/tocfl.txt` | daftar kosakata TOCFL 2023 (7.517 kata, 7 level) | 國家華語測驗推動工作委員會 (SC-TOP), berkas resmi [`8000zhuyin_202307.zip`](https://tocfl.edu.tw/assets/files/vocabulary/8000zhuyin_202307.zip); diambil dari versi CSV di [ivankra/tocfl](https://github.com/ivankra/tocfl) (`tocfl-202307.csv`) | tidak dicantumkan |
| `data/tocfl.txt` (kolom arti) | arti bahasa Inggris | [CC-CEDICT](https://cc-cedict.org/wiki/), lewat `tocfl-cedict.csv` di ivankra/tocfl | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `data/decomp.txt` | dekomposisi hanzi, radikal, etimologi | [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) `dictionary.txt` (diturunkan dari Unihan dan CJKlib) | [LGPL](https://github.com/skishore/makemeahanzi/blob/master/COPYING) |
| data goresan (diunduh saat build) | urutan goresan karakter | [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) 2.0.1, diturunkan dari font Arphic | [Arphic Public License](https://github.com/chanind/hanzi-writer-data/blob/master/ARPHICPL.TXT) |
| pustaka animasi (dimuat dari CDN) | animasi dan kuis goresan | [Hanzi Writer](https://hanziwriter.org) 3.7.2 | [MIT](https://github.com/chanind/hanzi-writer/blob/master/LICENSE) |
| `data/id-gloss*.txt`, `data/examples.txt`, `data/extra-*.js`, konten di `app.html` | arti bahasa Indonesia, contoh kalimat, dialog, soal, bacaan, cerita | ditulis khusus untuk proyek ini; soal mengikuti format TOCFL tetapi tidak disalin dari soal ujian resmi | lisensi proyek ini |

Catatan:

- **CC-CEDICT (CC BY-SA 4.0)** mewajibkan atribusi, dan turunan data arti bahasa Inggris harus dibagikan dengan lisensi yang sama.
- **Make Me a Hanzi** memakai dua lisensi: `dictionary.txt` (yang dipakai di sini) berlisensi LGPL, sedangkan
  `graphics.txt` berlisensi Arphic Public License.
- **Daftar kosakata TOCFL** diterbitkan SC-TOP tanpa lisensi tercantum (repositori ivankra/tocfl juga tidak
  mencantumkan lisensi). Yang dipakai di sini hanya daftar katanya (kata, pinyin, level) beserta atribusi; hak ciptanya
  tetap pada penerbit.
- **Contoh kalimat** tidak lagi diambil dari TBCL (國家教育研究院). Semua contoh di `data/examples.txt` ditulis sendiri,
  satu per kata Novice–A2, dan hanya memakai karakter yang sudah diajarkan sampai level kata itu.
- Ringkasan riset materi (standar TOCFL, perbedaan Mandarin Taiwan, aturan nada) beserta tautannya ada di
  [`docs/RISET.md`](docs/RISET.md).
