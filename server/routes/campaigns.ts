import { Router } from "express";
import { storage } from "../storage";
import { insertCampaignSchema } from "@shared/schema";

const router = Router();

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Get campaign summary
router.get("/summary", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const campaigns = await storage.getCampaignSummary(userId);
    res.json(campaigns);
  } catch (error) {
    console.error("Campaign summary error:", error);
    res.status(500).json({ message: "Failed to get campaign summary" });
  }
});

// Get all campaigns
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const campaigns = await storage.getCampaignsByUser(userId);
    res.json(campaigns);
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ message: "Failed to get campaigns" });
  }
});

// Create campaign
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const campaignData = insertCampaignSchema.parse({
      ...req.body,
      userId,
    });
    
    const campaign = await storage.createCampaign(campaignData);
    res.json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get campaign by ID
router.get("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const campaignId = req.params.id;
    
    const campaign = await storage.getCampaignById(campaignId);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ message: "Failed to get campaign" });
  }
});

// Update campaign
router.put("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const campaignId = req.params.id;
    
    const campaign = await storage.getCampaignById(campaignId);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const updateData = insertCampaignSchema.partial().parse(req.body);
    const updatedCampaign = await storage.updateCampaign(campaignId, updateData);
    
    res.json(updatedCampaign);
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete campaign
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const campaignId = req.params.id;
    
    const campaign = await storage.getCampaignById(campaignId);
    if (!campaign || campaign.userId !== userId) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    await storage.deleteCampaign(campaignId);
    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ message: "Failed to delete campaign" });
  }
});

export default router;
