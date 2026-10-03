/* Abrovia data layer: every Supabase call lives here. */
const CFG = window.ABROVIA || {};
const sb = (window.supabase && CFG.url && CFG.anon && !/YOUR_/.test(CFG.url + CFG.anon))
  ? window.supabase.createClient(CFG.url, CFG.anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;
const ok = r => { if (r.error) throw r.error; return r.data; };
const nice = e => {
  const m = (e && e.message) || 'Something went wrong';
  if (/Invalid login/i.test(m)) return 'Email or password is incorrect.';
  if (/not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox.';
  if (/already registered|already been registered/i.test(m)) return 'That email already has an account. Try logging in.';
  if (/duplicate key|profiles_username_lower/i.test(m)) return 'That username was just taken. Try another.';
  if (/row-level security/i.test(m)) return 'You do not have permission to do that yet.';
  if (/rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a minute and try again.';
  return m;
};
const DB = {
  on: !!sb,
  listen(fn) { sb.auth.onAuthStateChange((ev, s) => fn(ev, s)); },
  async session() { return ok(await sb.auth.getSession()).session; },
  async nameFree(u) { return ok(await sb.rpc('username_available', { u })); },
  async signUp(email, password, username, accent) {
    const r = await sb.auth.signUp({ email, password, options: { data: { username, accent }, emailRedirectTo: location.origin + location.pathname } });
    if (r.error) throw r.error; return r.data;
  },
  async signIn(email, password) { const r = await sb.auth.signInWithPassword({ email, password }); if (r.error) throw r.error; return r.data; },
  async signOut() { await sb.auth.signOut(); },
  async reset(email) { const r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }); if (r.error) throw r.error; },
  async setPassword(p) { const r = await sb.auth.updateUser({ password: p }); if (r.error) throw r.error; },
  async profile(id) { return ok(await sb.from('profiles').select('*').eq('id', id).maybeSingle()); },
  async profiles(ids) {
    ids = [...new Set(ids)].filter(Boolean); if (!ids.length) return {};
    const rows = ok(await sb.from('profiles').select('id,username,accent,university,country,role,verification').in('id', ids));
    return Object.fromEntries(rows.map(r => [r.id, r]));
  },
  async updateProfile(id, f) { return ok(await sb.from('profiles').update(f).eq('id', id).select().single()); },
  async ob(id) { const r = ok(await sb.from('onboarding').select('answers').eq('user_id', id).maybeSingle()); return r ? r.answers : {}; },
  async saveOb(id, answers) { ok(await sb.from('onboarding').upsert({ user_id: id, answers, updated_at: new Date().toISOString() })); },
  async stamps(id) { return new Set(ok(await sb.from('stamps').select('key').eq('user_id', id)).map(r => r.key)); },
  async stamp(id, key, on) { on ? ok(await sb.from('stamps').upsert({ user_id: id, key })) : ok(await sb.from('stamps').delete().eq('user_id', id).eq('key', key)); },
  async fi(id) {
    const rows = ok(await sb.from('feature_interest').select('feature_key,kind').eq('user_id', id));
    return { notify: new Set(rows.filter(r => r.kind == 'notify').map(r => r.feature_key)), vote: new Set(rows.filter(r => r.kind == 'vote').map(r => r.feature_key)) };
  },
  async toggleFi(id, key, kind, on) { on ? ok(await sb.from('feature_interest').upsert({ user_id: id, feature_key: key, kind })) : ok(await sb.from('feature_interest').delete().eq('user_id', id).eq('feature_key', key).eq('kind', kind)); },
  async idea(id, body) { ok(await sb.from('ideas').insert({ user_id: id, body })); },
  async seniors() { return ok(await sb.from('profiles').select('*').eq('role', 'senior').eq('verification', 'verified').order('created_at', { ascending: false }).limit(100)); },
  async qa() {
    const qs = ok(await sb.from('questions').select('*').order('created_at', { ascending: false }).limit(60));
    const ans = qs.length ? ok(await sb.from('answers').select('*').in('question_id', qs.map(q => q.id)).order('created_at')) : [];
    const th = ans.length ? ok(await sb.from('thanks').select('answer_id,user_id').in('answer_id', ans.map(a => a.id))) : [];
    const pf = await DB.profiles([...qs.map(q => q.asker_id), ...qs.map(q => q.to_senior), ...ans.map(a => a.senior_id)]);
    return { qs, ans, th, pf };
  },
  async ask(asker, to, topic, body) { ok(await sb.from('questions').insert({ asker_id: asker, to_senior: to || null, topic, body })); },
  async answer(qid, sid, body) { ok(await sb.from('answers').insert({ question_id: qid, senior_id: sid, body })); },
  async thank(aid, uid, on) { on ? ok(await sb.from('thanks').insert({ answer_id: aid, user_id: uid })) : ok(await sb.from('thanks').delete().eq('answer_id', aid).eq('user_id', uid)); },
  async stats(uid) {
    const ans = ok(await sb.from('answers').select('id').eq('senior_id', uid));
    const th = ans.length ? ok(await sb.from('thanks').select('answer_id').in('answer_id', ans.map(a => a.id))) : [];
    const st = ok(await sb.from('stories').select('id,status').eq('author_id', uid));
    return { ans: ans.length, thx: th.length, pub: st.filter(s => s.status == 'published').length, drafts: st.filter(s => s.status == 'draft').length };
  },
  async stories() { return ok(await sb.from('stories').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(60)); },
  async myStories(uid) { return ok(await sb.from('stories').select('*').eq('author_id', uid).order('updated_at', { ascending: false })); },
  async saveStory(row) { const r = { ...row, updated_at: new Date().toISOString() }; return r.id ? ok(await sb.from('stories').update(r).eq('id', r.id).select().single()) : ok(await sb.from('stories').insert(r).select().single()); },
  async posts() {
    const ps = ok(await sb.from('posts').select('*').order('created_at', { ascending: false }).limit(50));
    const rx = ps.length ? ok(await sb.from('post_reactions').select('post_id,user_id,kind').in('post_id', ps.map(p => p.id))) : [];
    return { ps, rx, pf: await DB.profiles(ps.map(p => p.author_id)) };
  },
  async post(uid, body, tag, country) { ok(await sb.from('posts').insert({ author_id: uid, body, tag, country: country || null })); },
  async delPost(id) { ok(await sb.from('posts').delete().eq('id', id)); },
  async react(pid, uid, kind, on) { on ? ok(await sb.from('post_reactions').insert({ post_id: pid, user_id: uid, kind })) : ok(await sb.from('post_reactions').delete().eq('post_id', pid).eq('user_id', uid).eq('kind', kind)); },
  async listings() { const r = ok(await sb.from('listings').select('*').eq('active', true).order('created_at', { ascending: false }).limit(80)); return { rows: r, pf: await DB.profiles(r.map(x => x.seller_id)) }; },
  async addListing(row) { ok(await sb.from('listings').insert(row)); },
  async closeListing(id) { ok(await sb.from('listings').update({ active: false }).eq('id', id)); },
  async events(uid) {
    const since = new Date(Date.now() - 864e5).toISOString();
    const ev = ok(await sb.from('events').select('*').eq('status', 'approved').gte('starts_at', since).order('starts_at'));
    const rs = ok(await sb.from('event_rsvps').select('event_id').eq('user_id', uid));
    const mine = ok(await sb.from('events').select('*').eq('host_id', uid).order('created_at', { ascending: false }));
    return { ev, rsvp: new Set(rs.map(r => r.event_id)), mine };
  },
  async rsvp(eid, uid, on) { on ? ok(await sb.from('event_rsvps').insert({ event_id: eid, user_id: uid })) : ok(await sb.from('event_rsvps').delete().eq('event_id', eid).eq('user_id', uid)); },
  async propose(row) { ok(await sb.from('events').insert({ ...row, status: 'pending' })); },
  async myApp(uid) { return ok(await sb.from('senior_applications').select('*').eq('user_id', uid).maybeSingle()); },
  async upload(uid, file) {
    const path = `${uid}/${Date.now()}-${file.name.replace(/[^A-Za-z0-9._-]/g, '_')}`;
    const r = await sb.storage.from('proofs').upload(path, file, { contentType: file.type }); if (r.error) throw r.error; return path;
  },
  async submitApp(a) { ok(await sb.rpc('submit_senior_application', { p_linkedin: a.li, p_email: a.em, p_proof: a.path || null, p_instagram: a.ig || '', p_bio: a.bio, p_motivation: a.why })); },
  /* admin */
  async adminApps(status) { const rows = ok(await sb.from('senior_applications').select('*').eq('status', status).order('submitted_at')); return { rows, pf: await DB.profiles(rows.map(r => r.user_id)) }; },
  async signedUrl(path) { const r = await sb.storage.from('proofs').createSignedUrl(path, 300); if (r.error) throw r.error; return r.data.signedUrl; },
  async review(uid, decision, note) { ok(await sb.rpc('review_application', { p_user: uid, p_decision: decision, p_note: note || null })); },
  async adminStories() { const r = ok(await sb.from('stories').select('*').eq('status', 'pending').order('updated_at')); return { rows: r, pf: await DB.profiles(r.map(x => x.author_id)) }; },
  async setStory(id, status) { ok(await sb.from('stories').update({ status }).eq('id', id)); },
  async adminEvents() { return ok(await sb.from('events').select('*').order('starts_at', { ascending: false }).limit(50)); },
  async setEvent(id, status) { ok(await sb.from('events').update({ status }).eq('id', id)); },
  async newEvent(row) { ok(await sb.from('events').insert({ ...row, status: 'approved' })); }
};
