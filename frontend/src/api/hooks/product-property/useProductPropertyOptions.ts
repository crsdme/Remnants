import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getProductProperties } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useProductPropertyOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadProductPropertyOptions({ query, selectedValue }: LoadOptionsParams): Promise<ProductProperty[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['product-properties', 'get', { full: true }, filters, undefined],
      queryFn: () => getProductProperties({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.productProperties || []
  }
}
