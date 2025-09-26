import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  stylistic: true,
  typescript: true,
  rules: {
    'react/no-use-context': 'off',
    'react/no-context-provider': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/no-cycle': 'off',
    'import/no-unresolved': 'off',
  },
  ignores: ['dist', 'node_modules', 'public', 'dist-test'],
})
