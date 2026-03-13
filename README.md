# OAK'S LAB HubSpot Knowledge Base Chat

An internal AI chatbot that answers HubSpot process questions for the OAK'S LAB business development team. Built with React and powered by Claude (Haiku 4.5).

## What it does

The BD team uses HubSpot to manage leads, deals, and workflows. This chatbot knows all of OAK'S LAB's specific HubSpot setup — lifecycle stages, deal pipeline, tier system, active workflows, and step-by-step processes — and can answer questions in natural language.

**Ask tab** — Type a question or pick from categorized suggestions:
- "What do I do when a new MQL comes in?"
- "When should I create a deal?"
- "How do I handle a new lead from Clutch?"

**Browse tab** — Read documentation directly, filtered by inbound or outbound track:
- Lifecycle Stages
- Deal Pipeline
- Tier System (ICP + Deal)
- Workflows (WF-01 through WF-07)
- How-Tos for inbound and outbound processes

## Quick Start

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Local Development

```bash
# Install dependencies
npm install

# Set environment variables
export ANTHROPIC_API_KEY=your-key-here
export SITE_PASSWORD=your-password-here

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173`.

### Production

The app is deployed on Vercel and auto-deploys from the `main` branch. Environment variables (`ANTHROPIC_API_KEY`, `SITE_PASSWORD`) are configured in the Vercel dashboard.

## Project Structure

```
api/chat.js           → Vercel serverless function (handles Claude API calls)
content/hubspot-kb.md → Knowledge base content (loaded as system prompt)
src/App.jsx           → Entire frontend UI
src/App.css           → All styles
vercel.json           → Vercel routing configuration
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design decisions and data flow.

See [CHANGELOG.md](CHANGELOG.md) for the full build history.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Updating the Knowledge Base

Edit `content/hubspot-kb.md`. This file is loaded as the system prompt for every chat request. Changes deploy automatically when pushed to `main`.

No code changes are needed to update knowledge — just edit the markdown.

## Stack

- **Frontend:** React 19, Vite 7
- **Backend:** Vercel serverless functions
- **AI:** Anthropic Claude Haiku 4.5
- **Deployment:** Vercel (auto-deploy from GitHub)

## Built With

This project was built entirely through [Claude Code](https://claude.ai/code) sessions in March 2026.
