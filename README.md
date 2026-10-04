# Abrovia — launch package

A static web app (no build step) backed by **Supabase** (auth, Postgres, storage).
Folder layout (all files sit together in the repo root, no sub-folders):

```
index.html (landing)   app.html (the app)   admin.html   privacy.html   terms.html
styles.css   config.js   db.js   core.js   tools.js   app.js   admin.js
logo.jpg   manifest.webmanifest   robots.txt   vercel.json   schema.sql
```

## 1. Create the Supabase project (10 minutes)
1. Go to supabase.com, create a project, and wait for it to finish provisioning.
2. **SQL Editor > New query**, paste all of `schema.sql`, click **Run**. It creates tables, security policies, triggers, the private `proofs` storage bucket and the verification functions.
3. **Project Settings > API**: copy the **Project URL** and the **anon public key** into `config.js`. (The anon key is meant to be public. Row Level Security protects the data. Never put the `service_role` key in these files.)
4. **Authentication > URL Configuration**: set **Site URL** to your live address (e.g. `https://abrovia.in`) and add it under **Redirect URLs**. Add `http://localhost:8080` too if you test locally.
5. **Authentication > Providers > Email**: keep Email enabled. Decide on **Confirm email** (recommended ON for launch; the app handles both).
6. **Authentication > SMTP Settings**: add a real SMTP provider (Resend, Brevo, Postmark, etc.) before launch. Supabase's built-in mailer is heavily rate-limited and will block signups at scale.

## 2. Make yourself admin
Sign up in the app with your own account, then in the SQL editor run:
```sql
update public.profiles set is_admin = true where lower(username) = lower('YOUR_USERNAME');
```
Open `/admin.html` (or `/admin`) to review Senior applications (including viewing uploaded proofs), publish stories, approve sessions and create events.

## 3. Deploy
**How visitors flow:** `abrovia.in` (index.html, landing page) -> every "Start for Free" button opens `app.html` on the **Sign up** tab; every "Log in" button opens `app.html?mode=login`. There are no waitlist forms or Google Forms anymore.

**Vercel + Git:** push all these files to the root of your GitHub repo (no sub-folders). In Vercel, Framework Preset = Other, no build command, output directory = root (blank). In Supabase set Site URL to `https://abrovia.in` and add `https://abrovia.in/app.html` to Redirect URLs.

Any static host works. Easiest options:
- **Netlify**: drag the whole folder onto app.netlify.com/drop. Add your domain in Domain settings.
- **Vercel / Cloudflare Pages / GitHub Pages**: point at this folder, no build command, publish directory is the root.

Then point `abrovia.in` at the host (their dashboard shows the DNS records) and make sure the Supabase Site URL matches.

## 4. Pre-launch checklist
- [ ] Sign up as an Abrovian, finish onboarding, stamp a milestone, ask a question
- [ ] Sign up as a Senior, confirm you land on Hero HQ without verification, save a story draft, submit verification with a PDF
- [ ] In `/admin.html` approve the Senior, then log in as the Senior and answer the question
- [ ] As the Abrovian, thank the answer
- [ ] Password reset email arrives and the link returns to the app
- [ ] Privacy and Terms pages reviewed by a lawyer; confirm the support email in `config.js`
- [ ] Custom SMTP set up; Supabase **Auth > Rate limits** reviewed
- [ ] Enable Supabase **daily backups** (Pro plan) before real users arrive

## How things work
**Roles.** Users choose Abrovian or Abrovia Senior once. The database blocks role changes afterwards.

**Senior approval.** Seniors log in and reach Hero HQ immediately. A banner invites them to verify (LinkedIn, university email, proof of enrolment, bio, pledge). Status moves `none > pending > verified` (or `needs_info` / `rejected` with a note). Unverified Seniors can explore everything, save story drafts and earn early reputation credits. Answering questions, publishing stories, posting tips and proposing sessions unlock on verification. This is enforced in the database (row level security), not just in the UI. Verification can only be changed through the `review_application` function, which only admins can call.

**Reputation.** Points come from real activity (profile, drafts, application, verification, answers, thank-yous, published stories). It is recognition, not money. Abrovia stays zero-commission.

**Private data.** Onboarding answers, applications and proofs are readable only by their owner and admins.

## Real vs coming soon
Working now: sign up / log in / reset, smart onboarding, personalised passport, Ask-a-Senior Q&A with thank-yous, verified Senior directory, community feed, live sessions (admin approved) with RSVP, stories with moderation, marketplace, all toolkit tools, Senior verification and admin console, persistent Notify/Vote/ideas.

Marked **Coming soon** (they need real-time infrastructure and moderation tooling): country groups, clubs, private chat, guides, SOP Builder, Uni Shortlister, Abro AI, Academy courses and the rest of Labs. Supabase Realtime can power chat later without changing providers.

## Known limits
- Search by username/university in the Senior directory is client-side (fine up to a few hundred Seniors).
- Account deletion is by email request (self-service deletion needs a Supabase Edge Function with the service role key).
- Marketplace has no payments; buyers contact sellers directly.
- Guidance on visa/fee rules in the app is informational and tells users to verify on official sites. Review the copy periodically.
