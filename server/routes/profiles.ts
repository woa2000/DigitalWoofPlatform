import { Router } from "express";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { insertProfileSchema, type InsertProfile } from "@shared/schema";

const router = Router();
const profileRepository = new ProfileRepository();

// Middleware para simular autenticação (temporário)
const getCurrentUserId = (req: any): string | null => {
  // TODO: Implementar autenticação real
  return req.headers['x-user-id'] || 'test-user-123';
};

// GET /api/profiles/me - Get current user profile
router.get("/me", async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const profile = await profileRepository.findById(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error('[Profiles API] Error getting profile:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/profiles - Create new profile
router.post("/", async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate request body
    const validationResult = insertProfileSchema.safeParse({
      id: userId,
      ...req.body
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationResult.error.errors 
      });
    }

    const profile = await profileRepository.create(validationResult.data);
    res.status(201).json(profile);
  } catch (error) {
    console.error('[Profiles API] Error creating profile:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/profiles/me - Update current user profile
router.put("/me", async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate request body (partial update)
    const validationResult = insertProfileSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationResult.error.errors 
      });
    }

    const profile = await profileRepository.update(userId, validationResult.data);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error('[Profiles API] Error updating profile:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/profiles/me/onboarding - Update onboarding status
router.patch("/me/onboarding", async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { completed, step } = req.body;
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: "completed field is required and must be boolean" });
    }

    const profile = await profileRepository.updateOnboardingStatus(userId, completed, step);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error('[Profiles API] Error updating onboarding status:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/profiles/me/business - Update business information
router.patch("/me/business", async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const businessData = req.body;
    const allowedFields = ['businessName', 'businessType', 'phone', 'website', 'address', 'city', 'state', 'zipCode'];
    
    // Filter only allowed fields
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (businessData[field] !== undefined) {
        filteredData[field] = businessData[field];
      }
    }

    const profile = await profileRepository.updateBusinessInfo(userId, filteredData);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error('[Profiles API] Error updating business info:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/profiles/init - Initialize profile for new user (auto-creation simulation)
router.post("/init", async (req, res) => {
  try {
    const { userId, fullName, email } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Check if profile already exists
    const existingProfile = await profileRepository.findById(userId);
    if (existingProfile) {
      return res.json({ message: "Profile already exists", profile: existingProfile });
    }

    // Create new profile
    const profileData: InsertProfile = {
      id: userId,
      fullName: fullName || null,
      planType: 'free',
      subscriptionStatus: 'active',
      onboardingCompleted: false,
      onboardingStep: 'welcome',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
    };

    const profile = await profileRepository.create(profileData);
    res.status(201).json({ message: "Profile created successfully", profile });
  } catch (error) {
    console.error('[Profiles API] Error initializing profile:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;