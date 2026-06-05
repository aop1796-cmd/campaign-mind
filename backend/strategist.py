import os
import json
from typing import Dict, Any, List
from groq import Groq

# System Prompt that instructs the LLM on how to behave and format the response.
SYSTEM_PROMPT = """You are a Senior Marketing Strategist. You have access to CampaignMind's Hindsight memory substrate, which contains the results and client feedback of past marketing campaigns.

Use the provided historical campaign memories to identify patterns, failures, and winning angles. Do not give generic advice. Be specific to what worked and what failed based on the campaign history.

You must respond ONLY with a raw JSON object matching the following structure:
{
  "memoryInsights": ["List of direct, actionable observations derived from past campaigns (e.g. 'UGC ads generated highest CTR')"],
  "recommendedHook": "A powerful, personalized ad hook recommendation, incorporating historical performance",
  "creativeStyle": "The recommended creative style (e.g. UGC, Before/After, Founder Video, Static)",
  "strategy": "The overarching strategy detailing why this was recommended based on Hindsight memory",
  "adScript": "A full, high-converting ad script (with visual cues and spoken audio instructions)",
  "confidence": "High", "Medium", or "Low" (determine based on similarity and volume of historical memory matches)
}

Do not include any introductory text, markdown formatting (other than the JSON itself), or explanation outside of the JSON block."""

def clean_and_parse_json(text: str) -> Dict[str, Any]:
    """
    Safely cleans and parses JSON from the LLM response.
    Handles occurrences where models wrap output in markdown code blocks.
    """
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
        
    if text.endswith("```"):
        text = text[:-3]
        
    text = text.strip()
    return json.loads(text)

def run_mock_strategist(industry: str, style: str, audience: str, memories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Mock strategist that simulates the hindsight learning progression based on retrieved campaigns.
    This guarantees a perfect demo flow even if the user has not provided an API Key.
    """
    industry_lower = industry.lower()
    
    # Analyze retrieved memories to construct dynamic insights
    insights = []
    recommended_hook = ""
    creative_style = ""
    strategy = ""
    ad_script = ""
    confidence = "Low"
    
    # Check what skincare campaigns exist in memory
    skincare_memories = [m for m in memories if "skincare" in m.get("industry", "").lower()]
    
    if "skincare" in industry_lower:
        if len(skincare_memories) == 0:
            insights = ["No previous skincare campaigns found in Hindsight memory. Using default industry benchmarks."]
            recommended_hook = "Tired of dull skin? Meet your new daily skincare routine."
            creative_style = "Founder Story / Direct Response"
            strategy = "Since we have no campaign history for skincare, we are launching with a standard founder story ad to introduce the brand and build trust."
            ad_script = (
                "[Visual: Founder standing in a bright bathroom holding the product]\n"
                "Founder: 'I created this skincare line because I couldn't find anything that actually worked for my sensitive skin...'\n"
                "[Visual: Close up of product texture]\n"
                "Founder: 'Formulated with organic botanicals, it hydrates without clogging pores.'\n"
                "[Visual: Call to action graphic: Shop Now]\n"
                "Voiceover: 'Click below to get 15% off your first bottle.'"
            )
            confidence = "Low"
            
        elif len(skincare_memories) == 1:
            prev = skincare_memories[0]
            insights = [
                f"UGC ads generated high CTR ({prev.get('ctr', 4.8)}%) in previous skincare campaigns.",
                "Learned: User-Generated Content style resonated strongly with the audience."
            ]
            recommended_hook = "POV: Your skin is glowing and you didn't have to spend $500 at the spa."
            creative_style = "User-Generated Content (UGC)"
            strategy = (
                f"Hindsight recall identified a highly successful UGC campaign (ID: {prev.get('id')}) with a {prev.get('ctr', 4.8)}% CTR. "
                "Client feedback shows UGC styled creatives outperformed standard brand videos. We are doubling down on UGC style."
            )
            ad_script = (
                "[Visual: Creator on screen, natural lighting, looking excited]\n"
                "Creator: 'Okay, I literally never do this but I had to share this skincare hack. My skin has never been this clear...'\n"
                "[Visual: Creator applying the serum, showing the glow on their cheek]\n"
                "Creator: 'This is the CampaignMind serum. It feels so lightweight and absorbs instantly.'\n"
                "[Visual: Text on screen: 4.8% CTR Favorite!]\n"
                "Creator: 'Check the link below to grab yours before they sell out!'"
            )
            confidence = "Medium"
            
        elif len(skincare_memories) == 2:
            insights = [
                "UGC ads generated highest CTR (4.8%) compared to Founder videos.",
                "Founder story videos significantly underperformed (2.1% CTR) for this audience."
            ]
            recommended_hook = "Stop wasting money on skincare products that sit on your shelf. Watch this."
            creative_style = "User-Generated Content (UGC)"
            strategy = (
                "Hindsight reflection shows a massive gap in performance: UGC ads (4.8% CTR) vs. Founder Stories (2.1% CTR). "
                "Founder videos underperformed because the audience preferred relatable creator-led content over corporate narratives. "
                "We recommend executing a high-energy UGC ad focusing on product application."
            )
            ad_script = (
                "[Visual: Creator holding the bottle close to the camera, talking directly]\n"
                "Creator: 'If you are still using 10 different skincare steps, stop. This one product changed everything.'\n"
                "[Visual: Quick cuts of creator applying the cream and smiling]\n"
                "Creator: 'My friends keep asking if I got facial work done. Nope, just this.'\n"
                "[Visual: Text Overlay: 'UGC Style - High CTR Approved']\n"
                "Creator: 'Tap below to see if the discount is still active!'"
            )
            confidence = "High"
            
        else:
            insights = [
                "Before/After UGC ads generated the highest overall CTR (5.2%).",
                "UGC formatting outperformed brand-narratives (4.8% vs 2.1% CTR).",
                "Client feedback confirms Before/After comparisons dramatically increased watch-time and hook retention."
            ]
            recommended_hook = "This 30-second transformation is why this serum has gone viral twice."
            creative_style = "Before/After UGC"
            strategy = (
                "Hindsight analysis shows Before/After UGC style is the clear winner (5.2% CTR), driving the highest retention. "
                "UGC styling continues to perform exceptionally, while Founder style remains low (2.1% CTR). "
                "Our recommendation is a Before/After split-screen or transition-style UGC ad."
            )
            ad_script = (
                "[Visual: Split screen. Left: Dull/red skin day 1. Right: Radiant skin day 14. Creator speaks]\n"
                "Creator: 'I was so skeptical about this serum, but look at my skin after just two weeks.'\n"
                "[Visual: Zoom-in on texture change, creator showing the product packaging]\n"
                "Creator: 'It cleared up my redness and literally gave me a glass-skin finish.'\n"
                "[Visual: Creator smiling, applying serum]\n"
                "Creator: 'Link is below, trust me, you need to try this Before/After hack!'"
            )
            confidence = "High"
    else:
        insights = [
            f"Analyzing history for {industry} ({style} style).",
            f"Retrieved {len(memories)} matching campaigns from Hindsight."
        ]
        
        recommended_hook = f"The ultimate {style} hook for your {industry} audience."
        creative_style = style if style else "Direct Response"
        strategy = (
            f"Based on historical data for {industry}, using a {style} creative style is expected to perform "
            f"well. Average performance benchmarks show stable engagement. Stored memories recommend focusing on audience pain-points."
        )
        ad_script = (
            f"[Visual: Product showcase suitable for {audience}]\n"
            f"Presenter: 'Here is why this {industry} solution is a game changer...'\n"
            f"[Visual: Demonstrating value proposition]\n"
            f"Presenter: 'Our past campaigns indicate that this feature drives the highest conversion.'\n"
            "[Visual: Call to Action]"
        )
        confidence = "High" if len(memories) >= 2 else "Medium"
        
    return {
        "memoryInsights": insights,
        "recommendedHook": recommended_hook,
        "creativeStyle": creative_style,
        "strategy": strategy,
        "adScript": ad_script,
        "confidence": confidence
    }

def generate_campaign_strategy(industry: str, style: str, audience: str, goal: str, recalled_memories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates a campaign strategy. Routes based on available credentials:
    1. NVIDIA NIM (NVIDIA_API_KEY)
    2. Groq API (GROQ_API_KEY)
    3. Mock Strategist (Fallback)
    """
    nvidia_key = os.environ.get("NVIDIA_API_KEY")
    groq_key = os.environ.get("GROQ_API_KEY")
    
    # Compile recalled memory reflection
    from memory_engine import HindsightMemoryEngine
    memory_reflection = HindsightMemoryEngine.reflect(recalled_memories)
    
    user_prompt = f"""Generate a campaign strategy for:
- Industry: {industry}
- Style: {style}
- Audience: {audience}
- Goal: {goal}

---
HINDSIGHT MEMORY CONTEXT:
{memory_reflection}
"""

    # 1. NVIDIA NIM Strategy
    if nvidia_key:
        try:
            from openai import OpenAI
            client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=nvidia_key
            )
            
            completion = client.chat.completions.create(
                model="meta/llama-3.1-8b-instruct",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=1024
            )
            
            response_text = completion.choices[0].message.content
            return clean_and_parse_json(response_text)
        except Exception as e:
            print(f"Error calling NVIDIA NIM API: {e}. Checking Groq fallback...")

    # 2. Groq Strategy
    if groq_key:
        try:
            client = Groq(api_key=groq_key)
            
            completion = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            response_text = completion.choices[0].message.content
            return clean_and_parse_json(response_text)
        except Exception as e:
            print(f"Error calling Groq API: {e}. Falling back to mock strategist.")

    # 3. Fallback to mock strategist
    return run_mock_strategist(industry, style, audience, recalled_memories)
