from typing import List, Dict, Any
from database import get_db, create_memory

class HindsightMemoryEngine:
    @staticmethod
    def retain(campaign: Dict[str, Any], results: Dict[str, Any]) -> str:
        """
        Retain: Ingest campaign details and performance metrics to generate a durable memory.
        Creates a structured memory text and saves it to the DB.
        """
        brand = campaign.get("brand", "")
        industry = campaign.get("industry", "")
        style = campaign.get("style", "")
        audience = campaign.get("audience", "")
        ctr = results.get("ctr", 0.0)
        feedback = results.get("feedback", "")
        conv_rate = results.get("conversion_rate", 0.0)
        
        # Build structured memory representation
        memory_text = (
            f"Campaign ID {campaign['id']} for {brand} ({industry} industry). "
            f"Style: {style}. Audience: {audience}. "
            f"Performance: CTR {ctr}%, Conversion Rate {conv_rate}%. "
            f"Client Feedback/Learnings: {feedback}."
        )
        
        # Save to DB
        user_id = campaign.get("user_id", "mock_user_123")
        create_memory(memory_text, campaign["id"], user_id=user_id)
        return memory_text

    @staticmethod
    def recall(industry: str, audience: str, style: str, user_id: str = "mock_user_123") -> List[Dict[str, Any]]:
        """
        Recall: Search campaign database for historical campaigns with matching parameters.
        Retrieves campaigns in the same industry, style, or audience, sorted by CTR.
        """
        client = get_db()
        
        # Stream user-specific documents from Firestore collections
        c_docs = client.collection("campaigns").where("user_id", "==", user_id).stream()
        r_docs = client.collection("campaign_results").where("user_id", "==", user_id).stream()
        m_docs = client.collection("memories").where("user_id", "==", user_id).stream()
        
        # Load campaigns into memory
        campaigns = {}
        for doc in c_docs:
            c = doc.to_dict()
            campaigns[c["id"]] = c
            
        # Group campaign results by campaign_id
        results = {}
        for doc in r_docs:
            r = doc.to_dict()
            c_id = r["campaign_id"]
            if c_id not in results:
                results[c_id] = []
            results[c_id].append(r)
            
        # Group memories by campaign_id
        memories = {}
        for doc in m_docs:
            m = doc.to_dict()
            c_id = m["campaign_id"]
            memories[c_id] = m.get("memory_text", "")
            
        recalled = []
        for c_id, camp in campaigns.items():
            c_ind = camp.get("industry", "").lower()
            c_style = camp.get("style", "").lower()
            c_aud = camp.get("audience", "").lower()
            
            # Substring case-insensitive match (replaces SQLite LIKE)
            ind_match = (industry.lower() in c_ind) if industry else False
            style_match = (style.lower() in c_style) if style else False
            aud_match = (audience.lower() in c_aud) if audience else False
            
            if ind_match or style_match or aud_match:
                # Retrieve campaign results (must have results to rank/recall)
                camp_results = results.get(c_id, [])
                if not camp_results:
                    continue
                
                # Sort results by created_at descending to get the latest performance
                camp_results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
                latest_res = camp_results[0]
                
                camp_dict = {
                    "id": camp["id"],
                    "brand": camp.get("brand"),
                    "industry": camp.get("industry"),
                    "audience": camp.get("audience"),
                    "style": camp.get("style"),
                    "goal": camp.get("goal"),
                    "created_at": camp.get("created_at"),
                    "ctr": latest_res.get("ctr"),
                    "conversion_rate": latest_res.get("conversion_rate"),
                    "feedback": latest_res.get("feedback"),
                    "memory_text": memories.get(c_id, "")
                }
                
                # Calculate match score (higher is more relevant)
                score = 0
                if ind_match:
                    score += 3
                if style_match:
                    score += 2
                if aud_match:
                    score += 1
                camp_dict["match_score"] = score
                recalled.append(camp_dict)
                
        # Sort by match score descending, then by CTR descending
        recalled.sort(key=lambda x: (x["match_score"], x["ctr"] or 0.0), reverse=True)
        return recalled

    @staticmethod
    def reflect(recalled_memories: List[Dict[str, Any]]) -> str:
        """
        Reflect: Process the recalled memories to synthesize context for the LLM.
        """
        if not recalled_memories:
            return "No previous campaigns found in database. Rely on general campaign optimization best practices."
            
        reflection = "Based on the retrieved Hindsight memories of past campaigns, analyze the following performance trends:\n"
        for i, mem in enumerate(recalled_memories):
            reflection += (
                f"{i+1}. Campaign for Brand '{mem['brand']}' in '{mem['industry']}' targeting '{mem['audience']}' "
                f"using style '{mem['style']}' achieved a CTR of {mem['ctr']}%.\n"
                f"   - Learning: {mem['feedback'] or 'No feedback provided'}\n"
                f"   - Stored Memory Details: {mem['memory_text'] or 'N/A'}\n"
            )
            
        # Draw explicit patterns to help the model reflect on what succeeded and failed
        winning = [m for m in recalled_memories if m["ctr"] >= 4.0]
        losing = [m for m in recalled_memories if m["ctr"] < 3.0]
        
        reflection += "\nReflected Winning Patterns:\n"
        if winning:
            for w in winning:
                reflection += f"   - [SUCCESS] Style '{w['style']}' in '{w['industry']}' achieved high CTR ({w['ctr']}%). Learnings: {w['feedback']}\n"
        else:
            reflection += "   - No highly successful (CTR >= 4%) campaigns recorded yet.\n"
            
        reflection += "Reflected Underperforming Patterns:\n"
        if losing:
            for l in losing:
                reflection += f"   - [UNDERPERFORMED] Style '{l['style']}' in '{l['industry']}' underperformed with low CTR ({l['ctr']}%). Learnings: {l['feedback']}\n"
        else:
            reflection += "   - No poor performing (CTR < 3%) campaigns recorded yet.\n"
            
        return reflection
