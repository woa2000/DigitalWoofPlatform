/**
 * Performance Analytics API Routes (Express)
 * 
 * Endpoints para análise de performance de campanhas e templates.
 * Funcionalidades:
 * - Relatórios de analytics completos
 * - Performance em tempo real
 * - Comparação de templates
 * - Detecção de anomalias
 * - Insights personalizados
 */

import { Router } from "express";
import { z } from "zod";
import { CampaignPerformanceRepository } from "../repositories/CampaignPerformanceRepository";
import { CampaignTemplateRepository } from "../repositories/CampaignTemplateRepository";
import { PerformanceAnalyticsService } from "../services/PerformanceAnalyticsService";
import { db } from "../db";

const router = Router();

// Initialize services
const performanceRepo = new CampaignPerformanceRepository(db);
const templateRepo = new CampaignTemplateRepository(db);
const analyticsService = new PerformanceAnalyticsService(performanceRepo, templateRepo);

// ============================================================================
// Request/Response Schemas
// ============================================================================

const AnalyticsRequestSchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', 'custom']).default('30d'),
  serviceType: z.string().optional(),
  category: z.string().optional(),
  channel: z.string().optional(),
  includeIndustryBenchmarks: z.boolean().default(true),
  includePredictions: z.boolean().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

const PerformanceRecordSchema = z.object({
  campaignId: z.string().uuid(),
  templateId: z.string().uuid(),
  channel: z.string(),
  impressions: z.number().min(0),
  reaches: z.number().min(0),
  clicks: z.number().min(0),
  conversions: z.number().min(0),
  spend: z.number().min(0).optional(),
  measuredAt: z.string().datetime().optional()
});

const CompareTemplatesSchema = z.object({
  templateIds: z.array(z.string().uuid()).min(1).max(10),
  timeframe: z.enum(['7d', '30d', '90d']).default('30d')
});

// ============================================================================
// Middleware
// ============================================================================

function parseQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Parâmetros inválidos",
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  };
}

function parseBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  };
}

// Middleware simples de auth (assumindo que o userId vem no header)
function authMiddleware(req: any, res: any, next: any) {
  const userId = req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Token de autenticação necessário"
    });
  }
  
  req.userId = userId;
  next();
}

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /report
 * Gera relatório completo de analytics
 */
router.get("/report", authMiddleware, parseQuery(AnalyticsRequestSchema), async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const params = req.validatedQuery;

    const context = {
      serviceType: params.serviceType || '',
      category: params.category || '',
      channel: params.channel || '',
      timeframe: params.timeframe,
      includeIndustryBenchmarks: params.includeIndustryBenchmarks,
      includePredictions: params.includePredictions
    };

    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;

    const report = await analyticsService.generateAnalyticsReport(
      userId,
      context,
      startDate,
      endDate
    );

    return res.json({
      success: true,
      data: report,
      message: "Relatório de analytics gerado com sucesso"
    });
  } catch (error) {
    console.error("Error generating analytics report:", error);
    return res.status(500).json({
      success: false,
      error: "Erro ao gerar relatório de analytics"
    });
  }
});

/**
 * GET /realtime/:campaignId
 * Performance em tempo real de uma campanha
 */
router.get("/realtime/:campaignId", authMiddleware, async (req: any, res: any) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: "ID da campanha é obrigatório"
      });
    }

    const realtimeData = await analyticsService.getRealTimePerformance(campaignId);

    return res.json({
      success: true,
      data: realtimeData,
      message: "Dados de performance em tempo real obtidos com sucesso"
    });
  } catch (error) {
    console.error("Error fetching realtime performance:", error);
    return res.status(500).json({
      success: false,
      error: "Erro ao obter performance em tempo real"
    });
  }
});

/**
 * GET /dashboard
 * Dados agregados para dashboard
 */
router.get("/dashboard", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const days = parseInt(req.query.days as string || "30");

    const dashboardData = await performanceRepo.getDailyAggregates(userId, days);

    return res.json({
      success: true,
      data: {
        aggregates: dashboardData,
        period: `${days} dias`,
        totalDays: dashboardData.length
      },
      message: "Dados do dashboard obtidos com sucesso"
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      success: false,
      error: "Erro ao obter dados do dashboard"
    });
  }
});

export default router;