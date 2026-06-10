import type { ProcurementItemDTO } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { getProcurementItems } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

interface LoadOptionsParams {
  selectedValue?: string[]
}

export function useProcurementItemsOptions({ mapFn }: { mapFn?: (procurementItem: ProcurementItemDTO) => { value: string, label: string } } = {}) {
  const queryClient = useQueryClient()

  return async function loadProcurementItemsOptions({ selectedValue }: LoadOptionsParams): Promise<ProcurementItemDTO[]> {
    const filters = selectedValue ? { procurementId: selectedValue?.[0] } : {}

    const data = await queryClient.fetchQuery({
      queryKey: ['procurements', 'get', 'items', filters],
      queryFn: async () => getProcurementItems({ filters, pagination: { full: true } }),
      staleTime: 60000,
    })

    const procurementItems = data?.data?.data?.items || EMPTY_ITEMS

    return mapFn ? procurementItems.map(mapFn) as unknown as ProcurementItemDTO[] : procurementItems
  }
}
