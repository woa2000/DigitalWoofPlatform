import { Router } from "express";
import { storage } from "../storage";
import { insertBrandVoiceSchema } from "@shared/schema";
import { createBrandVoiceJSON, validateBrandVoiceJSON } from "../services/brand-voice";

const router = Router();

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Get brand voice profile
router.get("/profile", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    const brandVoice = await storage.getActiveBrandVoice(userId);
    
    if (!brandVoice) {
      // Return default profile structure
      return res.json({
        id: null,
        name: "Perfil Padrão",
        tone: "profissional-amigável",
        visualIdentity: {
          status: "incomplete",
          logo: false,
          colors: false,
          typography: false
        },
        voice: {
          status: "inactive",
          tone: "profissional-amigável",
          description: "Tom empático e profissional"
        },
        audience: {
          status: "undefined",
          description: "Tutores de pets preocupados com bem-estar"
        },
        consistency: 0
      });
    }
    
    // Transform brand voice data for frontend
    const profile = {
      id: brandVoice.id,
      name: brandVoice.name,
      tone: brandVoice.tone,
      visualIdentity: {
        status: "complete",
        logo: true,
        colors: true,
        typography: true
      },
      voice: {
        status: "active",
        tone: brandVoice.tone,
        description: `${brandVoice.tone}, empático`
      },
      audience: {
        status: "defined",
        description: "Tutores 25-45 anos, classe B/C"
      },
      consistency: 98.5
    };
    
    res.json(profile);
  } catch (error) {
    console.error("Get brand voice profile error:", error);
    res.status(500).json({ message: "Failed to get brand voice profile" });
  }
});

// Get active brand voice
router.get("/active", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const brandVoice = await storage.getActiveBrandVoice(userId);
    
    if (!brandVoice) {
      return res.status(404).json({ message: "No active brand voice found" });
    }
    
    res.json(brandVoice);
  } catch (error) {
    console.error("Get active brand voice error:", error);
    res.status(500).json({ message: "Failed to get active brand voice" });
  }
});

// Create brand voice
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    
    const brandVoiceData = insertBrandVoiceSchema.parse({
      ...req.body,
      userId,
    });
    
    // Generate Brand Voice JSON
    const brandVoiceJSON = createBrandVoiceJSON(
      { ...brandVoiceData, id: '', createdAt: new Date(), updatedAt: new Date() },
      user.businessType
    );
    
    // Validate JSON structure
    if (!validateBrandVoiceJSON(brandVoiceJSON)) {
      return res.status(400).json({ message: "Invalid Brand Voice JSON structure" });
    }
    
    const brandVoice = await storage.createBrandVoice(brandVoiceData);
    res.json(brandVoice);
  } catch (error) {
    console.error("Create brand voice error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update brand voice
router.put("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const brandVoiceId = req.params.id;
    
    const brandVoice = await storage.getBrandVoiceById(brandVoiceId);
    if (!brandVoice || brandVoice.userId !== userId) {
      return res.status(404).json({ message: "Brand voice not found" });
    }
    
    const updateData = insertBrandVoiceSchema.partial().parse(req.body);
    const updatedBrandVoice = await storage.updateBrandVoice(brandVoiceId, updateData);
    
    res.json(updatedBrandVoice);
  } catch (error) {
    console.error("Update brand voice error:", error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
