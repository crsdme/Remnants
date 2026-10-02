import type {
  GetPaymentApplicationsRequest,
  GetPaymentApplicationsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getPaymentApplications(params: GetPaymentApplicationsRequest) {
  return api.get<GetPaymentApplicationsResponse>('payment-applications/get', { params })
}
