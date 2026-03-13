# Changelog

All notable changes to the OAK'S LAB HubSpot Knowledge Base Chat.

This project was built entirely through Claude Code sessions over March 11–13, 2026.

## 2026-03-13

### Fixed
- Scroll to top when navigating back to the homepage

## 2026-03-12

### Added
- Clutch lead handling process added to the knowledge base

### Fixed
- Ordered list numbering in the markdown renderer
- Simplified Clutch reply step (removed unnecessary warning)

## 2026-03-11

This was the main build day — the app went from initial commit to a fully featured chatbot in a single session.

### Foundation
- Initial commit with React 19 + Vite 7 scaffold
- Redesigned the full chat UI
- Mobile responsiveness: pinned header/input using `dvh` units, viewport fixes
- Extracted the knowledge base from the system prompt into a separate markdown file (`content/hubspot-kb.md`)

### Core Features
- Password authentication with server-side prompt handling
- Switched AI model to Claude Haiku 4.5 for fast, cost-effective responses
- Streaming responses from the Claude API via Vercel serverless functions
- Chat history sidebar with conversation management
- Loading verb animations (rotating verbs, no repeats)
- Copy-to-clipboard button on AI responses
- Fallback guidance when a question falls outside the knowledge base
- Playful deflection for off-topic or silly questions

### Home Screen
- Browsable documentation sections (Lifecycle Stages, Deal Pipeline, Tier System, Workflows, How-Tos)
- Categorized suggestion prompts (Processes, Pipeline, Setup & Admin, Quick Reference, Troubleshooting, Reporting)
- Tab switcher between Ask and Browse modes
- Inbound/outbound filter on the Browse tab
- How-Tos split by track (inbound vs. outbound)
- Hint text to encourage open-ended questions
- Recently asked questions, changelog banner
- OAK'S LAB header made clickable to return home

### Integrations
- "Message Barbora on Slack" button when the AI can't answer
- Auto-copy question to clipboard when clicking the Slack button

### Knowledge Base Content
- Full documentation: tier system (ICP + Deal tiers), detailed workflows (WF-01 through WF-07), inbound/outbound how-tos
- Step-by-step processes for MQL review, deal creation, Clutch leads, nurture management

### Fun
- Flying unicorn easter egg with rainbow trail

### Bug Fixes
- Error handling: try/catch on `streamChat` to prevent UI hanging on network errors
- Contrast and hint text positioning fixes
- Mobile sidebar fixes
