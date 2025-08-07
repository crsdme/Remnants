import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCategories } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useCategoryOptions({ mapFn, isTree = false }: { mapFn?: (category: Category) => { value: string, label: string }, isTree?: boolean } = {}) {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadCategoriesOptions({ query, selectedValue }: LoadOptionsParams): Promise<Category[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
      isTree,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['categories', 'get', { full: true }, filters, undefined],
      queryFn: () => getCategories({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    const categories = data?.data?.categories || []

    return mapFn ? categories.map(mapFn) as unknown as Category[] : categories
  }
}
