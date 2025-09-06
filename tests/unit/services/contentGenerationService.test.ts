import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentGenerationService } from '../../../server/services/contentGenerationService';
import { ComplianceChecker } from '../../../server/services/complianceChecker';
import { OpenAI } from 'openai';
import { createTestBrandVoice, createTestContentBrief } from '../../setup';

// Mock OpenAI
vi.mock('openai');
vi.mock('../../../server/services/openai', () => ({
  withOpenAILimit: vi.fn().mockImplementation((fn) => fn())
}));

describe('ContentGenerationService', () => {
  let service: ContentGenerationService;
  let mockOpenAI: vi.Mocked<OpenAI>;
  let mockComplianceChecker: vi.Mocked<ComplianceChecker>;

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn()
        }
      }
    } as any;

    mockComplianceChecker = {
      checkContent: vi.fn()
    } as any;

    service = new ContentGenerationService(mockOpenAI, mockComplianceChecker);
  });

  describe('generateContent', () => {
    it('should generate content successfully', async () => {
      // Arrange
      const brief = createTestContentBrief();
      const brandVoice = createTestBrandVoice();
      
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              variations: [{
                id: 'test_1',
                title: 'Test Title',
                body: 'Test content about pet care',
                cta: 'Learn more',
                hashtags: ['#petcare', '#health'],
                tone_analysis: {
                  brand_alignment: 0.9
                },
                compliance_notes: []
              }]
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse as any);
      mockComplianceChecker.checkContent.mockResolvedValue({
        isCompliant: true,
        issues: [],
        suggestions: [],
        warnings: [],
        score: 1.0
      });

      // Act
      const result = await service.generateContent(brief, brandVoice);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        title: 'Test Title',
        body: 'Test content about pet care',
        cta: 'Learn more',
        hashtags: ['#petcare', '#health']
      });
      expect(result[0].quality_metrics.compliance_score).toBe(1.0);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledOnce();
      expect(mockComplianceChecker.checkContent).toHaveBeenCalledWith(
        'Test content about pet care',
        brandVoice.brand.segment
      );
    });

    it('should handle compliance violations', async () => {
      // Arrange
      const brief = createTestContentBrief();
      const brandVoice = createTestBrandVoice();
      
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              variations: [{
                id: 'test_1',
                title: 'Guaranteed Cure',
                body: 'This will cure your pet 100%',
                cta: 'Buy now',
                hashtags: ['#cure'],
                tone_analysis: { brand_alignment: 0.8 },
                compliance_notes: []
              }]
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse as any);
      mockComplianceChecker.checkContent.mockResolvedValue({
        isCompliant: false,
        issues: ['No cure claims allowed'],
        suggestions: ['Use "may help" instead'],
        warnings: [],
        score: 0.3
      });

      // Act
      const result = await service.generateContent(brief, brandVoice);

      // Assert
      expect(result[0].compliance_notes).toContain('No cure claims allowed');
      expect(result[0].compliance_notes).toContain('Use "may help" instead');
      expect(result[0].quality_metrics.compliance_score).toBe(0.3);
    });

    it('should calculate engagement prediction', async () => {
      // Arrange
      const brief = createTestContentBrief({
        channel: 'instagram_post'
      });
      const brandVoice = createTestBrandVoice();
      
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              variations: [{
                id: 'test_1',
                title: 'Great Pet Care Tips',
                body: 'What do you think about these pet care tips? 🐕',
                cta: 'Share your experience',
                hashtags: ['#petcare'],
                tone_analysis: { brand_alignment: 0.9 },
                compliance_notes: []
              }]
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse as any);
      mockComplianceChecker.checkContent.mockResolvedValue({
        isCompliant: true,
        issues: [],
        suggestions: [],
        warnings: [],
        score: 1.0
      });

      // Act
      const result = await service.generateContent(brief, brandVoice, {
        includeEngagementPrediction: true
      });

      // Assert
      expect(result[0].engagement_prediction.score).toBeGreaterThan(0.5);
      expect(result[0].engagement_prediction.factors).toContain('includes_question');
      expect(result[0].engagement_prediction.factors).toContain('emoji_usage');
    });

    it('should handle OpenAI API errors', async () => {
      // Arrange
      const brief = createTestContentBrief();
      const brandVoice = createTestBrandVoice();
      
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(service.generateContent(brief, brandVoice))
        .rejects.toThrow('Content generation failed: API Error');
    });

    it('should handle invalid JSON response', async () => {
      // Arrange
      const brief = createTestContentBrief();
      const brandVoice = createTestBrandVoice();
      
      const mockAIResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON content'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse as any);

      // Act & Assert
      await expect(service.generateContent(brief, brandVoice))
        .rejects.toThrow('Failed to parse AI response as JSON');
    });
  });

  describe('generateBatchContent', () => {
    it('should process multiple briefs', async () => {
      // Arrange
      const briefs = [
        createTestContentBrief({ id: 'brief1' }),
        createTestContentBrief({ id: 'brief2' })
      ];
      const brandVoices = new Map([
        ['test-brand-voice', createTestBrandVoice()]
      ]);

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              variations: [{
                id: 'test_1',
                title: 'Test',
                body: 'Test content',
                cta: 'Test CTA',
                hashtags: ['#test'],
                tone_analysis: { brand_alignment: 0.8 },
                compliance_notes: []
              }]
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse as any);
      mockComplianceChecker.checkContent.mockResolvedValue({
        isCompliant: true,
        issues: [],
        suggestions: [],
        warnings: [],
        score: 1.0
      });

      // Act
      const results = await service.generateBatchContent(briefs, brandVoices);

      // Assert
      expect(results.size).toBe(2);
      expect(results.get('brief1')).toHaveLength(1);
      expect(results.get('brief2')).toHaveLength(1);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });
});