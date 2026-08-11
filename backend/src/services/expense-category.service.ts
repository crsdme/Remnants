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

export async function create({ payload }: { payload: CreateExpenseCategoriesPayload }): Promise<CreateExpenseCategoryResponse> {
  const expenseCategory = await ExpenseCategoryRepo.createOne(payload)

  return {
    status: 'success',
    code: 'EXPENSE_CATEGORY_CREATED',
    message: 'Expense category created',
    data: mapExpenseCategoryToDTO(expenseCategory),
  }
}

export async function edit({ payload }: { payload: EditExpenseCategoriesPayload }): Promise<EditExpenseCategoryResponse> {
  const expenseCategory = await ExpenseCategoryRepo.updateById(payload.id, payload)

  if (!expenseCategory) {
    throw new HttpError(400, 'Expense category not edited', 'EXPENSE_CATEGORY_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'EXPENSE_CATEGORY_EDITED',
    message: 'Expense category edited',
    data: mapExpenseCategoryToDTO(expenseCategory),
  }
}

export async function remove({ payload }: { payload: RemoveExpenseCategoriesPayload }): Promise<RemoveExpenseCategoriesResponse> {
  const { ids } = payload

  for (const id of ids) {
    await ExpenseCategoryRepo.removeById(id)
  }

  return {
    status: 'success',
    code: 'EXPENSE_CATEGORIES_REMOVED',
    message: 'Expense categories removed',
  }
}
