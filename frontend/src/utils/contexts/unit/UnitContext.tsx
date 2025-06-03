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
  useBatchUnit,
  useCreateUnit,
  useDuplicateUnits,
  useEditUnit,
  useImportUnits,
  useRemoveUnits,
} from '@/api/hooks/'

interface UnitContextType {
  selectedUnit: Unit
  isModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn
  toggleModal: (unit?: Unit) => void
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
  const [selectedUnit, setSelectedUnit] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      symbols: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().default(0),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      symbols: {},
      priority: 0,
      active: true,
    },
  })

  const queryClient = useQueryClient()

  const useMutateCreateUnit = useCreateUnit({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateUnits = useDuplicateUnits({
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

  const useMutateEditUnit = useEditUnit({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveUnit = useRemoveUnits({
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

  const useMutateImportUnits = useImportUnits({
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

  const useMutateBatchUnit = useBatchUnit({
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

  const openModal = (unit) => {
    setIsModalOpen(true)
    if (unit) {
      setSelectedUnit(unit)
      const unitValues = {
        names: { ...unit.names },
        symbols: { ...unit.symbols },
        priority: unit.priority,
        active: unit.active,
      }
      form.reset(unitValues)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedUnit(null)
    form.reset()
  }

  const toggleModal = unit => (isModalOpen ? closeModal() : openModal(unit))

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
      form,
      toggleModal,
      openModal,
      closeModal,
      submitUnitForm,
      removeUnit,
      batchUnit,
      importUnits,
      duplicateUnits,
    }),
    [selectedUnit, isModalOpen, isLoading, openModal, closeModal, submitUnitForm, removeUnit, batchUnit, importUnits, duplicateUnits],
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
