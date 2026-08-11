import type { ExpensePopulatedDTO } from '@remnant/shared'
import type { ExpenseDBPopulated } from '@/types'
import path from 'node:path'
import { STORAGE_URLS } from '@/config/constants'
import { fromMinor } from '@/utils/'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function toOptionalUuid(value?: string) {
  if (value === undefined || value === null || !UUID_RE.test(value))
    return undefined
  return value
}

export function mapExpenseToDTO(expense: ExpenseDBPopulated): ExpensePopulatedDTO {
  return {
    id: expense.id,
    seq: expense.seq,
    amount: Number.parseFloat(fromMinor(expense.minorAmount, expense.currency.scale)),
    currency: {
      id: expense.currency.id,
      names: expense.currency.names,
      symbols: expense.currency.symbols,
      scale: expense.currency.scale,
    },
    cashregister: {
      id: expense.cashregister.id,
      names: expense.cashregister.names,
    },
    cashregisterAccount: {
      id: expense.cashregisterAccount.id,
      names: expense.cashregisterAccount.names,
    },
    categories: expense.categories.map(category => ({
      id: category.id,
      names: category.names,
    })),
    sourceModel: expense.sourceModel,
    sourceId: toOptionalUuid(expense.sourceId),
    type: expense.type,
    comment: expense.comment,
    files: (expense.files ?? []).map(file => ({
      id: path.parse(file.filename).name,
      path: `${STORAGE_URLS.expenseFiles}/${file.filename}`,
      filename: file.filename,
      name: file.name,
      type: file.type,
    })),
    createdBy: toOptionalUuid(expense.createdBy),
    removedBy: toOptionalUuid(expense.removedBy),
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }
}
