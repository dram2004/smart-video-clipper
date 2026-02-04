# backend/check_vectors.py
import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
CF_VECTOR_INDEX = os.getenv("CLOUDFLARE_VECTOR_INDEX")

HEADERS = {"Authorization": f"Bearer {CF_API_TOKEN}"}
AI_BASE = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run"
VECTOR_BASE = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/{CF_VECTOR_INDEX}/query"

async def check_index():
    # 1. Get an embedding for a test word
    print("generating search vector for 'atom'...")
    async with httpx.AsyncClient() as client:
        ai_resp = await client.post(
            f"{AI_BASE}/@cf/baai/bge-base-en-v1.5",
            headers=HEADERS,
            json={"text": ["atom"]}
        )
        vector = ai_resp.json()["result"]["data"][0]

    # 2. Query the database
    print("Querying Vectorize Index...")
    payload = {
        "vector": vector,
        "topK": 3,
        "returnMetadata": "all"
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            VECTOR_BASE,
            headers=HEADERS, 
            json=payload
        )
        
        data = resp.json()
        
        if "result" in data and data["result"]["matches"]:
            print("\n✅ FOUND DATA! Here is what is inside:")
            for match in data["result"]["matches"]:
                score = match["score"]
                text = match["metadata"].get("text_preview", "No text")
                print(f"- [Score: {score:.4f}] {text}...")
        else:
            print("\n❌ Index is empty (or no matches found).")
            print("Raw response:", data)

if __name__ == "__main__":
    asyncio.run(check_index())