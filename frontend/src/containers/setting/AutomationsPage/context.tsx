import type { AutomationAction, AutomationCondition, AutomationDTO } from '@remnant/shared'
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

export type ConditionRow = AutomationCondition & { id: string }
export type ActionRow = AutomationAction & { id: string }

interface AutomationContextType {
  selectedAutomation: AutomationDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  form: ReturnType<typeof useForm<z.infer<ReturnType<typeof createAutomationFormSchema>>>>
  conditionForm: ReturnType<typeof useForm<z.infer<ReturnType<typeof createConditionFormSchema>>>>
  actionForm: ReturnType<typeof useForm<z.infer<ReturnType<typeof createActionFormSchema>>>>
  selectedConditions: ConditionRow[]
  selectedActions: ActionRow[]
  editingConditionId: string | null
  editingActionId: string | null
  isConditionEditorOpen: boolean
  isActionEditorOpen: boolean
  openModal: (automation?: AutomationDTO) => void
  closeModal: () => void
  openConditionEditor: (condition?: ConditionRow) => void
  closeConditionEditor: () => void
  openActionEditor: (action?: ActionRow) => void
  closeActionEditor: () => void
  submitAutomationForm: (params: z.infer<ReturnType<typeof createAutomationFormSchema>>) => void
  submitConditionForm: (params: z.infer<ReturnType<typeof createConditionFormSchema>>) => void
  submitActionForm: (params: z.infer<ReturnType<typeof createActionFormSchema>>) => void
  removeAutomation: (params: { ids: string[] }) => void
  removeCondition: (params: { id: string }) => void
  removeAction: (params: { id: string }) => void
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined)

function createAutomationFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    name: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    trigger: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    params: z.array(z.string()).default([]),
    active: z.boolean().optional().default(true),
  })
}

function getAutomationFormDefaults() {
  return {
    name: '',
    trigger: '',
    params: [] as string[],
    active: true,
  }
}

function createConditionFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    field: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    operator: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    params: z.array(z.string()).min(1, t('form.errors.required')),
  })
}

function getConditionFormDefaults() {
  return {
    field: '',
    operator: '',
    params: [] as string[],
  }
}

function createActionFormSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
    field: z.string({ required_error: t('form.errors.required') }).min(1, t('form.errors.required')),
    params: z.array(z.string()).default([]),
  })
}

function getActionFormDefaults() {
  return {
    field: '',
    params: [] as string[],
  }
}

function withIds(automation?: AutomationDTO): { conditions: ConditionRow[], actions: ActionRow[] } {
  if (!automation) {
    return { conditions: [], actions: [] }
  }
  return {
    conditions: automation.conditions.map(item => ({ ...item, id: crypto.randomUUID() })),
    actions: automation.actions.map(item => ({ ...item, id: crypto.randomUUID() })),
  }
}

function getAutomationFormValues(automation?: AutomationDTO) {
  if (!automation)
    return getAutomationFormDefaults()
  return {
    name: automation.name,
    trigger: automation.trigger.type,
    params: Array.isArray(automation.trigger.params) ? [...automation.trigger.params] : [],
    active: automation.active,
  }
}

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationDTO | undefined>(undefined)
  const [selectedConditions, setSelectedConditions] = useState<ConditionRow[]>([])
  const [selectedActions, setSelectedActions] = useState<ActionRow[]>([])
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null)
  const [editingActionId, setEditingActionId] = useState<string | null>(null)
  const [isConditionEditorOpen, setIsConditionEditorOpen] = useState(false)
  const [isActionEditorOpen, setIsActionEditorOpen] = useState(false)

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

  const closeConditionEditor = () => {
    setIsConditionEditorOpen(false)
    setEditingConditionId(null)
    conditionForm.reset(getConditionFormDefaults())
  }

  const closeActionEditor = () => {
    setIsActionEditorOpen(false)
    setEditingActionId(null)
    actionForm.reset(getActionFormDefaults())
  }

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedAutomation(undefined)
    setSelectedConditions([])
    setSelectedActions([])
    form.reset(getAutomationFormDefaults())
    closeConditionEditor()
    closeActionEditor()
  }

  const openModal = (automation?: AutomationDTO) => {
    const rows = withIds(automation)
    setIsModalOpen(true)
    setIsEdit(!!automation)
    setSelectedAutomation(automation)
    setSelectedConditions(rows.conditions)
    setSelectedActions(rows.actions)
    form.reset(getAutomationFormValues(automation))
    closeConditionEditor()
    closeActionEditor()
  }

  const openConditionEditor = (condition?: ConditionRow) => {
    setIsConditionEditorOpen(true)
    setEditingConditionId(condition?.id ?? null)
    conditionForm.reset(condition
      ? { field: condition.field, operator: condition.operator, params: [...condition.params] }
      : getConditionFormDefaults())
  }

  const openActionEditor = (action?: ActionRow) => {
    setIsActionEditorOpen(true)
    setEditingActionId(action?.id ?? null)
    actionForm.reset(action
      ? { field: action.field, params: [...(action.params ?? [])] }
      : getActionFormDefaults())
  }

  const submitConditionForm = (params: z.infer<ReturnType<typeof createConditionFormSchema>>) => {
    if (editingConditionId) {
      setSelectedConditions(state => state.map(item => (
        item.id === editingConditionId ? { ...item, ...params } : item
      )))
    }
    else {
      setSelectedConditions(state => [...state, { id: crypto.randomUUID(), ...params }])
    }
    closeConditionEditor()
  }

  const submitActionForm = (params: z.infer<ReturnType<typeof createActionFormSchema>>) => {
    if (editingActionId) {
      setSelectedActions(state => state.map(item => (
        item.id === editingActionId ? { ...item, ...params } : item
      )))
    }
    else {
      setSelectedActions(state => [...state, { id: crypto.randomUUID(), ...params }])
    }
    closeActionEditor()
  }

  const removeCondition = ({ id }: { id: string }) => {
    setSelectedConditions(state => state.filter(item => item.id !== id))
    if (editingConditionId === id)
      closeConditionEditor()
  }

  const removeAction = ({ id }: { id: string }) => {
    setSelectedActions(state => state.filter(item => item.id !== id))
    if (editingActionId === id)
      closeActionEditor()
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
        setIsLoading(false)
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
        setIsLoading(false)
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

  const submitAutomationForm = (params: z.infer<ReturnType<typeof createAutomationFormSchema>>) => {
    if (!selectedActions.length) {
      toast.error(t('page.automations.form.actions.required'))
      return
    }

    setIsLoading(true)

    const payload = {
      name: params.name,
      active: params.active,
      trigger: {
        type: params.trigger,
        params: params.params ?? [],
      },
      conditions: selectedConditions.map(({ field, operator, params: conditionParams }) => ({
        field,
        operator,
        params: conditionParams,
      })),
      actions: selectedActions.map(({ field, params: actionParams }) => ({
        field,
        params: actionParams ?? [],
      })),
    }

    if (!isEdit) {
      useMutateCreateAutomation.mutate(payload)
      return
    }

    if (!selectedAutomation)
      return

    useMutateEditAutomation.mutate({ ...payload, id: selectedAutomation.id })
  }

  const value: AutomationContextType = useMemo(
    () => ({
      selectedAutomation,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      conditionForm,
      actionForm,
      selectedConditions,
      selectedActions,
      editingConditionId,
      editingActionId,
      isConditionEditorOpen,
      isActionEditorOpen,
      removeCondition,
      removeAction,
      openConditionEditor,
      closeConditionEditor,
      openActionEditor,
      closeActionEditor,
      openModal,
      closeModal,
      submitAutomationForm,
      submitConditionForm,
      submitActionForm,
      removeAutomation,
    }),
    [
      selectedAutomation,
      isModalOpen,
      isLoading,
      isEdit,
      form,
      conditionForm,
      actionForm,
      selectedConditions,
      selectedActions,
      editingConditionId,
      editingActionId,
      isConditionEditorOpen,
      isActionEditorOpen,
    ],
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
