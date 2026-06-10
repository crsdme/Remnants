import type { CategoryDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { Resolver, UseFormReturn } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useCategoryCreate,
  useCategoryEdit,
  useCategoryRemove,
} from '@/api/hooks'

interface CategoryContextType {
  selectedCategory: CategoryDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<CategoryFormValues>
  openModal: (category?: CategoryDTO) => void
  closeModal: () => void
  submitCategoryForm: (params: CategoryFormValues) => void
  removeCategories: (params: { ids: string[] }) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export interface CategoryFormValues {
  names: Record<string, string>
  priority: number
  parent: string | undefined
  active: boolean
}

function getCategoryFormValues(category?: CategoryDTO): CategoryFormValues {
  if (!category) {
    return {
      names: {},
      priority: 0,
      parent: undefined,
      active: true,
    }
  }
  return {
    names: { ...category.names },
    priority: category.priority,
    parent: category.parent || undefined,
    active: category.active,
  }
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | undefined>(undefined)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().default(0),
      parent: z.string().optional(),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CategoryFormValues>,
    defaultValues: getCategoryFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedCategory(undefined)
    form.reset()
  }

  const openModal = (category?: CategoryDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!category)
    setSelectedCategory(category ?? undefined)
    form.reset(getCategoryFormValues(category))
  }

  const useMutateCreateCategory = useCategoryCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCategory = useCategoryEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCategory = useCategoryRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeCategories = (params: { ids: string[] }) => {
    useMutateRemoveCategory.mutate(params)
  }

  const submitCategoryForm = (params: CategoryFormValues) => {
    if (!selectedCategory) {
      return useMutateCreateCategory.mutate({
        names: params.names,
        priority: params.priority,
        parent: params.parent,
        active: params.active,
      })
    }

    return useMutateEditCategory.mutate({
      id: selectedCategory.id,
      names: params.names,
      priority: params.priority,
      parent: params.parent,
      active: params.active,
    })
  }

  const isLoading = useMutateCreateCategory.isPending || useMutateEditCategory.isPending || useMutateRemoveCategory.isPending

  const value: CategoryContextType = useMemo(
    () => ({
      selectedCategory,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitCategoryForm,
      removeCategories,
    }),
    [selectedCategory, isModalOpen, isLoading, isEdit, form],
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
