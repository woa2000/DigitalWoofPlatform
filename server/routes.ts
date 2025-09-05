import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loggingMiddleware } from "./utils/logger";
import dashboardRoutes from "./routes/dashboard"; 
import campaignsRoutes from "./routes/campaigns";
import brandVoiceRoutes from "./routes/brand-voice";
import complianceRoutes from "./routes/compliance";
import anamnesisRoutes from "./routes/anamnesis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add logging middleware first
  app.use(loggingMiddleware);

  // API Routes (auth is now handled by Supabase)
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/campaigns", campaignsRoutes);
  app.use("/api/brand-voice", brandVoiceRoutes);
  app.use("/api/compliance", complianceRoutes);
  app.use("/api/anamnesis", anamnesisRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
