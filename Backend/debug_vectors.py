# backend/debug_vectors.py
import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

cf_acc_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
cf_api_token = os.getenv("CLOUDFLARE_API_TOKEN")
cf_vector_index = os.getenv("CLOUDFLARE_VECTOR_INDEX")

VECTOR_BASE = f"https://api.cloudflare.com/client/v4/accounts/{cf_acc_id}/vectorize/v2/indexes/{cf_vector_index}"

async def check_index():
    print(f"Checking Index: {cf_vector_index}...")
    
    headers = {"Authorization": f"Bearer {cf_api_token}"}
    
    async with httpx.AsyncClient() as client:
        # 1. Get Index Stats (Count)
        resp = await client.get(VECTOR_BASE, headers=headers)
        if resp.status_code != 200:
            print(f"❌ Error fetching index info: {resp.text}")
            return
            
        data = resp.json()
        print(f"✅ Index Found!")
        # Print the vector count
        # Note: The structure varies slightly, look for 'vectors_count' or similar in the output
        print(json.dumps(data, indent=2))

        # 2. Test a direct dummy query
        # We perform a query with a vector of all zeros just to see if it returns *anything*
        dummy_vector = [0.1] * 768 # Standard BERT size
        payload = {"vector": dummy_vector, "topK": 3, "returnMetadata": "all"}
        
        print("\nAttempting Dummy Search...")
        search_resp = await client.post(f"{VECTOR_BASE}/query", headers=headers, json=payload)
        print(search_resp.json())

import json
if __name__ == "__main__":
    asyncio.run(check_index())