import type { CreateOrderRequest, ProductPopulatedDTO } from '@remnant/shared'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import type { UploadedFile } from '@/components/FileUploadDnd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { z } from 'zod'
import {
  useBarcodeOptions,
  useCashregisterAccountQuery,
  useCashregisterQuery,
  useClientCreate,
  useCurrencyQuery,
  useOrderCreate,
  usePrintDraftInvoice,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

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

interface CreateOrderContextType {
  isClientModalOpen: boolean
  isPaymentModalOpen: boolean
  isLoading: boolean
  paymentForm: UseFormReturn<PaymentFormValues>
  informationForm: UseFormReturn<InformationFormValues>
  clientForm: UseFormReturn<ClientFormValues>
  openClientModal: () => void
  closeClientModal: () => void
  openPaymentModal: () => void
  closePaymentModal: () => void
  payments: DraftOrderPayment[]
  files: UploadedFile[]
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>
  removePayment: (id: string) => void
  createClient: (params: ClientFormValues) => void
  createOrder: (params: InformationFormValues) => void
  createPayment: (params: PaymentFormValues) => void
  getBarcode: (code: string) => Promise<ProductPopulatedDTO[] & { unitsPerScan: number }[]>
  printDraftInvoice: () => void
}

const CreateOrderContext = createContext<CreateOrderContextType | undefined>(undefined)

export function CreateOrderProvider({ children }: { children: ReactNode }) {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState<DraftOrderPayment[]>([])
  const [files, setFiles] = useState<UploadedFile[]>([])
  const navigate = useNavigate()
  const { t } = useLocale()

  const { currencies } = useCurrencyQuery({})

  const { cashregisters } = useCashregisterQuery({})

  const { cashregisterAccounts } = useCashregisterAccountQuery({})

  const paymentFormSchema = useMemo(() => createPaymentFormSchema(t), [t])

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      cashregister: '',
      cashregisterAccount: '',
      amount: 0,
      currency: '',
      paymentDate: new Date(),
      comment: '',
    },
  })

  const informationFormSchema = useMemo(() => createInformationFormSchema(t), [t])

  const informationForm = useForm<InformationFormValues>({
    resolver: zodResolver(informationFormSchema) as Resolver<InformationFormValues>,
    defaultValues: {
      warehouse: '',
      orderSource: '',
      orderStatus: '',
      deliveryService: '',
      client: '',
      items: [],
      comment: '',
    },
  })

  const clientFormSchema = useMemo(() => createClientFormSchema(t), [t])

  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
    defaultValues: {
      name: '',
      middleName: '',
      lastName: '',
      country: '',
      phones: [],
      emails: [],
      comment: '',
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

  const createPayment = (params: PaymentFormValues) => {
    const cashregister = (cashregisters || []).find(cashregister => cashregister.id === params.cashregister)
    const cashregisterAccount = (cashregisterAccounts || []).find(account => account.id === params.cashregisterAccount)
    const currency = (currencies || []).find(currency => currency.id === params.currency)

    if (!cashregister || !cashregisterAccount || !currency) {
      toast.error(t('form.errors.required'))
      return
    }

    const payment: DraftOrderPayment = {
      id: crypto.randomUUID(),
      cashregister,
      cashregisterAccount,
      currency,
      amount: params.amount,
      paymentDate: params.paymentDate,
      comment: params.comment,
    }

    setPayments(prev => [...prev, payment])
    closePaymentModal()
  }

  const removePayment = (id: string) => {
    setPayments(payments.filter(payment => String(payment.id) !== id))
  }

  const useMutateCreateOrder = useOrderCreate({
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

  const useMutateCreateClient = useClientCreate({
    options: {
      onSuccess: ({ data }: { data: any }) => {
        closeClientModal()
        setIsLoading(false)
        informationForm.setValue('client', data?.client?.id || '')
        void queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        closeClientModal()
        setIsLoading(false)
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutatePrintDraftInvoice = usePrintDraftInvoice({
    options: {
      onSuccess: ({ data }) => {
        window.open(URL.createObjectURL(data), '_blank', 'noopener,noreferrer')
        setTimeout(() => URL.revokeObjectURL(URL.createObjectURL(data)), 60_000)
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const createClient = (params: ClientFormValues) => {
    setIsLoading(true)
    useMutateCreateClient.mutate(params)
  }

  const createOrder = (params: InformationFormValues) => {
    setIsLoading(true)

    const items: CreateOrderRequest['items'] = params.items.map(row => ({
      product: row.product,
      quantity: row.lineQuantity,
      currency: row.selectedCurrencyId,
      price: row.price,
      manualPrice: row.manualPrice ?? undefined,
      basePrice: row.basePrice,
      discountAmount: row.discountAmount ?? 0,
      discountPercent: row.discountPercent ?? 0,
    }))

    const orderPayments = payments.map(p => ({
      amount: p.amount,
      currency: p.currency.id,
      cashregister: p.cashregister.id,
      cashregisterAccount: p.cashregisterAccount.id,
      paymentDate: p.paymentDate?.toISOString(),
      comment: p.comment,
    }))

    const payload: CreateOrderRequest = {
      warehouse: params.warehouse,
      orderSource: params.orderSource,
      orderStatus: params.orderStatus,
      deliveryService: params.deliveryService,
      client: params.client,
      comment: params.comment,
      items,
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

    useMutateCreateOrder.mutate(formData as unknown as CreateOrderRequest)
  }

  const loadBarcodeOptions = useBarcodeOptions()

  const getBarcode = async (code: string) => {
    const barcode = await loadBarcodeOptions({ query: code })
    return barcode[0]?.products
  }

  const printDraftInvoice = async () => {
    const products = informationForm.getValues('items').map((item) => {
      return {
        id: item.product,
        names: item.names ?? {},
        quantity: item.lineQuantity,
        productPropertiesGroup: item.productPropertiesGroup
          ? { id: item.productPropertiesGroup.id, names: item.productPropertiesGroup.names }
          : undefined,
        productProperties: item.productProperties ?? [],
        currency: item.selectedCurrencyId,
        price: item.price,
        manualPrice: item.manualPrice || undefined,
        basePrice: item.basePrice,
        discountAmount: item.discountAmount || 0,
        discountPercent: item.discountPercent || 0,
      }
    })

    useMutatePrintDraftInvoice.mutate({
      items: products,
      language: 'en',
    })
  }

  const value: CreateOrderContextType = useMemo(
    () => ({
      isClientModalOpen,
      isPaymentModalOpen,
      isLoading,
      paymentForm,
      informationForm,
      clientForm,
      payments,
      files,
      setFiles,
      printDraftInvoice,
      openClientModal,
      closeClientModal,
      openPaymentModal,
      closePaymentModal,
      createPayment,
      removePayment,
      createClient,
      createOrder,
      getBarcode,
    }),
    [isClientModalOpen, isPaymentModalOpen, isLoading, paymentForm, informationForm, clientForm, payments, files],
  )

  return <CreateOrderContext.Provider value={value}>{children}</CreateOrderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateOrderContext(): CreateOrderContextType {
  const context = useContext(CreateOrderContext)
  if (!context) {
    throw new Error('useCreateOrderContext - CreateOrderContext')
  }
  return context
}
