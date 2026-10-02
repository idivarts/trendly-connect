/**
 * PostHog configuration for the connect bridge.
 *
 * Values come from the build env because NEXT_PUBLIC_* is inlined at build
 * time — a static export (output: 'export') has no server to read them later.
 *
 * ⚠️ Do NOT derive the stage from `NODE_ENV` the way lib/config.ts does.
 * `next build` sets NODE_ENV=production for BOTH the dev and prod deploys, so
 * that flag only distinguishes `next dev` on localhost. The real stage comes
 * from CI (see .github/workflows/deploy-action.yaml, which already computes
 * STAGE from the branch) and is passed in explicitly.
 *
 * Production points at the SAME PostHog project as the brand app and the
 * marketing site: all three are on *.trendly.now, so posthog-js shares one
 * distinct_id across them and the journey stitches into one funnel.
 */
export const POSTHOG = {
  KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
  HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  /** "dev" | "prod" — injected by CI; defaults to dev so an unset build never
   *  pollutes production data. */
  STAGE: process.env.NEXT_PUBLIC_APP_STAGE || 'dev',
} as const;
