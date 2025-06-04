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
  useCreateUserRole,
  useDuplicateUserRoles,
  useEditUserRole,
  useImportUserRoles,
  useRemoveUserRoles,
} from '@/api/hooks/'

interface UserRoleContextType {
  selectedUserRole: UserRole
  isModalOpen: boolean
  isLoading: boolean
  form: UseFormReturn
  toggleModal: (userRole?: UserRole) => void
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
  const [selectedUserRole, setSelectedUserRole] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      names: z.record(z.string().min(1, { message: t('form.errors.required') })),
      permissions: z.array(z.string()),
      priority: z.preprocess(val => Number(val), z.number()).default(0).optional(),
      active: z.boolean().default(true).optional(),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      permissions: [],
      priority: 0,
      active: true,
    },
  })

  const queryClient = useQueryClient()

  const useMutateCreateUserRole = useCreateUserRole({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUserRole(null)
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUserRole(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateUserRoles = useDuplicateUserRoles({
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

  const useMutateEditUserRole = useEditUserRole({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUserRole(null)
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUserRole(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveUserRoles = useRemoveUserRoles({
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

  const useMutateImportUserRoles = useImportUserRoles({
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

  const openModal = (userRole) => {
    setIsModalOpen(true)
    let userRoleValues = {}
    if (userRole) {
      setSelectedUserRole(userRole)
      userRoleValues = {
        names: userRole.names,
        permissions: userRole.permissions,
        priority: userRole.priority,
        active: userRole.active,
      }
    }
    form.reset(userRoleValues)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedUserRole(null)
    form.reset()
  }

  const toggleModal = user => (isModalOpen ? closeModal() : openModal(user))

  const submitUserRoleForm = (params) => {
    setIsLoading(true)
    if (!selectedUserRole) {
      useMutateCreateUserRole.mutate(params)
    }
    else {
      useMutateEditUserRole.mutate({ ...params, id: selectedUserRole.id })
    }
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
      form,
      toggleModal,
      openModal,
      closeModal,
      submitUserRoleForm,
      removeUserRoles,
      importUserRoles,
      duplicateUserRoles,
    }),
    [selectedUserRole, isModalOpen, isLoading, form, openModal, closeModal, submitUserRoleForm, removeUserRoles, importUserRoles, duplicateUserRoles],
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
