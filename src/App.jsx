import { useState, useRef, useEffect, useCallback } from "react";

const SUGGESTIONS = [
  { label: "Processes", items: [
    "What do I do when a new MQL comes in?",
    "How do I import contacts from Clay?",
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
];

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
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  const [showUnicorn, setShowUnicorn] = useState(false);
  const unicornTimer = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingText]);

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
            <span style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: "15px" }}>OAK'S LAB</span>
            {!isMobile && <>
              <span style={{ color: "#666", fontSize: "12px" }}>|</span>
              <span style={{ color: "#c8c6be", fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase" }}>HubSpot Knowledge Base</span>
            </>}
          </div>
          {isMobile && (
            <button onClick={startNewChat} style={{ background: "none", border: "1px solid #444", borderRadius: "6px", color: "#888", fontSize: "11px", padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase" }}>New chat</button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
            {empty ? (
              <div style={{ paddingTop: "60px" }}>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "#111110", letterSpacing: "-0.03em", marginBottom: "8px" }}>What do you need to do?</p>
                <p style={{ color: "#888", marginBottom: "40px", fontSize: "15px" }}>Ask anything about HubSpot processes, workflows, or pipeline.</p>
                {SUGGESTIONS.map((cat, ci) => (
                  <div key={ci} style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{cat.label}</p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                      {cat.items.map((s, i) => (
                        <button key={i} onClick={() => send(s)} style={{ background: "#fff", border: "1px solid #e0ded8", borderRadius: "10px", padding: "14px 16px", textAlign: "left", cursor: "pointer", fontSize: "13px", color: "#444", lineHeight: 1.5, transition: "border-color 0.15s", fontFamily: "inherit" }}
                          onMouseEnter={e => e.target.style.borderColor = "#111110"} onMouseLeave={e => e.target.style.borderColor = "#e0ded8"}>{s}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: "28px" }}>
                    {m.role === "user" ? (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ background: "#111110", color: "#f5f4f0", borderRadius: "16px 16px 4px 16px", padding: "12px 18px", maxWidth: "70%", fontSize: "14px", lineHeight: 1.6 }}>{m.content}</div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ width: "28px", height: "28px", background: "#111110", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#f5f4f0", fontSize: "10px", fontWeight: 700, letterSpacing: "-0.02em" }}>OL</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ background: "#fff", border: "1px solid #e8e6e0", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", lineHeight: 1.7, color: "#222" }}>
                            {renderMarkdown(m.content)}
                          </div>
                          <CopyButton text={m.content} />
                        </div>
                      </div>
                    )}
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
