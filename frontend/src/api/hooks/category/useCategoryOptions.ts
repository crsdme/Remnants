import type { CategoryDTO, GetCategoriesRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCategories } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useCategoryOptions({ defaultFilters }: { defaultFilters?: GetCategoriesRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<CategoryDTO[]> => {
      const params: GetCategoriesRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
          active: [true],
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['categories', 'get', params],
        queryFn: async () => getCategories(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}

// import { useQueryClient } from '@tanstack/react-query'
// import { useTranslation } from 'react-i18next'
// import { getCategories } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// export function useCategoryOptions({ mapFn, isTree = false }: { mapFn?: (category: Category) => { value: string, label: string }, isTree?: boolean } = {}) {
//   const queryClient = useQueryClient()
//   const { i18n } = useTranslation()

//   return async function loadCategoriesOptions({ query, selectedValue }: LoadOptionsParams): Promise<Category[]> {
//     const filters = {
//       ...(selectedValue ? { ids: selectedValue } : { names: query }),
//       active: [true],
//       language: i18n.language,
//       isTree,
//     }

//     const data = await queryClient.fetchQuery({
//       queryKey: ['categories', 'get', { full: true }, filters, undefined],
//       queryFn: () => getCategories({ pagination: { full: true }, filters }),
//       staleTime: 60000,
//     })

//     const categories = data?.data?.categories || []

//     return mapFn ? categories.map(mapFn) as unknown as Category[] : categories
//   }
// }
