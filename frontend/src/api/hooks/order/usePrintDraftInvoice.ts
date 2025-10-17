import type { printDraftInvoiceParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { printDraftInvoice } from '@/api/requests'

export function usePrintDraftInvoice(settings?: MutationSettings<printDraftInvoiceParams, typeof printDraftInvoice>) {
  return useMutation({
    mutationFn: printDraftInvoice,
    ...settings?.options,
  })
}
