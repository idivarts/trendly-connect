'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import PlatformIcon from '@/components/PlatformIcon';
import Shell, { SpinnerIcon } from '@/components/Shell';
import { PLATFORMS, PLATFORM_ORDER, type PlatformKey } from '@/lib/platforms';

// ─── Params expected from the app ────────────────────────────────────────────
// ?token=FIREBASE_JWT          — required: identifies the logged-in user
// ?app=users|brands            — required: which app is initiating
// ?callbackScheme=trn-users    — required: deep-link scheme or https prefix to return to
// ?platform=instagram          — optional: pre-select a platform (skip picker)
// ?stage=dev                   — optional: route to dev backend
// ─────────────────────────────────────────────────────────────────────────────
//
// This screen only *chooses* a platform. The actual permission/consent step and
// the OAuth redirect live on /connect/consent — so the platform list is never
// shown twice. A preselected platform skips straight to consent.

function ConnectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const callbackScheme = params.get('callbackScheme') ?? '';
  const preselected = params.get('platform') as PlatformKey | null;

  const [selected, setSelected] = useState<PlatformKey | null>(preselected);

  // ── Validation ─────────────────────────────────────────────────────────────
  const missingParams = !token || !callbackScheme;

  // Forward every incoming param through to the consent page unchanged.
  const consentHref = useMemo(() => {
    return (platform: PlatformKey) => {
      const query = new URLSearchParams(params.toString());
      query.set('platform', platform);
      return `/connect/consent?${query.toString()}`;
    };
  }, [params]);

  // ── Preselected platform: skip the picker, go straight to consent ──────────
  useEffect(() => {
    if (!missingParams && preselected && PLATFORMS[preselected]) {
      router.replace(consentHref(preselected));
    }
  }, [missingParams, preselected, router, consentHref]);

  // ── Error: missing required params ────────────────────────────────────────
  if (missingParams) {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h1 className="font-display text-xl font-bold text-white">Invalid link</h1>
          <p className="text-sm text-slate-400">
            This page should be opened from the Trendly app. Required parameters are
            missing.
          </p>
        </div>
      </Shell>
    );
  }

  // ── Preselected: render a brief loader while the redirect kicks in ─────────
  if (preselected && PLATFORMS[preselected]) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="w-7 h-7 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Loading…</p>
        </div>
      </Shell>
    );
  }

  // ── Platform picker ────────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="w-full max-w-sm mx-auto space-y-6 animate-fade-up">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-white">Connect a platform</h1>
          <p className="text-sm text-slate-400">
            Choose a social account to link to your Trendly profile.
          </p>
        </div>

        <div className="space-y-3">
          {PLATFORM_ORDER.map((key) => {
            const p = PLATFORMS[key];
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => setSelected(isSelected ? null : key)}
                className={`w-full glass-card border text-left transition-all duration-200 hover:border-white/20 hover:bg-white/8 ${
                  isSelected ? `${p.borderColor} bg-white/8` : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <PlatformIcon platform={key} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{p.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-white/20 bg-transparent'
                  }`}>
                    {isSelected && (
                      <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selected && router.push(consentHref(selected))}
          disabled={!selected}
          className="btn-primary w-full"
        >
          {selected ? `Continue with ${PLATFORMS[selected].label}` : 'Select a platform'}
        </button>

        <p className="text-xs text-center text-slate-500">
          You can disconnect at any time from your Trendly profile settings.
        </p>
      </div>
    </Shell>
  );
}

// Wrap in Suspense for useSearchParams
export default function ConnectPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center bg-ink-900">
        <SpinnerIcon />
      </main>
    }>
      <ConnectInner />
    </Suspense>
  );
}
