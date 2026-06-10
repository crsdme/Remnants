import type { AutomationDTO } from '@remnant/shared'
import type { ReactNode } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  useAutomationCreate,
  useAutomationEdit,
  useAutomationRemove,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

interface AutomationContextType {
  selectedAutomation: AutomationDTO | undefined
  isModalOpen: boolean
  isConditionSheetOpen: boolean
  isActionSheetOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: any
  conditionForm: any
  actionForm: any
  selectedConditions: any[]
  selectedActions: any[]
  openModal: (automation?: AutomationDTO) => void
  closeModal: () => void
  openConditionSheet: () => void
  closeConditionSheet: () => void
  openActionSheet: () => void
  closeActionSheet: () => void
  submitAutomationForm: (params: any) => void
  submitConditionForm: (params: any) => void
  submitActionForm: (params: any) => void
  removeAutomation: (params: { ids: string[] }) => void
  removeCondition: (params: { id: string }) => void
  removeAction: (params: { id: string }) => void
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined)

function createAutomationFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    name: z.string({ required_error: t('form.errors.required') }),
    trigger: z.string({ required_error: t('form.errors.required') }),
    params: z.array(z.string({ required_error: t('form.errors.required') })),
    active: z.boolean().optional().default(true),
  })
}

function getAutomationFormDefaults() {
  return {
    name: '',
    trigger: '',
    params: [],
    active: true,
  }
}

function createConditionFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    field: z.string({ required_error: t('form.errors.required') }).optional(),
    operator: z.string({ required_error: t('form.errors.required') }).optional(),
    params: z.array(z.string({ required_error: t('form.errors.required') })).optional(),
  })
}

function getConditionFormDefaults() {
  return {
    field: '',
    operator: '',
    params: [],
  }
}

function createActionFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    field: z.string({ required_error: t('form.errors.required') }).optional(),
    params: z.array(z.string({ required_error: t('form.errors.required') })).optional(),
  })
}

function getActionFormDefaults() {
  return {
    field: '',
    params: [],
  }
}

function getAutomationFormValues(automation?: AutomationDTO) {
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

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConditionSheetOpen, setIsConditionSheetOpen] = useState(false)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationDTO | undefined>(undefined)
  const [selectedConditions, setSelectedConditions] = useState<any[]>([])
  const [selectedActions, setSelectedActions] = useState<any[]>([])

  const { t } = useLocale()

  const formSchema = useMemo(() => createAutomationFormSchema(t), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getAutomationFormDefaults(),
  })

  const conditionFormSchema = useMemo(() => createConditionFormSchema(t), [t])

  const conditionForm = useForm({
    resolver: zodResolver(conditionFormSchema),
    defaultValues: getConditionFormDefaults(),
  })

  const actionFormSchema = useMemo(() => createActionFormSchema(t), [t])

  const actionForm = useForm({
    resolver: zodResolver(actionFormSchema),
    defaultValues: getActionFormDefaults(),
  })

  const queryClient = useQueryClient()

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedAutomation(undefined)
    setSelectedConditions([])
    setSelectedActions([])
    form.reset()
  }

  const openModal = (automation?: AutomationDTO) => {
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

  const submitConditionForm = (params: any) => {
    setSelectedConditions(state => [...state, params])
    setIsConditionSheetOpen(false)
  }

  const submitActionForm = (params: any) => {
    setSelectedActions(state => [...state, params])
    setIsActionSheetOpen(false)
  }

  const removeCondition = (params: { id: string }) => {
    setSelectedConditions(state => state.filter(item => item.id !== params.id))
  }

  const removeAction = (params: { id: string }) => {
    setSelectedActions(state => state.filter(item => item.id !== params.id))
  }

  const useMutateCreateAutomation = useAutomationCreate({
    options: {
      onSuccess: ({ data }) => {
        closeModal()
        void queryClient.invalidateQueries({ queryKey: ['automations'] })
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
        void queryClient.invalidateQueries({ queryKey: ['automations'] })
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
        void queryClient.invalidateQueries({ queryKey: ['automations'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const removeAutomation = (params: { ids: string[] }) => {
    useMutateRemoveAutomation.mutate(params)
  }

  const submitAutomationForm = (params: any) => {
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

    if (!selectedAutomation)
      return

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
