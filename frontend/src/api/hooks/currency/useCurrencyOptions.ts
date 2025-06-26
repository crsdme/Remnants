import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCurrencies } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useCurrencyOptions({ defaultFilters, mapFn }: { defaultFilters?: { ids?: string[] }, mapFn?: (currency: Currency) => { value: string, label: string } } = {}) {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadCurrenciesOptions({ query, selectedValue }: LoadOptionsParams): Promise<Currency[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      ...defaultFilters,
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['currencies', 'get', { full: true }, filters, undefined],
      queryFn: () => getCurrencies({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    const currencies = data?.data?.currencies || []

    return mapFn ? currencies.map(mapFn) as unknown as Currency[] : currencies
  }
}
