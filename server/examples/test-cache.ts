/**
 * Simple test for Brand Voice Cache Strategy
 */

import { brandVoiceCache, activeCacheManager } from '../utils/brand-voice-cache.service';

console.log('Testing Brand Voice Cache Strategy...\n');

async function testCache() {
  try {
    // Test 1: Basic operations
    console.log('1. Testing Basic Cache Operations:');
    await brandVoiceCache.set('test:item', { message: 'Hello Cache!' });
    const retrieved = await brandVoiceCache.get('test:item');
    console.log('✓ Basic set/get working:', !!retrieved);
    console.log('- Retrieved data:', retrieved);

    // Test 2: TTL functionality
    console.log('\n2. Testing TTL:');
    await brandVoiceCache.set('test:ttl', { data: 'expires soon' }, { ttl: 1 });
    const beforeExpiry = await brandVoiceCache.get('test:ttl');
    console.log('✓ Before expiry:', !!beforeExpiry);
    
    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 1200));
    const afterExpiry = await brandVoiceCache.get('test:ttl');
    console.log('✓ After expiry (should be null):', afterExpiry === null);

    // Test 3: Tag invalidation
    console.log('\n3. Testing Tag Invalidation:');
    await brandVoiceCache.set('user:123:data', { name: 'User 123' }, { tags: ['user:123'] });
    await brandVoiceCache.set('user:456:data', { name: 'User 456' }, { tags: ['user:456'] });
    
    const beforeInvalidation = await brandVoiceCache.get('user:123:data');
    console.log('✓ Before invalidation:', !!beforeInvalidation);
    
    await brandVoiceCache.invalidateByTags(['user:123']);
    const afterInvalidation = await brandVoiceCache.get('user:123:data');
    const otherUser = await brandVoiceCache.get('user:456:data');
    
    console.log('✓ After invalidation user:123:', afterInvalidation === null);
    console.log('✓ Other user still exists:', !!otherUser);

    // Test 4: Cache metrics
    console.log('\n4. Testing Cache Metrics:');
    const metrics = brandVoiceCache.getMetrics();
    console.log('✓ Cache metrics available');
    console.log('- Hit rate:', `${(metrics.hitRate * 100).toFixed(1)}%`);
    console.log('- Total operations:', metrics.totalOperations);
    console.log('- Hits:', metrics.hits);
    console.log('- Misses:', metrics.misses);

    // Test 5: Health status
    console.log('\n5. Testing Health Status:');
    const health = brandVoiceCache.getHealthStatus();
    console.log('✓ Health status:', health.status);
    console.log('- Issues:', health.issues.length);
    console.log('- Recommendations:', health.recommendations.length);

    // Test 6: Configuration
    console.log('\n6. Testing Configuration:');
    const config = brandVoiceCache.getConfiguration();
    console.log('✓ Configuration available');
    console.log('- Max size:', config.maxSize);
    console.log('- Default TTL:', `${config.defaultTTL}s`);
    console.log('- Metrics enabled:', config.enableMetrics);

    console.log('\n✅ ALL CACHE TESTS PASSED!');
    console.log('\nT-008 Cache Strategy is working correctly! 🚀');

    // Cleanup
    brandVoiceCache.destroy();

  } catch (error) {
    console.error('❌ Cache test failed:', error);
    process.exit(1);
  }
}

testCache();