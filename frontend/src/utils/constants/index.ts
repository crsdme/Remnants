import { enUS, ru, uk } from 'date-fns/locale'

export const DATE_LOCALE_MAP = {
  en: enUS,
  ru,
  uk,
}

export const backendUrl = import.meta.env.VITE_BACKEND_URL

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

export const PAYMENT_STATUSES = [
  {
    id: 'pending',
  },
  {
    id: 'processing',
  },
  {
    id: 'paid',
  },
  {
    id: 'failed',
  },
  {
    id: 'cancelled',
  },
  {
    id: 'refunded',
  },
]

export const AUTOMATION_TRIGGERS = [
  {
    group: 'order',
    items: [
      {
        id: 'order-created',
      },
      {
        id: 'order-status-updated',
      },
      {
        id: 'order-payment-updated',
      },
    ],
  },
]

export const AUTOMATION_CONDITIONS = [
  {
    group: 'order',
    items: [
      {
        id: 'orderStatus',
        type: 'contains',
      },
      {
        id: 'orderSource',
        type: 'contains',
      },
      {
        id: 'deliveryService',
        type: 'contains',
      },
    ],
  },
]

export const AUTOMATION_ACTIONS = [
  {
    group: 'order',
    items: [
      {
        id: 'order-status-update',
      },
      {
        id: 'order-payment-update',
      },
      {
        id: 'order-source-update',
      },
      {
        id: 'order-delivery-service-update',
      },
    ],
  },
]

export const USER_ROLE_PERMISSIONS = [
  {
    group: 'orders',
    permissions: ['order.page', 'order.read', 'order.remove', 'order.create', 'order.edit'],
  },
  {
    group: 'products',
    dependencies: ['language.read', 'category.read', 'unit.read', 'currency.read'],
    permissions: ['product.page', 'product.read', 'product.remove', 'product.create', 'product.edit', 'product.batchEdit', 'product.import', 'product.export'],
  },
  {
    group: 'categories',
    dependencies: ['language.read'],
    permissions: ['category.page', 'category.read', 'category.remove', 'category.create', 'category.edit', 'category.batchEdit', 'category.import', 'category.export'],
  },
  {
    group: 'product-properties-groups',
    dependencies: ['language.read'],
    permissions: ['productPropertyGroup.page', 'productPropertyGroup.read', 'productPropertyGroup.remove', 'productPropertyGroup.create', 'productPropertyGroup.edit', 'productPropertyGroup.batchEdit', 'productPropertyGroup.import', 'productPropertyGroup.export'],
  },
  {
    group: 'product-properties',
    dependencies: ['language.read', 'productPropertyGroup.read'],
    permissions: ['productProperty.page', 'productProperty.read', 'productProperty.remove', 'productProperty.create', 'productProperty.edit', 'productProperty.batchEdit', 'productProperty.import', 'productProperty.export'],
  },
  {
    group: 'barcodes',
    dependencies: ['language.read'],
    permissions: ['barcode.page', 'barcode.read', 'barcode.remove', 'barcode.create', 'barcode.edit', 'barcode.batchEdit', 'barcode.import', 'barcode.export'],
  },
  {
    group: 'users',
    dependencies: ['language.read', 'user-role.read'],
    permissions: ['user.page', 'user.read', 'user.remove', 'user.create', 'user.edit', 'user.batchEdit', 'user.import', 'user.export'],
  },
  {
    group: 'warehouses',
    dependencies: ['language.read'],
    permissions: ['warehouse.page', 'warehouse.read', 'warehouse.remove', 'warehouse.create', 'warehouse.edit', 'warehouse.batchEdit', 'warehouse.import', 'warehouse.export'],
  },
  {
    group: 'warehouse-transactions',
    dependencies: ['language.read', 'warehouse.read'],
    permissions: ['warehouseTransaction.page', 'warehouseTransaction.read', 'warehouseTransaction.remove', 'warehouseTransaction.create', 'warehouseTransaction.edit', 'warehouseTransaction.batchEdit', 'warehouseTransaction.import', 'warehouseTransaction.export'],
  },
  {
    group: 'units',
    dependencies: ['language.read'],
    permissions: ['unit.page', 'unit.read', 'unit.remove', 'unit.create', 'unit.edit', 'unit.batchEdit', 'unit.import', 'unit.export'],
  },
  {
    group: 'cashregisters',
    dependencies: ['language.read'],
    permissions: ['cashregister.page', 'cashregister.read', 'cashregister.remove', 'cashregister.create', 'cashregister.edit', 'cashregister.batchEdit', 'cashregister.import', 'cashregister.export'],
  },
  {
    group: 'cashregister-accounts',
    dependencies: ['language.read', 'cashregister.read'],
    permissions: ['cashregisterAccount.page', 'cashregisterAccount.read', 'cashregisterAccount.remove', 'cashregisterAccount.create', 'cashregisterAccount.edit', 'cashregisterAccount.batchEdit', 'cashregisterAccount.import', 'cashregisterAccount.export'],
  },
  {
    group: 'cashregister-transactions',
    dependencies: ['language.read', 'cashregister.read'],
    permissions: ['cashregisterTransaction.page', 'cashregisterTransaction.read', 'cashregisterTransaction.remove', 'cashregisterTransaction.create', 'cashregisterTransaction.edit', 'cashregisterTransaction.batchEdit', 'cashregisterTransaction.import', 'cashregisterTransaction.export'],
  },
  {
    group: 'users',
    dependencies: ['language.read', 'user-role.read'],
    permissions: ['user.page', 'user.read', 'user.remove', 'user.create', 'user.edit', 'user.batchEdit', 'user.import', 'user.export'],
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
    group: 'order-statuses',
    dependencies: ['language.read'],
    permissions: ['orderStatus.page', 'orderStatus.read', 'orderStatus.remove', 'orderStatus.create', 'orderStatus.edit', 'orderStatus.batchEdit', 'orderStatus.import', 'orderStatus.export'],
  },
  {
    group: 'order-sources',
    dependencies: ['language.read'],
    permissions: ['orderSource.page', 'orderSource.read', 'orderSource.remove', 'orderSource.create', 'orderSource.edit', 'orderSource.batchEdit', 'orderSource.import', 'orderSource.export'],
  },
  {
    group: 'automations',
    dependencies: ['language.read'],
    permissions: ['automation.page', 'automation.read', 'automation.remove', 'automation.create', 'automation.edit', 'automation.batchEdit', 'automation.import', 'automation.export'],
  },
  {
    group: 'delivery-services',
    dependencies: ['language.read'],
    permissions: ['deliveryService.page', 'deliveryService.read', 'deliveryService.remove', 'deliveryService.create', 'deliveryService.edit', 'deliveryService.batchEdit', 'deliveryService.import', 'deliveryService.export'],
  },
  {
    group: 'units',
    dependencies: ['language.read'],
    permissions: ['unit.page', 'unit.read', 'unit.remove', 'unit.create', 'unit.edit', 'unit.batchEdit', 'unit.import', 'unit.export'],
  },
  {
    group: 'settings',
    permissions: ['setting.page', 'setting.read', 'setting.remove', 'setting.create', 'setting.edit', 'setting.batchEdit', 'setting.import', 'setting.export'],
  },
  {
    group: 'other',
    permissions: ['other.admin'],
  },
] as const
