import type { Migration } from '../types'
import { convertMoneyFields, loadCurrencyScales, renameFields } from '../helpers'

/** Order payments + money transactions: money → minor* and FK renames. */
export const migration004PaymentsAndMoneyTransactions: Migration = {
  id: '004',
  name: 'payments_and_money_transactions',
  async up({ db, log }) {
    const payments = db.collection('order-payments')
    const txs = db.collection('money-transactions')
    const rates = db.collection('exchange-rates')
    const scales = await loadCurrencyScales(db)

    await convertMoneyFields(payments, scales, [
      { from: 'amount', to: 'minorAmount', currencyFrom: 'currency', currencyTo: 'currencyId' },
    ], log)

    await renameFields(payments, {
      order: 'orderId',
      cashregister: 'cashregisterId',
      cashregisterAccount: 'cashregisterAccountId',
      currency: 'currencyId',
      transaction: 'transactionId',
    }, log)

    await convertMoneyFields(txs, scales, [
      { from: 'amount', to: 'minorAmount', currencyFrom: 'currency', currencyTo: 'currencyId' },
    ], log)

    await renameFields(txs, {
      account: 'accountId',
      cashregister: 'cashregisterId',
      currency: 'currencyId',
    }, log)

    await renameFields(rates, {
      fromCurrency: 'fromCurrencyId',
      toCurrency: 'toCurrencyId',
    }, log)
  },
}
