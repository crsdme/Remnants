import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCategories } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useCategoryOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadCategoriesOptions({ query, selectedValue }: LoadOptionsParams): Promise<Category[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['categories', 'get', { full: true }, filters, undefined],
      queryFn: () => getCategories({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.categories || []
  }
}
