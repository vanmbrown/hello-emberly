# CORS Proxy Solution (Temporary)

## Status

**This is a temporary workaround** until the backend API at `api.helloemberly.com` is configured with proper CORS headers.

## Problem

The production frontend at `https://hello-emberly.vercel.app` makes requests to `https://api.helloemberly.com`, which currently blocks cross-origin requests due to missing CORS configuration.

## Solution

Next.js API routes act as a proxy:
- Browser → Vercel API route (same origin, no CORS)
- Vercel API route → `api.helloemberly.com` (server-to-server, no CORS)

## Implementation

### API Proxy Routes

- `/app/api/v1/voice/sessions/route.ts` - Proxies session creation
- `/app/api/v1/voice/sessions/[sessionId]/respond/route.ts` - Proxies session-based responses
- `/app/api/v1/respond/route.ts` - Proxies fallback direct endpoint

### API Client Update

`lib/api.ts` has been updated to use relative URLs pointing to the proxy routes instead of calling the external API directly.

## Required Backend CORS Configuration

The backend at `api.helloemberly.com` should be configured with:

**Allowed Origins:**
- `https://hello-emberly.vercel.app`
- `https://*.vercel.app` (for preview deployments)

**Allowed Methods:**
- `POST`
- `OPTIONS`

**Allowed Headers:**
- `Content-Type`
- `X-Correlation-ID`

**Preflight:**
- Respond to `OPTIONS` requests with `200` or `204`
- Include all required `Access-Control-*` headers

## Environment Toggle (Kill-Switch)

The proxy can be disabled via environment variable:

**Enable proxy (default):**
```
NEXT_PUBLIC_USE_API_PROXY=true
```
or omit the variable (defaults to true)

**Disable proxy (use direct API calls):**
```
NEXT_PUBLIC_USE_API_PROXY=false
```

When disabled, the API client will call `api.helloemberly.com` directly. This requires backend CORS to be configured.

## Removal Plan

Once backend CORS is configured:

1. Set `NEXT_PUBLIC_USE_API_PROXY=false` in Vercel environment variables
2. Test that direct API calls work from the browser (no CORS errors)
3. Delete the proxy routes in `/app/api/v1/`
4. Remove proxy toggle logic from `lib/api.ts`
5. Remove this documentation file

## Testing

After deployment, verify:
1. Open `https://hello-emberly.vercel.app`
2. Click "Begin a conversation"
3. Type a message and send
4. Confirm no CORS errors in browser devtools
5. Confirm app transitions to speaking state with response

