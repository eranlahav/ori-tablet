/* School texts (2026-11-20): the parent pastes a vocalized (nikud) text from the teacher and it becomes a story
   for the same reading engine. This file only turns text into pages/words/units and lists what looks wrong.
   No DOM here, so it also runs under node for tests (tools/test-school.js).

   A unit = one sounded letter + its vowel, plus the letters that close the syllable (shva nach, matres, final letters),
   the same way the saga units are written by hand: בָּ|נָה, דַּיְ|מוֹנְד, הַ|בְּ|לֵיז, יָצְ|אוּ. */
(function(root){
"use strict";
const LET = /[א-ת]/;
const isLet = ch => LET.test(ch);
const FULL = /[ֱ-ׇֻ]/;   // hataf + full vowels + holam haser for vav + qamats qatan
const SHVA = "ְ", DAGESH = "ּ", HOLAM = "ֹ", SIN_DOT = "ׂ";
const HEB_MARK = /[֑-ׇ]/;

/* Clean what pasting brings in: Word/Docs/Dicta direction marks, cantillation, meteg, look-alike apostrophes and quotes,
   presentation-form letters (NFC turns them back into letter + marks), and puts every letter's marks in one order. */
function normalize(text){
  return String(text||"")
    .replace(/\r\n?/g,"\n")
    .replace(/[​-‏‪-‮⁦-⁩﻿­]/g,"")   // zero-width, direction marks, soft hyphen
    .replace(/[  -   　\t]/g," ")
    .normalize("NFC")
    .replace(/׃/g,":")                                   // sof pasuq
    .replace(/[֑-ֽ֯׀ׄ-׆]/g,"")   // cantillation, meteg, paseq, upper/lower dots
    .replace(/([א-ת][ְ-ׇ]*)['’ʼ׳`´]/g, "$1׳")   // geresh after a letter (צ׳ ג׳ ז׳)
    .replace(/[–—]/g,"-")
    .replace(/[ ]+/g," ");
}

/* letter clusters of one word: {ch, marks, geresh} */
function clusters(word){
  const out=[];
  for(const ch of word){
    if(isLet(ch)) out.push({ch, marks:""});
    else if(out.length && (HEB_MARK.test(ch) || ch==="׳")) out[out.length-1].marks += ch;
  }
  return out;
}
const hasShva = c => c.marks.includes(SHVA) && !FULL.test(c.marks);
const bareC = c => !FULL.test(c.marks) && !c.marks.includes(SHVA);          // may still have dagesh / shin dot
const shurukVav = c => c.ch==="ו" && c.marks.includes(DAGESH) && bareC(c);
const holamVav = c => c.ch==="ו" && c.marks.includes(HOLAM) && !/[ְ-ָׇֺֻ]/.test(c.marks);

/* split one word (letters + marks only) into reading units */
function syllabify(word){
  const C = clusters(word); if(!C.length) return [];
  const n = C.length, role = new Array(n).fill("attach");
  // which letters carry a vowel that sits on the next letter (וּ shuruk, וֹ holam male)
  const carrierVav = i => i>0 && (shurukVav(C[i]) || holamVav(C[i])) && bareC(C[i-1]);
  const voiced = i => FULL.test(C[i].marks) && !carrierVav(i) || (i+1<n && carrierVav(i+1) && bareC(C[i]));
  for(let i=0;i<n;i++){
    const c = C[i];
    if(i===0){ role[i]="start"; continue; }
    if(carrierVav(i)){ role[i]="attach"; continue; }
    if(voiced(i)){ role[i]="start"; continue; }
    if(shurukVav(c)){ role[i]="start"; continue; }                     // וּ after a vowel: its own "u"
    if(hasShva(c)){
      const prev = C[i-1], last = i===n-1;
      if(last){ role[i]="attach"; continue; }                            // shva at the end is silent
      const na =
        hasShva(prev) ||                                                 // second of two shvas
        (c.marks.includes(DAGESH) && (!"בגדכפת".includes(c.ch) || i===1) && !bareC(prev)) || // doubled letter (הַסְּ, הַבְּ, מֵהַמְּ)
        (i+1<n && C[i+1].ch===c.ch) ||                                    // same letter follows (הַלְלוּ)
        (i===1 && shurukVav(prev));                                      // וּ prefix: וּלְ, וּבְ
      role[i] = na ? "start" : "attach"; continue;
    }
    role[i]="attach";                                                    // matres (י ו א ה) and final consonants
  }
  const units=[]; let cur="";
  C.forEach((c,i)=>{ const t=c.ch+c.marks; if(role[i]==="start" && cur){ units.push(cur); cur=t; } else cur+=t; });
  if(cur) units.push(cur);
  return units;
}

const vowelOf = u => clusters(u).some(c=>FULL.test(c.marks)) || /וּ|וֹ/.test(u);

/* problems in one word, for the parent (we flag, we do not guess) */
function wordIssues(core, units){
  const C = clusters(core), out=[];
  if(!C.length){ if(/\S/.test(core)) out.push("not-hebrew"); return out; }
  const anyMark = C.some(c=>/[ְ-ׇֻ]/.test(c.marks) || (c.ch==="ו" && c.marks.includes(DAGESH)));
  if(!anyMark){ out.push("no-nikud"); return out; }
  if(units.some(u=>!vowelOf(u) && !clusters(u).some(hasShva))) out.push("part-nikud");
  else {
    // a letter in the middle with nothing on it that is not a vowel letter (י ו א ה) usually means a missing mark
    C.forEach((c,i)=>{ const nx=C[i+1]; if(i>0 && nx && !c.marks && !"יואה".includes(c.ch) && !shurukVav(nx) && !holamVav(nx) && !out.includes("part-nikud")) out.push("part-nikud"); });
  }
  if(C.some(c=>c.ch==="ש" && !c.marks.includes(SIN_DOT) && !c.marks.includes("ׁ"))) out.push("shin-no-dot");
  return out;
}

/* split a word token into leading punctuation, the Hebrew core, trailing punctuation */
function splitToken(tok){
  const m = tok.match(/^([^א-ת]*)([א-ת][\s\S]*?)([^א-ת֑-ׇ׳״"]*)$/);
  if(!m) return {lead:tok, core:"", tail:"", raw:tok};
  return {lead:m[1], core:m[2], tail:m[3], raw:tok};
}

const MAX_WORDS = 7;   // saga pages have 2-5 words; a long sentence is split so it fits the page and the end-of-page sentence
/* text → pages. A page ends at . ! ? : or a line break (a teacher text usually has one sentence per line).
   A blank line is always a page break. Long sentences are split at a comma, otherwise into even parts. */
function parse(text){
  const clean = normalize(text);
  const issues = [];   // {page, word, display, kinds}
  const sentences = [];
  clean.split(/\n/).forEach(line=>{
    // maqaf joins two words: read them as two words, the first keeps the maqaf so the sentence looks the same
    const toks = line.replace(/־/g,"־ ").split(" ").filter(t=>t.trim());
    let cur=[];
    toks.forEach(t=>{ cur.push(t); if(/[.!?:]["'”״)]*$/.test(t) && !/^[.!?:]+$/.test(t)) { sentences.push(cur); cur=[]; } });
    if(cur.length) sentences.push(cur);
  });
  const chunks = [];
  sentences.forEach(s=>{
    // tokens that are only punctuation stick to the word before them
    const toks=[]; s.forEach(t=>{ if(!/[א-ת0-9A-Za-z]/.test(t) && toks.length) toks[toks.length-1]+= (/^[-־]$/.test(t)?" ":"")+t; else toks.push(t); });
    if(toks.length<=MAX_WORDS){ chunks.push(toks); return; }
    // split at commas first, then evenly
    let parts=[[]]; toks.forEach(t=>{ parts[parts.length-1].push(t); if(/,["']?$/.test(t)) parts.push([]); }); parts=parts.filter(p=>p.length);
    const out=[]; parts.forEach(p=>{ if(p.length<=MAX_WORDS) out.push(p); else { const k=Math.ceil(p.length/MAX_WORDS), sz=Math.ceil(p.length/k); for(let i=0;i<p.length;i+=sz) out.push(p.slice(i,i+sz)); } });
    // glue tiny leftovers (one word) to a neighbour when it still fits
    for(let i=out.length-1;i>0;i--) if((out[i].length<2 || out[i-1].length<2) && out[i].length+out[i-1].length<=MAX_WORDS){ out[i-1]=out[i-1].concat(out[i]); out.splice(i,1); }
    out.forEach(p=>chunks.push(p));
  });
  const pages = [];
  chunks.forEach(toks=>{
    const words=[];
    toks.forEach(t=>{
      const parts = splitToken(t);
      const core = parts.core.replace(/[־"״]+$/,"");
      const display = (parts.lead + parts.core + parts.tail).trim();
      if(!core){ if(!words.length) return; const w=words[words.length-1]; w[0] += " "+display;   // a number or symbol alone rides on the word before
        if(/[0-9A-Za-z]/.test(display)) issues.push({page:pages.length, word:words.length-1, display:w[0], kinds:["not-hebrew"]}); return; }
      const units = syllabify(core);
      const kinds = wordIssues(core, units);
      if(/[0-9A-Za-z]/.test(display)) kinds.push("not-hebrew");
      if(kinds.length) issues.push({page:pages.length, word:words.length, display, kinds});
      words.push([display, units.length ? units : [core]]);
    });
    if(words.length) pages.push({reveal:-1, words});
  });
  return {pages, issues, clean};
}

const ISSUE_TEXT = {
  "no-nikud":"מילה בלי ניקוד",
  "part-nikud":"חסר ניקוד באחת האותיות",
  "not-hebrew":"מספר או אותיות לא בעברית",
  "shin-no-dot":"ש בלי נקודה (שׁ או שׂ?)"
};

const api = {normalize, syllabify, parse, clusters, ISSUE_TEXT, MAX_WORDS};
if(typeof module!=="undefined" && module.exports) module.exports = api; else root.SCHOOL_PARSE = api;
})(typeof window!=="undefined" ? window : globalThis);
