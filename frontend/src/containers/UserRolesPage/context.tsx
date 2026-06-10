import type { UserRoleDTO } from '@remnant/shared'
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
  useUserRoleCreate,
  useUserRoleEdit,
  useUserRoleRemove,
} from '@/api/hooks/'

interface UserRoleContextType {
  selectedUserRole: UserRoleDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn<UserRoleFormValues>
  openModal: (userRole?: UserRoleDTO) => void
  closeModal: () => void
  submitUserRoleForm: (params: UserRoleFormValues) => void
  removeUserRoles: (params: { ids: string[] }) => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

interface UserRoleFormValues {
  names: Record<string, string>
  permissions: string[]
  priority: number
  active: boolean
}

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedUserRole, setSelectedUserRole] = useState<UserRoleDTO | undefined>(undefined)
  const { t } = useTranslation()

  const formSchema = useMemo(() => createUserRoleFormSchema(t), [t])

  const form = useForm<UserRoleFormValues>({
    resolver: zodResolver(formSchema) as Resolver<UserRoleFormValues>,
    defaultValues: getUserRoleFormValues(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsEdit(false)
    setSelectedUserRole(undefined)
    form.reset()
  }

  const openModal = (userRole?: UserRoleDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!userRole)
    setSelectedUserRole(userRole)
    form.reset(getUserRoleFormValues(userRole))
  }

  const useMutateCreateUserRole = useUserRoleCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditUserRole = useUserRoleEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['user-roles'] })
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
        void queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitUserRoleForm = (params: UserRoleFormValues) => {
    if (!isEdit || !selectedUserRole)
      return useMutateCreateUserRole.mutate(params)

    return useMutateEditUserRole.mutate({ ...params, id: selectedUserRole.id })
  }

  const removeUserRoles = (params: { ids: string[] }) => {
    useMutateRemoveUserRoles.mutate(params)
  }

  const isLoading = useMutateCreateUserRole.isPending || useMutateEditUserRole.isPending || useMutateRemoveUserRoles.isPending

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

function createUserRoleFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    names: z.record(z.string({ required_error: t('form.errors.required') }).min(3, { message: t('form.errors.min_length', { count: 3 }) }).trim()),
    permissions: z.array(z.string()),
    priority: z.preprocess(val => Number(val), z.number()).default(0).optional(),
    active: z.boolean().default(true).optional(),
  })
}

function getUserRoleFormValues(userRole?: UserRoleDTO): UserRoleFormValues {
  if (!userRole) {
    return {
      names: {},
      permissions: [],
      priority: 0,
      active: true,
    }
  }
  return {
    names: { ...userRole.names },
    permissions: [...userRole.permissions],
    priority: userRole.priority,
    active: userRole.active,
  }
}
