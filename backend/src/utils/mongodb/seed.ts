import { connectDB } from '../../config/db'
import * as AutomationService from '../../services/automation.service'
import * as CashregisterAccountService from '../../services/cashregister-account.service'
import * as CashregisterService from '../../services/cashregister.service'
import * as CategoryService from '../../services/category.service'
import * as ClientService from '../../services/client.service'
import * as CurrencyService from '../../services/currency.service'
import * as DeliveryService from '../../services/delivery-service.service'
import * as LanguageService from '../../services/language.service'
import * as OrderSourceService from '../../services/order-source.service'
import * as OrderStatusService from '../../services/order-status.service'
import * as ProductPropertyGroupService from '../../services/product-property-group.service'
import * as ProductPropertyOptionService from '../../services/product-property-option.service'
import * as ProductPropertyService from '../../services/product-property.service'
import * as ProductService from '../../services/product.service'
import * as UnitService from '../../services/unit.service'
import * as UserRoleService from '../../services/user-role.service'
import * as UserService from '../../services/user.service'
import * as WarehouseService from '../../services/warehouse.service'
import { backupDB } from './backup'
import { clearDB } from './clear'

async function seedData() {
  try {
    // await backupDB()

    await connectDB()
    await clearDB()

    await createLanguages()
    await createCurrencies()
    await createUnits()
    await createCategories()
    const productProperties = await createProductProperties()
    await createProducts(productProperties)
    await createDeliveryServices()
    await createOrderSources()
    const statuses = await createOrderStatuses()
    await createCashregisters()
    await createWarehouses()
    await createUserRoles()
    await createAutomations(statuses)
    await createClients()

    console.log('✅ Test data seeded successfully!')
    process.exit(0)
  }
  catch (err) {
    console.error('❌ Error seeding data:', err)
    process.exit(1)
  }
}

async function createLanguages() {
  await LanguageService.create({
    name: 'English',
    code: 'en',
    priority: 1,
    main: true,
    active: true,
  })

  await LanguageService.create({
    name: 'Russian',
    code: 'ru',
    priority: 2,
    main: false,
    active: true,
  })
}

async function createCurrencies() {
  await CurrencyService.create({
    names: {
      en: 'USD',
      ru: 'Доллар США',
    },
    symbols: {
      en: '$',
      ru: '$',
    },
    priority: 1,
    active: true,
  })

  await CurrencyService.create({
    names: {
      en: 'Hryvnia',
      ru: 'Гривна',
    },
    symbols: {
      en: '₴',
      ru: '₴',
    },
    priority: 2,
    active: true,
  })
}

async function createUnits() {
  await UnitService.create({
    names: {
      en: 'Piece',
      ru: 'Штука',
    },
    symbols: {
      en: 'pcs',
      ru: 'шт',
    },
    priority: 1,
    active: true,
  })

  await UnitService.create({
    names: {
      en: 'Kilogram',
      ru: 'Килограмм',
    },
    symbols: {
      en: 'kg',
      ru: 'кг',
    },
    priority: 1,
    active: true,
  })
}

async function createCategories() {
  await CategoryService.create({
    names: {
      en: 'Electronics',
      ru: 'Электроника',
    },
    priority: 1,
    active: true,
  })

  await CategoryService.create({
    names: {
      en: 'Clothing',
      ru: 'Одежда',
    },
    priority: 2,
    active: true,
  })
}

async function createProductProperties() {
  const { productProperty: sku } = await ProductPropertyService.create({
    names: {
      en: 'SKU',
      ru: 'Артикул',
    },
    type: 'text',
    showInTable: true,
    isRequired: true,
    priority: 1,
    active: true,
  })

  const { productProperty: boxes } = await ProductPropertyService.create({
    names: {
      en: 'Boxes',
      ru: 'Коробки',
    },
    type: 'number',
    showInTable: true,
    isRequired: true,
    priority: 1,
    active: true,
  })

  const { productProperty: isNew } = await ProductPropertyService.create({
    names: {
      en: 'New',
      ru: 'Новый',
    },
    type: 'boolean',
    showInTable: true,
    isRequired: true,
    priority: 1,
    active: true,
  })

  const { productProperty: color } = await ProductPropertyService.create({
    names: {
      en: 'Color',
      ru: 'Цвет',
    },
    type: 'color',
    showInTable: true,
    isRequired: true,
    priority: 1,
    active: true,
  })

  const { productProperty: model } = await ProductPropertyService.create({
    names: {
      en: 'Model',
      ru: 'Модель',
    },
    type: 'select',
    showInTable: true,
    isRequired: true,
    priority: 1,
    active: true,
  })

  const { productProperty: parameters } = await ProductPropertyService.create({
    names: {
      en: 'Parameters',
      ru: 'Параметры',
    },
    type: 'multiSelect',
    showInTable: true,
    isRequired: true,
    priority: 1,
    active: true,
  })

  const colorData = [
    {
      id: color.id,
      names: {
        en: 'Red',
        ru: 'Красный',
      },
      color: '#FF0000',
    },
    {
      id: color.id,
      names: {
        en: 'Blue',
        ru: 'Синий',
      },
      color: '#0000FF',
    },
    {
      id: color.id,
      names: {
        en: 'Green',
        ru: 'Зелёный',
      },
      color: '#00FF00',
    },
    {
      id: color.id,
      names: {
        en: 'Yellow',
        ru: 'Жёлтый',
      },
      color: '#FFFF00',
    },
    {
      id: color.id,
      names: {
        en: 'Black',
        ru: 'Чёрный',
      },
      color: '#000000',
    },
  ]

  for (const colorItem of colorData) {
    await ProductPropertyOptionService.create({
      names: colorItem.names,
      productProperty: colorItem.id,
      active: true,
      priority: 1,
      color: colorItem.color,
    })
  }

  for (let i = 0; i < 5; i++) {
    await ProductPropertyOptionService.create({
      names: {
        en: `SK${i + 1}`,
        ru: `SK${i + 1}`,
      },
      productProperty: model.id,
      active: true,
      priority: 1,
    })
  }

  for (let i = 0; i < 5; i++) {
    await ProductPropertyOptionService.create({
      names: {
        en: `Parameter ${i + 1}`,
        ru: `Параметр ${i + 1}`,
      },
      productProperty: parameters.id,
      active: true,
      priority: i + 1,
    })
  }

  await ProductPropertyGroupService.create({
    names: {
      en: 'Product Properties',
      ru: 'Свойства продукта',
    },
    productProperties: [sku.id, boxes.id, isNew.id, color.id, model.id, parameters.id],
    active: true,
  })

  return { sku, boxes, isNew, color, model, parameters }
}

async function createProducts(productProperties: any) {
  const { categories } = await CategoryService.get({})
  const { currencies } = await CurrencyService.get({})
  const { units } = await UnitService.get({})
  const { productPropertyGroups } = await ProductPropertyGroupService.get({})
  const { productPropertiesOptions: modelOptions } = await ProductPropertyOptionService.get({ filters: { productProperty: productProperties.model.id } })
  const { productPropertiesOptions: colorOptions } = await ProductPropertyOptionService.get({ filters: { productProperty: productProperties.color.id } })
  const { productPropertiesOptions: parametersOptions } = await ProductPropertyOptionService.get({ filters: { productProperty: productProperties.parameters.id } })

  const products = [
    {
      names: {
        en: 'Product 1',
        ru: 'Продукт 1',
      },
      price: 100,
      currency: currencies[0].id,
      purchasePrice: 50,
      purchaseCurrency: currencies[1].id,
      categories: [categories[0].id],
      unit: units[1].id,
      productPropertiesGroup: productPropertyGroups[0].id,
      productProperties: [
        {
          id: productProperties.sku.id,
          value: '123456',
        },
        {
          id: productProperties.boxes.id,
          value: 10,
        },
        {
          id: productProperties.isNew.id,
          value: true,
        },
        {
          id: productProperties.color.id,
          value: colorOptions[0].id,
        },
        {
          id: productProperties.model.id,
          value: modelOptions[0].id,
        },
        {
          id: productProperties.parameters.id,
          value: [parametersOptions[0].id, parametersOptions[1].id],
        },
      ],
    },
    {
      names: {
        en: 'Product 2',
        ru: 'Продукт 2',
      },
      price: 100,
      currency: currencies[0].id,
      purchasePrice: 50,
      purchaseCurrency: currencies[1].id,
      categories: [categories[1].id],
      unit: units[1].id,
      productPropertiesGroup: productPropertyGroups[0].id,
      productProperties: [
        {
          id: productProperties.sku.id,
          value: '312523',
        },
        {
          id: productProperties.boxes.id,
          value: 100,
        },
        {
          id: productProperties.isNew.id,
          value: false,
        },
        {
          id: productProperties.color.id,
          value: colorOptions[1].id,
        },
        {
          id: productProperties.model.id,
          value: modelOptions[1].id,
        },
        {
          id: productProperties.parameters.id,
          value: [parametersOptions[1].id, parametersOptions[2].id],
        },
      ],
    },
    {
      names: {
        en: 'Product 3',
        ru: 'Продукт 3',
      },
      price: 100,
      currency: currencies[0].id,
      purchasePrice: 50,
      purchaseCurrency: currencies[1].id,
      categories: [categories[1].id],
      unit: units[1].id,
      productPropertiesGroup: productPropertyGroups[0].id,
      productProperties: [
        {
          id: productProperties.sku.id,
          value: '1234567',
        },
        {
          id: productProperties.boxes.id,
          value: 1000,
        },
        {
          id: productProperties.isNew.id,
          value: false,
        },
        {
          id: productProperties.color.id,
          value: colorOptions[2].id,
        },
        {
          id: productProperties.model.id,
          value: modelOptions[2].id,
        },
        {
          id: productProperties.parameters.id,
          value: [parametersOptions[2].id, parametersOptions[3].id],
        },
      ],
    },
    {
      names: {
        en: 'Product 4',
        ru: 'Продукт 4',
      },
      price: 100,
      currency: currencies[0].id,
      purchasePrice: 50,
      purchaseCurrency: currencies[1].id,
      categories: [categories[1].id],
      unit: units[1].id,
      productPropertiesGroup: productPropertyGroups[0].id,
      productProperties: [
        {
          id: productProperties.sku.id,
          value: '12345678',
        },
        {
          id: productProperties.boxes.id,
          value: 10000,
        },
        {
          id: productProperties.isNew.id,
          value: false,
        },
        {
          id: productProperties.color.id,
          value: colorOptions[3].id,
        },
        {
          id: productProperties.model.id,
          value: modelOptions[3].id,
        },
        {
          id: productProperties.parameters.id,
          value: [parametersOptions[3].id, parametersOptions[4].id],
        },
      ],
    },
    {
      names: {
        en: 'Product 5',
        ru: 'Продукт 5',
      },
      price: 100,
      currency: currencies[0].id,
      purchasePrice: 50,
      purchaseCurrency: currencies[1].id,
      categories: [categories[0].id],
      unit: units[1].id,
      productPropertiesGroup: productPropertyGroups[0].id,
      productProperties: [
        {
          id: productProperties.sku.id,
          value: '123456789',
        },
        {
          id: productProperties.boxes.id,
          value: 100000,
        },
        {
          id: productProperties.isNew.id,
          value: false,
        },
        {
          id: productProperties.color.id,
          value: colorOptions[4].id,
        },
        {
          id: productProperties.model.id,
          value: modelOptions[4].id,
        },
        {
          id: productProperties.parameters.id,
          value: [parametersOptions[4].id, parametersOptions[1].id],
        },
      ],
    },
  ]

  for (const product of products) {
    await ProductService.create({
      names: product.names,
      price: product.price,
      currency: product.currency,
      purchasePrice: product.purchasePrice,
      purchaseCurrency: product.purchaseCurrency,
      categories: product.categories,
      unit: product.unit,
      productPropertiesGroup: product.productPropertiesGroup,
      productProperties: product.productProperties,
      images: [],
      uploadedImages: [],
      generateBarcode: true,
    })
  }
}

async function createDeliveryServices() {
  await DeliveryService.create({
    names: {
      en: 'Nova Poshta',
      ru: 'Нова Пошта',
    },
    priority: 1,
    type: 'novaposhta',
  })

  await DeliveryService.create({
    names: {
      en: 'Self Pickup',
      ru: 'Самовывоз',
    },
    priority: 2,
    type: 'selfpickup',
  })
}

async function createOrderSources() {
  await OrderSourceService.create({
    names: {
      en: 'Website',
      ru: 'Веб-сайт',
    },
    priority: 1,
  })

  await OrderSourceService.create({
    names: {
      en: 'Telegram',
      ru: 'Телеграм',
    },
    priority: 2,
  })
}

async function createOrderStatuses() {
  const { orderStatus: isNew } = await OrderStatusService.create({
    names: {
      en: 'New',
      ru: 'Новый',
    },
    priority: 1,
    isSelectable: true,
    isLocked: false,
  })

  const { orderStatus: inProgress } = await OrderStatusService.create({
    names: {
      en: 'In Progress',
      ru: 'В работе',
    },
    priority: 2,
    isSelectable: true,
    isLocked: false,
  })

  const { orderStatus: sent } = await OrderStatusService.create({
    names: {
      en: 'Sent',
      ru: 'Отправлен',
    },
    priority: 3,
    isSelectable: true,
    isLocked: false,
  })

  const { orderStatus: completed } = await OrderStatusService.create({
    names: {
      en: 'Completed',
      ru: 'Завершен',
    },
    isLocked: true,
    priority: 4,
    isSelectable: false,
  })

  const { orderStatus: removed } = await OrderStatusService.create({
    names: {
      en: 'Removed',
      ru: 'Удалён',
    },
    isLocked: true,
    priority: 5,
    isSelectable: false,
  })

  return { isNew, inProgress, sent, completed, removed }
}

async function createCashregisters() {
  const { currencies } = await CurrencyService.get({})

  const cashAccount = await CashregisterAccountService.create({
    names: {
      en: 'Cash',
      ru: 'Наличные',
    },
    priority: 1,
    currencies: [currencies[0].id],
  })

  const cardAccount = await CashregisterAccountService.create({
    names: {
      en: 'Card',
      ru: 'Карта',
    },
    priority: 1,
    currencies: [currencies[0].id, currencies[1].id],
  })

  await CashregisterService.create({
    names: {
      en: 'Cash Register',
      ru: 'Касса',
    },
    priority: 1,
    accounts: [cashAccount.cashregisterAccount.id, cardAccount.cashregisterAccount.id],
  })
}

async function createWarehouses() {
  await WarehouseService.create({
    names: {
      en: 'Warehouse 1',
      ru: 'Склад 1',
    },
    priority: 1,
    active: true,
  })

  await WarehouseService.create({
    names: {
      en: 'Warehouse 2',
      ru: 'Склад 2',
    },
    priority: 2,
    active: true,
  })
}

async function createUserRoles() {
  const { userRole: admin } = await UserRoleService.create({
    names: {
      en: 'Admin',
      ru: 'Администратор',
    },
    priority: 1,
    permissions: ['other.admin'],
  })

  const { userRole: manager } = await UserRoleService.create({
    names: {
      en: 'Manager',
      ru: 'Менеджер',
    },
    priority: 2,
    permissions: ['other.admin'],
  })

  await UserService.create({
    name: 'Admin',
    login: 'admin',
    password: 'admin',
    role: admin.id,
    active: true,
  })

  await UserService.create({
    name: 'Manager',
    login: 'manager',
    password: 'manager',
    role: manager.id,
    active: true,
  })
}

async function createAutomations({ removed }: { removed: any }) {
  await AutomationService.create({
    name: 'Add "Removed" status to order',
    active: true,
    trigger: {
      type: 'order-removed',
      params: [],
    },
    conditions: [
      {
        field: 'orderStatus',
        operator: 'not-contains',
        params: [removed.id],
      },
    ],
    actions: [
      {
        field: 'orderStatus',
        params: [removed.id],
      },
    ],
  })
}

async function createClients() {
  await ClientService.create({
    name: 'Sergii',
    middleName: 'Oleksii',
    lastName: 'Kovalenko',
    emails: ['sergii@example.com'],
    phones: ['+1234567890'],
  })

  await ClientService.create({
    name: 'Dmytro',
    middleName: 'Vladimirovich',
    lastName: 'Kovalenko',
    emails: ['dmytro@example.com', 'dmytro@example.com'],
    phones: ['+1234567890', '+1234567890'],
  })
}

seedData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error seeding data:', err)
    process.exit(1)
  })
