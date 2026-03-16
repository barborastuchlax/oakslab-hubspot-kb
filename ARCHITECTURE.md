# Architecture

## Overview

This is a stateless AI chatbot that answers HubSpot process questions for the OAK'S LAB business development team. There is no database — all domain knowledge is embedded in a markdown file that gets passed to the Claude API as a system prompt.

```
┌─────────────────────────────────────────────────────┐
│                     Vercel                          │
│                                                     │
│  ┌─────────────┐    /api/chat    ┌──────────────┐  │
│  │  React SPA  │ ──────────────► │  Serverless   │  │
│  │  (Vite)     │ ◄────────────── │  Function     │  │
│  │             │   SSE stream    │  (api/chat.js)│  │
│  └─────────────┘                 └──────┬───────┘  │
│                                         │           │
│                                         │ Claude API│
│                                         ▼           │
│                                  ┌──────────────┐  │
│                                  │  Anthropic    │  │
│                                  │  (Haiku 4.5)  │  │
│                                  └──────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Key Design Decisions

### No database
All knowledge lives in `content/hubspot-kb.md`. This keeps the system simple — updating knowledge means editing one markdown file. The trade-off is that there's no conversation persistence, user analytics, or search indexing.

### Knowledge in a system prompt
The entire HubSpot knowledge base (~thousands of words covering lifecycle stages, deal pipeline, workflows, tier system, and how-tos) is loaded as the system prompt on every API call. Claude uses this context to answer questions accurately. This works because the knowledge base is small enough to fit well within the context window.

### Streaming responses
The serverless function proxies the Claude API's SSE (Server-Sent Events) stream directly to the browser. This gives users instant feedback as the response generates, rather than waiting for the full response.

### Password auth (simple)
A shared password is sent as a Bearer token. The serverless function checks it against `SITE_PASSWORD` env var. This is intentionally simple — the app is internal-only for a small BD team.

### Two-tab home screen
The home screen has an **Ask** tab (suggested questions by category) and a **Browse** tab (readable documentation with inbound/outbound filtering). This lets users either ask free-form questions or look up specific processes directly.

## File Structure

```
oakslab-hubspot-kb/
├── api/
│   └── chat.js              # Vercel serverless function (production)
├── content/
│   └── hubspot-kb.md        # Full knowledge base (system prompt)
├── src/
│   ├── App.jsx              # Main app — all UI logic in one file
│   ├── App.css              # All styles
│   ├── main.jsx             # React entry point
│   └── index.css            # Base/reset styles
├── vercel.json              # Vercel routing config
├── package.json             # Dependencies (React 19, Vite 7)
└── CLAUDE.md                # Project context for Claude Code sessions
```

### Why one big App.jsx?

The entire UI — home screen, chat view, sidebar, markdown rendering, streaming logic — lives in a single `App.jsx` file (~1400 lines). This was a deliberate choice for a small internal tool: no routing library, no state management library, no component library. Just React hooks and plain CSS. It keeps the dependency footprint minimal and makes the whole app easy to understand in one read.

## Data Flow

### Chat request
1. User types a message in the frontend
2. Frontend sends POST to `/api/chat` with `{ messages }` array and Bearer token
3. Serverless function validates the password
4. Function trims message history to last 10 messages
5. Function calls Claude API with the knowledge base as system prompt + message history
6. Claude's SSE stream is proxied back to the browser
7. Frontend renders markdown as it streams in

### Home screen
- **Ask tab**: Static suggestion categories defined in `App.jsx`. Clicking one sends it as a chat message.
- **Browse tab**: Static documentation sections defined in `App.jsx`, filterable by inbound/outbound track. Content renders as expandable cards.

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Authenticates with the Claude API |
| `SITE_PASSWORD` | Shared password for the app |

Both are set in Vercel's environment variables dashboard.

## Deployment

Vercel auto-deploys from the `main` branch on GitHub. The `vercel.json` config routes `/api/*` requests to the serverless function in `api/`. Everything else serves the Vite-built SPA.
