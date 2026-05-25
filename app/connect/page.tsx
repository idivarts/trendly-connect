'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Logo from '@/components/Logo';
import PlatformIcon from '@/components/PlatformIcon';
import { PLATFORMS, PLATFORM_ORDER, type PlatformKey } from '@/lib/platforms';
import { buildAuthInitURL } from '@/lib/config';

// ─── Params expected from the app ────────────────────────────────────────────
// ?token=FIREBASE_JWT          — required: identifies the logged-in user
// ?app=users|brands            — required: which app is initiating
// ?callbackScheme=trn-users    — required: deep-link scheme or https prefix to return to
// ?platform=instagram          — optional: pre-select a platform (skip picker)
// ?stage=dev                   — optional: route to dev backend
// ─────────────────────────────────────────────────────────────────────────────

function ConnectInner() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const app = params.get('app') ?? 'users';
  const callbackScheme = params.get('callbackScheme') ?? '';
  const preselected = params.get('platform') as PlatformKey | null;
  const stage = params.get('stage') ?? '';
  const brandId = params.get('brandId') ?? '';

  const [selected, setSelected] = useState<PlatformKey | null>(preselected);
  const [connecting, setConnecting] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const missingParams = !token || !callbackScheme;

  function handleConnect(platform: PlatformKey) {
    if (!token || !callbackScheme) return;
    setConnecting(true);
    const url = buildAuthInitURL({ platform, token, app, callbackScheme, stage, brandId: brandId || undefined });
    window.location.href = url;
  }

  // ── Error: missing required params ────────────────────────────────────────
  if (missingParams) {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h1 className="font-display text-xl font-bold text-white">Invalid link</h1>
          <p className="text-sm text-slate-400">
            This page should be opened from the Trendly app. Required parameters are missing.
          </p>
        </div>
      </Shell>
    );
  }

  // ── Single platform: direct connect screen ─────────────────────────────────
  if (preselected && PLATFORMS[preselected]) {
    const p = PLATFORMS[preselected];
    return (
      <Shell>
        <div className="w-full max-w-sm mx-auto space-y-6 animate-fade-up">
          <div className="text-center space-y-2">
            <div className={`w-16 h-16 rounded-2xl ${p.color} flex items-center justify-center mx-auto text-white shadow-glow`}>
              <PlatformIcon platform={preselected} className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mt-4">
              Connect {p.label}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
          </div>

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

          <div className="space-y-3">
            <button
              onClick={() => handleConnect(preselected)}
              disabled={connecting}
              className="btn-primary w-full"
            >
              {connecting ? (
                <>
                  <SpinnerIcon />
                  Redirecting…
                </>
              ) : (
                `Connect ${p.label}`
              )}
            </button>
            <p className="text-xs text-center text-slate-500">
              You can disconnect at any time from your Trendly profile settings.
            </p>
          </div>
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
          onClick={() => selected && handleConnect(selected)}
          disabled={!selected || connecting}
          className="btn-primary w-full"
        >
          {connecting ? (
            <>
              <SpinnerIcon />
              Redirecting…
            </>
          ) : selected ? (
            `Connect ${PLATFORMS[selected].label}`
          ) : (
            'Select a platform'
          )}
        </button>

        <p className="text-xs text-center text-slate-500">
          You can disconnect at any time from your Trendly profile settings.
        </p>
      </div>
    </Shell>
  );
}

// ── Shell layout ──────────────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-5 py-12"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 60%), #0b1020',
      }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo className="h-8" />
        </div>
        {children}
      </div>
    </main>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// Wrap in Suspense for useSearchParams
export default function ConnectPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center bg-ink-900">
        <svg className="w-8 h-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    }>
      <ConnectInner />
    </Suspense>
  );
}
