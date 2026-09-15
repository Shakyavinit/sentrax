# SENTRAX — Official Hackathon Form Submission Mapping
**Hackathon**: Gujarat Sentinel Hackathon / Smart India Hackathon (SIH)  
**Team Name**: CipherNetra  
**Project Title**: SENTRAX (AI-Powered CCTV Intelligence & Digital Forensics Platform)  

---

## Submission Form Fields & Pre-Filled Answers

### 1. Project Title
**SENTRAX — AI-Powered CCTV Intelligence & Digital Forensics Platform**

### 2. Team Name & Members
- **Team Name**: CipherNetra
- **Organization / Institution**: Gujarat Sentinel Hackathon

### 3. One-Line Summary / Elevator Pitch
> *"SENTRAX transforms fragmented urban CCTV networks into an integrated, real-time vehicle tracking and digital forensics command platform with multi-frame ANPR consensus, cross-camera journey reconstruction, and court-admissible Section 65B electronic evidence certification."*

### 4. Problem Statement / Category
- **Category**: Law Enforcement / Smart Cities / AI & Video Forensics
- **Problem Addressed**: Siloed CCTV feeds, optical blur in single-frame plate recognition, operator alert fatigue, and legal inadmissibility of surveillance video evidence under the Indian Evidence Act.

### 5. GitHub Repository URL
`https://github.com/Shakyavinit/sentrax`  
*(Branch: main)*

### 6. Video Demonstration Link
`https://youtu.be/SENTRAX_DEMO_LINK`  
*(Video Duration: 3 minutes 30 seconds, 1080p Full HD, covers Ingestion, ANPR, Cross-Camera Map, Evidence Vault SHA-256)*

### 7. Pitch Deck / Presentation Slides Link
`https://docs.google.com/presentation/d/SENTRAX_PITCH_DECK`  
*(Markdown source available in repository at `submission/01_Presentation/SENTRAX_PRESENTATION_CONTENT.md`)*

### 8. Live Demonstration URL / Hosted Prototype
`http://sentrax.demo.internal:8080/` (or local port `http://localhost:8080` / `http://localhost:3002`)  
*(Interactive offline demo simulation enabled via top-right '▶ Demo Mode' button)*

### 9. Technology Stack Used
- **AI & Computer Vision**: Ultralytics YOLOv8, OpenCV Headless, Multi-Frame Positional Character Voting Engine.
- **Backend & Distributed Execution**: FastAPI (Python 3.11, Async), Celery 5.3 (4 Prefork Workers), Redis 7 (Broker & State Cache).
- **Database & Spatial Engine**: PostgreSQL 15, PostGIS 3.3 (Spatial geometry, ST_MakeLine, Haversine velocity filtering).
- **Frontend & Visualization**: React 18, Vite 5, Tailwind CSS, TanStack Query v5, Leaflet Maps, Lucide React Icons.
- **Forensic Security**: Binary-level SHA-256 Hashing, Indian Evidence Act Section 65B Certificate Generation, HS256 JWT, Bcrypt.

### 10. Key Innovation & Differentiators
1. **Multi-Frame ANPR Consensus**: Eliminates optical blur and headlight glare by positional voting across consecutive frame crops.
2. **Controlled Background Operations**: 7 specialized Celery workers with exponential backoff and strict `ACTIVE_AI_CAMERA_LIMIT = 4` throttling to prevent server starvation.
3. **Cross-Camera Trajectory Verification**: Enforces physical feasibility ($v \le 200\text{ km/h}$) and requires $\ge 2$ distinct cameras to detect spoofed plates.
4. **Section 65B Electronic Evidence Vault**: Cryptographically verifiable byte-level SHA-256 hashing and automated legal certification for judicial admissibility.
5. **Safe Autonomous Scouts**: Background research agents governed by `agent_ops` with read-only production boundaries.
