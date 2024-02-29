import { PluginOption, defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';

/* See https://github.com/mswjs/msw/discussions/712 */
function excludeMsw(): PluginOption {
  return {
    name: 'exclude-msw',
    apply: 'build',
    renderStart(outputOptions, _inputOptions) {
      const outDir = outputOptions.dir;
      const msWorker = path.resolve(outDir || '', 'mockServiceWorker.js');
      fs.rm(msWorker, () => console.log(`Deleted ${msWorker}`));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), excludeMsw()],
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
        external: ['react', 'react-dom', 'msw'],
        input: 'src/main.tsx',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].chunk.js',
          // assetFileNames: '[name].[ext]',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        preserveEntrySignatures: 'strict',
      },
    },
  };
});
