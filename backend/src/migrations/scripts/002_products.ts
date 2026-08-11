import type { Migration } from '../types'
import { convertMoneyFields, loadCurrencyScales, renameFields } from '../helpers'

/** Products: money → minor* and FK renames. */
export const migration002Products: Migration = {
  id: '002',
  name: 'products_money_and_refs',
  async up({ db, log }) {
    const products = db.collection('products')
    const scales = await loadCurrencyScales(db)

    await convertMoneyFields(products, scales, [
      { from: 'price', to: 'minorPrice', currencyFrom: 'currency', currencyTo: 'currencyId' },
      { from: 'purchasePrice', to: 'minorPurchasePrice', currencyFrom: 'purchaseCurrency', currencyTo: 'purchaseCurrencyId' },
    ], log)

    await renameFields(products, {
      currency: 'currencyId',
      purchaseCurrency: 'purchaseCurrencyId',
      categories: 'categoryIds',
      unit: 'unitId',
      productPropertiesGroup: 'productPropertiesGroupId',
      quantity: 'quantityIds',
      barcodes: 'barcodeIds',
    }, log)

    await products.createIndex({ minorPrice: 1 })
    await products.createIndex({ minorPurchasePrice: 1 })
    log('  indexes minorPrice, minorPurchasePrice ensured')
  },
}
