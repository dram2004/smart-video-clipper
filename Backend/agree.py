import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Load credentials
cf_acc_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
cf_api_token = os.getenv("CLOUDFLARE_API_TOKEN")

async def sign_agreement():
    url = f"https://api.cloudflare.com/client/v4/accounts/{cf_acc_id}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct"
    
    payload = {
        "messages": [
            {"role": "user", "content": "agree"} # <--- This magic word unlocks the model
        ]
    }

    headers = {"Authorization": f"Bearer {cf_api_token}"}

    print("📝 Signing Llama 3.2 license agreement...")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload, timeout=30.0)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    asyncio.run(sign_agreement())