import type { GetPaymentApplicationsResponse } from '@remnant/shared'
import type { GetPaymentApplicationsPayload } from '@/types'
import { mapPaymentApplicationToDTO } from '@/mappers/payment-application.mapper'
import * as PaymentApplicationRepo from '@/repositories/payment-application.repo'

export async function get({ payload }: { payload: GetPaymentApplicationsPayload }): Promise<GetPaymentApplicationsResponse> {
  const { items, total, page, pageSize } = await PaymentApplicationRepo.list(payload)

  return {
    status: 'success',
    code: 'PAYMENT_APPLICATIONS_FETCHED',
    message: 'Payment applications fetched',
    data: {
      items: items.map(mapPaymentApplicationToDTO),
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}
