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
  useUserRoleCreate,
  useUserRoleDuplicate,
  useUserRoleEdit,
  useUserRoleImport,
  useUserRoleRemove,
} from '@/api/hooks/'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'

interface UserRoleContextType {
  selectedUserRole: UserRole
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (userRole?: UserRole) => void
  closeModal: () => void
  submitUserRoleForm: (params) => void
  removeUserRoles: (params: { ids: string[] }) => void
  importUserRoles: (params) => void
  duplicateUserRoles: (params: { ids: string[] }) => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

interface UserRoleProviderProps {
  children: ReactNode
}

export function UserRoleProvider({ children }: UserRoleProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedUserRole, setSelectedUserRole] = useState(null)

  const { t } = useTranslation()

  const defaultLanguageValues = SUPPORTED_LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {})

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
      permissions: z.array(z.string()),
      priority: z.preprocess(val => Number(val), z.number()).default(0).optional(),
      active: z.boolean().default(true).optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: defaultLanguageValues,
      permissions: [],
      priority: 0,
      active: true,
    },
  })

  const queryClient = useQueryClient()

  const getUserRoleFormValues = (userRole) => {
    if (!userRole) {
      return {
        names: defaultLanguageValues,
        permissions: [],
        priority: 0,
        active: true,
      }
    }
    return {
      names: { ...userRole.names },
      permissions: userRole.permissions,
      priority: userRole.priority,
      active: userRole.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedUserRole(null)
    form.reset()
  }

  const openModal = (userRole) => {
    setIsModalOpen(true)
    setIsEdit(!!userRole)
    setSelectedUserRole(userRole)
    form.reset(getUserRoleFormValues(userRole))
  }

  const useMutateCreateUserRole = useUserRoleCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateUserRoles = useUserRoleDuplicate({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditUserRole = useUserRoleEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveUserRoles = useUserRoleRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportUserRoles = useUserRoleImport({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitUserRoleForm = (params) => {
    setIsLoading(true)
    if (!isEdit)
      return useMutateCreateUserRole.mutate(params)

    return useMutateEditUserRole.mutate({ ...params, id: selectedUserRole.id })
  }

  const removeUserRoles = (params) => {
    useMutateRemoveUserRoles.mutate(params)
  }

  const importUserRoles = (params) => {
    useMutateImportUserRoles.mutate(params)
  }

  const duplicateUserRoles = (params) => {
    useMutateDuplicateUserRoles.mutate(params)
  }

  const value: UserRoleContextType = useMemo(
    () => ({
      selectedUserRole,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitUserRoleForm,
      removeUserRoles,
      importUserRoles,
      duplicateUserRoles,
    }),
    [selectedUserRole, isModalOpen, isLoading, isEdit, form],
  )

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserRoleContext(): UserRoleContextType {
  const context = useContext(UserRoleContext)
  if (!context) {
    throw new Error('useUserRoleContext - UserRoleContext')
  }
  return context
}
