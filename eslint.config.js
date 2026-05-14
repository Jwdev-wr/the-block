import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.playwright-browsers', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // shadcn-style UI primitives commonly co-export class variants alongside
  // their component. The context module co-exports its hook. These are
  // intentional and don't break Vite Fast Refresh in practice for these
  // small, mostly-pure files.
  {
    files: [
      'src/components/ui/**/*.{ts,tsx}',
      'src/features/bidding/BidContext.tsx',
      'src/test/test-utils.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Test files: relax a few rules that are noisy and not worth fighting.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
