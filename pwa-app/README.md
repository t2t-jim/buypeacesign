# BuyPeaceSign PWA

Market-test Next.js (App Router) + TypeScript Progressive Web App for BuyPeaceSign (buypeacesign.com).

**Mode:** pre-order / early-access interest only. **No prices. No checkout. No fake pay.**

Email capture is the product until inventory ships. Logo A (neon teal to violet peace) is the brand mark and PWA icon set.

---

## Quick start

```bash
cd pwa-app
npm install
npm run dev
npm run build
npm start
```

| Script | What |
|---|---|
| npm run dev | Local Next.js dev server |
| npm run build | Production build (must succeed before deploy) |
| npm start | Run production server locally |


---

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing + primary Pre-order yours today form |
| `/configure` | Size then hex color + live SVG glow preview |
| `/configure/review` | Summary (no price) then pre-order with size+hex |
| `/preorder` | Standalone / deep-link pre-order form |
| `/account` | Auth stub (provider TBD) |
| `/install` | Soft PWA install tip |
| `/api/waitlist` | POST waitlist capture |
| `/checkout` | Redirects to `/preorder` (no commerce) |

**Primary flow:** `/` then Pre-order yours today then success  
**Secondary:** Design yours then size then color then review then Pre-order this design (size + hex attached)

Prep kit consumed from `BuyPeaceSign/pwa/prep/`:
- `content/copy.ts`, `content/swatches.ts`
- `contracts/waitlist.ts` to `src/lib/waitlist.ts`
- `stubs/*.tsx` to `src/components/`
- Icons to `public/icons/`; Logo A to `public/brand/logo-a-neon-glow.png`


---

## Waitlist API (demo)

`POST /api/waitlist` accepts JSON:

```json
{
  "email": "you@example.com",
  "firstName": "Jim",
  "sizeInterest": "36",
  "hex": "#7CB7FF",
  "source": "landing"
}
```

- Validates email; sets `createdAt` server-side.
- Appends JSON lines to **`data/waitlist.jsonl`** when the filesystem allows.
- Also keeps an in-memory list for the running process.
- On read-only hosts (some serverless), falls back to `/tmp` then memory-only.

### Upgrading later (before real traffic)

| Option | Notes |
|---|---|
| Vercel Blob or KV (free tier) | Durable on Hobby; replace file append in `src/app/api/waitlist/route.ts` |
| Neon / Postgres free | Structured queries + export |
| Resend free tier | Email notify on each signup |

**Env vars (future):** `WAITLIST_BLOB_TOKEN`, `DATABASE_URL`, `RESEND_API_KEY` — none required for demo file/memory backend.

Never collect payment fields here.

---

## PWA

- Manifest: `public/manifest.webmanifest` (night indigo theme `#0B0B14`)
- Service worker: `public/sw.js` (manual precache; registered by `ServiceWorkerRegister`)
- Icons: Logo A set under `public/icons/` + `public/apple-touch-icon.png`
- Soft install prompt after successful pre-order; tip page at `/install`
- HTTPS via Vercel TLS (required for installability)

Manual SW keeps Hobby builds clean (no next-pwa webpack plugin). Swap in Workbox later if needed.


---

## Deploy to Vercel Hobby (locked host)

Jim is on **Vercel Hobby (free)**. Domain stays at **GoDaddy** — do not move the registrar. App does not run on GoDaddy shared hosting.

### 1. Upload to GitHub

Suggested repo: `https://github.com/t2t-jim/buypeacesign`

How Jim should upload:

1. Unzip `buypeacesign-pwa.zip` (excludes node_modules and .next).
2. Create (or open) GitHub repo `t2t-jim/buypeacesign`.
3. Either:
   - **Web UI:** drag the unzipped files into the repo, or
   - **CLI:**

```bash
cd pwa-app
git init
git add .
git commit -m "feat: BuyPeaceSign market-test PWA (Next.js App Router)"
git branch -M main
git remote add origin https://github.com/t2t-jim/buypeacesign.git
git push -u origin main
```

### 2. Import on Vercel

1. vercel.com → Add New Project → import `t2t-jim/buypeacesign`
2. Framework preset: Next.js (auto)
3. Root directory: repo root (or `pwa-app` if monorepo)
4. Build command: `npm run build`
5. Deploy — you get `*.vercel.app` immediately

### 3. GoDaddy DNS to Vercel

Keep **buypeacesign.com** at GoDaddy. In Vercel: Project → Settings → Domains → add `buypeacesign.com` and `www.buypeacesign.com`. Then in GoDaddy DNS:

| Type | Name | Value | Notes |
|---|---|---|---|
| CNAME | www | cname.vercel-dns.com (or exact target Vercel shows) | www to Vercel |
| A | @ (apex) | 76.76.21.21 (confirm in current Vercel docs) | bare domain |

- Do not use GoDaddy forwarding-only if you want proper HTTPS + PWA.
- After DNS propagates, Vercel issues TLS automatically.
- Prefer the exact A/CNAME values shown in the Vercel Domains UI.

Folded from `pwa/DEPLOY_NOTES.md` (Jamie/Jim lock 2026-09-04).

---

## Brand / UX locks (do not reopen for v1)

- Price hidden; no cart / Stripe / instant purchase CTAs
- Hero CTA: Pre-order yours today
- Configurator enriches the same waitlist
- Night indigo shell; teal to violet accents (Logo A)
- Auth: stub only

See parent docs: `pwa/UX_FLOW_AND_COPY_v1.md`, `pwa/BRAND_TOKENS.md`, `pwa/DEPLOY_NOTES.md`.

---

## Project layout

```
pwa-app/
  public/
    brand/logo-a-neon-glow.png
    icons/  manifest.webmanifest  sw.js
  src/
    app/            # App Router pages + api/waitlist
    components/     # SiteHeader, PreorderForm, preview, configure
    content/        # copy.ts, swatches.ts (prep kit)
    lib/waitlist.ts # contract + validators (prep kit)
  data/waitlist.jsonl
  README.md

```

---

*BuyPeaceSign · market-test PWA v1.1 · 2026-09-04*
