import type { BalanceComputedDTO, BalanceDTO } from '@remnant/shared'
import type { BalanceDB } from '@/types/'
import { toMinorType } from '@remnant/shared'

function mapTotals(totals: Array<{ currencyId: string, minorAmount: number }> | undefined) {
  return (totals ?? []).map(row => ({
    currencyId: String(row.currencyId),
    minorAmount: toMinorType(Number(row.minorAmount) || 0),
  }))
}

export function mapBalanceComputed(parts: {
  totalBalances: Array<{ currencyId: string, minorAmount: number }>
  cashregisterBalance: BalanceDB['cashregisterBalance']
  warehouseBalance: BalanceDB['warehouseBalance']
  transitBalance: BalanceDB['transitBalance']
  orderedNotReceivedBalance: BalanceDB['orderedNotReceivedBalance']
  prepaidBalance: BalanceDB['prepaidBalance']
  receivableBalance: BalanceDB['receivableBalance']
  supplierDebtBalance: BalanceDB['supplierDebtBalance']
  comment?: string
}): BalanceComputedDTO {
  return {
    totalBalances: mapTotals(parts.totalBalances),
    cashregisterBalance: (parts.cashregisterBalance ?? []).map(row => ({
      cashregisterId: String(row.cashregisterId),
      totals: mapTotals(row.totals),
    })),
    warehouseBalance: (parts.warehouseBalance ?? []).map(row => ({
      warehouseId: String(row.warehouseId),
      totals: mapTotals(row.totals),
    })),
    transitBalance: (parts.transitBalance ?? []).map(row => ({
      warehouseTransactionId: String(row.warehouseTransactionId),
      fromWarehouseId: row.fromWarehouseId != null ? String(row.fromWarehouseId) : null,
      totals: mapTotals(row.totals),
    })),
    orderedNotReceivedBalance: (parts.orderedNotReceivedBalance ?? []).map(row => ({
      procurementId: String(row.procurementId),
      supplierId: String(row.supplierId),
      totals: mapTotals(row.totals),
    })),
    prepaidBalance: (parts.prepaidBalance ?? []).map(row => ({
      procurementId: row.procurementId != null ? String(row.procurementId) : undefined,
      supplierId: row.supplierId != null ? String(row.supplierId) : undefined,
      totals: mapTotals(row.totals),
    })),
    receivableBalance: (parts.receivableBalance ?? []).map(row => ({
      orderId: String(row.orderId),
      clientId: row.clientId != null ? String(row.clientId) : null,
      totals: mapTotals(row.totals),
    })),
    supplierDebtBalance: (parts.supplierDebtBalance ?? []).map(row => ({
      procurementId: String(row.procurementId),
      supplierId: String(row.supplierId),
      totals: mapTotals(row.totals),
    })),
    comment: parts.comment,
  }
}

export function mapBalanceToDTO(balance: BalanceDB): BalanceDTO {
  return {
    id: String(balance._id),
    seq: Number(balance.seq),
    createdAt: balance.createdAt,
    updatedAt: balance.updatedAt,
    ...mapBalanceComputed(balance),
  }
}
