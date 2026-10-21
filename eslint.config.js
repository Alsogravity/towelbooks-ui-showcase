import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import ts from '@typescript-eslint/eslint-plugin';
import hooks from 'eslint-plugin-react-hooks';
import noSecrets from 'eslint-plugin-no-secrets';
export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    files: ['**/*.{js,mjs}'],
    ...js.configs.recommended,
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', URL: 'readonly' },
    },
  },
  {
    files: ['scripts/capture-screenshots.mjs', 'scripts/verify-live.mjs'],
    languageOptions: {
      globals: { document: 'readonly', innerWidth: 'readonly' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      'react-hooks': hooks,
      'no-secrets': noSecrets,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'no-secrets/no-secrets': [
        'error',
        {
          additionalDelimiters: ['\\.', ':', '=', '\\?', '&'],
          ignoreCase: true,
          ignoreContent: ['^[a-z][a-z0-9+.-]*://', 'completed_with_warnings'],
        },
      ],
      'no-debugger': 'error',
    },
  },
  {
    files: ['apps/showcase/**/*.{ts,tsx}'],
    rules: { ...hooks.configs.recommended.rules },
  },
];
