import type { ProcurementDTO, ProductPopulatedDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useCurrencyQuery, useProcurementItemsQuery, useProcurementQuery, useProductQuery } from '@/api/hooks'
import { fromMinor } from '@/utils/helpers'

export type ViewProcurementProductRow = ProductPopulatedDTO & {
  quantity: number
  receivedQuantity: number
  purchasePrice: number
  purchaseCurrencyId?: ProductPopulatedDTO['purchaseCurrency'] | { id: string }
}

interface ViewProcurementContextType {
  isLoading: boolean
  procurement?: ProcurementDTO
  items: ViewProcurementProductRow[]
}

const ViewProcurementContext = createContext<ViewProcurementContextType | undefined>(undefined)

export function ViewProcurementProvider({ children }: { children: ReactNode }) {
  const { seq = '' } = useParams()
  const seqNumber = Number(seq)

  const { currencies } = useCurrencyQuery({ pagination: { full: true } })

  const { procurements: [procurement], isLoading: isProcurementLoading } = useProcurementQuery(
    { filters: { seq: [seq] } },
    { options: { enabled: seqNumber > 0 } },
  )

  const { procurementItems, isLoading: isItemsLoading } = useProcurementItemsQuery(
    {
      filters: { procurementId: procurement?.id },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(procurement?.id) } },
  )

  const productIds = useMemo(
    () => [...new Set(procurementItems.map(item => item.productId).filter(Boolean))],
    [procurementItems],
  )

  const { products, isLoading: isProductsLoading } = useProductQuery(
    {
      filters: { ids: productIds },
      pagination: { full: true },
    },
    { options: { enabled: productIds.length > 0 } },
  )

  const items = useMemo(() => {
    const productsById = new Map(products.map(product => [product.id, product]))
    return procurementItems.map((item) => {
      const product = productsById.get(item.productId)
      const currency = currencies.find(row => row.id === item.purchaseCurrencyId)
        ?? product?.purchaseCurrency
      const scale = currency?.scale ?? 2
      return {
        ...product,
        ...item.product,
        id: item.productId,
        quantity: item.quantity,
        receivedQuantity: item.receivedQuantity ?? 0,
        purchasePrice: Number(fromMinor(item.minorPurchasePrice ?? 0, scale)),
        purchaseCurrencyId: currency ?? (item.purchaseCurrencyId ? { id: item.purchaseCurrencyId } : undefined),
      } as ViewProcurementProductRow
    })
  }, [currencies, procurementItems, products])

  const value: ViewProcurementContextType = useMemo(
    () => ({
      isLoading: isProcurementLoading || isItemsLoading || (productIds.length > 0 && isProductsLoading),
      procurement,
      items,
    }),
    [isItemsLoading, isProcurementLoading, isProductsLoading, items, procurement, productIds.length],
  )

  return <ViewProcurementContext.Provider value={value}>{children}</ViewProcurementContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewProcurementContext(): ViewProcurementContextType {
  const context = useContext(ViewProcurementContext)
  if (!context) {
    throw new Error('useViewProcurementContext - ViewProcurementContext')
  }
  return context
}
