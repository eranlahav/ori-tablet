// node tools/test-school.js : checks the school-text syllabifier against every hand-split word of the saga (beta/index.html)
const fs=require("fs"), path=require("path");
const SP=require(path.join(__dirname,"../beta/school.js"));
const html=fs.readFileSync(path.join(__dirname,"../beta/index.html"),"utf8");
const a=html.indexOf("const PAGES_ISLAND"), b=html.indexOf("function applyNameMode");
const STORIES=new Function(html.slice(a,b)+";return STORIES;")();
const seen=new Map(); let ok=0, bad=0;
STORIES.forEach(st=>st.pages.forEach(p=>[p,p.me,p.named].filter(Boolean).forEach(v=>v.words.forEach(([w,u])=>{
  const core=w.replace(/[.!,?:]/g,""); if(seen.has(core)) return; seen.set(core,1);
  const got=SP.syllabify(SP.normalize(core));
  if(got.join("|")===u.map(x=>x.normalize("NFC")).join("|")) ok++; else { bad++; console.log(`${st.id}: ${core}  hand=${u.join("|")}  auto=${got.join("|")}`); }
}))));
console.log(`${ok} match, ${bad} differ`);
