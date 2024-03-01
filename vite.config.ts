import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import { PluginOption, UserConfig, defineConfig, loadEnv } from 'vite';

/* See https://github.com/mswjs/msw/discussions/712 */
function excludeMSWPlugin(): PluginOption {
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

  const excludeMSW =
    env.NODE_ENV === 'production' && env.VITE_APP_E2E_TESTING !== 'true';

  let plugins: PluginOption[] = [react()];

  let config: UserConfig = {
    plugins: plugins,
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
  };

  if (excludeMSW) {
    // Config for deployment in SciGateway without MSW
    plugins.push(excludeMSWPlugin());
    config.build = {
      lib: {
        // https://github.com/vitejs/vite/issues/7130
        entry: 'src/main.tsx',
        // formats: ['umd'],
        name: 'inventory-management-system',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'msw'],
        input: 'src/main.tsx',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].chunk.js',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        preserveEntrySignatures: 'strict',
      },
    };
  } else {
    // Config for stand alone deployment e.g. for cypress
    config.build = {
      rollupOptions: {
        input: ['src/main.tsx', './index.html'],
        // Don't make these external as not a library here, so have to bundle
        // external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        preserveEntrySignatures: 'strict',
      },
    };
  }

  return config;
});
