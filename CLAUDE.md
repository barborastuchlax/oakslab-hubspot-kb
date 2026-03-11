# CLAUDE.md — Project Context for Claude Code

## Project
OAK'S LAB HubSpot Knowledge Base Chat — AI chatbot that answers HubSpot process questions for the BD team.

## Stack
- **Frontend:** React 19 + Vite 7
- **Backend:** Vercel serverless functions (`/api/chat.js`)
- **AI:** Anthropic Claude API (claude-opus-4-5)
- **Deployment:** Vercel (auto-deploys from GitHub)

## Key Files
- `api/chat.js` — Production serverless function (claude-opus-4-5)
- `src/api/chat.js` — Dev/fallback API handler (claude-sonnet-4-5)
- `src/App.jsx` — Main chat UI + system prompt with full HubSpot knowledge base
- `vercel.json` — Routing config (`/api/*` → serverless functions)

## Commands
```bash
npm run dev      # Local dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Environment Variables
- `ANTHROPIC_API_KEY` — Anthropic API key (required)

## Architecture Notes
- No database — stateless, all knowledge is embedded in the system prompt
- No direct HubSpot API calls — knowledge is baked into prompt text
- Two API files: `api/chat.js` (production/Vercel) and `src/api/chat.js` (dev)
- Frontend sends message history to `/api/chat`, backend calls Claude API

## Git
- Repo: github.com/barborastuchlax/oakslab-hubspot-kb (private)
- Vercel auto-deploys from main branch
