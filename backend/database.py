import firebase_admin
from firebase_admin import credentials, firestore
import os
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

db = None

def get_db():
    global db
    if db is None:
        cred_path = os.path.join(os.path.dirname(__file__), "service-account.json")
        try:
            if not os.path.exists(cred_path):
                raise FileNotFoundError(f"Firebase credentials not found at {cred_path}")
            
            # Avoid duplicate initialization
            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            db = firestore.client()
        except Exception as e:
            print(f"Firebase initialization failed: {e}. Falling back to in-memory MockFirestoreClient.")
            from mock_firestore import MockFirestoreClient
            db = MockFirestoreClient()
    return db

def init_db():
    """
    Initializes the database connection.
    Firestore databases are auto-created when writing data, so we just trigger get_db().
    """
    get_db()
    print("Database connection initialized successfully (live Firestore or in-memory fallback).")

# CRUD Operations

_last_campaign_id = 0

def create_campaign(brand: str, industry: str, audience: str, style: str, goal: str) -> int:
    global _last_campaign_id
    client = get_db()
    # Generate a unique integer ID based on current epoch time in milliseconds
    campaign_id = int(time.time() * 1000)
    if campaign_id <= _last_campaign_id:
        campaign_id = _last_campaign_id + 1
    _last_campaign_id = campaign_id
    created_at = datetime.utcnow().isoformat()
    
    data = {
        "id": campaign_id,
        "brand": brand,
        "industry": industry,
        "audience": audience,
        "style": style,
        "goal": goal,
        "created_at": created_at
    }
    
    # Store in "campaigns" collection using the string version of the integer as document name
    client.collection("campaigns").document(str(campaign_id)).set(data)
    return campaign_id

def get_campaigns() -> List[Dict[str, Any]]:
    client = get_db()
    c_docs = client.collection("campaigns").stream()
    campaigns = []
    
    for doc in c_docs:
        camp = doc.to_dict()
        camp_id = camp.get("id")
        
        # Retrieve results for this campaign. 
        # To avoid composite index requirements, we filter by campaign_id and sort in Python memory.
        r_docs = client.collection("campaign_results").where("campaign_id", "==", camp_id).stream()
        results = [r.to_dict() for r in r_docs]
        
        if results:
            # Sort results by created_at descending
            results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            latest = results[0]
            camp.update({
                "ctr": latest.get("ctr"),
                "conversion_rate": latest.get("conversion_rate"),
                "feedback": latest.get("feedback"),
                "watch_time": latest.get("watch_time")
            })
            
        campaigns.append(camp)
        
    # Sort campaigns by id descending (newest first)
    campaigns.sort(key=lambda x: x.get("id", 0), reverse=True)
    return campaigns

def get_campaign_by_id(campaign_id: int) -> Optional[Dict[str, Any]]:
    client = get_db()
    doc = client.collection("campaigns").document(str(campaign_id)).get()
    
    if not doc.exists:
        return None
        
    camp = doc.to_dict()
    
    # Fetch results
    r_docs = client.collection("campaign_results").where("campaign_id", "==", campaign_id).stream()
    results = [r.to_dict() for r in r_docs]
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    camp["results"] = results
    
    # Fetch memories
    m_docs = client.collection("memories").where("campaign_id", "==", campaign_id).stream()
    memories = [m.to_dict() for m in m_docs]
    memories.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    camp["memories"] = memories
    
    return camp

_last_result_id = 0

def add_campaign_results(campaign_id: int, ctr: float, watch_time: float, conversion_rate: float, feedback: str) -> int:
    global _last_result_id
    client = get_db()
    created_at = datetime.utcnow().isoformat()
    # Generate unique result id based on milliseconds
    result_id = int(time.time() * 1000)
    if result_id <= _last_result_id:
        result_id = _last_result_id + 1
    _last_result_id = result_id
    
    data = {
        "id": result_id,
        "campaign_id": campaign_id,
        "ctr": ctr,
        "watch_time": watch_time,
        "conversion_rate": conversion_rate,
        "feedback": feedback,
        "created_at": created_at
    }
    
    client.collection("campaign_results").document(str(result_id)).set(data)
    return result_id

_last_memory_id = 0

def create_memory(memory_text: str, campaign_id: int) -> int:
    global _last_memory_id
    client = get_db()
    created_at = datetime.utcnow().isoformat()
    # Generate unique memory id
    memory_id = int(time.time() * 1000)
    if memory_id <= _last_memory_id:
        memory_id = _last_memory_id + 1
    _last_memory_id = memory_id
    
    data = {
        "id": memory_id,
        "memory_text": memory_text,
        "campaign_id": campaign_id,
        "created_at": created_at
    }
    
    client.collection("memories").document(str(memory_id)).set(data)
    return memory_id

def get_memories() -> List[Dict[str, Any]]:
    client = get_db()
    m_docs = client.collection("memories").stream()
    memories = []
    
    for doc in m_docs:
        mem = doc.to_dict()
        camp_id = mem.get("campaign_id")
        
        # Fetch the linked campaign details for brand, industry, style
        c_doc = client.collection("campaigns").document(str(camp_id)).get()
        if c_doc.exists:
            camp = c_doc.to_dict()
            mem.update({
                "brand": camp.get("brand"),
                "industry": camp.get("industry"),
                "style": camp.get("style")
            })
            
        memories.append(mem)
        
    # Sort memories by id descending (newest first)
    memories.sort(key=lambda x: x.get("id", 0), reverse=True)
    return memories

def get_analytics_data() -> Dict[str, Any]:
    client = get_db()
    
    # Fetch all campaigns, results, and memories to aggregate in memory
    c_docs = client.collection("campaigns").stream()
    r_docs = client.collection("campaign_results").stream()
    m_docs = client.collection("memories").stream()
    
    campaigns = {doc.id: doc.to_dict() for doc in c_docs}
    results = [doc.to_dict() for doc in r_docs]
    memories = [doc.to_dict() for doc in m_docs]
    
    # 1. CTR trends grouped by date
    trends_dict = {}
    for r in results:
        # Extract YYYY-MM-DD
        date_str = r.get("created_at", "")[:10]
        if date_str:
            if date_str not in trends_dict:
                trends_dict[date_str] = []
            trends_dict[date_str].append(r.get("ctr", 0.0))
            
    ctr_trends = []
    for d in sorted(trends_dict.keys()):
        ctrs = trends_dict[d]
        ctr_trends.append({
            "date": d,
            "avg_ctr": round(sum(ctrs) / len(ctrs), 2),
            "count": len(ctrs)
        })
        
    # 2 & 3. Industry and Style Performance
    ind_dict = {}
    style_dict = {}
    
    for r in results:
        camp_id = str(r.get("campaign_id"))
        camp = campaigns.get(camp_id)
        if camp:
            ind = camp.get("industry", "General")
            style = camp.get("style", "Direct Response")
            
            if ind not in ind_dict:
                ind_dict[ind] = []
            ind_dict[ind].append(r.get("ctr", 0.0))
            
            if style not in style_dict:
                style_dict[style] = []
            style_dict[style].append(r.get("ctr", 0.0))
            
    industry_perf = []
    for ind, ctrs in ind_dict.items():
        industry_perf.append({
            "industry": ind,
            "avg_ctr": round(sum(ctrs) / len(ctrs), 2),
            "count": len(ctrs)
        })
    industry_perf.sort(key=lambda x: x["avg_ctr"], reverse=True)
    
    style_perf = []
    for style, ctrs in style_dict.items():
        style_perf.append({
            "style": style,
            "avg_ctr": round(sum(ctrs) / len(ctrs), 2),
            "count": len(ctrs)
        })
    style_perf.sort(key=lambda x: x["avg_ctr"], reverse=True)
    
    # 4. Memory growth grouped by date
    mem_dict = {}
    for m in memories:
        date_str = m.get("created_at", "")[:10]
        if date_str:
            mem_dict[date_str] = mem_dict.get(date_str, 0) + 1
            
    memory_growth = []
    accumulated = 0
    for d in sorted(mem_dict.keys()):
        accumulated += mem_dict[d]
        memory_growth.append({
            "date": d,
            "count": accumulated
        })
        
    # 5. General metrics summaries
    total_campaigns = len(campaigns)
    total_memories = len(memories)
    
    ctrs_all = [r.get("ctr", 0.0) for r in results]
    avg_ctr = round(sum(ctrs_all) / len(ctrs_all), 2) if ctrs_all else 0.0
    
    best_campaign = None
    if results:
        # Find result with highest CTR
        best_res = max(results, key=lambda x: x.get("ctr", 0.0))
        camp_id = str(best_res.get("campaign_id"))
        camp = campaigns.get(camp_id)
        if camp:
            best_campaign = {
                "brand": camp.get("brand"),
                "style": camp.get("style"),
                "industry": camp.get("industry"),
                "ctr": best_res.get("ctr")
            }
            
    return {
        "ctrTrends": ctr_trends,
        "industryPerformance": industry_perf,
        "stylePerformance": style_perf,
        "memoryGrowth": memory_growth,
        "summary": {
            "totalCampaigns": total_campaigns,
            "averageCtr": avg_ctr,
            "bestCampaign": best_campaign,
            "memoriesStored": total_memories
        }
    }
