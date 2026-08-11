import type {
  InventoryDTO,
  InventoryItemDTO,
  InventoryItemViewFilter,
  InventoryProgressDTO,
} from '@remnant/shared'
import type { ReactNode } from 'react'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  useInventoryItemsQuery,
  useInventoryProgressQuery,
  useInventoryQuery,
} from '@/api/hooks'
import { useDebounceValue } from '@/utils/hooks'

interface ViewInventoryContextType {
  isLoading: boolean
  isItemsLoading: boolean
  inventory: InventoryDTO | undefined
  inventoryItems: InventoryItemDTO[]
  inventoryItemsCount: number
  progress: InventoryProgressDTO | undefined
  viewFilter: InventoryItemViewFilter
  setViewFilter: (view: InventoryItemViewFilter) => void
  search: string
  setSearch: (value: string) => void
  pagination: { current: number, pageSize: number }
  setPagination: (value: { current: number, pageSize: number }) => void
}

const ViewInventoryContext = createContext<ViewInventoryContextType | undefined>(undefined)

export function ViewInventoryProvider({ children }: { children: ReactNode }) {
  const { seq } = useParams()
  const [viewFilter, setViewFilter] = useState<InventoryItemViewFilter>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 300)
  const [pagination, setPaginationState] = useState({ current: 1, pageSize: 20 })

  const {
    inventories,
    isPending: isInventoryPending,
    isFetching: isInventoryFetching,
  } = useInventoryQuery(
    { filters: { seq } },
    {
      options: {
        enabled: !!seq,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  )

  const inventory = inventories[0]

  const {
    data: inventoryItemsResponse,
    isPending: isItemsPending,
  } = useInventoryItemsQuery(
    {
      filters: {
        inventoryId: inventory?.id,
        view: viewFilter,
        search: debouncedSearch || undefined,
      },
      pagination,
    },
    {
      options: {
        enabled: !!inventory?.id,
        staleTime: 30_000,
        placeholderData: (previousData, previousQuery) => {
          const previousView = (previousQuery?.queryKey[3] as { filters?: { view?: InventoryItemViewFilter } } | undefined)?.filters?.view ?? 'all'
          if (previousView !== viewFilter)
            return undefined
          return previousData
        },
        refetchOnWindowFocus: false,
      },
    },
  )

  const { data: progressResponse } = useInventoryProgressQuery(
    { filters: { inventoryId: inventory?.id ?? '' } },
    {
      options: {
        enabled: !!inventory?.id,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  )

  const inventoryItems = inventoryItemsResponse?.data?.data?.items ?? []
  const inventoryItemsCount = inventoryItemsResponse?.data?.data?.pagination?.total ?? 0
  const progress = progressResponse?.data?.data

  const setPagination = useCallback((value: { current: number, pageSize: number }) => {
    setPaginationState(value)
  }, [])

  const handleSetViewFilter = useCallback((view: InventoryItemViewFilter) => {
    setViewFilter(view)
    setPaginationState(state => ({ ...state, current: 1 }))
  }, [])

  const handleSetSearch = useCallback((value: string) => {
    setSearch(value)
    setPaginationState(state => ({ ...state, current: 1 }))
  }, [])

  const isLoading = !!seq && (isInventoryPending || isInventoryFetching)
  const isItemsLoading = !!inventory?.id && isItemsPending && !inventoryItemsResponse

  const value: ViewInventoryContextType = useMemo(
    () => ({
      isLoading,
      isItemsLoading,
      inventory,
      inventoryItems,
      inventoryItemsCount,
      progress,
      viewFilter,
      setViewFilter: handleSetViewFilter,
      search,
      setSearch: handleSetSearch,
      pagination,
      setPagination,
    }),
    [
      isLoading,
      isItemsLoading,
      inventory,
      inventoryItems,
      inventoryItemsCount,
      progress,
      viewFilter,
      handleSetViewFilter,
      search,
      handleSetSearch,
      pagination,
      setPagination,
    ],
  )

  return <ViewInventoryContext.Provider value={value}>{children}</ViewInventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewInventoryContext(): ViewInventoryContextType {
  const context = useContext(ViewInventoryContext)
  if (!context) {
    throw new Error('useViewInventoryContext - ViewInventoryContext')
  }
  return context
}
