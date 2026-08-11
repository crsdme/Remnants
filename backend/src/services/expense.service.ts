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
import path from 'node:path'
import { STORAGE_PATHS } from '@/config/constants'
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
    categoryIds: getScopeIdsForUser(access, 'expenseCategoryIds', user),
    cashregisterIds: getScopeIdsForUser(access, 'cashregisterIds', user),
    cashregisterAccountIds: getScopeIdsForUser(access, 'cashregisterAccountIds', user),
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

export async function create({
  payload,
  uploadedFiles = [],
}: {
  payload: CreateExpensePayload
  uploadedFiles?: Express.Multer.File[]
}): Promise<CreateExpenseResponse> {
  const currency = await CurrencyRepo.findOne({ _id: payload.currency })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const resolvedFiles = resolveExpenseFiles({
    files: payload.files ?? [],
    uploadedFilesIds: payload.uploadedFilesIds,
    uploadedFiles,
  })

  const expense = await ExpenseRepo.createOne({
    minorAmount: toMinor(payload.amount, currency.scale),
    currencyId: payload.currency,
    cashregisterId: payload.cashregister,
    cashregisterAccountId: payload.cashregisterAccount,
    categoryIds: payload.categories,
    sourceModel: 'manual',
    type: payload.type,
    comment: payload.comment,
    files: resolvedFiles,
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

export async function edit({
  payload,
  uploadedFiles = [],
}: {
  payload: EditExpensePayload
  uploadedFiles?: Express.Multer.File[]
}): Promise<EditExpenseResponse> {
  const { id } = payload

  const oldExpense = await ExpenseRepo.findById(id)

  if (oldExpense === null)
    throw new HttpError(400, 'Expense not edited', 'EXPENSE_NOT_EDITED')

  const currency = await CurrencyRepo.findOne({ _id: payload.currency })

  const oldCurrency = await CurrencyRepo.findOne({ _id: oldExpense.currencyId })

  if (currency === null || oldCurrency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const resolvedFiles = resolveExpenseFiles({
    files: payload.files ?? [],
    uploadedFilesIds: payload.uploadedFilesIds,
    uploadedFiles,
  })

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

  await ExpenseRepo.updateById(id, {
    minorAmount: toMinor(payload.amount, currency.scale),
    currencyId: payload.currency,
    cashregisterId: payload.cashregister,
    cashregisterAccountId: payload.cashregisterAccount,
    categoryIds: payload.categories,
    type: payload.type,
    comment: payload.comment,
    files: resolvedFiles,
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

function resolveExpenseFiles({
  files,
  uploadedFilesIds,
  uploadedFiles,
}: {
  files: Array<{
    id?: string
    filename?: string
    name: string
    type: string
    path?: string
    isNew?: boolean
  }>
  uploadedFilesIds?: string[]
  uploadedFiles: Express.Multer.File[]
}) {
  const parsedUploadedFiles = (uploadedFilesIds ?? []).map((fileId, index) => {
    if (uploadedFiles[index] === undefined)
      return undefined

    return {
      id: fileId,
      path: uploadedFiles[index].path,
      filename: uploadedFiles[index].filename,
      name: Buffer.from(uploadedFiles[index].originalname, 'latin1').toString('utf8').slice(0, 80),
      type: uploadedFiles[index].mimetype,
    }
  }).filter(item => item !== undefined)

  return files.map((file) => {
    if (file.isNew) {
      const uploaded = parsedUploadedFiles.find(item => item.id === file.id)
      if (!uploaded)
        return undefined

      return {
        path: uploaded.path,
        filename: uploaded.filename,
        name: uploaded.name,
        type: uploaded.type,
      }
    }

    if (!file.filename)
      return undefined

    return {
      path: path.join(STORAGE_PATHS.expenseFiles, file.filename),
      filename: file.filename,
      name: file.name,
      type: file.type,
    }
  }).filter(item => item !== undefined)
}
