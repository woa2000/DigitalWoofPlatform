/**
 * Deduplication Service
 * Manages URL deduplication with metrics and advanced matching
 */

import { generateUrlHash, normalizeUrl, processUrl } from '../utils/url-normalization.js';

export interface DeduplicationResult {
  isDuplicate: boolean;
  originalAnalysisId?: string;
  hash: string;
  normalizedUrl: string;
  confidence: 'exact' | 'high' | 'medium' | 'low';
  matchType: 'hash' | 'normalized' | 'fuzzy' | 'none';
  suggestions?: string[];
}

export interface DeduplicationMetrics {
  totalChecks: number;
  exactMatches: number;
  fuzzyMatches: number;
  newUrls: number;
  hitRate: number;
  avgProcessingTime: number;
}

/**
 * Advanced deduplication service with fuzzy matching and analytics
 */
export class DeduplicationService {
  private metrics: DeduplicationMetrics = {
    totalChecks: 0,
    exactMatches: 0,
    fuzzyMatches: 0,
    newUrls: 0,
    hitRate: 0,
    avgProcessingTime: 0
  };

  private processingTimes: number[] = [];

  /**
   * Checks if a URL is a duplicate of any existing analysis
   */
  async checkDuplication(
    url: string, 
    userId: string, 
    existingAnalyses: Array<{ id: string; primaryUrl: string; hash?: string }>
  ): Promise<DeduplicationResult> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalChecks++;

      const processed = processUrl(url);
      
      if (!processed.isValid) {
        return {
          isDuplicate: false,
          hash: processed.hash,
          normalizedUrl: processed.normalized,
          confidence: 'low',
          matchType: 'none'
        };
      }

      // 1. Exact hash match (fastest)
      const exactMatch = existingAnalyses.find(analysis => 
        analysis.hash === processed.hash
      );

      if (exactMatch) {
        this.metrics.exactMatches++;
        return {
          isDuplicate: true,
          originalAnalysisId: exactMatch.id,
          hash: processed.hash,
          normalizedUrl: processed.normalized,
          confidence: 'exact',
          matchType: 'hash'
        };
      }

      // 2. Normalized URL comparison (for analyses without pre-computed hash)
      const normalizedMatches = existingAnalyses.filter(analysis => {
        if (analysis.hash) return false; // Already checked above
        
        const analysisProcessed = processUrl(analysis.primaryUrl);
        return analysisProcessed.isValid && 
               analysisProcessed.normalized === processed.normalized;
      });

      if (normalizedMatches.length > 0) {
        this.metrics.exactMatches++;
        return {
          isDuplicate: true,
          originalAnalysisId: normalizedMatches[0].id,
          hash: processed.hash,
          normalizedUrl: processed.normalized,
          confidence: 'high',
          matchType: 'normalized'
        };
      }

      // 3. Fuzzy matching for similar domains
      const fuzzyMatches = this.findFuzzyMatches(processed.normalized, existingAnalyses);
      
      if (fuzzyMatches.length > 0) {
        this.metrics.fuzzyMatches++;
        
        // Don't automatically mark as duplicate for fuzzy matches
        // Instead, provide suggestions
        return {
          isDuplicate: false,
          hash: processed.hash,
          normalizedUrl: processed.normalized,
          confidence: 'medium',
          matchType: 'fuzzy',
          suggestions: fuzzyMatches.map(match => match.primaryUrl)
        };
      }

      // 4. No matches found
      this.metrics.newUrls++;
      return {
        isDuplicate: false,
        hash: processed.hash,
        normalizedUrl: processed.normalized,
        confidence: 'high',
        matchType: 'none'
      };

    } finally {
      const processingTime = Date.now() - startTime;
      this.processingTimes.push(processingTime);
      
      // Keep only last 1000 measurements for rolling average
      if (this.processingTimes.length > 1000) {
        this.processingTimes = this.processingTimes.slice(-1000);
      }
      
      this.updateMetrics();
    }
  }

  /**
   * Batch deduplication check for multiple URLs
   */
  async batchCheckDuplication(
    urls: string[],
    userId: string,
    existingAnalyses: Array<{ id: string; primaryUrl: string; hash?: string }>
  ): Promise<Map<string, DeduplicationResult>> {
    const results = new Map<string, DeduplicationResult>();
    
    for (const url of urls) {
      const result = await this.checkDuplication(url, userId, existingAnalyses);
      results.set(url, result);
    }
    
    return results;
  }

  /**
   * Finds potential fuzzy matches based on domain similarity
   */
  private findFuzzyMatches(
    normalizedUrl: string, 
    existingAnalyses: Array<{ id: string; primaryUrl: string; hash?: string }>
  ): Array<{ id: string; primaryUrl: string; similarity: number }> {
    try {
      const targetUrl = new URL(normalizedUrl);
      const targetDomain = targetUrl.hostname;
      
      const fuzzyMatches: Array<{ id: string; primaryUrl: string; similarity: number }> = [];
      
      for (const analysis of existingAnalyses) {
        try {
          const analysisUrl = new URL(analysis.primaryUrl);
          const analysisDomain = analysisUrl.hostname;
          
          const similarity = this.calculateDomainSimilarity(targetDomain, analysisDomain);
          
          // Consider it a fuzzy match if similarity is above threshold
          if (similarity > 0.8) {
            fuzzyMatches.push({
              id: analysis.id,
              primaryUrl: analysis.primaryUrl,
              similarity
            });
          }
        } catch {
          // Skip invalid URLs
          continue;
        }
      }
      
      // Sort by similarity (highest first)
      return fuzzyMatches.sort((a, b) => b.similarity - a.similarity);
      
    } catch {
      return [];
    }
  }

  /**
   * Calculates similarity between two domains using Levenshtein distance
   */
  private calculateDomainSimilarity(domain1: string, domain2: string): number {
    if (domain1 === domain2) return 1.0;
    
    // Remove common prefixes
    const clean1 = domain1.replace(/^(www\.)?/, '');
    const clean2 = domain2.replace(/^(www\.)?/, '');
    
    if (clean1 === clean2) return 0.95;
    
    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(clean1, clean2);
    const maxLength = Math.max(clean1.length, clean2.length);
    
    // Convert distance to similarity percentage
    return Math.max(0, 1 - (distance / maxLength));
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Updates internal metrics
   */
  private updateMetrics(): void {
    if (this.metrics.totalChecks > 0) {
      this.metrics.hitRate = (this.metrics.exactMatches + this.metrics.fuzzyMatches) / this.metrics.totalChecks;
    }
    
    if (this.processingTimes.length > 0) {
      this.metrics.avgProcessingTime = this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
    }
  }

  /**
   * Gets current deduplication metrics
   */
  getMetrics(): DeduplicationMetrics {
    return { ...this.metrics };
  }

  /**
   * Resets metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      totalChecks: 0,
      exactMatches: 0,
      fuzzyMatches: 0,
      newUrls: 0,
      hitRate: 0,
      avgProcessingTime: 0
    };
    this.processingTimes = [];
  }

  /**
   * Validates URL hash integrity
   */
  validateHashIntegrity(url: string, hash: string): boolean {
    const processed = processUrl(url);
    return processed.isValid && processed.hash === hash;
  }

  /**
   * Generates deduplication report for analytics
   */
  generateReport(): {
    metrics: DeduplicationMetrics;
    efficiency: {
      hitRatePercentage: string;
      avgProcessingTimeMs: string;
      totalChecksProcessed: number;
    };
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    if (this.metrics.hitRate < 0.3) {
      recommendations.push('Low hit rate detected. Consider implementing pre-analysis URL validation.');
    }
    
    if (this.metrics.avgProcessingTime > 100) {
      recommendations.push('High processing time detected. Consider caching normalized URLs.');
    }
    
    if (this.metrics.fuzzyMatches > this.metrics.exactMatches * 0.5) {
      recommendations.push('High fuzzy match rate. Consider improving normalization rules.');
    }
    
    return {
      metrics: this.getMetrics(),
      efficiency: {
        hitRatePercentage: `${(this.metrics.hitRate * 100).toFixed(1)}%`,
        avgProcessingTimeMs: `${this.metrics.avgProcessingTime.toFixed(2)}ms`,
        totalChecksProcessed: this.metrics.totalChecks
      },
      recommendations
    };
  }
}