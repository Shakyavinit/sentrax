# SENTRAX demo redesign

## Run

```bash
cd frontend
npm ci
VITE_DEMO_MODE=true npm run dev -- --host 127.0.0.1
```

GitHub Pages at `shakyavinit.github.io` selects demo mode automatically. Other deployments use the real backend unless built with `VITE_DEMO_MODE=true`. Real API failures never grant a demo session. `VITE_API_URL` is respected for backend deployments.

## Presentation flow

1. Open the demo workspace without credentials.
2. Choose the GJ01AB1234 sample on the overview.
3. Review five sightings; the 64% sample score requires manual review.
4. Open the journey and select timeline stops.
5. Preserve a sighting, inspect it in the evidence vault, verify its metadata hash and export the ZIP manifest.
6. Review UP32PQ6677 alerts and acknowledge one. The overview count reflects the change.
7. Add/edit a fictional watchlist record and test the filters.
8. Open the camera monitor, switch grid/list, filter cameras and play prerecorded footage.

## Truth boundaries

- All scenario records are fictional. Sample imagery and video are illustrative, not detections tied to the scenario.
- Demo changes persist only in this browser's local storage (`sentrax-demo-v1`). No shared backend, live camera, dispatch, identity lookup or government integration is implied.
- The assistant gives a deterministic scenario summary, not an AI-generated or legal certificate.
- Evidence exports are real ZIPs containing a demo JSON manifest. SHA-256 covers only the sample metadata, not original CCTV media. No forensic or legal certification is claimed.
- Third-party map tiles and fonts require network access. Camera samples are included with the app.
- Production-only pages/integrations remain in the source; a full backend/AI accuracy/security audit is outside these UI checks.

## Automated verification

`node scripts/check-demo.mjs` runs 22 assertions including search/class/date filtering, unknown plates, journey ordering, watchlist CRUD and duplicate validation, alert acknowledgment, summary consistency, evidence persistence, metadata hashing, tamper detection, ZIP signatures and unsupported-service errors.

`npm run build` validates TypeScript and builds the application. `git diff --check` validates patch whitespace.

## UI system

Shared shell, navigation, typography, responsive grids, neutral surfaces, image grayscale/color transitions and reduced-motion support live in `src/workspace.css`. Demo-specific monitor, dossier and assistant preserve production components behind explicit mode selection. Shared dialogs use native modal focus handling, Escape dismissal and portaling.

The local cloud-browser URL was blocked by the browser environment. Live browser checks must therefore be made against the published GitHub Pages build; automated checks above do not imply exhaustive visual or backend verification.
