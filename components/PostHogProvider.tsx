'use client';

import { POSTHOG } from '@/lib/analytics';
import posthog from 'posthog-js';
import { useEffect } from 'react';

/**
 * Initialises PostHog for the connect bridge.
 *
 * Renders nothing — it exists for the init effect.
 *
 * This site is a short OAuth hand-off, so the events that matter are where a
 * connect attempt starts, succeeds or fails. Capturing it here rather than
 * inferring from the app means a user who drops out mid-OAuth — the most
 * interesting case — is still visible.
 *
 * No key configured ⇒ no-op.
 */
export default function PostHogProvider() {
  useEffect(() => {
    if (!POSTHOG.KEY) return;

    posthog.init(POSTHOG.KEY, {
      api_host: POSTHOG.HOST,

      // Captures pageviews across App Router client-side navigation too. The
      // manual alternative needs useSearchParams, which forces a CSR bailout
      // in a static export.
      capture_pageview: 'history_change',

      person_profiles: 'identified_only',

      // Cookie on .trendly.now, so a user keeps the same distinct_id across
      // the marketing site, the apps and this bridge.
      cross_subdomain_cookie: true,
    });

    posthog.register({ site: 'connect', environment: POSTHOG.STAGE });
  }, []);

  return null;
}
