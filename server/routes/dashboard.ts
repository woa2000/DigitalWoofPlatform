import { Router } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Get dashboard stats
router.get("/stats", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to get dashboard stats" });
  }
});

// Get performance data
router.get("/performance", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const performance = await storage.getPerformanceData(userId);
    res.json(performance);
  } catch (error) {
    console.error("Performance data error:", error);
    res.status(500).json({ message: "Failed to get performance data" });
  }
});

export default router;
