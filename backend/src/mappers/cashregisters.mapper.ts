import type { CashregisterDTO } from '@remnant/shared'
import type { CashregisterDB } from '@/types'

export function mapCashregisterToDTO(cashregister: CashregisterDB): CashregisterDTO {
  return {
    id: cashregister._id,
    names: cashregister.names,
    priority: cashregister.priority,
    accounts: cashregister.accounts.map(account => ({
      id: account._id,
      seq: account.seq,
      names: account.names,
      currencies: account.currencies,
      priority: account.priority,
      active: account.active,
    })),
    active: cashregister.active,
    createdAt: cashregister.createdAt,
    updatedAt: cashregister.updatedAt,
  }
}
