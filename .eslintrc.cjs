module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-unsafe-optional-chaining': 'error',
    
    // Code quality rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'warn'
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      env: { jest: true },
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['server.js', '*.config.js', '*.config.ts'],
      env: { node: true },
      rules: {
        'no-console': 'off'
      }
    }
  ]
}
