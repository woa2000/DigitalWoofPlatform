export interface DashboardStats {
  activeCampaigns: number;
  aiContentGenerated: number;
  complianceRate: number;
  engagementRate: number;
  trends: {
    campaigns: number;
    content: number;
    compliance: number;
    engagement: number;
  };
}

export interface BrandVoiceProfile {
  id: string;
  name: string;
  tone: string;
  visualIdentity: {
    status: 'complete' | 'incomplete';
    logo: boolean;
    colors: boolean;
    typography: boolean;
  };
  voice: {
    status: 'active' | 'inactive';
    tone: string;
    description: string;
  };
  audience: {
    status: 'defined' | 'undefined';
    description: string;
  };
  consistency: number; // 0-100
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export interface CampaignSummary {
  id: string;
  name: string;
  type: string;
  status: 'ativa' | 'em_teste' | 'pausada';
  description: string;
  metrics: {
    leads: number;
    conversion: number;
  };
}

export interface AIContentStatus {
  type: string;
  title: string;
  description: string;
  status: 'completed' | 'processing' | 'pending';
  progress?: number;
}

export interface ComplianceMetrics {
  overall: number;
  categories: {
    medical: number;
    promotional: number;
    legal: number;
  };
}

export interface PerformanceData {
  instagram: number;
  email: number;
  whatsapp: number;
}

export interface BrandManualSection {
  id: string;
  title: string;
  icon: string;
  status: 'complete' | 'active' | 'defined' | 'in_use';
  description: string;
}
