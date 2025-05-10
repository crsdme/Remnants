import type { ReactNode } from 'react'
import { useCreateCategory, useEditCategory, useRemoveCategory } from '@/api/hooks/'

import { useQueryClient } from '@tanstack/react-query'

import { createContext, useContext, useMemo, useState } from 'react'

interface CategoryContextType {
  selectedCategory: Category
  isModalOpen: boolean
  isLoading: boolean
  openModal: (item?: Category) => void
  closeModal: () => void
  submitCategoryForm: (params: Category) => void
  removeCategory: (params: { _id: string }) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

interface CategoryProviderProps {
  children: ReactNode
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const queryClient = useQueryClient()

  const useMutateCreateCategory = useCreateCategory({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      },
    },
  })

  const useMutateEditCategory = useEditCategory({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedCategory(null)
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      },
    },
  })

  const useMutateRemoveCategory = useRemoveCategory({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      },
    },
  })

  const openModal = (category) => {
    setIsModalOpen(true)
    if (category)
      setSelectedCategory(category)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedCategory(null)
  }

  const submitCategoryForm = (params) => {
    const value = { ...params, parent: params.parent?.value }
    setIsLoading(true)
    if (!selectedCategory) {
      useMutateCreateCategory.mutate(value)
    }
    else {
      useMutateEditCategory.mutate({ ...value, _id: selectedCategory._id })
    }
  }

  const removeCategory = (params) => {
    useMutateRemoveCategory.mutate(params)
  }

  const value: CategoryContextType = useMemo(
    () => ({
      selectedCategory,
      isModalOpen,
      isLoading,
      openModal,
      closeModal,
      submitCategoryForm,
      removeCategory,
    }),
    [selectedCategory, isModalOpen, isLoading, openModal, closeModal, submitCategoryForm, removeCategory],
  )

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCategoryContext(): CategoryContextType {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategoryContext - CategoryContext')
  }
  return context
}
