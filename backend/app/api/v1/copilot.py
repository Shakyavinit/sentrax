from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import re

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.sighting import Sighting
from app.models.camera import Camera
from app.models.watchlist import Watchlist
from app.services.ai_copilot import query_llm_copilot, query_llm_json

router = APIRouter(prefix="/copilot", tags=["AI Forensic Copilot"])

class CopilotRequest(BaseModel):
    prompt: str
    plate_text: Optional[str] = None
    case_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class AgentResearchRequest(BaseModel):
    agent_id: str
    agent_role: str
    task: str

class ManagerReviewRequest(BaseModel):
    agent_results: Dict[str, Any]

@router.post("/agent-research")
async def run_agent_research(
    req: AgentResearchRequest,
    current_user: User = Depends(get_current_user)
):
    system_prompt = (
        f"You are {req.agent_role} for SENTRAX — an AI CCTV Intelligence & Digital Forensics Platform for Gujarat Police and law enforcement. "
        "Respond ONLY with a valid JSON array of research items following the requested schema. No markdown fences, no preamble, pure JSON array starting with [ and ending with ]."
    )
    res = await query_llm_json(req.task, system_prompt)
    if isinstance(res, list) and len(res) > 0:
        return {"items": res, "live": True, "source": "Gemini 3.6 Flash"}
    elif isinstance(res, dict) and "items" in res and isinstance(res["items"], list):
        return {"items": res["items"], "live": True, "source": "Gemini 3.6 Flash"}
    return {"items": None, "live": False}

@router.post("/manager-review")
async def run_manager_review(
    req: ManagerReviewRequest,
    current_user: User = Depends(get_current_user)
):
    import json
    summary_parts = []
    for agent_id, items in req.agent_results.items():
        summary_parts.append(f"\n=== {agent_id.upper()} SCOUT ===\n{json.dumps(items[:3] if isinstance(items, list) else items, indent=1)}")
    summary = "\n".join(summary_parts)

    prompt = f"""Review these research findings from autonomous sub-agents working on SENTRAX (Gujarat Sentinel ANPR & Digital Forensics platform).
Score each agent 1-10 for tactical relevance to Indian police deployment.
Pick top 3 priority action items.
Provide an executive manager summary.

Respond with JSON format:
{{
  "agent_scores": {{ "github": 9, "api": 8, "data": 9, "tools": 9, "frontend": 8, "security": 10, "backend": 9, "trends": 9 }},
  "top_priority": [
    {{
      "agent_id": "security",
      "item_index": 0,
      "priority_reason": "...",
      "action": "ADD_TO_PROJECT",
      "folder": "backend/app/services/..."
    }}
  ],
  "manager_summary": "..."
}}

Findings:
{summary}"""

    system_prompt = "You are the autonomous Engineering Team Manager for SENTRAX. You critically evaluate intelligence and engineering research. Respond ONLY with valid JSON."
    res = await query_llm_json(prompt, system_prompt)
    if isinstance(res, dict) and "top_priority" in res:
        return {"result": res, "live": True, "source": "Gemini 3.6 Flash"}
    return {"result": None, "live": False}

@router.post("/analyze")
async def analyze_investigation(
    req: CopilotRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ctx = req.context or {}
    target_p = req.plate_text or ctx.get("target_plate")
    if not target_p:
        m = re.search(r"\b([A-Z]{2}\d{2}[A-Z]{1,2}\d{4})\b", req.prompt.upper())
        if m:
            target_p = m.group(1)

    if target_p:
        clean_p = target_p.replace(" ", "").upper()
        ctx["target_plate"] = clean_p
        
        # 1. Fetch Watchlist info
        wl_res = await db.execute(select(Watchlist).where(Watchlist.plate_text == clean_p))
        wl = wl_res.scalar_one_or_none()
        if wl:
            ctx["watchlist_priority"] = wl.priority
            ctx["case_reason"] = wl.reason
            ctx["case_notes"] = wl.notes
            ctx["case_id"] = req.case_id or f"FIR-GJ-{clean_p[:4]}-2026"
            
        # 2. Fetch actual sightings with camera info
        sight_res = await db.execute(
            select(Sighting, Camera)
            .join(Camera, Sighting.camera_id == Camera.id)
            .where(Sighting.plate_text == clean_p)
            .order_by(Sighting.frame_ts.asc())
            .limit(20)
        )
        rows = sight_res.all()
        actual_sightings = []
        for s, c in rows:
            meta = s.extra_metadata or {}
            actual_sightings.append({
                "camera_id": c.camera_id,
                "camera_name": c.name,
                "location": c.location_name,
                "timestamp": s.frame_ts.strftime("%Y-%m-%d %H:%M:%S IST"),
                "speed_kmh": meta.get("speed_kmh", 52),
                "vehicle_class": s.vehicle_class,
                "color": meta.get("vehicle_color", "Identified Vehicle"),
                "plate_confidence": f"{int((s.plate_conf or 0.95)*100)}%"
            })
        ctx["real_sightings_history"] = actual_sightings

    if req.case_id and "case_id" not in ctx:
        ctx["case_id"] = req.case_id
    ctx["investigating_officer"] = current_user.username
    ctx["jurisdiction"] = "Gujarat Sentinel Digital Forensics & ANPR Surveillance Grid"

    res = await query_llm_copilot(req.prompt, ctx)
    return res
