import type { ReactNode } from 'react'
import {
  useCreateUser,
  useDuplicateUsers,
  useEditUser,
  useImportUsers,
  useRemoveUsers,
} from '@/api/hooks/'

import { useQueryClient } from '@tanstack/react-query'

import { createContext, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'

interface UserContextType {
  selectedUser: User
  isModalOpen: boolean
  isLoading: boolean
  toggleModal: (user?: User) => void
  openModal: (user?: User) => void
  closeModal: () => void
  submitUserForm: (params) => void
  removeUsers: (params: { _ids: string[] }) => void
  importUsers: (params) => void
  duplicateUsers: (params: { _ids: string[] }) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const useMutateCreateUser = useCreateUser({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUser(null)
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUser(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description}` })
      },
    },
  })

  const useMutateDuplicateUsers = useDuplicateUsers({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description}` })
      },
    },
  })

  const useMutateEditUser = useEditUser({
    options: {
      onSuccess: ({ data }) => {
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUser(null)
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsModalOpen(false)
        setIsLoading(false)
        setSelectedUser(null)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description}` })
      },
    },
  })

  const useMutateRemoveUsers = useRemoveUsers({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description}` })
      },
    },
  })

  const useMutateImportUsers = useImportUsers({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description}` })
      },
    },
  })

  const openModal = (user) => {
    setIsModalOpen(true)
    if (user)
      setSelectedUser(user)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsLoading(false)
    setSelectedUser(null)
  }

  const toggleModal = user => (isModalOpen ? closeModal() : openModal(user))

  const submitUserForm = (params) => {
    setIsLoading(true)
    if (!selectedUser) {
      useMutateCreateUser.mutate(params)
    }
    else {
      useMutateEditUser.mutate({ ...params, _id: selectedUser._id })
    }
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
      toggleModal,
      openModal,
      closeModal,
      submitUserForm,
      removeUsers,
      importUsers,
      duplicateUsers,
    }),
    [selectedUser, isModalOpen, isLoading, openModal, closeModal, submitUserForm, removeUsers, importUsers, duplicateUsers],
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
