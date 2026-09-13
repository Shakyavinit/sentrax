import { useState, useCallback, useRef, useEffect } from "react";

// ─── SENTRAX Design Tokens ──────────────────────────────────────────────────
const T = {
  void:    "#080C12", surface: "#0D1520", elevated: "#121E2E",
  overlay: "#1A2A3D", subtle:  "#1F3050",
  dimBorder: "#1C2E42", border: "#233A52", brightBorder: "#2E4E70",
  textPrimary: "#E8EFF7", textSecondary: "#8FA8C0", textMuted: "#4D6B85",
  accent: "#0E7FE0", accentBright: "#1A9FFF", accentGlow: "rgba(14,127,224,0.15)",
  alertRed: "#FF3B3B", alertDim: "rgba(255,59,59,0.12)",
  warn: "#FF8C00", warnDim: "rgba(255,140,0,0.12)",
  ok: "#00C875", okDim: "rgba(0,200,117,0.10)",
  neutral: "#4D6B85",
  fontSans: "'Inter', -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

// ─── AGENT DEFINITIONS ───────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "github",
    name: "GitHub Scout",
    icon: "⬡",
    color: "#7C3AED",
    colorDim: "rgba(124,58,237,0.12)",
    role: "GITHUB RESEARCHER",
    task: `Search for GitHub repositories relevant to SENTRAX — a CCTV intelligence platform for vehicle detection, ANPR (license plate recognition), cross-camera tracking, and digital evidence management.

Find repos for: YOLOv8 vehicle detection, PaddleOCR license plate recognition, DeepSORT tracking, FastAPI CCTV backends, vehicle Re-ID, RTSP stream processing, OpenCV vehicle detection.

For each repo return:
- repo_name: exact repo name
- github_url: full URL
- stars: approximate star count
- why_useful: 1 sentence why it helps SENTRAX
- specific_files: list 2-3 specific files/modules to steal or adapt
- install_command: pip/npm install command

Return JSON array of 6 repos. NO markdown, NO backticks, pure JSON array.`,
  },
  {
    id: "api",
    name: "API Hunter",
    icon: "⬢",
    color: "#0891B2",
    colorDim: "rgba(8,145,178,0.12)",
    role: "API RESEARCHER",
    task: `Find free/open APIs useful for SENTRAX — a law enforcement CCTV platform.

Find APIs for: vehicle plate lookup (India), geocoding/reverse geocoding, map tiles (dark theme), IP geolocation, vehicle type classification, face/object detection, government vehicle databases, stream testing/demo cameras.

For each API return:
- api_name: name
- base_url: the actual API endpoint base
- auth_type: none/key/oauth
- free_tier: what's free
- endpoint_example: one real example URL or curl
- use_in_sentrax: exactly where in SENTRAX to use this

Return JSON array of 8 APIs. NO markdown, NO backticks, pure JSON array.`,
  },
  {
    id: "data",
    name: "Data Collector",
    icon: "◈",
    color: "#059669",
    colorDim: "rgba(5,150,105,0.12)",
    role: "DATA RESEARCHER",
    task: `Find open datasets and data sources useful for SENTRAX — a vehicle detection and tracking platform for Indian law enforcement.

Find datasets for: Indian vehicle registration number formats by state, Indian city GIS/road maps, vehicle type classification training data, CCTV vehicle detection training images, synthetic license plate generators, Indian city camera location data.

For each dataset return:
- dataset_name: name
- source_url: where to download/access
- size_mb: approximate size
- format: csv/json/images/etc
- license: MIT/CC/etc
- how_to_use: exactly how to integrate into SENTRAX
- download_command: wget/curl command if possible

Return JSON array of 6 datasets. NO markdown, NO backticks, pure JSON array.`,
  },
  {
    id: "tools",
    name: "Tool Finder",
    icon: "◇",
    color: "#D97706",
    colorDim: "rgba(217,119,6,0.12)",
    role: "TOOLS RESEARCHER",
    task: `Find CLI tools, Python packages, and techniques for SENTRAX — a CCTV intelligence platform.

Find tools for: RTSP stream testing/simulation, license plate OCR improvement, video frame extraction, GPU acceleration for CV, Docker GPU passthrough, FFmpeg RTSP options, fake RTSP camera servers for testing, load testing video streams, PostgreSQL PostGIS spatial queries.

For each tool return:
- tool_name: name
- install: pip install / apt install / docker pull command
- category: cli/python-lib/docker-tool
- key_command: the most important command to know
- sentrax_use: specific use case in our project
- pro_tip: one non-obvious tip

Return JSON array of 8 tools. NO markdown, NO backticks, pure JSON array.`,
  },
  {
    id: "frontend",
    name: "Frontend Scout",
    icon: "◉",
    color: "#EC4899",
    colorDim: "rgba(236,72,153,0.12)",
    role: "FRONTEND RESEARCHER",
    task: `Find cutting-edge React/JS frontend components and techniques for SENTRAX — a dark-themed law enforcement surveillance dashboard.

Find: dark tactical map components (Leaflet dark themes), React real-time video overlays for CCTV feeds, animated alert notification systems, timeline visualization components, evidence chain-of-custody UI patterns, React canvas overlays for bounding boxes on video, dark data table components, journey path animation on maps.

For each component/technique return:
- name: component or library name
- npm_package: exact npm package name to install
- import_example: exact import statement
- code_snippet: 5-10 line usage example
- why_better: why better than building from scratch
- demo_url: if available

Return JSON array of 7 items. NO markdown, NO backticks, pure JSON array.`,
  },
  {
    id: "security",
    name: "Security Agent",
    icon: "⬟",
    color: "#DC2626",
    colorDim: "rgba(220,38,38,0.12)",
    role: "SECURITY RESEARCHER",
    task: `Find security hardening techniques, common vulnerabilities to prevent, and security best practices for SENTRAX — a law enforcement platform handling digital evidence.

Focus on: FastAPI JWT security best practices, PostgreSQL row-level security, evidence tamper detection beyond SHA-256, RTSP stream authentication, Docker container security, audit log integrity, API rate limiting patterns, SQL injection in vehicle search, WebSocket authentication, digital forensics chain of custody standards.

For each security item return:
- vulnerability_or_practice: the issue or practice
- severity: critical/high/medium
- attack_vector: how an attacker would exploit this
- fix_code: actual Python/SQL/config snippet to implement
- standard_reference: OWASP/NIST/etc reference if applicable

Return JSON array of 8 items. NO markdown, NO backticks, pure JSON array.`,
  },
  {
    id: "backend",
    name: "Backend Scout",
    icon: "⬡",
    color: "#0E7FE0",
    colorDim: "rgba(14,127,224,0.12)",
    role: "BACKEND RESEARCHER",
    task: `Find advanced FastAPI patterns, PostgreSQL optimizations, and backend techniques for SENTRAX — a high-throughput CCTV processing platform.

Find: FastAPI background task patterns for RTSP processing, PostgreSQL BRIN indexes for timestamp queries, Redis pub/sub for real-time alerts, Celery chain patterns for AI pipelines, asyncio patterns for concurrent camera streams, PostGIS spatial queries for vehicle journey mapping, FastAPI SSE (Server-Sent Events) implementation, pgvector for vehicle Re-ID embeddings storage.

For each technique return:
- technique_name: name
- use_case: specific scenario in SENTRAX
- code_snippet: working Python/SQL code block (10-20 lines)
- performance_gain: expected improvement
- gotcha: one common mistake to avoid

Return JSON array of 7 techniques. NO markdown, NO backticks, pure JSON array.`,
  },
  {
    id: "trends",
    name: "Trend Watcher",
    icon: "◈",
    color: "#7C3AED",
    colorDim: "rgba(124,58,237,0.12)",
    role: "TRENDS RESEARCHER",
    task: `Find the latest trending technologies, papers, and approaches in 2024-2025 that could enhance SENTRAX — a CCTV vehicle intelligence platform.

Look for: latest YOLO versions beyond v8, newer ANPR approaches (transformer-based), vision-language models for surveillance, real-time vehicle tracking improvements, edge AI for cameras, WebRTC for low-latency camera feeds, new PostgreSQL features for time-series, Indian government VAAHAN/SARATHI API developments, AI-powered forensics tools.

For each trend return:
- trend_name: name
- year: when it emerged (2024/2025)
- why_relevant: specific benefit for SENTRAX
- maturity: experimental/stable/production-ready
- how_to_add: concrete integration steps for SENTRAX
- resource_url: paper, GitHub, or docs URL

Return JSON array of 8 trends. NO markdown, NO backticks, pure JSON array.`,
  },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  app: {
    background: T.void, minHeight: "100vh", fontFamily: T.fontSans,
    color: T.textPrimary, padding: "0",
  },
  topBar: {
    background: T.surface, borderBottom: `1px solid ${T.dimBorder}`,
    padding: "0 24px", height: 52, display: "flex", alignItems: "center",
    justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: T.textPrimary,
  },
  logoIcon: {
    width: 28, height: 28, background: T.accent, borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, color: "#fff",
  },
  body: { display: "flex", height: "calc(100vh - 52px)" },
  sidebar: {
    width: 220, background: T.surface, borderRight: `1px solid ${T.dimBorder}`,
    display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto",
  },
  sideSection: { padding: "16px 12px 8px", fontSize: 10, fontWeight: 600,
    color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" },
  sideItem: (active, color) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
    borderRadius: 6, cursor: "pointer", margin: "1px 4px",
    background: active ? `rgba(${hexToRgb(color)},0.15)` : "transparent",
    borderLeft: active ? `2px solid ${color}` : "2px solid transparent",
    color: active ? T.textPrimary : T.textSecondary,
    fontSize: 13, fontWeight: active ? 500 : 400,
    transition: "all 120ms ease",
  }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  content: { flex: 1, overflowY: "auto", padding: "20px 24px" },
  card: {
    background: T.surface, border: `1px solid ${T.dimBorder}`,
    borderRadius: 8, overflow: "hidden",
  },
  cardHeader: {
    padding: "12px 16px", borderBottom: `1px solid ${T.dimBorder}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: T.textPrimary },
  badge: (color, bgColor) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 600,
    fontFamily: T.fontMono, background: bgColor, color: color,
    border: `1px solid ${color}33`, textTransform: "uppercase", letterSpacing: "0.05em",
  }),
  btn: (variant = "primary") => ({
    padding: variant === "sm" ? "5px 10px" : "7px 14px",
    borderRadius: 4, border: "none", cursor: "pointer", fontFamily: T.fontSans,
    fontSize: variant === "sm" ? 11 : 12, fontWeight: 500,
    background: variant === "danger" ? T.alertRed : variant === "ghost"
      ? "transparent" : variant === "success" ? T.ok : T.accent,
    color: "#fff", transition: "all 120ms ease",
    border: variant === "ghost" ? `1px solid ${T.border}` : "none",
  }),
  result: (approved) => ({
    padding: "12px 14px", borderRadius: 6, margin: "8px 0",
    border: `1px solid ${approved === "approved" ? T.ok + "33"
      : approved === "rejected" ? T.alertRed + "33" : T.dimBorder}`,
    background: approved === "approved" ? T.okDim
      : approved === "rejected" ? T.alertDim : T.elevated,
    transition: "all 200ms ease",
  }),
  mono: { fontFamily: T.fontMono, fontSize: 11, color: T.textSecondary },
  progress: (pct, color) => ({
    height: 3, borderRadius: 2, background: T.dimBorder,
    position: "relative", overflow: "hidden",
    "::after": { content: '""', position: "absolute", left: 0, top: 0,
      width: `${pct}%`, height: "100%", background: color },
  }),
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ─── CLAUDE API CALL ─────────────────────────────────────────────────────────
async function callClaude(agentRole, task, onChunk) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: `You are ${agentRole} for SENTRAX — a CCTV Intelligence & Digital Forensics Platform for law enforcement. You respond ONLY with valid JSON arrays. No preamble. No markdown. No backticks. Pure JSON starting with [ and ending with ].`,
      messages: [{ role: "user", content: task }],
    }),
  });
  const data = await response.json();
  const text = data?.content?.[0]?.text || "[]";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

async function callManager(agentResults, onChunk) {
  const summary = Object.entries(agentResults).map(([id, items]) => {
    const agent = AGENTS.find(a => a.id === id);
    return `\n=== ${agent?.name} ===\n${JSON.stringify(items?.slice(0,3), null, 1)}`;
  }).join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: `You are the Team Manager for SENTRAX research. You review agent findings and score them. Return ONLY valid JSON. No markdown. No backticks.`,
      messages: [{
        role: "user",
        content: `Review these research findings from 8 sub-agents working on SENTRAX.
Score each agent's batch 1-10 for relevance. Pick the top 3 HIGH-PRIORITY items across ALL agents that the boss must see immediately.

Findings:${summary}

Return JSON object:
{
  "agent_scores": { "github": 8, "api": 7, ... },
  "top_priority": [
    { "agent_id": "github", "item_index": 0, "priority_reason": "why critical for boss", "action": "ADD_TO_PROJECT|INVESTIGATE_FURTHER|SKIP", "folder": "research/github/" },
    ... 3 total items
  ],
  "manager_summary": "2 sentence summary of overall research quality"
}`
      }],
    }),
  });
  const data = await response.json();
  const text = data?.content?.[0]?.text || "{}";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { agent_scores: {}, top_priority: [], manager_summary: "Analysis complete." };
  }
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function AgentCard({ agent, status, results, score, onViewResults }) {
  const stateColor = status === "done" ? T.ok
    : status === "running" ? T.accent
    : status === "error" ? T.alertRed : T.neutral;
  const stateLabel = status === "done" ? "DONE"
    : status === "running" ? "SCANNING"
    : status === "error" ? "ERROR" : "IDLE";

  return (
    <div style={{
      ...S.card, padding: 14, cursor: "pointer",
      borderLeft: `3px solid ${agent.color}`,
      transition: "all 150ms ease",
    }} onClick={() => results?.length && onViewResults(agent)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, color: agent.color }}>{agent.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{agent.name}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.fontMono }}>{agent.id.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={S.badge(stateColor, stateColor + "15")}>{stateLabel}</span>
          {score && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, fontFamily: T.fontMono }}>SCORE {score}/10</div>}
        </div>
      </div>
      <div style={{ height: 3, background: T.dimBorder, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, background: agent.color,
          width: status === "done" ? "100%" : status === "running" ? "60%" : "0%",
          transition: "width 0.5s ease",
        }} />
      </div>
      {results?.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
          {results.length} items found · tap to review
        </div>
      )}
    </div>
  );
}

function ResultsPanel({ agent, results, onApprove, onReject, onBackup, decisions }) {
  if (!agent || !results) return null;
  return (
    <div style={{ ...S.card, marginTop: 16 }}>
      <div style={S.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: agent.color, fontSize: 16 }}>{agent.icon}</span>
          <span style={S.cardTitle}>{agent.name} — Results</span>
        </div>
        <span style={S.badge(agent.color, agent.colorDim)}>{results.length} items</span>
      </div>
      <div style={{ maxHeight: 480, overflowY: "auto", padding: 12 }}>
        {results.map((item, i) => {
          const key = `${agent.id}-${i}`;
          const decision = decisions[key];
          const title = item.repo_name || item.api_name || item.dataset_name
            || item.tool_name || item.name || item.technique_name
            || item.trend_name || item.vulnerability_or_practice || `Item ${i+1}`;
          const desc = item.why_useful || item.use_in_sentrax || item.how_to_use
            || item.sentrax_use || item.why_better || item.why_relevant
            || item.attack_vector || item.use_case || "";
          const extra = item.install_command || item.endpoint_example
            || item.download_command || item.install || item.npm_package
            || item.fix_code || item.code_snippet || item.resource_url || "";

          return (
            <div key={key} style={S.result(decision)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, flex: 1 }}>{title}</div>
                <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                  {!decision && <>
                    <button style={S.btn("success")} onClick={() => onApprove(key)}>✓ Add</button>
                    <button style={S.btn()} onClick={() => onBackup(key)}>⬡ Save</button>
                    <button style={S.btn("danger")} onClick={() => onReject(key)}>✗ Skip</button>
                  </>}
                  {decision && (
                    <span style={S.badge(
                      decision === "approved" ? T.ok : decision === "backup" ? T.accent : T.alertRed,
                      decision === "approved" ? T.okDim : decision === "backup" ? T.accentGlow : T.alertDim
                    )}>{decision === "approved" ? "ADDED" : decision === "backup" ? "SAVED" : "SKIPPED"}</span>
                  )}
                </div>
              </div>
              {desc && <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>{desc}</div>}
              {extra && (
                <div style={{ background: T.void, borderRadius: 4, padding: "6px 10px", fontSize: 11, fontFamily: T.fontMono, color: T.textMuted, wordBreak: "break-all" }}>
                  {typeof extra === "string" ? extra.substring(0, 200) : JSON.stringify(extra).substring(0, 200)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BossPanel({ topPriority, managerSummary, agentResults, agentScores, decisions, onApprove, onReject, onBackup }) {
  const priorityItems = (topPriority || []).map(p => {
    const agent = AGENTS.find(a => a.id === p.agent_id);
    const items = agentResults[p.agent_id] || [];
    const item = items[p.item_index];
    if (!item || !agent) return null;
    const key = `${p.agent_id}-${p.item_index}`;
    const decision = decisions[key];
    const title = item.repo_name || item.api_name || item.dataset_name
      || item.tool_name || item.name || item.technique_name
      || item.trend_name || item.vulnerability_or_practice || "Priority Item";
    return { ...p, agent, item, key, decision, title };
  }).filter(Boolean);

  return (
    <div>
      {managerSummary && (
        <div style={{ ...S.card, padding: 14, marginBottom: 16, borderLeft: `3px solid ${T.accent}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 6, letterSpacing: "0.08em" }}>MANAGER REPORT</div>
          <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{managerSummary}</div>
          {agentScores && Object.keys(agentScores).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {AGENTS.map(a => agentScores[a.id] && (
                <span key={a.id} style={{ fontSize: 10, fontFamily: T.fontMono, color: T.textMuted }}>
                  {a.name.split(" ")[0]}: <span style={{ color: agentScores[a.id] >= 7 ? T.ok : agentScores[a.id] >= 5 ? T.warn : T.alertRed }}>{agentScores[a.id]}/10</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 10, letterSpacing: "0.08em" }}>HIGH PRIORITY — MANAGER ESCALATIONS</div>
      {priorityItems.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: T.textMuted, fontSize: 13 }}>
          Waiting for manager analysis...
        </div>
      )}
      {priorityItems.map((p) => (
        <div key={p.key} style={{ ...S.result(p.decision), borderLeft: `3px solid ${p.agent.color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: p.agent.color, fontWeight: 600, marginBottom: 3 }}>{p.agent.name}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{p.title}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
              {!p.decision && <>
                <button style={S.btn("success")} onClick={() => onApprove(p.key)}>✓ Add to Project</button>
                <button style={S.btn()} onClick={() => onBackup(p.key)}>⬡ Backup</button>
                <button style={S.btn("danger")} onClick={() => onReject(p.key)}>✗ Skip</button>
              </>}
              {p.decision && (
                <span style={S.badge(
                  p.decision === "approved" ? T.ok : p.decision === "backup" ? T.accent : T.alertRed,
                  p.decision === "approved" ? T.okDim : p.decision === "backup" ? T.accentGlow : T.alertDim
                )}>{p.decision === "approved" ? "✓ ADDED TO PROJECT" : p.decision === "backup" ? "⬡ BACKED UP" : "✗ SKIPPED"}</span>
              )}
            </div>
          </div>
          <div style={{ background: T.void, borderRadius: 4, padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: T.accent, fontWeight: 600, marginBottom: 4 }}>WHY PRIORITY:</div>
            <div style={{ fontSize: 12, color: T.textSecondary }}>{p.priority_reason}</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={S.badge(T.accent, T.accentGlow)}>{p.action}</span>
            {p.folder && <span style={{ fontSize: 11, fontFamily: T.fontMono, color: T.textMuted }}>{p.folder}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExportPanel({ decisions, agentResults }) {
  const approved = Object.entries(decisions)
    .filter(([,v]) => v === "approved")
    .map(([key]) => {
      const [agentId, idx] = key.split("-");
      const item = agentResults[agentId]?.[parseInt(idx)];
      return { agentId, item };
    }).filter(x => x.item);

  const backup = Object.entries(decisions)
    .filter(([,v]) => v === "backup")
    .map(([key]) => {
      const [agentId, idx] = key.split("-");
      const item = agentResults[agentId]?.[parseInt(idx)];
      return { agentId, item };
    }).filter(x => x.item);

  const exportText = `# SENTRAX Research Export
Generated: ${new Date().toISOString()}
Team: CipherNetra

## APPROVED FOR PROJECT (${approved.length} items)
${approved.map(({agentId, item}) => {
  const title = item.repo_name || item.api_name || item.dataset_name
    || item.tool_name || item.name || item.technique_name
    || item.trend_name || item.vulnerability_or_practice || "Item";
  return `### [${agentId.toUpperCase()}] ${title}\n${JSON.stringify(item, null, 2)}`;
}).join("\n\n")}

## BACKUP / INVESTIGATE LATER (${backup.length} items)
${backup.map(({agentId, item}) => {
  const title = item.repo_name || item.api_name || item.dataset_name
    || item.tool_name || item.name || item.technique_name || "Item";
  return `### [${agentId.toUpperCase()}] ${title}\n${JSON.stringify(item, null, 2)}`;
}).join("\n\n")}
`;

  const download = () => {
    const blob = new Blob([exportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sentrax-research.md"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ ...S.card, padding: 16, borderLeft: `3px solid ${T.ok}` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.ok }}>{approved.length}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Items approved for project</div>
        </div>
        <div style={{ ...S.card, padding: 16, borderLeft: `3px solid ${T.accent}` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.accent }}>{backup.length}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Items in backup / review</div>
        </div>
      </div>
      <button style={{ ...S.btn("success"), width: "100%", padding: 12, fontSize: 13, marginBottom: 20 }} onClick={download}>
        ↓ Export sentrax-research.md
      </button>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 12 }}>APPROVED ITEMS</div>
      {approved.map(({agentId, item}, i) => {
        const agent = AGENTS.find(a => a.id === agentId);
        const title = item.repo_name || item.api_name || item.dataset_name
          || item.tool_name || item.name || item.technique_name
          || item.trend_name || item.vulnerability_or_practice || `Item ${i+1}`;
        return (
          <div key={i} style={{ ...S.card, padding: 12, marginBottom: 8, borderLeft: `2px solid ${agent?.color}` }}>
            <div style={{ fontSize: 11, color: agent?.color, marginBottom: 3 }}>{agent?.name}</div>
            <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>{title}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function SentraxAgentSystem() {
  const [activeView, setActiveView] = useState("boss");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentStatus, setAgentStatus] = useState({});
  const [agentResults, setAgentResults] = useState({});
  const [managerResult, setManagerResult] = useState(null);
  const [managerStatus, setManagerStatus] = useState("idle");
  const [decisions, setDecisions] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const runAllAgents = useCallback(async () => {
    setIsRunning(true);
    setManagerResult(null);
    setDecisions({});
    const newStatus = {};
    AGENTS.forEach(a => { newStatus[a.id] = "running"; });
    setAgentStatus(newStatus);

    const results = await Promise.all(
      AGENTS.map(async (agent) => {
        try {
          const data = await callClaude(agent.role, agent.task);
          setAgentStatus(prev => ({ ...prev, [agent.id]: "done" }));
          setAgentResults(prev => ({ ...prev, [agent.id]: data }));
          return { id: agent.id, data };
        } catch (e) {
          setAgentStatus(prev => ({ ...prev, [agent.id]: "error" }));
          return { id: agent.id, data: [] };
        }
      })
    );

    const allResults = {};
    results.forEach(r => { allResults[r.id] = r.data; });

    setManagerStatus("running");
    try {
      const mgr = await callManager(allResults);
      setManagerResult(mgr);
    } catch {}
    setManagerStatus("done");
    setIsRunning(false);
    setRunCount(c => c + 1);
  }, []);

  const approve = (key) => setDecisions(p => ({ ...p, [key]: "approved" }));
  const reject  = (key) => setDecisions(p => ({ ...p, [key]: "rejected" }));
  const backup  = (key) => setDecisions(p => ({ ...p, [key]: "backup" }));

  const doneCount = Object.values(agentStatus).filter(s => s === "done").length;
  const totalItems = Object.values(agentResults).reduce((a, v) => a + (v?.length || 0), 0);
  const approvedCount = Object.values(decisions).filter(v => v === "approved").length;

  return (
    <div style={S.app}>
      {/* TOP BAR */}
      <div style={S.topBar}>
        <div style={S.logo}>
          <div style={S.logoIcon}>🛡</div>
          <span>SENTRAX</span>
          <span style={{ color: T.accent, fontSize: 11, fontWeight: 400, fontFamily: T.fontMono, marginLeft: 4 }}>AGENT SYSTEM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {runCount > 0 && (
            <div style={{ display: "flex", gap: 12, fontSize: 11, fontFamily: T.fontMono }}>
              <span style={{ color: T.textMuted }}>{doneCount}/8 <span style={{ color: T.textPrimary }}>agents done</span></span>
              <span style={{ color: T.textMuted }}>{totalItems} <span style={{ color: T.textPrimary }}>items found</span></span>
              <span style={{ color: T.textMuted }}>{approvedCount} <span style={{ color: T.ok }}>approved</span></span>
            </div>
          )}
          <button
            style={{ ...S.btn(), opacity: isRunning ? 0.6 : 1, padding: "7px 18px", fontSize: 12 }}
            onClick={runAllAgents}
            disabled={isRunning}
          >
            {isRunning ? "⟳ Running..." : runCount > 0 ? "⟳ Re-scan" : "▶ Launch All Agents"}
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* SIDEBAR */}
        <div style={S.sidebar}>
          <div style={S.sideSection}>Control</div>
          {[
            { id: "boss", label: "Boss Panel", icon: "◉", color: T.accent },
            { id: "export", label: "Export", icon: "↓", color: T.ok },
          ].map(v => (
            <div key={v.id} style={S.sideItem(activeView === v.id, v.color)}
              onClick={() => setActiveView(v.id)}>
              <span style={{ color: v.color }}>{v.icon}</span>
              <span>{v.label}</span>
            </div>
          ))}
          <div style={S.sideSection}>Agents</div>
          {AGENTS.map(agent => {
            const st = agentStatus[agent.id];
            const dot = st === "done" ? T.ok : st === "running" ? T.accent
              : st === "error" ? T.alertRed : T.neutral;
            return (
              <div key={agent.id}
                style={S.sideItem(activeView === agent.id, agent.color)}
                onClick={() => { setActiveView(agent.id); setSelectedAgent(agent); }}>
                <span style={{ color: agent.color }}>{agent.icon}</span>
                <span style={{ flex: 1 }}>{agent.name}</span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* MAIN */}
        <div style={S.main}>
          <div style={S.content}>
            {/* AGENT GRID (always visible above main content when not on agent view) */}
            {(activeView === "boss" || activeView === "export") && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                {AGENTS.map(agent => (
                  <AgentCard key={agent.id} agent={agent}
                    status={agentStatus[agent.id] || "idle"}
                    results={agentResults[agent.id]}
                    score={managerResult?.agent_scores?.[agent.id]}
                    onViewResults={(a) => { setSelectedAgent(a); setActiveView(a.id); }}
                  />
                ))}
              </div>
            )}

            {/* BOSS VIEW */}
            {activeView === "boss" && (
              <BossPanel
                topPriority={managerResult?.top_priority}
                managerSummary={managerResult?.manager_summary}
                agentResults={agentResults}
                agentScores={managerResult?.agent_scores}
                decisions={decisions}
                onApprove={approve} onReject={reject} onBackup={backup}
              />
            )}

            {/* AGENT DETAIL VIEW */}
            {activeView !== "boss" && activeView !== "export" && selectedAgent && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24, color: selectedAgent.color }}>{selectedAgent.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{selectedAgent.name}</div>
                    <div style={{ fontSize: 11, fontFamily: T.fontMono, color: T.textMuted }}>{selectedAgent.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={S.badge(selectedAgent.color, selectedAgent.colorDim)}>
                      {agentStatus[selectedAgent.id] || "idle"}
                    </span>
                  </div>
                </div>
                {!agentResults[selectedAgent.id]?.length ? (
                  <div style={{ textAlign: "center", padding: 48, color: T.textMuted }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{selectedAgent.icon}</div>
                    <div style={{ fontSize: 14 }}>
                      {agentStatus[selectedAgent.id] === "running"
                        ? "Agent scanning..." : "Launch agents to see results"}
                    </div>
                  </div>
                ) : (
                  <ResultsPanel
                    agent={selectedAgent}
                    results={agentResults[selectedAgent.id]}
                    decisions={decisions}
                    onApprove={approve} onReject={reject} onBackup={backup}
                  />
                )}
              </div>
            )}

            {/* EXPORT VIEW */}
            {activeView === "export" && (
              <ExportPanel decisions={decisions} agentResults={agentResults} />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: ${T.void}; }
        ::-webkit-scrollbar-thumb { background: ${T.dimBorder}; border-radius: 2px; }
        button:hover { filter: brightness(1.15); }
        button:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
}
