import eslint from '@eslint/js';
import queryPlugin from '@tanstack/eslint-plugin-query';
import prettierPlugin from 'eslint-config-prettier';
import cypressPlugin from 'eslint-plugin-cypress';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import noOnlyTestsPlugin from 'eslint-plugin-no-only-tests';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactTestingLibraryPlugin from 'eslint-plugin-testing-library';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  cypressPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs.flat.recommended,
  queryPlugin.configs['flat/recommended'],
  jsxA11yPlugin.flatConfigs.recommended,
  // See https://github.com/prettier/eslint-config-prettier put last
  prettierPlugin,
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2015,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'no-only-tests': noOnlyTestsPlugin,
    },
    rules: {
      // Emulate typescript style for unused variables, see
      // https://typescript-eslint.io/rules/no-unused-vars/
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-only-tests/no-only-tests': 'error',
      // Current version of react hook form gives "warning  Compilation Skipped: Use of incompatible library"
      'react-hooks/incompatible-library': 'off',
      // Current usage of uppy violates this rule
      'react-hooks/refs': 'off',
    },
  },
  {
    files: ['**/?*test.{js,ts,jsx,tsx}'],
    plugins: reactTestingLibraryPlugin.configs['flat/react'].plugins,
    rules: reactTestingLibraryPlugin.configs['flat/react'].rules,
  }
);
