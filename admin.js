/* Abrovia admin console: verification, story moderation, events. Requires profiles.is_admin = true. */
let AT = 'apps', AS = 'pending';
const box = h => { $('#ad').innerHTML = h; };
const lock = m => { document.body.innerHTML = `<div class="form"><div class="card" style="max-width:480px;text-align:center"><div class="ico" style="margin:0 auto 12px">${ic('shield')}</div><h3>Abrovia admin</h3><p class="mu" style="margin:8px 0 14px">${m}</p><a class="btn" style="text-decoration:none" href="app.html">Go to the app</a></div></div>`; };
async function bootAdmin() {
  if (!DB.on) return lock('Configure config.js first.');
  const s = await DB.session(); if (!s) return lock('Log in on the main app with your admin account first.');
  const p = await DB.profile(s.user.id); if (!p || !p.is_admin) return lock('This account is not an admin.');
  drawAdmin();
}
function drawAdmin() {
  const T = [['apps', 'Verifications'], ['stories', 'Stories'], ['events', 'Events']];
  $('#root').innerHTML = `<nav class="top"><div class="ti"><img class="lg" src="logo.jpg" alt="Abrovia"><span class="tag">ADMIN</span><a class="btn o s" style="text-decoration:none" href="app.html">Back to app</a></div></nav><main class="main"><div class="hd"><h1>Admin <span class="hw">console</span></h1></div><div class="sub">${T.map(t => `<button class="${AT == t[0] ? 'on' : ''}" onclick="AT='${t[0]}';drawAdmin()">${t[1]}</button>`).join('')}</div><div id="ad"><div class="card sk"></div></div></main>`;
  ({ apps: adApps, stories: adStories, events: adEvents })[AT]().catch(e => box(`<div class="nt e">${esc(nice(e))}</div>`));
}
async function adApps() {
  const d = await DB.adminApps(AS);
  box(`<div class="sub">${['pending', 'needs_info', 'rejected', 'verified'].map(s => `<button class="${AS == s ? 'on' : ''}" onclick="AS='${s}';adApps()">${s.replace('_', ' ')}</button>`).join('')}</div><div style="display:grid;gap:14px">${d.rows.map(a => { const u = d.pf[a.user_id] || {}, li = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[\w\-%]+\/?$/i.test(a.linkedin); return `<div class="card"><div class="row sp wr"><div class="row">${avt(u.username || '?', u.accent)}<div><b>${esc(u.username)}</b><div class="mu">${esc(u.university || '')} · ${esc(u.country || '')}</div></div></div><span class="tag">${a.status.toUpperCase()}</span></div>
  <div class="mu" style="margin:12px 0;line-height:1.9">LinkedIn: ${li ? `<a href="${esc(a.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(a.linkedin)}</a>` : esc(a.linkedin)}<br>University email: <b>${esc(a.uni_email)}</b><br>Other: ${esc(a.instagram || 'none')}<br>Submitted ${new Date(a.submitted_at).toLocaleString()}</div>
  <p><b>Bio</b><br>${esc(a.bio)}</p><p style="margin-top:8px"><b>Why mentor</b><br>${esc(a.motivation)}</p>
  <div class="row wr" style="margin:12px 0">${a.proof_path ? `<button class="btn o s" onclick="proof('${esc(a.proof_path)}')">${ic('file')}View proof</button>` : '<span class="nt w" style="margin:0">No proof uploaded</span>'}</div>
  <textarea id="nt_${a.user_id}" rows="2" placeholder="Note to the applicant (required for Needs info or Reject)"></textarea>
  <div class="row wr" style="margin-top:10px"><button class="btn s" onclick="decide('${a.user_id}','verified')">Approve</button><button class="btn o s" onclick="decide('${a.user_id}','needs_info')">Needs info</button><button class="btn o s" onclick="decide('${a.user_id}','rejected')">Reject</button></div></div>`; }).join('') || empty('check', 'Nothing here', 'No applications with this status.')}</div>`);
}
async function proof(path) { try { window.open(await DB.signedUrl(path), '_blank', 'noopener'); } catch (e) { toast(nice(e)); } }
async function decide(uid, dec) {
  const n = $('#nt_' + uid).value.trim();
  if (dec != 'verified' && n.length < 5) return toast('Add a short note for the applicant');
  try { await DB.review(uid, dec, n); toast('Saved'); adApps(); } catch (e) { toast(nice(e)); }
}
async function adStories() {
  const d = await DB.adminStories();
  box(`<div style="display:grid;gap:14px">${d.rows.map(s => `<div class="card"><div class="row sp wr"><b>${esc(s.title)}</b><span class="tag">${esc((d.pf[s.author_id] || {}).username || '')}</span></div><p style="margin:10px 0;white-space:pre-line">${esc(s.body)}</p><div class="row"><button class="btn s" onclick="setS('${s.id}','published')">Publish</button><button class="btn o s" onclick="setS('${s.id}','rejected')">Reject</button></div></div>`).join('') || empty('check', 'Nothing to review', 'No stories are waiting.')}</div>`);
}
async function setS(id, st) { try { await DB.setStory(id, st); toast('Saved'); adStories(); } catch (e) { toast(nice(e)); } }
async function adEvents() {
  const ev = await DB.adminEvents();
  box(`<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:10px">Create an approved session</h3><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))"><input id="e1" placeholder="Title (min 8 characters)"><input id="e2" placeholder="Host name"><input id="e3" type="datetime-local"><input id="e4" placeholder="Meeting link (https://)"></div><button class="btn s" style="margin-top:12px" onclick="mkEv()">Publish session</button></div>
  <div style="display:grid;gap:12px">${ev.map(e => `<div class="card row sp wr"><div><b>${esc(e.title)}</b><div class="mu">${esc(e.host_name)} · ${new Date(e.starts_at).toLocaleString()}</div></div><div class="row"><span class="tag">${e.status.toUpperCase()}</span>${e.status == 'pending' ? `<button class="btn s" onclick="setE('${e.id}','approved')">Approve</button><button class="btn o s" onclick="setE('${e.id}','rejected')">Reject</button>` : ''}</div></div>`).join('') || empty('cal', 'No sessions yet', 'Create the first one above.')}</div>`);
}
async function mkEv() {
  const t = $('#e1').value.trim(), h = $('#e2').value.trim(), d = $('#e3').value, l = $('#e4').value.trim();
  if (t.length < 8 || !h || !d) return toast('Title, host and date are required');
  if (l && !/^https:\/\//i.test(l)) return toast('Link must start with https://');
  try { await DB.newEvent({ title: t, kind: 'Webinar', host_name: h, starts_at: new Date(d).toISOString(), link: l || null }); toast('Published'); adEvents(); } catch (e) { toast(nice(e)); }
}
const empty = (i, t, s) => `<div class="card empty"><div class="ico">${ic(i)}</div><h3>${t}</h3><p class="mu">${s}</p></div>`;
bootAdmin();
