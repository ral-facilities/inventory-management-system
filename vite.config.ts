import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      open: true,
      port: 3000,
    },
    preview: {
      port: 5001,
    },
    define: {
      // See https://vitejs.dev/guide/build.html#library-mode
      // we need to replace here as the build in library mode won't
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
    build: {
      lib: {
        // https://github.com/vitejs/vite/issues/7130
        entry: 'src/main.tsx',
        formats: ['umd'],
        name: 'inventory-management-system',
      },
      rollupOptions: {
        input: 'src/main.tsx',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].chunk.js',
          // assetFileNames: '[name].[ext]',
          format: 'es',
        },
        preserveEntrySignatures: 'strict',
      },
    },
  };
});
