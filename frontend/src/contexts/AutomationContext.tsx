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
  useAutomationCreate,
  useAutomationEdit,
  useAutomationRemove,
} from '@/api/hooks'

interface AutomationContextType {
  selectedAutomation: Automation
  isModalOpen: boolean
  isConditionSheetOpen: boolean
  isActionSheetOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: UseFormReturn
  conditionForm: UseFormReturn
  actionForm: UseFormReturn
  selectedConditions: any[]
  selectedActions: any[]
  openModal: (automation?: Automation) => void
  closeModal: () => void
  openConditionSheet: () => void
  closeConditionSheet: () => void
  openActionSheet: () => void
  closeActionSheet: () => void
  submitAutomationForm: (params) => void
  submitConditionForm: (params) => void
  submitActionForm: (params) => void
  removeAutomation: (params: { ids: string[] }) => void
  removeCondition: (params: { id: string }) => void
  removeAction: (params: { id: string }) => void
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined)

interface AutomationProviderProps {
  children: ReactNode
}

export function AutomationProvider({ children }: AutomationProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConditionSheetOpen, setIsConditionSheetOpen] = useState(false)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState(null)
  const [selectedConditions, setSelectedConditions] = useState([])
  const [selectedActions, setSelectedActions] = useState([])

  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      name: z.string({ required_error: t('form.errors.required') }),
      trigger: z.string({ required_error: t('form.errors.required') }),
      params: z.array(z.string({ required_error: t('form.errors.required') })),
      active: z.boolean().optional().default(true),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      trigger: '',
      params: [],
      active: true,
    },
  })

  const conditionFormSchema = useMemo(() =>
    z.object({
      field: z.string({ required_error: t('form.errors.required') }).optional(),
      operator: z.string({ required_error: t('form.errors.required') }).optional(),
      params: z.array(z.string({ required_error: t('form.errors.required') })).optional(),
    }), [t])

  const conditionForm = useForm({
    resolver: zodResolver(conditionFormSchema),
    defaultValues: {
      field: '',
      operator: '',
      params: [],
    },
  })

  const actionFormSchema = useMemo(() =>
    z.object({
      field: z.string({ required_error: t('form.errors.required') }).optional(),
      params: z.array(z.string({ required_error: t('form.errors.required') })).optional(),
    }), [t])

  const actionForm = useForm({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      field: '',
      params: [],
    },
  })

  const queryClient = useQueryClient()

  function getAutomationFormValues(automation) {
    if (!automation) {
      return {
        name: '',
        trigger: '',
        params: [],
        conditions: [],
        actions: [],
        active: true,
      }
    }
    return {
      name: automation.name,
      trigger: automation.trigger.type,
      params: automation.trigger.params,
      conditions: automation.conditions,
      actions: automation.actions,
      active: automation.active,
    }
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedAutomation(null)
    setSelectedConditions([])
    setSelectedActions([])
    form.reset()
  }

  const openModal = (automation) => {
    setIsModalOpen(true)
    setIsEdit(!!automation)
    setSelectedAutomation(automation)
    setSelectedConditions(automation?.conditions || [])
    setSelectedActions(automation?.actions || [])
    form.reset(getAutomationFormValues(automation))
  }

  const closeConditionSheet = () => {
    if (!isConditionSheetOpen)
      return
    setIsConditionSheetOpen(false)
    conditionForm.reset()
  }

  const openConditionSheet = () => {
    setIsConditionSheetOpen(true)
    conditionForm.reset()
  }

  const closeActionSheet = () => {
    if (!isActionSheetOpen)
      return
    setIsActionSheetOpen(false)
    actionForm.reset()
  }

  const openActionSheet = () => {
    setIsActionSheetOpen(true)
    actionForm.reset()
  }

  const submitConditionForm = (params) => {
    setSelectedConditions(state => [...state, params])
    setIsConditionSheetOpen(false)
  }

  const submitActionForm = (params) => {
    setSelectedActions(state => [...state, params])
    setIsActionSheetOpen(false)
  }

  const removeCondition = (params) => {
    setSelectedConditions(state => state.filter(item => item.id !== params.id))
  }

  const removeAction = (params) => {
    setSelectedActions(state => state.filter(item => item.id !== params.id))
  }

  const useMutateCreateAutomation = useAutomationCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['automations'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateEditAutomation = useAutomationEdit({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        queryClient.invalidateQueries({ queryKey: ['automations'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        closeModal()
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const useMutateRemoveAutomation = useAutomationRemove({
    options: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({ queryKey: ['automations'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeAutomation = (params) => {
    useMutateRemoveAutomation.mutate(params)
  }

  const submitAutomationForm = (params) => {
    setIsLoading(true)

    params.conditions = selectedConditions
    params.actions = selectedActions
    params.trigger = {
      type: params.trigger,
      params: params.params,
    }
    delete params.params

    if (!isEdit)
      return useMutateCreateAutomation.mutate(params)

    return useMutateEditAutomation.mutate({ ...params, id: selectedAutomation.id })
  }

  const value: AutomationContextType = useMemo(
    () => ({
      selectedAutomation,
      isModalOpen,
      isConditionSheetOpen,
      isActionSheetOpen,
      isLoading,
      isEdit,
      form,
      conditionForm,
      actionForm,
      selectedConditions,
      selectedActions,
      removeCondition,
      removeAction,
      closeConditionSheet,
      openConditionSheet,
      closeActionSheet,
      openActionSheet,
      openModal,
      closeModal,
      submitAutomationForm,
      submitConditionForm,
      submitActionForm,
      removeAutomation,
    }),
    [selectedAutomation, isModalOpen, isConditionSheetOpen, isActionSheetOpen, isLoading, isEdit, form, conditionForm, actionForm, selectedConditions, selectedActions],
  )

  return <AutomationContext.Provider value={value}>{children}</AutomationContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAutomationContext(): AutomationContextType {
  const context = useContext(AutomationContext)
  if (!context) {
    throw new Error('useAutomationContext - AutomationContext')
  }
  return context
}
