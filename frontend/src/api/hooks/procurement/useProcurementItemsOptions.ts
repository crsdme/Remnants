import { useQueryClient } from '@tanstack/react-query'
import { getProcurementItems } from '@/api/requests'

interface LoadOptionsParams {
  selectedValue?: string[]
}

export function useProcurementItemsOptions({ mapFn }: { mapFn?: (procurementItem: ProcurementItem) => { value: string, label: string } } = {}) {
  const queryClient = useQueryClient()

  return async function loadProcurementItemsOptions({ selectedValue }: LoadOptionsParams): Promise<ProcurementItem[]> {
    const filters = selectedValue ? { procurementId: selectedValue?.[0] } : {}

    const data = await queryClient.fetchQuery({
      queryKey: ['procurements', 'get', 'items', filters],
      queryFn: () => getProcurementItems({ filters, pagination: { full: true } }),
      staleTime: 60000,
    })

    const procurementItems = data?.data?.procurementItems || []

    return mapFn ? procurementItems.map(mapFn) as unknown as ProcurementItem[] : procurementItems
  }
}
