// Validasi berkas konten data/extra-*.js
// Pemakaian: node tools/validate-extra.js data/extra-xxx.js [berkas lain ...]
// Memeriksa: jumlah suku kata pinyin = jumlah karakter Han, bentuk data, level, dan kalimat ganda.
const fs = require("fs"), path = require("path"), vm = require("vm");

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

/* Daftar karakter per level (kumulatif) dari kosakata TOCFL: soal level L hanya boleh memakai karakter
   dari kata-kata level 0..L, karena hanya karakter itu yang sudah diajarkan di jalur belajar. */
const LVL_OF = id => id.startsWith("L0-1") ? 0 : id.startsWith("L0-2") ? 1 : +id[1] + 1;
const lvFirst = new Map();
for (const line of fs.readFileSync(path.join(__dirname, "..", "data", "tocfl.txt"), "utf8").trim().split("\n")){
  const [id, h] = line.split("|"), lv = LVL_OF(id);
  for (const c of h.replace(/[()\/]/g, "")) if (isHan(c) && (!lvFirst.has(c) || lvFirst.get(c) > lv)) lvFirst.set(c, lv);
}
if (process.argv[2] === "--chars"){
  // tulis daftar karakter yang boleh dipakai sampai tiap level ke data/chars-lvN.txt
  for (let L = 0; L <= 6; L++){
    const set = [...lvFirst].filter(([, lv]) => lv <= L).map(([c]) => c).join("");
    fs.writeFileSync(path.join(__dirname, "..", "data", `chars-lv${L}.txt`), set + "\n");
    console.log(`data/chars-lv${L}.txt: ${[...set].length} karakter`);
  }
  process.exit(0);
}
const badChars = (text, lv) => [...new Set([...String(text)].filter(c => isHan(c) && !(lvFirst.has(c) && lvFirst.get(c) <= lv)))];

const files = process.argv.slice(2);
if (!files.length){ console.log("Pemakaian: node tools/validate-extra.js data/extra-xxx.js"); process.exit(1); }
const root = path.join(__dirname, "..");
const existing = new Set();
const collect = txt => { for (const m of txt.matchAll(/"([^"]*\p{Script=Han}[^"]*)"/gu)) if (hanCount(m[1]) >= 5) existing.add(m[1]); };
collect(fs.readFileSync(path.join(root, "app.html"), "utf8"));
for (const f of fs.readdirSync(path.join(root, "data")).filter(f => /^extra-.*\.js$/.test(f)))
  if (!files.some(x => path.resolve(x) === path.join(root, "data", f))) collect(fs.readFileSync(path.join(root, "data", f), "utf8"));

let total = 0;
for (const file of files){
  const errs = [], seen = new Set(), got = [];
  try { vm.runInNewContext(fs.readFileSync(file, "utf8"), {addExtra: x => got.push(x)}); }
  catch (e){ console.log(`✗ ${file}: JavaScript tidak valid: ${e.message}`); total++; continue; }
  const pair = (h, p, where) => {
    if (typeof h !== "string" || typeof p !== "string") return errs.push(`${where}: hanzi/pinyin bukan string`);
    if (!splitPinyin(p, hanCount(h))) errs.push(`${where}: suku kata tidak cocok (${hanCount(h)} karakter) → ${h} | ${p}`);
  };
  const dup = (h, where) => { if (hanCount(h) < 5) return; if (existing.has(h)) errs.push(`${where}: kalimat sudah ada di konten lain → ${h}`); if (seen.has(h)) errs.push(`${where}: kalimat ganda di berkas ini → ${h}`); seen.add(h); };
  const lvOk = (lv, where) => { if (!Number.isInteger(lv) || lv < 0 || lv > 6) errs.push(`${where}: lv harus 0–6`); };
  /* karakter yang belum diajarkan sampai level item ini */
  const chars = (lv, where, ...texts) => { const bad = badChars(texts.flat(Infinity).join(""), lv);
    if (bad.length) errs.push(`${where}: karakter belum dipelajari di level ${lv} → ${bad.join(" ")}`); };
  const counts = {};
  for (const x of got){
    for (const [k, v] of Object.entries(x)) counts[k] = (counts[k] || 0) + (Array.isArray(v) ? v.length : 0);
    (x.grammar || []).forEach((g, i) => chars(g.lv, `grammar[${i}]`, (g.c || []).map(c => c[0])));
    (x.dialogs || []).forEach((d, i) => chars(d.lv, `dialogs[${i}]`, (d.b || []).map(b => b[1])));
    (x.qa || []).forEach((q, i) => chars(q[0], `qa[${i}]`, q[1], q[4], q[7], q[9]));
    (x.dc || []).forEach((d, i) => chars(d.lv, `dc[${i}]`, (d.d || []).map(b => b[1]), d.q?.[0], (d.o || []).map(o => o[0])));
    (x.gap || []).forEach((g, i) => chars(g[0], `gap[${i}]`, g[1], g[4], g[5], g[6]));
    (x.order || []).forEach((o, i) => chars(o[0], `order[${i}]`, o[1]));
    (x.read || []).forEach((r, i) => chars(r.lv, `read[${i}]`, r.h, (r.qs || []).map(q => [q[0], q[3]?.[0], q[4]?.[0], q[5]?.[0]])));
    (x.stories || []).forEach((s, i) => chars(s.lv, `stories[${i}]`, s.h));
    (x.grammar || []).forEach((g, i) => { const w = `grammar[${i}]`; lvOk(g.lv, w); if (!g.j || !g.pola || !g.d || !Array.isArray(g.c)) errs.push(`${w}: butuh j, pola, d, c`); (g.c || []).forEach((c, k) => { pair(c[0], c[1], `${w}.c[${k}]`); dup(c[0], `${w}.c[${k}]`); if (!c[2]) errs.push(`${w}.c[${k}]: arti kosong`); }); });
    (x.dialogs || []).forEach((d, i) => { const w = `dialogs[${i}]`; lvOk(d.lv, w); if (!d.j || !d.s || !Array.isArray(d.b)) errs.push(`${w}: butuh j, s, b`); (d.b || []).forEach((b, k) => { pair(b[1], b[2], `${w}.b[${k}]`); dup(b[1], `${w}.b[${k}]`); if (!b[0] || !b[3]) errs.push(`${w}.b[${k}]: pembicara/arti kosong`); }); });
    (x.qa || []).forEach((q, i) => { const w = `qa[${i}]`; lvOk(q[0], w); if (q.length !== 11) errs.push(`${w}: harus 11 elemen`); pair(q[1], q[2], w + " tanya"); pair(q[4], q[5], w + " jawab"); pair(q[7], q[8], w + " pengecoh1"); pair(q[9], q[10], w + " pengecoh2"); dup(q[1], w); });
    (x.dc || []).forEach((d, i) => { const w = `dc[${i}]`; lvOk(d.lv, w); (d.d || []).forEach((b, k) => pair(b[1], b[2], `${w}.d[${k}]`)); pair(d.q?.[0], d.q?.[1], w + ".q"); if ((d.o || []).length !== 3) errs.push(`${w}: o harus 3 pilihan`); (d.o || []).forEach((o, k) => pair(o[0], o[1], `${w}.o[${k}]`)); if (!d.t) errs.push(`${w}: t kosong`); });
    (x.gap || []).forEach((g, i) => { const w = `gap[${i}]`; lvOk(g[0], w); if (g.length !== 7) errs.push(`${w}: harus 7 elemen`); if (!String(g[1]).includes("＿")) errs.push(`${w}: tidak ada ＿`); pair(String(g[1]).replace("＿", g[4]), g[2], w); dup(String(g[1]), w); });
    (x.order || []).forEach((o, i) => { const w = `order[${i}]`; lvOk(o[0], w); const toks = String(o[1]).split("|"); if (toks.length < 3) errs.push(`${w}: minimal 3 token`); pair(toks.join(""), o[2], w); dup(toks.join(""), w);
      (o[4] || []).forEach((a, k) => { if ([...a.split("|").join("")].sort().join("") !== [...toks.join("")].sort().join("")) errs.push(`${w}.alt[${k}]: karakter berbeda dari kalimat asli`); }); });
    (x.read || []).forEach((r, i) => { const w = `read[${i}]`; lvOk(r.lv, w); pair(r.h, r.p, w); dup(r.h, w); (r.qs || []).forEach((q, k) => { pair(q[0], q[1], `${w}.qs[${k}]`); [q[3], q[4], q[5]].forEach((o, m) => pair(o?.[0], o?.[1], `${w}.qs[${k}].o${m}`)); }); });
    (x.stories || []).forEach((s, i) => { const w = `stories[${i}]`; lvOk(s.lv, w); pair(s.h, s.p, w); dup(s.h, w); if (!s.t || !s.id) errs.push(`${w}: t/id kosong`); });
  }
  total += errs.length;
  console.log(`${errs.length ? "✗" : "✓"} ${file}: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  errs.slice(0, 60).forEach(e => console.log("   - " + e));
  if (errs.length > 60) console.log(`   … dan ${errs.length - 60} galat lain`);
}
process.exit(total ? 1 : 0);
