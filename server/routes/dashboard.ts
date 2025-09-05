import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Get dashboard stats
router.get("/stats", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to get dashboard stats" });
  }
});

// Get performance data
router.get("/performance", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const performance = await storage.getPerformanceData(userId);
    res.json(performance);
  } catch (error) {
    console.error("Performance data error:", error);
    res.status(500).json({ message: "Failed to get performance data" });
  }
});

export default router;
