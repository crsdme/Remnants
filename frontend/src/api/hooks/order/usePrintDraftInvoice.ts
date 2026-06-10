import type { PrintDraftInvoiceOrderRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { printDraftInvoice } from '@/api/requests'

export function usePrintDraftInvoice(settings?: MutationSettings<PrintDraftInvoiceOrderRequest>) {
  return useMutation({
    mutationFn: printDraftInvoice,
    ...settings?.options,
  })
}
