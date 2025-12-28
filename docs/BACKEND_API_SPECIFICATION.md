# Backend API Specification for Hello Emberly

**Status:** Frontend Sprint 1 complete. Backend integration pending.

**Base URL:** `https://api.helloemberly.com`

**Current Status:** Backend is returning errors. This document specifies what the frontend expects.

---

## Overview

The frontend makes requests through Next.js proxy routes (temporary CORS workaround) to the backend API. All requests are:
- Method: `POST` (or `OPTIONS` for CORS preflight)
- Content-Type: `application/json`
- Include `X-Correlation-ID` header for request tracking

---

## Endpoint 1: Create Session

**Endpoint:** `POST /v1/voice/sessions`

**Purpose:** Create a new conversation session. The frontend prefers session-based requests but falls back to direct endpoint if this fails.

### Request

**Headers:**
```
Content-Type: application/json
X-Correlation-ID: corr_1234567890_abc123def
```

**Body:**
```json
{}
```

**Note:** Frontend sends an empty JSON object. No authentication headers are currently sent.

### Expected Response (Success)

**Status Code:** `200 OK`

**Body:**
```json
{
  "session_id": "session_abc123def456"
}
```

**Field Requirements:**
- `session_id` (string, required): Unique session identifier that will be used in subsequent requests

### Error Responses

**Status Codes:**
- `404 Not Found` or `501 Not Implemented`: Frontend will fall back to direct `/v1/respond` endpoint
- `400 Bad Request`: Invalid request format
- `500 Internal Server Error`: Backend error
- `503 Service Unavailable`: Backend temporarily unavailable

**Error Body (optional):**
```json
{
  "error": "Error message (optional, frontend doesn't parse this)"
}
```

**Frontend Behavior:**
- On `404` or `501`: Falls back to `/v1/respond` endpoint (no session)
- On other errors: Shows error state to user

---

## Endpoint 2: Session-Based Response

**Endpoint:** `POST /v1/voice/sessions/{sessionId}/respond`

**Purpose:** Send a user message and receive an assistant response within an existing session.

### Request

**Headers:**
```
Content-Type: application/json
X-Correlation-ID: corr_1234567890_abc123def
```

**URL Parameter:**
- `sessionId` (string): The session ID returned from `/v1/voice/sessions`

**Body:**
```json
{
  "input_text": "Hello, how are you?",
  "client": {
    "platform": "web",
    "locale": "en-US"
  }
}
```

**Field Requirements:**
- `input_text` (string, required): User's message text
- `client.platform` (string, required): Always `"web"` for web frontend
- `client.locale` (string, required): Browser locale (e.g., `"en-US"`, `"es-ES"`)

### Expected Response (Success)

**Status Code:** `200 OK`

**Body:**
```json
{
  "assistant_message_id": "msg_xyz789",
  "text": "I'm doing well, thank you for asking. How can I help you today?",
  "policy": {
    "flags": []
  }
}
```

**Field Requirements:**
- `assistant_message_id` (string, required): Unique identifier for this assistant message
- `text` (string, required): Assistant's response text (must be non-empty)
- `policy.flags` (array of strings, required): Policy flags (can be empty array `[]`)

**Important:** The `text` field must contain a non-empty string. Empty responses will cause the frontend to show an error state.

### Error Responses

**Status Codes:**
- `400 Bad Request`: Invalid request format or invalid session ID
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Backend error
- `503 Service Unavailable`: Backend temporarily unavailable
- `504 Gateway Timeout`: Request timeout (frontend also has 15s timeout)

**Error Body (optional):**
```json
{
  "error": "Error message (optional, frontend doesn't parse this)"
}
```

**Frontend Behavior:**
- On any error: Shows error state with message "Nothing was saved"
- User can click "Back" to return to idle state

---

## Endpoint 3: Direct Response (Fallback)

**Endpoint:** `POST /v1/respond`

**Purpose:** Fallback endpoint when session creation fails or is unavailable. Works without a session.

### Request

**Headers:**
```
Content-Type: application/json
X-Correlation-ID: corr_1234567890_abc123def
```

**Body:**
```json
{
  "input_text": "Hello, how are you?",
  "client": {
    "platform": "web",
    "locale": "en-US"
  }
}
```

**Field Requirements:**
- Same as Endpoint 2 (session-based response)

### Expected Response (Success)

**Status Code:** `200 OK`

**Body:**
```json
{
  "assistant_message_id": "msg_xyz789",
  "text": "I'm doing well, thank you for asking. How can I help you today?",
  "policy": {
    "flags": []
  }
}
```

**Field Requirements:**
- Same as Endpoint 2

### Error Responses

**Status Codes:**
- Same as Endpoint 2

**Frontend Behavior:**
- Same as Endpoint 2

---

## Authentication & Authorization

**Current Status:** ❓ **UNKNOWN - NEEDS CONFIRMATION**

**Questions for Backend Team:**
1. Does the backend require authentication?
2. If yes, what authentication method?
   - API key in header?
   - Bearer token?
   - OAuth?
   - Other?
3. If authentication is required, what credentials should the frontend use?
4. Should authentication be per-request or per-session?

**Current Frontend Behavior:**
- No authentication headers are currently sent
- Only `Content-Type` and `X-Correlation-ID` headers are forwarded

**Action Required:**
- Backend team must confirm authentication requirements
- If required, provide credentials or configuration
- Frontend will need to be updated to include auth headers

---

## CORS Configuration

**Current Status:** Backend CORS is not configured. Frontend uses Next.js proxy as temporary workaround.

**Required CORS Headers (for future direct API calls):**

```
Access-Control-Allow-Origin: https://hello-emberly.vercel.app
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Correlation-ID
Access-Control-Max-Age: 86400
```

**Preflight (OPTIONS) Response:**
- Status: `200 OK` or `204 No Content`
- Include all `Access-Control-*` headers above

**Note:** Once CORS is configured, frontend can disable proxy via `NEXT_PUBLIC_USE_API_PROXY=false`.

---

## Request Flow Examples

### Happy Path (Session-Based)

1. Frontend calls `POST /v1/voice/sessions` → Backend returns `{ "session_id": "abc123" }`
2. Frontend calls `POST /v1/voice/sessions/abc123/respond` with user message
3. Backend returns `{ "assistant_message_id": "msg1", "text": "Hello!", "policy": { "flags": [] } }`
4. Frontend displays response to user

### Fallback Path (Direct)

1. Frontend calls `POST /v1/voice/sessions` → Backend returns `404` or `501`
2. Frontend falls back to `POST /v1/respond` with user message
3. Backend returns `{ "assistant_message_id": "msg1", "text": "Hello!", "policy": { "flags": [] } }`
4. Frontend displays response to user

### Error Path

1. Frontend calls any endpoint → Backend returns error status (400, 500, etc.)
2. Frontend shows error state: "Nothing was saved"
3. User can click "Back" to return to idle state

---

## Testing Checklist for Backend Team

### Endpoint 1: `/v1/voice/sessions`

- [ ] Endpoint is live and accessible
- [ ] Accepts `POST` requests
- [ ] Returns `200 OK` with `{ "session_id": "..." }` for empty body `{}`
- [ ] Returns valid session ID (string, non-empty)
- [ ] Handles `OPTIONS` preflight requests
- [ ] Returns appropriate error codes for invalid requests

### Endpoint 2: `/v1/voice/sessions/{sessionId}/respond`

- [ ] Endpoint is live and accessible
- [ ] Accepts `POST` requests
- [ ] Validates `sessionId` URL parameter
- [ ] Accepts request body with `input_text`, `client.platform`, `client.locale`
- [ ] Returns `200 OK` with valid response structure
- [ ] `text` field is non-empty for successful responses
- [ ] Returns `404` for invalid/non-existent session IDs
- [ ] Handles `OPTIONS` preflight requests

### Endpoint 3: `/v1/respond`

- [ ] Endpoint is live and accessible
- [ ] Accepts `POST` requests
- [ ] Accepts request body with `input_text`, `client.platform`, `client.locale`
- [ ] Returns `200 OK` with valid response structure
- [ ] `text` field is non-empty for successful responses
- [ ] Works without session context
- [ ] Handles `OPTIONS` preflight requests

### General

- [ ] All endpoints respond within 15 seconds (frontend timeout)
- [ ] Error responses use appropriate HTTP status codes
- [ ] Response bodies are valid JSON
- [ ] Authentication (if required) is configured and working
- [ ] CORS headers are configured (for future direct API calls)

---

## Example Test Requests

### Test Session Creation

```bash
curl -X POST https://api.helloemberly.com/v1/voice/sessions \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test_corr_123" \
  -d '{}'
```

**Expected Response:**
```json
{
  "session_id": "session_abc123"
}
```

### Test Session Response

```bash
curl -X POST https://api.helloemberly.com/v1/voice/sessions/session_abc123/respond \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test_corr_456" \
  -d '{
    "input_text": "Hello",
    "client": {
      "platform": "web",
      "locale": "en-US"
    }
  }'
```

**Expected Response:**
```json
{
  "assistant_message_id": "msg_xyz789",
  "text": "Hello! How can I help you today?",
  "policy": {
    "flags": []
  }
}
```

### Test Direct Response (Fallback)

```bash
curl -X POST https://api.helloemberly.com/v1/respond \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test_corr_789" \
  -d '{
    "input_text": "Hello",
    "client": {
      "platform": "web",
      "locale": "en-US"
    }
  }'
```

**Expected Response:**
```json
{
  "assistant_message_id": "msg_xyz789",
  "text": "Hello! How can I help you today?",
  "policy": {
    "flags": []
  }
}
```

---

## Frontend Integration Status

✅ **Frontend is ready:**
- All three endpoints are implemented
- Error handling is complete
- State machine correctly handles all response scenarios
- Proxy routing is working (CORS resolved)
- No user content is logged

⏳ **Waiting on backend:**
- Confirmation that endpoints are live
- Confirmation of authentication requirements
- Successful test responses for basic inputs like "Hello"
- Confirmation of expected response format matches specification

---

## Questions for Backend Team

1. **Is the backend currently live at `https://api.helloemberly.com`?**
   - If not, what is the current status?
   - When will it be live?

2. **Does the backend require authentication?**
   - If yes, what method and credentials?

3. **What is the expected response for a simple input like "Hello"?**
   - Should it return a greeting?
   - Should it return a specific format?

4. **Are all three endpoints implemented?**
   - `/v1/voice/sessions`
   - `/v1/voice/sessions/{sessionId}/respond`
   - `/v1/respond`

5. **What error responses should we expect during development?**
   - Are there rate limits?
   - Are there input validation rules?

6. **When will CORS be configured?**
   - This will allow removal of the proxy workaround

---

## Contact

For questions about frontend implementation, see:
- Frontend code: `lib/api.ts`
- Proxy routes: `app/api/v1/**`
- E2E tests: `e2e/smoke.spec.ts`

**Frontend Sprint 1 Status:** ✅ Complete and ready for backend integration.


