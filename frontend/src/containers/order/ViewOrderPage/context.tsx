import type { OrderDTOPopulated, OrderPaymentDTOPopulated } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import type { UploadedFile } from '@/components/FileUploadDnd'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { z } from 'zod'
import { useOrderDetailQuery } from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

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
    profit: z.number().optional(),
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

interface ViewOrderContextType {
  order: OrderDTOPopulated | null
  isLoading: boolean
  paymentForm: UseFormReturn<PaymentFormValues>
  informationForm: UseFormReturn<InformationFormValues>
  clientForm: UseFormReturn<ClientFormValues>
  payments: OrderPaymentDTOPopulated[]
  files: UploadedFile[]
  disabled: boolean
}

const ViewOrderContext = createContext<ViewOrderContextType | undefined>(undefined)

export function ViewOrderProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<OrderPaymentDTOPopulated[]>([])
  const [files, setFiles] = useState<UploadedFile[]>([])
  const { t } = useLocale()
  const { seq } = useParams()

  const disabled = true

  const { order, items, payments: defaultPayments, isPending, isFetching } = useOrderDetailQuery(
    { seq },
    { options: { enabled: Boolean(seq) } },
  )

  const isLoading = isPending || isFetching

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

  useEffect(() => {
    if (!order?.id)
      return

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

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- TEMPORARY FIX
    setPayments(defaultPayments as unknown as OrderPaymentDTOPopulated[])

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
  }, [order, items, defaultPayments, informationForm])

  const value: ViewOrderContextType = useMemo(
    () => ({
      order,
      isLoading,
      paymentForm,
      informationForm,
      payments,
      files,
      clientForm,
      disabled,
    }),
    [order, isLoading, paymentForm, informationForm, clientForm, payments, files, disabled],
  )

  return <ViewOrderContext.Provider value={value}>{children}</ViewOrderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewOrderContext(): ViewOrderContextType {
  const context = useContext(ViewOrderContext)
  if (!context) {
    throw new Error('useViewOrderContext - ViewOrderContext')
  }
  return context
}
