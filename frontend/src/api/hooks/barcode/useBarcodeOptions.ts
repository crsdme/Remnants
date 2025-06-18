import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getBarcodes } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useBarcodeOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadBarcodeOptions({ query, selectedValue }: LoadOptionsParams): Promise<Barcode[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { code: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['barcodes', 'get', { full: true }, filters, undefined],
      queryFn: () => getBarcodes({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.barcodes || []
  }
}
