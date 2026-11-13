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
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { STORAGE_PATHS } from '@/config/constants'
import { mapExpenseToDTO } from '@/mappers'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as ExpenseRepo from '@/repositories/expense.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import * as MoneyTransactionService from '@/services/money-transaction.service'
import {
  getAccountIdsWithCapabilityForUser,
  getEntityIdsWithCapabilityForUser,
  getScopeIdsForUser,
  HttpError,
  withTransaction,
} from '@/utils/'
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
    cashregisterIds: getEntityIdsWithCapabilityForUser(access, 'cashregisters', 'viewExpenses', user),
    cashregisterAccountIds: getAccountIdsWithCapabilityForUser(access, 'viewExpenses', user),
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
  user,
}: {
  payload: CreateExpensePayload
  uploadedFiles?: Express.Multer.File[]
  user?: AuthUser
}): Promise<CreateExpenseResponse> {
  const currency = await CurrencyRepo.findOne({ _id: payload.currency })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const resolvedFiles = resolveExpenseFiles({
    files: payload.files ?? [],
    uploadedFilesIds: payload.uploadedFilesIds,
    uploadedFiles,
  })

  const expense = await withTransaction(async (session) => {
    const created = await ExpenseRepo.createOne({
      minorAmount: toMinor(payload.amount, currency.scale),
      currencyId: payload.currency,
      cashregisterId: payload.cashregister,
      cashregisterAccountId: payload.cashregisterAccount,
      categoryIds: payload.categories,
      sourceModel: 'manual',
      type: payload.type,
      comment: payload.comment,
      files: resolvedFiles,
    }, session)

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'expense',
        direction: 'out',
        accountId: payload.cashregisterAccount,
        cashregisterId: payload.cashregister,
        sourceModel: 'expense',
        sourceId: created._id.toString(),
        currencyId: payload.currency,
        amount: payload.amount,
        description: `Expense ${created._id.toString()}`,
      },
      session,
    })

    return created
  })

  await AuditLogsService.record({
    resourceType: 'expense',
    resourceId: expense._id.toString(),
    action: 'create',
    before: null,
    after: expense,
    createdBy: user?.id,
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
  user,
}: {
  payload: EditExpensePayload
  uploadedFiles?: Express.Multer.File[]
  user?: AuthUser
}): Promise<EditExpenseResponse> {
  const { id } = payload

  const resolvedFiles = resolveExpenseFiles({
    files: payload.files ?? [],
    uploadedFilesIds: payload.uploadedFilesIds,
    uploadedFiles,
  })

  const edited = await withTransaction(async (session) => {
    const oldExpense = await ExpenseRepo.findById(id, session)

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
      session,
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
      session,
    })

    const updated = await ExpenseRepo.updateById(id, {
      minorAmount: toMinor(payload.amount, currency.scale),
      currencyId: payload.currency,
      cashregisterId: payload.cashregister,
      cashregisterAccountId: payload.cashregisterAccount,
      categoryIds: payload.categories,
      type: payload.type,
      comment: payload.comment,
      files: resolvedFiles,
    }, session)

    return { before: oldExpense, after: updated }
  })

  await AuditLogsService.record({
    resourceType: 'expense',
    resourceId: id,
    action: 'edit',
    before: edited.before,
    after: edited.after,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'EXPENSE_EDITED',
    message: 'Expense edited',
  }
}

export async function remove({ payload, user }: { payload: RemoveExpensesPayload, user?: AuthUser }): Promise<RemoveExpensesResponse> {
  for (const id of payload.ids) {
    const expense = await withTransaction(async (session) => {
      const current = await ExpenseRepo.findById(id, session)

      if (current === null)
        throw new HttpError(400, 'Expense not removed', 'EXPENSE_NOT_REMOVED')

      const currency = await CurrencyRepo.findOne({ _id: current.currencyId })

      if (currency === null)
        throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

      await ExpenseRepo.removeById(id, session)

      await MoneyTransactionService.createTransaction({
        payload: {
          type: 'expense',
          direction: 'in',
          accountId: current.cashregisterAccountId,
          cashregisterId: current.cashregisterId,
          sourceModel: 'expense',
          sourceId: current._id.toString(),
          currencyId: current.currencyId,
          amount: Number.parseFloat(fromMinor(current.minorAmount, currency.scale)),
          description: `Expense removed ${current._id.toString()}`,
        },
        session,
      })

      return current
    })

    await AuditLogsService.record({
      resourceType: 'expense',
      resourceId: id,
      action: 'remove',
      before: expense,
      after: null,
      createdBy: user?.id,
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

    if (file.filename === undefined || file.filename === null)
      return undefined

    return {
      path: path.join(STORAGE_PATHS.expenseFiles, file.filename),
      filename: file.filename,
      name: file.name,
      type: file.type,
    }
  }).filter(item => item !== undefined)
}
