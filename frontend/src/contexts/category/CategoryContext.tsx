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
  useBatchCategory,
  useCreateCategory,
  useDuplicateCategories,
  useEditCategory,
  useExportCategories,
  useImportCategories,
  useRemoveCategories,
} from '@/api/hooks'
import { downloadBlob } from '@/utils/helpers/download'

interface CategoryContextType {
  selectedCategory: Category
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (category?: Category) => void
  closeModal: () => void
  submitCategoryForm: (params) => void
  batchCategories: (params) => void
  removeCategories: (params: { ids: string[] }) => void
  importCategories: (params) => void
  duplicateCategories: (params: { ids: string[] }) => void
  exportCategories: (params: { ids: string[] }) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

interface CategoryProviderProps {
  children: ReactNode
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      priority: z.number().default(0),
      parent: z.string().optional(),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {
        en: '',
        ru: '',
      },
      priority: 0,
      parent: '',
      active: true,
    },
  })

  const queryClient = useQueryClient()

  const getCategoryFormValues = (category) => {
    if (!category) {
      return {
        names: {},
        priority: 0,
        parent: '',
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

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedCategory(null)
    form.reset()
  }

  const openModal = (category) => {
    setIsModalOpen(true)
    setIsEdit(!!category)
    setSelectedCategory(category)
    form.reset(getCategoryFormValues(category))
  }

  const useMutateCreateCategory = useCreateCategory({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateCategories = useDuplicateCategories({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditCategory = useEditCategory({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveCategory = useRemoveCategories({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportCategories = useImportCategories({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateBatchCategory = useBatchCategory({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateExportCategories = useExportCategories({
    options: {
      onSuccess: ({ data, headers }) => {
        downloadBlob(data, 'categories-template.xlsx')
        toast.success(t(`response.title.${headers['x-export-code']}`), { description: `${t(`response.description.${headers['x-export-code']}`)} ${headers['x-export-message'] || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeCategories = (params) => {
    useMutateRemoveCategory.mutate(params)
  }

  const batchCategories = (params) => {
    useMutateBatchCategory.mutate(params)
  }

  const importCategories = (params) => {
    useMutateImportCategories.mutate(params)
  }

  const duplicateCategories = (params) => {
    useMutateDuplicateCategories.mutate(params)
  }

  const exportCategories = (params) => {
    useMutateExportCategories.mutate(params)
  }

  const submitCategoryForm = (params) => {
    setIsLoading(true)
    if (!selectedCategory) {
      if (params.parent === '')
        params.parent = undefined
      return useMutateCreateCategory.mutate(params)
    }

    return useMutateEditCategory.mutate({ ...params, id: selectedCategory.id })
  }

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
      batchCategories,
      importCategories,
      duplicateCategories,
      exportCategories,
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
