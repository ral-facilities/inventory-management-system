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

  // Whether to output build files in a way SciGateway can load (the default unless e2e testing)
  const buildForSciGateway =
    env.NODE_ENV === 'production' &&
    env.VITE_APP_E2E_TESTING !== 'true' &&
    env.VITE_APP_E2E_TESTING_API !== 'true';

  // Whether to include MSW from the build
  const excludeMSW =
    env.NODE_ENV === 'production' || env.VITE_APP_E2E_TESTING_API === 'true';

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

  let rollupExternals: string[] = [];

  // Exclude msw if necessary
  if (excludeMSW) {
    plugins.push(excludeMSWPlugin());
    rollupExternals.push('msw');
  }

  if (buildForSciGateway) {
    // Config for deployment in SciGateway
    let rollupExternals = ['react', 'react-dom'];
    if (excludeMSW) rollupExternals.push('msw');

    config.build = {
      lib: {
        // https://github.com/vitejs/vite/issues/7130
        entry: 'src/main.tsx',
        name: 'inventory-management-system',
      },
      rollupOptions: {
        external: ['react', 'react-dom'].concat(rollupExternals),
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
        // Don't make react/react-dom external as not a library here, so have to bundle
        external: rollupExternals,
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

  return {
    ...config,
    test: {
      globals: 'true',
      environment: 'jsdom',
      globalSetup: './globalSetup.js',
      setupFiles: ['src/setupTestsVitest.tsx'],
    },
  };
});
