import type {
  AuthUser,
  CreateExpenseCategoryResponse,
  EditExpenseCategoryResponse,
  GetExpenseCategoriesResponse,
  RemoveExpenseCategoriesResponse,
} from '@remnant/shared'
import type {
  CreateExpenseCategoriesPayload,
  EditExpenseCategoriesPayload,
  GetExpenseCategoriesPayload,
  RemoveExpenseCategoriesPayload,
} from '@/types/expense-category.type'
import { mapExpenseCategoryToDTO } from '@/mappers'
import * as ExpenseCategoryRepo from '@/repositories/expense-category.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { getScopeIdsForUser, HttpError } from '@/utils/'

export async function get({
  payload,
  user,
}: {
  payload: GetExpenseCategoriesPayload
  user: AuthUser
}): Promise<GetExpenseCategoriesResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getScopeIdsForUser(access, 'expenseCategoryIds', user)

  const { items, total, page, pageSize } = await ExpenseCategoryRepo.list(payload, { scopeIds })

  return {
    status: 'success',
    code: 'EXPENSE_CATEGORIES_FETCHED',
    message: 'Expense categories fetched',
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

export async function create({ payload, user }: { payload: CreateExpenseCategoriesPayload, user?: AuthUser }): Promise<CreateExpenseCategoryResponse> {
  const expenseCategory = await ExpenseCategoryRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'expense-category',
    resourceId: expenseCategory._id.toString(),
    action: 'create',
    before: null,
    after: expenseCategory,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'EXPENSE_CATEGORY_CREATED',
    message: 'Expense category created',
    data: mapExpenseCategoryToDTO(expenseCategory),
  }
}

export async function edit({ payload, user }: { payload: EditExpenseCategoriesPayload, user?: AuthUser }): Promise<EditExpenseCategoryResponse> {
  const before = await ExpenseCategoryRepo.findById(payload.id)
  const expenseCategory = await ExpenseCategoryRepo.updateById(payload.id, payload)

  if (!expenseCategory) {
    throw new HttpError(400, 'Expense category not edited', 'EXPENSE_CATEGORY_NOT_EDITED')
  }

  await AuditLogsService.record({
    resourceType: 'expense-category',
    resourceId: expenseCategory._id.toString(),
    action: 'edit',
    before,
    after: expenseCategory,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'EXPENSE_CATEGORY_EDITED',
    message: 'Expense category edited',
    data: mapExpenseCategoryToDTO(expenseCategory),
  }
}

export async function remove({ payload, user }: { payload: RemoveExpenseCategoriesPayload, user?: AuthUser }): Promise<RemoveExpenseCategoriesResponse> {
  const { ids } = payload

  for (const id of ids) {
    const expenseCategory = await ExpenseCategoryRepo.removeById(id)
    if (!expenseCategory)
      continue

    await AuditLogsService.record({
      resourceType: 'expense-category',
      resourceId: id,
      action: 'remove',
      before: expenseCategory,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'EXPENSE_CATEGORIES_REMOVED',
    message: 'Expense categories removed',
  }
}
