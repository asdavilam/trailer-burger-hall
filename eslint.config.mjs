// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import unused from 'eslint-plugin-unused-imports'
import prettier from 'eslint-config-prettier'

export default [
  // Ignorar artefactos de build
  { ignores: ['.next/', 'node_modules/', 'out/', 'next-env.d.ts'] },

  // Reglas base de JS
  js.configs.recommended,

  // Reglas base para TypeScript (flat config, sin type-checking estricto)
  ...tseslint.configs.recommended,

  // Desactiva conflictos con Prettier
  prettier,

  // Reglas del proyecto (plugins declarados aquí)
  {
    plugins: {
      'unused-imports': unused,
    },
    rules: {
      // Marca y elimina imports no usados
      'unused-imports/no-unused-imports': 'error',
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
]