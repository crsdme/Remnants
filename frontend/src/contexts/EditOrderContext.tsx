import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

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
  useOrderEdit,
  useOrderQuery,
} from '@/api/hooks'
import { PAYMENT_STATUSES } from '@/utils/constants'
import { hasPermission } from '@/utils/helpers'
import { useAuthContext } from './AuthContext'

interface EditOrderContextType {
  isClientModalOpen: boolean
  isPaymentModalOpen: boolean
  isLoading: boolean
  paymentForm: UseFormReturn
  informationForm: UseFormReturn
  clientForm: UseFormReturn
  openClientModal: () => void
  closeClientModal: () => void
  openPaymentModal: () => void
  closePaymentModal: () => void
  payments: any[]
  removePayment: (id: string) => void
  createClient: (params) => void
  editOrder: (params) => void
  createPayment: (params) => void
  getBarcode: (code: string) => Promise<any>
}

const EditOrderContext = createContext<EditOrderContextType | undefined>(undefined)

interface EditOrderProviderProps {
  children: ReactNode
}

export function EditOrderProvider({ children }: EditOrderProviderProps) {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState([])
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams()
  const { permissions } = useAuthContext()

  const { data: { currencies = [] } = {} } = useCurrencyQuery(
    {},
    { options: { select: response => ({
      currencies: response.data.currencies,
    }) } },
  )

  const { data: { cashregisters = [] } = {} } = useCashregisterQuery(
    {},
    { options: { select: response => ({
      cashregisters: response.data.cashregisters,
    }) } },
  )

  const { data: { cashregisterAccounts = [] } = {} } = useCashregisterAccountQuery(
    {},
    { options: { select: response => ({
      cashregisterAccounts: response.data.cashregisterAccounts,
    }) } },
  )

  const { data: { order = {} } = {} } = useOrderQuery(
    { filters: { seq: id } },
    { options: { select: response => ({
      order: response.data.orders[0],
    }) } },
  )

  const paymentFormSchema = useMemo(() =>
    z.object({
      cashregister: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
      cashregisterAccount: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
      amount: z.number().default(0),
      currency: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
      paymentDate: z.date().optional(),
      paymentStatus: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
      comment: z.string().optional(),
    }), [t])

  const paymentForm = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cashregister: '',
      cashregisterAccount: '',
      amount: 0,
      currency: '',
      paymentDate: new Date(),
      paymentStatus: PAYMENT_STATUSES[0].id,
      comment: '',
    },
  })

  const informationFormSchema = z.object({
    warehouse: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
    orderSource: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
    orderStatus: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
    deliveryService: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
    client: z.string().optional(),
    items: z.array(z.object({
      product: z.string(),
      quantity: z.number(),
      selectedCurrency: z.object({
        id: z.string(),
      }),
      price: z.number(),
      discountAmount: z.number().optional(),
      discountPercent: z.number().optional(),
      // receivedQuantity: z.number({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
    })).min(1, { message: t('error.required') }),
    comment: z.string().optional(),
  }).superRefine((data) => {
    if (data.items.length === 0)
      toast.error(t('error.products.required'))
  })

  const informationForm = useForm({
    resolver: zodResolver(informationFormSchema),
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

  const clientFormSchema = useMemo(() =>
    z.object({
      name: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
      middleName: z.string().optional(),
      lastName: z.string({ required_error: t('error.required') }).min(1, { message: t('error.required') }),
      phones: z.array(z.string().min(7)).min(1),
      emails: z.array(z.string().email()).optional(),
    }), [t])

  const clientForm = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      middleName: '',
      lastName: '',
      phones: [],
      emails: [],
    },
  })

  // CAN BE REWORKED
  useEffect(() => {
    setIsLoading(true)
    if (order.id) {
      if (order.orderStatus.isLocked && !hasPermission(permissions, 'order.editLocked')) {
        navigate('/orders')
        return
      }

      informationForm.reset({
        warehouse: order.warehouse.id,
        orderSource: order.orderSource.id,
        orderStatus: order.orderStatus.id,
        deliveryService: order.deliveryService.id,
        client: order.client.id,
        items: order.items.map((item) => {
          let discountPrice = item.price || item.product.price
          if (item.discountPercent > 0) {
            discountPrice = item.price - (item.price * item.discountPercent) / 100
          }
          else if (item.discountAmount > 0) {
            discountPrice = item.price - item.discountAmount
          }

          return {
            ...item.product,
            product: item.product.id,
            quantity: item.quantity,
            price: item.price || item.product.price,
            selectedPrice: discountPrice,
            discountAmount: item.discountAmount || 0,
            discountPercent: item.discountPercent || 0,
            selectedCurrency: item.currency,
            currency: item.product.currency,
          }
        }),
        comment: order.comment,
      })
      setPayments(order.payments)
      setIsLoading(false)
    }
  }, [order])

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

  const createPayment = (params) => {
    const cashregister = (cashregisters || []).find(cashregister => cashregister.id === params.cashregister)
    const cashregisterAccount = (cashregisterAccounts || []).find(account => account.id === params.cashregisterAccount)
    const currency = (currencies || []).find(currency => currency.id === params.currency)

    const payment = {
      id: Date.now(),
      cashregister,
      cashregisterAccount,
      currency,
      amount: params.amount,
      paymentDate: params.paymentDate,
      paymentStatus: params.paymentStatus,
      comment: params.comment,
    }

    setPayments([...payments, payment])
    closePaymentModal()
  }

  const removePayment = (id) => {
    setPayments(payments.filter(payment => payment.id !== id))
  }

  const useMutateEditOrder = useOrderEdit({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['order-statuses', 'get', { filters: { includeAll: true, includeCount: true } }] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateCreateClient = useClientCreate({
    options: {
      onSuccess: ({ data }) => {
        closeClientModal()
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        closeClientModal()
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const createClient = (params) => {
    setIsLoading(true)
    useMutateCreateClient.mutate(params)
    setIsLoading(false)
    closeClientModal()
  }

  const editOrder = (params) => {
    setIsLoading(true)
    params.id = order.id
    params.items = params.items.map(item => ({
      ...item,
      currency: item.selectedCurrency.id,
      price: item.selectedPrice || item.price,
      discountAmount: item.discountAmount || 0,
      discountPercent: item.discountPercent || 0,
    }))

    params.orderPayments = payments.map(payment => ({
      ...payment,
      cashregister: payment.cashregister.id,
      cashregisterAccount: payment.cashregisterAccount.id,
      currency: payment.currency.id,
    }))

    useMutateEditOrder.mutate(params)
    navigate('/orders')
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
      clientForm,
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
    [isClientModalOpen, isPaymentModalOpen, isLoading, paymentForm, informationForm, clientForm, payments],
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
