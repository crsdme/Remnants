import type { CashregisterAccountDTO, CashregisterAccountPopulatedDTO } from '@remnant/shared'
import type { CashregisterAccountDB } from '@/types'

export function mapCashregisterAccountToDTO(cashregisterAccount: CashregisterAccountDB): CashregisterAccountDTO {
  return {
    id: cashregisterAccount._id,
    names: cashregisterAccount.names,
    seq: cashregisterAccount.seq,
    currencies: cashregisterAccount.currencies,
    priority: cashregisterAccount.priority,
    active: cashregisterAccount.active,
    createdAt: cashregisterAccount.createdAt,
    updatedAt: cashregisterAccount.updatedAt,
  }
}

export function mapCashregisterAccountToPopulatedDTO(cashregisterAccount: CashregisterAccountDB): CashregisterAccountPopulatedDTO {
  return {
    id: cashregisterAccount._id,
    names: cashregisterAccount.names,
    seq: cashregisterAccount.seq,
    currencies: cashregisterAccount.currencies.map(currency => ({
      id: currency._id,
      names: currency.names,
      symbols: currency.symbols,
    })),
    priority: cashregisterAccount.priority,
    active: cashregisterAccount.active,
    createdAt: cashregisterAccount.createdAt,
    updatedAt: cashregisterAccount.updatedAt,
  }
}
