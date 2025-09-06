/**
 * Browser Compatibility Tests
 * 
 * Testa compatibilidade entre navegadores usando Playwright
 */

// @ts-ignore - Playwright será instalado como dependência de teste
import { test, expect, devices } from '@playwright/test';

const BROWSERS = [
  { name: 'Chrome', ...devices['Desktop Chrome'] },
  { name: 'Firefox', ...devices['Desktop Firefox'] },
  { name: 'Safari', ...devices['Desktop Safari'] },
  { name: 'Mobile Chrome', ...devices['Pixel 5'] },
  { name: 'Mobile Safari', ...devices['iPhone 12'] }
];

BROWSERS.forEach(browser => {
  test.describe(`${browser.name} Compatibility Tests`, () => {
    test.use(browser);

    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000');
    });

    test('should load homepage correctly', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should navigate to template library', async ({ page }) => {
      await page.click('text=Biblioteca de Campanhas');
      await expect(page.url()).toContain('/templates');
      await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    });

    test('should search templates', async ({ page }) => {
      await page.goto('http://localhost:3000/templates');
      await page.fill('[data-testid="search-input"]', 'cão');
      await page.press('[data-testid="search-input"]', 'Enter');
      
      await expect(page.locator('[data-testid="template-card"]')).toHaveCountGreaterThan(0);
    });

    test('should filter templates', async ({ page }) => {
      await page.goto('http://localhost:3000/templates');
      await page.selectOption('[data-testid="category-filter"]', 'promotional');
      
      await expect(page.locator('[data-testid="template-card"]')).toHaveCountGreaterThan(0);
    });

    test('should open template details', async ({ page }) => {
      await page.goto('http://localhost:3000/templates');
      await page.click('[data-testid="template-card"]');
      
      await expect(page.locator('[data-testid="template-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-title"]')).toBeVisible();
    });

    test('should handle responsive design', async ({ page, isMobile }) => {
      await page.goto('http://localhost:3000/templates');
      
      if (isMobile) {
        // Mobile-specific tests
        await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
        await page.click('[data-testid="mobile-menu-toggle"]');
        await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
      } else {
        // Desktop-specific tests
        await expect(page.locator('[data-testid="desktop-navigation"]')).toBeVisible();
        await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      }
    });

    test('should load performance dashboard', async ({ page }) => {
      await page.goto('http://localhost:3000/performance');
      
      await expect(page.locator('[data-testid="performance-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-cards"]')).toBeVisible();
      await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
    });

    test('should handle form interactions', async ({ page }) => {
      await page.goto('http://localhost:3000/templates/template-1');
      await page.click('[data-testid="personalize-button"]');
      
      // Fill personalization form
      await page.selectOption('[data-testid="tone-select"]', 'friendly');
      await page.selectOption('[data-testid="audience-select"]', 'pet_owners_young');
      await page.fill('[data-testid="custom-text"]', 'Teste personalização');
      
      await page.click('[data-testid="generate-preview"]');
      
      await expect(page.locator('[data-testid="preview-content"]')).toBeVisible();
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      await page.goto('http://localhost:3000/templates');
      await page.click('[data-testid="template-card"]');
      await page.goBack();
      
      // Should not have any JavaScript errors
      expect(jsErrors).toHaveLength(0);
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => {
        route.abort();
      });
      
      await page.goto('http://localhost:3000/templates');
      
      // Should show error state
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should maintain scroll position', async ({ page }) => {
      await page.goto('http://localhost:3000/templates');
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 1000));
      const scrollPosition = await page.evaluate(() => window.scrollY);
      
      // Navigate to detail and back
      await page.click('[data-testid="template-card"]');
      await page.goBack();
      
      // Should restore scroll position (approximately)
      const newScrollPosition = await page.evaluate(() => window.scrollY);
      expect(Math.abs(newScrollPosition - scrollPosition)).toBeLessThan(100);
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/templates');
      
      // Tab through focusable elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should navigate to first template
      await expect(page.locator('[data-testid="template-details"]')).toBeVisible();
    });

    test('should load images efficiently', async ({ page }) => {
      const imageLoadTimes: number[] = [];
      
      page.on('response', response => {
        if (response.url().includes('.jpg') || response.url().includes('.png')) {
          const timing = response.timing();
          if (timing.responseEnd) {
            imageLoadTimes.push(timing.responseEnd);
          }
        }
      });
      
      await page.goto('http://localhost:3000/templates');
      
      // Wait for images to load
      await page.waitForLoadState('networkidle');
      
      // Images should load within reasonable time
      const avgLoadTime = imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length;
      expect(avgLoadTime).toBeLessThan(2000); // 2 seconds average
    });

    test('should handle concurrent operations', async ({ page }) => {
      await page.goto('http://localhost:3000/templates');
      
      // Perform multiple operations simultaneously
      const promises = [
        page.fill('[data-testid="search-input"]', 'test'),
        page.selectOption('[data-testid="category-filter"]', 'promotional'),
        page.click('[data-testid="sort-button"]')
      ];
      
      await Promise.all(promises);
      
      // Should handle all operations without conflicts
      await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    });

    test('should persist user preferences', async ({ page, context }) => {
      await page.goto('http://localhost:3000/templates');
      
      // Set some preferences
      await page.selectOption('[data-testid="view-mode"]', 'list');
      await page.selectOption('[data-testid="items-per-page"]', '20');
      
      // Reload page
      await page.reload();
      
      // Preferences should be maintained
      await expect(page.locator('[data-testid="view-mode"]')).toHaveValue('list');
      await expect(page.locator('[data-testid="items-per-page"]')).toHaveValue('20');
    });

    test('should handle offline mode', async ({ page, context }) => {
      await page.goto('http://localhost:3000/templates');
      
      // Go offline
      await context.setOffline(true);
      
      // Try to navigate
      await page.click('[data-testid="template-card"]');
      
      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Go back online
      await context.setOffline(false);
      
      // Should work normally
      await page.reload();
      await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    });
  });
});

// Performance baseline tests
test.describe('Performance Baseline Tests', () => {
  test('should meet performance budgets', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });
});