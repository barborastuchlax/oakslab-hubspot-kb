import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the OAK'S LAB HubSpot assistant. You answer questions from the BD team based strictly on the documentation below. Be concise and direct. Use numbered steps when explaining a process. If something is marked as "to be decided" or "TBD", say so clearly and don't invent an answer.

---

## LIFECYCLE STAGES

### Inbound Track
- Lead: Inbound form submission (non-Talk to Sales). Assigned automatically via workflow.
- MQL: Talk to Sales form submission or direct meeting booking with Josh. Assigned automatically.
- SQL: Josh reviewed, accepted, call scheduled. Pre-qualified before first call. Manual.
- Opportunity: Josh took first call, fit confirmed. Deal created, enters pipeline at Qualification (or Discovery if Jake skipped). Manual.
- Customer: Associated deal marked Closed Won. Automatic.

### Outbound Track
- Empty/no stage: Contact imported, no trigger signal yet.
- Lead: Genuine trigger exists (funding round, hiring signal, leadership change). Manual.
- MQL: Contact responded positively to outreach, call is booked. Manual.
- SQL: First call with Sean done, fit and budget confirmed. Manual.
- Opportunity: Second conversation with clear intent. Deal created. Manual.
- Customer: Associated deal marked Closed Won. Automatic.

### Key differences
- Inbound SQL: before first call (Josh pre-qualifies). Outbound SQL: after first call (Sean confirms fit).
- Inbound deal created after Josh's first call. Outbound deal created after second conversation with Sean.

---

## DEAL PIPELINE STAGES

- Qualification: Tier, Company Type, Industry, Channel, Deal Source
- Discovery/Scoping: Tier, Project Budget, Close Date, How they heard about us?, Deal scored and tier updated?, Amount
- Proposal: Close Date, Project Budget
- Negotiation: none (intentional)
- Contract: none (intentional)
- Closed Won: none (intentional)
- Closed Lost: Loss reason (required)
- Nurture: Nurture Reason (required)

Nurture Reason options: Budget, Internal priorities shifted, Market conditions, Building stakeholder buy-in, Relationship building — not ready yet, Timing, Decision maker not engaged, Fundraising, Other.

Deals enter at Qualification by default, or Discovery if Jake is skipped. A deal is only created when a contact reaches Opportunity stage.

Nurture is NOT a dead end — automated follow-ups at 2, 4, 6 months. Auto-closes to Closed Lost after 6 months with no action.

---

## WORKFLOWS (all active as of 9 March 2026)

- WF-01: New inbound contact sets Lead based on source. Excludes MQL+. Excludes Talk to Sales form.
- WF-02: Talk to Sales form OR Josh meeting booking sets MQL, assigns to Josh, creates task for Barbora.
- WF-03: Other inbound forms (about form, newsletter footer) sets Lead, creates task for Barbora. No owner assigned.
- WF-04: Talk to Sales form OR Josh meeting sends Slack to Josh, creates research task for Josh.
- WF-05: Outbound imports sets Lead Source Category = Outbound. Does NOT set lifecycle stage.
- WF-06: Deal enters Nurture, emails at 2/4/6 months, auto-closes to Closed Lost after 6 months + 1 day.
- WF-07: Deal marked Closed Lost, 183 days later sends email + creates task to check back in.

### Inbound forms note
All forms are Webflow forms (not native HubSpot). Form mapping via native Webflow-HubSpot integration. Submissions sent via Zapier. They show as non-HubSpot forms in HubSpot — this is expected. If a form stops triggering: check Zapier zap and Webflow-HubSpot integration first.

---

## HOW TO: MANUALLY ADD A CONTACT

1. Always find or create the company first.
2. Search HubSpot for the company. If it doesn't exist, create it: Company Name, Industry, Country/Region, City, LinkedIn.
3. Create the contact FROM the company record (ensures auto-association).
4. Fill: First Name, Last Name, Email, Phone, Job Title, LinkedIn URL, Country/Region, City, Lead Source Category (Outbound), Lifecycle Stage (only if genuine trigger — otherwise leave empty), Contact Owner (don't leave unassigned if conversation is in progress).
5. Do NOT create a deal — only create deals at Opportunity stage.

---

## HOW TO: IMPORT FROM CLAY

Two separate imports — companies first, then contacts.

### Companies import
- Go to Contacts > Import > Single file > Companies
- Key fields: Company Name (required), Industry (must match HubSpot dropdown), Country/Region (full name not code), LinkedIn Company Page
- Name import: e.g. 2026-03 — Fintech Outbound — Series B — Companies
- Select Create and update Companies

### Contacts import
- Go to Contacts > Import > Single file > Contacts
- Key fields: First Name, Last Name, Email (required — drives auto-association), Phone, LinkedIn URL, Job Title
- Add in Clay before export: Lead Source Category = Outbound, Channel, Deal Source
- Do NOT include: Lifecycle Stage, Lead Status
- Name import: e.g. 2026-03 — Fintech Outbound — Series B — Contacts
- Select Create and update Contacts
- HubSpot auto-associates contacts to companies when email domain matches company website domain

### After both imports
1. Check both import summaries
2. Spot-check 5-10 contacts — verify company association, Lead Source = Outbound
3. Fix orphaned contacts (personal emails or domain mismatches won't auto-associate)
4. Do not set Lifecycle Stage manually

---

## HOW TO: MOVE OUTBOUND CONTACTS THROUGH STAGES

- Empty to Lead: genuine trigger signal exists (funding, hiring, leadership change)
- Lead to MQL: responded positively, call booked
- MQL to SQL: first call with Sean done, fit + budget confirmed
- SQL to Opportunity: second conversation, clear intent to move forward, create deal now

Rules: Don't set Lead just because imported. Don't create deal at SQL. Don't move contacts backwards if they go cold.

---

## HOW TO: REVIEW A NEW LEAD (Barbora)

When WF-03 fires (non-Talk to Sales form), Barbora gets a task.
1. Open contact — check who they are, what company, does it fit OAK'S LAB ICP?
2. If worth passing to Josh: upgrade to MQL, assign to Josh Urban, create follow-up task for Josh.
3. If not worth pursuing: leave as Lead, add a note, close the task.

---

## HOW TO: HANDLE A NEW MQL (Josh)

Josh gets: Slack notification + task + email.
1. Review the contact — who are they, does their company fit OAK'S LAB ICP?
2. Score: set Lead Quality Tier (Tier 1 = perfect / Tier 2 = decent / Tier 3 = bad fit / Not a fit)
3. If not a fit: set Tier = Not a fit, make a note. No deal.
4. If worth pursuing: confirm call, update Lifecycle Stage to SQL.
5. After call — fit confirmed: update to Opportunity, create deal. Not a fit: set tier, make a note.

---

## HOW TO: CREATE A DEAL

Only create when contact is at Opportunity stage.
1. Open contact, set Lifecycle Stage to Opportunity
2. Deals panel, click + Add
3. Name = company name only (e.g. Acme)
4. Pipeline = New Business
5. Stage = Qualification (or Discovery if Jake skipped)
6. Set Deal Type (New Business / Existing Business)
7. Set Channel (Outbound / Inbound / Client Expansion)
8. Fill required properties for the stage
9. Click Create deal

Sean creates outbound deals. Josh creates inbound deals.

---

## HOW TO: MOVE A DEAL THROUGH THE PIPELINE

Use board view in HubSpot. Drag deal to next stage or open deal and update.

Before moving to each stage:
- Discovery: Jake's intro call done, strategic fit confirmed
- Proposal: requirements scoped, ready to send proposal
- Negotiation: proposal sent, reviewing terms
- Contract: commercial terms agreed
- Closed Won: contract signed
- Closed Lost: no longer moving forward (loss reason required)
- Nurture: good fit but not ready (nurture reason required)

Always fill required properties. Keep close date up to date. Add notes after every significant interaction.

---

## HOW TO: MOVE TO NURTURE OR CLOSED LOST

### Nurture
- Use when genuine potential within 6 months but not right now
- Don't use Nurture to avoid Closed Lost
- Fill Nurture Reason (required)
- Reminders at 2, 4, 6 months
- Auto-closes to Closed Lost after 6 months

### Closed Lost
- Use when no realistic prospect within 6 months
- Fill Loss reason (required, cannot skip)
- After 6 months: email + task to check back in

---

## LEGACY CONTACTS

Not deleted — marked non-marketing, hidden from default views. Re-engage = return to active.

Criteria: no activity since before Jan 2025 + last activity over 365 days ago (~30,700), Do Not Contact (~4,400), hard bounce (~200), deactivated owner (~1,900).

A company is legacy if ALL its contacts are legacy.

Edge case: contact imported after 1 March 2026 merges with existing, mark original as Legacy = No.

---

## TO BE DECIDED (no answers yet — team discussion needed)

- Tier definitions: exact criteria for Tier 1/2/3 for both contacts and companies are drafted but not yet confirmed by the team.
- Qualification stage name: may be renamed (options: Intro Call, Initial Meeting, First Call).
- Inbound form updates: whether to add Company Name field and self-reported attribution to forms.
- Lead Intake stage: to be reviewed and removed once migration complete.`;

const SUGGESTIONS = [
  "What do I do when a new MQL comes in?",
  "How do I import contacts from Clay?",
  "When should I create a deal?",
  "What's the difference between Nurture and Closed Lost?",
  "How do I manually add a new contact?",
  "I've stopped receiving workflow notifications — what should I check?",
];

function renderMarkdown(text) {
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
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(<li key={i} style={{ marginBottom: "4px" }}>{formatInline(lines[i].replace(/^\d+\.\s/, ""))}</li>);
        i++;
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
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} style={{ background: "#e8e6e0", padding: "1px 5px", borderRadius: "3px", fontSize: "12px", fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't get a response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't get a response." }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  const empty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: "#f5f4f0", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "14px", color: "#333" }}>
      {/* Header */}
      <div style={{ background: "#111110", color: "#f5f4f0", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: "15px" }}>OAK'S LAB</span>
          <span style={{ color: "#666", fontSize: "12px" }}>|</span>
          <span style={{ color: "#c8c6be", fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase" }}>HubSpot Knowledge Base</span>
        </div>
        <span style={{ color: "#666", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>BD Team</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
          {empty ? (
            <div style={{ paddingTop: "60px" }}>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#111110", letterSpacing: "-0.03em", marginBottom: "8px" }}>What do you need to do?</p>
              <p style={{ color: "#888", marginBottom: "40px", fontSize: "15px" }}>Ask anything about HubSpot processes, workflows, or pipeline.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => send(s)} style={{ background: "#fff", border: "1px solid #e0ded8", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", fontSize: "13px", color: "#444", lineHeight: 1.5, transition: "border-color 0.15s", fontFamily: "inherit" }}
                    onMouseEnter={e => e.target.style.borderColor = "#111110"}
                    onMouseLeave={e => e.target.style.borderColor = "#e0ded8"}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ marginBottom: "28px" }}>
                {m.role === "user" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "#111110", color: "#f5f4f0", borderRadius: "16px 16px 4px 16px", padding: "12px 18px", maxWidth: "70%", fontSize: "14px", lineHeight: 1.6 }}>
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "28px", height: "28px", background: "#111110", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#f5f4f0", fontSize: "10px", fontWeight: 700, letterSpacing: "-0.02em" }}>OL</span>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", flex: 1, lineHeight: 1.7, color: "#222" }}>
                      {renderMarkdown(m.content)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "28px" }}>
              <div style={{ width: "28px", height: "28px", background: "#111110", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#f5f4f0", fontSize: "10px", fontWeight: 700 }}>OL</span>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", display: "flex", gap: "5px", alignItems: "center" }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width: "6px", height: "6px", background: "#c8c6be", borderRadius: "50%", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background: "#fff", borderTop: "1px solid #e8e6e0", padding: "16px 24px", flexShrink: 0 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "10px" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask a question about HubSpot processes..."
            style={{ flex: 1, border: "1px solid #e0ded8", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#f5f4f0", color: "#111110" }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ background: input.trim() && !loading ? "#111110" : "#e0ded8", color: input.trim() && !loading ? "#f5f4f0" : "#999", border: "none", borderRadius: "10px", padding: "12px 20px", cursor: input.trim() && !loading ? "pointer" : "default", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", transition: "background 0.15s" }}>
            Ask
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} } * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}