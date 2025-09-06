import { 
  BrandVoice,
  InsertBrandVoice,
  Campaign,
  InsertCampaign,
  AIContent,
  InsertAIContent,
  ComplianceCheck,
  InsertComplianceCheck,
  BrandAsset,
  InsertBrandAsset,
  BusinessAnamnesis,
  InsertBusinessAnamnesis
} from "@shared/schema";
import { randomUUID } from "crypto";

// TODO: User operations will be handled by Supabase Auth
// These interfaces are temporarily disabled during migration
interface LegacyUser {
  id: string;
  email: string;
  name: string;
  businessType: string;
  businessName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data structures for development
interface MockDatabase {
  users: Map<string, LegacyUser>;
  brandVoices: Map<string, BrandVoice>;
  campaigns: Map<string, Campaign>;
  aiContent: Map<string, AIContent>;
  complianceChecks: Map<string, ComplianceCheck>;
  brandAssets: Map<string, BrandAsset>;
  businessAnamnesis: Map<string, BusinessAnamnesis>;
}

export interface IStorage {
  // User operations - TODO: Migrate to Supabase Auth
  getUser(id: string): Promise<LegacyUser | undefined>;
  getUserByEmail(email: string): Promise<LegacyUser | undefined>;
  createUser(user: Partial<LegacyUser>): Promise<LegacyUser>;

  // Brand Voice operations
  getActiveBrandVoice(userId: string): Promise<BrandVoice | undefined>;
  getBrandVoiceById(id: string): Promise<BrandVoice | undefined>;
  createBrandVoice(brandVoice: InsertBrandVoice): Promise<BrandVoice>;
  updateBrandVoice(id: string, updates: Partial<InsertBrandVoice>): Promise<BrandVoice>;

  // Campaign operations
  getCampaignsByUser(userId: string): Promise<Campaign[]>;
  getCampaignSummary(userId: string): Promise<Campaign[]>;
  getCampaignById(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;

  // AI Content operations
  getAIContentByUser(userId: string): Promise<AIContent[]>;
  createAIContent(content: InsertAIContent): Promise<AIContent>;
  updateAIContent(id: string, updates: Partial<InsertAIContent>): Promise<AIContent>;

  // Compliance operations
  getComplianceMetrics(userId: string): Promise<any>;
  getComplianceViolations(userId: string): Promise<ComplianceCheck[]>;
  createComplianceCheck(check: InsertComplianceCheck): Promise<ComplianceCheck>;

  // Dashboard operations
  getDashboardStats(userId: string): Promise<any>;
  getPerformanceData(userId: string): Promise<any>;

  // Brand Assets operations
  getBrandAssetsByUser(userId: string): Promise<BrandAsset[]>;
  createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset>;

  // Business Anamnesis operations
  getBusinessAnamnesisByUser(userId: string): Promise<BusinessAnamnesis[]>;
  createBusinessAnamnesis(anamnesis: InsertBusinessAnamnesis): Promise<BusinessAnamnesis>;
}

export class MemStorage implements IStorage {
  private db: MockDatabase;

  constructor() {
    this.db = {
      users: new Map(),
      brandVoices: new Map(),
      campaigns: new Map(),
      aiContent: new Map(),
      complianceChecks: new Map(),
      brandAssets: new Map(),
      businessAnamnesis: new Map(),
    };

    // Initialize with some sample data for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create a sample user
    const sampleUserId = randomUUID();
    const sampleUser: LegacyUser = {
      id: sampleUserId,
      email: "demo@woofmarketing.com",
      name: "Dr. Maria Silva",
      businessType: "veterinaria",
      businessName: "Clínica Veterinária Pet Care",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.users.set(sampleUserId, sampleUser);

    // Create sample brand voice
    const brandVoiceId = randomUUID();
    const sampleBrandVoice: BrandVoice = {
      id: brandVoiceId,
      userId: sampleUserId,
      name: "Pet Care Voice",
      tone: "profissional-amigavel",
      persona: {
        demographics: { age: "25-45", class: "B/C", location: "urbano" },
        psychographics: { values: ["bem-estar", "confiança"], lifestyle: "ativo" }
      },
      values: ["amor pelos animais", "profissionalismo", "transparência"],
      guidelines: {
        do: ["usar linguagem empática", "incluir disclaimers"],
        dont: ["fazer diagnósticos", "prometer curas"]
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.brandVoices.set(brandVoiceId, sampleBrandVoice);

    // Create sample campaigns
    const campaign1Id = randomUUID();
    const campaign2Id = randomUUID();
    
    const sampleCampaigns: Campaign[] = [
      {
        id: campaign1Id,
        userId: sampleUserId,
        name: "Check-up Preventivo",
        type: "checkup_preventivo",
        status: "ativa",
        channels: ["instagram", "email", "whatsapp"],
        targetAudience: { age: "25-45", interests: ["pets", "saude"] },
        metrics: { leads: 147, conversions: 18, engagement: 8.7 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: campaign2Id,
        userId: sampleUserId,
        name: "Programa VIP Pet",
        type: "programa_vip",
        status: "em_teste",
        channels: ["instagram", "email"],
        targetAudience: { age: "30-50", interests: ["premium", "fidelidade"] },
        metrics: { leads: 89, conversions: 21, engagement: 12.3 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleCampaigns.forEach(campaign => {
      this.db.campaigns.set(campaign.id, campaign);
    });
  }

  // User operations
  async getUser(id: string): Promise<LegacyUser | undefined> {
    return this.db.users.get(id);
  }

  async getUserByEmail(email: string): Promise<LegacyUser | undefined> {
    return Array.from(this.db.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: Partial<LegacyUser>): Promise<LegacyUser> {
    const id = randomUUID();
    const user: LegacyUser = {
      id,
      email: insertUser.email || '',
      name: insertUser.name || '',
      businessType: insertUser.businessType || '',
      businessName: insertUser.businessName || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.users.set(id, user);
    return user;
  }

  // Brand Voice operations
  async getActiveBrandVoice(userId: string): Promise<BrandVoice | undefined> {
    return Array.from(this.db.brandVoices.values()).find(
      bv => bv.userId === userId && bv.isActive
    );
  }

  async getBrandVoiceById(id: string): Promise<BrandVoice | undefined> {
    return this.db.brandVoices.get(id);
  }

  async createBrandVoice(insertBrandVoice: InsertBrandVoice): Promise<BrandVoice> {
    const id = randomUUID();
    const brandVoice: BrandVoice = {
      ...insertBrandVoice,
      id,
      isActive: insertBrandVoice.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.brandVoices.set(id, brandVoice);
    return brandVoice;
  }

  async updateBrandVoice(id: string, updates: Partial<InsertBrandVoice>): Promise<BrandVoice> {
    const existing = this.db.brandVoices.get(id);
    if (!existing) throw new Error("Brand voice not found");

    const updated: BrandVoice = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.db.brandVoices.set(id, updated);
    return updated;
  }

  // Campaign operations
  async getCampaignsByUser(userId: string): Promise<Campaign[]> {
    return Array.from(this.db.campaigns.values()).filter(c => c.userId === userId);
  }

  async getCampaignSummary(userId: string): Promise<Campaign[]> {
    return this.getCampaignsByUser(userId);
  }

  async getCampaignById(id: string): Promise<Campaign | undefined> {
    return this.db.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      metrics: insertCampaign.metrics ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const existing = this.db.campaigns.get(id);
    if (!existing) throw new Error("Campaign not found");

    const updated: Campaign = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.db.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: string): Promise<void> {
    this.db.campaigns.delete(id);
  }

  // AI Content operations
  async getAIContentByUser(userId: string): Promise<AIContent[]> {
    return Array.from(this.db.aiContent.values()).filter(c => c.userId === userId);
  }

  async createAIContent(insertContent: InsertAIContent): Promise<AIContent> {
    const id = randomUUID();
    const content: AIContent = {
      ...insertContent,
      id,
      campaignId: insertContent.campaignId ?? null,
      brandVoiceId: insertContent.brandVoiceId ?? null,
      complianceScore: insertContent.complianceScore ?? null,
      humanReviewRequired: insertContent.humanReviewRequired ?? false,
      isPublished: insertContent.isPublished ?? false,
      publishedAt: insertContent.publishedAt ?? null,
      createdAt: new Date(),
    };
    this.db.aiContent.set(id, content);
    return content;
  }

  async updateAIContent(id: string, updates: Partial<InsertAIContent>): Promise<AIContent> {
    const existing = this.db.aiContent.get(id);
    if (!existing) throw new Error("AI content not found");

    const updated: AIContent = {
      ...existing,
      ...updates,
    };
    this.db.aiContent.set(id, updated);
    return updated;
  }

  // Compliance operations
  async getComplianceMetrics(userId: string): Promise<any> {
    const userContent = await this.getAIContentByUser(userId);
    const totalContent = userContent.length;
    const compliantContent = userContent.filter(c => c.complianceStatus === "approved").length;

    return {
      overall: totalContent > 0 ? Math.round((compliantContent / totalContent) * 100 * 10) / 10 : 98.5,
      categories: {
        medical: 100,
        promotional: 96,
        legal: 100
      }
    };
  }

  async getComplianceViolations(userId: string): Promise<ComplianceCheck[]> {
    const userContent = await this.getAIContentByUser(userId);
    const contentIds = userContent.map(c => c.id);
    
    return Array.from(this.db.complianceChecks.values()).filter(
      check => contentIds.includes(check.contentId) && !check.passed
    );
  }

  async createComplianceCheck(insertCheck: InsertComplianceCheck): Promise<ComplianceCheck> {
    const id = randomUUID();
    const check: ComplianceCheck = {
      ...insertCheck,
      id,
      message: insertCheck.message ?? null,
      suggestion: insertCheck.suggestion ?? null,
      createdAt: new Date(),
    };
    this.db.complianceChecks.set(id, check);
    return check;
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<any> {
    const campaigns = await this.getCampaignsByUser(userId);
    const aiContent = await this.getAIContentByUser(userId);
    const compliance = await this.getComplianceMetrics(userId);

    return {
      activeCampaigns: campaigns.filter(c => c.status === "ativa").length,
      aiContentGenerated: aiContent.length,
      complianceRate: compliance.overall,
      engagementRate: 7.2,
      trends: {
        campaigns: 15,
        content: 23,
        compliance: 2.1,
        engagement: 2.1
      }
    };
  }

  async getPerformanceData(userId: string): Promise<any> {
    return {
      instagram: 8.7,
      email: 15.2,
      whatsapp: 23.5
    };
  }

  // Brand Assets operations
  async getBrandAssetsByUser(userId: string): Promise<BrandAsset[]> {
    return Array.from(this.db.brandAssets.values()).filter(a => a.userId === userId);
  }

  async createBrandAsset(insertAsset: InsertBrandAsset): Promise<BrandAsset> {
    const id = randomUUID();
    const asset: BrandAsset = {
      ...insertAsset,
      id,
      metadata: insertAsset.metadata ?? {},
      createdAt: new Date(),
    };
    this.db.brandAssets.set(id, asset);
    return asset;
  }

  // Business Anamnesis operations
  async getBusinessAnamnesisByUser(userId: string): Promise<BusinessAnamnesis[]> {
    return Array.from(this.db.businessAnamnesis.values()).filter(a => a.userId === userId);
  }

  async createBusinessAnamnesis(insertAnamnesis: InsertBusinessAnamnesis): Promise<BusinessAnamnesis> {
    const id = randomUUID();
    const anamnesis: BusinessAnamnesis = {
      ...insertAnamnesis,
      id,
      analysis: insertAnamnesis.analysis ?? {},
      recommendations: insertAnamnesis.recommendations ?? {},
      score: insertAnamnesis.score ?? null,
      completedAt: new Date(),
    };
    this.db.businessAnamnesis.set(id, anamnesis);
    return anamnesis;
  }
}

export const storage = new MemStorage();
