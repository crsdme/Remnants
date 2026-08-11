import type { Migration } from '../types'
import { convertMoneyFields, loadCurrencyScales, renameFields } from '../helpers'

/** Orders + order-items: FK renames and money → minor*. */
export const migration003OrdersAndItems: Migration = {
  id: '003',
  name: 'orders_and_items',
  async up({ db, log }) {
    const orders = db.collection('orders')
    const items = db.collection('order-items')
    const scales = await loadCurrencyScales(db)

    await renameFields(orders, {
      warehouse: 'warehouseId',
      deliveryService: 'deliveryServiceId',
      orderSource: 'orderSourceId',
      orderStatus: 'orderStatusId',
      orderPayments: 'orderPaymentIds',
      client: 'clientId',
    }, log)

    await convertMoneyFields(items, scales, [
      { from: 'manualPrice', to: 'minorManualPrice', currencyFrom: 'currency', currencyTo: 'currencyId' },
      { from: 'basePrice', to: 'minorBasePrice', currencyFrom: 'currency', currencyTo: 'currencyId' },
      { from: 'price', to: 'minorPrice', currencyFrom: 'currency', currencyTo: 'currencyId' },
      { from: 'profit', to: 'minorProfit', currencyFrom: 'currency', currencyTo: 'currencyId' },
      { from: 'discountAmount', to: 'minorDiscountAmount', currencyFrom: 'currency', currencyTo: 'currencyId' },
      { from: 'purchasePrice', to: 'minorPurchasePrice', currencyFrom: 'purchaseCurrency', currencyTo: 'purchaseCurrencyId' },
    ], log)

    await renameFields(items, {
      order: 'orderId',
      product: 'productId',
      currency: 'currencyId',
      purchaseCurrency: 'purchaseCurrencyId',
    }, log)
  },
}
