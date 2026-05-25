'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import PlatformIcon from '@/components/PlatformIcon';
import { PLATFORMS, type PlatformKey } from '@/lib/platforms';
import { buildCallbackURL } from '@/lib/config';

// ─── Params from backend redirect ────────────────────────────────────────────
// ?platform=instagram
// ?callbackScheme=trn-users
// ?app=users|brands
// ─────────────────────────────────────────────────────────────────────────────

function SuccessInner() {
  const params = useSearchParams();
  const platform = (params.get('platform') ?? '') as PlatformKey;
  const callbackScheme = params.get('callbackScheme') ?? '';
  const app = params.get('app') ?? 'users';

  const [redirected, setRedirected] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const p = PLATFORMS[platform];

  useEffect(() => {
    if (!callbackScheme || !platform) return;

    const deepLink = buildCallbackURL({ callbackScheme, platform, status: 'success' });

    // Auto-redirect after a short delay to allow the success UI to render
    const timer = setTimeout(() => {
      window.location.href = deepLink;
      setRedirected(true);
    }, 2500);

    // Countdown tick
    const tick = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, [callbackScheme, platform]);

  function handleManualReturn() {
    if (!callbackScheme || !platform) return;
    window.location.href = buildCallbackURL({ callbackScheme, platform, status: 'success' });
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-12"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 60%), #0b1020',
      }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo className="h-8" />
        </div>

        <div className="animate-scale-in text-center space-y-6">
          {/* Success icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {p && (
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${p.color} flex items-center justify-center text-white border-2 border-ink-900`}>
                <PlatformIcon platform={platform} className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-white">
              {p ? `${p.label} connected!` : 'Connected!'}
            </h1>
            <p className="text-sm text-slate-400">
              Your account has been linked to Trendly.
              {callbackScheme && (
                <> Returning you to the app in {countdown}s…</>
              )}
            </p>
          </div>

          {callbackScheme && !redirected && (
            <button onClick={handleManualReturn} className="btn-ghost mx-auto">
              Return to app now
            </button>
          )}

          {!callbackScheme && (
            <p className="text-xs text-slate-500">
              You can now close this window and return to the app.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center bg-ink-900">
        <svg className="w-8 h-8 animate-spin text-green-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    }>
      <SuccessInner />
    </Suspense>
  );
}
