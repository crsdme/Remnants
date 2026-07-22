import type { BarcodeDTO, GetBarcodeByCodeResponse } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { createContext, useContext } from 'react'
import { z } from 'zod'

export interface BarcodeFormValues {
  code: string
  active: boolean
  products: {
    id: string
    unitsPerScan: number
  }[]
}

export interface BarcodeFormContextType {
  isLoading: boolean
  form: UseFormReturn<BarcodeFormValues>
  submitBarcodeForm: (params: BarcodeFormValues) => void
  generateBarcode: () => Promise<void>
  getBarcode: (code: string) => Promise<GetBarcodeByCodeResponse>
  cancelForm: () => void
}

const BarcodeFormContext = createContext<BarcodeFormContextType | undefined>(undefined)

export function BarcodeFormProvider({
  value,
  children,
}: {
  value: BarcodeFormContextType
  children: ReactNode
}) {
  return <BarcodeFormContext.Provider value={value}>{children}</BarcodeFormContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBarcodeFormContext(): BarcodeFormContextType {
  const context = useContext(BarcodeFormContext)
  if (!context) {
    throw new Error('useBarcodeFormContext - BarcodeFormContext')
  }
  return context
}

export function getBarcodeFormValues(barcode?: BarcodeDTO): BarcodeFormValues {
  if (!barcode) {
    return {
      code: '',
      active: true,
      products: [],
    }
  }

  return {
    code: barcode.code,
    active: barcode.active,
    products: barcode.products.map(product => ({
      ...product,
      unitsPerScan: product.unitsPerScan,
    })),
  }
}

export function createBarcodeFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    code: z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim(),
    active: z.boolean().default(true),
    products: z.array(z.object({
      id: z.string({
        required_error: t('form.errors.required'),
      }),
      unitsPerScan: z.number({
        required_error: t('form.errors.required'),
      }),
    })).min(1, { message: t('form.errors.required.products') }),
  })
}
