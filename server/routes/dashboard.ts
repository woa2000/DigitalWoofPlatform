import { Router } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Test route to verify DrizzleStorage without authentication
router.get("/test/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`🔍 Testing DrizzleStorage for user: ${userId}`);
    
    const stats = await storage.getDashboardStats(userId);
    
    res.json({
      message: "DrizzleStorage test successful",
      userId,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Dashboard test error:", error);
    res.status(500).json({ 
      message: "Failed to test dashboard", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

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
