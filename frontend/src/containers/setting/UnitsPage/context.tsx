import type { UnitDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  useUnitCreate,
  useUnitEdit,
  useUnitRemove,
} from '@/api/hooks/'
import { useLocale } from '@/utils/hooks'

interface UnitFormValues {
  names: Record<string, string>
  symbols: Record<string, string>
  priority: number
  active: boolean
}

interface UnitContextType {
  selectedUnit: UnitDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<UnitFormValues>
  openModal: (unit?: UnitDTO) => void
  closeModal: () => void
  submitUnitForm: (params: UnitFormValues) => void
  removeUnit: (params: { ids: string[] }) => void
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

export function UnitProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<UnitDTO | undefined>(undefined)

  const { t } = useLocale()

  const formSchema = useMemo(() => createUnitFormSchema(t), [t])

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(formSchema) as Resolver<UnitFormValues>,
    defaultValues: getUnitFormValues(),
  })

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedUnit(undefined)
    form.reset()
  }

  const openModal = (unit?: UnitDTO) => {
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
        void queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditUnit = useUnitEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['units'] })
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
        void queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitUnitForm = (params: UnitFormValues) => {
    if (!selectedUnit || !isEdit)
      return useMutateCreateUnit.mutate(params)

    return useMutateEditUnit.mutate({ ...params, id: selectedUnit.id })
  }

  const removeUnit = (params: { ids: string[] }) => {
    useMutateRemoveUnit.mutate(params)
  }

  const isLoading = useMutateCreateUnit.isPending || useMutateEditUnit.isPending || useMutateRemoveUnit.isPending

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

function createUnitFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    symbols: z.record(z.string({ required_error: t('form.errors.required') }).min(1, { message: t('form.errors.min_length', { count: 1 }) }).trim()),
    priority: z.number().default(0),
    active: z.boolean().default(true),
  })
}

function getUnitFormValues(unit?: UnitDTO): UnitFormValues {
  if (!unit) {
    return {
      names: {},
      symbols: {},
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
