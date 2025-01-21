import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  test: {
    environment: 'node',
    setupFiles: ['./test/server.ts'],
    open: true,
    watch: false,
    coverage: {
      provider: 'istanbul',
      reporter: [['json', { file: 'out.json' }]],
      reportsDirectory: './.nyc_output',
      enabled: true,
      clean: true,
      all: true,
      extension: ['.ts', '.tsx'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/types/**',
      ],
    },
    globals: true,
    include: ['test/**/*.test.ts'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: '/src/index.ts',
    },
  },
});
