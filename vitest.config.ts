import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 85,
        branches: 80,
        functions: 85,
        statements: 85
      },
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        'tests/fixtures/**',
        'migrations/**',
        'coverage/**'
      ]
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'tests/fixtures/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@server': path.resolve(__dirname, './server'),
      '@shared': path.resolve(__dirname, './shared'),
      '@client': path.resolve(__dirname, './client'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});