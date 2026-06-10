import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  stylistic: true,
  typescript: {
    tsconfigPath: 'tsconfig.app.json',
  },
  rules: {
    'react/no-use-context': 'off',
    'react/no-context-provider': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/no-cycle': 'off',
    'import/no-unresolved': 'off',
    'ts/strict-boolean-expressions': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-return': 'off',
  },
  ignores: ['dist', 'node_modules', 'public', 'dist-test'],
})
