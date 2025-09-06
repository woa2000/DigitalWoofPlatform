import { apiRequest } from "./queryClient";

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest("GET", "/api/dashboard/stats"),
  getBrandVoice: () => apiRequest("GET", "/api/brand-voice/profile"),
  getCampaigns: () => apiRequest("GET", "/api/campaigns/summary"),
  getAIContentStatus: () => apiRequest("GET", "/api/ai-content/status"),
  getComplianceMetrics: () => apiRequest("GET", "/api/compliance/metrics"),
  getPerformanceData: () => apiRequest("GET", "/api/dashboard/performance"),
};

// Campaigns API
export const campaignsApi = {
  create: (campaign: any) => apiRequest("POST", "/api/campaigns", campaign),
  update: (id: string, campaign: any) => apiRequest("PUT", `/api/campaigns/${id}`, campaign),
  delete: (id: string) => apiRequest("DELETE", `/api/campaigns/${id}`),
  getAll: () => apiRequest("GET", "/api/campaigns"),
  getById: (id: string) => apiRequest("GET", `/api/campaigns/${id}`),
};

// Brand Voice API
export const brandVoiceApi = {
  create: (brandVoice: any) => apiRequest("POST", "/api/brand-voice", brandVoice),
  update: (id: string, brandVoice: any) => apiRequest("PUT", `/api/brand-voice/${id}`, brandVoice),
  getActive: () => apiRequest("GET", "/api/brand-voice/active"),
};

// AI Content API
export const aiContentApi = {
  generate: (prompt: string, type: string) => 
    apiRequest("POST", "/api/ai-content/generate", { prompt, type }),
  validate: (contentId: string) => 
    apiRequest("POST", `/api/ai-content/${contentId}/validate`),
  approve: (contentId: string) => 
    apiRequest("POST", `/api/ai-content/${contentId}/approve`),
};

// Compliance API
export const complianceApi = {
  check: (content: string, type: string) =>
    apiRequest("POST", "/api/compliance/check", { content, type }),
  getMetrics: () => apiRequest("GET", "/api/compliance/metrics"),
  getViolations: () => apiRequest("GET", "/api/compliance/violations"),
};

// Anamnesis API
export const anamnesisApi = {
  create: (data: { primaryUrl: string; socialUrls: string[] }) =>
    apiRequest("POST", "/api/anamnesis", data),
  getById: (id: string) => apiRequest("GET", `/api/anamnesis/${id}`),
  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    const queryString = queryParams.toString();
    return apiRequest("GET", `/api/anamnesis${queryString ? `?${queryString}` : ''}`);
  },
  getStatus: (id: string) => apiRequest("GET", `/api/anamnesis/${id}/status`),
  delete: (id: string) => apiRequest("DELETE", `/api/anamnesis/${id}`),
};
