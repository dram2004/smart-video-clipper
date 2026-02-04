# backend/create_index.py
import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")

async def create_vector_index():
    url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes"
    
    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Configuration for bge-base-en-v1.5 (768 dimensions, cosine metric)
    payload = {
        "name": "smart-clipper-vec",
        "description": "Index for lecture summaries",
        "config": {
            "dimensions": 768,
            "metric": "cosine"
        }
    }
    
    print("Creating Vectorize Index...")
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("✅ Success! Index 'smart-clipper-vec' created.")
            print(response.json())
        elif response.status_code == 409:
            print("⚠️ Index already exists (That's okay!)")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)

if __name__ == "__main__":
    asyncio.run(create_vector_index())