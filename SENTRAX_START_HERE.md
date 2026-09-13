# SENTRAX — Zero Se Shuru Guide
## Kali Linux | Team CipherNetra

---

## STEP 0: Prerequisites — Pehle yeh check karo

Terminal kholo aur ek ek command run karo:

```bash
# Docker version check (chahiye: 24+)
docker --version

# Docker Compose check (chahiye: v2+)
docker compose version

# Node.js check (chahiye: 18+)
node --version

# Python check (chahiye: 3.11+)
python3 --version

# Git check
git --version
```

### Agar kuch missing ho:

**Docker nahi hai:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

**Node.js nahi hai / purana hai:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Python 3.11 nahi hai:**
```bash
sudo apt install python3.11 python3.11-venv python3.11-dev -y
```

---

## STEP 1: Project Folder Banao

```bash
# Desktop pe project banao
cd ~/Desktop
mkdir sentrax
cd sentrax

# Folder structure
mkdir -p frontend backend nginx
mkdir -p backend/app/api/v1
mkdir -p backend/app/core
mkdir -p backend/app/models
mkdir -p backend/app/schemas
mkdir -p backend/app/services
mkdir -p backend/app/ai
mkdir -p backend/app/ingestion
mkdir -p backend/app/tasks
mkdir -p backend/alembic/versions

# Confirm structure
ls -la
```

---

## STEP 2: .env File Banao (PEHLE — bina iske kuch kaam nahi)

```bash
cd ~/Desktop/sentrax

cat > .env << 'ENVEOF'
# Database
DB_PASSWORD=SentraxDB2024!
DATABASE_URL=postgresql+asyncpg://sentrax:SentraxDB2024!@postgres:5432/sentrax

# Redis
REDIS_URL=redis://redis:6379/0

# Auth — yeh change karo apna kuch unique string se
JWT_SECRET=ciphernetra-sentrax-jwt-secret-change-in-prod-2024
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480

# AI Models (baad mein download karenge)
YOLO_MODEL_PATH=/app/models/yolov8n.pt
PLATE_MODEL_PATH=/app/models/plate_detector.pt

# Media
MEDIA_ROOT=/app/media
MEDIA_URL=http://localhost:8000/media

# Default Admin Login
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=SentraxAdmin2024!

# Sandbox Camera Fallback (agar real camera nahi mila)
SANDBOX_RTSP_URL=rtsp://demo:demo@ipvmdemo.dyndns.org:554/onvif-media/media.amp
SANDBOX_HLS_URL=https://demo.unified-streaming.com/k8s/live/scte35.isml/.m3u8
ENVEOF

echo ".env created successfully"
cat .env
```

---

## STEP 3: SENTRAX_MASTER_SPEC.md Yahan Daalo

Woh file jo tune download ki thi — use is folder mein copy karo:

```bash
# Agar Downloads mein hai:
cp ~/Downloads/SENTRAX_MASTER_SPEC.md ~/Desktop/sentrax/

# Confirm:
ls ~/Desktop/sentrax/
# Yeh dikhna chahiye: SENTRAX_MASTER_SPEC.md  .env  frontend/  backend/  nginx/
```

---

## STEP 4: Antigravity Ko Yeh Project Dena

### Option A — Antigravity CLI hai toh:
```bash
cd ~/Desktop/sentrax

# Antigravity ko project folder point karo
# (exact command Antigravity ke docs mein hoga, usually:)
antigravity init .
# ya
antigravity --project .
```

### Option B — Antigravity VS Code extension hai:
1. VS Code mein `~/Desktop/sentrax` folder kholo
2. Antigravity extension activate karo
3. SENTRAX_MASTER_SPEC.md kholo
4. Pehla prompt bhejo (neeche diya hai)

### Option C — Antigravity web/chat interface hai:
1. SENTRAX_MASTER_SPEC.md ka content copy karo
2. Antigravity chat mein paste karo as first message
3. Uske baad wala prompt bhejo

---

## STEP 5: Antigravity Ko Pehla Prompt (EXACT yeh copy karo)

```
You are building SENTRAX — a CCTV Intelligence & Digital Forensics Platform.
The complete specification is in SENTRAX_MASTER_SPEC.md in this project folder.

Rules:
- Read the entire SENTRAX_MASTER_SPEC.md first before writing any code
- Follow the BUILD ORDER in Section 11 exactly — Phase 1 first, then Phase 2, etc.
- Never ask for clarification — all decisions are in the spec
- Never leave TODO comments — complete every function
- Use the design tokens from Section 3 exactly as written
- If sandbox camera URL is unavailable, use the fallback in .env

Start now with Phase 1, Step 1: docker-compose.yml
```

---

## STEP 6: Antigravity Kaam Karte Waqt Tu Kya Kare

### Parallel mein AI models download karo (bade hain, time lagta hai):

```bash
# Models folder banao
mkdir -p ~/Desktop/sentrax/backend/models
cd ~/Desktop/sentrax/backend/models

# YOLOv8 nano model (6MB — chhota, fast)
wget https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt

# YOLOv8 medium (zyada accurate, 25MB)
wget https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8m.pt

# Confirm download
ls -lh *.pt
```

### PaddleOCR test karo (Python mein):
```bash
pip3 install paddleocr paddlepaddle --break-system-packages

python3 -c "
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')
print('PaddleOCR ready!')
"
```

### PostgreSQL + PostGIS test karo (Docker se):
```bash
# Ek test container chala ke check karo
docker run --rm -e POSTGRES_PASSWORD=test postgis/postgis:15-3.3 \
  postgres --version
echo "PostGIS image OK"
```

---

## STEP 7: Pehli Baar Docker Compose Run Karna

Jab Antigravity `docker-compose.yml` bana de, tab:

```bash
cd ~/Desktop/sentrax

# Pehli baar — sab images download hogi (5-10 min)
docker compose up --build

# Alag terminal mein status check:
docker compose ps
```

**Expected output:**
```
NAME            STATUS          PORTS
sentrax-postgres-1   running         0.0.0.0:5432->5432/tcp
sentrax-redis-1      running         0.0.0.0:6379->6379/tcp
sentrax-backend-1    running         0.0.0.0:8000->8000/tcp
sentrax-frontend-1   running         0.0.0.0:3000->3000/tcp
```

---

## STEP 8: Verify Karo Sab Kuch Kaam Kar Raha Hai

```bash
# Backend health check
curl http://localhost:8000/health
# Expected: {"status": "ok", "database": "connected", "redis": "connected"}

# API docs check karo
# Browser mein: http://localhost:8000/docs
# Wahan FastAPI Swagger UI dikhna chahiye

# Frontend
# Browser mein: http://localhost:3000
# Login page dikhna chahiye

# Database direct check
docker exec -it sentrax-postgres-1 psql -U sentrax -d sentrax -c "\dt"
# Expected: 8 tables listed (users, cameras, sightings, watchlist, alerts, etc.)
```

---

## STEP 9: First Login

Browser mein `http://localhost:3000` kholo.

```
Username: admin
Password: SentraxAdmin2024!
```

Login hone ke baad:
1. Camera Registry → "Add Camera" → sandbox URL dalo
2. Live Monitor → feed aane lage toh sab theek hai
3. Watchlist → ek test plate dalo (e.g., `GJ01AB1234`)
4. Koi detection hone pe alert aana chahiye

---

## STEP 10: Sandbox Camera URL Kahan Se Milega

**Gujarat Sentinel Hackathon ke official portal pe:**
- Login karo hackathon portal pe
- "Resources" ya "Camera Sandbox" section mein jaao
- Wahan RTSP/HLS URLs milenge
- Woh URLs `Camera Registry → Add Camera` mein daalo

**Agar portal pe nahi mila:**
- Organizer ko email karo: subject "Sentinel Camera Grid Access — Team CipherNetra"
- Tab tak `.env` ka `SANDBOX_HLS_URL` kaam karega demo ke liye

---

## Troubleshooting

**Docker "permission denied":**
```bash
sudo usermod -aG docker $USER
# Logout + login karo, phir try karo
```

**Port 5432 already in use (PostgreSQL already installed):**
```bash
sudo systemctl stop postgresql
docker compose up
```

**8GB RAM mein sab ek saath heavy ho:**
```bash
# Pehle sirf core services chalo, AI baad mein
docker compose up postgres redis backend frontend
# Celery (AI processing) separately:
docker compose up celery
```

**YOLOv8 import error:**
```bash
pip3 install ultralytics --break-system-packages
python3 -c "from ultralytics import YOLO; print('YOLO OK')"
```

**Frontend blank white screen:**
```bash
docker logs sentrax-frontend-1
# Error dekh ke fix karo, usually .env variable missing hota hai
```

---

## Quick Reference — Useful Commands

```bash
# Sab services band karo
docker compose down

# Logs dekhna (real-time)
docker compose logs -f backend

# Database reset (CAUTION — sab data jaata hai)
docker compose down -v
docker compose up --build

# Backend shell
docker exec -it sentrax-backend-1 bash

# Database shell
docker exec -it sentrax-postgres-1 psql -U sentrax -d sentrax

# Redis check
docker exec -it sentrax-redis-1 redis-cli ping
```

---

## Checklist — Presentation Se Pehle

- [ ] Login kaam kar raha hai
- [ ] Kam se kam 2 cameras added hain
- [ ] Live Monitor mein feed aa raha hai (real ya HLS demo)
- [ ] Ek plate watchlist mein hai
- [ ] Ek mock sighting se alert generate hua
- [ ] Evidence Vault mein ek preserved evidence hai (SHA-256 hash dikha)
- [ ] Investigation page mein plate search kaam kar raha hai
- [ ] Journey map mein 2+ camera sightings connect ho rahe hain

---

*SENTRAX — CipherNetra | Gujarat Sentinel Hackathon*
