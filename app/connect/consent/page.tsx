'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import PlatformIcon from '@/components/PlatformIcon';
import Shell, { SpinnerIcon } from '@/components/Shell';
import { PLATFORMS, type PlatformKey } from '@/lib/platforms';
import { buildAuthInitURL } from '@/lib/config';

// ─── Per-platform consent landing ────────────────────────────────────────────
// Reached from /connect once a platform is chosen. Mirrors the Phyllo pattern:
// a brand → Trendly → platform logo bridge, trust points, the exact data we'll
// access, and a single Continue CTA that kicks off the backend OAuth flow.
//
// Query params (same as /connect, with platform required):
//   ?platform=instagram  ?token=JWT  ?app=users|brands
//   ?callbackScheme=...  ?stage=dev  ?brandId=...
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_POINTS: { title: string; body: string }[] = [
  {
    title: 'Your data is safe and secure',
    body: 'We follow industry best practices for encryption and storage.',
  },
  {
    title: 'Your consent matters',
    body: 'We only ever fetch the data you have given consent for.',
  },
  {
    title: "You're always in control",
    body: 'Disconnect any time from your Trendly profile settings.',
  },
];

function ConsentInner() {
  const params = useSearchParams();
  const platform = params.get('platform') as PlatformKey | null;
  const token = params.get('token') ?? '';
  const app = params.get('app') ?? 'users';
  const callbackScheme = params.get('callbackScheme') ?? '';
  const stageParam = params.get('stage') ?? '';
  const autoDev =
    typeof window !== 'undefined' && window.location.hostname.startsWith('dev.');
  const stage = stageParam || (autoDev ? 'dev' : '');
  const brandId = params.get('brandId') ?? '';

  const [connecting, setConnecting] = useState(false);

  const missingParams = !token || !callbackScheme;
  const validPlatform = platform && PLATFORMS[platform];

  function handleContinue() {
    if (!validPlatform || missingParams) return;
    setConnecting(true);
    const url = buildAuthInitURL({
      platform: platform as PlatformKey,
      token,
      app,
      callbackScheme,
      stage,
      brandId: brandId || undefined,
    });
    window.location.href = url;
  }

  // ── Error states ───────────────────────────────────────────────────────────
  if (!validPlatform || missingParams) {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h1 className="font-display text-xl font-bold text-white">Invalid link</h1>
          <p className="text-sm text-slate-400">
            This page should be opened from the Trendly app. Required information is
            missing.
          </p>
        </div>
      </Shell>
    );
  }

  const p = PLATFORMS[platform as PlatformKey];

  return (
    <Shell>
      <div className="w-full max-w-sm mx-auto space-y-7 animate-fade-up">
        {/* ── Logo bridge: Trendly ⇄ platform ─────────────────────────────── */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Trendly" className="h-6" />
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
          <div
            className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center text-white shadow-glow`}
          >
            <PlatformIcon platform={platform as PlatformKey} className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-white">
            Connect your {p.label} with Trendly
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
        </div>

        {/* ── Trust points ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3 h-3 text-brand-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{t.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Permissions ────────────────────────────────────────────────── */}
        <div className={`glass-card border ${p.borderColor} space-y-2`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Data we&apos;ll access
          </p>
          {p.scopes.map((scope) => (
            <div key={scope} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-green-400">✓</span>
              {scope}
            </div>
          ))}
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            disabled={connecting}
            className="btn-primary w-full"
          >
            {connecting ? (
              <>
                <SpinnerIcon />
                Redirecting…
              </>
            ) : (
              'Continue'
            )}
          </button>
          <p className="text-xs text-center text-slate-500">
            By continuing you agree to Trendly&apos;s{' '}
            <a
              href="https://trendly.now/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-slate-400"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </Shell>
  );
}

export default function ConsentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center bg-ink-900">
          <svg className="w-8 h-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </main>
      }
    >
      <ConsentInner />
    </Suspense>
  );
}
