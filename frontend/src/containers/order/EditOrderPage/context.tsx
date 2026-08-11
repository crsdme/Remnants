import type { EditOrderRequest, OrderPaymentDTOPopulated, ProductPopulatedDTO } from '@remnant/shared'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import type { UploadedFile } from '@/components/FileUploadDnd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { z } from 'zod'
import {
  useBarcodeOptions,
  useCashregisterAccountQuery,
  useCashregisterQuery,
  useClientCreate,
  useCurrencyQuery,
  useOrderDetailQuery,
  useOrderEdit,
} from '@/api/hooks'
import { useAuthContext } from '@/contexts/AuthContext'
import { hasPermission } from '@/utils/helpers'

const EditOrderContext = createContext<EditOrderContextType | undefined>(undefined)

export function EditOrderProvider({ children }: { children: ReactNode }) {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [payments, setPayments] = useState<DraftOrderPayment[]>([])
  const [files, setFiles] = useState<UploadedFile[]>([])
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { seq } = useParams()
  const { permissions } = useAuthContext()

  const { currencies = [] } = useCurrencyQuery(
    { pagination: { full: true } },
  )

  const { cashregisters = [] } = useCashregisterQuery(
    { pagination: { full: true } },
  )

  const { cashregisterAccounts = [] } = useCashregisterAccountQuery(
    { pagination: { full: true } },
  )

  const { order, items, payments: defaultPayments } = useOrderDetailQuery(
    { seq },
    { options: { enabled: Boolean(seq) } },
  )

  const paymentFormSchema = useMemo(() => createPaymentFormSchema(t), [t])

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      id: undefined,
      cashregister: undefined,
      cashregisterAccount: undefined,
      amount: 0,
      currency: undefined,
      paymentDate: new Date(),
      comment: undefined,
    },
  })

  const informationFormSchema = useMemo(() => createInformationFormSchema(t), [t])

  const informationForm = useForm<InformationFormValues>({
    resolver: zodResolver(informationFormSchema) as Resolver<InformationFormValues>,
    defaultValues: {
      warehouse: undefined,
      orderSource: undefined,
      orderStatus: undefined,
      deliveryService: undefined,
      client: undefined,
      items: [],
      comment: undefined,
    },
  })

  const clientFormSchema = useMemo(() => createClientFormSchema(t), [t])

  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
    defaultValues: {
      name: undefined,
      middleName: undefined,
      lastName: undefined,
      country: undefined,
      phones: [],
      emails: [],
      comment: undefined,
    },
  })

  const queryClient = useQueryClient()

  const closeClientModal = () => {
    setIsClientModalOpen(false)
  }

  const openClientModal = () => {
    clientForm.reset()
    setIsClientModalOpen(true)
  }

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false)
  }

  const openPaymentModal = () => {
    paymentForm.reset()
    setIsPaymentModalOpen(true)
  }

  const mutateEditOrder = useOrderEdit({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] })
        void queryClient.invalidateQueries({ queryKey: ['products'] })
        void queryClient.invalidateQueries({ queryKey: ['statistics'] })
        void queryClient.invalidateQueries({ queryKey: ['money-transactions'] })
        void queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
        void navigate('/orders')
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
        void navigate('/orders')
      },
    },
  })

  const mutateCreateClient = useClientCreate({
    options: {
      onSuccess: ({ data }: { data: any }) => {
        closeClientModal()
        informationForm.setValue('client', data?.client?.id || '')
        void queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        closeClientModal()
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const isLoading = mutateEditOrder.isPending || mutateCreateClient.isPending

  useEffect(() => {
    if (!order)
      return

    if (order.orderStatus.isLocked && !hasPermission(permissions, 'order.editLocked')) {
      void navigate('/orders')
      return
    }

    informationForm.reset({
      warehouse: order.warehouse.id,
      orderSource: order.orderSource.id,
      orderStatus: order.orderStatus.id,
      deliveryService: order.deliveryService.id,
      client: order.client?.id,
      items: items.map(item => ({
        ...item.product,
        id: item.id,
        product: item.product.id,
        lineQuantity: item.quantity,
        selectedCurrencyId: item.currency.id,
        price: item.price,
        profit: item.profit || 0,
        manualPrice: item.manualPrice || undefined,
        basePrice: item.basePrice,
        selectedPrice: item.price,
        discountAmount: item.discountAmount || 0,
        discountPercent: item.discountPercent || 0,
        currency: item.currency,
      })),
      comment: order.comment,
    })

    const normalizedPayments: DraftOrderPayment[] = (defaultPayments as unknown as OrderPaymentDTOPopulated[]).map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentDate: p.paymentDate,
      comment: p.comment,
      cashregister: { id: p.cashregister.id, names: p.cashregister.names },
      cashregisterAccount: { id: p.cashregisterAccount.id, names: p.cashregisterAccount.names },
      currency: { id: p.currency.id, symbols: p.currency.symbols },
    }))
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- синхронизация платежей при загрузке заказа
    setPayments(normalizedPayments)

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- синхронизация файлов при загрузке заказа
    setFiles((order.files ?? []).map(file => ({
      id: file.id,
      file: file.path,
      preview: file.type.startsWith('image/') ? file.path : '',
      name: file.name,
      type: file.type,
      path: file.path,
      filename: file.filename,
      isNew: false,
    })))
  }, [order, items, informationForm, navigate, permissions, defaultPayments])

  const createPayment = (params: PaymentFormValues) => {
    const cashregister = cashregisters.find(c => c.id === params.cashregister)
    const cashregisterAccount = cashregisterAccounts.find(account => account.id === params.cashregisterAccount)
    const currency = currencies.find(c => c.id === params.currency)

    if (!cashregister || !cashregisterAccount || !currency) {
      toast.error(t('form.errors.required'))
      return
    }

    const paymentId = params.id?.trim() || `${Date.now()}`

    const payment: DraftOrderPayment = {
      id: paymentId,
      cashregister: { id: cashregister.id, names: cashregister.names },
      cashregisterAccount: { id: cashregisterAccount.id, names: cashregisterAccount.names },
      currency: { id: currency.id, symbols: currency.symbols },
      amount: params.amount,
      paymentDate: params.paymentDate,
      comment: params.comment,
    }

    setPayments(prev => [...prev, payment])
    closePaymentModal()
  }

  const removePayment = (paymentId: string) => {
    setPayments(prev => prev.filter(p => String(p.id) !== paymentId))
  }

  const createClient = (params: ClientFormValues) => {
    mutateCreateClient.mutate(params)
  }

  const editOrder = (params: InformationFormValues) => {
    if (!order?.id)
      return

    const mappedItems = params.items.map(({ lineQuantity, selectedCurrencyId, ...item }) => ({
      id: item.id,
      product: item.product,
      quantity: lineQuantity,
      currency: selectedCurrencyId,
      price: item.price,
      manualPrice: item.manualPrice || undefined,
      basePrice: item.basePrice,
      discountAmount: item.discountAmount || 0,
      discountPercent: item.discountPercent || 0,
    }))

    const orderPayments = payments.map((p) => {
      const row = {
        amount: p.amount,
        currency: p.currency.id,
        cashregister: p.cashregister.id,
        cashregisterAccount: p.cashregisterAccount.id,
        paymentDate: p.paymentDate?.toString(),
        comment: p.comment,
      }
      const clientGeneratedId = /^\d{10,15}$/.test(p.id)
      if (p.id && !clientGeneratedId)
        return { ...row, id: p.id }
      return row
    })

    const payload: EditOrderRequest = {
      id: order.id,
      warehouse: params.warehouse,
      orderSource: params.orderSource,
      orderStatus: params.orderStatus,
      deliveryService: params.deliveryService,
      client: params.client,
      comment: params.comment,
      items: mappedItems,
      orderPayments,
      files: files.map(file => ({
        id: file.id,
        filename: file.filename ?? '',
        name: file.name,
        type: file.type,
        path: file.path,
        isNew: file.isNew,
      })),
    }

    const formData = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''))
    }

    files
      .filter((file): file is UploadedFile & { file: File } => file.isNew && typeof file.file !== 'string')
      .forEach((file) => {
        formData.append('uploadedFiles', file.file, file.name)
        formData.append('uploadedFilesIds', file.id)
      })

    mutateEditOrder.mutate(formData as unknown as EditOrderRequest)
  }

  const loadBarcodeOptions = useBarcodeOptions()

  const getBarcode = async (code: string) => {
    const barcode = await loadBarcodeOptions({ query: code })
    return barcode[0]?.products
  }

  const value: EditOrderContextType = useMemo(
    () => ({
      isClientModalOpen,
      isPaymentModalOpen,
      isLoading,
      paymentForm,
      informationForm,
      payments,
      files,
      setFiles,
      clientForm,
      permissions,
      openClientModal,
      closeClientModal,
      openPaymentModal,
      closePaymentModal,
      createPayment,
      removePayment,
      createClient,
      editOrder,
      getBarcode,
    }),
    [isClientModalOpen, isPaymentModalOpen, isLoading, paymentForm, informationForm, clientForm, payments, files, permissions],
  )

  return <EditOrderContext.Provider value={value}>{children}</EditOrderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditOrderContext(): EditOrderContextType {
  const context = useContext(EditOrderContext)
  if (!context) {
    throw new Error('useEditOrderContext - EditOrderContext')
  }
  return context
}

interface DraftOrderPayment {
  id: string
  amount: number
  paymentDate?: Date
  comment?: string
  cashregister: { id: string, names: { [key: string]: string } }
  cashregisterAccount: { id: string, names: { [key: string]: string } }
  currency: { id: string, symbols: { [key: string]: string } }
}

function createPaymentFormSchema(t: (key: string) => string) {
  return z.object({
    id: z.string().optional(),
    cashregister: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    cashregisterAccount: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    amount: z.number().default(0),
    currency: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    paymentDate: z.date().optional(),
    comment: z.string().optional(),
  })
}

type PaymentFormValues = z.infer<ReturnType<typeof createPaymentFormSchema>>

function createOrderLineItemSchema() {
  return z.object({
    product: z.string(),
    lineQuantity: z.number(),
    selectedCurrencyId: z.string(),
    basePrice: z.number(),
    price: z.number(),
    manualPrice: z.number().optional(),
    discountAmount: z.number().optional(),
    discountPercent: z.number().optional(),
  }).merge(z.object({
    id: z.string().optional(),
    names: z.record(z.string(), z.string()).optional(),
    receivedQuantity: z.number().optional(),
    selectedPrice: z.number().optional(),
    productProperties: z.any().optional(),
    seq: z.number().optional(),
    barcodes: z.any().optional(),
    categories: z.any().optional(),
    unit: z.any().optional(),
    currency: z.any().optional(),
    purchaseCurrency: z.any().optional(),
    warehouseStock: z.any().optional(),
    images: z.any().optional(),
    productPropertiesGroup: z.any().optional(),
    purchasePrice: z.number().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  }))
}

export type OrderLineItemFormValues = z.infer<ReturnType<typeof createOrderLineItemSchema>>

function createInformationFormSchema(t: (key: string) => string) {
  return z.object({
    warehouse: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    orderSource: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    orderStatus: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    deliveryService: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    client: z.string().optional(),
    items: z.array(createOrderLineItemSchema()).min(1, { message: t('form.errors.required') }),
    comment: z.string().optional(),
  }).superRefine((data) => {
    if (data.items.length === 0)
      toast.error(t('form.errors.required.products'))
  })
}

type InformationFormValues = z.infer<ReturnType<typeof createInformationFormSchema>>

function createClientFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.required') }),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    country: z.string().optional(),
    phones: z.array(z.string().min(7)).optional(),
    emails: z.array(z.string().email()).optional(),
    socials: z.array(z.object({
      type: z.string(),
      value: z.string(),
    })).optional(),
    comment: z.string().optional(),
  })
}

type ClientFormValues = z.infer<ReturnType<typeof createClientFormSchema>>

interface EditOrderContextType {
  isClientModalOpen: boolean
  isPaymentModalOpen: boolean
  isLoading: boolean
  paymentForm: UseFormReturn<PaymentFormValues>
  informationForm: UseFormReturn<InformationFormValues>
  clientForm: UseFormReturn<ClientFormValues>
  permissions: string[]
  openClientModal: () => void
  closeClientModal: () => void
  openPaymentModal: () => void
  closePaymentModal: () => void
  payments: DraftOrderPayment[]
  files: UploadedFile[]
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
  removePayment: (id: string) => void
  createClient: (params: ClientFormValues) => void
  editOrder: (params: InformationFormValues) => void
  createPayment: (params: PaymentFormValues) => void
  getBarcode: (code: string) => Promise<ProductPopulatedDTO[] & { unitsPerScan: number }[]>
}
