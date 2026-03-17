import { useState, useRef, useEffect, useCallback } from "react";

const SUGGESTIONS = [
  { label: "Processes", items: [
    "What do I do when a new MQL comes in?",
    "How do I handle a new lead from Clutch?",
  ]},
  { label: "Pipeline", items: [
    "When should I create a deal?",
    "What's the difference between Nurture and Closed Lost?",
  ]},
  { label: "Setup & Admin", items: [
    "How do I create a filtered view?",
    "How do I merge duplicate contacts?",
  ]},
  { label: "Quick Reference", items: [
    "What are the lifecycle stages?",
    "What workflows are currently active?",
  ]},
  { label: "Troubleshooting", items: [
    "A form stopped triggering — what do I check?",
    "I have duplicate contacts, how do I fix them?",
  ]},
  { label: "Reporting", items: [
    "How do I create a deal report by pipeline stage?",
    "How do I track conversion rates across lifecycle stages?",
  ]},
];

const DOCS = [
  { title: "Lifecycle Stages", icon: "\u2B24", viz: "lifecycle", track: "both", content: `### Inbound Track
- **Lead**: Inbound form submission (non-Talk to Sales). Assigned automatically via workflow.
- **MQL**: Talk to Sales form submission or direct meeting booking with Josh. Assigned automatically.
- **SQL**: Josh has reviewed the contact, accepted them as worth pursuing, and a call is scheduled. Pre-qualified before first call. Manual.
- **Opportunity**: Josh has taken the first call, fit is confirmed. Deal created, enters pipeline at Call with Leadership (or Discovery if Jake skipped). Manual.
- **Customer**: Associated deal marked Closed Won. Automatic.

### Outbound Track
- **Empty/no stage**: Contact imported into HubSpot — no trigger signal yet.
- **Lead**: A trigger exists that makes this company worth contacting — e.g. funding round, hiring signal, leadership change. Manual.
- **MQL**: Contact has responded positively to outreach and a call is booked. Manual.
- **SQL**: First call with Sean has happened. Fit and budget confirmed. Marked as SQL after this call. Manual.
- **Opportunity**: Second conversation with clear intent to move forward, or enough info exchanged to know this is worth pursuing now. Deal created. Manual.
- **Customer**: Associated deal marked Closed Won. Automatic.

### Key differences
- Inbound first stage: Lead (automated). Outbound first stage: Empty/no stage → Lead (manual).
- Inbound SQL: before first call — Josh pre-qualifies. Outbound SQL: after first call — Sean confirms fit.
- Inbound MQL trigger: form fill or meeting booked. Outbound MQL trigger: positive reply to outreach.
- Inbound deal created after Josh's first call. Outbound deal created after second conversation with Sean.` },
  { title: "Deal Pipeline", icon: "\u25B7", viz: "pipeline", track: "both", content: `- **Call with Leadership**: First entry point. Introductory call with Jake to assess fit. Sometimes skipped on inbound. Required: Deal Quality, Channel, Deal Source, Amount.
- **Discovery/Scoping**: Deep dive on requirements, solution design, scoping. Required: Deal Quality, Channel, Deal Source, Amount, Close Date.
- **Proposal**: Proposal created and sent. Required: Deal Quality, Channel, Deal Source, Amount, Close Date.
- **Negotiation**: Discussing pricing/terms, working through objections. No required properties (intentional).
- **Contract**: Legal review, contract signature pending. No required properties (intentional).
- **Closed Won**: Deal signed. Required: Closed Won Reason.
- **Closed Lost**: Not moving forward. Required: Loss reason.
- **Nurture**: Good fit but not ready now — 6+ month timeline. Required: Nurture Reason.

Nurture Reason options: Budget, Internal priorities shifted, Market conditions, Building stakeholder buy-in, Relationship building — not ready yet, Timing, Decision maker not engaged, Fundraising, Other.

Deals enter at Call with Leadership by default, or Discovery if Jake is skipped. A deal is only created when a contact reaches Opportunity stage.

Nurture is NOT a dead end — automated follow-ups at 2, 4, 6 months. Auto-closes to Closed Lost after 6 months with no action.

Deals can skip Call with Leadership and enter at Discovery in two cases: (1) inbound leads where Josh handles the first call and Jake is not needed, (2) outbound deals where enough context exists from prior calls.` },
  { title: "Tier System", icon: "\u25C6", track: "both", content: `### ICP Tier (Company level)
Reflects how well a company matches OAK'S LAB's ideal customer profile. Set when a company is first imported or created, reviewed at Call with Leadership. Sean sets it on outbound import. Josh sets it when qualifying inbound.

- **Tier 1 — Ideal fit**: ALL must be true: Series A–D, US-based engineering team with identifiable CTO/CPO, 10–50 engineers, confirmed openness to external engineering partners. → Prioritise immediately.
- **Tier 2 — Strong fit, one unknown**: Most Tier 1 boxes ticked — engineering team size unclear or slightly outside sweet spot, or openness to external partners unconfirmed. → Worth pursuing, not at expense of Tier 1.
- **Tier 3 — Partial fit, longer term**: Series A–D but team largely offshore; very small team; happy with current dev partner; stage or team size not yet right. → Deprioritise — monitor for growth.
- **Not our ICP — Clear mismatch**: Bootstrapped with no funding path; pre-product/idea stage; consumer-facing with no enterprise angle; explicitly declined; non-US with no US engineering leadership. → Do not pursue.

### Deal Quality (Deal level)
Reflects opportunity quality — scored independently by Josh after the qualification call using the Lead Scoring Matrix. Set at or immediately after Call with Leadership, updated at Discovery if new info changes the picture.

The Deal Quality is independent from ICP Tier. A Tier 1 company can have a Tier 2 deal (decision maker not engaged, budget unclear). A Tier 2 company can have a Tier 1 deal (timing and budget both strong).` },
  { title: "Workflows", icon: "\u21BB", track: "both", content: `### Native Automations (Settings → Lifecycle Stages → Automate)
- Sync lifecycle stages: ON (Contact ↔ Company sync)
- Set stage when created: OFF (handled by WF-01/WF-05 to distinguish inbound vs outbound)
- Set stage when deal created: ON → Opportunity
- Set stage when deal won: ON → Customer
- Set stage when lead associated: ON → Lead

### Workflows (all active as of 9 March 2026)
- **WF-01**: New inbound contact → Lead (based on original source allowlist). Excludes MQL+, excludes Talk to Sales form.
- **WF-02**: Talk to Sales form / Josh meeting → MQL, marketing contact, Lead Source = Inbound, assigns to Josh, task for Barbora.
- **WF-03**: Other inbound forms (about, newsletter) → Lead, marketing contact, Lead Source = Inbound, task for Barbora.
- **WF-04**: Talk to Sales form / Josh meeting → Slack notification to Josh + research task.
- **WF-05**: Outbound imports (Offline Sources, not Legacy) → Lead Source Category = Outbound. Does NOT set lifecycle stage.
- **WF-06**: Deal enters Nurture → reminders at 2/4/6 months to owner + collaborator → auto-closes to Closed Lost after 6 months + 1 day.
- **WF-07**: Deal marked Closed Lost → 183 days later: email to owner + follow-up task (due 3 business days).

### Inbound forms note
All forms are Webflow forms (not native HubSpot). Mapping via Webflow–HubSpot integration. Submissions sent via Zapier. They show as non-HubSpot forms — this is expected. If a form stops triggering: check Zapier zap and Webflow–HubSpot integration first.` },
  { title: "How-Tos: Inbound", icon: "\u2713", track: "inbound", content: `### Review a new lead (Barbora)
When WF-03 fires, Barbora gets a task — "New Inbound Lead - Check."
1. Open contact — who are they, does their company fit OAK'S LAB's ICP?
2. If worth passing to Josh: upgrade to MQL, assign to Josh Urban, create follow-up task.
3. If not worth pursuing: leave as Lead, add a note, close the task.

### Handle a new MQL (Josh)
Josh receives: Slack notification + task + email notification.
1. Review the contact — who are they, what company, does it fit ICP?
2. Score the company: set ICP Tier on the company record (Tier 1/2/3/Not our ICP).
3. If not a fit: set ICP Tier → Not our ICP, make a note. No deal, no further action.
4. If worth pursuing: confirm the call or reach out to schedule. Update Lifecycle Stage → SQL.
5. After call — fit confirmed: update to Opportunity, create deal, score Deal Quality.
6. After call — not a fit: set ICP Tier → Not our ICP, make a note. No deal.

### Handle spam or junk form submissions (Josh)
1. Open the contact record, confirm it's spam or irrelevant.
2. Leave the contact as is — do not update lifecycle stage, do not set ICP Tier, do not create a deal.
3. Optionally add a note (e.g. "Spam — no action").
4. Close the task.
5. If it bothers you from a data cleanliness perspective: set ICP Tier = Not our ICP on the company record.
Why not delete? Junk contacts don't affect reporting if no properties are updated. Deleting can cause issues with workflow history.` },
  { title: "How-Tos: Outbound", icon: "\u2713", track: "outbound", content: `### Manually add a contact
1. Always find or create the company first (Company Name, Industry, Country/Region, City, LinkedIn).
2. Create the contact FROM the company record (ensures auto-association).
3. Fill: First Name, Last Name, Email, Phone, Job Title, LinkedIn URL, Country/Region, City, Lead Source Category (Outbound), Lifecycle Stage (only if genuine trigger — otherwise leave empty), Contact Owner.
4. Do NOT create a deal — only create deals at Opportunity stage.

### Import from Clay
Two separate imports — companies first, then contacts.
- **Companies**: Contacts → Import → Single file → Companies. Key fields: Company Name, Industry, Country/Region, LinkedIn. Add in Clay: Lead Source Category = Outbound, Channel, Deal Source.
- **Contacts**: Contacts → Import → Single file → Contacts. Key fields: First Name, Last Name, Email (critical), Phone, LinkedIn, Job Title. Do NOT include Lifecycle Stage or Lead Status.
- After both: spot-check 5–10 contacts, fix orphaned ones, do not manually set Lifecycle Stage.

### A contact just came in — what do I do?
The old habit was to create a deal immediately. **Do not do this.**
1. **Contact arrives** — Lifecycle Stage is empty (correct). No deal exists (correct).
2. **Is there a trigger signal?** (funding round, new CTO, hiring spike) → Yes: set Lead, begin outreach. No: leave empty.
3. **Contact responds positively, call booked** → set MQL.
4. **First call with Sean, fit + budget confirmed** → set SQL. Still no deal.
5. **Second conversation, clear intent** → set Opportunity. **Now** create the deal. Score Deal Quality.
💡 No deal until Opportunity. A deal = active commercial conversation with confirmed intent.

### Move outbound contacts through stages
- Empty → Lead: genuine trigger signal exists
- Lead → MQL: responded positively, call booked
- MQL → SQL: first call with Sean done, fit + budget confirmed
- SQL → Opportunity: second conversation, clear intent, create deal now` },
  { title: "How-Tos: Deals", icon: "\u2713", track: "both", content: `### Create a deal
1. Open contact, set Lifecycle Stage to Opportunity
2. Deals panel, click + Add
3. Name = company name only (e.g. "Acme")
4. Pipeline = New Business
5. Stage = Call with Leadership (or Discovery if Jake skipped)
6. Set Deal Type (New Business / Existing Business)
7. Set Channel (Outbound / Inbound / Client Expansion)
8. Fill required properties for the stage
9. Click Create deal
10. Score the Deal Quality using the Lead Scoring Matrix
Sean creates outbound deals. Josh creates inbound deals.

### Move a deal through the pipeline
- **Discovery**: Intro call with Jake done, strategic fit confirmed.
- **Proposal**: Requirements scoped, ready to send proposal.
- **Negotiation**: Proposal sent, reviewing terms.
- **Contract**: Commercial terms agreed.
- **Closed Won**: Contract signed.
- **Closed Lost**: No longer moving forward — loss reason required.
- **Nurture**: Good fit but not ready — nurture reason required.
Always fill required properties. Keep close date up to date. Add notes after every significant interaction.

### Nurture vs Closed Lost
**Nurture:** genuine potential within 6 months. Fill Nurture Reason. Reminders at 2, 4, 6 months. Auto-closes after 6 months. Do not use Nurture to avoid Closed Lost.
**Closed Lost:** no realistic prospect within 6 months. Fill Loss reason (cannot skip). After 6 months: email + task to check back in.` },
  { title: "Legacy Contacts", icon: "\u25CC", track: "both", content: `Legacy contacts are not deleted — marked as non-marketing contacts and hidden from default views. If a legacy contact re-engages, they return to active status.

### A contact is marked Legacy if:
- **No recent activity**: Create date before 1 Jan 2025 and last activity date more than 365 days ago (~30,700)
- **Do Not Contact**: Lead status is marked as DO NOT CONTACT (~4,400)
- **Hard bounce**: Email hard bounce reason is known (~200)
- **Deactivated owner**: Contact owner is a deactivated user (~1,900)

### A company is marked Legacy if:
All of its associated contacts are legacy contacts.

### Edge case:
If a contact is imported after 1 March 2026 and merges with an existing contact → mark the original contact as Legacy = No.` },
  { title: "FAQ", icon: "?", track: "both", content: `### How do I create a filtered view?
Go to Contacts (or Companies/Deals) > click "All filters" > add criteria > click "Save view". Name it and choose whether to share.

### How do I create a report?
Go to Reporting > Reports > Create report. Choose "Single object" or "Custom report builder". Select data source, add filters, pick chart type. Save to a dashboard.

### How do I set up an integration?
Go to Settings > Integrations > Connected apps > Visit App Marketplace. Search, click "Install", follow authorization flow.

### How do I export data?
Go to the relevant object > select view/filters > click "Export". Choose CSV or XLSX and which properties to include.

### How do I manage email templates?
Go to Conversations > Templates. Click "New template". Use personalization tokens like {{contact.firstname}}.

### How do I track email opens and clicks?
Automatic for emails sent via HubSpot. For Gmail/Outlook, install the HubSpot extension. Configure in Settings > General > Email.

### How do I merge duplicates?
Open one record > Actions > Merge. Search for the duplicate, review values to keep, click Merge. Cannot be undone.

### How do I reassign a contact owner?
Open contact > find "Contact owner" in sidebar > select new owner. Bulk: select multiple in list view > click "Assign".` },
  { title: "General Tips", icon: "\u2605", track: "both", content: `- **Activity feed**: Check daily (bell icon) for task reminders, form submissions, and email replies.
- **Notes**: Always log notes after calls or meetings — keeps the team aligned.
- **Tasks**: Use HubSpot tasks instead of your own to-do list for CRM follow-ups.
- **Board view vs. list view**: Board view for deals (drag and drop), list view for contacts/companies (bulk actions).
- **Keyboard shortcuts**: Press \`G\` then \`C\` for contacts, \`G\` then \`D\` for deals. Press \`?\` to see all shortcuts.` },
];

const CHANGELOG_ID = "2026-03-11b";
const CHANGELOG_TEXT = "Major docs update: Tier System added, detailed workflow breakdowns, new outbound step-by-step guide, spam handling process, and expanded ICP tier definitions.";

function getRecentQuestions(chats, max = 4) {
  const questions = [];
  const sorted = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  for (const chat of sorted) {
    for (const m of chat.messages) {
      if (m.role === "user" && !questions.includes(m.content)) {
        questions.push(m.content);
        if (questions.length >= max) return questions;
      }
    }
  }
  return questions;
}

const LOADING_VERBS = [
  "Flibbertigibbeting", "Skedaddling", "Bamboozling", "Shenaniganizing", "Gallivanting",
  "Kerfuffling", "Hornswoggling", "Skulldugging", "Higgledy-piggledying", "Balderpashing",
  "Brouhahaing", "Coddiwompling", "Lollygagging", "Taradiddling", "Canoodling",
  "Gobbledygooking", "Rigmarolling", "Snollygostering", "Widdershinsing", "Malarkeying",
  "Discombobulating", "Reticulating", "Forloopifying", "Iterliferating", "Juxtaprizing",
  "De-fragulating", "Quantifizzing", "Synergizing", "Refactorizing", "Transmogrifying",
  "Algorithmizing", "Subroutinizing", "Bit-twiddling", "Hyper-threading", "Parametrizing",
  "Obfuscating", "Vectorizing", "Megahertzifying", "Cache-clearing", "Hexadecimalizing",
  "Mushing", "Jiving", "Frolicking", "Pleading", "Constellationizing",
  "Scouring", "Rummaging", "Hustling", "Galvanizing", "Rocketing",
  "Careening", "Scuttling", "Sprinting", "Thrumming", "Whirring",
  "Pulsating", "Vaulting", "Zig-zagging", "High-fiving", "Orchestrating",
  "Sizzling", "Caramelizing", "Marinating", "Fermenting", "Frothing",
  "Kneading", "Percolating", "Simmering", "Dolloping", "Sprinkling",
  "Whisking", "Garnishing", "Infusing", "Emulsifying", "Steepening",
  "Smoldering", "Glittering", "Rustling", "Shimmering", "Glazing",
  "Orbiting", "Supernoving", "Sproutifying", "Pollinating", "Germinating",
  "Photosynthesizing", "Meandering", "Ebbing", "Flowing", "Cascading",
  "Eroding", "Crystallizing", "Petrifying", "Gravitating", "Nebulizing",
  "Meteor-showering", "Aurora-boring", "Blooming", "Weathering", "Spelunking",
  "Pondering", "Cogitating", "Postulating", "Theorizing", "Ruminating",
  "Speculating", "Extrapolating", "Synthesizing", "Deducting", "Inducting",
  "Contemplating", "Brooding", "Deliberating", "Examining", "Scrutinizing",
  "Deconstructing", "Existentializing", "Phenomenologizing", "Dialecting", "Ideating",
];

// --- localStorage helpers ---
function loadChats() {
  try { return JSON.parse(localStorage.getItem("chats") || "[]"); }
  catch { return []; }
}
function saveChats(chats) {
  localStorage.setItem("chats", JSON.stringify(chats));
}

// --- Loading indicator ---
function pickVerb(exclude) {
  let v;
  do { v = LOADING_VERBS[Math.floor(Math.random() * LOADING_VERBS.length)]; } while (v === exclude);
  return v;
}

function LoadingIndicator() {
  const [verb, setVerb] = useState(() => pickVerb());
  useEffect(() => {
    const interval = setInterval(() => setVerb(prev => pickVerb(prev)), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "28px" }}>
      <div style={{ width: "28px", height: "28px", background: "#111110", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#f5f4f0", fontSize: "10px", fontWeight: 700 }}>OL</span>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: "4px 16px 16px 16px", padding: "12px 20px", display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ color: "#999", fontSize: "13px", fontStyle: "italic" }}>{verb}...</span>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {[0,1,2].map(j => (
            <div key={j} style={{ width: "5px", height: "5px", background: "#c8c6be", borderRadius: "50%", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Slack ask button ---
const BARBORA_SLACK_ID = "U0AC9AN56SZ";

function AskBarboraButton({ question }) {
  const slackUrl = `https://slack.com/app_redirect?channel=${BARBORA_SLACK_ID}`;
  function handleClick() {
    if (question) navigator.clipboard.writeText(question).catch(() => {});
  }
  return (
    <a href={slackUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}
      style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#4A154B", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", textDecoration: "none", marginTop: "12px", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#611f69"}
      onMouseLeave={e => e.currentTarget.style.background = "#4A154B"}>
      <svg width="16" height="16" viewBox="0 0 123 123" fill="none"><path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#E01E5A"/><path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36C5F0"/><path d="M97.2 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97.2V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.9 5.8 70.7 0 77.8 0s12.9 5.8 12.9 12.9v32.3z" fill="#2EB67D"/><path d="M77.8 97.2c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97.2h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.8z" fill="#ECB22E"/></svg>
      Message Barbora on Slack if you still have questions
    </a>
  );
}

function parseAskBarbora(content) {
  const hasMarker = content.includes("<<ASK_BARBORA>>");
  const cleanContent = content.replace(/\s*<<ASK_BARBORA>>\s*/g, "").trim();
  return { hasMarker, cleanContent };
}

// --- Copy button ---
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={handleCopy} style={{ background: "none", border: "1px solid #e0ded8", borderRadius: "6px", color: copied ? "#16a34a" : "#999", fontSize: "11px", padding: "3px 8px", cursor: "pointer", fontFamily: "inherit", marginTop: "8px", transition: "color 0.2s" }}
      onMouseEnter={e => { if (!copied) e.target.style.color = "#555"; }}
      onMouseLeave={e => { if (!copied) e.target.style.color = "#999"; }}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// --- Flying unicorn easter egg ---
const FLIGHT_PATHS = [
  // bottom-left to top-right
  { startX: -0.05, startY: 0.85, endX: 1.1, endY: -0.1, peakY: -0.4, flip: false },
  // bottom-right to top-left
  { startX: 1.05, startY: 0.85, endX: -0.1, endY: -0.1, peakY: -0.4, flip: true },
  // top-left to bottom-right (dive)
  { startX: -0.05, startY: 0.1, endX: 1.1, endY: 0.15, peakY: -0.3, flip: false },
  // mid-left, big arc
  { startX: -0.05, startY: 0.5, endX: 1.1, endY: 0.2, peakY: -0.5, flip: false },
  // bottom-center upward
  { startX: 0.2, startY: 1.05, endX: 0.9, endY: -0.1, peakY: -0.4, flip: false },
];

function getFlightPos(t, path, w, h) {
  const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const x = (path.startX + (path.endX - path.startX) * ease) * w;
  const baseY = path.startY + (path.endY - path.startY) * ease;
  const arc = path.peakY * Math.sin(ease * Math.PI);
  const y = (baseY + arc) * h;
  return { x, y };
}

function FlyingUnicorn({ onDone }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState([]);
  const [opacity, setOpacity] = useState(0);
  const startTime = useRef(Date.now());
  const path = useRef(FLIGHT_PATHS[Math.floor(Math.random() * FLIGHT_PATHS.length)]);
  const trailCounter = useRef(0);

  useEffect(() => {
    const duration = 4000;
    let animId;
    function tick() {
      const t = Math.min((Date.now() - startTime.current) / duration, 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const { x, y } = getFlightPos(t, path.current, w, h);
      setPos({ x, y });
      // fade in/out
      const o = t < 0.08 ? t / 0.08 : t > 0.9 ? (1 - t) / 0.1 : 1;
      setOpacity(o);
      trailCounter.current++;
      if (trailCounter.current % 2 === 0) {
        setTrail(prev => [...prev.slice(-40), { id: trailCounter.current, x, y }]);
      }
      if (t < 1) { animId = requestAnimationFrame(tick); }
      else { setTimeout(onDone, 300); }
    }
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [onDone]);

  const flip = path.current.flip;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {trail.map((p, i) => (
        <div key={p.id} style={{
          position: "absolute", left: p.x - 4, top: p.y - 4,
          width: "8px", height: "8px", borderRadius: "50%",
          background: `hsl(${(i * 9) % 360}, 90%, 60%)`,
          opacity: Math.max(0, 0.7 * (i / trail.length)),
          transform: `scale(${0.3 + (i / trail.length) * 0.9})`,
          filter: "blur(1px)",
        }} />
      ))}
      <div style={{
        position: "absolute", left: pos.x - 24, top: pos.y - 24,
        fontSize: "48px", opacity,
        transform: flip ? "scaleX(-1)" : "none",
        transition: "opacity 0.1s",
      }}>🦄</div>
    </div>
  );
}

// --- Markdown rendering ---
function renderMarkdown(text) {
  // Rejoin markdown links that got split across lines (handles ] and ( on separate lines)
  text = text.replace(/\[([^\]]+)\]\s*\n\s*\(/g, "[$1](").replace(/\[([^\]]+)\]\(\s*\n\s*/g, "[$1](").replace(/\]\(\s+/g, "](");
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{ fontSize: "15px", fontWeight: 700, color: "#111110", margin: "16px 0 6px", letterSpacing: "-0.01em" }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{ fontSize: "13px", fontWeight: 700, color: "#111110", margin: "12px 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{line.slice(4)}</h3>);
    } else if (line.match(/^\d+\.\s/)) {
      const items = [];
      while (i < lines.length) {
        const cur = lines[i];
        if (cur.match(/^\d+\.\s/)) {
          // New numbered item — collect its text and any sub-items that follow
          const subContent = [formatInline(cur.replace(/^\d+\.\s/, ""))];
          i++;
          const subItems = [];
          while (i < lines.length && !lines[i].match(/^\d+\.\s/) && (lines[i].startsWith("- ") || lines[i].startsWith("  ") || lines[i].trim() === "")) {
            const sub = lines[i];
            if (sub.startsWith("- ") || sub.startsWith("  - ")) {
              subItems.push(<li key={`${i}-sub`} style={{ marginBottom: "2px" }}>{formatInline(sub.replace(/^\s*-\s/, ""))}</li>);
            }
            // skip blank lines between items
            i++;
          }
          if (subItems.length > 0) {
            items.push(<li key={items.length} style={{ marginBottom: "6px" }}>{subContent}<ul style={{ margin: "4px 0 2px 16px", padding: 0, lineHeight: 1.7 }}>{subItems}</ul></li>);
          } else {
            items.push(<li key={items.length} style={{ marginBottom: "4px" }}>{subContent}</li>);
          }
        } else {
          break;
        }
      }
      elements.push(<ol key={`ol-${i}`} style={{ margin: "6px 0 6px 18px", padding: 0, lineHeight: 1.7 }}>{items}</ol>);
      continue;
    } else if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(<li key={i} style={{ marginBottom: "4px" }}>{formatInline(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={{ margin: "6px 0 6px 18px", padding: 0, lineHeight: 1.7 }}>{items}</ul>);
      continue;
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={i} style={{ margin: "8px 0 4px", fontWeight: 700, color: "#111110" }}>{line.slice(2, -2)}</p>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "6px" }} />);
    } else if (line.trim()) {
      elements.push(<p key={i} style={{ margin: "4px 0", lineHeight: 1.7 }}>{formatInline(line)}</p>);
    }
    i++;
  }
  return elements;
}

function formatInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} style={{ background: "#e8e6e0", padding: "1px 5px", borderRadius: "3px", fontSize: "12px", fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>{linkMatch[1]}</a>;
    return part;
  });
}

// --- Visualization: Lifecycle Stages ---
function LifecycleViz() {
  const stages = ["Lead", "MQL", "SQL", "Opportunity", "Customer"];
  const inbound = ["Form submit", "Talk to Sales / Josh meeting", "Josh pre-qualifies", "First call, fit confirmed", "Deal Closed Won"];
  const outbound = ["Trigger signal", "Positive response, call booked", "Sean call, fit confirmed", "2nd call, clear intent", "Deal Closed Won"];
  return (
    <div style={{ padding: "16px 0 8px" }}>
      <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
        {stages.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ background: i === stages.length - 1 ? "#111110" : `rgba(17,17,16,${0.12 + i * 0.15})`, color: i >= 3 ? "#fff" : "#111110", borderRadius: i === 0 ? "6px 0 0 6px" : i === stages.length - 1 ? "0 6px 6px 0" : "0", padding: "8px 4px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.02em" }}>{s}</div>
          </div>
        ))}
      </div>
      {[{ label: "Inbound", items: inbound, color: "#3b82f6" }, { label: "Outbound", items: outbound, color: "#f59e0b" }].map((track) => (
        <div key={track.label} style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: track.color, flexShrink: 0 }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>{track.label}</span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            {track.items.map((desc, i) => (
              <div key={i} style={{ flex: 1, fontSize: "10px", color: "#666", lineHeight: 1.3, padding: "4px 4px", borderLeft: i === 0 ? "none" : "1px solid #e8e6e0", textAlign: "center" }}>{desc}</div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ fontSize: "10px", color: "#777", marginTop: "8px", fontStyle: "italic" }}>Key: Inbound SQL is before first call (Josh pre-qualifies) / Outbound SQL is after first call (Sean confirms)</div>
    </div>
  );
}

// --- Visualization: Deal Pipeline ---
function PipelineViz() {
  const stages = [
    { name: "Call with Leadership", fields: "Deal Quality, Channel, Deal Source, Amount", w: 100 },
    { name: "Discovery", fields: "Deal Quality, Channel, Deal Source, Amount, Close Date", w: 90 },
    { name: "Proposal", fields: "Deal Quality, Channel, Deal Source, Amount, Close Date", w: 80 },
    { name: "Negotiation", fields: "\u2014", w: 70 },
    { name: "Contract", fields: "\u2014", w: 62 },
    { name: "Closed Won", fields: "Closed Won Reason", w: 55 },
  ];
  return (
    <div style={{ padding: "16px 0 8px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "center" }}>
        {stages.map((s, i) => (
          <div key={i} style={{ width: `${s.w}%`, background: i === stages.length - 1 ? "#111110" : "#e8e6e0", borderRadius: "6px", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.15s" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: i === stages.length - 1 ? "#fff" : "#333" }}>{s.name}</span>
            <span style={{ fontSize: "10px", color: i === stages.length - 1 ? "#aaa" : "#666" }}>{s.fields}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "12px" }}>
        {[{ name: "Nurture", desc: "Auto follow-up 2/4/6mo", color: "#f59e0b" }, { name: "Closed Lost", desc: "Check-in after 6mo", color: "#ef4444" }].map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#666" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color }} />
            <span><strong style={{ color: "#444" }}>{s.name}</strong> \u2014 {s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Doc section ---
function DocSection({ title, content, icon, viz, isMobile }) {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const hasViz = !!viz;
  return (
    <div style={{ background: "#fff", border: open ? "1px solid #ccc" : "1px solid #e0ded8", borderRadius: "12px", transition: "all 0.15s", overflow: "hidden", gridColumn: open ? "1 / -1" : undefined }}
      onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = "#bbb"; }}
      onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = open ? "#ccc" : "#e0ded8"; }}>
      <button onClick={() => { setOpen(!open); if (open) setShowDetails(false); }}
        style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", textAlign: "left", cursor: "pointer", fontSize: "13px", color: open ? "#111110" : "#444", fontWeight: open ? 600 : 400, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: open ? "#111110" : "#888", fontSize: "12px", transition: "transform 0.15s", transform: open ? "rotate(90deg)" : "none", flexShrink: 0 }}>&#9658;</span>
        {title}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {hasViz && (
            <div style={{ borderTop: "1px solid #e8e6e0" }}>
              {viz === "lifecycle" && <LifecycleViz />}
              {viz === "pipeline" && <PipelineViz />}
            </div>
          )}
          {hasViz ? (
            <>
              <button onClick={() => setShowDetails(!showDetails)} style={{ background: "none", border: "none", fontSize: "11px", color: "#777", cursor: "pointer", fontFamily: "inherit", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
                {showDetails ? "\u25BE Hide details" : "\u25B8 Show details"}
              </button>
              {showDetails && (
                <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.7, marginTop: "8px", borderTop: "1px solid #e8e6e0", paddingTop: "12px" }}>
                  {renderMarkdown(content)}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.7, borderTop: "1px solid #e8e6e0", paddingTop: "8px" }}>
              {renderMarkdown(content)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Login ---
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) return;
    setError("");
    onLogin(password.trim());
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: "#f5f4f0", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "14px", color: "#333" }}>
      <div style={{ background: "#111110", color: "#f5f4f0", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: "15px" }}>OAK'S LAB</span>
          <span style={{ color: "#666", fontSize: "12px" }}>|</span>
          <span style={{ color: "#c8c6be", fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase" }}>HubSpot Knowledge Base</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: "360px", width: "100%", padding: "0 24px" }}>
          <p style={{ fontSize: "22px", fontWeight: 700, color: "#111110", letterSpacing: "-0.02em", marginBottom: "8px" }}>Sign in</p>
          <p style={{ color: "#888", marginBottom: "24px", fontSize: "14px" }}>Enter the team password to continue.</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoFocus
            style={{ width: "100%", border: "1px solid #e0ded8", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#fff", color: "#111110", marginBottom: "12px" }} />
          {error && <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
          <button type="submit" style={{ width: "100%", background: "#111110", color: "#f5f4f0", border: "none", borderRadius: "10px", padding: "12px 20px", cursor: "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "inherit" }}>Continue</button>
        </form>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}

// --- SSE stream parser ---
async function streamChat(token, messages, onDelta, onDone, onError) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ messages }),
    });

    if (res.status === 401) { onError("auth"); return; }
    if (!res.ok) { onError("api"); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onDelta(fullText);
          }
        } catch {}
      }
    }
    onDone(fullText);
  } catch {
    onError("api");
  }
}

// --- Main App ---
export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("auth_token") || "");
  const [chats, setChats] = useState(() => loadChats());
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [authError, setAuthError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [homeTab, setHomeTab] = useState("ask");
  const [browseFilter, setBrowseFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  const [showUnicorn, setShowUnicorn] = useState(false);
  const unicornTimer = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const contentRef = useRef(null);

  const [changelogDismissed, setChangelogDismissed] = useState(() => localStorage.getItem("changelog_dismissed") === CHANGELOG_ID);
  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (activeChatId) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      contentRef.current?.scrollTo(0, 0);
    }
  }, [messages, loading, streamingText, activeChatId]);

  const updateChat = useCallback((chatId, newMessages) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === chatId ? { ...c, messages: newMessages, updatedAt: Date.now() } : c);
      saveChats(updated);
      return updated;
    });
  }, []);

  function startNewChat() {
    setActiveChatId(null);
    setInput("");
    setSidebarOpen(false);
  }

  function selectChat(id) {
    setActiveChatId(id);
    setSidebarOpen(false);
  }

  function deleteChat(id, e) {
    e.stopPropagation();
    setChats(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveChats(updated);
      return updated;
    });
    if (activeChatId === id) setActiveChatId(null);
  }

  function handleLogin(password) {
    sessionStorage.setItem("auth_token", password);
    setToken(password);
    setAuthError(false);
  }

  function handleLogout() {
    sessionStorage.removeItem("auth_token");
    setToken("");
    setActiveChatId(null);
    setAuthError(false);
  }

  function dismissChangelog() {
    localStorage.setItem("changelog_dismissed", CHANGELOG_ID);
    setChangelogDismissed(true);
  }

  const recentQuestions = getRecentQuestions(chats);

  async function send(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    clearTimeout(unicornTimer.current);
    setShowUnicorn(false);

    let chatId = activeChatId;
    let newMessages;

    if (!chatId) {
      chatId = Date.now().toString();
      const title = q.length > 50 ? q.slice(0, 50) + "..." : q;
      const newChat = { id: chatId, title, messages: [{ role: "user", content: q }], createdAt: Date.now(), updatedAt: Date.now() };
      setChats(prev => { const updated = [newChat, ...prev]; saveChats(updated); return updated; });
      setActiveChatId(chatId);
      newMessages = [{ role: "user", content: q }];
    } else {
      newMessages = [...messages, { role: "user", content: q }];
      updateChat(chatId, newMessages);
    }

    setLoading(true);
    setStreamingText("");

    await streamChat(
      token,
      newMessages,
      (partial) => setStreamingText(partial),
      (final) => {
        const reply = final || "Sorry, I couldn't get a response.";
        updateChat(chatId, [...newMessages, { role: "assistant", content: reply }]);
        setStreamingText("");
        setLoading(false);
        inputRef.current?.focus();
        clearTimeout(unicornTimer.current);
        unicornTimer.current = setTimeout(() => setShowUnicorn(true), 5000);
      },
      (errType) => {
        if (errType === "auth") {
          setAuthError(true);
        } else {
          updateChat(chatId, [...newMessages, { role: "assistant", content: "Sorry, I couldn't get a response." }]);
        }
        setStreamingText("");
        setLoading(false);
      }
    );
  }

  if (!token || authError) return <LoginScreen onLogin={handleLogin} />;

  const empty = messages.length === 0 && !activeChatId;
  const showSidebar = !isMobile || sidebarOpen;

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: "#f5f4f0", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "14px", color: "#333" }}>
      {/* Sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 10 }} />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div style={{
          width: "280px", background: "#1a1a19", color: "#f5f4f0", display: "flex", flexDirection: "column", flexShrink: 0, height: "100%",
          ...(isMobile ? { position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20 } : {}),
        }}>
          <div style={{ padding: "16px", flexShrink: 0 }}>
            <button onClick={startNewChat} style={{ width: "100%", background: "#2a2a29", border: "1px solid #333", borderRadius: "8px", color: "#f5f4f0", padding: "10px 14px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", textAlign: "left" }}>
              + New chat
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            {chats.map(c => (
              <div key={c.id} onClick={() => selectChat(c.id)}
                style={{ padding: "10px 12px", borderRadius: "8px", cursor: "pointer", marginBottom: "2px", background: c.id === activeChatId ? "#333" : "transparent", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}
                onMouseEnter={e => { if (c.id !== activeChatId) e.currentTarget.style.background = "#2a2a29"; }}
                onMouseLeave={e => { if (c.id !== activeChatId) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: "13px", color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.title}</span>
                <button onClick={(e) => deleteChat(c.id, e)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "14px", padding: "2px 4px", flexShrink: 0, lineHeight: 1 }}
                  onMouseEnter={e => e.target.style.color = "#f5f4f0"} onMouseLeave={e => e.target.style.color = "#666"}>×</button>
              </div>
            ))}
            {chats.length === 0 && <p style={{ color: "#555", fontSize: "12px", padding: "12px", textAlign: "center" }}>No conversations yet</p>}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a29" }}>
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#666", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
              onMouseEnter={e => e.target.style.color = "#ccc"} onMouseLeave={e => e.target.style.color = "#666"}>Sign out</button>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ background: "#111110", color: "#f5f4f0", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#f5f4f0", fontSize: "18px", cursor: "pointer", padding: "4px 8px" }}>☰</button>
            )}
            <span onClick={startNewChat} style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: "15px", cursor: "pointer" }}>OAK'S LAB</span>
            {!isMobile && <>
              <span style={{ color: "#666", fontSize: "12px" }}>|</span>
              <span style={{ color: "#c8c6be", fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase" }}>HubSpot Knowledge Base</span>
            </>}
          </div>
          {isMobile && (
            <button onClick={startNewChat} style={{ background: "none", border: "1px solid #444", borderRadius: "6px", color: "#888", fontSize: "11px", padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase" }}>Home</button>
          )}
        </div>

        {/* Messages */}
        <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
            {empty ? (
              <div style={{ paddingTop: "60px" }}>
                {/* What's new banner */}
                {!changelogDismissed && (
                  <div style={{ background: "#fffbeb", border: "1px solid #f5d880", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#92700c", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>What's new</span>
                      <span style={{ fontSize: "13px", color: "#6b5308" }}>{CHANGELOG_TEXT}</span>
                    </div>
                    <button onClick={dismissChangelog} style={{ background: "none", border: "none", color: "#92700c", cursor: "pointer", fontSize: "16px", padding: "2px 6px", flexShrink: 0, lineHeight: 1 }}
                      onMouseEnter={e => e.target.style.color = "#6b5308"} onMouseLeave={e => e.target.style.color = "#92700c"}>×</button>
                  </div>
                )}

                <p style={{ fontSize: "28px", fontWeight: 700, color: "#111110", letterSpacing: "-0.03em", marginBottom: "8px" }}>What do you need to do?</p>
                <p style={{ color: "#666", marginBottom: "24px", fontSize: "15px" }}>These are just suggestions — ask anything about HubSpot.</p>

                <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "1px solid #e0ded8" }}>
                  {["Ask", "Browse"].map((tab) => (
                    <button key={tab} onClick={() => setHomeTab(tab.toLowerCase())}
                      style={{ background: "none", border: "none", borderBottom: homeTab === tab.toLowerCase() ? "2px solid #111110" : "2px solid transparent", padding: "8px 20px", fontSize: "13px", fontWeight: homeTab === tab.toLowerCase() ? 600 : 400, color: homeTab === tab.toLowerCase() ? "#111110" : "#777", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", marginBottom: "-1px" }}>{tab}</button>
                  ))}
                </div>
                {homeTab === "ask" ? (
                  <>
                    {/* Recently asked */}
                    {recentQuestions.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Recently asked</p>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                          {recentQuestions.map((q, i) => (
                            <button key={i} onClick={() => send(q)} style={{ background: "#f9f8f5", border: "1px solid #e0ded8", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", fontSize: "13px", color: "#666", lineHeight: 1.5, transition: "border-color 0.15s", fontFamily: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              onMouseEnter={e => e.target.style.borderColor = "#111110"} onMouseLeave={e => e.target.style.borderColor = "#e0ded8"}>{q}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {SUGGESTIONS.map((cat, ci) => (
                      <div key={ci} style={{ marginBottom: "20px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{cat.label}</p>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                          {cat.items.map((s, i) => (
                            <button key={i} onClick={() => send(s)} style={{ background: "#fff", border: "1px solid #e0ded8", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", fontSize: "13px", color: "#444", lineHeight: 1.5, transition: "border-color 0.15s", fontFamily: "inherit" }}
                              onMouseEnter={e => e.target.style.borderColor = "#111110"} onMouseLeave={e => e.target.style.borderColor = "#e0ded8"}>{s}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                      {[{ key: "all", label: "All" }, { key: "inbound", label: "Inbound" }, { key: "outbound", label: "Outbound" }].map((f) => (
                        <button key={f.key} onClick={() => setBrowseFilter(f.key)}
                          style={{ background: browseFilter === f.key ? "#111110" : "#fff", color: browseFilter === f.key ? "#f5f4f0" : "#555", border: "1px solid", borderColor: browseFilter === f.key ? "#111110" : "#e0ded8", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                          onMouseEnter={e => { if (browseFilter !== f.key) e.currentTarget.style.borderColor = "#111110"; }}
                          onMouseLeave={e => { if (browseFilter !== f.key) e.currentTarget.style.borderColor = "#e0ded8"; }}>{f.label}</button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                      {DOCS.filter(doc => browseFilter === "all" || doc.track === "both" || doc.track === browseFilter).map((doc, di) => (
                        <DocSection key={di} title={doc.title} content={doc.content} icon={doc.icon} viz={doc.viz} isMobile={isMobile} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: "28px" }}>
                    {m.role === "user" ? (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ background: "#111110", color: "#f5f4f0", borderRadius: "16px 16px 4px 16px", padding: "12px 18px", maxWidth: "70%", fontSize: "14px", lineHeight: 1.6 }}>{m.content}</div>
                      </div>
                    ) : (() => {
                      const { hasMarker, cleanContent } = parseAskBarbora(m.content);
                      const userQuestion = i > 0 && messages[i - 1]?.role === "user" ? messages[i - 1].content : "";
                      return (
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ width: "28px", height: "28px", background: "#111110", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#f5f4f0", fontSize: "10px", fontWeight: 700, letterSpacing: "-0.02em" }}>OL</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", lineHeight: 1.7, color: "#222" }}>
                            {renderMarkdown(cleanContent)}
                          </div>
                          {hasMarker && <AskBarboraButton question={userQuestion} />}
                          <CopyButton text={cleanContent} />
                        </div>
                      </div>
                      );
                    })()}
                  </div>
                ))}
                {/* Streaming message */}
                {loading && streamingText && (
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "28px", height: "28px", background: "#111110", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#f5f4f0", fontSize: "10px", fontWeight: 700, letterSpacing: "-0.02em" }}>OL</span>
                      </div>
                      <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", flex: 1, lineHeight: 1.7, color: "#222" }}>
                        {renderMarkdown(streamingText)}
                      </div>
                    </div>
                  </div>
                )}
                {/* Loading dots before stream starts */}
                {loading && !streamingText && <LoadingIndicator />}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ background: "#fff", borderTop: "1px solid #e8e6e0", padding: "16px 24px", flexShrink: 0 }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "10px" }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask a question about HubSpot processes..."
              style={{ flex: 1, border: "1px solid #e0ded8", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#f5f4f0", color: "#111110" }} />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              style={{ background: input.trim() && !loading ? "#111110" : "#e0ded8", color: input.trim() && !loading ? "#f5f4f0" : "#999", border: "none", borderRadius: "10px", padding: "12px 20px", cursor: input.trim() && !loading ? "pointer" : "default", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", transition: "background 0.15s" }}>Ask</button>
          </div>
        </div>
      </div>

      {showUnicorn && <FlyingUnicorn onDone={() => setShowUnicorn(false)} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}
