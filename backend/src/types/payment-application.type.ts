import type { PaymentApplicationDTO } from '@remnant/shared'
import type { z } from 'zod'
import type { paymentApplicationDBSchema } from '@/schemas'
import { getPaymentApplicationsSchema } from '@remnant/shared'

export type PaymentApplicationDB = z.infer<typeof paymentApplicationDBSchema>

export type GetPaymentApplicationsPayload = z.output<typeof getPaymentApplicationsSchema>
export function parseGetPaymentApplications(x: unknown): GetPaymentApplicationsPayload {
  return getPaymentApplicationsSchema.parse(x)
}

export interface PaymentApplicationListRow {
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
}

export interface GetPaymentApplicationsRepoResult {
  items: PaymentApplicationListRow[]
  total: number
  page: number
  pageSize: number
}

export interface CreatePaymentApplicationRepoPayload {
  partyType: 'client' | 'supplier'
  partyId: string
  documentType: 'order' | 'procurement'
  documentId: string
  moneyTransactionId: string
  currencyId: string
  minorAmount: number
  comment?: string
  createdBy?: string | null
  cancelled?: boolean
}
