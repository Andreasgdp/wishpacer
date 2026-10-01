import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import { plugin as shadcn } from '@shadcn/lint';
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-ssr/**',
      'build/**',
      'data/**',
      'node_modules/**',
      'api/plan.js',
      '.jj/**',
      'coverage/**',
      '.vercel/**',
      'scripts/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      shadcn,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      shadcn: {
        ignoreImports: ['^lucide-react(/|$)'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      'shadcn/no-restyle': [
        'error',
        {
          allow: ['layout'],
          contracts: [
            {
              pattern: '^(Input|Textarea)$',
              allow: ['layout', 'pl-*', 'pr-*', 'p-*', 'px-*'],
            },
            {
              pattern: '(Content|Header|Footer|Group|Panel)$',
              allow: ['layout', 'spacing'],
            },
            {
              pattern: '^DrawerHeader$',
              allow: ['layout', 'spacing'],
            },
            {
              pattern: '^PopoverContent$',
              allow: ['layout', 'spacing'],
            },
            {
              pattern: '^AlertDialogFooter$',
              allow: ['layout', 'spacing'],
            },
            {
              pattern: '^Label$',
              allow: ['layout', 'typography', 'color'],
            },
            {
              pattern: '^Button$',
              allow: ['layout', 'gap-*'],
            },
          ],
        },
      ],
      'shadcn/require-static-classes': 'error',
      'shadcn/no-arbitrary-values': [
        'error',
        {
          allow: [
            'layout',
            'color',
            'text-[9px]',
            'text-[10px]',
            'text-[11px]',
            'shadow-*',
            'active:scale-*',
            'hover:scale-*',
            'leading-*',
          ],
        },
      ],
      'shadcn/no-inline-styles': [
        'error',
        {
          allow: ['transform', 'transition', 'opacity', 'zIndex', 'width'],
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'shadcn/no-restyle': 'off',
      'shadcn/require-static-classes': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/no-inline-styles': 'off',
    },
  }
);
