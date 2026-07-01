// Claude Code Prompts — application state, rendering, and interaction logic
let seq=0;
const PROMPTS=Object.entries(TOPICS).flatMap(([c,rows])=>rows.map(row=>{
  const [t,u,l,tags,f]=row.split("|");
  return {n:++seq,c,t,u,l,g:tags.split(","),x:TPL[c](f||t)};
}));
let view="all",level="all",query="",tag="",selected=null;
let favs=new Set(JSON.parse(localStorage.getItem("ccp_favs")||"[]"));
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));

function buildNav(){
 const counts={}; PROMPTS.forEach(p=>counts[p.c]=(counts[p.c]||0)+1);
 let html=`<button data-view="all"><span class="ic">▦</span><span class="name">All prompts</span><span class="ct">${PROMPTS.length}</span></button>
 <button data-view="favs"><span class="ic">★</span><span class="name">Favorites</span><span class="ct" id="favCt">${favs.size}</span></button>
 <div class="sec">Categories</div>`;
 CATS.forEach(c=>html+=`<button data-view="${c.id}"><span class="ic">${c.ic}</span><span class="name">${c.n}</span><span class="ct">${counts[c.id]}</span></button>`);
 $("nav").innerHTML=html;
 $("nav").querySelectorAll("button").forEach(b=>b.onclick=()=>{view=b.dataset.view;tag="";render();toggleMenu(false);scrollTo({top:0});});
}
function filtered(){
 const terms=query.toLowerCase().split(/\s+/).filter(Boolean);
 return PROMPTS.filter(p=>{
  if(view==="favs"&&!favs.has(p.n))return false;
  if(view!=="all"&&view!=="favs"&&p.c!==view)return false;
  if(level!=="all"&&p.l!==level)return false;
  if(tag&&!p.g.includes(tag))return false;
  if(terms.length){
   const hay=(p.t+" "+p.u+" "+p.x+" "+p.g.join(" ")).toLowerCase();
   if(!terms.every(t=>hay.includes(t)))return false;
  }
  return true;
 });
}
function hi(text){
 const terms=query.toLowerCase().split(/\s+/).filter(Boolean);
 let h=esc(text).replace(/\[([^\]\n]{1,70})\]/g,'<span class="tok">[$1]</span>');
 if(!terms.length)return h;
 const re=new RegExp("("+terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")","gi");
 return h.split(/(<[^>]+>)/).map(part=>part.startsWith("<")?part:part.replace(re,"<mark>$1</mark>")).join("");
}
function render(){
 const rows=filtered(),cat=CATS.find(c=>c.id===view);
 $("allBtn").className="pill"+(level==="all"?" on":"");
 $("bBtn").className="pill"+(level==="b"?" on":"");
 $("pBtn").className="pill"+(level==="p"?" on":"");
 document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.view===view));
 if(view==="all"){$("title").innerHTML="▦ All prompts";$("desc").textContent="464 copy-ready prompts for serious Claude Code work — expanded, searchable, and tuned for real engineering workflows.";}
 else if(view==="favs"){$("title").innerHTML="★ Favorites";$("desc").textContent=favs.size?"Your saved prompt toolkit in this browser.":"Star prompts to save your reusable personal toolkit.";}
 else {$("title").innerHTML=`${cat.ic} ${cat.full}`;$("desc").textContent=cat.d;}
 $("statPrompts").textContent=PROMPTS.length;$("statFavs").textContent=favs.size;$("statShowing").textContent=rows.length;$("count").textContent=rows.length+" / "+PROMPTS.length;
 if(!rows.length){$("grid").innerHTML='<div class="empty">⌕<br>No prompts match. Try fewer filters or clear search.</div>';return;}
 $("grid").innerHTML=rows.map(p=>`<article class="card" id="p${p.n}">
  <div class="hd"><span class="num">#${String(p.n).padStart(3,"0")}</span><h3>${hi(p.t)}</h3><button class="fav ${favs.has(p.n)?"on":""}" onclick="toggleFav(${p.n},this)" title="Favorite">${favs.has(p.n)?"★":"☆"}</button></div>
  <div class="use"><b>When:</b> ${hi(p.u)}</div>
  <div class="prompt">${hi(p.x)}</div>
  <div class="ft"><span class="lv ${p.l}">${p.l==="b"?"Beginner":"Pro"}</span>${p.g.map(g=>`<button class="tag" onclick="setTag('${g}')">#${g}</button>`).join("")}
   <button class="copy alt" onclick="selectPrompt(${p.n})">Builder</button><button class="copy" onclick="copyText(PROMPTS.find(x=>x.n===${p.n}).x,this)">Copy</button></div>
 </article>`).join("");
}
function setLevel(v){level=v;render()}
function setTag(t){tag=tag===t?"":t;render()}
function toggleFav(n,btn){favs.has(n)?favs.delete(n):favs.add(n);localStorage.setItem("ccp_favs",JSON.stringify([...favs]));$("statFavs").textContent=favs.size;$("favCt").textContent=favs.size;if(view==="favs")render();else{btn.classList.toggle("on");btn.textContent=favs.has(n)?"★":"☆";}}
function copyText(text,btn){const done=()=>{if(btn){btn.textContent="Copied ✓";btn.classList.add("ok");setTimeout(()=>{btn.textContent=btn.classList.contains("alt")?"Builder":"Copy";btn.classList.remove("ok")},1200)}};navigator.clipboard?.writeText(text).then(done).catch(()=>{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();done();});}
function selectPrompt(n){selected=PROMPTS.find(p=>p.n===n);$("builder").open=true;updateBuilder();$("builder").scrollIntoView({behavior:"smooth",block:"center"});}
function updateBuilder(){
 const base=selected?selected.x:"Pick a prompt card, then add your context here.";
 const ctx=$("ctx").value.trim(),limits=$("limits").value.trim(),dod=$("dod").value.trim();
 $("built").textContent=selected?`${base}

Context:
${ctx||"[add relevant files, links, logs, screenshots, or ticket details]"}

Constraints:
${limits||"[scope limits, dependencies, APIs, data safety, style requirements]"}

Definition of done:
${dod||"[tests/checks to run, docs to update, output expected]"}

Before acting, restate the plan, flag ambiguities, and stop for confirmation if the change is breaking, destructive, or broadens access.`:base;
}
function copyBuilt(btn){copyText($("built").textContent,btn)}
function copyVisible(){const md=filtered().map(p=>`### #${p.n} ${p.t}\nWhen: ${p.u}\nTags: ${p.g.map(x=>"#"+x).join(" ")}\n\n${p.x}`).join("\n\n---\n\n");copyText(md)}
function exportFavorites(){const rows=[...favs].map(n=>PROMPTS.find(p=>p.n===n)).filter(Boolean);const data=JSON.stringify(rows,null,2);const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type:"application/json"}));a.download="claude-code-favorite-prompts.json";a.click();URL.revokeObjectURL(a.href)}
function clearFilters(){query="";tag="";level="all";view="all";$("q").value="";render()}
function randomPrompt(){const rows=filtered();if(!rows.length)return;const p=rows[Math.floor(Math.random()*rows.length)];document.getElementById("p"+p.n)?.scrollIntoView({behavior:"smooth",block:"center"});selectPrompt(p.n)}
function toggleTheme(){const next=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=next;localStorage.setItem("ccp_theme",next);$("themeBtn").textContent=next==="light"?"☀":"☾"}
function toggleMenu(force){const open=force===undefined?!$("side").classList.contains("open"):force;$("side").classList.toggle("open",open);$("scrim").classList.toggle("on",open)}
$("q").addEventListener("input",e=>{query=e.target.value;render()});
document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement!==$("q")){e.preventDefault();$("q").focus()}if(e.key==="Escape"){query="";tag="";$("q").value="";render();$("q").blur()}});
const saved=localStorage.getItem("ccp_theme");if(saved){document.documentElement.dataset.theme=saved;$("themeBtn").textContent=saved==="light"?"☀":"☾"}
buildNav();render();
