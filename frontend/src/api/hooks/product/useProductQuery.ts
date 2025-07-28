import type { getProductsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getProducts } from '@/api/requests'

export function useProductQuery(params: getProductsParams, settings?: QuerySettings) {
  const { i18n } = useTranslation()
  params.filters.language = i18n.language

  return useQuery({
    queryKey: ['products', 'get', params],
    queryFn: () => getProducts(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
