import type { PaymentApplicationDTO } from '@remnant/shared'
import { toMinorType } from '@remnant/shared'
import { fromMinor } from '@/utils/money'

export function mapPaymentApplicationToDTO(row: {
  id: string
  seq?: number
  partyType: 'client' | 'supplier'
  partyId: string
  documentType: 'order' | 'procurement'
  documentId: string
  moneyTransactionId: string
  minorAmount: number
  currency: PaymentApplicationDTO['currency']
  comment?: string
  cancelled?: boolean
  cancelledBy?: string | null
  cancelledAt?: Date | null
  createdBy?: string | null
  createdAt: Date
  updatedAt: Date
}): PaymentApplicationDTO {
  const scale = row.currency.scale ?? 2

  return {
    id: row.id,
    seq: row.seq ?? 0,
    partyType: row.partyType,
    partyId: row.partyId,
    documentType: row.documentType,
    documentId: row.documentId,
    moneyTransactionId: row.moneyTransactionId,
    amount: Number.parseFloat(fromMinor(toMinorType(row.minorAmount), scale)),
    currency: row.currency,
    comment: row.comment,
    cancelled: row.cancelled === true,
    cancelledBy: row.cancelledBy ?? undefined,
    cancelledAt: row.cancelledAt ?? null,
    createdBy: row.createdBy ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
