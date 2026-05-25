'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '@/components/Logo';
import { buildCallbackURL } from '@/lib/config';
import type { PlatformKey } from '@/lib/platforms';

// ─── Params from backend redirect ────────────────────────────────────────────
// ?platform=instagram
// ?callbackScheme=trn-users
// ?app=users|brands
// ?message=human-readable error reason (optional)
// ─────────────────────────────────────────────────────────────────────────────

function ErrorInner() {
  const params = useSearchParams();
  const platform = (params.get('platform') ?? '') as PlatformKey;
  const callbackScheme = params.get('callbackScheme') ?? '';
  const message = params.get('message') ?? 'Something went wrong while connecting your account.';

  function handleRetry() {
    // Go back to the connect page with the same params
    const query = new URLSearchParams();
    if (platform) query.set('platform', platform);
    if (callbackScheme) query.set('callbackScheme', callbackScheme);
    const app = params.get('app');
    if (app) query.set('app', app);
    const token = params.get('token');
    if (token) query.set('token', token);
    window.location.href = `/connect?${query.toString()}`;
  }

  function handleReturn() {
    if (!callbackScheme || !platform) return;
    window.location.href = buildCallbackURL({ callbackScheme, platform, status: 'error', message });
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-12"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.10) 0%, transparent 60%), #0b1020',
      }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo className="h-8" />
        </div>

        <div className="animate-scale-in text-center space-y-6">
          {/* Error icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-white">Connection failed</h1>
            <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
          </div>

          <div className="space-y-3">
            <button onClick={handleRetry} className="btn-primary w-full">
              Try again
            </button>
            {callbackScheme && (
              <button onClick={handleReturn} className="btn-ghost w-full">
                Go back to app
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center bg-ink-900" />
    }>
      <ErrorInner />
    </Suspense>
  );
}
