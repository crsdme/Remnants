import { parseResponse } from 'test/helpers/parse-response'
import { createCashregisterAccountResponseSchema, createCashregisterResponseSchema, createCurrencyResponseSchema, createExpenseCategoryResponseSchema, createExpenseResponseSchema, getExpensesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as CashregisterAccountFactory from '../factories/cashregister-account.factory'
import * as CashregisterFactory from '../factories/cashregister.factory'
import * as CurrencyFactory from '../factories/currency.factory'
import * as ExpenseCategoryFactory from '../factories/expense-category.factory'
import * as ExpenseFactory from '../factories/expense.factory'

describe('exprense API', () => {
  afterEach(async () => {
    await ExpenseFactory.removeAll()
  })

  describe('Get Exprense', () => {
    it('Schema validation', async () => {
      // const currencyResponse = await CurrencyFactory.create({
      //   names: { en: 'Dollar', ru: 'Доллар' },
      //   symbols: { en: 'USD', ru: 'USD' },
      //   scale: 2,
      //   priority: 1,
      //   active: true,
      // })
      // const currencyResponseParsed = parseResponse(createCurrencyResponseSchema, currencyResponse)

      // const cashregisterAccountResponse = await CashregisterAccountFactory.create({
      //   names: { en: 'Cashregister Account 1', ru: 'Cashregister Account 1' },
      //   priority: 1,
      //   currencies: [currencyResponseParsed.data.id],
      //   active: true,
      // })
      // const cashregisterAccountResponseParsed = parseResponse(createCashregisterAccountResponseSchema, cashregisterAccountResponse)

      // const cashregisterResponse = await CashregisterFactory.create({
      //   names: { en: 'Cashregister 1', ru: 'Cashregister 1' },
      //   priority: 1,
      //   accounts: [cashregisterAccountResponseParsed.data.id],
      //   active: true,
      // })
      // const cashregisterResponseParsed = parseResponse(createCashregisterResponseSchema, cashregisterResponse)

      // const expenseCategoryResponse = await ExpenseCategoryFactory.create({
      //   names: { en: 'Expense Category 1', ru: 'Expense Category 1' },
      //   color: '#000000',
      //   priority: 1,
      //   comment: 'This is a test comment',
      // })
      // const expenseCategoryResponseParsed = parseResponse(createExpenseCategoryResponseSchema, expenseCategoryResponse)

      // const expenseResponse = await ExpenseFactory.create({
      //   amount: 100,
      //   currency: currencyResponseParsed.data.id,
      //   cashregister: cashregisterResponseParsed.data.id,
      //   cashregisterAccount: cashregisterAccountResponseParsed.data.id,
      //   categories: [expenseCategoryResponseParsed.data.id],
      //   type: 'manual',
      //   comment: 'This is a test comment',
      // })
      // const expenseResponseParsed = parseResponse(createExpenseResponseSchema, expenseResponse)

      // const response = await ExpenseFactory.get()
      // const parsed = parseResponse(getExpensesResponseSchema, response)

      // expect(parsed.data.items.length).toBeGreaterThan(0)
      // expect(parsed.data.pagination.total).toBeGreaterThan(0)

      // const found = parsed.data.items.find(item => item.id === expenseResponseParsed.data.id)

      // expect(found).toBeDefined()
      // expect(found).toMatchObject({
      //   id: expenseResponseParsed.data.id,
      //   amount: 100,
      //   currency: currencyResponseParsed.data.id,
      //   cashregister: cashregisterResponseParsed.data.id,
      //   cashregisterAccount: cashregisterAccountResponseParsed.data.id,
      //   categories: [expenseCategoryResponseParsed.data.id],
      //   type: 'manual',
      //   comment: 'This is a test comment',
      // })
    })
  })
})
