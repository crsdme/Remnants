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
  useUserCreate,
  useUserDuplicate,
  useUserEdit,
  useUserImport,
  useUserRemove,
} from '@/api/hooks/'

interface UserContextType {
  selectedUser: User
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  openModal: (user?: User) => void
  closeModal: () => void
  submitUserForm: (params) => void
  removeUsers: (params: { ids: string[] }) => void
  importUsers: (params) => void
  duplicateUsers: (params: { ids: string[] }) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      name: z.string({ required_error: t('form.errors.required') }).min(5, { message: t('form.errors.min_length', { count: 5 }) }).trim(),
      login: z.string({ required_error: t('form.errors.required') }).min(5, { message: t('form.errors.min_length', { count: 5 }) }).trim(),
      password: z.string().optional(),
      role: z.string({ required_error: t('form.errors.required') }).trim(),
      active: z.boolean().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      login: '',
      password: '',
      active: true,
      role: '',
    },
  })

  const getUserFormValues = (user) => {
    if (!user) {
      return {
        name: '',
        login: '',
        password: '',
        active: true,
        role: '',
      }
    }
    return {
      name: user.name,
      login: user.login,
      password: user.password,
      active: user.active,
      role: user.role.id,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedUser(null)
    form.reset()
  }

  const openModal = (user) => {
    setIsModalOpen(true)
    setIsEdit(!!user)
    setSelectedUser(user)
    form.reset(getUserFormValues(user))
  }

  const queryClient = useQueryClient()

  const useMutateCreateUser = useUserCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateDuplicateUsers = useUserDuplicate({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditUser = useUserEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveUsers = useUserRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateImportUsers = useUserImport({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const submitUserForm = (params) => {
    setIsLoading(true)
    if (!isEdit)
      return useMutateCreateUser.mutate(params)

    return useMutateEditUser.mutate({ ...params, id: selectedUser.id })
  }

  const removeUsers = (params) => {
    useMutateRemoveUsers.mutate(params)
  }

  const importUsers = (params) => {
    useMutateImportUsers.mutate(params)
  }

  const duplicateUsers = (params) => {
    useMutateDuplicateUsers.mutate(params)
  }

  const value: UserContextType = useMemo(
    () => ({
      selectedUser,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      openModal,
      closeModal,
      submitUserForm,
      removeUsers,
      importUsers,
      duplicateUsers,
    }),
    [selectedUser, isModalOpen, isLoading, isEdit, form],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserContext(): UserContextType {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext - UserContext')
  }
  return context
}
