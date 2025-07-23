import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { z } from 'zod'
import {
  useOrderQuery,
} from '@/api/hooks'
import { PAYMENT_STATUSES } from '@/utils/constants'

interface ViewOrderContextType {
  isLoading: boolean
  paymentForm: UseFormReturn
  informationForm: UseFormReturn
  clientForm: UseFormReturn
  payments: any[]
  disabled: boolean
}

const ViewOrderContext = createContext<ViewOrderContextType | undefined>(undefined)

interface ViewOrderProviderProps {
  children: ReactNode
}

export function ViewOrderProvider({ children }: ViewOrderProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState([])
  const { t } = useTranslation()
  const { id } = useParams()

  const disabled = true

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
      paymentDate: undefined,
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
      currency: z.object({
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
          }
        }),
        comment: order.comment,
      })
      setPayments(order.payments)
      setIsLoading(false)
    }
  }, [order])

  const value: ViewOrderContextType = useMemo(
    () => ({
      isLoading,
      paymentForm,
      informationForm,
      payments,
      clientForm,
      disabled,
    }),
    [isLoading, paymentForm, informationForm, clientForm, payments, disabled],
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
