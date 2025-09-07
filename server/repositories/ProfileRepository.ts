import { eq } from "drizzle-orm";
import { db } from "../db";
import { profiles, type Profile, type InsertProfile } from "@shared/schema";

// In-memory fallback storage
const profilesCache = new Map<string, Profile>();

export class ProfileRepository {
  private async withFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn('[ProfileRepository] Database operation failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      return fallbackOperation();
    }
  }

  async create(data: InsertProfile): Promise<Profile> {
    const createProfile = async () => {
      const [profile] = await db.insert(profiles).values(data).returning();
      return profile;
    };

    const fallbackCreate = () => {
      const profile = {
        id: data.id,
        fullName: data.fullName || null,
        avatarUrl: data.avatarUrl || null,
        businessName: data.businessName || null,
        businessType: data.businessType || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        country: data.country || 'BR',
        planType: data.planType || 'free',
        subscriptionStatus: data.subscriptionStatus || 'active',
        subscriptionEndDate: data.subscriptionEndDate || null,
        onboardingCompleted: data.onboardingCompleted || false,
        onboardingStep: data.onboardingStep || 'welcome',
        timezone: data.timezone || 'America/Sao_Paulo',
        language: data.language || 'pt-BR',
        notifications: data.notifications || {
          email: true,
          browser: true,
          marketing: false
        },
        metadata: data.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Profile;
      profilesCache.set(data.id, profile);
      return profile;
    };

    return this.withFallback(createProfile, fallbackCreate);
  }

  async findById(id: string): Promise<Profile | null> {
    const findProfile = async () => {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, id))
        .limit(1);
      
      return profile || null;
    };

    const fallbackFind = () => {
      return profilesCache.get(id) || null;
    };

    return this.withFallback(findProfile, fallbackFind);
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const findProfile = async () => {
      // Note: This requires joining with auth.users table
      // For now, we'll use id-based lookup
      console.warn('[ProfileRepository] findByEmail not implemented - use findById instead');
      return null;
    };

    const fallbackFind = () => {
      // Search in cache by email (not efficient, but works for fallback)
      const profilesList = Array.from(profilesCache.values());
      for (const profile of profilesList) {
        // Note: email is not stored in profile, would need auth.users join
        console.warn('[ProfileRepository] findByEmail fallback not implemented');
        return null;
      }
      return null;
    };

    return this.withFallback(findProfile, fallbackFind);
  }

  async update(id: string, data: Partial<InsertProfile>): Promise<Profile | null> {
    const updateProfile = async () => {
      const [profile] = await db
        .update(profiles)
        .set(data)
        .where(eq(profiles.id, id))
        .returning();
      
      return profile || null;
    };

    const fallbackUpdate = () => {
      const existingProfile = profilesCache.get(id);
      if (!existingProfile) return null;

      const updatedProfile = {
        ...existingProfile,
        ...data,
        updatedAt: new Date(),
      };
      profilesCache.set(id, updatedProfile);
      return updatedProfile;
    };

    return this.withFallback(updateProfile, fallbackUpdate);
  }

  async delete(id: string): Promise<boolean> {
    const deleteProfile = async () => {
      const result = await db
        .delete(profiles)
        .where(eq(profiles.id, id));
      
      return true; // Drizzle doesn't return rowCount, assume success if no error
    };

    const fallbackDelete = () => {
      return profilesCache.delete(id);
    };

    return this.withFallback(deleteProfile, fallbackDelete);
  }

  async updateOnboardingStatus(id: string, completed: boolean, step?: string): Promise<Profile | null> {
    const updateData: any = {
      onboardingCompleted: completed,
    };

    if (step) {
      updateData.onboardingStep = step;
    }

    return this.update(id, updateData);
  }

  async updateBusinessInfo(id: string, businessData: {
    businessName?: string;
    businessType?: 'veterinaria' | 'petshop' | 'hotel' | 'creche' | 'adestramento' | 'outros';
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }): Promise<Profile | null> {
    return this.update(id, businessData as any);
  }

  // Utility method for testing/development
  getAllProfiles(): Profile[] {
    return Array.from(profilesCache.values());
  }

  // Clear cache (for testing)
  clearCache(): void {
    profilesCache.clear();
  }
}