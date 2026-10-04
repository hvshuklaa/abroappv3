/* Abrovia app: views and flows. Data goes through DB (db.js). */
const A = { user: null, profile: null, ob: {}, stamps: new Set(), fi: { notify: new Set(), vote: new Set() }, app: null, view: 'home', sen: null };
const V = () => $('#v');
const M = h => { const e = V(); if (e) e.innerHTML = h; };
const H = (t, s, x) => { const w = t.split(' '), l = w.pop(); return `<div class="hd row sp wr"><div><h1>${w.join(' ')} <span class="hw">${l}</span></h1><p class="mu" style="margin-top:8px;font-size:15px">${s}</p></div>${x || ''}</div>`; };
const SK = () => `<div class="grid">${'<div class="card sk"></div>'.repeat(3)}</div>`;
const isSen = () => A.profile.role == 'senior', isVer = () => A.profile.verification == 'verified';
const empty = (i, t, s, b) => `<div class="card empty"><div class="ico">${ic(i)}</div><h3>${t}</h3><p class="mu">${s}</p>${b || ''}</div>`;
const when = d => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const nav = v => { A.view = v; render(); window.scrollTo(0, 0); };
async function guard(fn) { try { await fn(); } catch (e) { console.error(e); M(`<div class="card empty"><div class="ico">${ic('shield')}</div><h3>We could not load this</h3><p class="mu">${esc(nice(e))}</p><button class="btn" onclick="render()">Try again</button></div>`); } }
const busy = (b, on, t) => { if (!b) return; b.disabled = on; if (t) b.dataset.t = b.dataset.t || b.textContent; b.textContent = on ? t : b.dataset.t; };

/* ---------- boot ---------- */
async function boot() {
  if (!DB.on) return setup();
  DB.listen(async (ev, s) => {
    if (ev == 'SIGNED_OUT') { A.user = null; A.profile = null; landing(); }
    else if (ev == 'PASSWORD_RECOVERY') recovery();
    else if (ev == 'SIGNED_IN' && s && (!A.user || A.user.id != s.user.id)) { setTimeout(async () => { try { await load(s.user); render(); } catch (e) { console.error(e); } }, 0); }
  });
  try { const s = await DB.session(); if (s) await load(s.user); } catch (e) { console.error(e); }
  render();
}
async function load(user) {
  A.user = user; A.profile = await DB.profile(user.id);
  if (!A.profile) throw new Error('Your profile is still being created. Please refresh in a moment.');
  A.ob = A.profile.onboarded ? await DB.ob(user.id) : {};
  A.stamps = await DB.stamps(user.id); A.fi = await DB.fi(user.id);
  A.app = A.profile.role == 'senior' ? await DB.myApp(user.id) : null; A.view = 'home';
}
function render() {
  document.body.classList.toggle('sr', !!A.profile && A.profile.role == 'senior');
  if (!A.user || !A.profile) return landing();
  if (!A.profile.role) return rolePick();
  if (!A.profile.onboarded) return wizard();
  shell();
}
function setup() {
  $('#root').innerHTML = `<div class="form"><div class="card" style="max-width:620px"><p class="lb">One more step</p><h2 class="ht" style="font-size:30px;margin:6px 0 12px">Connect <span class="hw">Supabase</span></h2><p class="mu" style="margin-bottom:12px">Open <b>config.js</b> and paste your Supabase project URL and anon key. Then run <b>schema.sql</b> in the SQL editor. The README walks through it in a few minutes.</p></div></div>`;
}
const TOP = (r) => `<nav class="top"><div class="ti"><a href="${esc(location.pathname)}"><img class="lg" src="logo.jpg" alt="Abrovia"></a>${r || ''}</div></nav>`;

/* ---------- auth ---------- */
let au = { mode: 'up', accent: COL[0] };
/* app.html opens on Sign up (Start for Free); app.html?mode=login opens on Log in */
if (new URLSearchParams(location.search).get('mode') === 'login' || /\/login\/?$/.test(location.pathname)) au.mode = 'in';
function landing() {
  document.body.classList.remove('sr');
  const up = au.mode == 'up', V1 = x => `<div>${ic('check')}<b>${x[0]}</b><span>${x[1]}</span></div>`;
  $('#root').innerHTML = TOP(`<a class="mu" href="https://abrovia.in" style="font-weight:700;text-decoration:none">abrovia.in</a>`) + `
  <section class="lh"><div style="animation:up .6s both"><div class="badge glass"><span class="bp">Free</span>Built by international students, for international students</div>
  <h1 class="ht">Welcome to <span class="sk">Abrovia</span><br><span class="hw">your people, abroad.</span></h1>
  <p style="font-size:19px;color:#475569;margin-top:22px;max-width:540px;font-weight:500">Real answers from verified Abrovia Seniors, tools that tell the truth, and a community that keeps you clear of predatory consultancies.</p>
  <div class="cs">${[['Free forever', 'No paywalls'], ['Zero commission', 'No hidden agenda'], ['Verified Seniors', 'Checked by our team']].map(V1).join('')}</div></div>
  <div class="vis"><div class="fc glass" style="top:-44px;left:-34px">${ic('check')}<div>Verified Seniors<div class="mu">Every mentor is checked</div></div></div>
  <div class="fc glass" style="bottom:-26px;right:-6px;animation-delay:-2s">${ic('shield')}<div>Red-flag check<div class="mu">Test any agent offer</div></div></div>
  <div class="card glass fbox" style="padding:30px;animation-delay:.15s" id="authbox">${authHtml()}</div></div></section>`;
}
function authHtml() {
  const up = au.mode == 'up';
  return `<div class="sub" style="margin-bottom:18px"><button class="${up ? 'on' : ''}" onclick="au.mode='up';landing()">Sign up</button><button class="${up ? '' : 'on'}" onclick="au.mode='in';landing()">Log in</button></div>
  <h2 style="font-size:26px;text-transform:uppercase;margin-bottom:4px">${up ? 'Join <span class="hw">Abrovia</span>' : 'Welcome <span class="hw">back</span>'}</h2>
  <p class="mu" style="margin-bottom:18px">${up ? 'Pick a username. Your real name stays private.' : 'Log in to continue your journey.'}</p>
  ${up ? `<div class="fld"><label for="au">Username</label><input id="au" maxlength="18" autocomplete="username" placeholder="e.g. AtlasScholar" oninput="chkU(this.value)"><div id="auh" class="mu" style="margin-top:4px"></div></div>` : ''}
  <div class="fld"><label for="ae">Email</label><input id="ae" type="email" autocomplete="email" placeholder="you@example.com"></div>
  <div class="fld"><label for="ap">Password</label><input id="ap" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="${up ? 'At least 8 characters, with a number' : 'Your password'}" onkeydown="if(event.key=='Enter')${up ? 'doUp' : 'doIn'}()"></div>
  ${up ? `<label class="mu" style="display:block;margin-bottom:6px">Accent colour</label><div class="sw" style="margin-bottom:16px">${COL.map(c => `<i tabindex="0" class="${c == au.accent ? 'on' : ''}" style="background:${c}" onclick="au.accent='${c}';document.querySelectorAll('.sw i').forEach(i=>i.classList.toggle('on',i.style.background.length&&rgb(i.style.background)=='${c}'))"></i>`).join('')}</div>
  <label class="row" style="align-items:flex-start;margin-bottom:14px;cursor:pointer"><input type="checkbox" id="at" style="width:18px;margin-top:3px"><span class="mu">I agree to the <a href="terms.html" target="_blank">Terms</a> and <a href="privacy.html" target="_blank">Privacy Policy</a>.</span></label>` : `<a class="mu" href="#" onclick="forgot();return false" style="display:block;margin-bottom:14px">Forgot your password?</a>`}
  <div id="aerr"></div><button class="btn" style="width:100%" id="abtn" onclick="${up ? 'doUp' : 'doIn'}()">${up ? 'Create my account' : 'Log in'}</button>`;
}
const rgb = s => { const m = s.match(/\d+/g); return m ? '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('') : s; };
const fe = m => { const e = $('#aerr'); if (e) e.innerHTML = `<div class="nt e" style="margin:0 0 12px">${esc(m)}</div>`; };
let cu;
function chkU(v) {
  clearTimeout(cu); const h = $('#auh'); v = v.trim();
  if (!v) { h.textContent = ''; return; }
  if (!/^[A-Za-z0-9_]{3,18}$/.test(v)) { h.innerHTML = '<span style="color:#b45309">3 to 18 letters, numbers or underscores</span>'; return; }
  h.textContent = 'Checking…';
  cu = setTimeout(async () => { try { const f = await DB.nameFree(v); h.innerHTML = f ? '<span style="color:#059669">Available</span>' : '<span style="color:#b91c1c">Already taken</span>'; } catch (e) { h.textContent = ''; } }, 400);
}
async function doUp() {
  const u = $('#au').value.trim(), e = $('#ae').value.trim(), p = $('#ap').value, b = $('#abtn');
  if (!/^[A-Za-z0-9_]{3,18}$/.test(u)) return fe('Username must be 3 to 18 letters, numbers or underscores.');
  if (!/^\S+@\S+\.\S+$/.test(e)) return fe('Enter a valid email address.');
  if (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p)) return fe('Password needs at least 8 characters, including a letter and a number.');
  if (!$('#at').checked) return fe('Please accept the Terms and Privacy Policy.');
  busy(b, 1, 'Creating account…');
  try {
    if (!(await DB.nameFree(u))) throw { message: 'That username is taken. Try another.' };
    const d = await DB.signUp(e, p, u, au.accent);
    if (d.session) { await load(d.user); render(); } else confirmScreen(e);
  } catch (x) { fe(nice(x)); busy(b, 0); }
}
async function doIn() {
  const e = $('#ae').value.trim(), p = $('#ap').value, b = $('#abtn');
  if (!e || !p) return fe('Enter your email and password.');
  busy(b, 1, 'Logging in…');
  try { const d = await DB.signIn(e, p); await load(d.user); render(); } catch (x) { fe(nice(x)); busy(b, 0); }
}
async function forgot() {
  const e = ($('#ae').value || '').trim(); if (!/^\S+@\S+\.\S+$/.test(e)) return fe('Type your email above first, then tap "Forgot your password?".');
  try { await DB.reset(e); $('#aerr').innerHTML = '<div class="nt i" style="margin:0 0 12px">Reset link sent. Check your inbox.</div>'; } catch (x) { fe(nice(x)); }
}
function confirmScreen(e) {
  $('#root').innerHTML = TOP() + `<div class="form"><div class="card glass" style="max-width:480px;text-align:center"><div class="ico" style="margin:0 auto 14px">${ic('send')}</div><h2 style="text-transform:uppercase">Check your <span class="hw">inbox</span></h2><p class="mu" style="margin:10px 0 18px">We sent a confirmation link to <b>${esc(e)}</b>. Open it, then log in.</p><button class="btn" onclick="au.mode='in';landing()">Go to log in</button></div></div>`;
}
function recovery() {
  $('#root').innerHTML = TOP() + `<div class="form"><div class="card glass" style="max-width:440px;width:100%"><h2 style="text-transform:uppercase;margin-bottom:12px">Set a new <span class="hw">password</span></h2><div class="fld"><input id="np1" type="password" placeholder="New password"></div><div id="aerr"></div><button class="btn" style="width:100%" onclick="saveNp()">Save password</button></div></div>`;
}
async function saveNp() { const p = $('#np1').value; if (p.length < 8 || !/\d/.test(p)) return fe('Use at least 8 characters including a number.'); try { await DB.setPassword(p); const s = await DB.session(); await load(s.user); render(); toast('Password updated'); } catch (x) { fe(nice(x)); } }
async function signout() { await DB.signOut(); A.user = null; A.profile = null; landing(); }

/* ---------- role + onboarding ---------- */
function rolePick() {
  const L = a => a.map(x => `<div class="row" style="padding:3px 0;color:#334155">${ic('check')}<span>${x}</span></div>`).join('');
  $('#root').innerHTML = TOP(`<button class="btn o s" onclick="signout()">Log out</button>`) + `<div class="form" style="min-height:100vh"><div style="max-width:900px;width:100%"><h1 class="ht" style="font-size:clamp(30px,4.4vw,56px)">Hey ${esc(A.profile.username)}, <span class="hw">who are you?</span></h1><p class="mu" style="margin:10px 0 28px;font-size:16px">Your whole experience adapts to this choice. It cannot be changed later.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><div class="card role" style="background:linear-gradient(135deg,#f0f9ff,#bae6fd)" onclick="setRole('abrovian')"><div class="ico">${ic('globe')}</div><h2>Abrovian</h2><p class="mu" style="margin-bottom:14px">I am planning to study abroad.</p>${L(['A roadmap personalised to your country and stage', 'Ask verified Seniors real questions', 'Consultancy red-flag shield'])}<div class="btn" style="margin-top:18px">Start my journey</div></div>
  <div class="card role" style="background:linear-gradient(135deg,#eef2ff,#c7d2fe)" onclick="setRole('senior')"><div class="ico">${ic('star')}</div><h2>Abrovia Senior</h2><p class="mu" style="margin-bottom:14px">I already study abroad.</p>${L(['Your own Hero HQ, available instantly', 'Explore and earn reputation right away', 'Verify later to unlock answering and publishing'])}<div class="btn dk" style="margin-top:18px">Become a Senior</div></div></div></div></div>`;
}
async function setRole(r) { try { A.profile = await DB.updateProfile(A.user.id, { role: r }); wz = { a: {}, i: 0 }; render(); } catch (e) { toast(nice(e)); } }
function wizard() {
  const sen = A.profile.role == 'senior', steps = WZ[A.profile.role], a = wz.a, hd = TOP(`<button class="btn o s" onclick="signout()">Log out</button>`);
  if (wz.i >= steps.length) {
    const ins = insights(a);
    $('#root').innerHTML = hd + `<div class="form"><div class="fbox" style="max-width:560px"><div class="card glass"><p class="lb">${sen ? 'Your mentor card' : 'Your profile read'}</p><h2 class="ht" style="font-size:30px;margin:6px 0 14px">${sen ? 'You are <span class="hw">in</span>' : 'Here is what we <span class="hw">noticed</span>'}</h2>${ins.map(x => `<div class="nt ${x[0]}">${x[1]}</div>`).join('')}<div class="row" style="margin-top:18px"><button class="btn o" onclick="bk()">Back</button><button class="btn" style="flex:1" id="finb" onclick="fin()">${sen ? 'Open Hero HQ' : 'Open my dashboard'}</button></div></div></div></div>`; return;
  }
  const st = steps[wz.i];
  $('#root').innerHTML = hd + `<div class="form"><div class="fbox" style="max-width:560px"><div class="segs">${steps.map((_, i) => `<i class="${i <= wz.i ? 'on' : ''}"></i>`).join('')}</div>
  <div class="card glass" style="margin-top:14px"><p class="lb">Step ${wz.i + 1} of ${steps.length}</p><h2 class="ht" style="font-size:30px;margin:6px 0 4px">${st.t}</h2><p class="mu" style="margin-bottom:18px">${st.s}</p>${vis(st, a).map(f => fld(f, a)).join('')}
  <div class="row" style="margin-top:18px">${wz.i ? `<button class="btn o" onclick="bk()">Back</button>` : ''}<button class="btn" style="flex:1" onclick="nx()">Continue</button></div></div></div></div>`;
}
async function fin() {
  const a = wz.a, b = $('#finb'); busy(b, 1, 'Saving…');
  try {
    await DB.saveOb(A.user.id, a);
    const f = isSen() ? { country: a.c, university: a.uni, course: a.co, study_year: a.yr, grad_year: +a.gy, topics: a.topics || [], onboarded: true } : { country: a.c, course: a.fld, topics: a.topics || [], onboarded: true };
    A.profile = await DB.updateProfile(A.user.id, f); A.ob = a; A.view = 'home'; render(); window.scrollTo(0, 0); toast('Welcome to Abrovia, ' + A.profile.username);
  } catch (e) { toast(nice(e)); busy(b, 0); }
}

/* ---------- shell ---------- */
function shell() {
  const sen = isSen();
  const it = sen ? [['home', 'star', 'Hero HQ'], ['qa', 'chat', 'Questions'], ['hub', 'pen', 'Contribute'], ['com', 'users', 'Community'], ['stories', 'book', 'Stories'], ['tools', 'shield', 'Toolkit'], ['market', 'bag', 'Market'], ['labs', 'spark', 'Labs']]
    : [['home', 'compass', 'Mission'], ['sen', 'users', 'Seniors'], ['qa', 'chat', 'Ask'], ['com', 'globe', 'Community'], ['stories', 'book', 'Stories'], ['tools', 'shield', 'Toolkit'], ['market', 'bag', 'Market'], ['labs', 'spark', 'Labs']];
  if (!it.find(i => i[0] == A.view)) A.view = 'home';
  const vs = A.profile.verification;
  $('#root').innerHTML = `<nav class="top"><div class="ti"><img class="lg" src="logo.jpg" alt="Abrovia" style="cursor:pointer" onclick="nav('home')"><div class="tabs glass">${it.map(i => `<button class="tab ${A.view == i[0] ? 'on' : ''}" onclick="nav('${i[0]}')">${ic(i[1])}${i[2]}</button>`).join('')}</div>
  <button class="chipu" onclick="account()" aria-label="Account">${avt(A.profile.username, A.profile.accent, 32)}<div class="un"><b>${esc(A.profile.username)}</b>${sen ? `<span class="vb">${ic(vs == 'verified' ? 'check' : 'clock')}${vs == 'verified' ? 'Verified' : vs == 'pending' ? 'In review' : 'Not verified'}</span>` : ''}</div></button></div></nav>
  <main class="main">${sen && vs != 'verified' ? vbar() : ''}<div id="v"></div><footer class="foot">© Abrovia · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="mailto:${esc(CFG.contact)}">Contact</a></footer></main>`;
  ({ home: sen ? heroHQ : mission, sen: seniors, qa: sen ? qaSenior : qaAsk, hub, com: community, stories, tools, market, labs })[A.view]();
}
function vbar() {
  const s = A.profile.verification, n = A.app && A.app.reviewer_note ? ' Note: ' + esc(A.app.reviewer_note) : '';
  const m = { none: ['Verify your profile to unlock answering, publishing and hosting. Explore everything meanwhile.', 'Verify now'], pending: ['Your application is under review. Keep exploring and earning credits while you wait.', 'View status'], needs_info: ['We need a little more information.' + n, 'Update application'], rejected: ['Your application was not approved.' + n, 'Reapply'] }[s];
  return `<div class="vbar"><div class="row">${ic(s == 'pending' ? 'clock' : 'lock')}<span>${m[0]}</span></div><button class="btn s" onclick="openVerify()">${m[1]}</button></div>`;
}
function account() {
  openM(`<p class="lb">Account</p><h2 style="font-size:24px;margin:4px 0 14px">${esc(A.profile.username)}</h2><p class="mu" style="margin-bottom:14px">${isSen() ? 'Abrovia Senior' : 'Abrovian'} · ${esc(A.user.email || '')}</p>
  <label class="mu">Accent colour</label><div class="sw" style="margin:8px 0 18px">${COL.map(c => `<i tabindex="0" class="${c == A.profile.accent ? 'on' : ''}" style="background:${c}" onclick="setAccent('${c}')"></i>`).join('')}</div>
  ${A.profile.is_admin ? `<a class="btn o" style="width:100%;margin-bottom:10px;text-decoration:none" href="admin.html">${ic('shield')}Open admin</a>` : ''}
  <button class="btn" style="width:100%" onclick="closeM();signout()">Log out</button><p class="mu" style="margin-top:12px;text-align:center">To delete your account, email <a href="mailto:${esc(CFG.contact)}">${esc(CFG.contact)}</a>.</p>`, 420);
}
async function setAccent(c) { try { A.profile = await DB.updateProfile(A.user.id, { accent: c }); closeM(); render(); } catch (e) { toast(nice(e)); } }
function gate(why) {
  if (isSen() && !isVer()) { openM(`<div class="ico" style="margin-bottom:12px">${ic('lock')}</div><h2 style="font-size:22px;margin-bottom:8px">Unlocks after verification</h2><p class="mu" style="margin-bottom:16px">${why} Verification protects every Abrovian. Meanwhile you can explore, save drafts and earn early credits.</p><button class="btn" onclick="closeM();openVerify()">${A.profile.verification == 'pending' ? 'View my application' : 'Verify my profile'}</button>`, 460); return true; }
  return false;
}

/* ---------- senior verification ---------- */
function openVerify(edit) {
  const st = A.profile.verification, a = A.app;
  if (st == 'verified') return toast('You are verified');
  if (st == 'pending' && !edit) {
    return openM(`<p class="lb">Application received</p><h2 class="ht" style="font-size:28px;margin:6px 0 12px">Under <span class="hw">review</span></h2>${apprInfo(1)}<div class="card" style="box-shadow:none;margin-bottom:12px"><b>What you submitted</b><div class="mu" style="margin-top:6px;line-height:1.9">${ic('link')} ${esc(a.linkedin)}<br>${ic('file')} ${esc(a.uni_email)}<br>${ic('check')} Proof: ${a.proof_path ? 'uploaded' : 'missing'}</div></div><button class="btn o s" onclick="openVerify(1)">Edit application</button>`, 680);
  }
  wz = { a: a ? { li: a.linkedin, em: a.uni_email, ig: a.instagram || '', bio: a.bio, why: a.motivation, proof: a.proof_path ? 'existing' : '' } : {}, i: 2, file: null };
  openM(`<p class="lb">Senior verification</p><h2 class="ht" style="font-size:28px;margin:6px 0 4px">Verify your <span class="hw">profile</span></h2><p class="mu" style="margin-bottom:14px">This takes a few minutes and unlocks answering, publishing and hosting.</p>
  ${(st == 'needs_info' || st == 'rejected') && a && a.reviewer_note ? `<div class="nt w" style="margin-bottom:12px">Reviewer note: ${esc(a.reviewer_note)}</div>` : ''}${apprInfo(st == 'none' ? null : 1)}${VSTEP.f.map(f => fld(f, wz.a)).join('')}<div id="vm"></div><button class="btn" style="width:100%" id="vbtn" onclick="submitVerify()">Submit for review</button>`, 700);
}
async function submitVerify() {
  const a = wz.a; let n = 0;
  VSTEP.f.forEach(f => { const r = chkf(f, a); if (r && r[0] == 'e') { n++; $('#m_' + f.id).innerHTML = `<div class="nt e">${r[1]}</div>`; } });
  if (n) return toast('Please fix the highlighted fields');
  const b = $('#vbtn'); busy(b, 1, 'Submitting…');
  try {
    let path = A.app ? A.app.proof_path : null; if (wz.file) path = await DB.upload(A.user.id, wz.file);
    await DB.submitApp({ ...a, path });
    A.profile = await DB.profile(A.user.id); A.app = await DB.myApp(A.user.id); closeM(); render(); toast('Application submitted. We will review it soon.');
  } catch (e) { busy(b, 0); $('#vm').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; }
}

/* ---------- ABROVIAN: mission control ---------- */
const TIPS = ['Nobody can guarantee a visa. Ever.', 'A great SOP tells a story, not a résumé.', 'Ask three seniors before you pay one consultant.', 'Start documents six months before intake.', 'Your budget decides your country, not the other way round.'];
function mission() {
  const p = A.ob, pl = plan(p), k = x => A.stamps.has('a_' + x.id), dn = pl.filter(k).length, pc = Math.round(dn / pl.length * 100), nx = pl.find(x => !k(x)), mo = monthsTo(p.in);
  const ph = pc < 20 ? 'Boarding' : pc < 50 ? 'Taxiing' : pc < 80 ? 'Climbing' : pc < 100 ? 'Final approach' : 'Landed';
  M(`<div class="hero"><div style="position:relative;flex:1"><p class="lb" style="color:#bae6fd">Mission control</p><h1 class="ht" style="font-size:clamp(30px,4vw,52px);margin-top:8px">${hello()}, <span class="hw">${esc(A.profile.username)}</span></h1>
  <p>${esc(p.fld)} in ${p.c}${p.in && p.in != 'Undecided' ? ', ' + p.in : ''}. ${nx ? 'Next up: ' + esc(nx.t.charAt(0).toLowerCase() + nx.t.slice(1)) + '.' : 'Every stamp collected. You are cleared for takeoff.'}</p>
  <div class="kp"><div><b>${mo === null ? 'Pick one' : mo < 1 ? 'Now' : '~' + mo + ' mo'}</b><span>To takeoff</span></div><div><b>${ph}</b><span>Flight phase</span></div><div><b>${esc((p.topics || [])[0] || 'Visa')}</b><span>Top focus</span></div></div></div>
  <div style="position:relative;min-width:260px;flex:.6"><div class="row sp"><b>Flight to ${p.c}</b><b>${ph}</b></div><div class="pth"><i style="width:${Math.max(4, pc)}%"></i><svg class="i" style="left:${Math.max(5, pc)}%" viewBox="0 0 24 24"><path d="${P.plane}"/></svg></div><p style="font-size:12px">Collect stamps to move the plane</p></div></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
  ${nx ? `<div class="card" style="grid-column:1/-1;background:linear-gradient(135deg,#fff,#e0f2fe);display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div class="ico">${ic(nx.i)}</div><div style="flex:1;min-width:220px"><p class="lb">Your next best move</p><h3 style="margin:2px 0">${esc(nx.t)}</h3><p class="mu">${nx.w}</p></div><button class="btn" onclick="go('${nx.go}')">Take me there</button></div>` : ''}
  <div class="card" style="grid-column:1/-1"><p class="lb">Your Abrovia passport</p><h3 style="margin-top:2px">Built for ${esc(p.fld)} in ${p.c}. Tap to stamp.</h3><div class="stamps">${pl.map(x => { const on = k(x); return `<button class="st ${on ? 'on' : ''} ${window.lastS == 'a_' + x.id ? 'new' : ''}" onclick="stamp('a_${x.id}',event)"><div class="c">${ic(on ? 'check' : x.i)}</div>${esc(x.t)}</button>`; }).join('')}</div></div>
  <div class="card"><div class="ico">${ic('map')}</div><h3 style="margin:12px 0 6px">${p.c} brief</h3><p class="mu">${BRIEF[p.c]}</p><p class="mu" style="margin-top:8px;font-style:italic">Always verify on official government sites.</p></div>
  <div class="card"><div class="ico">${ic('users')}</div><h3 style="margin:12px 0 8px">Abrovia Seniors for you</h3><div id="msen"><div class="sk" style="height:90px;border-radius:14px"></div></div></div>
  <div class="card"><div class="ico">${ic('chat')}</div><h3 style="margin:12px 0 6px">Ask a real Senior</h3><p class="mu" style="margin-bottom:14px">Post a question. Verified Seniors answer for free.</p><button class="btn s" onclick="nav('qa')">Ask a question</button></div>
  <div class="card"><div class="ico">${ic('bulb')}</div><p class="lb" style="margin-top:12px">Daily truth</p><p class="q" style="margin-top:6px">${TIPS[new Date().getDate() % TIPS.length]}</p></div></div>`);
  seniorsCached().then(s => { const e = $('#msen'); if (!e) return; const r = rankSen(s).slice(0, 3); e.innerHTML = r.length ? r.map(m => `<div class="row sp pr" style="padding:6px 0" onclick="openSen('${m.id}')"><div class="row">${avt(m.username, m.accent, 34)}<div><b style="font-size:14px">${esc(m.username)}</b><div class="mu">${esc(m.university || m.country || '')}</div></div></div><span class="tag">${m.lbl}</span></div>`).join('') + `<button class="btn s" style="margin-top:10px" onclick="nav('sen')">See all Seniors</button>` : `<p class="mu">Our first Seniors are completing verification. Ask a question and they will answer as they join.</p>`; }).catch(() => { });
}
async function stamp(k, ev) {
  const on = !A.stamps.has(k); on ? A.stamps.add(k) : A.stamps.delete(k); window.lastS = on ? k : null; if (on) burst(ev.clientX, ev.clientY); mission(); window.lastS = null;
  try { await DB.stamp(A.user.id, k, on); } catch (e) { on ? A.stamps.delete(k) : A.stamps.add(k); mission(); toast('Could not save that stamp. Try again.'); }
}
let SEN_C = null;
async function seniorsCached() { if (!SEN_C) SEN_C = await DB.seniors(); return SEN_C; }
function rankSen(list) { const p = A.ob || {}; return list.map(m => { const s = (m.country == p.c ? 3 : 0) + (m.topics || []).filter(t => (p.topics || []).includes(t)).length; return { ...m, s, lbl: s >= 4 ? 'Top match' : s >= 2 ? 'Good match' : 'Verified' }; }).sort((a, b) => b.s - a.s); }

/* ---------- SENIORS directory (for Abrovians) ---------- */
let sq = '', sf = 'All';
function seniors() {
  M(H('Abrovia Seniors', 'Verified international students. Tap a profile to learn more. No commissions, ever.') + SK());
  guard(async () => {
    const all = rankSen(await seniorsCached()); window.SL = all;
    if (!all.length) return M(H('Abrovia Seniors', 'Verified international students. No commissions, ever.') + empty('users', 'Our first Seniors are being verified', 'Every Senior is checked by our team before appearing here. Ask a question now and a Senior will answer as soon as they join.', `<button class="btn" onclick="nav('qa')">Ask a question</button>`));
    M(H('Abrovia Seniors', 'Verified international students. Tap a profile to learn more. No commissions, ever.') + `<div style="position:relative;max-width:480px;margin-bottom:14px"><input placeholder="Search by name, university or topic" value="${esc(sq)}" oninput="sq=this.value;sl()" style="padding-left:44px"><span style="position:absolute;left:16px;top:13px;color:var(--mu)">${ic('search')}</span></div>
    <div style="margin-bottom:18px"><span class="chip ${sf == 'All' ? 'on' : ''}" onclick="sf='All';seniors()">All</span>${COUNTRIES.map(c => `<span class="chip ${sf == c ? 'on' : ''}" onclick="sf='${c}';seniors()">${c}</span>`).join('')}</div><div class="grid" id="sl">${sCards()}</div>`);
  });
}
function sCards() {
  const L = (window.SL || []).filter(m => (sf == 'All' || m.country == sf) && (!sq || ((m.username || '') + (m.university || '') + (m.course || '') + (m.topics || []).join()).toLowerCase().includes(sq.toLowerCase())));
  return L.map(m => `<div class="card pr" onclick="openSen('${m.id}')"><div class="row sp"><div class="row">${avt(m.username, m.accent)}<div><b>${esc(m.username)}</b> <span class="vb">${ic('check')}Verified</span><div class="mu">${esc(m.university || '')}${m.country ? ', ' + m.country : ''}</div></div></div><span class="tag">${m.lbl}</span></div><p class="mu" style="margin:12px 0 6px">${esc(m.course || '')}</p><div>${(m.topics || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div><button class="btn s" style="margin-top:10px">View profile</button></div>`).join('') || '<p class="mu">No Seniors match your search.</p>';
}
const sl = () => { const e = $('#sl'); if (e) e.innerHTML = sCards(); };
function openSen(id) {
  const m = (SEN_C || []).find(x => x.id == id); if (!m) return;
  openM(`<div class="row" style="margin-bottom:14px">${avt(m.username, m.accent, 64)}<div><h2 style="font-size:24px">${esc(m.username)}</h2><div class="mu">${esc(m.course || '')} · ${esc(m.university || '')}${m.country ? ', ' + m.country : ''}</div><span class="vb">${ic('check')}Verified Senior</span></div></div>
  <p style="margin-bottom:14px">${esc(m.bio || 'This Senior has not added a bio yet.')}</p><p class="lb">Can help with</p><div style="margin:4px 0 16px">${(m.topics || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
  ${isSen() ? '' : `<button class="btn" style="width:100%" onclick="closeM();askForm('${m.id}')">Ask ${esc(m.username)} a question</button>`}<p class="mu" style="margin-top:10px;text-align:center">Private chat is coming soon. Questions and answers work today.</p>`, 560);
}

/* ---------- Q&A ---------- */
const age = d => { const s = (Date.now() - new Date(d)) / 1000; return s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; };
function qCard(q, d, mine) {
  const as = d.ans.filter(a => a.question_id == q.id), who = d.pf[q.asker_id] || {}, to = d.pf[q.to_senior];
  return `<div class="card"><div class="row sp wr"><div class="row">${avt(who.username || '?', who.accent, 34)}<div><b>${esc(who.username || 'Abrovian')}</b><div class="mu">${age(q.created_at)}${to ? ' · asked ' + esc(to.username) : ''}</div></div></div><span class="tag">${esc(q.topic)}</span></div><h3 style="margin:12px 0">${esc(q.body)}</h3>
  ${as.map(a => { const s = d.pf[a.senior_id] || {}, th = d.th.filter(t => t.answer_id == a.id), mt = th.some(t => t.user_id == A.user.id); return `<div class="ans"><div class="row">${avt(s.username || '?', s.accent, 28)}<b>${esc(s.username || 'Senior')}</b><span class="vb">${ic('check')}Verified Senior</span></div><p style="margin:8px 0">${esc(a.body)}</p>${q.asker_id == A.user.id ? `<button class="rx ${mt ? 'on' : ''}" onclick="thankA('${a.id}',${!mt})">${ic('heart')}${mt ? 'Thanked' : 'Say thanks'}</button>` : th.length ? `<span class="mu">${ic('heart')} Found helpful</span>` : ''}</div>`; }).join('') || `<p class="mu">${mine ? 'Waiting for a verified Senior to answer. You will see it here.' : 'No answer yet.'}</p>`}</div>`;
}
let qtopic = '';
function qaAsk() {
  M(H('Ask a Senior', 'Real answers from verified international students. Free, always.') + SK());
  guard(async () => {
    const [d, sn] = await Promise.all([DB.qa(), seniorsCached()]), mine = d.qs.filter(q => q.asker_id == A.user.id), rest = d.qs.filter(q => q.asker_id != A.user.id && d.ans.some(a => a.question_id == q.id));
    M(H('Ask a Senior', 'Real answers from verified international students. Free, always.') + `<div class="card" style="margin-bottom:22px"><p class="lb">New question</p><div class="row wr" style="margin:10px 0"><select id="qt" style="flex:1;min-width:160px"><option value="">Topic</option>${TOPICS.map(t => `<option ${t == qtopic ? 'selected' : ''}>${t}</option>`).join('')}</select><select id="qto" style="flex:1;min-width:160px"><option value="">Any verified Senior</option>${sn.map(s => `<option value="${s.id}">${esc(s.username)}</option>`).join('')}</select></div>
    <textarea id="qb" rows="3" placeholder="Be specific. Mention your country, course and what you have already tried." maxlength="600"></textarea><div id="m_q"></div><button class="btn" style="margin-top:12px" id="qbtn" onclick="askQ()">Post question</button></div>
    <p class="lb" style="margin-bottom:10px">Your questions</p><div style="display:grid;gap:14px;margin-bottom:26px">${mine.map(q => qCard(q, d, 1)).join('') || empty('chat', 'No questions yet', 'Your first question is one tap away.')}</div>
    ${rest.length ? `<p class="lb" style="margin-bottom:10px">Answered by the community</p><div style="display:grid;gap:14px">${rest.map(q => qCard(q, d)).join('')}</div>` : ''}`);
  });
}
function askForm(to) { nav('qa'); setTimeout(() => { const s = $('#qto'); if (s && to) s.value = to; const b = $('#qb'); if (b) b.focus(); }, 700); }
async function askQ() {
  const t = $('#qt').value, b = $('#qb').value.trim(), to = $('#qto').value;
  if (!t) return $('#m_q').innerHTML = '<div class="nt e">Choose a topic.</div>';
  if (b.length < 15 || bad(b)) return $('#m_q').innerHTML = '<div class="nt e">Write a real question of at least 15 characters.</div>';
  const btn = $('#qbtn'); busy(btn, 1, 'Posting…');
  try { await DB.ask(A.user.id, to, t, b); qtopic = t; toast('Question posted'); qaAsk(); } catch (e) { busy(btn, 0); $('#m_q').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; }
}
async function thankA(id, on) { try { await DB.thank(id, A.user.id, on); if (on) burst(innerWidth / 2, innerHeight / 2); qaAsk(); } catch (e) { toast(nice(e)); } }
function qaSenior() {
  M(H('Questions for Seniors', 'Juniors asked. Your experience is the answer.') + SK());
  guard(async () => {
    const d = await DB.qa(), my = A.profile.topics || [], answered = new Set(d.ans.map(a => a.question_id));
    const open = d.qs.filter(q => !answered.has(q.id) && q.asker_id != A.user.id).sort((a, b) => ((b.to_senior == A.user.id) - (a.to_senior == A.user.id)) || (my.includes(b.topic) - my.includes(a.topic)));
    const mine = d.qs.filter(q => d.ans.some(a => a.question_id == q.id && a.senior_id == A.user.id));
    window.QD = d;
    M(H('Questions for Seniors', 'Juniors asked. Your experience is the answer.') + `${!isVer() ? `<div class="nt i" style="margin-bottom:16px">${ic('lock')} You can read every question now. Answering unlocks after verification.</div>` : ''}<p class="lb" style="margin-bottom:10px">Open questions</p><div style="display:grid;gap:14px;margin-bottom:26px">${open.map(q => { const who = d.pf[q.asker_id] || {}; return `<div class="card"><div class="row sp wr"><div class="row">${avt(who.username || '?', who.accent, 34)}<div><b>${esc(who.username || 'Abrovian')}</b><div class="mu">${age(q.created_at)}</div></div></div><span class="tag">${esc(q.topic)}${q.to_senior == A.user.id ? ' · for you' : my.includes(q.topic) ? ' · your topic' : ''}</span></div><h3 style="margin:12px 0">${esc(q.body)}</h3>
    ${isVer() ? `<textarea id="a_${q.id}" rows="3" maxlength="2000" placeholder="Share what worked for you. Be honest and specific."></textarea><div id="m_${q.id}"></div><button class="btn s" style="margin-top:10px" onclick="ansQ('${q.id}')">Post answer</button>` : `<button class="btn o s" onclick="gate('Answering questions needs a verified profile.')">${ic('lock')}Answer after verification</button>`}</div>`; }).join('') || empty('check', 'The queue is clear', 'No open questions right now. Share a tip in Community while you wait.')}</div>
    ${mine.length ? `<p class="lb" style="margin-bottom:10px">Your answers</p><div style="display:grid;gap:14px">${mine.map(q => qCard(q, d)).join('')}</div>` : ''}`);
  });
}
async function ansQ(id) {
  const t = $('#a_' + id).value.trim(); if (t.length < 20 || bad(t)) return $('#m_' + id).innerHTML = '<div class="nt e">Write a couple of real sentences so the junior can act on it.</div>';
  try { await DB.answer(id, A.user.id, t); burst(innerWidth / 2, innerHeight / 3); toast('Answer posted. Thank you!'); qaSenior(); } catch (e) { $('#m_' + id).innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; }
}

/* ---------- SENIOR: Hero HQ ---------- */
const RANKS = [['Rookie Guide', 0], ['Pathfinder', 30], ['Trailblazer', 100], ['Abrovia Legend', 250]];
const pts = s => 10 + Math.min(3, s.drafts) * 5 + (A.app ? 10 : 0) + (isVer() ? 50 : 0) + s.ans * 10 + s.thx * 5 + s.pub * 25;
const rankOf = p => { let i = 0; RANKS.forEach((r, j) => { if (p >= r[1]) i = j; }); const n = RANKS[i + 1]; return { n: RANKS[i][0], nx: n, pr: n ? (p - RANKS[i][1]) / (n[1] - RANKS[i][1]) : 1 }; };
function heroHQ() {
  M(SK());
  guard(async () => {
    const [s, d] = await Promise.all([DB.stats(A.user.id), DB.qa()]), p = pts(s), r = rankOf(p), ver = isVer(), ans = new Set(d.ans.map(a => a.question_id)), open = d.qs.filter(q => !ans.has(q.id) && q.asker_id != A.user.id);
    const med = [['Complete your Senior profile', 'user', true], ['Save a story draft', 'pen', s.drafts + s.pub > 0], ['Submit verification', 'file', !!A.app], ['Get verified', 'award', ver], ['Answer your first question', 'chat', s.ans >= 1], ['Answer five questions', 'trophy', s.ans >= 5], ['Receive a thank-you', 'heart', s.thx >= 1], ['Publish a story', 'book', s.pub >= 1]];
    M(`<div class="hero"><div style="position:relative;flex:1"><p class="lb">Hero HQ</p><h1 class="ht" style="font-size:clamp(30px,4vw,52px);margin-top:8px">${hello()}, <span class="hw">${esc(A.profile.username)}</span></h1><p>${ver ? 'Every answer you give changes someone\'s decision.' : 'Explore everything, save drafts and earn early credits while your verification is reviewed.'}</p>
    <div class="kp"><div><b>${r.n}</b><span>Rank</span></div><div><b>${p}</b><span>Reputation</span></div><div><b>${ver ? 'Verified' : A.profile.verification == 'pending' ? 'In review' : 'Not yet'}</b><span>Status</span></div></div></div>
    <div style="position:relative;min-width:260px;flex:.6"><div class="row sp"><b>${r.nx ? 'Next: ' + r.nx[0] : 'Top rank reached'}</b>${ic('trophy')}</div><div class="pth"><i style="width:${Math.max(6, r.pr * 100)}%"></i></div><p style="font-size:12px">Reputation is earned through contribution. It is recognition, not money.</p></div></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    <div class="card" style="grid-column:1/-1;display:flex;gap:18px;align-items:center;flex-wrap:wrap;background:linear-gradient(135deg,#fff,#e0e7ff)"><div class="ico">${ic(ver ? 'flame' : 'lock')}</div><div style="flex:1;min-width:220px"><p class="lb">${ver ? "Today's mission" : 'Your next step'}</p><h3>${ver ? (open.length ? 'A junior is waiting for your answer' : 'The queue is clear. Share a tip or story.') : 'Verify your profile to unlock answering and publishing'}</h3><p class="mu">${ver ? 'Small answers have a big impact.' : 'It takes a few minutes. You keep exploring while we review.'}</p></div><button class="btn" onclick="${ver ? `nav('${open.length ? 'qa' : 'hub'}')` : 'openVerify()'}">${ver ? (open.length ? 'Answer now' : 'Contribute') : A.profile.verification == 'pending' ? 'View status' : 'Verify now'}</button></div>
    <div class="card" style="grid-column:1/-1"><p class="lb">Hero medals</p><h3 style="margin-top:2px">Earned by contributing, not by clicking</h3><div class="stamps">${med.map(m => `<div class="st ${m[2] ? 'on' : ''}"><div class="c">${ic(m[2] ? 'award' : m[1] == 'user' ? 'users' : m[1])}</div>${m[0]}</div>`).join('')}</div></div>
    <div class="card"><div class="ico">${ic('chat')}</div><h3 style="margin:12px 0 6px">Open questions</h3><p class="mu" style="margin-bottom:12px">${open.length ? 'Abrovians are asking right now.' : 'No open questions at the moment.'}</p>${open.slice(0, 3).map(q => `<div class="mu" style="padding:5px 0;border-bottom:1px solid var(--bd)">${esc(q.body.slice(0, 90))}${q.body.length > 90 ? '…' : ''}</div>`).join('')}<button class="btn s" style="margin-top:12px" onclick="nav('qa')">Open queue</button></div>
    <div class="card"><div class="ico">${ic('heart')}</div><h3 style="margin:12px 0 8px">Your impact</h3><div class="mu" style="line-height:2">Answers given: <b>${s.ans}</b><br>Thank-yous received: <b>${s.thx}</b><br>Stories published: <b>${s.pub}</b><br>Drafts saved: <b>${s.drafts}</b></div></div>
    <div class="card"><div class="ico">${ic('bulb')}</div><h3 style="margin:12px 0 8px">${ver ? 'Keep going' : 'Earn while you wait'}</h3><div class="mu" style="line-height:1.9">${ver ? 'Answer questions, publish your story and host a session to climb the ranks.' : 'Save story drafts for early credits. Everything you write is ready to submit the moment you are verified.'}</div><button class="btn o s" style="margin-top:12px" onclick="nav('hub')">Start contributing</button></div></div>`);
  });
}

/* ---------- SENIOR: Contribute ---------- */
function hub() {
  M(H('Contribute and lead', 'Ways to shape the community. Every action earns reputation.') + `<div class="grid">
  <div class="card"><div class="ico">${ic('book')}</div><h3 style="margin:12px 0 6px">Write your story</h3><p class="mu">Save drafts any time. Submit once verified.</p><button class="btn s" style="margin-top:12px" onclick="storyForm()">Write a story</button></div>
  <div class="card"><div class="ico">${ic('bulb')}</div><h3 style="margin:12px 0 6px">Share a quick tip</h3><textarea id="tip" rows="3" maxlength="600" placeholder="One thing you wish you knew earlier"></textarea><div id="m_tip"></div><button class="btn s" style="margin-top:10px" onclick="tipGo()">Post to community</button></div>
  <div class="card"><div class="ico">${ic('cal')}</div><h3 style="margin:12px 0 6px">Host a live session</h3><p class="mu">Propose a Q&amp;A on a topic you know.</p><button class="btn s" style="margin-top:12px" onclick="sessForm()">Propose a session</button></div>
  <div class="card"><div class="ico">${ic('file')}</div><h3 style="margin:12px 0 6px">Write a guide</h3><p class="mu">Full guides are coming soon. Join the authors list.</p><button class="btn o s" style="margin-top:12px" onclick="ntf('authors')">${A.fi.notify.has('authors') ? 'You are on the authors list' : 'Join the authors list'}</button></div></div>`);
}
async function tipGo() {
  if (gate('Posting tips needs a verified profile.')) return;
  const t = $('#tip').value.trim(); if (t.length < 15 || bad(t)) return $('#m_tip').innerHTML = '<div class="nt e">Share a real tip of at least 15 characters.</div>';
  try { await DB.post(A.user.id, t, 'Senior tip', A.profile.country); $('#tip').value = ''; burst(innerWidth / 2, innerHeight / 3); toast('Tip posted to the community'); } catch (e) { $('#m_tip').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; }
}
function sessForm() {
  if (gate('Hosting sessions needs a verified profile.')) return;
  openM(`<h2 style="font-size:22px;margin-bottom:12px">Propose a live session</h2><div class="fld"><label>Title</label><input id="st1" maxlength="120" placeholder="e.g. Visa interview prep for ${esc(A.profile.country || 'your country')}"></div><div class="fld"><label>Date and time</label><input id="st2" type="datetime-local"></div><div class="fld"><label>Meeting link (optional)</label><input id="st3" type="url" placeholder="https://"></div><div id="m_s"></div><button class="btn" style="width:100%" onclick="sessGo()">Submit for review</button>`, 480);
}
async function sessGo() {
  const t = $('#st1').value.trim(), d = $('#st2').value, l = $('#st3').value.trim();
  if (t.length < 8 || bad(t) || !d || new Date(d) < new Date()) return $('#m_s').innerHTML = '<div class="nt e">Add a clear title and a future date.</div>';
  if (l && !/^https:\/\//i.test(l)) return $('#m_s').innerHTML = '<div class="nt e">Links must start with https://</div>';
  try { await DB.propose({ title: t, kind: 'Webinar', host_id: A.user.id, host_name: A.profile.username, starts_at: new Date(d).toISOString(), link: l || null }); closeM(); toast('Session submitted. The team will confirm.'); } catch (e) { $('#m_s').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; }
}

/* ---------- COMMUNITY ---------- */
let ct = 'feed';
const COMMS = [{ k: 'groups', i: 'users', n: 'Country Groups', d: 'Real-time group chats for every destination. Meet people heading to the same place.', st: 'BUILDING', pr: 45, f: ['Group chat per country', 'Pinned guides from Seniors', 'Find roommates and travel buddies'] }, { k: 'clubs', i: 'target', n: 'Clubs', d: 'Scholarship sprints, SOP review circles, tech and culture clubs with weekly missions.', st: 'DESIGNING', pr: 30, f: ['Weekly club missions', 'Peer SOP feedback', 'Shared accountability'] }, { k: 'chat', i: 'chat', n: 'Private Chat', d: 'Message verified Seniors directly, with safety controls built in.', st: 'BUILDING', pr: 40, f: ['Direct messages', 'Report and block tools', 'Senior availability status'] }];
function community() {
  const T = [['feed', 'Feed'], ['live', 'Live sessions'], ['soon', 'Coming soon']];
  M(H('Community', 'Posts, sessions and what is coming next.') + `<div class="sub">${T.map(t => `<button class="${ct == t[0] ? 'on' : ''}" onclick="ct='${t[0]}';community()">${t[1]}${t[0] == 'soon' ? ' <span class="tag shim" style="margin-left:6px">SOON</span>' : ''}</button>`).join('')}</div><div id="cv">${ct == 'soon' ? '' : SK()}</div>`);
  ({ feed, live, soon: () => { $('#cv').innerHTML = `<div class="nt i" style="margin-bottom:16px">${ic('clock')} Real-time features need careful safety work. We would rather launch them right than fast.</div><div class="grid">${COMMS.map(soonCard).join('')}</div>`; } })[ct]();
}
function feed() {
  guard(async () => {
    const d = await DB.posts(), can = !isSen() || isVer(), p = A.profile;
    const mineR = (id, k) => d.rx.some(r => r.post_id == id && r.user_id == A.user.id && r.kind == k), others = (id, k) => d.rx.some(r => r.post_id == id && r.user_id != A.user.id && r.kind == k);
    $('#cv').innerHTML = `<div class="card" style="margin-bottom:16px"><div class="row" style="align-items:flex-start">${avt(p.username, p.accent)}<div style="flex:1">${can ? `<textarea id="np" rows="2" maxlength="600" placeholder="Share something useful with the community"></textarea><div id="m_np"></div><div class="row sp" style="margin-top:8px"><span class="mu">Be honest. Be kind. No promotion.</span><button class="btn s" onclick="post()">Post</button></div>` : `<p class="mu" style="margin-bottom:8px">Posting unlocks after verification. You can read and react meanwhile.</p><button class="btn o s" onclick="gate('Posting needs a verified profile.')">${ic('lock')}Why?</button>`}</div></div></div>
    <div style="display:grid;gap:14px">${d.ps.map(po => { const w = d.pf[po.author_id] || {}; return `<div class="card"><div class="row sp"><div class="row">${avt(w.username || '?', w.accent, 36)}<div><b>${esc(w.username || 'Member')}</b>${w.verification == 'verified' && w.role == 'senior' ? ` <span class="vb">${ic('check')}Verified Senior</span>` : ''}<div class="mu">${age(po.created_at)}${po.country ? ' · ' + esc(po.country) : ''}</div></div></div><span class="tag">${esc(po.tag)}</span></div><p style="margin:10px 0">${esc(po.body)}</p><div class="row"><button class="rx ${mineR(po.id, 'love') ? 'on' : ''}" onclick="rx('${po.id}','love',${!mineR(po.id, 'love')})">${ic('heart')}Love${others(po.id, 'love') ? ' · others too' : ''}</button><button class="rx ${mineR(po.id, 'helpful') ? 'on' : ''}" onclick="rx('${po.id}','helpful',${!mineR(po.id, 'helpful')})">${ic('thumb')}Helpful${others(po.id, 'helpful') ? ' · others too' : ''}</button>${po.author_id == A.user.id ? `<button class="rx" onclick="delPost('${po.id}')">${ic('x')}Delete</button>` : ''}</div></div>`; }).join('') || empty('chat', 'Be the first to post', 'This community starts with you. Share a tip, a question or something you learned.')}</div>`;
  });
}
async function post() { const t = $('#np').value.trim(); if (t.length < 15 || bad(t)) return $('#m_np').innerHTML = '<div class="nt e">Write a real post of at least 15 characters.</div>'; try { await DB.post(A.user.id, t, isSen() ? 'Senior tip' : 'Post', A.profile.country); toast('Posted'); feed(); } catch (e) { $('#m_np').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; } }
async function rx(id, k, on) { try { await DB.react(id, A.user.id, k, on); if (on) burst(event.clientX, event.clientY); feed(); } catch (e) { toast(nice(e)); } }
async function delPost(id) { if (!confirm('Delete this post?')) return; try { await DB.delPost(id); feed(); } catch (e) { toast(nice(e)); } }
function live() {
  guard(async () => {
    const d = await DB.events(A.user.id), pend = d.mine.filter(e => e.status != 'approved');
    $('#cv').innerHTML = `${isSen() ? `<div style="margin-bottom:14px"><button class="btn s" onclick="sessForm()">${ic('plus')}Propose a session</button></div>` : ''}<div style="display:grid;gap:14px">${d.ev.map(e => `<div class="card row sp wr"><div class="row"><div class="ico" style="width:62px;font-family:var(--df);font-weight:700;font-size:13px;text-align:center;line-height:1.2">${when(e.starts_at)}</div><div><b>${esc(e.title)}</b><div class="mu">Hosted by ${esc(e.host_name)} · ${new Date(e.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span class="tag" style="margin-left:6px">${esc(e.kind)}</span></div></div></div><div class="row">${d.rsvp.has(e.id) && e.link ? `<a class="btn s" style="text-decoration:none" href="${esc(e.link)}" target="_blank" rel="noopener">Join</a>` : ''}<button class="btn ${d.rsvp.has(e.id) ? 'o' : ''} s" onclick="rsvp('${e.id}',${!d.rsvp.has(e.id)})">${d.rsvp.has(e.id) ? 'Registered' : 'Register'}</button></div></div>`).join('') || empty('cal', 'No sessions scheduled yet', isSen() ? 'Verified Seniors can propose the first one.' : 'Seniors are preparing live Q&As. Check back soon.')}
    ${pend.map(e => `<div class="card row sp"><b>${esc(e.title)}</b><span class="tag">${e.status.toUpperCase()}</span></div>`).join('')}</div>`;
  });
}
async function rsvp(id, on) { try { await DB.rsvp(id, A.user.id, on); toast(on ? 'You are registered' : 'Registration cancelled'); live(); } catch (e) { toast(nice(e)); } }

/* ---------- STORIES ---------- */
const FEAT = [{ id: 'f0', t: 'Why Abrovia exists', by: 'HV Shuklaa', tag: 'Founder', src: 'Abrovia', body: 'As a student, the founder was stuck between confusing processes and consultancy advice shaped by commissions. The confusion was not because studying abroad is impossible. It was because someone profited from it. That frustration became Abrovia: a free, unbiased platform built by students. He credits advisor Manas Shukla, who walked away from IIT Delhi to bet on his own path, for the push to stop waiting for the perfect moment.' },
{ id: 'f1', t: 'A DAAD-funded PhD path', by: 'Himanshu Kachroo', tag: 'Germany', src: 'Global Scholarships', url: 'https://globalscholarships.com/scholarship-posts/himanshu-kachroo/', body: 'An IIT Roorkee alumnus pursuing a PhD at IIT Delhi, Himanshu was awarded a DAAD scholarship in 2024 for a research stay at the Helmholtz Institute Freiberg. He says the key was a strong research proposal refined through repeated feedback. His advice: start early, understand what the scholarship is trying to achieve and align your proposal to it. Read his own account at the source.' }];
let stf = 'All';
function stories() {
  M(H('Student stories', 'Real journeys. No sponsored success.', `<button class="btn" onclick="storyForm()">${ic('plus')}Share your story</button>`) + SK());
  guard(async () => {
    const [pub, mine] = await Promise.all([DB.stories(), DB.myStories(A.user.id)]), pf = await DB.profiles(pub.map(s => s.author_id));
    window.STX = [...FEAT, ...pub.map(s => ({ id: s.id, t: s.title, by: (pf[s.author_id] || {}).username || 'Member', tag: s.country || 'Story', body: s.body, src: 'Abrovia community' }))];
    const tags = ['All', ...new Set(window.STX.map(s => s.tag))], L = window.STX.filter(s => stf == 'All' || s.tag == stf), my = mine.filter(s => s.status != 'published');
    M(H('Student stories', 'Real journeys. No sponsored success.', `<button class="btn" onclick="storyForm()">${ic('plus')}Share your story</button>`) + `<div style="margin-bottom:18px">${tags.map(t => `<span class="chip ${stf == t ? 'on' : ''}" onclick="stf='${esc(t)}';stories()">${esc(t)}</span>`).join('')}</div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${L.map(s => `<div class="card pr" onclick="readS('${s.id}')"><div class="row sp"><span class="lb">${esc(s.tag)}</span><span class="tag">${esc(s.src.toUpperCase())}</span></div><h3 style="margin:8px 0">${esc(s.t)}</h3><p class="mu clamp">${esc(s.body)}</p><div class="row" style="margin-top:12px">${avt(s.by, 0, 28)}<span class="mu">${esc(s.by)}</span></div></div>`).join('')}</div>
    ${my.length ? `<p class="lb" style="margin:28px 0 10px">Your drafts and submissions</p><div style="display:grid;gap:10px">${my.map(s => `<div class="card row sp pr" onclick="storyForm('${s.id}')"><b>${esc(s.title)}</b><span class="tag">${s.status.toUpperCase()}</span></div>`).join('')}</div>` : ''}`);
    window.MYS = mine;
  });
}
function readS(id) {
  const s = (window.STX || []).find(x => x.id == id); if (!s) return;
  openM(`<p class="lb">${esc(s.tag)}</p><h2 style="font-size:26px;margin:6px 0 12px">${esc(s.t)}</h2><div class="row" style="margin-bottom:14px">${avt(s.by, 0, 34)}<b>${esc(s.by)}</b></div><p style="line-height:1.8;white-space:pre-line">${esc(s.body)}</p>${s.url ? `<a class="btn o s" style="margin-top:16px;text-decoration:none" href="${s.url}" target="_blank" rel="noopener">${ic('ext')}Read the original</a>` : ''}`, 620);
}
function storyForm(id) {
  const s = id && (window.MYS || []).find(x => x.id == id) || {};
  openM(`<h2 style="font-size:22px;margin-bottom:12px">${s.id ? 'Edit your story' : 'Share your story'}</h2><div class="fld"><label>Title</label><input id="sy1" maxlength="120" value="${esc(s.title || '')}" placeholder="e.g. How I chose Germany on a tight budget"></div>
  <div class="fld"><label>Country (optional)</label><select id="sy3"><option value="">Select</option>${COUNTRIES.map(c => `<option ${s.country == c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
  <div class="fld"><label>Your story</label><textarea id="sy2" rows="7" maxlength="8000" placeholder="What happened, what you learned, what you would do differently">${esc(s.body || '')}</textarea></div><div id="m_y"></div>
  <div class="row"><button class="btn o" onclick="storyGo('draft','${s.id || ''}')">Save draft</button><button class="btn" style="flex:1" onclick="storyGo('pending','${s.id || ''}')">${isSen() && !isVer() ? 'Submit (after verification)' : 'Submit for review'}</button></div>`, 620);
}
async function storyGo(status, id) {
  const t = $('#sy1').value.trim(), b = $('#sy2').value.trim(), c = $('#sy3').value;
  if (t.length < 3 || bad(t)) return $('#m_y').innerHTML = '<div class="nt e">Add a clear title.</div>';
  if (status == 'pending') { if (gate('Submitting stories needs a verified profile. Your draft is safe, so save it now.')) return; if (b.length < 120 || bad(b)) return $('#m_y').innerHTML = '<div class="nt e">A story needs at least a few sentences (120 characters) to be submitted.</div>'; }
  else if (b.length < 1) return $('#m_y').innerHTML = '<div class="nt e">Write something first.</div>';
  try { await DB.saveStory({ ...(id ? { id } : {}), author_id: A.user.id, title: t, body: b, country: c || null, status }); closeM(); toast(status == 'draft' ? 'Draft saved. Early credit earned.' : 'Submitted for review'); if (A.view == 'stories') stories(); } catch (e) { $('#m_y').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; }
}

/* ---------- TOOLKIT ---------- */
function tools() {
  M(H('Toolkit', 'Free tools that work today, and guides on the way.') + `<div class="sub"><button class="${tv == 'tools' ? 'on' : ''}" onclick="tv='tools';tools()">Live tools</button><button class="${tv == 'guides' ? 'on' : ''}" onclick="tv='guides';tools()">Guides and builders <span class="tag shim" style="margin-left:6px">SOON</span></button></div>` + (tv == 'tools' ? `<div class="grid" style="margin-bottom:20px">${TL.map(r => `<div class="card pr" onclick="tool('${r[0]}')"><div class="ico" style="margin-bottom:12px">${ic(r[1])}</div><b>${r[2]}</b><div class="mu">${r[3]}</div></div>`).join('')}</div><div id="tool"></div>` : `<div class="grid">${GUIDES.map(soonCard).join('')}</div>`));
}

/* ---------- MARKET ---------- */
function market() {
  M(H('Marketplace', 'Pass on and pick up essentials within the community.', `<button class="btn" onclick="mkForm()">${ic('plus')}List an item</button>`) + SK());
  guard(async () => {
    const d = await DB.listings();
    M(H('Marketplace', 'Pass on and pick up essentials within the community.', `<button class="btn" onclick="mkForm()">${ic('plus')}List an item</button>`) + (d.rows.length ? `<div class="grid">${d.rows.map(m => { const s = d.pf[m.seller_id] || {}; return `<div class="card"><div class="ico" style="margin-bottom:12px">${ic('bag')}</div><b>${esc(m.title)}</b><div class="mu">${esc(m.city)} · listed by ${esc(s.username || 'member')}</div><div class="row sp" style="margin-top:12px"><b style="color:var(--sd)">${esc(m.price_text)}</b>${m.seller_id == A.user.id ? `<button class="btn o s" onclick="closeL('${m.id}')">Mark sold</button>` : `<button class="btn o s" onclick="contact('${m.id}')">Contact seller</button>`}</div></div>`; }).join('')}</div>` : empty('bag', 'Nothing listed yet', 'Leaving the country? List your desk, books or winter coat for the next Abrovian.', `<button class="btn" onclick="mkForm()">List the first item</button>`)));
    window.LST = d;
  });
}
function contact(id) { const m = window.LST.rows.find(x => x.id == id), s = window.LST.pf[m.seller_id] || {}; openM(`<h2 style="font-size:22px;margin-bottom:8px">${esc(m.title)}</h2><p class="mu" style="margin-bottom:12px">Listed by ${esc(s.username || 'member')} in ${esc(m.city)} for ${esc(m.price_text)}.</p><div class="nt i">${ic('link')} Contact: <b>${esc(m.contact)}</b></div><p class="mu" style="margin-top:12px">Meet in public places and never pay before you have seen the item. Abrovia does not handle payments.</p>`, 460); }
function mkForm() { openM(`<h2 style="font-size:22px;margin-bottom:12px">List an item</h2><div class="fld"><input id="n1" maxlength="80" placeholder="Item name"></div><div class="fld"><input id="n2" maxlength="30" placeholder="Price (e.g. Rs 1,000 or Free)"></div><div class="fld"><input id="n3" maxlength="60" placeholder="City"></div><div class="fld"><input id="n4" maxlength="120" placeholder="How buyers reach you (email, phone or Instagram)"></div><div id="m_l"></div><button class="btn" style="width:100%" onclick="addL()">Publish listing</button>`, 460); }
async function addL() {
  const g = i => $('#n' + i).value.trim(), t = g(1), p = g(2), c = g(3), k = g(4);
  if (t.length < 3 || bad(t) || !p || c.length < 2 || k.length < 5) return $('#m_l').innerHTML = '<div class="nt e">Fill in every field with real details.</div>';
  try { await DB.addListing({ seller_id: A.user.id, title: t, price_text: p, city: c, contact: k }); closeM(); market(); toast('Listing published'); } catch (e) { $('#m_l').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; }
}
async function closeL(id) { try { await DB.closeListing(id); market(); } catch (e) { toast(nice(e)); } }

/* ---------- COMING SOON (persisted interest) ---------- */
const ALLS = [...LAB, ...ACAD, ...GUIDES, ...COMMS, { k: 'authors', n: 'Guide authors', d: '', st: 'SOON', pr: 10, f: ['Write for Abrovia'], i: 'file' }];
const soonCard = x => `<div class="card sc"><div class="row sp"><div class="ico">${ic(x.i)}</div><span class="tag shim">${x.st}</span></div><h3 style="margin:14px 0 6px">${x.n}</h3><p class="mu">${x.d}</p><div class="bar" style="margin:14px 0"><i class="anim" style="width:${x.pr}%"></i></div><div class="row wr"><button class="btn s ${A.fi.notify.has(x.k) ? 'o' : ''}" onclick="ntf('${x.k}')">${A.fi.notify.has(x.k) ? 'On the list' : 'Notify me'}</button><button class="btn o s" onclick="prev('${x.k}')">Preview</button><button class="btn o s" onclick="vt('${x.k}')">${ic('thumb')}${A.fi.vote.has(x.k) ? 'Voted' : 'Vote'}</button></div></div>`;
const redo = () => { const f = { labs, tools, community, hub }[A.view]; if (f) f(); };
async function toggleFi(k, kind) { const set = A.fi[kind], on = !set.has(k); on ? set.add(k) : set.delete(k); redo(); try { await DB.toggleFi(A.user.id, k, kind, on); return on; } catch (e) { on ? set.delete(k) : set.add(k); redo(); toast('Could not save that. Try again.'); } }
async function ntf(k) { const on = await toggleFi(k, 'notify'); if (on) { burst(innerWidth / 2, innerHeight / 2); toast('You will be first to know'); } }
async function vt(k) { const on = await toggleFi(k, 'vote'); if (on) toast('Vote counted. Thank you'); }
function prev(k) {
  const x = ALLS.find(y => y.k == k); if (!x) return;
  openM(`<span class="tag shim">${x.st}</span><h2 style="font-size:26px;margin:10px 0 6px">${x.n}</h2><p class="mu" style="margin-bottom:14px">${x.d}</p>${k == 'ai' ? `<div class="card" style="box-shadow:none;background:var(--sl);display:grid;gap:8px"><div class="m me" style="animation:up .5s .2s both">CGPA 7.4, budget Rs 18 lakh, want an MS in data science. Where should I apply?</div><div class="m" style="animation:up .5s 1.4s both"><b>Abro AI concept</b>I would build a Dream, Match and Safe list across a few countries and show total cost, not just tuition.</div></div><p class="mu" style="margin-top:6px">Concept preview only. Abro AI is not live yet.</p>` : ''}<p class="lb" style="margin:14px 0 6px">What you will get</p>${x.f.map(f => `<div class="row" style="padding:3px 0">${ic('check')}${f}</div>`).join('')}<div class="bar" style="margin:16px 0 6px"><i class="anim" style="width:${x.pr}%"></i></div><p class="mu">Building in public. Early members get access first.</p><button class="btn" style="margin-top:14px" onclick="ntf('${x.k}');closeM()">${A.fi.notify.has(x.k) ? 'You are on the list' : 'Get early access'}</button>`, 560);
}
function labs() {
  const sorted = [...LAB].sort((a, b) => (A.fi.vote.has(b.k)) - (A.fi.vote.has(a.k)));
  M(H('Abrovia Labs', 'Building in public. Vote, preview and shape what ships next.') + `<div class="card glass" style="margin-bottom:20px;display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div class="ico">${ic('spark')}</div><div style="flex:1;min-width:220px"><p class="lb">Founding member</p><b>${A.fi.notify.size ? 'You are on the early access list. Founding members get first access.' : 'Tap Notify me on anything to become a founding member.'}</b></div><div class="row wr">${['Designing', 'Building', 'Testing', 'Live'].map((p, i) => `<span class="chip ${i == 1 ? 'on' : ''}">${p}</span>`).join('')}</div></div>
  <div class="grid">${sorted.map(soonCard).join('')}</div><p class="lb" style="margin:30px 0 10px">Abrovia Academy · Courses</p><div class="grid">${ACAD.map(soonCard).join('')}</div>
  <div class="card" style="margin-top:26px"><h3>Shape the roadmap</h3><p class="mu" style="margin:6px 0 12px">What should we build next? Every idea is read by the team.</p><div class="row"><input id="idea" maxlength="500" placeholder="Your idea"><button class="btn" onclick="idea()">Send</button></div><div id="m_i"></div></div>`);
}
async function idea() { const t = $('#idea').value.trim(); if (t.length < 10 || bad(t)) return $('#m_i').innerHTML = '<div class="nt e">Describe your idea in a sentence or two.</div>'; try { await DB.idea(A.user.id, t); $('#idea').value = ''; $('#m_i').innerHTML = '<div class="nt i">Sent to the team. Thank you!</div>'; } catch (e) { $('#m_i').innerHTML = `<div class="nt e">${esc(nice(e))}</div>`; } }
boot();
