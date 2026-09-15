# SENTRAX — Hackathon Presentation Video Script (3–4 Minutes)
**System**: SENTRAX (AI-Powered CCTV Intelligence & Digital Forensics Platform)  
**Team**: CipherNetra  
**Hackathon**: Gujarat Sentinel Hackathon / SIH  
**Target Duration**: 3 Minutes 30 Seconds  

---

## Video Production Overview

- **Audience**: Law Enforcement Evaluators, SIH Jury, Technical Officers.
- **Tone**: Authoritative, Tactical, Mission-Critical, Technically Grounded.
- **Screen Display**: Dual split (Presenter Webcam + High-Contrast Dark UI at 1080p).
- **Audio**: Clear vocal track, subtle ambient cyber background hum.

---

## Scene-by-Scene Script & Action Timeline

### Scene 1: Problem Hook & Platform Introduction (0:00 – 0:35)
- **Visual**: Camera pans over Ahmedabad map with disconnected CCTV camera pins pulsing red.
- **Narrator**:
  > *"Every single day, thousands of CCTV cameras across Ahmedabad, Gandhinagar, and Surat capture petabytes of surveillance video. Yet, when a crime occurs or a suspect vehicle flees, law enforcement officers are forced to manually review hours of disconnected footage across multiple disparate systems. Optical blur, duplicate alert storms, and unverified video evidence undermine criminal prosecutions. 
  > 
  > Welcome to **SENTRAX**, developed by Team CipherNetra — an AI-powered CCTV intelligence and digital forensics platform designed specifically for real-time urban vehicle tracking, cross-camera correlation, and court-admissible Section 65B electronic evidence preservation."*

### Scene 2: Live CCTV Grid & Distributed Celery Workers (0:35 – 1:15)
- **Visual**: Screen switches to SENTRAX Main Dashboard (`/`). Cursor highlights the Top KPI Strip (MTTD 1.8s, 96.2% ANPR accuracy) and the newly implemented **Background Operations Widget**.
- **Narrator**:
  > *"Here on the SENTRAX Tactical Dashboard, the Ahmedabad SOC is live. Notice our Background Operations engine powered by Celery and Redis. Unlike naive systems that crash under stream load, SENTRAX enforces a strict active camera limit — here throttled to 4 concurrent high-resolution streams.
  > 
  > Seven specialized background workers operate asynchronously: probing camera health, running YOLOv8 vehicle detection, performing multi-frame ANPR consensus voting to overcome glare, deduplicating watchlist alerts within a 10-minute debouncing window, and continuously verifying evidence integrity in the background."*

### Scene 3: Watchlist Alert & Real-Time ANPR Consensus (1:15 – 1:55)
- **Visual**: Click "▶ Demo Mode" or view Live Alert. Red high-priority alert drawer pops open: `GJ01AB1234 detected at SG Highway Toll (CAM04)`. Click into camera view.
- **Narrator**:
  > *"Instantly, a critical alert triggers. Vehicle registration GJ01AB1234 — a flagged watchlist target — has just crossed CAM04 at SG Highway Toll.
  > 
  > Look at the ANPR consensus engine. Instead of relying on a single noisy frame, our worker aggregated consecutive frame crops, filtered out motion blur, and performed character frequency voting to achieve a verified 96.2% confidence score. Duplicate alerts for this junction are automatically suppressed, protecting operators from fatigue."*

### Scene 4: Cross-Camera Journey Reconstruction & PostGIS (1:55 – 2:35)
- **Visual**: Click "Trace Journey". Screen transitions to `/journey?plate=GJ01AB1234`. Interactive Leaflet map renders the polyline connecting Sardar Bridge $\to$ MG Road $\to$ Sabarmati $\to$ SG Highway $\to$ GIFT City.
- **Narrator**:
  > *"With one click, an investigator can reconstruct the suspect vehicle’s complete urban journey. Our PostGIS spatial engine enforces a strict physical invariant: journeys require sightings across at least two distinct physical cameras.
  > 
  > Furthermore, our spatial worker calculates transit speed between junctions using Haversine distance. If a vehicle appears across distant junctions within seconds, the system immediately flags a speed anomaly or cloned number plate."*

### Scene 5: Section 65B Forensic Evidence Vault & SHA-256 (2:35 – 3:15)
- **Visual**: Navigate to Evidence Vault (`/evidence`). Open the modal for `GJ01AB1234`. Click into the "SHA-256 Hashes" tab showing true byte hashes, then the "Certificate" tab.
- **Narrator**:
  > *"Surveillance intelligence is useless if it cannot stand up in court. In the SENTRAX Forensic Evidence Vault, every preserved frame, vehicle crop, and metadata manifest is hashed at the raw byte level using SHA-256.
  > 
  > When an investigator exports an evidence bundle, SENTRAX automatically compiles a Section 65B Electronic Evidence Certificate compliant with the Indian Evidence Act, complete with hardware identifiers, timestamp hashes, and cryptographic audit trails. If a single pixel is modified or metadata altered, our automated integrity worker immediately flags the record as 'Tampered'."*

### Scene 6: Forensic AI Copilot & Conclusion (3:15 – 3:30)
- **Visual**: Open Forensic AI Copilot drawer. Type: `Summarize movement patterns for GJ01AB1234`. Copilot answers with structured timeline.
- **Narrator**:
  > *"Backed by our Forensic AI Copilot for natural language crime pattern analysis, SENTRAX empowers Gujarat Police to transition from reactive footage review to proactive, court-admissible urban intelligence. 
  > 
  > SENTRAX: One unified workspace. Every sighting connected. Team CipherNetra. Thank you."*
