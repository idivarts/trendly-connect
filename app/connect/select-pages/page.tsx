'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import PlatformIcon from '@/components/PlatformIcon';
import { buildCallbackURL } from '@/lib/config';

// ─── LinkedIn Page picker ─────────────────────────────────────────────────────
// Reached after the linkedin_page OAuth callback. The backend stashes a pending
// session (member token + admin pages) and redirects here with:
//   ?session=<id>&be=<backend base url that issued the session>
// We fetch the admin-page list, let the user multi-select, POST the chosen ids
// to create the page accounts, then deep-link back into the app.
// ──────────────────────────────────────────────────────────────────────────────

interface Org {
  urn: string;
  id: string;
  name: string;
  vanityName?: string;
  logoUrl?: string;
}

function SelectPagesInner() {
  const params = useSearchParams();
  const session = params.get('session') ?? '';
  const be = params.get('be') ?? '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [callbackScheme, setCallbackScheme] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Load the pending session's admin-page list.
  useEffect(() => {
    if (!session || !be) {
      setError('This page link is invalid or has expired.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${be}/connect/linkedin_page/session?session=${encodeURIComponent(session)}`
        );
        if (!res.ok) throw new Error('expired');
        const data = await res.json();
        const list: Org[] = data.orgs ?? [];
        setOrgs(list);
        setCallbackScheme(data.callbackScheme ?? '');
        // Default: everything selected.
        setSelected(Object.fromEntries(list.map((o) => [o.id, true])));
      } catch {
        setError('This page selection has expired. Please reconnect from the app.');
      } finally {
        setLoading(false);
      }
    })();
  }, [session, be]);

  const chosenIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function returnToApp(status: 'success' | 'error', message?: string) {
    if (callbackScheme) {
      window.location.href = buildCallbackURL({
        callbackScheme,
        platform: 'linkedin_page',
        status,
        message,
      });
    }
  }

  async function handleConnect() {
    if (chosenIds.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${be}/connect/linkedin_page/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, orgIds: chosenIds }),
      });
      if (!res.ok) throw new Error('failed');
      returnToApp('success');
    } catch {
      setError('Couldn’t connect the selected pages. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-12"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 60%), #0b1020',
      }}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo className="h-8" />
        </div>

        <div className="glass-card p-6 animate-fade-up space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-700 flex items-center justify-center text-white">
              <PlatformIcon platform="linkedin_page" className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white">Choose LinkedIn Pages</h1>
              <p className="text-xs text-slate-400">Select the Company Pages you want to manage.</p>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <svg className="w-7 h-7 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {!loading && error && (
            <div className="space-y-4">
              <p className="text-sm text-red-300">{error}</p>
              {callbackScheme && (
                <button onClick={() => returnToApp('error', error)} className="btn-ghost w-full">
                  Return to app
                </button>
              )}
            </div>
          )}

          {!loading && !error && orgs.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                You don’t administer any LinkedIn Company Pages. Ask a Page admin to grant you access,
                then try again.
              </p>
              {callbackScheme && (
                <button onClick={() => returnToApp('error', 'no_admin_pages')} className="btn-ghost w-full">
                  Return to app
                </button>
              )}
            </div>
          )}

          {!loading && !error && orgs.length > 0 && (
            <>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {orgs.map((o) => {
                  const on = !!selected[o.id];
                  return (
                    <button
                      key={o.id}
                      onClick={() => toggle(o.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        on ? 'bg-sky-500/15 ring-1 ring-sky-500/40' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {o.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.logoUrl} alt="" className="w-9 h-9 rounded-md object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-sky-700 flex items-center justify-center text-white">
                          <PlatformIcon platform="linkedin_page" className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{o.name}</p>
                        {o.vanityName && (
                          <p className="text-xs text-slate-400 truncate">linkedin.com/company/{o.vanityName}</p>
                        )}
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                          on ? 'bg-sky-500' : 'bg-white/10'
                        }`}
                      >
                        {on && (
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleConnect}
                disabled={chosenIds.length === 0 || submitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {submitting
                  ? 'Connecting…'
                  : `Connect ${chosenIds.length} ${chosenIds.length === 1 ? 'page' : 'pages'}`}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SelectPagesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center bg-ink-900">
          <svg className="w-8 h-8 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </main>
      }
    >
      <SelectPagesInner />
    </Suspense>
  );
}
