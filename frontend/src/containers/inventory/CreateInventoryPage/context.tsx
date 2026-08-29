import type {
  GetInventoryItemsResponse,
  GetInventoryProgressResponse,
  InventoryDTO,
  InventoryItemDTO,
  InventoryItemViewFilter,
  InventoryProgressDTO,
} from '@remnant/shared'
import type { AxiosResponse } from 'axios'
import type { ReactNode } from 'react'
import type { FieldErrors, Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useInventoryConfirm,
  useInventoryCreate,
  useInventoryEdit,
  useInventoryItemsQuery,
  useInventoryProgressQuery,
  useInventoryQuery,
  useInventoryUpsertItem,
} from '@/api/hooks'
import { useInventoryScanOptions } from '@/api/hooks/inventory/useInventoryScanOptions'
import { useDebounceCallback, useDebounceValue, useLocale } from '@/utils/hooks'

export interface CreateInventoryFormValues {
  warehouse: string
  categories: string[]
  comment?: string
}

interface CreateInventoryContextType {
  isLoading: boolean
  isSaving: boolean
  isDraftReady: boolean
  inventory: InventoryDTO | undefined
  inventoryId: string | null
  inventoryItems: InventoryItemDTO[]
  inventoryItemsCount: number
  progress: InventoryProgressDTO | undefined
  viewFilter: InventoryItemViewFilter
  setViewFilter: (view: InventoryItemViewFilter) => void
  search: string
  setSearch: (value: string) => void
  pagination: { current: number, pageSize: number }
  setPagination: (value: { current: number, pageSize: number }) => void
  focusedProductId: string | null
  form: UseFormReturn<CreateInventoryFormValues>
  onError: (formErrors: FieldErrors<CreateInventoryFormValues>) => void
  startInventory: () => void
  saveComment: (comment: string) => void
  saveItemQuantity: (productId: string, receivedQuantity: number, itemHint?: InventoryItemDTO) => void
  handleBarcodeScan: (barcode: string) => Promise<void>
  submitInventoryForm: () => void
  isItemsLoading: boolean
}

const CreateInventoryContext = createContext<CreateInventoryContextType | undefined>(undefined)

export function CreateInventoryProvider({ children }: { children: ReactNode }) {
  const { seq } = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [inventoryId, setInventoryId] = useState<string | null>(null)
  const [viewFilter, setViewFilter] = useState<InventoryItemViewFilter>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 300)
  const [pagination, setPaginationState] = useState({ current: 1, pageSize: 20 })
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null)
  const creatingRef = useRef(false)
  const inventoryIdRef = useRef<string | null>(null)
  const upsertSnapshotsRef = useRef<Map<string, InventoryItemDTO>>(new Map())
  const pendingQuantitiesRef = useRef<Map<string, number>>(new Map())

  const { t } = useLocale()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const formSchema = useMemo(() => createCreateInventoryFormSchema(t), [t])

  const form = useForm<CreateInventoryFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CreateInventoryFormValues>,
    defaultValues: getCreateInventoryFormDefaults(),
  })

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

  // Prefer draft when seq collides with an older confirmed inventory.
  const inventory = inventories.find(item => item.status === 'draft') ?? inventories[0]

  const {
    data: inventoryItemsResponse,
    isPending: isItemsPending,
  } = useInventoryItemsQuery(
    {
      filters: {
        inventoryId: inventoryId ?? undefined,
        view: viewFilter,
        search: debouncedSearch || undefined,
      },
      pagination,
    },
    {
      options: {
        enabled: !!inventoryId,
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
    { filters: { inventoryId: inventoryId ?? '' } },
    {
      options: {
        enabled: !!inventoryId,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  )

  const inventoryItems = inventoryItemsResponse?.data?.data?.items ?? []
  const inventoryItemsCount = inventoryItemsResponse?.data?.data?.pagination?.total ?? 0
  const progress = progressResponse?.data?.data

  useEffect(() => {
    inventoryIdRef.current = inventoryId
  }, [inventoryId])

  useEffect(() => {
    if (!seq || !inventory)
      return

    if (inventory.status !== 'draft') {
      void navigate(`/inventories/view/${inventory.seq}`, { replace: true })
      return
    }

    setInventoryId(inventory.id)
    form.reset({
      warehouse: inventory.warehouse.id,
      categories: inventory.categories.map(category => category.id),
      comment: inventory.comment ?? '',
    })
  }, [seq, inventory, form, navigate])

  const syncItemAcrossItemCaches = useCallback((
    nextItem: Pick<InventoryItemDTO, 'productId' | 'quantity' | 'receivedQuantity' | 'counted'> & Partial<InventoryItemDTO>,
  ) => {
    const queries = queryClient.getQueriesData<AxiosResponse<GetInventoryItemsResponse>>({
      queryKey: ['inventories', 'get', 'items'],
    })

    for (const [queryKey, old] of queries) {
      if (!old?.data?.data?.items)
        continue

      const params = queryKey[3] as { filters?: { view?: InventoryItemViewFilter } } | undefined
      const view = params?.filters?.view ?? 'all'
      const items = old.data.data.items
      const index = items.findIndex(item => item.productId === nextItem.productId)
      const existing = index >= 0 ? items[index] : undefined
      const merged: InventoryItemDTO = {
        ...(existing ?? {
          id: nextItem.id ?? '',
          inventoryId: nextItem.inventoryId ?? '',
          productId: nextItem.productId,
          quantity: nextItem.quantity,
          receivedQuantity: nextItem.receivedQuantity,
          counted: nextItem.counted,
        }),
        ...nextItem,
        product: existing?.product ?? nextItem.product,
      }

      const matches = itemMatchesView(merged, view)
      let nextItems = items
      let nextTotal = old.data.data.pagination?.total ?? items.length

      if (index >= 0) {
        if (matches) {
          nextItems = items.map((item, itemIndex) => (itemIndex === index ? merged : item))
        }
        else {
          nextItems = items.filter((_, itemIndex) => itemIndex !== index)
          nextTotal = Math.max(0, nextTotal - 1)
        }
      }
      else if (!matches) {
        continue
      }
      else {
        // Item belongs to this view but isn't on the cached page — force a refetch later.
        continue
      }

      queryClient.setQueryData<AxiosResponse<GetInventoryItemsResponse>>(queryKey, {
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            items: nextItems,
            pagination: {
              ...old.data.data.pagination,
              total: nextTotal,
            },
          },
        },
      })
    }
  }, [queryClient])

  const invalidateItemLists = useCallback(() => {
    // Drop inactive filter caches so tabs refetch once when opened — no extra request now.
    queryClient.removeQueries({
      queryKey: ['inventories', 'get', 'items'],
      type: 'inactive',
    })
  }, [queryClient])

  const setProgressInCache = useCallback((progress: InventoryProgressDTO) => {
    queryClient.setQueriesData<AxiosResponse<GetInventoryProgressResponse>>(
      { queryKey: ['inventories', 'get', 'progress'] },
      (old) => {
        if (!old?.data)
          return old

        return {
          ...old,
          data: {
            ...old.data,
            data: progress,
          },
        }
      },
    )
  }, [queryClient])

  const patchProgressInCache = useCallback((
    previous: InventoryItemDTO | undefined,
    next: Pick<InventoryItemDTO, 'quantity' | 'receivedQuantity' | 'counted'>,
  ) => {
    queryClient.setQueriesData<AxiosResponse<GetInventoryProgressResponse>>(
      { queryKey: ['inventories', 'get', 'progress'] },
      (old) => {
        if (!old?.data?.data)
          return old

        const progressData = old.data.data
        const wasCounted = previous?.counted ?? false
        const wasMismatch = wasCounted
          && previous != null
          && previous.receivedQuantity !== previous.quantity
        const isMismatch = next.counted
          && next.receivedQuantity !== next.quantity

        let counted = progressData.counted
        let uncounted = progressData.uncounted
        let mismatches = progressData.mismatches

        if (!wasCounted && next.counted) {
          counted += 1
          uncounted = Math.max(0, uncounted - 1)
        }

        if (!wasMismatch && isMismatch)
          mismatches += 1
        if (wasMismatch && !isMismatch)
          mismatches = Math.max(0, mismatches - 1)

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...progressData,
              counted,
              uncounted,
              mismatches,
            },
          },
        }
      },
    )
  }, [queryClient])

  const applyOptimisticQuantity = useCallback((productId: string, receivedQuantity: number, itemHint?: InventoryItemDTO) => {
    const previousItem = queryClient
      .getQueriesData<AxiosResponse<GetInventoryItemsResponse>>({ queryKey: ['inventories', 'get', 'items'] })
      .flatMap(([, response]) => response?.data?.data?.items ?? [])
      .find(item => item.productId === productId)
      ?? itemHint

    const optimisticItem = {
      ...(previousItem ?? {}),
      productId,
      quantity: previousItem?.quantity ?? 0,
      receivedQuantity,
      counted: true as const,
    }

    if (previousItem) {
      if (!upsertSnapshotsRef.current.has(productId))
        upsertSnapshotsRef.current.set(productId, previousItem)

      syncItemAcrossItemCaches({ ...previousItem, ...optimisticItem })
      patchProgressInCache(previousItem, optimisticItem)
    }

    return previousItem
  }, [patchProgressInCache, queryClient, syncItemAcrossItemCaches])

  const createMutation = useInventoryCreate({
    options: {
      onSuccess: ({ data }) => {
        const created = data.data
        creatingRef.current = false
        setIsCreatingDraft(false)
        setInventoryId(created.id)
        inventoryIdRef.current = created.id
        queryClient.setQueryData(
          ['inventories', 'get', { filters: { seq: String(created.seq) } }],
          {
            data: {
              status: 'success',
              code: 'INVENTORIES_FETCHED',
              message: 'Inventories fetched',
              data: {
                items: [created],
                pagination: { page: 1, pageSize: 10, total: 1 },
              },
            },
          },
        )
        void queryClient.invalidateQueries({ queryKey: ['inventories'] })
        void navigate(`/inventories/edit/${created.seq}`, { replace: true })
      },
      onError: ({ response }) => {
        creatingRef.current = false
        setIsCreatingDraft(false)
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const upsertMutation = useInventoryUpsertItem({
    options: {
      onSuccess: ({ data: body }, variables) => {
        setIsSaving(false)
        upsertSnapshotsRef.current.delete(variables.productId)
        syncItemAcrossItemCaches(body.data)
        setProgressInCache(body.progress)
        invalidateItemLists()
      },
      onError: ({ response }, variables) => {
        setIsSaving(false)
        const snapshot = upsertSnapshotsRef.current.get(variables.productId)
        upsertSnapshotsRef.current.delete(variables.productId)
        pendingQuantitiesRef.current.delete(variables.productId)
        if (snapshot)
          syncItemAcrossItemCaches(snapshot)
        invalidateItemLists()
        void queryClient.invalidateQueries({ queryKey: ['inventories', 'get', 'progress'] })
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const editMutation = useInventoryEdit({
    options: {
      onSuccess: () => {
        setIsSaving(false)
      },
      onError: ({ response }) => {
        setIsSaving(false)
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const confirmMutation = useInventoryConfirm({
    options: {
      onSuccess: ({ data }) => {
        setIsSubmitting(false)
        void queryClient.invalidateQueries({ queryKey: ['inventories'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data?.message || ''}` })
        void navigate(`/inventories/view/${data.data.seq}`)
      },
      onError: ({ response }) => {
        setIsSubmitting(false)
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const loadInventoryScanOptions = useInventoryScanOptions()

  const startInventory = useCallback(() => {
    const warehouse = form.getValues('warehouse')
    const categories = form.getValues('categories')
    const comment = form.getValues('comment')

    if (!warehouse || categories.length === 0 || inventoryIdRef.current || creatingRef.current)
      return

    creatingRef.current = true
    setIsCreatingDraft(true)
    createMutation.mutate({
      warehouseId: warehouse,
      categories,
      comment,
      items: [],
    })
  }, [createMutation, form])

  const saveComment = useCallback((comment: string) => {
    const currentInventoryId = inventoryIdRef.current
    if (!currentInventoryId)
      return

    setIsSaving(true)
    editMutation.mutate({
      id: currentInventoryId,
      comment,
    })
  }, [editMutation])

  const flushPendingUpserts = useDebounceCallback(() => {
    const currentInventoryId = inventoryIdRef.current
    if (!currentInventoryId)
      return

    const entries = [...pendingQuantitiesRef.current.entries()]
    pendingQuantitiesRef.current.clear()

    for (const [productId, receivedQuantity] of entries) {
      upsertMutation.mutate({
        inventoryId: currentInventoryId,
        productId,
        receivedQuantity,
      })
    }
  }, 350)

  const saveItemQuantity = useCallback((productId: string, receivedQuantity: number, itemHint?: InventoryItemDTO) => {
    const currentInventoryId = inventoryIdRef.current
    if (!currentInventoryId)
      return

    setIsSaving(true)
    setFocusedProductId(productId)
    applyOptimisticQuantity(productId, receivedQuantity, itemHint)
    pendingQuantitiesRef.current.set(productId, receivedQuantity)
    flushPendingUpserts()
  }, [applyOptimisticQuantity, flushPendingUpserts])

  const handleBarcodeScan = useCallback(async (barcode: string) => {
    const currentInventoryId = inventoryIdRef.current
    if (!currentInventoryId)
      return

    try {
      const result = await loadInventoryScanOptions({
        filters: { barcode, inventoryId: currentInventoryId },
      })

      const product = result?.product
      const item = result?.item
      if (!product)
        return

      const cachedItem = queryClient
        .getQueriesData<AxiosResponse<GetInventoryItemsResponse>>({ queryKey: ['inventories', 'get', 'items'] })
        .flatMap(([, response]) => response?.data?.data?.items ?? [])
        .find(cached => cached.productId === product.id)

      const currentQty = cachedItem?.counted
        ? (cachedItem.receivedQuantity ?? 0)
        : (item?.counted ? (item.receivedQuantity ?? 0) : 0)
      const unitsPerScan = result.unitsPerScan ?? 1
      const nextQty = currentQty + unitsPerScan

      saveItemQuantity(product.id, nextQty)
      toast.success(t('page.create-inventory.scan.success'), {
        description: product.names?.ru || product.names?.en || product.id,
      })
    }
    catch {
      toast.error(t('page.create-inventory.scan.error'))
    }
  }, [loadInventoryScanOptions, queryClient, saveItemQuantity, t])

  const submitInventoryForm = useCallback(() => {
    const currentInventoryId = inventoryIdRef.current
    if (!currentInventoryId) {
      toast.error(t('page.create-inventory.form.selectScope'))
      return
    }

    const pendingEntries = [...pendingQuantitiesRef.current.entries()]
    pendingQuantitiesRef.current.clear()

    setIsSubmitting(true)

    void (async () => {
      try {
        await Promise.all(pendingEntries.map(async ([productId, receivedQuantity]) =>
          upsertMutation.mutateAsync({
            inventoryId: currentInventoryId,
            productId,
            receivedQuantity,
          }),
        ))

        confirmMutation.mutate({
          id: currentInventoryId,
          mode: 'close_zone',
        })
      }
      catch {
        setIsSubmitting(false)
      }
    })()
  }, [confirmMutation, t, upsertMutation])

  const onError = useCallback((formErrors: FieldErrors<CreateInventoryFormValues>) => {
    if (formErrors.warehouse || formErrors.categories) {
      toast.error(t('form.errors.required'))
    }
  }, [t])

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

  const isDraftReady = !!inventoryId
  const isItemsLoading = !!inventoryId && isItemsPending && !inventoryItemsResponse
  const isLoading = isSubmitting
    || isCreatingDraft
    || (!!seq && (isInventoryPending || isInventoryFetching))

  const value: CreateInventoryContextType = useMemo(
    () => ({
      isLoading,
      isSaving,
      isDraftReady,
      inventory,
      inventoryId,
      inventoryItems,
      inventoryItemsCount,
      progress,
      viewFilter,
      setViewFilter: handleSetViewFilter,
      search,
      setSearch: handleSetSearch,
      pagination,
      setPagination,
      focusedProductId,
      form,
      onError,
      startInventory,
      saveComment,
      saveItemQuantity,
      handleBarcodeScan,
      submitInventoryForm,
      isItemsLoading,
    }),
    [
      isLoading,
      isSaving,
      isDraftReady,
      inventory,
      inventoryId,
      inventoryItems,
      inventoryItemsCount,
      progress,
      viewFilter,
      handleSetViewFilter,
      search,
      handleSetSearch,
      pagination,
      setPagination,
      focusedProductId,
      form,
      onError,
      startInventory,
      saveComment,
      saveItemQuantity,
      handleBarcodeScan,
      submitInventoryForm,
      isItemsLoading,
    ],
  )

  return <CreateInventoryContext.Provider value={value}>{children}</CreateInventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateInventoryContext(): CreateInventoryContextType {
  const context = useContext(CreateInventoryContext)
  if (!context) {
    throw new Error('useCreateInventoryContext - CreateInventoryContext')
  }
  return context
}

function createCreateInventoryFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    warehouse: z.string({ required_error: t('form.errors.required') }),
    categories: z.array(z.string()).min(1, { message: t('form.errors.required') }),
    comment: z.string().optional(),
  })
}

function getCreateInventoryFormDefaults(): CreateInventoryFormValues {
  return {
    warehouse: '',
    categories: [],
    comment: '',
  }
}

function itemMatchesView(
  item: Pick<InventoryItemDTO, 'quantity' | 'receivedQuantity' | 'counted'>,
  view: InventoryItemViewFilter,
) {
  if (view === 'counted')
    return item.counted
  if (view === 'uncounted')
    return !item.counted
  if (view === 'mismatch')
    return item.counted && item.receivedQuantity !== item.quantity
  return true
}
