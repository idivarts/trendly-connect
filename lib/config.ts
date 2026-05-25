const IS_DEV = process.env.NODE_ENV === 'development';

export const BE_URL = IS_DEV
  ? 'http://localhost:3001'
  : 'https://be.trendly.now';

export const CONNECT_URL = IS_DEV
  ? 'http://localhost:3000'
  : 'https://connect.trendly.now';

/**
 * Builds the backend OAuth initiation URL for a given platform.
 * The backend will:
 *   1. Validate the token
 *   2. Store state (userId + callbackScheme + app)
 *   3. Redirect to the platform's OAuth consent screen
 */
export function buildAuthInitURL(params: {
  platform: string;
  token: string;
  app: string;
  callbackScheme: string;
  stage?: string;
}): string {
  const stagePath = params.stage === 'dev' ? '/dev' : '';
  const base = `${BE_URL}${stagePath}/connect/${params.platform}`;
  const query = new URLSearchParams({
    token: params.token,
    app: params.app,
    callbackScheme: params.callbackScheme,
  });
  return `${base}?${query.toString()}`;
}

/**
 * Builds the deep-link or web URL to return control to the originating app.
 * - Native apps use a scheme like trn-users:// or trn-brands://
 * - Web apps use a full https:// URL
 */
export function buildCallbackURL(params: {
  callbackScheme: string;
  platform: string;
  status: 'success' | 'error';
  message?: string;
}): string {
  const isNative = !params.callbackScheme.startsWith('http');
  const path = isNative
    ? `${params.callbackScheme}://social-connected`
    : `${params.callbackScheme}/social-connected`;

  const query = new URLSearchParams({ platform: params.platform, status: params.status });
  if (params.message) query.set('message', params.message);
  return `${path}?${query.toString()}`;
}
