from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
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
    create_memory
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

# Endpoints

@app.post("/campaigns", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def api_create_campaign(payload: CampaignCreate):
    try:
        campaign_id = create_campaign(
            brand=payload.brand,
            industry=payload.industry,
            audience=payload.audience,
            style=payload.style,
            goal=payload.goal
        )
        campaign = get_campaign_by_id(campaign_id)
        return {"status": "success", "campaign": campaign}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/campaigns", response_model=List[Dict[str, Any]])
def api_get_campaigns():
    try:
        return get_campaigns()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/campaigns/{id}", response_model=Dict[str, Any])
def api_get_campaign(id: int):
    campaign = get_campaign_by_id(id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@app.post("/campaigns/{id}/results", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def api_add_campaign_results(id: int, payload: ResultsCreate):
    campaign = get_campaign_by_id(id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    try:
        # Save results to DB
        result_id = add_campaign_results(
            campaign_id=id,
            ctr=payload.ctr,
            watch_time=payload.watch_time,
            conversion_rate=payload.conversion_rate,
            feedback=payload.feedback
        )
        
        # Step 7: Trigger Hindsight Memory Retention
        results_data = {
            "ctr": payload.ctr,
            "watch_time": payload.watch_time,
            "conversion_rate": payload.conversion_rate,
            "feedback": payload.feedback
        }
        memory_text = HindsightMemoryEngine.retain(campaign, results_data)
        
        return {
            "status": "success",
            "result_id": result_id,
            "memory_retained": memory_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memories", response_model=List[Dict[str, Any]])
def api_get_memories():
    try:
        return get_memories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-strategy", response_model=Dict[str, Any])
def api_generate_strategy(payload: StrategyRequest):
    try:
        # Step 2: Search Hindsight memory (Find same industry, style, audience)
        recalled_memories = HindsightMemoryEngine.recall(
            industry=payload.industry,
            audience=payload.audience,
            style=payload.style
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
def api_get_analytics():
    try:
        return get_analytics_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
