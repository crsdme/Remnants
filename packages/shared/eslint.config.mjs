import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    stylistic: true,
    react: false,
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'ts/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
      ],
    },
  },
)
