import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  stylistic: true,
  react: false,
  isInEditor: true,
  rules: {
    'no-console': 'off',
    // 'node/prefer-global/process': 'off',
    // 'node/prefer-global/buffer': 'off',
    
    // "eqeqeq": "warn",
    // "no-invalid-this": "error",
    // "no-return-assign": "error",
    // "no-unused-expressions": ["error", { "allowTernary": true }],
    // "no-useless-concat": "error",
    // "no-useless-return": "error",
    // "no-constant-condition": "warn",
    // "no-unused-vars": ["warn", { "argsIgnorePattern": "req|res|next|__" }],
  },
})
