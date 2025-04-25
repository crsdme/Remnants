import type { ReactNode } from 'react'
import { useCreateCategory, useEditCategory, useRemoveCategory } from '@/api/hooks/'

import { useLess } from '@siberiacancode/reactuse'

import { useQueryClient } from '@tanstack/react-query'

import { createContext, use, useState } from 'react'

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
  const [selectedCategorys, setSelectedCategory] = useState(null)
  const selectedCategory = useLess(selectedCategorys)

  const queryClient = useQueryClient()

  const useMutateCreateCategory = useCreateCategory({
    options: {
      onSuccess: () => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedCategory(null)
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

  const value: CategoryContextType = {
    selectedCategory,
    isModalOpen,
    isLoading,
    openModal,
    closeModal,
    submitCategoryForm,
    removeCategory,
  }

  return <CategoryContext value={value}>{children}</CategoryContext>
}

export function useCategoryContext(): CategoryContextType {
  const context = use(CategoryContext)
  if (!context) {
    throw new Error('useCategoryContext - CategoryContext')
  }
  return context
}
