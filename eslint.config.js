import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'never' },
      ],
    },
  },
  {
    // shadcn 보일러플레이트 — CLI가 관리하므로 그쪽 스타일 허용
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
