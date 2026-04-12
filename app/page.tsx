"use client";

import { useState, useRef } from "react";

const GOALS = ["Engagement", "Followers", "Leads", "Sales"];
const HOOK_COUNTS = [30, 50, 100];

const CATEGORY_CONFIG = {
  pain: { label: "Pain Hooks", emoji: "🔥" },
  curiosity: { label: "Curiosity Hooks", emoji: "🧠" },
  contrarian: { label: "Contrarian Hooks", emoji: "⚡" },
  authority: { label: "Authority Hooks", emoji: "👑" },
};

type HooksData = Record<string, string[]>;

function buildPrompt(niche: string, audience: string, goal: string, count: number) {
  const pain = Math.round(count * 0.3);
  const cur = Math.round(count * 0.3);
  const con = Math.round(count * 0.2);
  const auth = count - pain - cur - con;

  return `You are a viral Instagram content strategist for the Indian market.

Generate ${count} scroll-stopping Instagram hooks for:
- Niche: ${niche}
- Target Audience: ${audience}
- Goal: ${goal}

STRICT RULES:
- Every hook must be under 12 words
- Simple 8th-grade language
- Include Indian context where relevant (₹, salary, EMI, jobs, middle class)
- No generic phrases — every hook must be unique and scroll-stopping
- Use "you" to make it personal

Return ONLY valid JSON, no markdown, no preamble:
{
  "pain": [${pain} strings — pain hooks about money stress, career frustration, regret, FOMO with real ₹ amounts],
  "curiosity": [${cur} strings — curiosity hooks using open loops, secrets, unexpected outcomes],
  "contrarian": [${con} strings — contrarian hooks challenging common beliefs],
  "authority": [${auth} strings — authority hooks using story, credibility, transformation]
}`;
}

export default function Home() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("Engagement");
  const [count, setCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<HooksData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pain");
  const resultsRef = useRef<HTMLDivElement>(null);

  async function generate() {
    if (!niche.trim() || !audience.trim()) {
      setError("Please fill in both Niche and Target Audience.");
      return;
    }
    setError("");
    setLoading(true);
    setHooks(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, audience, goal, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setHooks(data);
      setActiveTab("pain");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyHook(hook: string, id: string) {
    navigator.clipboard.writeText(hook);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    if (!hooks) return;
    const all = Object.entries(hooks)
      .map(([cat, list]) => `--- ${CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label} ---\n${list.map((h, i) => `${i + 1}. ${h}`).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(all);
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  }

  const totalGenerated = hooks ? Object.values(hooks).reduce((a, b) => a + b.length, 0) : 0;
  const activeHooks = hooks?.[activeTab] || [];

  return (
    <main style={{ fontFamily: "Georgia, serif", maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#888", textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>
          Instagram Hook Generator
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 400, margin: "0 0 6px", lineHeight: 1.2 }}>
          Stop the scroll.<br />Start the follow.
        </h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0, fontFamily: "system-ui, sans-serif" }}>
          AI-powered hooks calibrated for the Indian audience.
        </p>
      </div>

      <div style={{ background: "#f5f5f5", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5, fontFamily: "system-ui" }}>Your Niche</label>
            <input
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="e.g. Personal Finance, Fitness, AI Tools"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" as const }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5, fontFamily: "system-ui" }}>Target Audience</label>
            <input
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="e.g. Salaried Indians aged 25-35"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" as const }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5, fontFamily: "system-ui" }}>Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}>
              {GOALS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 5, fontFamily: "system-ui" }}>Number of Hooks</label>
            <select value={count} onChange={e => setCount(Number(e.target.value))} style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}>
              {HOOK_COUNTS.map(c => <option key={c} value={c}>{c} hooks</option>)}
            </select>
          </div>
        </div>
        {error && <p style={{ color: "#e2533a", fontSize: 13, margin: "0 0 12px", fontFamily: "system-ui" }}>{error}</p>}
        <button
          onClick={generate}
          disabled={loading}
          style={{ background: "#111", color: "#fff", border: "none", padding: "11px 28px", borderRadius: 6, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "system-ui" }}
        >
          {loading ? `Generating ${count} hooks…` : `Generate ${count} Hooks`}
        </button>
      </div>

      {hooks && (
        <div ref={resultsRef}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ fontFamily: "system-ui", fontSize: 13, color: "#555" }}>
              {totalGenerated} hooks generated for <strong>{niche}</strong>
            </div>
            <button onClick={copyAll} style={{ background: "none", border: "1px solid #ddd", borderRadius: 4, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "system-ui" }}>
              {copied === "all" ? "✓ Copied all" : "Copy all hooks"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" as const }}>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{ background: activeTab === key ? "#eee" : "none", border: "1.5px solid #ddd", borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "system-ui", fontWeight: activeTab === key ? 500 : 400 }}
              >
                {cfg.emoji} {cfg.label} ({hooks[key]?.length || 0})
              </button>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: "0.75rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: "0.75rem", borderBottom: "1px solid #eee", marginBottom: "0.25rem" }}>
              <span>{CATEGORY_CONFIG[activeTab as keyof typeof CATEGORY_CONFIG]?.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "system-ui" }}>{CATEGORY_CONFIG[activeTab as keyof typeof CATEGORY_CONFIG]?.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#888", fontFamily: "system-ui" }}>{activeHooks.length} hooks</span>
            </div>
            {activeHooks.map((hook, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < activeHooks.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <span style={{ fontSize: 12, color: "#aaa", fontFamily: "system-ui", minWidth: 20, paddingTop: 2 }}>{i + 1}</span>
                <span style={{ fontSize: 15, lineHeight: 1.55, flex: 1 }}>{hook}</span>
                <button
                  onClick={() => copyHook(hook, `${activeTab}-${i}`)}
                  style={{ background: "none", border: "1px solid #eee", borderRadius: 4, padding: "3px 8px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" as const, fontFamily: "system-ui" }}
                >
                  {copied === `${activeTab}-${i}` ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <div
                key={key}
                onClick={() => setActiveTab(key)}
                style={{ background: "#f5f5f5", borderRadius: 8, padding: "0.75rem 1rem", cursor: "pointer" }}
              >
                <div style={{ fontSize: 11, color: "#888", fontFamily: "system-ui", marginBottom: 4 }}>{cfg.label}</div>
                <div style={{ fontSize: 22, fontWeight: 400 }}>{hooks[key]?.length || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
