import type { ReactNode } from 'react'
import {
  useBatchUnit,
  useCreateUnit,
  useDuplicateUnits,
  useEditUnit,
  useImportUnits,
  useRemoveUnits,
} from '@/api/hooks/'

import { useQueryClient } from '@tanstack/react-query'

import { createContext, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'

interface UnitContextType {
  selectedUnit: Unit
  isModalOpen: boolean
  isLoading: boolean
  toggleModal: (unit?: Unit) => void
  openModal: (unit?: Unit) => void
  closeModal: () => void
  submitUnitForm: (params) => void
  batchUnit: (params) => void
  removeUnit: (params: { _ids: string[] }) => void
  importUnits: (params) => void
  duplicateUnits: (params: { _ids: string[] }) => void
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

  const queryClient = useQueryClient()

  const useMutateCreateUnit = useCreateUnit({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        queryClient.invalidateQueries({ queryKey: ['units'] })
      },
      onError: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        toast.error(t('page.units.toast.createUnit.error'))
      },
    },
  })

  const useMutateDuplicateUnits = useDuplicateUnits({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t('page.units.toast.duplicateUnits.success'))
      },
      onError: () => {
        toast.error(t('page.units.toast.duplicateUnits.error'))
      },
    },
  })

  const useMutateEditUnit = useEditUnit({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        queryClient.invalidateQueries({ queryKey: ['units'] })
      },
      onError: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUnit(null)
        toast.error(t('page.units.toast.editUnit.error'))
      },
    },
  })

  const useMutateRemoveUnit = useRemoveUnits({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
      },
      onError: () => {
        toast.error(t('page.units.toast.removeUnit.error'))
      },
    },
  })

  const useMutateImportUnits = useImportUnits({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
      },
      onError: () => {
        toast.error(t('page.units.toast.importUnits.error'))
      },
    },
  })

  const useMutateBatchUnit = useBatchUnit({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['units'] })
        toast.success(t('page.units.toast.batchUnit.success'))
      },
      onError: () => {
        toast.error(t('page.units.toast.batchUnit.error'))
      },
    },
  })

  const openModal = (unit) => {
    setIsModalOpen(true)
    if (unit)
      setSelectedUnit(unit)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedUnit(null)
  }

  const toggleModal = unit => (isModalOpen ? closeModal() : openModal(unit))

  const submitUnitForm = (params) => {
    setIsLoading(true)
    if (!selectedUnit) {
      useMutateCreateUnit.mutate(params)
    }
    else {
      useMutateEditUnit.mutate({ ...params, _id: selectedUnit._id })
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
