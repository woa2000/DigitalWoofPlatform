import crypto from 'crypto';

/**
 * Normalizes a URL for deduplication purposes
 * Removes www, trailing slashes, converts to lowercase, sorts query params
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Convert protocol and hostname to lowercase
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    
    // Remove www prefix
    if (parsed.hostname.startsWith('www.')) {
      parsed.hostname = parsed.hostname.substring(4);
    }
    
    // Remove trailing slash from pathname (unless it's just "/")
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    
    // Sort query parameters for consistent ordering
    if (parsed.search) {
      const params = new URLSearchParams(parsed.search);
      const sortedParams = new URLSearchParams();
      
      // Sort parameters alphabetically
      Array.from(params.keys())
        .sort()
        .forEach(key => {
          const values = params.getAll(key);
          values.sort().forEach(value => {
            sortedParams.append(key, value);
          });
        });
      
      parsed.search = sortedParams.toString();
    }
    
    // Remove fragment (hash) as it's client-side only
    parsed.hash = '';
    
    return parsed.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn('Failed to normalize URL:', url, error);
    return url.toLowerCase();
  }
}

/**
 * Generates a deterministic hash for a normalized URL
 * Used for efficient deduplication in database
 */
export function generateUrlHash(normalizedUrl: string): string {
  return crypto
    .createHash('sha256')
    .update(normalizedUrl)
    .digest('hex');
}

/**
 * Processes a URL: validates, normalizes, and generates hash
 */
export function processUrl(url: string): {
  original: string;
  normalized: string;
  hash: string;
  isValid: boolean;
  error?: string;
} {
  try {
    // Basic URL validation
    const parsed = new URL(url);
    
    // Ensure it's HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        original: url,
        normalized: url,
        hash: '',
        isValid: false,
        error: 'Only HTTP and HTTPS protocols are supported'
      };
    }
    
    const normalized = normalizeUrl(url);
    const hash = generateUrlHash(normalized);
    
    return {
      original: url,
      normalized,
      hash,
      isValid: true
    };
  } catch (error) {
    return {
      original: url,
      normalized: url,
      hash: '',
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid URL format'
    };
  }
}

/**
 * Batch processes multiple URLs
 */
export function processUrls(urls: string[]): {
  processed: Array<ReturnType<typeof processUrl>>;
  valid: Array<ReturnType<typeof processUrl>>;
  invalid: Array<ReturnType<typeof processUrl>>;
  duplicates: Array<{ original: string; duplicateOf: string }>;
} {
  const processed = urls.map(processUrl);
  const valid = processed.filter(p => p.isValid);
  const invalid = processed.filter(p => !p.isValid);
  
  // Detect duplicates by hash
  const seenHashes = new Map<string, string>();
  const duplicates: Array<{ original: string; duplicateOf: string }> = [];
  
  valid.forEach(item => {
    const existingUrl = seenHashes.get(item.hash);
    if (existingUrl) {
      duplicates.push({
        original: item.original,
        duplicateOf: existingUrl
      });
    } else {
      seenHashes.set(item.hash, item.original);
    }
  });
  
  return {
    processed,
    valid,
    invalid,
    duplicates
  };
}

/**
 * Detects the type of URL (site or social media)
 */
export function detectUrlType(url: string): 'site' | 'social' {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Common social media domains
    const socialDomains = [
      'instagram.com',
      'facebook.com',
      'twitter.com',
      'x.com',
      'linkedin.com',
      'youtube.com',
      'tiktok.com',
      'whatsapp.com',
      'telegram.org',
      'snapchat.com',
      'pinterest.com',
      'reddit.com'
    ];
    
    // Check if hostname or its parent domain is a social platform
    const isSocial = socialDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    return isSocial ? 'social' : 'site';
  } catch {
    // If URL parsing fails, default to 'site'
    return 'site';
  }
}

/**
 * Extracts provider name from social media URLs
 */
export function extractSocialProvider(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Map hostnames to provider names
    const providerMap: Record<string, string> = {
      'instagram.com': 'instagram',
      'facebook.com': 'facebook',
      'twitter.com': 'twitter',
      'x.com': 'twitter',
      'linkedin.com': 'linkedin',
      'youtube.com': 'youtube',
      'tiktok.com': 'tiktok',
      'whatsapp.com': 'whatsapp',
      'telegram.org': 'telegram',
      'snapchat.com': 'snapchat',
      'pinterest.com': 'pinterest',
      'reddit.com': 'reddit'
    };
    
    // Direct match
    if (providerMap[hostname]) {
      return providerMap[hostname];
    }
    
    // Check for subdomain matches
    for (const [domain, provider] of Object.entries(providerMap)) {
      if (hostname.endsWith(`.${domain}`)) {
        return provider;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Export types
export type ProcessedUrl = ReturnType<typeof processUrl>;
export type ProcessedUrls = ReturnType<typeof processUrls>;
export type UrlType = ReturnType<typeof detectUrlType>;