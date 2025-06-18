export const backendUrl = import.meta.env.VITE_BACKEND_URL

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

export const USER_ROLE_PERMISSIONS = [
  {
    group: 'categories',
    dependencies: ['language.read'],
    permissions: ['category.page', 'category.read', 'category.remove', 'category.create', 'category.edit', 'category.batchEdit', 'category.import', 'category.export'],
  },
  {
    group: 'products',
    dependencies: ['language.read', 'category.read', 'unit.read', 'currency.read'],
    permissions: ['product.page', 'product.read', 'product.remove', 'product.create', 'product.edit', 'product.batchEdit', 'product.import', 'product.export'],
  },
  {
    group: 'users',
    dependencies: ['language.read', 'user-role.read'],
    permissions: ['user.page', 'user.read', 'user.remove', 'user.create', 'user.edit', 'user.batchEdit', 'user.import', 'user.export'],
  },
  {
    group: 'units',
    dependencies: ['language.read'],
    permissions: ['unit.page', 'unit.read', 'unit.remove', 'unit.create', 'unit.edit', 'unit.batchEdit', 'unit.import', 'unit.export'],
  },
  {
    group: 'userRoles',
    dependencies: ['language.read'],
    permissions: ['userRole.page', 'userRole.read', 'userRole.remove', 'userRole.create', 'userRole.edit', 'userRole.batchEdit', 'userRole.import', 'userRole.export'],
  },
  {
    group: 'languages',
    permissions: ['language.page', 'language.read', 'language.remove', 'language.create', 'language.edit', 'language.batchEdit', 'language.import', 'language.export'],
  },
  {
    group: 'currencies',
    dependencies: ['language.read'],
    permissions: ['currency.page', 'currency.read', 'currency.remove', 'currency.create', 'currency.edit', 'currency.batchEdit', 'currency.import', 'currency.export'],
  },
  {
    group: 'other',
    permissions: ['other.admin'],
  },
] as const
