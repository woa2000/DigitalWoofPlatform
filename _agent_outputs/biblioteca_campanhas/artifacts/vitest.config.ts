// Vitest Configuration
// Arquivo: vitest.config.ts

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Environment
    environment: 'node',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.test.{ts,js}',
        '**/*.spec.{ts,js}',
        'tests/',
        'coverage/',
      ],
      thresholds: {
        global: {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85
        }
      }
    },
    
    // Test files patterns
    include: [
      'tests/unit/**/*.{test,spec}.{js,ts}',
      'server/**/*.{test,spec}.{js,ts}'
    ],
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Global configuration
    globals: true,
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporters for CI
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: {
      junit: './coverage/junit.xml'
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './server'),
      '@tests': path.resolve(__dirname, './tests'),
      '@fixtures': path.resolve(__dirname, './tests/fixtures')
    }
  }
});