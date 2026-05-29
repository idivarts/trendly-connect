# CLAUDE.md — trendly-connect

> **⚠️ Read the monorepo root before going further.**
> This file covers only `trendly-connect`-specific detail. For the complete picture
> of the entire Trendly platform — every micro-repo, shared architecture,
> domain model, auth flow, contract lifecycle, Notion preferences, and more —
> read the parent first:
>
> - **Full monorepo context**: `../CLAUDE.md`
> - **Knowledge graph** (keyword → exact file path, token-efficient lookups): `../.claude/knowledge-graph.json`
>
> When working across repos (e.g. this site + backend OAuth endpoints), always
> load `../CLAUDE.md` so you have the full picture before touching any code.

---

## What this project is

`trendly-connect` is a **Next.js 14 static-export micro-site** that serves as
the **OAuth social-connection bridge** for the Trendly platform.

When a user inside `trendly-users` or `trendly-brands` wants to connect a
social media account (Instagram, Facebook, YouTube, LinkedIn, Twitter/X), the
mobile app opens this web page. The page:

1. Receives the user's Firebase JWT and context via query params
2. Shows a platform picker (or skips straight to a single platform)
3. Redirects the user to the backend's OAuth initiation endpoint
4. Handles the success/error redirect from the backend
5. Deep-links the user back into the originating mobile app

**Live URLs**
- Prod: `https://connect.trendly.now`
- Dev: `https://dev.connect.trendly.now`

---

## Tech stack

- **Next.js 14** (App Router) with TypeScript — static export (`output: 'export'`)
- **Tailwind CSS 3** with a custom dark theme (see Design Tokens below)
- **No external UI library** — all components are hand-rolled
- **Fonts**: Inter (body / `font-sans`), Plus Jakarta Sans (display / `font-display`)
- **Deploy**: Serverless Lift → S3 + CloudFront (`serverless.yaml`)

---

## Route map

```
/                          → redirects to /connect (app/page.tsx)
/connect                   → main connect UI      (app/connect/page.tsx)
/connect/success           → success screen       (app/connect/success/page.tsx)
/connect/error             → error screen         (app/connect/error/page.tsx)
```

### `/connect` — query params

| Param | Required | Description |
|---|---|---|
| `token` | ✅ | Firebase JWT identifying the logged-in user |
| `app` | ✅ | `users` or `brands` — which app is initiating |
| `callbackScheme` | ✅ | Deep-link scheme (`trn-users`) or `https://` prefix to return to |
| `platform` | ❌ | Pre-select a platform — skips the picker entirely |
| `stage` | ❌ | `dev` to route to the dev backend; auto-detected from hostname too |
| `brandId` | ❌ | Brand ID when connecting a social to a brand account |

### `/connect/success` and `/connect/error` — params

Both pages receive params forwarded from the backend redirect:
`platform`, `callbackScheme`, `app`, and (error only) `message`.

---

## Key files

```
trendly-connect/
├── app/
│   ├── layout.tsx                    # Root layout — dark bg, font setup, metadata
│   ├── page.tsx                      # Root → redirect to /connect
│   └── connect/
│       ├── page.tsx                  # ⭐ Main connect UI (platform picker + single-platform flow)
│       ├── success/page.tsx          # Success screen — auto-redirects back to app after 2.5s
│       └── error/page.tsx            # Error screen — retry + go-back-to-app buttons
├── components/
│   ├── Logo.tsx                      # Trendly wordmark SVG
│   └── PlatformIcon.tsx              # Social platform SVG icons (Instagram, FB, YT, LI, TW)
├── lib/
│   ├── platforms.ts                  # ⭐ Platform definitions — keys, labels, colors, scopes
│   └── config.ts                     # ⭐ URL builders: buildAuthInitURL, buildCallbackURL
├── serverless.yaml                   # Serverless Lift static-site deploy config
├── export.sh                         # next build + export
└── deploy-s3.sh                      # Upload out/ to S3 + invalidate CloudFront
```

---

## Platform definitions (`lib/platforms.ts`)

Supported platforms and their `PlatformKey`:

| Key | Label | Status |
|---|---|---|
| `instagram` | Instagram | Active |
| `facebook` | Facebook | Active |
| `youtube` | YouTube | Active |
| `linkedin` | LinkedIn | Active |
| `twitter` | Twitter / X | Active |

To add a new platform: add its entry to `PLATFORMS` and `PLATFORM_ORDER` in
`lib/platforms.ts`, then add its SVG icon case to `components/PlatformIcon.tsx`.

---

## URL flow

```
Mobile app
  └─→ connect.trendly.now/connect?token=JWT&app=users&callbackScheme=trn-users&platform=instagram
        └─→ POST https://be.trendly.now/connect/instagram?token=...  (backend validates + stores state)
              └─→ Instagram OAuth consent screen
                    └─→ https://be.trendly.now/instagram/callback  (backend exchanges code + saves token)
                          └─→ connect.trendly.now/connect/success?platform=instagram&callbackScheme=trn-users
                                └─→ trn-users://social-connected?platform=instagram&status=success  (deep link)
```

The backend OAuth initiation endpoint lives in `backend-sls` at:
`internal/trendlyapis/unauth_apis/instagram.go` (Instagram/Facebook) and
similar files for other platforms. See `../CLAUDE.md` or the knowledge graph
for exact paths.

---

## Design tokens

Dark-theme design system. **Never use hardcoded hex values** — always reference
these Tailwind tokens.

| Token | Value | Use |
|---|---|---|
| `ink-900` | `#0b1020` | Page background |
| `ink-800` | `#101935` | Elevated surfaces |
| `brand-500` | `#3b82f6` | Primary blue (CTA, selection ring) |
| `brand-600` | `#2563eb` | Hover / pressed |
| `accent-500` | `#06b6d4` | Cyan accent |

**Utility classes** (defined in `app/globals.css`):
- `glass-card` — frosted glass card with white/10 border
- `btn-primary` — solid brand-500 button
- `btn-ghost` — ghost/outline button
- `animate-fade-up` — fade + slide up on mount
- `animate-scale-in` — scale in on mount
- `shadow-glow` — branded blue glow shadow

---

## How to run

```bash
# Install dependencies
npm install

# Local dev server (http://localhost:3000)
npm run dev

# Production build + static export (writes to out/)
./export.sh

# Deploy to S3 + CloudFront
./deploy-s3.sh

# Full Serverless deploy (builds + deploys infra)
sls deploy --stage dev --config serverless.yaml    # dev
sls deploy --stage prod --config serverless.yaml   # prod
```

---

## Where to look for what

| Task | File(s) |
|---|---|
| Add/edit a platform | `lib/platforms.ts`, `components/PlatformIcon.tsx` |
| Change backend URL or build callback URLs | `lib/config.ts` |
| Edit the connect/picker UI | `app/connect/page.tsx` |
| Edit the success screen | `app/connect/success/page.tsx` |
| Edit the error screen | `app/connect/error/page.tsx` |
| Change fonts, base styles, global CSS | `app/globals.css`, `tailwind.config.ts` |
| Change page metadata / favicon | `app/layout.tsx` |
| Change deploy config / domains | `serverless.yaml` |
| Backend OAuth handler (Go) | `../backend-sls/internal/trendlyapis/unauth_apis/` |
