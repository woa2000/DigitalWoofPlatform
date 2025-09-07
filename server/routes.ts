import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { loggingMiddleware } from "./utils/logger";
import { HybridCacheProvider, cacheMiddleware, CacheKeys } from './cache/CacheProvider';
import { QueryOptimizer, queryAnalysisMiddleware } from './services/QueryOptimizer';

import dashboardRoutes from "./routes/dashboard";
import campaignsRoutes from "./routes/campaigns";
import brandVoiceRoutes from "./routes/brand-voice";
import complianceRoutes from "./routes/compliance";
import anamnesisRoutes from "./routes/anamnesis";
import onboardingRoutes from "./routes/onboarding";
import storageRoutes from "./routes/storage";
import contentRoutes from "./routes/content";
import performanceRoutes from "./routes/performance";
import analyticsRoutes from "./routes/analytics";
import templatesRoutes from "./routes/templates";
import templateSearchRoutes from "./routes/template-search";
import templateComparisonRoutes from "./routes/template-comparison";
import assetsRoutes from "./routes/assets";
import configRoutes from "./routes/config";
import profilesRoutes from "./routes/profiles";
import uploadRoutes from "./routes/upload";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  const cacheProvider = new HybridCacheProvider({
    defaultTTL: 300, // 5 minutes
    maxMemoryKeys: 500,
    enableL1: true,
    enableL2: process.env.REDIS_URL ? true : false,
    redisUrl: process.env.REDIS_URL,
    keyPrefix: 'dw'
  });
  const queryOptimizer = new QueryOptimizer();

  // Add logging middleware first
  app.use(loggingMiddleware);
  app.use(queryAnalysisMiddleware(queryOptimizer));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // API Routes (auth is now handled by Supabase)
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/campaigns", campaignsRoutes);
  app.use("/api/brand-voice", brandVoiceRoutes);
  app.use("/api/compliance", complianceRoutes);
  app.use("/api/anamnesis", anamnesisRoutes);
  app.use("/api/onboarding", onboardingRoutes);
  app.use("/api/storage", storageRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/performance", performanceRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/assets", assetsRoutes);
  app.use("/api/config", configRoutes);
  app.use("/api/profiles", profilesRoutes);
  app.use("/api/upload", uploadRoutes);

  // Apply caching to template routes
  app.use(
    "/api/templates", 
    cacheMiddleware(cacheProvider, (req) => CacheKeys.templates.list(req.query), 60), 
    templatesRoutes
  );
  app.use(
    "/api/templates/search", 
    cacheMiddleware(cacheProvider, (req) => CacheKeys.templates.search(req.query.q, req.query), 120),
    templateSearchRoutes
  );
  app.use("/api/templates/comparison", templateComparisonRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
