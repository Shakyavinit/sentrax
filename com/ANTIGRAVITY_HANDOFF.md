# ANTIGRAVITY — SENTRAX Handoff Instructions

## Context
You are building **SENTRAX** — a CCTV Intelligence & Digital Forensics Platform for Team CipherNetra at the Gujarat Sentinel Hackathon.

Two files have been provided to you:

1. **SENTRAX_MASTER_SPEC.md** — Complete build specification. Every design decision, API endpoint, database schema, component layout, and build order is already decided inside this file. You never need to ask for clarification — the answer is in this file.

2. **SentraxAgentSystem.jsx** — A working React component that acts as an **autonomous research assistant**. It runs 8 parallel AI sub-agents that continuously find GitHub repos, APIs, datasets, tools, frontend components, security fixes, backend patterns, and trending tech — all specifically curated for SENTRAX. A Team Manager agent reviews all findings and escalates the most important ones. The human (Antaryami) reviews and approves what gets added to the project.

---

## Your Two Jobs

### Job 1: Build SENTRAX
Follow **SENTRAX_MASTER_SPEC.md** exactly.
- Start at Section 11 (Build Order), Phase 1, Step 1
- Complete every phase fully before moving to the next
- Never leave TODO comments — write complete working code
- Use the design tokens from Section 3 exactly as written
- If sandbox camera URL is unavailable, use the fallback: `rtsp://demo:demo@ipvmdemo.dyndns.org:554/onvif-media/media.amp`

### Job 2: Integrate the Research Agent System
Place **SentraxAgentSystem.jsx** in the frontend as an internal tool page.

**Exact integration steps:**

1. Copy `SentraxAgentSystem.jsx` to `frontend/src/pages/ResearchAgent.tsx` (rename, convert imports to TypeScript if needed)

2. Add it to the router in `App.tsx`:
```tsx
import ResearchAgent from "./pages/ResearchAgent";
// Inside routes:
<Route path="/research-agent" element={<ResearchAgent />} />
```

3. Add it to the Sidebar navigation in `Sidebar.tsx`:
```tsx
// Under a new section "Tools" at the bottom of sidebar:
{ path: "/research-agent", label: "Research Agent", icon: <BotIcon size={16} /> }
```

4. The page is **only accessible to admin role** — wrap with auth guard:
```tsx
// In the route definition:
<Route path="/research-agent" element={
  <ProtectedRoute requiredRole="admin">
    <ResearchAgent />
  </ProtectedRoute>
} />
```

5. The component makes real Claude API calls from the browser. The Anthropic API key is already handled by the artifact system — no changes needed to the component itself.

---

## What the Research Agent Does (so you understand it)

When Antaryami clicks **"▶ Launch All Agents"** inside the Research Agent page:

```
8 Sub-Agents run in parallel via Claude API:
  ├── GitHub Scout      → finds repos (YOLOv8, PaddleOCR, DeepSORT, etc.)
  ├── API Hunter        → finds free APIs (plate lookup, geocoding, map tiles)
  ├── Data Collector    → finds Indian datasets (plate formats, GIS, training data)
  ├── Tool Finder       → finds CLI tools, FFmpeg tricks, testing tools
  ├── Frontend Scout    → finds React components, dark UI libraries
  ├── Security Agent    → finds vulnerabilities and hardening fixes
  ├── Backend Scout     → finds FastAPI patterns, DB optimizations
  └── Trend Watcher     → finds 2024-25 latest tech relevant to SENTRAX
         ↓
Team Manager Agent reviews all 8 outputs, scores each 1-10,
picks top 3 priority items and escalates to Boss Panel
         ↓
Antaryami (Boss) reviews: ✓ Add | ⬡ Save | ✗ Skip
         ↓
Export Panel → downloads sentrax-research.md
         ↓
Antaryami brings that .md file back to you (Antigravity)
and you implement the approved items into SENTRAX
```

---

## The Workflow Loop

```
Antigravity builds SENTRAX (MASTER_SPEC.md)
       ↓
Antaryami runs Research Agent → gets sentrax-research.md
       ↓
Antaryami gives sentrax-research.md to Antigravity
       ↓
Antigravity reads approved items and integrates them
       ↓
Repeat
```

---

## Rules (same as MASTER_SPEC.md Section 0, repeated here for clarity)

1. NEVER ask for clarification — every decision is in SENTRAX_MASTER_SPEC.md
2. NEVER stop mid-task — complete each module fully
3. NEVER use placeholder/TODO code
4. ALWAYS follow the design tokens from Section 3 exactly
5. BUILD ORDER from Section 11 is fixed — follow it exactly
6. If you receive a `sentrax-research.md` file from Antaryami — read it fully, implement all "APPROVED" items, note "BACKUP" items as future tasks in a `RESEARCH_BACKLOG.md` file

---

## Start Command

After reading both files, begin with this exact sequence:

1. Acknowledge you've read both files (one sentence)
2. State which Phase/Step you're starting with
3. Begin writing code immediately — no further questions

**Begin now.**
