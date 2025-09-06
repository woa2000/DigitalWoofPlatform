import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    include: [
      'tests/unit/**/*.basic.test.ts'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'tests/fixtures/**',
      'tests/helpers/**'
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