import { Router } from "express";
import { storage } from "../storage";
import { checkCompliance, generateComplianceReport } from "../services/compliance";
import { validateCompliance } from "../services/openai";
import { z } from "zod";

const router = Router();

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

const complianceCheckSchema = z.object({
  content: z.string().min(1),
  type: z.string().min(1),
});

// Get compliance metrics
router.get("/metrics", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const metrics = await storage.getComplianceMetrics(userId);
    res.json(metrics);
  } catch (error) {
    console.error("Compliance metrics error:", error);
    res.status(500).json({ message: "Failed to get compliance metrics" });
  }
});

// Check content compliance
router.post("/check", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const { content, type } = complianceCheckSchema.parse(req.body);
    
    const user = await storage.getUser(userId);
    const businessType = user.businessType;
    
    // Use rule-based compliance check
    const ruleBasedResult = checkCompliance(content, businessType);
    
    // Optionally use AI validation for enhanced checking
    let aiResult;
    try {
      aiResult = await validateCompliance(content, businessType);
    } catch (aiError) {
      console.warn("AI compliance validation failed, using rule-based only:", aiError);
      aiResult = null;
    }
    
    // Combine results (prioritize rule-based for reliability)
    const result = {
      isCompliant: ruleBasedResult.isCompliant,
      score: aiResult ? Math.min(ruleBasedResult.score, aiResult.score) : ruleBasedResult.score,
      violations: ruleBasedResult.violations,
      aiViolations: aiResult?.violations || []
    };
    
    res.json(result);
  } catch (error) {
    console.error("Compliance check error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get compliance violations
router.get("/violations", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const violations = await storage.getComplianceViolations(userId);
    res.json(violations);
  } catch (error) {
    console.error("Get violations error:", error);
    res.status(500).json({ message: "Failed to get compliance violations" });
  }
});

// Generate compliance report
router.post("/report", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const contents = await storage.getAIContentByUser(userId);
    
    const contentsForReport = contents.map(content => ({
      id: content.id,
      content: content.content,
      type: content.type
    }));
    
    const report = generateComplianceReport(contentsForReport);
    res.json(report);
  } catch (error) {
    console.error("Generate compliance report error:", error);
    res.status(500).json({ message: "Failed to generate compliance report" });
  }
});

export default router;
