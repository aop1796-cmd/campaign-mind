from fastapi import FastAPI, HTTPException, status, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

from database import (
    init_db,
    create_campaign,
    get_campaigns,
    get_campaign_by_id,
    add_campaign_results,
    get_memories,
    get_analytics_data,
    create_memory,
    is_mock_mode
)
from memory_engine import HindsightMemoryEngine
from strategist import generate_campaign_strategy

app = FastAPI(title="CampaignMind API", version="1.0.0")

# CORS middleware to allow Next.js app to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the Next.js domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database is created
@app.on_event("startup")
def on_startup():
    init_db()

# Pydantic Schemas

class CampaignCreate(BaseModel):
    brand: str = Field(..., example="GlowSerums")
    industry: str = Field(..., example="Skincare")
    audience: str = Field(..., example="Women 20-35 interested in clean beauty")
    style: str = Field(..., example="UGC")
    goal: str = Field(..., example="Increase website purchases")

class ResultsCreate(BaseModel):
    ctr: float = Field(..., example=4.8)
    watch_time: float = Field(..., example=12.5)  # in seconds
    conversion_rate: float = Field(..., example=2.1)
    feedback: str = Field(..., example="UGC style drove high click-through rates, but watch time dropped in the middle.")

class StrategyRequest(BaseModel):
    industry: str = Field(..., example="Skincare")
    style: str = Field(..., example="UGC")
    audience: str = Field(..., example="Women 20-35")
    goal: str = Field(..., example="Sales")

# Security and Auth Helpers
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> str:
    if is_mock_mode():
        return "mock_user_123"
        
    if not credentials:
        return "mock_user_123"
        
    token = credentials.credentials
    if token == "mock_token_123":
        return "mock_user_123"
        
    try:
        from firebase_admin import auth as admin_auth
        decoded_token = admin_auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        print(f"Token verification failed: {e}. Falling back to mock_user_123 context.")
        return "mock_user_123"

# Endpoints

@app.post("/campaigns", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def api_create_campaign(payload: CampaignCreate, user_id: str = Depends(get_current_user)):
    try:
        campaign_id = create_campaign(
            brand=payload.brand,
            industry=payload.industry,
            audience=payload.audience,
            style=payload.style,
            goal=payload.goal,
            user_id=user_id
        )
        campaign = get_campaign_by_id(campaign_id, user_id=user_id)
        return {"status": "success", "campaign": campaign}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/campaigns", response_model=List[Dict[str, Any]])
def api_get_campaigns(user_id: str = Depends(get_current_user)):
    try:
        return get_campaigns(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/campaigns/{id}", response_model=Dict[str, Any])
def api_get_campaign(id: int, user_id: str = Depends(get_current_user)):
    campaign = get_campaign_by_id(id, user_id=user_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@app.post("/campaigns/{id}/results", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def api_add_campaign_results(id: int, payload: ResultsCreate, user_id: str = Depends(get_current_user)):
    campaign = get_campaign_by_id(id, user_id=user_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    try:
        # Save results to DB
        result_id = add_campaign_results(
            campaign_id=id,
            ctr=payload.ctr,
            watch_time=payload.watch_time,
            conversion_rate=payload.conversion_rate,
            feedback=payload.feedback,
            user_id=user_id
        )
        
        # Step 7: Trigger Hindsight Memory Retention
        results_data = {
            "ctr": payload.ctr,
            "watch_time": payload.watch_time,
            "conversion_rate": payload.conversion_rate,
            "feedback": payload.feedback
        }
        
        # Fetch updated campaign to make sure it includes the new results
        campaign = get_campaign_by_id(id, user_id=user_id)
        memory_text = HindsightMemoryEngine.retain(campaign, results_data)
        
        return {
            "status": "success",
            "result_id": result_id,
            "memory_retained": memory_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memories", response_model=List[Dict[str, Any]])
def api_get_memories(user_id: str = Depends(get_current_user)):
    try:
        return get_memories(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-strategy", response_model=Dict[str, Any])
def api_generate_strategy(payload: StrategyRequest, user_id: str = Depends(get_current_user)):
    try:
        # Step 2: Search Hindsight memory (Find same industry, style, audience)
        recalled_memories = HindsightMemoryEngine.recall(
            industry=payload.industry,
            audience=payload.audience,
            style=payload.style,
            user_id=user_id
        )
        
        # Step 4-5: Pass to strategist (which handles Groq call or Mock fallback)
        strategy = generate_campaign_strategy(
            industry=payload.industry,
            style=payload.style,
            audience=payload.audience,
            goal=payload.goal,
            recalled_memories=recalled_memories
        )
        
        # Step 7 (Partial): Return response. We also include the retrieved memories
        # in the API response so the UI can render "Retrieved Memories" in real time.
        return {
            "strategy": strategy,
            "retrievedMemories": recalled_memories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics", response_model=Dict[str, Any])
def api_get_analytics(user_id: str = Depends(get_current_user)):
    try:
        return get_analytics_data(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
