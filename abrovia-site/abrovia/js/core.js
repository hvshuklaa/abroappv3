const $=s=>document.querySelector(s);
const P={home:'M3 11l9-8 9 8M5 10v10h14V10',users:'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8',chat:'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12',book:'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5zM4 19.5V4.5',bag:'M6 2l-2 5v14h16V7l-2-5zM4 7h16M16 11a4 4 0 0 1-8 0',spark:'M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8',shield:'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',cal:'M3 5h18v16H3zM3 10h18M8 2v4M16 2v4',send:'M22 2L11 13M22 2l-7 20-4-9-9-4z',check:'M20 6L9 17l-5-5',out:'M9 21H5V3h4M16 17l5-5-5-5M21 12H9',plus:'M12 5v14M5 12h14',map:'M9 3L3 5v16l6-2 6 2 6-2V3l-6 2zM9 3v16M15 5v16',star:'M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z',calc:'M5 2h14v20H5zM8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2',scale:'M12 3v18M5 7h14M5 7l-3 8a4 4 0 0 0 6 0zM19 7l-3 8a4 4 0 0 0 6 0z',pen:'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',coin:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6v12M9 9h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5',globe:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20',x:'M18 6L6 18M6 6l12 12',link:'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',award:'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14M8.2 13.9L7 23l5-3 5 3-1.2-9.1',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8',clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6v6l4 2',lock:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',bulb:'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2',flame:'M12 22c4 0 7-2.7 7-7 0-3-2-5-3-7-1 1-2 2-3 2 0-3-1-6-4-8 0 4-4 6-4 12 0 4.3 3 8 7 8',compass:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M16 8l-2 6-6 2 2-6z',search:'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16M21 21l-4.3-4.3',thumb:'M7 11v10H3V11zM7 11l4-8a3 3 0 0 1 3 3v4h6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21H7',trophy:'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',ext:'M18 13v6H5V6h6M15 3h6v6M10 14L21 3',target:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4',plane:'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z',file:'M14 2H6v20h12V8zM14 2v6h6M9 13h6M9 17h6',cap:'M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24"><path d="${P[n]||P.star}"/></svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const COL=['#0ea5e9','#6366f1','#0d9488','#d97706','#e11d48','#475569'];
const avt=(u,c,s)=>`<div class="av" style="background:${c||COL[[...u].reduce((a,x)=>a+x.charCodeAt(0),0)%COL.length]};${s?`width:${s}px;height:${s}px;font-size:${s/3}px`:''}">${esc(u.slice(0,2).toUpperCase())}</div>`;
const ADJ=['Sky','Quantum','Cosmic','Atlas','Nova','Zenith','Orbit','Lunar','Nomad','Summit'],NOUN=['Scholar','Voyager','Falcon','Pilot','Compass','Meridian','Horizon','Anchor','Cipher','Atlas'];
const COUNTRIES=['USA','UK','Canada','Germany','Australia','Ireland','France','Netherlands','Singapore','UAE'];
const TOPICS=['Visa','SOP / LOR','Scholarships','Accommodation','Part-time work','Banking','Culture','GRE / IELTS','Loans','Internships'];
const toast=m=>{$('#t').innerHTML=`<div class="toast">${esc(m)}</div>`;clearTimeout(window.tt);window.tt=setTimeout(()=>$('#t').innerHTML='',2600)};
function burst(x,y){const cs=['#0ea5e9','#6366f1','#10b981','#f59e0b','#ec4899'];for(let i=0;i<18;i++){const d=document.createElement('i');d.className='cf';d.style.cssText=`left:${x}px;top:${y}px;background:${cs[i%5]}`;document.body.append(d);const a=Math.random()*6.28,r=60+Math.random()*90;d.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r+60}px) rotate(${Math.random()*540}deg)`,opacity:0}],{duration:900,easing:'cubic-bezier(.16,1,.3,1)'}).onfinish=()=>d.remove()}}
function cnt(){document.querySelectorAll('[data-n]').forEach(e=>{const t=+e.dataset.n,s=e.dataset.s||'',t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/1400);e.textContent=Math.round(t*(1-Math.pow(1-k,3))).toLocaleString('en-IN')+s;if(k<1)requestAnimationFrame(f)})(t0)})}
function openM(h,w){closeM();const d=document.createElement('div');d.className='modal';d.id='md';d.onclick=e=>{if(e.target==d)closeM()};d.innerHTML=`<div class="card mc" style="max-width:${w||560}px"><button class="xb" onclick="closeM()">${ic('x')}</button>${h}</div>`;document.body.append(d)}
const closeM=()=>{const m=$('#md');if(m)m.remove()};
const hello=()=>{const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'};
/* validation */
const bad=s=>{s=(s||'').trim();return s.length<2||/^(.)\1+$/.test(s)||/^[\d\W_]+$/.test(s)||(s.length>3&&!/\s/.test(s)&&!/[aeiou]/i.test(s)&&!/^[A-Z]{2,6}$/.test(s))||(s.length<8&&/^(asdf|qwer|zxcv|test|abc|xyz|na|none|idk|nothing)/i.test(s))};
const MIN={USA:25,UK:20,Canada:18,Germany:11,Australia:22,Ireland:17,France:11,Netherlands:15,Singapore:18,UAE:15};
const INT={'Spring 2027':'2027-01-20','Fall 2027':'2027-09-01','Spring 2028':'2028-01-20','Fall 2028':'2028-09-01'};
const UNI={'tu munich':'Germany','rwth':'Germany','heidelberg':'Germany','tu berlin':'Germany','oxford':'UK','cambridge':'UK','edinburgh':'UK','manchester':'UK','imperial':'UK','toronto':'Canada','waterloo':'Canada','ubc':'Canada','mcgill':'Canada','mit':'USA','stanford':'USA','georgia tech':'USA','harvard':'USA','monash':'Australia','unsw':'Australia','melbourne':'Australia','sydney':'Australia','trinity college dublin':'Ireland','nus':'Singapore','ntu':'Singapore'};
const EN=['IELTS','TOEFL','PTE','Duolingo'],RNG={IELTS:[0,9],TOEFL:[0,120],PTE:[10,90],Duolingo:[10,160]};
const E=m=>['e',m],W=m=>['w',m],nm=v=>v===''||v==null?NaN:+v;
const WZ={abrovian:[
{t:'Where do you want to go?',s:'Destination and timing shape everything else.',f:[
{id:'c',k:'sel',l:'Destination country',o:COUNTRIES,r:1},{id:'lv',k:'sel',l:'Level of study',o:["Bachelor's","Master's",'MBA','PhD'],r:1},
{id:'in',k:'sel',l:'Target intake',o:[...Object.keys(INT),'Undecided'],r:1},
{id:'fld',k:'txt',l:'What do you want to study?',ph:'e.g. Computer Science, Nursing, Finance',r:1,chk:v=>bad(v)?E('That does not look like a field of study. Try something like Computer Science or Finance.'):0}]},
{t:'Your academic profile',s:'We use this to flag gaps early, not to judge you.',f:[
{id:'cg',k:'num',l:'CGPA (out of 10)',r:1,chk:v=>{const n=nm(v);if(isNaN(n)||n<=0)return E('Enter a value above 0.');if(n>10)return E('CGPA cannot be above 10. If this is a percentage, divide it by 10.');if(n<5)return W('Below 5.0 narrows your options. Bridge and foundation programmes can help.');return 0}},
{id:'test',k:'sel',l:'English test',o:[...EN,'Not taken yet'],r:1},
{id:'ts',k:'num',l:a=>a.test+' score',r:1,show:a=>EN.includes(a.test),chk:(v,a)=>{const n=nm(v),[lo,hi]=RNG[a.test];if(isNaN(n)||n<lo||n>hi)return E(`${a.test} scores range from ${lo} to ${hi}.`);if(a.test=='IELTS'&&n*2%1)return E('IELTS bands move in steps of 0.5, for example 6.5.');if(a.test=='IELTS'&&n<6)return W('Most universities ask for 6.0 or more. A retake may help.');return 0}},
{id:'gre',k:'num',l:'GRE total (optional)',show:a=>a.c=='USA'&&a.lv!="Bachelor's",chk:v=>{const n=nm(v);return v===''?0:(n<260||n>340)?E('GRE totals range from 260 to 340.'):0}}]},
{t:'Money, honestly',s:'The number that decides your shortlist.',f:[
{id:'bd',k:'num',l:'Total yearly budget (INR lakh)',r:1,chk:(v,a)=>{const n=nm(v),m=MIN[a.c];if(isNaN(n)||n<=0)return E('Enter your yearly budget in lakh, for example 18.');if(n>200)return E('That is above Rs 2 crore a year. Please check the figure.');if(m&&n<m*.6)return W(`Rough all-in yearly cost for ${a.c} is around Rs ${m} lakh. Your budget looks tight. We will show lower-cost routes.`);return 0}},
{id:'fund',k:'sel',l:'Main source of funds',o:['Family savings','Education loan','Scholarship needed','A mix'],r:1},
{id:'cons',k:'sel',l:'Have you dealt with a consultancy?',o:['No','Spoken but not paid','Considering one','Already paid one'],r:1}]},
{t:'Where are you right now?',s:'So your roadmap starts at the right place.',f:[
{id:'stage',k:'sel',l:'Current stage',o:['Exploring','Preparing for exams','Applying now','Holding offers'],r:1,chk:(v,a)=>v=='Holding offers'&&a.test=='Not taken yet'?W('Offers usually need language proof. Double-check your answers.'):v=='Exploring'&&a.in=='Spring 2027'?W('Spring 2027 is only a few months away. Fall 2027 may be safer.'):v=='Exploring'&&a.test&&a.test!='Not taken yet'?W('You have a test score but say you are exploring. We will treat you as preparing.'):0},
{id:'topics',k:'chips',l:'Where do you need the most help?',o:TOPICS,r:1,min:1},
{id:'worry',k:'area',l:'Your biggest worry (in your words)',ph:'e.g. I am unsure if my budget is enough',chk:v=>bad(v)?W('Could you rephrase? Specific worries help us match you better.'):0}]}],
senior:[
{t:'Your journey abroad',s:'Tell us where you study. We check it matches.',f:[
{id:'c',k:'sel',l:'Country you study in',o:COUNTRIES,r:1},
{id:'uni',k:'txt',l:'University',ph:'e.g. TU Munich',r:1,chk:(v,a)=>{if(bad(v))return E('Please enter your real university name.');const k=Object.keys(UNI).find(k=>new RegExp('\\b'+k+'\\b','i').test(v));return k&&a.c&&UNI[k]!=a.c?E(`${v} looks like a university in ${UNI[k]}, not ${a.c}. Please check.`):0}},
{id:'co',k:'txt',l:'Course',ph:'e.g. MS Computer Science',r:1,chk:v=>bad(v)?E('That does not look like a course name.'):0},
{id:'yr',k:'sel',l:'Current year',o:['Year 1','Year 2','Year 3+','Graduated or working'],r:1},
{id:'gy',k:'num',l:'Graduation year',r:1,chk:(v,a)=>{const y=nm(v);if(isNaN(y)||y<2020||y>2032)return E('Enter a year between 2020 and 2032.');if(a.yr=='Graduated or working'&&y>2026)return E('You said you have graduated, but this year is in the future.');if(a.yr=='Year 1'&&y<2027)return E('A first-year student cannot graduate before 2027.');return 0}}]},
{t:'How you want to help',s:'Your mentor card is built from this.',f:[
{id:'topics',k:'chips',l:'Topics you can guide on',o:TOPICS,r:1,min:2},
{id:'hrs',k:'sel',l:'Time you can give each week',o:['1 to 2 hours','3 to 5 hours','More than 5 hours'],r:1},
{id:'style',k:'sel',l:'Preferred way to help',o:['Chat','Calls','Both'],r:1}]},
{t:'Verify you are real',s:'Seniors are approved before going live. This protects every Abrovian.',f:[
{id:'li',k:'url',l:'LinkedIn profile link',ph:'https://www.linkedin.com/in/yourname',r:1,chk:v=>/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[\w\-%]+\/?$/i.test(v.trim())?0:E('Paste your full profile link, for example https://www.linkedin.com/in/yourname')},
{id:'em',k:'email',l:'University email',ph:'you@university.edu',r:1,chk:v=>!/^\S+@\S+\.\S+$/.test(v)?E('Enter a valid email address.'):/@(gmail|yahoo|outlook|hotmail|proton)/i.test(v)?W('A university email speeds up approval. Otherwise we will ask for extra proof.'):0},
{id:'proof',k:'file',l:'Proof of enrolment or degree (PDF or image)',r:1},
{id:'ig',k:'url',l:'Instagram or other profile (optional)',ph:'https://instagram.com/yourname'},
{id:'bio',k:'area',l:'Short bio for your mentor card',ph:'Who are you and what did you learn on this journey?',r:1,min:40,chk:v=>bad(v)?E('Please write a real bio. Juniors will read this.'):0},
{id:'why',k:'area',l:'Why do you want to mentor?',r:1,min:20,chk:v=>bad(v)?E('Please give a genuine answer.'):0},
{id:'pl',k:'chk',l:'I pledge never to charge or accept money for guidance, and I confirm my details are true.',r:1},
{id:'cd',k:'chk',l:'I agree to the Abrovia Senior code of conduct: honest advice, no promotion of paid agents.',r:1}]}]};
const VSTEP=WZ.senior[2];WZ.senior=WZ.senior.slice(0,2);
const vis=(st,a)=>st.f.filter(f=>!f.show||f.show(a));
const chkf=(f,a)=>{const v=a[f.id];if(f.k=='chips'){return f.min&&(v||[]).length<f.min?E(`Pick at least ${f.min}.`):0}if(f.k=='chk')return f.r&&!v?E('Please confirm to continue.'):0;const em=v===undefined||v===''||v===null;if(em)return f.r?E('This is required.'):0;if(f.min&&String(v).length<f.min)return E(`Please write at least ${f.min} characters.`);return f.chk?f.chk(v,a):0};
const msg=(f,a)=>{const v=a[f.id];if(f.k=='chips'||v===undefined||v===''||v===false)return '';const r=chkf(f,a);return r?`<div class="nt ${r[0]}">${r[1]}</div>`:''};
let wz={a:{},i:0};
function fld(f,a){const v=a[f.id]??'',l=typeof f.l=='function'?f.l(a):f.l;let h;
 if(f.k=='sel')h=`<select onchange="sv('${f.id}',this.value,1)"><option value="">Select</option>${f.o.map(o=>`<option ${o==v?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
 else if(f.k=='area')h=`<textarea rows="3" oninput="sv('${f.id}',this.value)" placeholder="${esc(f.ph||'')}">${esc(v)}</textarea>`;
 else if(f.k=='chips')h=`<div>${f.o.map(o=>`<span class="chip ${(a[f.id]||[]).includes(o)?'on':''}" onclick="tg('${f.id}','${o}')">${o}</span>`).join('')}</div>`;
 else if(f.k=='file')h=`<input type="file" accept=".pdf,.jpg,.jpeg,.png" onchange="pickFile('${f.id}',this)"><div class="mu" id="fn_${f.id}" style="margin-top:6px">${v&&v!='existing'?'Attached: '+esc(v):v=='existing'?'A proof is already on file':''}</div>`;
 else if(f.k=='chk')h=`<label class="row" style="align-items:flex-start;cursor:pointer"><input type="checkbox" style="width:18px;margin-top:3px" ${v?'checked':''} onchange="sv('${f.id}',this.checked)"><span>${l}</span></label>`;
 else h=`<input type="${f.k=='num'?'number':f.k=='url'?'url':f.k=='email'?'email':'text'}" step="any" value="${esc(v)}" placeholder="${esc(f.ph||'')}" oninput="sv('${f.id}',this.value)">`;
 return `<div class="fld"><label>${f.k=='chk'?'':l}${f.r||f.k=='chk'?'':' <span class="mu">(optional)</span>'}</label>${h}<div id="m_${f.id}">${msg(f,a)}</div></div>`}
function sv(id,v,re){wz.a[id]=v;if(re)return wizard();const st=WZ[A.profile.role][wz.i]||VSTEP;vis(st,wz.a).forEach(f=>{const e=$('#m_'+f.id);if(e)e.innerHTML=msg(f,wz.a)})}
function tg(id,v){const a=wz.a[id]=wz.a[id]||[];const i=a.indexOf(v);i<0?a.push(v):a.splice(i,1);wizard()}
function nx(){const st=WZ[A.profile.role][wz.i];let n=0;vis(st,wz.a).forEach(f=>{const r=chkf(f,wz.a);if(r&&r[0]=='e'){n++;$('#m_'+f.id).innerHTML=`<div class="nt e">${r[1]}</div>`}});if(n)return toast('Please fix the highlighted answers');wz.i++;wizard();window.scrollTo(0,0)}
function bk(){wz.i--;wizard()}
const APPR=[['Submitted','We receive your application and profile details.'],['Identity and enrolment check','We match your LinkedIn profile, university email and proof of enrolment against the name and institution you gave.'],['Community review','An Abrovia reviewer reads your bio and answers for honesty and fit with our zero-commission pledge. We may email you with questions.'],['Decision','Approved: you get the Verified Senior badge and full access. Needs info: we tell you exactly what is missing. Declined: you get a reason and can reapply.']];
const apprInfo=(act)=>`<div class="card" style="box-shadow:none;background:var(--sl);margin-bottom:18px"><p class="lb">How approval works</p><div class="tl" style="margin-top:12px">${APPR.map((x,i)=>`<div><b>${i+1}. ${x[0]}</b>${act!=null&&i==act?' <span class="tag shim">YOU ARE HERE</span>':''}<div class="mu">${x[1]}</div></div>`).join('')}</div><p class="mu">Reviews are handled in the order received. We contact you at your university email if anything is missing.</p></div>`;
function pickFile(id,el){const f=el.files[0];if(f&&(f.size>5242880||!/\.(pdf|jpe?g|png)$/i.test(f.name))){el.value='';wz.file=null;sv(id,'');$('#fn_'+id).innerHTML='<span class="nt e">Use a PDF, JPG or PNG under 5 MB.</span>';return}wz.file=f||null;sv(id,f?f.name:'');$('#fn_'+id).textContent=f?'Attached: '+f.name:''}
function insights(a){const o=[],m=MIN[a.c];
 if(A.profile.role=='senior'){o.push(['i',`Mentor card ready: ${esc(a.co)} at ${esc(a.uni)}, ${a.c}.`]);o.push(['i','You can explore Hero HQ right away and start earning reputation. Verification later unlocks answering, publishing and hosting.']);return o}
 if(m)o.push(a.bd>=m?['i',`Your budget fits ${a.c} comfortably. Keep a buffer for currency swings.`]:['w',`Your budget is below the usual all-in cost for ${a.c}. We will surface funding options and lower-cost routes.`]);
 if(a.test=='Not taken yet')o.push(['w','The English test is your first bottleneck. Book a slot early.']);else if(a.test=='IELTS'&&a.ts<6.5)o.push(['w','Your IELTS is below what many masters programmes ask for. Check each university.']);
 const mo=monthsTo(a.in);if(mo!==null&&mo<6)o.push(['w','Your intake is close. Your roadmap is compressed into the essentials.']);
 if(a.cons&&a.cons!='No')o.push(['w','Because you have dealt with a consultancy, we added the red-flag check to your roadmap.']);
 if(a.fund=='Education loan')o.push(['i','Loans need sanction letters early. We placed that step near the top.']);
 o.push(['i','Your passport has been personalised to your country, stage and funding. You can change answers any time from your profile.']);return o}
function monthsTo(i){if(!INT[i])return null;return Math.max(0,Math.round((new Date(INT[i])-new Date())/2629800000))}
