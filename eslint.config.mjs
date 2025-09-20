// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import unused from 'eslint-plugin-unused-imports'
import nextPlugin from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'

// Extrae solo las reglas (evita incluir configs legacy completas)
const nextRules = nextPlugin.configs['core-web-vitals']?.rules ?? {}
const reactHooksRules = reactHooks.configs.recommended?.rules ?? {}

export default [
  // Ignorar artefactos de build (sustituye .eslintignore)
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts'] },

  // Base JS
  js.configs.recommended,

  // Base TS (flat config, sin type-check por ahora)
  ...tseslint.configs.recommended,

  // Prettier al final para neutralizar formateo
  prettier,

  // Bloque del proyecto
  {
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
      'unused-imports': unused,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Si luego quieres reglas TS con type-checking:
        // project: './tsconfig.json',
        // tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      // Reglas oficiales de Next (Core Web Vitals)
      ...nextRules,

      // Reglas de React Hooks (incluye exhaustive-deps)
      ...reactHooksRules,

      // Limpieza de imports no usados
      'unused-imports/no-unused-imports': 'error',

      // (Opcional) si quieres que variables no usadas sean warning y permitir prefijo _
      // '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // (Opcional) relajar ban-ts-comment a warning
      // '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
]