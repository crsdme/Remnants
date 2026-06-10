import type {
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
import { ExpenseModel } from '@/models/'
import * as ExpenseRepo from '@/repositories/expense.repo'
import * as MoneyTransactionService from '@/services/money-transaction.service'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetExpensesPayload }): Promise<GetExpensesResponse> {
  const { items, total, page, pageSize } = await ExpenseRepo.list(payload)

  return {
    status: 'success',
    code: 'EXPENSES_FETCHED',
    message: 'Expenses fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateExpensePayload }): Promise<CreateExpenseResponse> {
  const expense = await ExpenseRepo.createOne(payload)

  await MoneyTransactionService.createTransaction({
    payload: {
      type: 'expense',
      direction: 'out',
      account: payload.cashregisterAccount,
      cashregister: payload.cashregister,
      sourceModel: 'expense',
      sourceId: expense._id.toString(),
      currency: payload.currency,
      amount: payload.amount,
      description: `Expense ${expense.id}`,
    },
  })

  return {
    status: 'success',
    code: 'EXPENSE_CREATED',
    message: 'Expense created',
    data: mapExpenseToDTO(expense),
  }
}

export async function edit({ payload }: { payload: EditExpensePayload }): Promise<EditExpenseResponse> {
  const { id } = payload

  const oldExpense = await ExpenseRepo.findById(id)

  const expense = await ExpenseRepo.updateById(id, payload)

  if (!expense || !oldExpense) {
    throw new HttpError(400, 'Expense not edited', 'EXPENSE_NOT_EDITED')
  }

  await MoneyTransactionService.createTransaction({
    payload: {
      type: 'expense',
      direction: 'in',
      account: oldExpense.cashregisterAccount,
      cashregister: oldExpense.cashregister,
      sourceModel: 'expense',
      sourceId: id,
      currency: oldExpense.currency,
      amount: oldExpense.amount,
      description: `Expense edited ${id}`,
    },
  })

  await MoneyTransactionService.createTransaction({
    payload: {
      type: 'expense',
      direction: 'out',
      account: payload.cashregisterAccount,
      cashregister: payload.cashregister,
      sourceModel: 'expense',
      sourceId: id,
      currency: payload.currency,
      amount: payload.amount,
      description: `Expense ${id}`,
    },
  })

  return {
    status: 'success',
    code: 'EXPENSE_EDITED',
    message: 'Expense edited',
    data: mapExpenseToDTO(expense),
  }
}

export async function remove({ payload }: { payload: RemoveExpensesPayload }): Promise<RemoveExpensesResponse> {
  const { ids } = payload

  await ExpenseModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  for (const id of ids) {
    const expense = await ExpenseModel.findById(id)

    if (!expense) {
      throw new HttpError(400, 'Expense not removed', 'EXPENSE_NOT_REMOVED')
    }

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'expense',
        direction: 'in',
        account: expense.cashregisterAccount,
        cashregister: expense.cashregister,
        sourceModel: 'expense',
        sourceId: expense._id.toString(),
        currency: expense.currency,
        amount: expense.amount,
        description: `Expense removed ${expense.id}`,
      },
    })
  }

  return {
    status: 'success',
    code: 'EXPENSES_REMOVED',
    message: 'Expenses removed',
  }
}
