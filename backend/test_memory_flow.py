import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import (
    init_db,
    create_campaign,
    add_campaign_results,
    get_campaigns,
    get_memories,
    get_campaign_by_id,
    get_db
)
from memory_engine import HindsightMemoryEngine
from strategist import generate_campaign_strategy

def test_campaign_memory_progression():
    print("=== STARTING HINDSIGHT MEMORY PROGRESSION TEST ===")
    
    # 1. Reset database collections in Cloud Firestore
    init_db()
    client = get_db()
    
    print("Wiping Firestore collections for clean test state...")
    for col_name in ["campaigns", "campaign_results", "memories"]:
        docs = client.collection(col_name).stream()
        count = 0
        for doc in docs:
            doc.reference.delete()
            count += 1
        if count > 0:
            print(f"  Deleted {count} documents from '{col_name}'")
            
    print("Firestore database reset completed successfully.")
    
    # --- STEP 1: Brand asks for skincare ad, empty memory ---
    print("\n--- STEP 1: Creating campaign with empty memory ---")
    recalled_1 = HindsightMemoryEngine.recall(industry="Skincare", audience="Women 20-35", style="UGC")
    print(f"Recalled memories (should be 0): {len(recalled_1)}")
    
    strategy_1 = generate_campaign_strategy(
        industry="Skincare",
        style="UGC",
        audience="Women 20-35",
        goal="Sales",
        recalled_memories=recalled_1
    )
    print("Strategy 1 (Generic Output):")
    print(f"  Confidence: {strategy_1['confidence']}")
    print(f"  Creative Style: {strategy_1['creativeStyle']}")
    print(f"  Recommended Hook: {strategy_1['recommendedHook']}")
    print(f"  Memory Insights: {strategy_1['memoryInsights']}")
    
    assert strategy_1['confidence'] == "Low"
    
    # Store Result for Campaign 1 (UGC Skincare Ad, CTR 4.8%)
    c1_id = create_campaign(
        brand="GlowSerums",
        industry="Skincare",
        audience="Women 20-35",
        style="UGC",
        goal="Sales"
    )
    add_campaign_results(
        campaign_id=c1_id,
        ctr=4.8,
        watch_time=10.5,
        conversion_rate=2.1,
        feedback="UGC style was highly engaging and generated highest CTR."
    )
    # Retain memory
    c1 = get_campaign_by_id(c1_id)
    r1 = c1["results"][0]
    HindsightMemoryEngine.retain(c1, r1)
    print("Campaign 1 stored and memory retained (UGC CTR: 4.8%).")
    
    # --- STEP 2: Brand asks for skincare ad again, 1 memory ---
    print("\n--- STEP 2: Creating campaign with 1 memory ---")
    recalled_2 = HindsightMemoryEngine.recall(industry="Skincare", audience="Women 20-35", style="UGC")
    print(f"Recalled memories (should be 1): {len(recalled_2)}")
    
    strategy_2 = generate_campaign_strategy(
        industry="Skincare",
        style="UGC",
        audience="Women 20-35",
        goal="Sales",
        recalled_memories=recalled_2
    )
    print("Strategy 2 (Learned Output):")
    print(f"  Confidence: {strategy_2['confidence']}")
    print(f"  Creative Style: {strategy_2['creativeStyle']}")
    print(f"  Recommended Hook: {strategy_2['recommendedHook']}")
    print(f"  Memory Insights: {strategy_2['memoryInsights']}")
    
    assert strategy_2['confidence'] == "Medium"
    assert "UGC" in strategy_2['creativeStyle']
    
    # Store Result for Campaign 2 (Founder Video, CTR 2.1%)
    c2_id = create_campaign(
        brand="RadiantSkin",
        industry="Skincare",
        audience="Women 20-35",
        style="Founder Video",
        goal="Brand Awareness"
    )
    add_campaign_results(
        campaign_id=c2_id,
        ctr=2.1,
        watch_time=15.2,
        conversion_rate=0.8,
        feedback="Founder story video underperformed. Users dropped off quickly."
    )
    c2 = get_campaign_by_id(c2_id)
    r2 = c2["results"][0]
    HindsightMemoryEngine.retain(c2, r2)
    print("Campaign 2 stored and memory retained (Founder Video CTR: 2.1%).")
    
    # --- STEP 3: Brand asks for skincare ad again, 2 memories ---
    print("\n--- STEP 3: Creating campaign with 2 memories ---")
    recalled_3 = HindsightMemoryEngine.recall(industry="Skincare", audience="Women 20-35", style="UGC")
    print(f"Recalled memories (should be 2): {len(recalled_3)}")
    
    strategy_3 = generate_campaign_strategy(
        industry="Skincare",
        style="UGC",
        audience="Women 20-35",
        goal="Sales",
        recalled_memories=recalled_3
    )
    print("Strategy 3 (Advanced Insights):")
    print(f"  Confidence: {strategy_3['confidence']}")
    print(f"  Creative Style: {strategy_3['creativeStyle']}")
    print(f"  Recommended Hook: {strategy_3['recommendedHook']}")
    print(f"  Memory Insights: {strategy_3['memoryInsights']}")
    
    assert strategy_3['confidence'] == "High"
    assert any("founder" in insight.lower() and "underperform" in insight.lower() for insight in strategy_3['memoryInsights'])
    
    # Store Result for Campaign 3 (Before/After UGC, CTR 5.2%)
    c3_id = create_campaign(
        brand="ClearSkinCo",
        industry="Skincare",
        audience="Women 20-35",
        style="Before/After UGC",
        goal="Sales"
    )
    add_campaign_results(
        campaign_id=c3_id,
        ctr=5.2,
        watch_time=18.4,
        conversion_rate=3.5,
        feedback="Before/After UGC transition increased retention and drove massive purchases."
    )
    c3 = get_campaign_by_id(c3_id)
    r3 = c3["results"][0]
    HindsightMemoryEngine.retain(c3, r3)
    print("Campaign 3 stored and memory retained (Before/After UGC CTR: 5.2%).")
    
    # --- FINAL STEP: Strategist reflects on all 3 campaigns ---
    print("\n--- FINAL STEP: Strategist reflects on all 3 campaigns ---")
    recalled_final = HindsightMemoryEngine.recall(industry="Skincare", audience="Women 20-35", style="UGC")
    print(f"Recalled memories (should be 3): {len(recalled_final)}")
    
    strategy_final = generate_campaign_strategy(
        industry="Skincare",
        style="Before/After UGC",
        audience="Women 20-35",
        goal="Sales",
        recalled_memories=recalled_final
    )
    print("Strategy Final (Optimized with Full Hindsight):")
    print(f"  Confidence: {strategy_final['confidence']}")
    print(f"  Creative Style: {strategy_final['creativeStyle']}")
    print(f"  Recommended Hook: {strategy_final['recommendedHook']}")
    print(f"  Memory Insights: {strategy_final['memoryInsights']}")
    
    assert strategy_final['confidence'] == "High"
    assert any("before/after" in insight.lower() for insight in strategy_final['memoryInsights'])
    
    print("\n=== ALL MEMORY FLOW TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_campaign_memory_progression()
