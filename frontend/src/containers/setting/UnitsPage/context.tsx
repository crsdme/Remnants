import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  useUnitBatch,
  useUnitCreate,
  useUnitDuplicate,
  useUnitEdit,
  useUnitImport,
  useUnitRemove,
} from '@/api/hooks/'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface UnitContextType {
  selectedUnit: Unit
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (unit?: Unit) => void
  closeModal: () => void
  submitUnitForm: (params) => void
  batchUnit: (params) => void
  removeUnit: (params: { ids: string[] }) => void
  importUnits: (params) => void
  duplicateUnits: (params: { ids: string[] }) => void
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

interface UnitProviderProps {
  children: ReactNode
}

export function UnitProvider({ children }: UnitProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      symbols: z.record(z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.min_length', { count: 1 }) }).trim()),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      symbols: defaultLanguageValues,
      priority: 0,
      active: true,
    },
  })

  const getUnitFormValues = (unit) => {
    if (!unit) {
      return {
        names: defaultLanguageValues,
        symbols: defaultLanguageValues,
        priority: 0,
        active: true,
      }
    }
    return {
      names: { ...unit.names },
      symbols: { ...unit.symbols },
      priority: unit.priority,
      active: unit.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedUnit(null)
    form.reset()
  }

  const openModal = (unit) => {
    setIsModalOpen(true)
    setIsEdit(!!unit)
    setSelectedUnit(unit)
    form.reset(getUnitFormValues(unit))
  }

  const queryClient = useQueryClient()

  const useMutateCreateUnit = useUnitCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateUnits = useUnitDuplicate({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditUnit = useUnitEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveUnit = useUnitRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportUnits = useUnitImport({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateBatchUnit = useUnitBatch({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitUnitForm = (params) => {
    setIsLoading(true)
    if (!selectedUnit) {
      useMutateCreateUnit.mutate(params)
    }
    else {
      useMutateEditUnit.mutate({ ...params, id: selectedUnit.id })
    }
  }

  const removeUnit = (params) => {
    useMutateRemoveUnit.mutate(params)
  }

  const batchUnit = (params) => {
    useMutateBatchUnit.mutate(params)
  }

  const importUnits = (params) => {
    useMutateImportUnits.mutate(params)
  }

  const duplicateUnits = (params) => {
    useMutateDuplicateUnits.mutate(params)
  }

  const value: UnitContextType = useMemo(
    () => ({
      selectedUnit,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitUnitForm,
      removeUnit,
      batchUnit,
      importUnits,
      duplicateUnits,
    }),
    [selectedUnit, isModalOpen, isLoading, isEdit, form],
  )

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUnitContext(): UnitContextType {
  const context = useContext(UnitContext)
  if (!context) {
    throw new Error('useUnitContext - UnitContext')
  }
  return context
}
