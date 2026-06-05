const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Campaign {
  id: number;
  brand: string;
  industry: string;
  audience: string;
  style: string;
  goal: string;
  created_at: string;
  ctr?: number;
  conversion_rate?: number;
  feedback?: string;
  watch_time?: number;
}

export interface CampaignDetail extends Campaign {
  results: CampaignResult[];
  memories: Memory[];
}

export interface CampaignResult {
  id: number;
  campaign_id: number;
  ctr: number;
  watch_time: number;
  conversion_rate: number;
  feedback: string;
  created_at: string;
}

export interface Memory {
  id: number;
  memory_text: string;
  campaign_id: number;
  created_at: string;
  brand?: string;
  industry?: string;
  style?: string;
}

export interface StrategyResponse {
  strategy: {
    memoryInsights: string[];
    recommendedHook: string;
    creativeStyle: string;
    strategy: string;
    adScript: string;
    confidence: string;
  };
  retrievedMemories: Array<Campaign & { memory_text: string; match_score: number }>;
}

export interface AnalyticsData {
  ctrTrends: Array<{ date: string; avg_ctr: number; count: number }>;
  industryPerformance: Array<{ industry: string; avg_ctr: number; count: number }>;
  stylePerformance: Array<{ style: string; avg_ctr: number; count: number }>;
  memoryGrowth: Array<{ date: string; count: number }>;
  summary: {
    totalCampaigns: number;
    averageCtr: number;
    bestCampaign: { brand: string; style: string; industry: string; ctr: number } | null;
    memoriesStored: number;
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getCampaigns: () => request<Campaign[]>('/campaigns'),
  
  getCampaign: (id: number) => request<CampaignDetail>(`/campaigns/${id}`),
  
  createCampaign: (data: { brand: string; industry: string; audience: string; style: string; goal: string }) => 
    request<{ status: string; campaign: Campaign }>(`/campaigns`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  addCampaignResults: (campaignId: number, data: { ctr: number; watch_time: number; conversion_rate: number; feedback: string }) =>
    request<{ status: string; result_id: number; memory_retained: string }>(`/campaigns/${campaignId}/results`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getMemories: () => request<Memory[]>('/memories'),
  
  generateStrategy: (data: { industry: string; style: string; audience: string; goal: string }) =>
    request<StrategyResponse>('/generate-strategy', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getAnalytics: () => request<AnalyticsData>('/analytics'),
};
