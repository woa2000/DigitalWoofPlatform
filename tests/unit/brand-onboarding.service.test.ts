/**
 * Unit tests for BrandOnboardingService
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BrandOnboardingService, OnboardingData } from '../../server/services/brand-onboarding.service.js';

// Mock the database
vi.mock('../../db.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    limit: vi.fn(),
    eq: vi.fn()
  }
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ column: a, value: b })),
  sql: vi.fn((template, ...values) => ({ template, values }))
}));

import { db } from '../../server/db.js';
import { brandOnboarding } from '../../shared/schema.js';

describe('BrandOnboardingService', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock database
    mockDb = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn()
    };

    // Mock the db import
    (db as any).select = mockDb.select;
    (db as any).insert = mockDb.insert;
    (db as any).update = mockDb.update;
    (db as any).delete = mockDb.delete;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getByUserId', () => {
    it('should return onboarding data when found in database', async () => {
      const mockOnboarding = {
        id: 'test-id',
        userId: 'user-123',
        logoUrl: 'https://supabase.com/logo.png',
        palette: ['#FF6B6B', '#4ECDC4'],
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: ['inovação'], avoidTerms: ['barato'], defaultCTAs: ['Saiba mais'] },
        brandValues: { values: [{ name: 'Qualidade', weight: 0.9 }], disclaimer: 'Test disclaimer' },
        stepCompleted: 'completed' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date()
      };

      // Mock database response
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockOnboarding])
          })
        })
      });

      const result = await BrandOnboardingService.getByUserId('user-123');

      expect(result).toEqual(mockOnboarding);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return null when no onboarding data found', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });

      const result = await BrandOnboardingService.getByUserId('user-123');

      expect(result).toBeNull();
    });

    it('should fallback to in-memory storage when database fails', async () => {
      mockDb.select.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      // Add mock data to in-memory storage
      const mockData = {
        id: 'mock-id',
        userId: 'user-123',
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: [], avoidTerms: [], defaultCTAs: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (BrandOnboardingService as any).inMemoryStorage.set('user-123', mockData);

      const result = await BrandOnboardingService.getByUserId('user-123');

      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create new onboarding record successfully', async () => {
      const onboardingData: OnboardingData = {
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: ['inovação'], avoidTerms: ['barato'], defaultCTAs: ['Saiba mais'] },
        brandValues: { values: [{ name: 'Qualidade', weight: 0.9 }], disclaimer: 'Test disclaimer' }
      };

      const mockCreated = {
        id: 'new-id',
        userId: 'user-123',
        ...onboardingData,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreated])
        })
      });

      const result = await BrandOnboardingService.create('user-123', onboardingData);

      expect(result).toEqual(mockCreated);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should fallback to in-memory storage when database fails', async () => {
      mockDb.insert.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const onboardingData: OnboardingData = {
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: [], avoidTerms: [], defaultCTAs: [] }
      };

      const result = await BrandOnboardingService.create('user-123', onboardingData);

      expect(result.userId).toBe('user-123');
      expect(result.toneConfig).toEqual(onboardingData.toneConfig);
      expect(result.id).toContain('mock-');
    });
  });

  describe('upsert', () => {
    it('should update existing record when found', async () => {
      const existingData = {
        id: 'existing-id',
        userId: 'user-123',
        logoUrl: null,
        palette: null,
        logoMetadata: null,
        toneConfig: { confianca: 0.5, acolhimento: 0.5, humor: 0.5, especializacao: 0.5 },
        languageConfig: { preferredTerms: [], avoidTerms: [], defaultCTAs: [] },
        brandValues: null,
        stepCompleted: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      };

      const updateData: OnboardingData = {
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: ['inovação'], avoidTerms: ['barato'], defaultCTAs: ['Saiba mais'] }
      };

      // Mock getByUserId to return existing data
      vi.spyOn(BrandOnboardingService, 'getByUserId').mockResolvedValue(existingData);

      // Mock update to return updated data
      vi.spyOn(BrandOnboardingService, 'update').mockResolvedValue({
        ...existingData,
        ...updateData,
        updatedAt: new Date()
      });

      const result = await BrandOnboardingService.upsert('user-123', updateData);

      expect(BrandOnboardingService.update).toHaveBeenCalledWith('user-123', updateData);
      expect(result.toneConfig.confianca).toBe(0.8);
    });

    it('should create new record when none exists', async () => {
      const onboardingData: OnboardingData = {
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: [], avoidTerms: [], defaultCTAs: [] }
      };

      // Mock getByUserId to return null
      vi.spyOn(BrandOnboardingService, 'getByUserId').mockResolvedValue(null);

      // Mock create
      const mockCreated = {
        id: 'new-id',
        userId: 'user-123',
        logoUrl: null,
        palette: null,
        logoMetadata: null,
        brandValues: null,
        stepCompleted: null,
        completedAt: null,
        ...onboardingData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vi.spyOn(BrandOnboardingService, 'create').mockResolvedValue(mockCreated);

      const result = await BrandOnboardingService.upsert('user-123', onboardingData);

      expect(BrandOnboardingService.create).toHaveBeenCalledWith('user-123', onboardingData);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('complete', () => {
    it('should mark onboarding as completed and return brand voice data', async () => {
      const mockOnboarding = {
        id: 'test-id',
        userId: 'user-123',
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: ['inovação'], avoidTerms: ['barato'], defaultCTAs: ['Saiba mais'] },
        brandValues: { values: [{ name: 'Qualidade', weight: 0.9 }], disclaimer: 'Test disclaimer' },
        stepCompleted: 'values',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.spyOn(BrandOnboardingService, 'update').mockResolvedValue({
        ...mockOnboarding,
        logoUrl: null,
        palette: null,
        logoMetadata: null,
        stepCompleted: 'completed' as const,
        completedAt: new Date()
      });

      const result = await BrandOnboardingService.complete('user-123');

      expect(result).toBeDefined();
      expect(result?.onboarding.stepCompleted).toBe('completed');
      expect(result?.brandVoiceData.tone).toEqual(mockOnboarding.toneConfig);
      expect(result?.brandVoiceData.language).toEqual(mockOnboarding.languageConfig);
      expect(result?.brandVoiceData.values).toEqual(mockOnboarding.brandValues);
    });

    it('should return null when onboarding not found', async () => {
      vi.spyOn(BrandOnboardingService, 'update').mockResolvedValue(null);

      const result = await BrandOnboardingService.complete('user-123');

      expect(result).toBeNull();
    });
  });

  describe('generateBrandVoiceJSON', () => {
    it('should generate complete Brand Voice JSON', async () => {
      const mockOnboarding = {
        id: 'test-id',
        userId: 'user-123',
        logoUrl: 'https://supabase.com/logo.png',
        palette: ['#FF6B6B', '#4ECDC4'],
        logoMetadata: { width: 200, height: 200, format: 'png', hasTransparency: true, fileSize: 1024 },
        toneConfig: { confianca: 0.8, acolhimento: 0.7, humor: 0.3, especializacao: 0.9 },
        languageConfig: { preferredTerms: ['inovação'], avoidTerms: ['barato'], defaultCTAs: ['Saiba mais'] },
        brandValues: { values: [{ name: 'Qualidade', weight: 0.9 }], disclaimer: 'Test disclaimer' },
        stepCompleted: 'completed' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date()
      };

      vi.spyOn(BrandOnboardingService, 'getByUserId').mockResolvedValue(mockOnboarding);

      const result = await BrandOnboardingService.generateBrandVoiceJSON('user-123');

      expect(result.metadata.version).toBe('1.0');
      expect(result.metadata.userId).toBe('user-123');
      expect(result.brand.logo.url).toBe(mockOnboarding.logoUrl);
      expect(result.brand.logo.palette).toEqual(mockOnboarding.palette);
      expect(result.tone).toEqual(mockOnboarding.toneConfig);
      expect(result.language).toEqual(mockOnboarding.languageConfig);
      expect(result.values).toEqual(mockOnboarding.brandValues);
    });

    it('should throw error when onboarding not found', async () => {
      vi.spyOn(BrandOnboardingService, 'getByUserId').mockResolvedValue(null);

      await expect(BrandOnboardingService.generateBrandVoiceJSON('user-123'))
        .rejects.toThrow('Onboarding data not found');
    });
  });
});