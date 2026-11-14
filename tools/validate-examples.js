// Validasi contoh kalimat data/examples.txt (atau berkas lain berformat sama)
// Pemakaian: node tools/validate-examples.js data/examples.txt [berkas lain ...]
// Format per baris: kata|kalimat hanzi|pinyin
// Memeriksa: kata ada di TOCFL, kalimat memuat kata itu, jumlah suku kata pinyin = jumlah karakter Han,
// hanya memakai karakter yang sudah diajarkan sampai level kata itu, panjang kalimat, dan kalimat ganda.
const fs = require("fs"), path = require("path");

const MARKS = {a:"āáǎà",e:"ēéěè",i:"īíǐì",o:"ōóǒò",u:"ūúǔù","ü":"ǖǘǚǜ"};
const UNMARK = {};
for (const [v, s] of Object.entries(MARKS)) [...s].forEach(c => { UNMARK[c] = v; UNMARK[c.toUpperCase()] = v.toUpperCase(); });
const FINALS = "iang iong uang ueng ang eng ing ong ian iao uai uan üan ai ei ao ou an en er in un ün ia ie iu ua uo ui üe ue io a o e i u ü ê".split(" ");
const INITS = ["zh","ch","sh","b","p","m","f","d","t","n","l","g","k","h","j","q","x","r","z","c","s","y","w",""];
const isHan = c => /\p{Script=Han}/u.test(c);
const hanCount = h => [...h].filter(isHan).length;
function splitPinyin(p, n){
  const chars = [], bounds = new Set();
  for (const ch of p.normalize("NFC")){
    const low = UNMARK[ch] ? UNMARK[ch].toLowerCase() : ch.toLowerCase();
    if (/[a-zü]/.test(low)) chars.push(low); else bounds.add(chars.length);
  }
  const base = chars.join(""), L = base.length, memo = new Map();
  const ends = i => { const out = new Set();
    for (const ini of INITS){ if (!base.startsWith(ini, i)) continue; const j = i + ini.length; for (const f of FINALS) if (base.startsWith(f, j)) out.add(j + f.length); }
    if (base[i] === "r") out.add(i + 1);
    return [...out].filter(j => { for (let k = i + 1; k < j; k++) if (bounds.has(k)) return false; return true; }).sort((a, b) => b - a); };
  const go = (i, k) => { if (i === L) return k === 0; if (k === 0) return false; const mk = i * 64 + k; if (memo.has(mk)) return memo.get(mk);
    let r = false; for (const j of ends(i)) if (go(j, k - 1)) { r = true; break; } memo.set(mk, r); return r; };
  return n > 0 && go(0, n);
}

/* kata TOCFL → level; karakter → level pertama diajarkan */
const root = path.join(__dirname, "..");
const LVL_OF = id => id.startsWith("L0-1") ? 0 : id.startsWith("L0-2") ? 1 : +id[1] + 1;
const wordLv = new Map(), wordForms = new Map(), lvFirst = new Map();
for (const line of fs.readFileSync(path.join(root, "data", "tocfl.txt"), "utf8").trim().split(/\r?\n/)){
  const [id, h] = line.split("|"), lv = LVL_OF(id), forms = h.split("/").map(x => x.replace(/[()]/g, ""));
  for (const f of forms) if (!wordLv.has(f)){ wordLv.set(f, lv); wordForms.set(f, forms); }
  for (const c of h.replace(/[()\/]/g, "")) if (isHan(c) && (!lvFirst.has(c) || lvFirst.get(c) > lv)) lvFirst.set(c, lv);
}
const MAXLEN = [12, 14, 18, 20, 30, 30, 40];

const files = process.argv.slice(2);
if (!files.length){ console.log("Pemakaian: node tools/validate-examples.js data/examples.txt"); process.exit(1); }
let total = 0;
const seen = new Map();
for (const file of files){
  const errs = [], perLv = [0, 0, 0, 0, 0, 0, 0];
  fs.readFileSync(file, "utf8").split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const w = `${path.basename(file)}:${i + 1}`, parts = line.split("|");
    if (parts.length !== 3) return errs.push(`${w}: harus 3 kolom kata|kalimat|pinyin → ${line}`);
    const [k, s, p] = parts;
    if (!wordLv.has(k)) return errs.push(`${w}: "${k}" bukan kata TOCFL`);
    const lv = wordLv.get(k); perLv[lv]++;
    if (!wordForms.get(k).some(f => s.includes(f))) errs.push(`${w}: kalimat tidak memuat kata ${k} → ${s}`);
    if (!splitPinyin(p, hanCount(s))) errs.push(`${w}: suku kata tidak cocok (${hanCount(s)} karakter) → ${s} | ${p}`);
    const bad = [...new Set([...s].filter(c => isHan(c) && !(lvFirst.has(c) && lvFirst.get(c) <= lv)))];
    if (bad.length) errs.push(`${w}: karakter belum dipelajari di level ${lv} → ${bad.join(" ")} (${s})`);
    if (hanCount(s) < 3 || hanCount(s) > MAXLEN[lv]) errs.push(`${w}: panjang ${hanCount(s)} karakter, harus 3–${MAXLEN[lv]} → ${s}`);
    if (seen.has(s)) errs.push(`${w}: kalimat ganda (juga di ${seen.get(s)}) → ${s}`); else seen.set(s, w);
  });
  total += errs.length;
  console.log(`${errs.length ? "✗" : "✓"} ${file}: ${perLv.reduce((a, b) => a + b)} kalimat (per level ${perLv.join("/")})`);
  errs.slice(0, 80).forEach(e => console.log("   - " + e));
  if (errs.length > 80) console.log(`   … dan ${errs.length - 80} galat lain`);
}
process.exit(total ? 1 : 0);
