import { parseResponse } from 'test/helpers/parse-response'
import {
  cancelMoneyTransactionResponseSchema,
  createCashregisterAccountResponseSchema,
  createCashregisterResponseSchema,
  createCurrencyResponseSchema,
  createMoneyTransactionResponseSchema,
  createMoneyTransactionTransferResponseSchema,
  getCashregistersResponseSchema,
  receiveMoneyTransactionResponseSchema,
} from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as CashregisterAccountFactory from '../factories/cashregister-account.factory'
import * as CashregisterFactory from '../factories/cashregister.factory'
import * as CurrencyFactory from '../factories/currency.factory'
import * as MoneyTransactionFactory from '../factories/money-transaction.factory'

describe('money transaction API', () => {
  afterEach(async () => {
    await MoneyTransactionFactory.removeAll()
    await CashregisterFactory.removeAll()
    await CashregisterAccountFactory.removeAll()
    await CurrencyFactory.removeAll()
  })

  describe('Create and receive transfer', () => {
    it('holds incoming funds until receive', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'Hryvnia', ru: 'Гривна' },
        symbols: { en: 'UAH', ru: 'грн' },
        scale: 2,
        paymentEpsilon: 0.01,
        priority: 1,
        active: true,
      })
      const currency = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const accountFromResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash from', ru: 'Касса откуда' },
        priority: 1,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountFrom = parseResponse(createCashregisterAccountResponseSchema, accountFromResponse)

      const accountToResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash to', ru: 'Касса куда' },
        priority: 2,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountTo = parseResponse(createCashregisterAccountResponseSchema, accountToResponse)

      const cashregisterFromResponse = await CashregisterFactory.create({
        names: { en: 'Register A', ru: 'Касса A' },
        priority: 1,
        accountIds: [accountFrom.data.id],
        active: true,
      })
      const cashregisterFrom = parseResponse(createCashregisterResponseSchema, cashregisterFromResponse)

      const cashregisterToResponse = await CashregisterFactory.create({
        names: { en: 'Register B', ru: 'Касса B' },
        priority: 2,
        accountIds: [accountTo.data.id],
        active: true,
      })
      const cashregisterTo = parseResponse(createCashregisterResponseSchema, cashregisterToResponse)

      const transferResponse = await MoneyTransactionFactory.createTransfer({
        type: 'transfer-cashregister',
        accountFrom: accountFrom.data.id,
        accountTo: accountTo.data.id,
        cashregisterFrom: cashregisterFrom.data.id,
        cashregisterTo: cashregisterTo.data.id,
        currencyId: currency.data.id,
        amount: 100,
        sourceModel: 'manual',
      })
      const transfer = parseResponse(createMoneyTransactionTransferResponseSchema, transferResponse)

      expect(transfer.data.transferOut.confirmed).toBe(true)
      expect(transfer.data.transferOut.role).toBe('from')
      expect(transfer.data.transferIn.confirmed).toBe(false)
      expect(transfer.data.transferIn.role).toBe('to')
      expect(transfer.data.transferIn.transferId).toBe(transfer.data.transferOut.transferId)

      const receivedResponse = await MoneyTransactionFactory.receive({
        transferId: transfer.data.transferIn.transferId!,
      })
      const received = parseResponse(receiveMoneyTransactionResponseSchema, receivedResponse)

      expect(received.data.confirmed).toBe(true)
      expect(received.data.id).toBe(transfer.data.transferIn.id)

      const alreadyReceived = await MoneyTransactionFactory.receive({
        transferId: transfer.data.transferIn.transferId!,
      }) as { error?: { code?: string } }

      expect(alreadyReceived.error?.code).toBe('MONEY_TRANSACTION_ALREADY_RECEIVED')
    })

    it('confirms both legs when receiving is not required', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'Hryvnia', ru: 'Гривна' },
        symbols: { en: 'UAH', ru: 'грн' },
        scale: 2,
        paymentEpsilon: 0.01,
        priority: 1,
        active: true,
      })
      const currency = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const accountFromResponse = await CashregisterAccountFactory.create({
        names: { en: 'Card', ru: 'Карта' },
        priority: 1,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountFrom = parseResponse(createCashregisterAccountResponseSchema, accountFromResponse)

      const accountToResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash', ru: 'Наличные' },
        priority: 2,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountTo = parseResponse(createCashregisterAccountResponseSchema, accountToResponse)

      const cashregisterResponse = await CashregisterFactory.create({
        names: { en: 'Main', ru: 'Основная' },
        priority: 1,
        accountIds: [accountFrom.data.id, accountTo.data.id],
        active: true,
      })
      const cashregister = parseResponse(createCashregisterResponseSchema, cashregisterResponse)

      const transferResponse = await MoneyTransactionFactory.createTransfer({
        type: 'transfer-account',
        accountFrom: accountFrom.data.id,
        accountTo: accountTo.data.id,
        cashregisterFrom: cashregister.data.id,
        cashregisterTo: cashregister.data.id,
        currencyId: currency.data.id,
        amount: 50,
        sourceModel: 'manual',
      })
      const transfer = parseResponse(createMoneyTransactionTransferResponseSchema, transferResponse)

      expect(transfer.data.transferOut.confirmed).toBe(true)
      expect(transfer.data.transferIn.confirmed).toBe(true)
    })

    it('applies confirmed transfers to cashregister balances', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'Dollar', ru: 'Доллар' },
        symbols: { en: 'USD', ru: '$' },
        scale: 2,
        paymentEpsilon: 0.01,
        priority: 1,
        active: true,
      })
      const currency = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const accountFromResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash 1', ru: 'Касса 1' },
        priority: 1,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountFrom = parseResponse(createCashregisterAccountResponseSchema, accountFromResponse)

      const accountToResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash 2', ru: 'Касса 2' },
        priority: 2,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountTo = parseResponse(createCashregisterAccountResponseSchema, accountToResponse)

      const cashregisterFromResponse = await CashregisterFactory.create({
        names: { en: 'Cash Register 1', ru: 'Касса 1' },
        priority: 1,
        accountIds: [accountFrom.data.id],
        active: true,
      })
      const cashregisterFrom = parseResponse(createCashregisterResponseSchema, cashregisterFromResponse)

      const cashregisterToResponse = await CashregisterFactory.create({
        names: { en: 'Cash Register 2', ru: 'Касса 2' },
        priority: 2,
        accountIds: [accountTo.data.id],
        active: true,
      })
      const cashregisterTo = parseResponse(createCashregisterResponseSchema, cashregisterToResponse)

      parseResponse(createMoneyTransactionResponseSchema, await MoneyTransactionFactory.create({
        type: 'income',
        direction: 'in',
        accountId: accountFrom.data.id,
        cashregisterId: cashregisterFrom.data.id,
        currencyId: currency.data.id,
        amount: 123,
        sourceModel: 'manual',
      }))

      parseResponse(createMoneyTransactionTransferResponseSchema, await MoneyTransactionFactory.createTransfer({
        type: 'transfer-cashregister',
        accountFrom: accountFrom.data.id,
        accountTo: accountTo.data.id,
        cashregisterFrom: cashregisterFrom.data.id,
        cashregisterTo: cashregisterTo.data.id,
        currencyId: currency.data.id,
        amount: 123,
        sourceModel: 'manual',
        requiresReceiving: false,
      }))

      const listed = parseResponse(getCashregistersResponseSchema, await CashregisterFactory.get({
        pagination: { current: 1, pageSize: 10 },
      }))

      const balanceOf = (cashregisterId: string, accountId: string) => {
        const cashregister = listed.data.items.find(item => item.id === cashregisterId)
        const account = cashregister?.accounts.find(item => item.id === accountId)
        return account?.currencies.find(item => item.id === currency.data.id)?.balance
      }

      expect(balanceOf(cashregisterFrom.data.id, accountFrom.data.id)).toBe(0)
      expect(balanceOf(cashregisterTo.data.id, accountTo.data.id)).toBe(123)
    })

    it('stores account balance snapshots and restores them on cancel', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'Dollar', ru: 'Доллар' },
        symbols: { en: 'USD', ru: '$' },
        scale: 2,
        paymentEpsilon: 0.01,
        priority: 1,
        active: true,
      })
      const currency = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const accountFromResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash 1', ru: 'Касса 1' },
        priority: 1,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountFrom = parseResponse(createCashregisterAccountResponseSchema, accountFromResponse)

      const accountToResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash 2', ru: 'Касса 2' },
        priority: 2,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountTo = parseResponse(createCashregisterAccountResponseSchema, accountToResponse)

      const cashregisterFromResponse = await CashregisterFactory.create({
        names: { en: 'Cash Register 1', ru: 'Касса 1' },
        priority: 1,
        accountIds: [accountFrom.data.id],
        active: true,
      })
      const cashregisterFrom = parseResponse(createCashregisterResponseSchema, cashregisterFromResponse)

      const cashregisterToResponse = await CashregisterFactory.create({
        names: { en: 'Cash Register 2', ru: 'Касса 2' },
        priority: 2,
        accountIds: [accountTo.data.id],
        active: true,
      })
      const cashregisterTo = parseResponse(createCashregisterResponseSchema, cashregisterToResponse)

      const income = parseResponse(createMoneyTransactionResponseSchema, await MoneyTransactionFactory.create({
        type: 'income',
        direction: 'in',
        accountId: accountFrom.data.id,
        cashregisterId: cashregisterFrom.data.id,
        currencyId: currency.data.id,
        amount: 123,
        sourceModel: 'manual',
      }))

      expect(income.data.balanceBefore).toBe(0)
      expect(income.data.balanceAfter).toBe(123)

      const transfer = parseResponse(createMoneyTransactionTransferResponseSchema, await MoneyTransactionFactory.createTransfer({
        type: 'transfer-cashregister',
        accountFrom: accountFrom.data.id,
        accountTo: accountTo.data.id,
        cashregisterFrom: cashregisterFrom.data.id,
        cashregisterTo: cashregisterTo.data.id,
        currencyId: currency.data.id,
        amount: 123,
        sourceModel: 'manual',
        requiresReceiving: true,
      }))

      expect(transfer.data.transferOut.balanceBefore).toBe(123)
      expect(transfer.data.transferOut.balanceAfter).toBe(0)
      expect(transfer.data.transferOut.awaitingReceive).toBe(true)
      expect(transfer.data.transferIn.confirmed).toBe(false)
      expect(transfer.data.transferIn.balanceBefore).toBe(0)
      expect(transfer.data.transferIn.balanceAfter).toBe(0)
      expect(transfer.data.transferIn.awaitingReceive).toBe(true)

      const cancelled = parseResponse(cancelMoneyTransactionResponseSchema, await MoneyTransactionFactory.cancel({
        transferId: transfer.data.transferIn.transferId!,
      }))

      expect(cancelled.data.transferIn.cancelled).toBe(true)
      expect(cancelled.data.transferOut?.cancelled).toBe(true)
      expect(cancelled.data.transferIn.awaitingReceive).toBe(false)

      const listed = parseResponse(getCashregistersResponseSchema, await CashregisterFactory.get({
        pagination: { current: 1, pageSize: 10 },
      }))

      const balanceOf = (cashregisterId: string, accountId: string) => {
        const cashregister = listed.data.items.find(item => item.id === cashregisterId)
        const account = cashregister?.accounts.find(item => item.id === accountId)
        return account?.currencies.find(item => item.id === currency.data.id)?.balance
      }

      expect(balanceOf(cashregisterFrom.data.id, accountFrom.data.id)).toBe(123)
      expect(balanceOf(cashregisterTo.data.id, accountTo.data.id)).toBe(0)

      const alreadyCancelled = await MoneyTransactionFactory.cancel({
        transferId: transfer.data.transferIn.transferId!,
      }) as { error?: { code?: string } }

      expect(alreadyCancelled.error?.code).toBe('MONEY_TRANSACTION_ALREADY_CANCELLED')

      const receiveCancelled = await MoneyTransactionFactory.receive({
        transferId: transfer.data.transferIn.transferId!,
      }) as { error?: { code?: string } }

      expect(receiveCancelled.error?.code).toBe('MONEY_TRANSACTION_ALREADY_CANCELLED')
    })

    it('writes destination snapshot on receive', async () => {
      const currencyResponse = await CurrencyFactory.create({
        names: { en: 'Dollar', ru: 'Доллар' },
        symbols: { en: 'USD', ru: '$' },
        scale: 2,
        paymentEpsilon: 0.01,
        priority: 1,
        active: true,
      })
      const currency = parseResponse(createCurrencyResponseSchema, currencyResponse)

      const accountFromResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash 1', ru: 'Касса 1' },
        priority: 1,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountFrom = parseResponse(createCashregisterAccountResponseSchema, accountFromResponse)

      const accountToResponse = await CashregisterAccountFactory.create({
        names: { en: 'Cash 2', ru: 'Касса 2' },
        priority: 2,
        currencyIds: [currency.data.id],
        active: true,
      })
      const accountTo = parseResponse(createCashregisterAccountResponseSchema, accountToResponse)

      const cashregisterFromResponse = await CashregisterFactory.create({
        names: { en: 'Cash Register 1', ru: 'Касса 1' },
        priority: 1,
        accountIds: [accountFrom.data.id],
        active: true,
      })
      const cashregisterFrom = parseResponse(createCashregisterResponseSchema, cashregisterFromResponse)

      const cashregisterToResponse = await CashregisterFactory.create({
        names: { en: 'Cash Register 2', ru: 'Касса 2' },
        priority: 2,
        accountIds: [accountTo.data.id],
        active: true,
      })
      const cashregisterTo = parseResponse(createCashregisterResponseSchema, cashregisterToResponse)

      parseResponse(createMoneyTransactionResponseSchema, await MoneyTransactionFactory.create({
        type: 'income',
        direction: 'in',
        accountId: accountFrom.data.id,
        cashregisterId: cashregisterFrom.data.id,
        currencyId: currency.data.id,
        amount: 50,
        sourceModel: 'manual',
      }))

      const transfer = parseResponse(createMoneyTransactionTransferResponseSchema, await MoneyTransactionFactory.createTransfer({
        type: 'transfer-cashregister',
        accountFrom: accountFrom.data.id,
        accountTo: accountTo.data.id,
        cashregisterFrom: cashregisterFrom.data.id,
        cashregisterTo: cashregisterTo.data.id,
        currencyId: currency.data.id,
        amount: 50,
        sourceModel: 'manual',
        requiresReceiving: true,
      }))

      const received = parseResponse(receiveMoneyTransactionResponseSchema, await MoneyTransactionFactory.receive({
        transferId: transfer.data.transferIn.transferId!,
      }))

      expect(received.data.confirmed).toBe(true)
      expect(received.data.balanceBefore).toBe(0)
      expect(received.data.balanceAfter).toBe(50)
      expect(received.data.awaitingReceive).toBe(false)

      const cancelReceived = await MoneyTransactionFactory.cancel({
        transferId: transfer.data.transferIn.transferId!,
      }) as { error?: { code?: string } }

      expect(cancelReceived.error?.code).toBe('MONEY_TRANSACTION_ALREADY_RECEIVED')
    })
  })
})
