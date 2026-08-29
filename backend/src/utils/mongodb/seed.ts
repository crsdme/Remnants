import { DELIVERY_CURRENCY_SETTING_KEY, DELIVERY_STATUS_MAP_SETTING_KEY, DELIVERY_TRACKING_INTERVAL_DEFAULT, DELIVERY_TRACKING_INTERVAL_SETTING_KEY, PHONE_DEFAULT_COUNTRY_FALLBACK, PHONE_DEFAULT_COUNTRY_SETTING_KEY } from '@remnant/shared'
import { connectDB } from '../../config/db'
import * as AutomationService from '../../services/automation.service'
import * as CashregisterAccountService from '../../services/cashregister-account.service'
import * as CashregisterService from '../../services/cashregister.service'
import * as CategoryService from '../../services/category.service'
import * as ClientService from '../../services/client.service'
import * as CurrencyService from '../../services/currency.service'
import * as DeliveryService from '../../services/delivery-service.service'
import * as ExpenseCategoryService from '../../services/expense-category.service'
// import * as ExpenseService from '../../services/expense.service'
import * as LanguageService from '../../services/language.service'
import * as OrderSourceService from '../../services/order-source.service'
import * as OrderStatusService from '../../services/order-status.service'
import * as ProductPropertyGroupService from '../../services/product-property-group.service'
import * as ProductPropertyOptionService from '../../services/product-property-option.service'
import * as ProductPropertyService from '../../services/product-property.service'
import * as ProductStockStatusService from '../../services/product-stock-status.service'
import * as ProductService from '../../services/product.service'
import * as SettingService from '../../services/setting.service'
import * as SiteService from '../../services/site.service'
import * as UnitService from '../../services/unit.service'
import * as UserRoleService from '../../services/user-role.service'
import * as UserService from '../../services/user.service'
import * as WarehouseService from '../../services/warehouse.service'
import {
  parseCreateProducts,
  parseGetCategories,
  parseGetCurrency,
  parseGetProductPropertyGroups,
  parseGetProductPropertyOptions,
  parseGetUnits,
} from '../../types/'

// import { backupDB } from './backup'
import { clearDB } from './clear'

async function seedData() {
  try {
    // await backupDB()

    await connectDB()
    await clearDB()

    await createLanguages()
    const currencies = await createCurrencies()
    await createUnits()
    await createCategories()
    const productProperties = await createProductProperties()
    await createProducts(productProperties)
    const deliveryServices = await createDeliveryServices()
    await createOrderSources()
    const statuses = await createOrderStatuses(currencies.uah.id)
    await createProductStockStatuses()
    await createCashregisters()
    const warehouses = await createWarehouses()
    await createUserRoles()
    await createAutomations({
      removed: statuses.removed,
      selfpickup: deliveryServices.selfpickup,
      completed: statuses.completed,
    })
    await createClients()
    await createExpenseCategories()
    await createSites(warehouses)
    await ProductStockStatusService.recomputeAll()

    console.log('✅ Test data seeded successfully!')
    process.exit(0)
  }
  catch (err) {
    console.error('❌ Error seeding data:', err)
    process.exit(1)
  }
}

async function createSites(warehouses: { warehouse1: { id: string }, warehouse2: { id: string } }) {
  await SiteService.create({
    payload: {
      names: {
        en: 'Example',
        ru: 'Example',
      },
      url: 'http://example.com/',
      key: 'example',
      priority: 1,
      active: true,
      warehouseIds: [warehouses.warehouse1.id, warehouses.warehouse2.id],
    },
  })
}

async function createLanguages() {
  await LanguageService.create({
    payload: {
      name: 'English',
      code: 'en',
      priority: 1,
      main: true,
      active: true,
    },
  })

  await LanguageService.create({
    payload: {
      name: 'Russian',
      code: 'ru',
      priority: 2,
      main: false,
      active: true,
    },
  })
}

async function createCurrencies() {
  await CurrencyService.create({
    payload: {
      names: {
        en: 'USD',
        ru: 'Доллар США',
      },
      symbols: {
        en: '$',
        ru: '$',
      },
      priority: 1,
      scale: 2,
      active: true,
    },
  })

  const { data: uah } = await CurrencyService.create({
    payload: {
      names: {
        en: 'Hryvnia',
        ru: 'Гривна',
      },
      symbols: {
        en: '₴',
        ru: '₴',
      },
      priority: 2,
      scale: 2,
      active: true,
    },
  })

  await CurrencyService.create({
    payload: {
      names: {
        en: 'Euro',
        ru: 'Евро',
      },
      symbols: {
        en: '€',
        ru: '€',
      },
      priority: 3,
      scale: 2,
      active: true,
    },
  })

  await SettingService.create({
    payload: {
      key: PHONE_DEFAULT_COUNTRY_SETTING_KEY,
      value: PHONE_DEFAULT_COUNTRY_FALLBACK,
      scope: 'ui',
      isPublic: true,
      description: 'Default country code for phone inputs',
    },
  })

  return { uah }
}

async function createUnits() {
  await UnitService.create({
    payload: {
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
    },
  })

  await UnitService.create({
    payload: {
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
    },
  })
}

async function createCategories() {
  await CategoryService.create({
    payload: {
      names: {
        en: 'Electronics',
        ru: 'Электроника',
      },
      priority: 1,
      active: true,
    },
  })

  await CategoryService.create({
    payload: {
      names: {
        en: 'Clothing',
        ru: 'Одежда',
      },
      priority: 2,
      active: true,
    },
  })
}

async function createProductProperties() {
  const { data: sku } = await ProductPropertyService.create({
    payload: {
      names: {
        en: 'SKU',
        ru: 'Артикул',
      },
      symbols: {
        en: 'SKU',
        ru: 'Артикул',
      },
      type: 'text',
      showInTable: true,
      showInStatistics: true,
      isRequired: true,
      priority: 1,
      active: true,
    },
  })

  const { data: boxes } = await ProductPropertyService.create({
    payload: {
      names: {
        en: 'Boxes',
        ru: 'Коробки',
      },
      symbols: {
        en: 'Boxes',
        ru: 'Коробки',
      },
      type: 'number',
      showInTable: true,
      showInStatistics: true,
      isRequired: true,
      priority: 1,
      active: true,
    },
  })

  const { data: isNew } = await ProductPropertyService.create({
    payload: {
      names: {
        en: 'New',
        ru: 'Новый',
      },
      symbols: {
        en: 'New',
        ru: 'Новый',
      },
      type: 'boolean',
      showInTable: true,
      isRequired: true,
      showInStatistics: true,
      priority: 1,
      active: true,
    },
  })

  const { data: color } = await ProductPropertyService.create({
    payload: {
      names: {
        en: 'Color',
        ru: 'Цвет',
      },
      symbols: {
        en: 'Color',
        ru: 'Цвет',
      },
      type: 'color',
      showInTable: true,
      showInStatistics: true,
      isRequired: true,
      priority: 1,
      active: true,
    },
  })

  const { data: model } = await ProductPropertyService.create({
    payload: {
      names: {
        en: 'Model',
        ru: 'Модель',
      },
      symbols: {
        en: 'Model',
        ru: 'Модель',
      },
      type: 'select',
      showInTable: true,
      showInStatistics: true,
      isRequired: true,
      priority: 1,
      active: true,
    },
  })

  const { data: parameters } = await ProductPropertyService.create({
    payload: {
      names: {
        en: 'Parameters',
        ru: 'Параметры',
      },
      symbols: {
        en: 'Parameters',
        ru: 'Параметры',
      },
      type: 'multiSelect',
      showInTable: true,
      showInStatistics: true,
      isRequired: true,
      priority: 1,
      active: true,
    },
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
      payload: {
        names: colorItem.names,
        productPropertyId: colorItem.id,
        active: true,
        priority: 1,
        color: colorItem.color,
      },
    })
  }

  for (let i = 0; i < 5; i++) {
    await ProductPropertyOptionService.create({
      payload: {
        names: {
          en: `SK${i + 1}`,
          ru: `SK${i + 1}`,
        },
        productPropertyId: model.id,
        active: true,
        priority: 1,
      },
    })
  }

  for (let i = 0; i < 5; i++) {
    await ProductPropertyOptionService.create({
      payload: {
        names: {
          en: `Parameter ${i + 1}`,
          ru: `Параметр ${i + 1}`,
        },
        productPropertyId: parameters.id,
        active: true,
        priority: i + 1,
      },
    })
  }

  await ProductPropertyGroupService.create({
    payload: {
      names: {
        en: 'Product Properties',
        ru: 'Свойства продукта',
      },
      priority: 1,
      productPropertyIds: [sku.id, boxes.id, isNew.id, color.id, model.id, parameters.id],
      active: true,
    },
  })

  return { sku, boxes, isNew, color, model, parameters }
}

async function createProducts(productProperties: {
  model: { id: string }
  color: { id: string }
  parameters: { id: string }
  isNew: { id: string }
  sku: { id: string }
  boxes: { id: string }
}) {
  const { data: { items: categories } } = await CategoryService.get({ payload: parseGetCategories({}) })
  const { data: { items: currencies } } = await CurrencyService.get({ payload: parseGetCurrency({}) })
  const { data: { items: units } } = await UnitService.get({ payload: parseGetUnits({}) })
  const { data: { items: productPropertyGroups } } = await ProductPropertyGroupService.get({ payload: parseGetProductPropertyGroups({}) })
  const { data: { items: modelOptions } } = await ProductPropertyOptionService.get({ payload: parseGetProductPropertyOptions({ filters: { productPropertyId: productProperties.model.id } }) })
  const { data: { items: colorOptions } } = await ProductPropertyOptionService.get({ payload: parseGetProductPropertyOptions({ filters: { productPropertyId: productProperties.color.id } }) })
  const { data: { items: parametersOptions } } = await ProductPropertyOptionService.get({ payload: parseGetProductPropertyOptions({ filters: { productPropertyId: productProperties.parameters.id } }) })

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
          value: 46,
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
          value: 53,
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
          value: 56,
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
          value: 60,
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
          value: 65,
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
    {
      names: {
        en: 'Product 6',
        ru: 'Продукт 6',
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
          value: 74,
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
    {
      names: {
        en: 'Product 7',
        ru: 'Продукт 7',
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
          value: 77,
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
    {
      names: {
        en: 'Product 8',
        ru: 'Продукт 8',
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
          value: 82,
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
    {
      names: {
        en: 'Product 9',
        ru: 'Продукт 9',
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
          value: 86,
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
    {
      names: {
        en: 'Product 10',
        ru: 'Продукт 10',
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
          value: 94,
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
    {
      names: {
        en: 'Product 11',
        ru: 'Продукт 11',
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
          value: 54,
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
        en: 'Product 12',
        ru: 'Продукт 12',
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
          value: 57,
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
        en: 'Product 13',
        ru: 'Продукт 13',
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
          value: 62,
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
        en: 'Product 14',
        ru: 'Продукт 14',
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
          value: 68,
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
        en: 'Product 15',
        ru: 'Продукт 15',
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
          value: 73,
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
    {
      names: {
        en: 'Product 16',
        ru: 'Продукт 16',
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
          value: 75,
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
    {
      names: {
        en: 'Product 17',
        ru: 'Продукт 17',
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
          value: 83,
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
    {
      names: {
        en: 'Product 18',
        ru: 'Продукт 18',
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
          value: 89,
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
    {
      names: {
        en: 'Product 19',
        ru: 'Продукт 19',
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
          value: 93,
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
    {
      names: {
        en: 'Product 20',
        ru: 'Продукт 20',
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
          value: 100,
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

  const bigProducts = []

  for (let i = 0; i < 1; i++) {
    bigProducts.push(...products)
  }

  for (const product of bigProducts) {
    await ProductService.create({
      payload: parseCreateProducts({
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
      }),
      uploadedImages: [],
    })
  }
}

async function createDeliveryServices() {
  const { data: novaposhta } = await DeliveryService.create({
    payload: {
      names: {
        en: 'Nova Poshta',
        ru: 'Нова Пошта',
      },
      priority: 2,
      type: 'novaposhta',
      active: true,
      credentials: {
        type: 'novaposhta',
        apiKey: 'seed-novaposhta-api-key',
        phone: '380000000000',
        sender: {
          city: { id: 'seed-city', name: 'Kyiv' },
          office: { id: 'seed-office', name: 'Warehouse 1' },
        },
      },
    },
  })

  const { data: selfpickup } = await DeliveryService.create({
    payload: {
      names: {
        en: 'Self Pickup',
        ru: 'Самовывоз',
      },
      priority: 1,
      type: 'selfpickup',
      active: true,
      credentials: {
        type: 'selfpickup',
      },
    },
  })

  return { novaposhta, selfpickup }
}

async function createOrderSources() {
  await OrderSourceService.create({
    payload: {
      names: {
        en: 'Website',
        ru: 'Веб-сайт',
      },
      priority: 1,
    },
  })

  await OrderSourceService.create({
    payload: {
      names: {
        en: 'Telegram',
        ru: 'Телеграм',
      },
      priority: 2,
    },
  })
}

async function createOrderStatuses(npCurrencyId: string) {
  async function createStatus(params: {
    en: string
    ru: string
    color: string
    priority: number
    isSelectable: boolean
    isDisplayed: boolean
    includeInStatistics: boolean
    isLocked: boolean
  }) {
    const { data } = await OrderStatusService.create({
      payload: {
        names: { en: params.en, ru: params.ru },
        color: params.color,
        priority: params.priority,
        isSelectable: params.isSelectable,
        isDisplayed: params.isDisplayed,
        includeInStatistics: params.includeInStatistics,
        isLocked: params.isLocked,
      },
    })
    return data
  }

  const inProgress = await createStatus({
    en: 'In Progress',
    ru: 'В работе',
    color: '#3b82f6',
    priority: 1,
    isSelectable: true,
    isDisplayed: true,
    includeInStatistics: true,
    isLocked: false,
  })

  const awaitingShipment = await createStatus({
    en: 'Awaiting shipment',
    ru: 'Ожидает отправки',
    color: '#eab308',
    priority: 2,
    isSelectable: true,
    isDisplayed: true,
    includeInStatistics: true,
    isLocked: false,
  })

  const inTransit = await createStatus({
    en: 'In transit',
    ru: 'В пути',
    color: '#f97316',
    priority: 3,
    isSelectable: true,
    isDisplayed: true,
    includeInStatistics: true,
    isLocked: false,
  })

  const atOffice = await createStatus({
    en: 'At the warehouse',
    ru: 'В отделении',
    color: '#8b5cf6',
    priority: 4,
    isSelectable: true,
    isDisplayed: true,
    includeInStatistics: true,
    isLocked: false,
  })

  const money = await createStatus({
    en: 'Money / COD',
    ru: 'Деньги',
    color: '#22c55e',
    priority: 5,
    isSelectable: true,
    isDisplayed: true,
    includeInStatistics: true,
    isLocked: false,
  })

  const completed = await createStatus({
    en: 'Completed',
    ru: 'Завершен',
    color: '#16a34a',
    priority: 6,
    isSelectable: false,
    isDisplayed: true,
    includeInStatistics: true,
    isLocked: true,
  })

  const returned = await createStatus({
    en: 'Returned',
    ru: 'Возврат',
    color: '#ef4444',
    priority: 7,
    isSelectable: true,
    isDisplayed: true,
    includeInStatistics: true,
    isLocked: false,
  })

  const removed = await createStatus({
    en: 'Removed',
    ru: 'Удалён',
    color: '#6b7280',
    priority: 8,
    isSelectable: false,
    isDisplayed: true,
    includeInStatistics: false,
    isLocked: true,
  })

  await SettingService.create({
    payload: {
      key: DELIVERY_STATUS_MAP_SETTING_KEY,
      value: JSON.stringify({
        awaiting_shipment: awaitingShipment.id,
        in_transit: inTransit.id,
        at_office: atOffice.id,
        money: money.id,
        completed: completed.id,
        returned: returned.id,
      }),
      scope: 'delivery',
      isPublic: true,
      description: 'Nova Poshta tracking groups to order statuses',
    },
  })

  await SettingService.create({
    payload: {
      key: DELIVERY_CURRENCY_SETTING_KEY,
      value: npCurrencyId,
      scope: 'delivery',
      isPublic: true,
      description: 'Currency used for Nova Poshta declared value',
    },
  })

  await SettingService.create({
    payload: {
      key: DELIVERY_TRACKING_INTERVAL_SETTING_KEY,
      value: DELIVERY_TRACKING_INTERVAL_DEFAULT,
      scope: 'delivery',
      isPublic: true,
      description: 'How often Nova Poshta tracking may refresh (e.g. 5m, 1h, 1d)',
    },
  })

  return { inProgress, completed, removed }
}

async function createProductStockStatuses() {
  await ProductStockStatusService.create({
    payload: {
      names: { en: 'Out of stock', ru: 'Нет в наличии' },
      color: '#ef4444',
      priority: 1,
      active: true,
      isDefault: false,
      conditions: [{ field: 'qty', operator: 'eq', value: 0 }],
    },
  })

  await ProductStockStatusService.create({
    payload: {
      names: { en: 'Low stock', ru: 'Мало' },
      color: '#f97316',
      priority: 2,
      active: true,
      isDefault: false,
      conditions: [{ field: 'qty', operator: 'lte', value: 2 }],
    },
  })

  await ProductStockStatusService.create({
    payload: {
      names: { en: 'Overstock', ru: 'Переизбыток' },
      color: '#a855f7',
      priority: 3,
      active: true,
      isDefault: false,
      conditions: [{ field: 'qty', operator: 'gt', value: 50 }],
    },
  })

  await ProductStockStatusService.create({
    payload: {
      names: { en: 'Not selling', ru: 'Не продаётся' },
      color: '#eab308',
      priority: 4,
      active: true,
      isDefault: false,
      conditions: [
        { field: 'qty', operator: 'gt', value: 0 },
        { field: 'daysSinceLastSale', operator: 'gt', value: 30 },
      ],
    },
  })

  await ProductStockStatusService.create({
    payload: {
      names: { en: 'Forgotten', ru: 'Забытый' },
      color: '#64748b',
      priority: 5,
      active: true,
      isDefault: false,
      conditions: [
        { field: 'qty', operator: 'eq', value: 0 },
        { field: 'daysSinceQtyChange', operator: 'gt', value: 60 },
      ],
    },
  })

  await ProductStockStatusService.create({
    payload: {
      names: { en: 'Normal', ru: 'Норм' },
      color: '#22c55e',
      priority: 100,
      active: true,
      isDefault: true,
      conditions: [],
    },
  })
}

async function createCashregisters() {
  const { data: { items: currencies } } = await CurrencyService.get({ payload: parseGetCurrency({}) })

  const cashAccount = await CashregisterAccountService.create({
    payload: {
      names: {
        en: 'Cash',
        ru: 'Наличные',
      },
      active: true,
      priority: 1,
      currencyIds: [currencies[0].id],
    },
  })

  const cardAccount = await CashregisterAccountService.create({
    payload: {
      names: {
        en: 'Card',
        ru: 'Карта',
      },
      active: true,
      priority: 1,
      currencyIds: [currencies[0].id, currencies[1].id],
    },
  })

  await CashregisterService.create({
    payload: {
      names: {
        en: 'Cash Register',
        ru: 'Касса',
      },
      active: true,
      priority: 1,
      accountIds: [cashAccount.data.id, cardAccount.data.id],
    },
  })
}

async function createWarehouses() {
  const { data: warehouse1 } = await WarehouseService.create({
    payload: {
      names: {
        en: 'Warehouse 1',
        ru: 'Склад 1',
      },
      priority: 1,
      active: true,
    },
  })

  const { data: warehouse2 } = await WarehouseService.create({
    payload: {
      names: {
        en: 'Warehouse 2',
        ru: 'Склад 2',
      },
      priority: 2,
      active: true,
    },
  })

  return { warehouse1, warehouse2 }
}

async function createUserRoles() {
  const { data: admin } = await UserRoleService.create({
    names: {
      en: 'Admin',
      ru: 'Администратор',
    },
    priority: 1,
    permissions: ['other.admin'],
  })

  const { data: manager } = await UserRoleService.create({
    names: {
      en: 'Manager',
      ru: 'Менеджер',
    },
    priority: 2,
    permissions: [
      'order.page',
      'order.read',
      'order.create',
      'order.edit',
      'product.page',
      'product.read',
      'product.create',
      'product.edit',
      'category.page',
      'category.read',
      'category.create',
      'category.edit',
      'productPropertyGroup.read',
      'productProperty.read',
      'barcode.page',
      'barcode.read',
      'barcode.create',
      'barcode.edit',
      'orderStatistic.page',
      'orderStatistic.read',
      'orderStatistic.export',
      'client.page',
      'client.read',
      'client.create',
      'client.edit',
      'warehouse.read',
      'warehouseTransaction.page',
      'warehouseTransaction.read',
      'warehouseTransaction.create',
      'warehouseTransaction.receive',
      'inventory.page',
      'inventory.read',
      'inventory.create',
      'inventory.edit',
      'inventory.remove',
      'unit.read',
      'cashrehister.page',
      'cashrehister.read',
      'cashrehisterAccount.read',
      'expense.page',
      'expense.read',
      'expense.create',
      'language.read',
      'currency.page',
      'currency.read',
      'currency.edit',
      'orderStatus.read',
      'orderSource.read',
      'deliveryService.read',
      'expenseCategory.read',
      'site.read',
    ],
  })

  await UserService.create({
    name: 'Admin',
    login: 'admin',
    access: {
      warehouseIds: [],
      cashregisterIds: [],
      siteIds: [],
      expenseCategoryIds: [],
      cashregisterAccountIds: [],
      deliveryServiceIds: [],
      orderSourceIds: [],
      orderStatusIds: [],
    },
    password: 'admin',
    roleId: admin.id,
    active: true,
  })

  await UserService.create({
    name: 'Manager',
    login: 'manager',
    password: 'manager',
    access: {
      warehouseIds: [],
      cashregisterIds: [],
      siteIds: [],
      expenseCategoryIds: [],
      cashregisterAccountIds: [],
      deliveryServiceIds: [],
      orderSourceIds: [],
      orderStatusIds: [],
    },
    roleId: manager.id,
    active: true,
  })
}

async function createAutomations({ removed, selfpickup, completed }: { removed: { id: string }, selfpickup: { id: string }, completed: { id: string } }) {
  await AutomationService.create({
    payload: {
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
          field: 'order-status-update',
          params: [removed.id],
        },
        {
          field: 'order-mark-removed',
          params: [],
        },
      ],
    },
  })

  await AutomationService.create({
    payload: {
      name: 'Auto Pay Order When Selfpickup',
      active: true,
      trigger: {
        type: 'order-created',
        params: [],
      },
      conditions: [
        {
          field: 'deliveryService',
          operator: 'contains',
          params: [selfpickup.id],
        },
      ],
      actions: [
        {
          field: 'pay-order',
          params: [],
        },
      ],
    },
  })

  await AutomationService.create({
    payload: {
      name: 'Auto Update Order Status When Selfpickup',
      active: true,
      trigger: {
        type: 'order-created',
        params: [],
      },
      conditions: [
        {
          field: 'deliveryService',
          operator: 'contains',
          params: [selfpickup.id],
        },
      ],
      actions: [
        {
          field: 'order-status-update',
          params: [completed.id],
        },
      ],
    },
  })
}

async function createClients() {
  const clients = [
    {
      name: 'Dmytro',
      middleName: 'Vladimirovich',
      lastName: 'Kovalenko',
      country: 'USA',
      emails: ['dmytro@example.com', 'd.kovalenko@gmail.com'],
      phones: ['+380931234567', '+380671234567'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Regular customer',
    },
    {
      name: 'Olena',
      middleName: 'Petrovna',
      lastName: 'Shevchenko',
      country: 'USA',
      emails: ['olena.shevchenko@example.com'],
      phones: ['+380501112233'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Prefers email contact',
    },
    {
      name: 'Mykola',
      middleName: 'Ivanovych',
      lastName: 'Tkachenko',
      country: 'USA',
      emails: ['m.tkachenko@gmail.com', 'mykola@example.com'],
      phones: ['+380931112233', '+380991112233'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Wholesale buyer',
    },
    {
      name: 'Iryna',
      middleName: 'Serhiivna',
      lastName: 'Melnyk',
      country: 'USA',
      emails: ['iryna.melnyk@ukr.net'],
      phones: ['+380971234567'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Asks for discounts',
    },
    {
      name: 'Andriy',
      middleName: 'Olehovič',
      lastName: 'Bondar',
      country: 'USA',
      emails: ['andriy@example.com'],
      phones: ['+380631112233', '+380731112233'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'VIP client',
    },
    {
      name: 'Yuliia',
      middleName: 'Anatoliivna',
      lastName: 'Savchenko',
      country: 'USA',
      emails: ['y.savchenko@gmail.com'],
      phones: ['+380671231231'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Likes new products',
    },
    {
      name: 'Oleksandr',
      middleName: 'Stepanovych',
      lastName: 'Hrytsenko',
      country: 'USA',
      emails: ['oleksandr.h@example.com'],
      phones: ['+380931231231'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Corporate orders',
    },
    {
      name: 'Tetiana',
      middleName: 'Volodymyrivna',
      lastName: 'Kravchenko',
      country: 'USA',
      emails: ['tetiana.kravch@gmail.com'],
      phones: ['+380981112244', '+380671112244'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Sometimes inactive',
    },
    {
      name: 'Roman',
      middleName: 'Mykhailovych',
      lastName: 'Polishchuk',
      country: 'USA',
      emails: ['roman.polishchuk@example.com'],
      phones: ['+380931223344'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Referral from friend',
    },
    {
      name: 'Kateryna',
      middleName: 'Yurivna',
      lastName: 'Zakharchenko',
      country: 'USA',
      emails: ['katya.zakhar@gmail.com'],
      phones: ['+380991234321'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Interested in promos',
    },
    {
      name: 'Petro',
      middleName: 'Danylovych',
      lastName: 'Horobets',
      country: 'USA',
      emails: ['petro.h@example.com'],
      phones: ['+380671223344'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Pays cash only',
    },
    {
      name: 'Halyna',
      middleName: 'Oleksandrivna',
      lastName: 'Levchenko',
      country: 'USA',
      emails: ['halyna.levchenko@example.com'],
      phones: ['+380981223344'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Regular weekend buyer',
    },
    {
      name: 'Viktor',
      middleName: 'Borysovych',
      lastName: 'Marchenko',
      country: 'USA',
      emails: ['viktor.marchenko@example.com'],
      phones: ['+380931998877'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Loyal for 3 years',
    },
    {
      name: 'Nadiia',
      middleName: 'Serhiivna',
      lastName: 'Prokopenko',
      country: 'USA',
      emails: ['nadiia.prok@gmail.com'],
      phones: ['+380971112255'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Prefers online orders',
    },
    {
      name: 'Oleh',
      middleName: 'Vasylovych',
      lastName: 'Chernenko',
      country: 'USA',
      emails: ['oleh.ch@example.com'],
      phones: ['+380631123321'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Always late pickup',
    },
    {
      name: 'Mariia',
      middleName: 'Fedorivna',
      lastName: 'Lysenko',
      country: 'USA',
      emails: ['mariia.lys@example.com'],
      phones: ['+380981145678'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Asks for loyalty bonuses',
    },
    {
      name: 'Serhii',
      middleName: 'Volodymyrovych',
      lastName: 'Bilan',
      country: 'USA',
      emails: ['serhii.bilan@example.com'],
      phones: ['+380671234000'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Corporate manager',
    },
    {
      name: 'Anna',
      middleName: 'Vitaliivna',
      lastName: 'Danylchenko',
      country: 'USA',
      emails: ['anna.danyl@example.com'],
      phones: ['+380991111555'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Young customer',
    },
    {
      name: 'Yaroslav',
      middleName: 'Andriiovych',
      lastName: 'Petrenko',
      emails: ['yaroslav.petrenko@example.com'],
      country: 'USA',
      phones: ['+380931122334'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/yaroslav_petrenko',
        },
      ],
      comment: 'Referred 5 new clients',
    },
    {
      name: 'Oksana',
      middleName: 'Ihorivna',
      lastName: 'Klymenko',
      emails: ['oksana.klymenko@example.com'],
      country: 'USA',
      phones: ['+380981221122'],
      socials: [
        {
          type: 'telegram',
          value: 'https://t.me/oksana_klymenko',
        },
      ],
      comment: 'Leaves detailed feedback',
    },
  ]

  for (const client of clients) {
    await ClientService.create({ payload: client })
  }
}

async function createExpenseCategories() {
  await ExpenseCategoryService.create({
    payload: {
      names: {
        en: 'Store #1',
        ru: 'Склад #1',
      },
      color: '#FF0000',
      priority: 1,
    },
  })

  await ExpenseCategoryService.create({
    payload: {
      names: {
        en: 'Store #2',
        ru: 'Склад #2',
      },
      color: '#00FF00',
      priority: 2,
    },
  })

  await ExpenseCategoryService.create({
    payload: {
      names: {
        en: 'Fee',
        ru: 'Комиссия',
      },
      color: '#00FF00',
      priority: 3,
    },
  })

  await ExpenseCategoryService.create({
    payload: {
      names: {
        en: 'Salary',
        ru: 'Зарплата',
      },
      color: '#00FF00',
      priority: 4,
    },
  })

  await ExpenseCategoryService.create({
    payload: {
      names: {
        en: 'Consumables',
        ru: 'Расходники',
      },
      color: '#00FF00',
      priority: 5,
    },
  })

  await ExpenseCategoryService.create({
    payload: {
      names: {
        en: 'Utilities',
        ru: 'Комунальные платежи',
      },
      color: '#00FF00',
      priority: 6,
    },
  })

  await ExpenseCategoryService.create({
    payload: {
      names: {
        en: 'Other',
        ru: 'Другое',
      },
      color: '#00FF00',
      priority: 7,
    },
  })
}

seedData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error seeding data:', err)
    process.exit(1)
  })
