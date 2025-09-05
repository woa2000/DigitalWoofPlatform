import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard"; 
import campaignsRoutes from "./routes/campaigns";
import brandVoiceRoutes from "./routes/brand-voice";
import complianceRoutes from "./routes/compliance";

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/campaigns", campaignsRoutes);
  app.use("/api/brand-voice", brandVoiceRoutes);
  app.use("/api/compliance", complianceRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
