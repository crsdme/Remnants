import type { CashregisterDTO, CashregisterPopulatedDTO } from '@remnant/shared'
import type { CashregisterDB, CashregisterDBPopulated } from '@/types'

export function mapCashregisterToPopulatedDTO(cashregister: CashregisterDBPopulated): CashregisterPopulatedDTO {
  return {
    id: cashregister._id,
    names: cashregister.names,
    priority: cashregister.priority,
    accounts: cashregister.accounts.map(account => ({
      id: account._id,
      seq: account.seq,
      names: account.names,
      currencies: account.currencies.map(currency => ({
        id: currency._id,
        names: currency.names,
        symbols: currency.symbols,
        scale: currency.scale,
        balance: 0,
      })),
      priority: account.priority,
      active: account.active,
    })),
    active: cashregister.active,
    createdAt: cashregister.createdAt,
    updatedAt: cashregister.updatedAt,
  }
}

export function mapCashregisterToDTO(cashregister: CashregisterDB): CashregisterDTO {
  return {
    id: cashregister._id,
    names: cashregister.names,
    priority: cashregister.priority,
    accountIds: cashregister.accountIds,
    active: cashregister.active,
    createdAt: cashregister.createdAt,
    updatedAt: cashregister.updatedAt,
  }
}
