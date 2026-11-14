#!/usr/bin/env bash
# Membangun aplikasi dari app.html + data/:
#   artifact.html        halaman untuk dipublikasikan (data goresan dimuat dari build/strokes/*.json)
#   build/strokes/N.json data goresan dikelompokkan per (kode karakter % 64)
#   index.html           versi mandiri untuk dibuka langsung di browser (semua data goresan tersemat)
set -e
cd "$(dirname "$0")"
export LC_ALL=C.UTF-8
DATA="https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1"
mkdir -p .strokes build/strokes

# 1. unduh data goresan untuk semua hanzi yang dipakai (disimpan di .strokes/ sebagai cache)
cat app.html data/tocfl.txt data/extra-*.js 2>/dev/null | grep -oP '\p{Han}' | sort -u | while read -r c; do
  [ -e ".strokes/$c.json" ] || [ -e ".strokes/$c.none" ] || echo "$c"
done | xargs -r -P 16 -I{} sh -c 'curl -sf "'"$DATA"'/{}.json" -o ".strokes/{}.json" || { rm -f ".strokes/{}.json"; touch ".strokes/{}.none"; }'

# 2. sisipkan data kosakata ke placeholder
insert() { # insert <placeholder> <file>
  awk -v m="$1" -v f="$2" '{
    i = index($0, m)
    if (i) { printf "%s\n", substr($0, 1, i-1); while ((getline l < f) > 0) print l; print substr($0, i+length(m)) }
    else print
  }'
}
cat data/id-gloss*.txt > build/gloss.txt
# tiap berkas konten mendapat tag <script> sendiri, jadi satu berkas yang rusak tidak mematikan yang lain
: > build/extra.js
first=1
for f in data/extra-*.js; do
  [ -e "$f" ] || continue
  [ $first = 1 ] || printf '\n</script>\n<script>\n' >> build/extra.js
  first=0
  cat "$f" >> build/extra.js
done
insert '/*TOCFL*/' data/tocfl.txt < app.html | insert '/*IDGLOSS*/' build/gloss.txt | insert '/*DECOMP*/' data/decomp.txt \
  | insert '/*EXAMPLES*/' data/examples.txt | insert '/*EXTRA*/' build/extra.js > build/page.html

# 3. kelompokkan data goresan (dilewati bila tidak ada data goresan baru sejak build terakhir)
if [ -e build/strokes/0.json ] && [ -z "$(find .strokes -name '*.json' -newer build/strokes/0.json | head -1)" ]; then
  echo "Data goresan tidak berubah, pengelompokan dilewati."
else
rm -f build/strokes/*.json build/strokes/*.part
for f in .strokes/*.json; do
  c=$(basename "$f" .json)
  b=$(( $(printf '%d' "'$c") % 64 ))
  { printf '"%s":' "$c"; tr -d '\n' < "$f"; printf '\n'; } >> "build/strokes/$b.part"
done
for p in build/strokes/*.part; do
  { printf '{'; paste -sd, "$p" | tr -d '\n'; printf '}'; } > "${p%.part}.json"
  rm "$p"
done
{ printf '{'; for f in build/strokes/*.json; do sed 's/^{//; s/}$//' "$f"; echo; done | paste -sd, | tr -d '\n'; printf '}'; } > build/all-strokes.js
fi

# 4. artifact.html (goresan via berkas terpisah) dan index.html (semua tersemat)
sed 's#/\*STROKES\*/{}#{}#' build/page.html > artifact.html
{
  printf '<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'
  insert '/*STROKES*/{}' build/all-strokes.js < build/page.html
  printf '\n</body>\n</html>\n'
} > index.html

# 5. dist/ untuk hosting (Netlify): halaman ringan, data goresan dimuat per kelompok saat dibutuhkan
rm -rf dist && mkdir -p dist/strokes
{
  printf '<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#0A0C10">\n</head>\n<body>\n'
  cat artifact.html
  printf '\n</body>\n</html>\n'
} > dist/index.html
cp build/strokes/*.json dist/strokes/
printf '/strokes/*\n  Cache-Control: public, max-age=604800\n' > dist/_headers

echo "Karakter dengan data goresan: $(ls .strokes/*.json | wc -l); tanpa data: $(ls .strokes/*.none 2>/dev/null | wc -l)"
ls -la artifact.html index.html
du -sh build/strokes
