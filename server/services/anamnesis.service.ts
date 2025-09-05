/**
 * Anamnesis Service - CRUD operations for digital presence analysis
 * Simplified version for initial implementation
 */

import { 
  processUrl, 
  processUrls, 
  detectUrlType, 
  extractSocialProvider 
} from '../utils/url-normalization.js';
import { 
  validateAnamnesisRequest,
  type CreateAnamnesisRequest 
} from '../utils/url-validation.js';
import { AnamnesisAgentService } from './anamnesis-agent.service.js';
import { DeduplicationService } from './deduplication.service.js';
import { 
  type AnalysisResult,
  type AnalysisRequest,
  type AnalysisSource
} from '../../shared/types/anamnesis.js';

// Initialize analysis agent and deduplication service
const analysisAgent = new AnamnesisAgentService();
const deduplicationService = new DeduplicationService();

// In-memory storage for demo purposes (will be replaced with database)
const analysisStorage = new Map<string, any>();
const sourceStorage = new Map<string, any[]>();
const findingStorage = new Map<string, any>();

export class AnamnesisService {
  
  /**
   * Creates a new anamnesis analysis
   */
  async createAnalysis(userId: string, requestData: CreateAnamnesisRequest): Promise<{
    success: boolean;
    data?: {
      id: string;
      status: string;
      estimatedCompletion: string;
      sources: AnalysisSource[];
    };
    deduplication?: {
      isDuplicate: boolean;
      confidence: string;
      matchType: string;
      suggestions?: string[];
    };
    error?: string;
  }> {
    try {
      // Validate request data
      const validation = validateAnamnesisRequest(requestData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors?.join(', ') || 'Invalid request data'
        };
      }

      const validatedData = validation.data!;
      
      // Process and validate URLs
      const allUrls = [validatedData.primaryUrl, ...(validatedData.socialUrls || [])];
      const processedUrls = processUrls(allUrls);
      
      if (processedUrls.invalid.length > 0) {
        return {
          success: false,
          error: `Invalid URLs: ${processedUrls.invalid.map(u => u.error).join(', ')}`
        };
      }

      // Check for existing analysis using advanced deduplication
      const primaryUrlProcessed = processUrl(validatedData.primaryUrl);
      const existingAnalyses = Array.from(analysisStorage.values())
        .filter((a: any) => a.userId === userId)
        .map((a: any) => ({
          id: a.id,
          primaryUrl: a.primaryUrl,
          hash: primaryUrlProcessed.hash
        }));

      const deduplicationResult = await deduplicationService.checkDuplication(
        validatedData.primaryUrl,
        userId,
        existingAnalyses
      );
      
      if (deduplicationResult.isDuplicate && deduplicationResult.originalAnalysisId) {
        // Return existing analysis instead of creating duplicate
        const existingAnalysis = analysisStorage.get(deduplicationResult.originalAnalysisId);
        const sources = this.getAnalysisSources(deduplicationResult.originalAnalysisId) || [];
        
        return {
          success: true,
          data: {
            id: existingAnalysis.id,
            status: existingAnalysis.status,
            estimatedCompletion: new Date(Date.now() + 120000).toISOString(),
            sources: sources.map((s: any) => this.mapSourceToAnalysisSource(s))
          },
          deduplication: {
            isDuplicate: true,
            confidence: deduplicationResult.confidence,
            matchType: deduplicationResult.matchType
          }
        };
      }

      // Create new analysis record
      const analysisId = crypto.randomUUID();
      const estimatedCompletion = new Date(Date.now() + 120000); // 2 minutes from now
      
      const analysisRecord = {
        id: analysisId,
        userId,
        primaryUrl: validatedData.primaryUrl,
        status: 'queued',
        scoreCompleteness: 0,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      analysisStorage.set(analysisId, analysisRecord);

      // Create source records
      const sources: AnalysisSource[] = [];
      const isPrimary = (url: string) => url === validatedData.primaryUrl;
      
      for (const processedUrl of processedUrls.processed) {
        if (!processedUrl.isValid) continue;
        
        const urlType = detectUrlType(processedUrl.original);
        const provider = urlType === 'social' ? extractSocialProvider(processedUrl.original) : null;
        
        const sourceId = crypto.randomUUID();
        
        const sourceRecord = {
          id: sourceId,
          analysisId,
          type: isPrimary(processedUrl.original) ? 'site' : urlType,
          url: processedUrl.original,
          normalizedUrl: processedUrl.normalized,
          provider,
          hash: processedUrl.hash,
          lastFetchedAt: null
        };
        
        if (!sourceStorage.has(analysisId)) {
          sourceStorage.set(analysisId, []);
        }
        sourceStorage.get(analysisId)!.push(sourceRecord);
        
        sources.push({
          id: sourceId,
          type: isPrimary(processedUrl.original) ? 'site' : urlType,
          url: processedUrl.original,
          normalizedUrl: processedUrl.normalized,
          provider: provider || undefined,
          status: 'pending',
          hash: processedUrl.hash
        });
      }

      // Start background analysis
      this.processAnalysisBackground(analysisId, userId, validatedData, sources);

      const response: any = {
        success: true,
        data: {
          id: analysisId,
          status: 'queued',
          estimatedCompletion: estimatedCompletion.toISOString(),
          sources
        }
      };

      // Add deduplication info if there were suggestions
      if (deduplicationResult.suggestions && deduplicationResult.suggestions.length > 0) {
        response.deduplication = {
          isDuplicate: false,
          confidence: deduplicationResult.confidence,
          matchType: deduplicationResult.matchType,
          suggestions: deduplicationResult.suggestions
        };
      }

      return response;

    } catch (error) {
      console.error('Error creating analysis:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Retrieves an analysis by ID
   */
  async getAnalysisById(userId: string, analysisId: string): Promise<{
    success: boolean;
    data?: AnalysisResult;
    error?: string;
  }> {
    try {
      const analysisRecord = analysisStorage.get(analysisId);
      
      if (!analysisRecord || analysisRecord.userId !== userId) {
        return {
          success: false,
          error: 'Analysis not found'
        };
      }

      // Get sources and findings
      const sources = this.getAnalysisSources(analysisId) || [];
      const findings = this.getAnalysisFindings(analysisId);

      // Build complete result
      const result: AnalysisResult = {
        id: analysisRecord.id,
        status: analysisRecord.status,
        scoreCompleteness: analysisRecord.scoreCompleteness || 0,
        findings,
        sources: sources.map((s: any) => this.mapSourceToAnalysisSource(s)),
        metadata: {
          startedAt: analysisRecord.createdAt,
          completedAt: analysisRecord.updatedAt,
          duration: analysisRecord.updatedAt.getTime() - analysisRecord.createdAt.getTime(),
          sourceCount: sources.length,
          dataPoints: Object.keys(findings).length,
          confidence: Math.min(100, (analysisRecord.scoreCompleteness || 0) * 0.8),
          warnings: [],
          limitations: ['Mock analysis results for development']
        },
        errorMessage: analysisRecord.errorMessage || undefined,
        createdAt: analysisRecord.createdAt,
        updatedAt: analysisRecord.updatedAt
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Error getting analysis:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Lists analyses for a user with pagination
   */
  async listAnalyses(userId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{
    success: boolean;
    data?: Array<{
      id: string;
      primaryUrl: string;
      status: string;
      scoreCompleteness: number;
      createdAt: Date;
    }>;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    error?: string;
  }> {
    try {
      const page = options.page || 1;
      const limit = Math.min(options.limit || 20, 100);
      const offset = (page - 1) * limit;

      // Filter analyses by user
      const userAnalyses = Array.from(analysisStorage.values())
        .filter((a: any) => a.userId === userId)
        .filter((a: any) => !options.status || a.status === options.status)
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

      const total = userAnalyses.length;
      const paginatedAnalyses = userAnalyses.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedAnalyses.map((a: any) => ({
          id: a.id,
          primaryUrl: a.primaryUrl,
          status: a.status,
          scoreCompleteness: a.scoreCompleteness || 0,
          createdAt: a.createdAt
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error listing analyses:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Deletes an analysis (soft delete)
   */
  async deleteAnalysis(userId: string, analysisId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const analysisRecord = analysisStorage.get(analysisId);
      
      if (!analysisRecord || analysisRecord.userId !== userId) {
        return {
          success: false,
          error: 'Analysis not found'
        };
      }

      // Soft delete - update status
      analysisRecord.status = 'error';
      analysisRecord.errorMessage = 'Deleted by user';
      analysisRecord.updatedAt = new Date();
      
      analysisStorage.set(analysisId, analysisRecord);

      return {
        success: true
      };

    } catch (error) {
      console.error('Error deleting analysis:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Gets deduplication metrics and analytics
   */
  getDeduplicationMetrics(): any {
    return deduplicationService.generateReport();
  }

  /**
   * Validates hash integrity for an analysis
   */
  validateUrlIntegrity(url: string, hash: string): boolean {
    return deduplicationService.validateHashIntegrity(url, hash);
  }

  // Private helper methods

  private findAnalysisByUrlHash(userId: string, hash: string): any | null {
    const analysisIds = Array.from(sourceStorage.keys());
    for (const analysisId of analysisIds) {
      const sources = sourceStorage.get(analysisId);
      if (sources && sources.some((s: any) => s.hash === hash)) {
        const analysis = analysisStorage.get(analysisId);
        if (analysis && analysis.userId === userId && analysis.status === 'done') {
          return analysis;
        }
      }
    }
    return null;
  }

  private getAnalysisSources(analysisId: string) {
    return sourceStorage.get(analysisId) || [];
  }

  private getAnalysisFindings(analysisId: string) {
    return findingStorage.get(analysisId) || this.getEmptyFindings();
  }

  private mapSourceToAnalysisSource(source: any): AnalysisSource {
    return {
      id: source.id,
      type: source.type,
      url: source.url,
      normalizedUrl: source.normalizedUrl,
      provider: source.provider || undefined,
      status: 'fetched',
      lastFetchedAt: source.lastFetchedAt || undefined,
      hash: source.hash
    };
  }

  private async processAnalysisBackground(
    analysisId: string,
    userId: string,
    requestData: CreateAnamnesisRequest,
    sources: AnalysisSource[]
  ): Promise<void> {
    // Run analysis in background
    setImmediate(async () => {
      try {
        // Update status to running
        const analysisRecord = analysisStorage.get(analysisId);
        if (analysisRecord) {
          analysisRecord.status = 'running';
          analysisRecord.updatedAt = new Date();
          analysisStorage.set(analysisId, analysisRecord);
        }

        // Prepare analysis request
        const analysisRequest: AnalysisRequest = {
          primaryUrl: requestData.primaryUrl,
          socialUrls: requestData.socialUrls || [],
          sources,
          userId,
          requestId: analysisId
        };

        // Run analysis
        const result = await analysisAgent.analyzeDigitalPresence(analysisRequest);

        // Save results
        await this.saveAnalysisResults(analysisId, result);

      } catch (error) {
        console.error('Background analysis failed:', error);
        
        const analysisRecord = analysisStorage.get(analysisId);
        if (analysisRecord) {
          analysisRecord.status = 'error';
          analysisRecord.errorMessage = error instanceof Error ? error.message : 'Analysis failed';
          analysisRecord.updatedAt = new Date();
          analysisStorage.set(analysisId, analysisRecord);
        }
      }
    });
  }

  private async saveAnalysisResults(analysisId: string, result: AnalysisResult): Promise<void> {
    // Update analysis record
    const analysisRecord = analysisStorage.get(analysisId);
    if (analysisRecord) {
      analysisRecord.status = result.status;
      analysisRecord.scoreCompleteness = result.scoreCompleteness;
      analysisRecord.errorMessage = result.errorMessage;
      analysisRecord.updatedAt = new Date();
      analysisStorage.set(analysisId, analysisRecord);
    }

    // Save findings
    findingStorage.set(analysisId, result.findings);
  }

  private getEmptyFindings() {
    return {
      identity: { score: 0, findings: [], recommendations: [], confidence: 'low' },
      personas: { 
        primaryPersona: { name: '', age: '', profile: '', needs: [], painPoints: [] }, 
        secondaryPersonas: [], 
        insights: [] 
      },
      ux: {
        navigation: { score: 0, issues: [], strengths: [] },
        content: { score: 0, readability: 0, engagement: [] },
        conversion: { score: 0, ctaPresence: false, trustSignals: [] },
        mobile: { score: 0, responsive: false, issues: [] }
      },
      ecosystem: { 
        socialPresence: [], 
        competitors: [], 
        marketPosition: { category: '', differentiation: [], threats: [] } 
      },
      actionPlan: { immediate: [], shortTerm: [], longTerm: [] },
      roadmap: { phases: [], milestones: [], budget: { total: 0, breakdown: [] } },
      homeAnatomy: {
        structure: {
          header: { logo: false, navigation: [], contact: false, cta: false },
          hero: { headline: '', subheadline: '', cta: '', media: 'none' as const },
          sections: [],
          footer: { links: [], contact: false, social: [] }
        },
        performance: { loadTime: 0, mobileOptimized: false, seoScore: 0, accessibilityScore: 0 }
      },
      questions: { brandStrategy: [], contentStrategy: [], technical: [], business: [] }
    };
  }
}