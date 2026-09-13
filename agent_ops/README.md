# SENTRAX Agent Operations (agent_ops)

This directory serves as the virtual operations system for the SENTRAX autonomous engineering organization, following `SENTRAX_MULTI_AGENT_AUTONOMOUS_PLAYBOOK.md`.

## Directory Structure
- `state/`: Persistent JSON records of system state, risks, and registered workers.
- `queue/`: Lifecycle management for engineering and research tasks.
- `scouts/`: Raw outputs and working files from specialized scout agents.
- `engineering/`: Working directories for engineering domains (backend, AI/ML, security, QA, performance).
- `manager/`: Team Manager consolidations, digests, and prioritized queues.
- `controller/`: Main Controller architectural plans, decisions, and integration audit log.
- `research_library/`: Canonical, deduplicated findings across repos, APIs, datasets, and patterns.
- `experiments/`: Isolated hypothesis test logs and benchmark runs.
- `reports/`: Verification, security audits, and demo readiness matrices.
- `archive/`: Completed cycles and deprecated research.

## Operating Principles
1. Preserve Demo Path at all times.
2. Low-token, structured summaries upwards; detailed facts stored in markdown/JSON.
3. No fabricated data or hallucinated credentials.
4. Safe Class-A auto-fixes only; all other changes follow DISCOVER → TEST → VERIFY → INTEGRATE.
