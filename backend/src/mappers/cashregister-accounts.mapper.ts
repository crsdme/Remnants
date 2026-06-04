import type { CashregisterAccountDTO } from '@remnant/shared'
import type { CashregisterAccountDB } from '@/types'

export function mapCashregisterAccountToDTO(cashregisterAccount: CashregisterAccountDB): CashregisterAccountDTO {
  return {
    id: cashregisterAccount._id,
    names: cashregisterAccount.names,
    currencies: cashregisterAccount.currencies,
    priority: cashregisterAccount.priority,
    active: cashregisterAccount.active,
    createdAt: cashregisterAccount.createdAt,
    updatedAt: cashregisterAccount.updatedAt,
  }
}
