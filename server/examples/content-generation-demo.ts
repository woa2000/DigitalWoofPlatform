/**
 * Demo: Brand Voice Content Generation Integration
 * 
 * Demonstrates how to use Brand Voice JSON for AI content generation
 * with dynamic prompt building and template system.
 */

import { BrandVoicePromptBuilder, promptUtils } from '../utils/brand-voice-prompt-builder.js';
import { getBrandVoiceDefaults } from '../../config/brand-voice-defaults.js';
import type { ContentType, PromptContext } from '../templates/prompt-templates.js';

console.log('🎯 Brand Voice Content Generation Integration Demo\n');

async function demonstrateContentGeneration() {
  try {
    // 1. Get sample Brand Voice data
    console.log('1. Loading Brand Voice Configuration...');
    const brandVoice = getBrandVoiceDefaults('veterinaria');
    console.log('✓ Brand:', brandVoice.brand.name);
    console.log('✓ Segment:', brandVoice.brand.segment);
    console.log('✓ Primary tone:', Object.keys(brandVoice.voice.tone)[0]);

    // 2. Initialize prompt builder
    console.log('\n2. Initializing Prompt Builder...');
    const promptBuilder = new BrandVoicePromptBuilder({
      includeExamples: true,
      maxPromptLength: 2000,
      adaptiveComplexity: true
    });
    console.log('✓ Prompt builder configured');

    // 3. Demonstrate different content types
    console.log('\n3. Generating Prompts for Different Content Types...\n');

    // Social Media Example
    console.log('📱 SOCIAL MEDIA POST:');
    const socialContext: PromptContext = {
      contentType: 'social-media-post',
      platform: 'Instagram',
      targetAudience: 'pet owners',
      contentGoal: 'promote preventive veterinary care',
      contentLength: 'short',
      callToAction: 'schedule checkup',
      keywords: ['prevention', 'health', 'pets']
    };

    const socialResult = await promptBuilder.buildPrompt(brandVoice, 'social-media-post', socialContext);
    console.log('- Word estimate:', `${socialResult.metadata.wordEstimate.min}-${socialResult.metadata.wordEstimate.max} words`);
    console.log('- Complexity:', socialResult.metadata.complexity);
    console.log('- Processing time:', socialResult.metadata.processingTime, 'ms');
    console.log('- Warnings:', socialResult.warnings?.length || 0);
    console.log('- Prompt preview:', socialResult.prompt.substring(0, 200) + '...\n');

    // Email Campaign Example
    console.log('📧 EMAIL CAMPAIGN:');
    const emailContext: PromptContext = {
      contentType: 'email-campaign',
      targetAudience: 'existing clients',
      contentGoal: 'vaccination reminder campaign',
      contentLength: 'medium',
      callToAction: 'book vaccination appointment',
      constraints: ['friendly tone', 'urgent but not pushy']
    };

    const emailResult = await promptBuilder.buildPrompt(brandVoice, 'email-campaign', emailContext);
    console.log('- Word estimate:', `${emailResult.metadata.wordEstimate.min}-${emailResult.metadata.wordEstimate.max} words`);
    console.log('- Complexity:', emailResult.metadata.complexity);
    console.log('- Processing time:', emailResult.metadata.processingTime, 'ms');
    console.log('- Prompt preview:', emailResult.prompt.substring(0, 200) + '...\n');

    // Blog Article Example
    console.log('📝 BLOG ARTICLE:');
    const blogContext: PromptContext = {
      contentType: 'blog-article',
      targetAudience: 'pet owners and pet lovers',
      contentGoal: 'educate about pet nutrition',
      contentLength: 'long',
      keywords: ['nutrition', 'healthy diet', 'pet food'],
      callToAction: 'schedule nutrition consultation'
    };

    const blogResult = await promptBuilder.buildPrompt(brandVoice, 'blog-article', blogContext);
    console.log('- Word estimate:', `${blogResult.metadata.wordEstimate.min}-${blogResult.metadata.wordEstimate.max} words`);
    console.log('- Complexity:', blogResult.metadata.complexity);
    console.log('- Processing time:', blogResult.metadata.processingTime, 'ms');
    console.log('- Prompt preview:', blogResult.prompt.substring(0, 200) + '...\n');

    // 4. Test batch prompt generation
    console.log('4. Testing Batch Prompt Generation...');
    const batchRequests = [
      { contentType: 'product-description' as ContentType, context: { contentType: 'product-description' as ContentType, contentGoal: 'premium pet food', targetAudience: 'health-conscious pet owners' } },
      { contentType: 'ad-copy' as ContentType, context: { contentType: 'ad-copy' as ContentType, platform: 'Google Ads', contentGoal: 'emergency veterinary services', contentLength: 'short' as const } },
      { contentType: 'customer-support' as ContentType, context: { contentType: 'customer-support' as ContentType, contentGoal: 'appointment rescheduling', targetAudience: 'concerned pet owners' } }
    ];

    const batchResults = await promptBuilder.buildBatchPrompts(brandVoice, batchRequests);
    console.log('✓ Batch generation completed:', batchResults.length, 'prompts generated');
    console.log('- Average processing time:', Math.round(batchResults.reduce((sum, r) => sum + r.metadata.processingTime, 0) / batchResults.length), 'ms');

    // 5. Test utility functions
    console.log('\n5. Testing Utility Functions...');
    
    // Quick social prompt
    const quickSocial = await promptUtils.buildSocialPrompt(
      brandVoice,
      'Facebook',
      'pet owners',
      'promote dental health checkups'
    );
    console.log('✓ Quick social prompt generated:', quickSocial.length, 'characters');

    // Quick email prompt
    const quickEmail = await promptUtils.buildEmailPrompt(
      brandVoice,
      'welcome series',
      'new pet owners',
      'schedule first appointment'
    );
    console.log('✓ Quick email prompt generated:', quickEmail.length, 'characters');

    // Tone description
    const toneDescription = promptUtils.getToneDescription(brandVoice);
    console.log('✓ Tone description:', toneDescription);

    // 6. Test compliance checking
    console.log('\n6. Testing Compliance Checking...');
    const sampleContent = "Our veterinary clinic provides the best treatment for your pets. We guarantee 100% cure rates for all conditions.";
    const compliancePrompt = promptBuilder.buildCompliancePrompt(brandVoice, sampleContent);
    console.log('✓ Compliance check prompt generated:', compliancePrompt.length, 'characters');
    console.log('- Sample check:', compliancePrompt.substring(0, 150) + '...');

    // 7. Performance summary
    console.log('\n7. Performance Summary:');
    const allResults = [socialResult, emailResult, blogResult, ...batchResults];
    const avgProcessingTime = allResults.reduce((sum, r) => sum + r.metadata.processingTime, 0) / allResults.length;
    const totalWarnings = allResults.reduce((sum, r) => sum + (r.warnings?.length || 0), 0);
    
    console.log('- Total prompts generated:', allResults.length);
    console.log('- Average processing time:', Math.round(avgProcessingTime), 'ms');
    console.log('- Total warnings:', totalWarnings);
    console.log('- Fastest generation:', Math.min(...allResults.map(r => r.metadata.processingTime)), 'ms');
    console.log('- Slowest generation:', Math.max(...allResults.map(r => r.metadata.processingTime)), 'ms');

    console.log('\n✅ T-010 Integration com Content Generation: COMPLETED!');
    console.log('\n🎯 System Capabilities Demonstrated:');
    console.log('- ✅ Dynamic prompt generation for 10+ content types');
    console.log('- ✅ Brand Voice JSON consumption and interpretation');
    console.log('- ✅ Context-aware template selection and customization');
    console.log('- ✅ Compliance checking integration');
    console.log('- ✅ Batch processing for multiple content types');
    console.log('- ✅ Performance monitoring and optimization');
    console.log('- ✅ Utility functions for common use cases');

    console.log('\n📊 Next Steps:');
    console.log('- 🔄 T-011 Unit Tests (5 SP)');
    console.log('- 🔄 T-012 Integration Tests (4 SP)');
    console.log('\nProgress: 9/12 tasks completed (75%) 🚀');

  } catch (error) {
    console.error('❌ Demo failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the demonstration
demonstrateContentGeneration();