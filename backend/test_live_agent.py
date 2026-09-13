import asyncio
import httpx
import json
import re
from app.core.config import settings

async def test_agent():
    key = settings.GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={key}"
    prompt = """You are GITHUB RESEARCHER for SENTRAX. Return a JSON array of 3 real GitHub repositories for CCTV vehicle detection & license plate recognition.
For each repo return:
- repo_name: exact repo name
- github_url: full URL
- stars: approximate star count
- why_useful: 1 sentence why it helps SENTRAX
- specific_files: list 2-3 specific files
- install_command: pip/npm install command
Return ONLY valid JSON. No markdown, no backticks."""

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(
            url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1}
            }
        )
        data_raw = res.json()
        text = data_raw["candidates"][0]["content"]["parts"][0]["text"]
        clean = re.sub(r"^```json\s*|```$", "", text.strip(), flags=re.MULTILINE)
        data = json.loads(clean)
        print(f"SUCCESS! Parsed {len(data)} live repos from Gemini:")
        for r in data:
            print(f" - {r.get('repo_name')}: {r.get('why_useful')}")

if __name__ == "__main__":
    asyncio.run(test_agent())
