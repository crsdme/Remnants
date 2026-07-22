import type {
  AuthUser,
  CreateExpenseResponse,
  EditExpenseResponse,
  GetExpensesResponse,
  RemoveExpensesResponse,
} from '@remnant/shared'
import type {
  CreateExpensePayload,
  EditExpensePayload,
  GetExpensesPayload,
  RemoveExpensesPayload,
} from '@/types'
import { mapExpenseToDTO } from '@/mappers'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as ExpenseRepo from '@/repositories/expense.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as MoneyTransactionService from '@/services/money-transaction.service'
import { getScopeIdsForUser, HttpError } from '@/utils/'
import { fromMinor, toMinor } from '@/utils/money'

export async function get({
  payload,
  user,
}: {
  payload: GetExpensesPayload
  user: AuthUser
}): Promise<GetExpensesResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)

  const { items, total, page, pageSize } = await ExpenseRepo.list(payload, {
    categoryIds: getScopeIdsForUser(access, 'expenseCategories', user),
    cashregisterIds: getScopeIdsForUser(access, 'cashregisters', user),
    cashregisterAccountIds: getScopeIdsForUser(access, 'cashregisterAccounts', user),
  })

  return {
    status: 'success',
    code: 'EXPENSES_FETCHED',
    message: 'Expenses fetched',
    data: {
      items: items.map(mapExpenseToDTO),
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateExpensePayload }): Promise<CreateExpenseResponse> {
  const currency = await CurrencyRepo.findOne({ _id: payload.currency })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const expense = await ExpenseRepo.createOne({
    minorAmount: toMinor(payload.amount, currency.scale),
    currencyId: payload.currency,
    cashregisterId: payload.cashregister,
    cashregisterAccountId: payload.cashregisterAccount,
    categoryIds: payload.categories,
    sourceModel: 'expense',
    sourceId: '123',
    type: payload.type,
    comment: payload.comment,
    // createdBy: payload.createdBy,
  })

  await MoneyTransactionService.createTransaction({
    payload: {
      type: 'expense',
      direction: 'out',
      accountId: payload.cashregisterAccount,
      cashregisterId: payload.cashregister,
      sourceModel: 'expense',
      sourceId: expense._id.toString(),
      currencyId: payload.currency,
      amount: payload.amount,
      description: `Expense ${expense._id.toString()}`,
    },
  })

  return {
    status: 'success',
    code: 'EXPENSE_CREATED',
    message: 'Expense created',
  }
}

export async function edit({ payload }: { payload: EditExpensePayload }): Promise<EditExpenseResponse> {
  const { id } = payload

  const oldExpense = await ExpenseRepo.findById(id)

  if (oldExpense === null)
    throw new HttpError(400, 'Expense not edited', 'EXPENSE_NOT_EDITED')

  const currency = await CurrencyRepo.findOne({ _id: payload.currency })

  const oldCurrency = await CurrencyRepo.findOne({ _id: oldExpense.currencyId })

  if (currency === null || oldCurrency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  await MoneyTransactionService.createTransaction({
    payload: {
      type: 'expense',
      direction: 'in',
      accountId: oldExpense.cashregisterAccountId,
      cashregisterId: oldExpense.cashregisterId,
      sourceModel: 'expense',
      sourceId: id,
      currencyId: oldExpense.currencyId,
      amount: Number.parseFloat(fromMinor(oldExpense.minorAmount, oldCurrency.scale)),
      description: `Expense edited ${id}`,
    },
  })

  await MoneyTransactionService.createTransaction({
    payload: {
      type: 'expense',
      direction: 'out',
      accountId: payload.cashregisterAccount,
      cashregisterId: payload.cashregister,
      sourceModel: 'expense',
      sourceId: id,
      currencyId: payload.currency,
      amount: payload.amount,
      description: `Expense ${id}`,
    },
  })

  return {
    status: 'success',
    code: 'EXPENSE_EDITED',
    message: 'Expense edited',
  }
}

export async function remove({ payload }: { payload: RemoveExpensesPayload }): Promise<RemoveExpensesResponse> {
  const { ids } = payload

  for (const id of ids) {
    const expense = await ExpenseRepo.findById(id)
    await ExpenseRepo.removeById(id)

    if (expense === null)
      throw new HttpError(400, 'Expense not removed', 'EXPENSE_NOT_REMOVED')

    const currency = await CurrencyRepo.findOne({ _id: expense.currencyId })

    if (currency === null)
      throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'expense',
        direction: 'in',
        accountId: expense.cashregisterAccountId,
        cashregisterId: expense.cashregisterId,
        sourceModel: 'expense',
        sourceId: expense._id.toString(),
        currencyId: expense.currencyId,
        amount: Number.parseFloat(fromMinor(expense.minorAmount, currency.scale)),
        description: `Expense removed ${expense._id.toString()}`,
      },
    })
  }

  return {
    status: 'success',
    code: 'EXPENSES_REMOVED',
    message: 'Expenses removed',
  }
}
