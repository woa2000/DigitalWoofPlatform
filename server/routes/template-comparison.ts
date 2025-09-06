/**
 * Template Comparison API Routes
 * 
 * Endpoints:
 * - POST /api/templates/comparison/metrics - Get comparison metrics for templates
 * - POST /api/templates/comparison/recommendations - Get recommendations based on selection
 * - POST /api/templates/comparison/export - Export comparison data
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const ComparisonMetricsRequest = z.object({
  templateIds: z.array(z.string().uuid()).min(1).max(4)
});

const RecommendationsRequest = z.object({
  templateIds: z.array(z.string().uuid()).min(1).max(4)
});

const ExportRequest = z.object({
  templateIds: z.array(z.string().uuid()).min(1).max(4),
  format: z.enum(['pdf', 'csv']),
  includeMetrics: z.boolean().default(true)
});

// Mock data for now - will be replaced with actual database integration
const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Campaign',
    category: 'aquisicao',
    serviceType: 'veterinaria',
    avgEngagementRate: '75.5',
    avgConversionRate: '12.3',
    usageCount: 145,
    successCases: 98,
    isPremium: false,
    contentPieces: [
      { type: 'email', channels: ['email'], automated: true },
      { type: 'social', channels: ['facebook', 'instagram'], automated: false }
    ],
    visualAssets: [
      { type: 'banner', size: 'medium' },
      { type: 'icon', size: 'small' }
    ]
  },
  {
    id: '2', 
    name: 'Loyalty Rewards',
    category: 'retencao',
    serviceType: 'petshop',
    avgEngagementRate: '68.2',
    avgConversionRate: '18.7',
    usageCount: 87,
    successCases: 72,
    isPremium: true,
    contentPieces: [
      { type: 'sms', channels: ['sms'], automated: true },
      { type: 'email', channels: ['email'], automated: true },
      { type: 'push', channels: ['app'], automated: false }
    ],
    visualAssets: [
      { type: 'logo', size: 'large' }
    ]
  },
  {
    id: '3',
    name: 'Emergency Alert',
    category: 'emergencia',
    serviceType: 'veterinaria',
    avgEngagementRate: '85.5',
    avgConversionRate: '22.1',
    usageCount: 56,
    successCases: 48,
    isPremium: true,
    contentPieces: [
      { type: 'sms', channels: ['sms'], automated: true },
      { type: 'email', channels: ['email'], automated: true }
    ],
    visualAssets: [
      { type: 'banner', size: 'large' }
    ]
  },
  {
    id: '4',
    name: 'Pet Care Tips',
    category: 'educacao',
    serviceType: 'veterinaria',
    avgEngagementRate: '78.2',
    avgConversionRate: '15.8',
    usageCount: 123,
    successCases: 89,
    isPremium: false,
    contentPieces: [
      { type: 'blog', channels: ['web'], automated: false },
      { type: 'email', channels: ['email'], automated: true },
      { type: 'social', channels: ['facebook', 'instagram'], automated: false }
    ],
    visualAssets: [
      { type: 'infographic', size: 'large' },
      { type: 'photo', size: 'medium' }
    ]
  },
  {
    id: '5',
    name: 'Grooming Special',
    category: 'upsell',
    serviceType: 'estetica',
    avgEngagementRate: '72.1',
    avgConversionRate: '28.4',
    usageCount: 91,
    successCases: 76,
    isPremium: false,
    contentPieces: [
      { type: 'email', channels: ['email'], automated: true },
      { type: 'social', channels: ['instagram'], automated: false }
    ],
    visualAssets: [
      { type: 'banner', size: 'medium' },
      { type: 'photo', size: 'large' }
    ]
  }
];

// POST /metrics
router.post('/metrics', async (req: Request, res: Response) => {
  try {
    const { templateIds } = ComparisonMetricsRequest.parse(req.body);
    
    // Filter templates by IDs
    const templates = mockTemplates.filter(t => templateIds.includes(t.id));
    
    if (templates.length === 0) {
      return res.status(404).json({ message: 'No templates found' });
    }

    // Calculate metrics for each template
    const metrics = templates.map((template) => {
      const engagement = parseFloat(template.avgEngagementRate || '0') || 0;
      const conversion = parseFloat(template.avgConversionRate || '0') || 0;
      const usage = Math.min(template.usageCount / 100, 1) * 100;
      const successScore = Math.round((engagement * 0.4 + conversion * 0.4 + usage * 0.2));
      
      const contentLength = Array.isArray(template.contentPieces) ? template.contentPieces.length : 0;
      const visualLength = Array.isArray(template.visualAssets) ? template.visualAssets.length : 0;
      const complexity = contentLength + visualLength;
      
      let setupTime = '30min';
      if (complexity > 3) setupTime = '1-2h';
      if (complexity > 6) setupTime = '2-4h';
      if (complexity > 10) setupTime = '4h+';
      
      let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
      if (complexity > 3) difficulty = 'medium';
      if (complexity > 8) difficulty = 'hard';

      // Extract channels from content pieces
      const channels = new Set<string>();
      template.contentPieces.forEach((piece: any) => {
        if (piece.channels) {
          piece.channels.forEach((channel: string) => channels.add(channel));
        }
      });

      // Extract content types
      const contentTypes = new Set<string>();
      template.contentPieces.forEach((piece: any) => {
        if (piece.type) contentTypes.add(piece.type);
      });

      // Calculate automation level
      let automatedPieces = 0;
      template.contentPieces.forEach((piece: any) => {
        if (piece.automated) automatedPieces++;
      });
      const automationLevel = contentLength > 0 ? Math.round((automatedPieces / contentLength) * 100) : 0;

      return {
        templateId: template.id,
        performance: {
          engagementRate: engagement,
          conversionRate: conversion,
          usageCount: template.usageCount,
          successScore
        },
        complexity: {
          contentPieces: contentLength,
          visualAssets: visualLength,
          setupTime,
          difficulty
        },
        features: {
          channels: Array.from(channels),
          contentTypes: Array.from(contentTypes),
          automationLevel,
          customizationOptions: Math.floor(Math.random() * 10) + 3 // Mock customization options
        },
        costs: {
          setup: template.isPremium ? 199 : 99,
          maintenance: template.isPremium ? 49 : 29
        }
      };
    });

    res.json({ 
      success: true, 
      data: {
        templates,
        metrics
      }
    });
  } catch (error) {
    console.error('Error getting comparison metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating comparison metrics' 
    });
  }
});

// POST /recommendations  
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { templateIds } = RecommendationsRequest.parse(req.body);
    
    // Filter selected templates
    const selectedTemplates = mockTemplates.filter(t => templateIds.includes(t.id));
    
    if (selectedTemplates.length === 0) {
      return res.status(404).json({ message: 'No templates found' });
    }

    // Calculate average performance of selected templates
    const avgEngagement = selectedTemplates.reduce((sum, t) => 
      sum + parseFloat(t.avgEngagementRate), 0) / selectedTemplates.length;

    // Get categories and service types from selection
    const categories = Array.from(new Set(selectedTemplates.map(t => t.category)));
    const serviceTypes = Array.from(new Set(selectedTemplates.map(t => t.serviceType)));

    // Filter available templates (not selected)
    const availableTemplates = mockTemplates.filter(t => !templateIds.includes(t.id));

    // Generate recommendations
    const recommendations = [];

    // 1. High performance templates
    const highPerformanceTemplates = availableTemplates
      .filter(t => parseFloat(t.avgEngagementRate) > avgEngagement + 5)
      .sort((a, b) => parseFloat(b.avgEngagementRate) - parseFloat(a.avgEngagementRate))
      .slice(0, 2);

    for (const template of highPerformanceTemplates) {
      recommendations.push({
        templateId: template.id,
        category: 'performance',
        score: parseFloat(template.avgEngagementRate),
        reason: `Template com ${template.avgEngagementRate}% de engagement, superior à média da sua seleção (${avgEngagement.toFixed(1)}%)`
      });
    }

    // 2. Similar category templates
    const similarTemplates = availableTemplates
      .filter(t => categories.includes(t.category) || serviceTypes.includes(t.serviceType))
      .sort((a, b) => parseFloat(b.avgEngagementRate) - parseFloat(a.avgEngagementRate))
      .slice(0, 2);

    for (const template of similarTemplates) {
      recommendations.push({
        templateId: template.id,
        category: 'similar',
        score: parseFloat(template.avgEngagementRate),
        reason: `Template similar na categoria ${template.category} com boa performance`
      });
    }

    // 3. Alternative approaches
    const alternativeCategories = ['educacao', 'retencao', 'upsell'].filter(cat => !categories.includes(cat));
    const alternativeTemplates = availableTemplates
      .filter(t => alternativeCategories.includes(t.category))
      .sort((a, b) => parseFloat(b.avgEngagementRate) - parseFloat(a.avgEngagementRate))
      .slice(0, 2);

    for (const template of alternativeTemplates) {
      recommendations.push({
        templateId: template.id,
        category: 'alternative',
        score: parseFloat(template.avgEngagementRate),
        reason: `Abordagem alternativa na categoria ${template.category} que pode complementar sua estratégia`
      });
    }

    // 4. Trending templates
    const trendingTemplates = availableTemplates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 2);

    for (const template of trendingTemplates) {
      recommendations.push({
        templateId: template.id,
        category: 'trending',
        score: template.usageCount,
        reason: `Template em alta com ${template.usageCount} usos recentes`
      });
    }

    res.json({ 
      success: true, 
      data: recommendations.slice(0, 8) // Limit to 8 recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating recommendations' 
    });
  }
});

// POST /export
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { templateIds, format, includeMetrics } = ExportRequest.parse(req.body);
    
    // Filter templates by IDs
    const templates = mockTemplates.filter(t => templateIds.includes(t.id));
    
    if (templates.length === 0) {
      return res.status(404).json({ message: 'No templates found' });
    }

    if (format === 'csv') {
      // Generate CSV content
      const csvHeader = 'Template,Category,Service Type,Engagement Rate,Conversion Rate,Usage Count,Premium\n';
      const csvRows = templates.map(t => 
        `${t.name},${t.category},${t.serviceType},${t.avgEngagementRate}%,${t.avgConversionRate}%,${t.usageCount},${t.isPremium ? 'Yes' : 'No'}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="template-comparison.csv"');
      res.send(csvContent);
    } else {
      // Generate PDF content (mock)
      const content = `
Template Comparison Report
Generated: ${new Date().toISOString()}

Templates Compared: ${templates.length}

${templates.map((template, index) => `
${index + 1}. ${template.name}
   Category: ${template.category}
   Service Type: ${template.serviceType}
   Premium: ${template.isPremium ? 'Yes' : 'No'}
   Engagement Rate: ${template.avgEngagementRate}%
   Conversion Rate: ${template.avgConversionRate}%
   Usage Count: ${template.usageCount}
`).join('\n')}
      `;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="template-comparison.pdf"');
      res.send(Buffer.from(content, 'utf-8'));
    }
  } catch (error) {
    console.error('Error exporting comparison:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error exporting comparison data' 
    });
  }
});

export default router;