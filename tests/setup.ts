/**
 * Test Setup File
 * 
 * Configuração global para todos os testes
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase } from './helpers/database';

// Global test setup
beforeAll(async () => {
  console.log('🔧 Setting up test environment...');
  
  // Initialize test database
  try {
    await setupTestDatabase();
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
  
  console.log('🚀 Test environment ready');
});

// Global test cleanup
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    await cleanupTestDatabase();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  }
  
  console.log('✨ Test environment cleaned up');
});

// Test isolation setup
beforeEach(async () => {
  // Clear any test-specific state before each test
  // This ensures test isolation
});

afterEach(async () => {
  // Clean up after each test
  // Reset any global state that might affect other tests
});

// Global error handlers for better test debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Mock global objects that might not be available in test environment
global.fetch = global.fetch || (() => Promise.resolve({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  ok: true,
  status: 200
}));

// Mock localStorage for browser environment tests
global.localStorage = global.localStorage || {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Mock sessionStorage
global.sessionStorage = global.sessionStorage || {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Console helpers for test debugging
export const testLogger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.TEST_VERBOSE === 'true') {
      console.log(`ℹ️ [TEST] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [TEST] ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    if (process.env.TEST_VERBOSE === 'true') {
      console.log(`✅ [TEST] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ [TEST] ${message}`, ...args);
  }
};

// Test utilities
export const testUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  waitFor: async (condition: () => boolean, timeout: number = 5000) => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await testUtils.delay(50);
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },
  
  generateId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  createMockResponse: (data: any, status: number = 200) => ({
    data,
    status,
    headers: {},
    ok: status >= 200 && status < 300
  })
};

console.log('📋 Test setup file loaded');
