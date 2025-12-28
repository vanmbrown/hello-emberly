# Hello Emberly

A gentle companion for connection, memory, and purpose.

## Overview

Hello Emberly is a calm, invitational companion interface focused on emotional safety and dignity. It provides a text-first conversation experience with a deterministic state machine, session-based API integration, and opt-in local storage.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP / Lenis (disabled for reduced motion)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:
```
NEXT_PUBLIC_API_BASE_URL=https://api.helloemberly.com
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hello-emberly/
  app/                    # Next.js App Router pages
  components/            # React components
  content/               # Canonical copy source
  lib/                   # Core utilities (state machine, API, storage, etc.)
  public/                # Static assets
  styles/                # Global styles
```

## Key Features

- **Pure State Machine**: Deterministic UI state management with no side effects
- **Session-based API**: Automatic fallback to direct endpoint if sessions unavailable
- **Accessibility**: Full keyboard navigation, focus traps, reduced motion support
- **Demo Constellation**: Sample constellation display (real saving in Sprint 2)
- **Analytics Stub**: Semantic-only event tracking (no content)

## Development

### State Machine

The state machine (`lib/stateMachine.ts`) is a pure function that handles only state transitions. All side effects (API calls, analytics, storage) are handled by components via callbacks.

### API Client

The API client (`lib/api.ts`) automatically handles:
- Session creation
- Fallback to direct endpoint if sessions unavailable
- Request cancellation via AbortController
- Correlation IDs for tracking

### Accessibility

All dialogs include:
- Focus traps
- ESC key handling
- Focus restoration
- Reduced motion support

## Sprint 1 Scope

This MVP includes:
- Core conversation loop
- State machine implementation
- API integration with fallback
- Demo constellation display
- Full accessibility support

Coming in Sprint 2:
- Real constellation persistence (IndexedDB)
- Full CRUD for constellation nodes
- Additional features

## Backend Integration

**Status:** Frontend Sprint 1 is complete. Backend integration is pending.

See [`docs/BACKEND_API_SPECIFICATION.md`](./docs/BACKEND_API_SPECIFICATION.md) for:
- Expected API endpoint specifications
- Request/response formats
- Authentication requirements (TBD)
- Testing checklist for backend team

## License

Private - All rights reserved.

