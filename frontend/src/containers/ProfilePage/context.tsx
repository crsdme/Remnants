import type { EditUserProfileRequest, SalaryMode, UserProfileSummaryDTO, WorkShiftDTO } from '@remnant/shared'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useCurrencyQuery,
  usePayrollEntryCreate,
  useUserProfileEdit,
  useUserProfileSummaryQuery,
  useWorkShiftFinish,
  useWorkShiftPlan,
  useWorkShiftStart,
  useWorkShiftUnplan,
} from '@/api/hooks'
import { useAuthContext } from '@/contexts'
import { toMinor } from '@/utils/helpers'
import { useLocale, usePermission } from '@/utils/hooks'

export interface ProfileFormValues {
  hiredAt: string
  scheduleStart: string
  scheduleEnd: string
  scheduleEnabled: boolean
  salaryAmountMajor: string
  currencyId: string
  salaryMode: SalaryMode
  periodDays: string
  periodShifts: string
  minWorkedShiftsToAccrue: string
  periodAnchor: 'hiredAt' | 'monthStart'
  earlyEnabled: boolean
  earlyAmountMajor: string
  lateEnabled: boolean
  lateAmountMajor: string
}

interface ProfileContextValue {
  userId: string
  isOwnProfile: boolean
  year: number
  month: number
  setYear: (year: number) => void
  setMonth: (month: number) => void
  summary: UserProfileSummaryDTO | null
  currencySymbol: string
  isLoading: boolean
  isFetchingMonth: boolean
  canEdit: boolean
  canPlan: boolean
  canStart: boolean
  selectedDay: string | null
  selectedShift: WorkShiftDTO | null
  daySheetOpen: boolean
  openDaySheet: (workDate: string) => void
  closeDaySheet: () => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  adjustmentOpen: boolean
  setAdjustmentOpen: (open: boolean) => void
  startDay: () => Promise<void>
  finishDay: () => Promise<void>
  planDay: (workDate: string) => Promise<void>
  unplanDay: (workDate: string) => Promise<void>
  saveProfile: (values: ProfileFormValues) => Promise<void>
  createAdjustment: (values: { amountMajor: number, comment: string, workDate: string }) => Promise<void>
  isMutating: boolean
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const { userId: routeUserId } = useParams()
  const { t, language } = useLocale()
  const canEdit = usePermission(['userProfile.edit', 'other.admin'])
  const canPlan = usePermission(['workShift.edit', 'other.admin'])
  const canStart = usePermission(['workShift.start', 'workShift.edit', 'other.admin'])

  const userId = routeUserId || user?.id || ''
  const isOwnProfile = Boolean(user?.id && userId === user.id)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [daySheetOpen, setDaySheetOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)

  const { summary, isLoading, isFetching, isPlaceholderData, refetch } = useUserProfileSummaryQuery(
    { userId, year, month },
    { enabled: Boolean(userId) },
  )

  const currencyId = summary?.profile.salary.currencyId
  const { currencies } = useCurrencyQuery(
    { filters: currencyId ? { ids: [currencyId] } : {}, pagination: { full: true } },
    { options: { enabled: Boolean(currencyId) } },
  )
  const currencySymbol = currencies.find(c => c.id === currencyId)?.symbols?.[language]
    || currencies.find(c => c.id === currencyId)?.symbols?.en
    || ''

  const editMutation = useUserProfileEdit()
  const startMutation = useWorkShiftStart()
  const finishMutation = useWorkShiftFinish()
  const planMutation = useWorkShiftPlan()
  const unplanMutation = useWorkShiftUnplan()
  const adjustmentMutation = usePayrollEntryCreate()

  const selectedShift = useMemo(
    () => summary?.shifts.find(s => s.workDate === selectedDay) ?? null,
    [summary?.shifts, selectedDay],
  )

  const openDaySheet = useCallback((workDate: string) => {
    setSelectedDay(workDate)
    setDaySheetOpen(true)
  }, [])

  const closeDaySheet = useCallback(() => {
    setDaySheetOpen(false)
  }, [])

  const startDay = useCallback(async () => {
    try {
      await startMutation.mutateAsync({ userId })
      toast.success(t('page.profile.toast.started'))
      await refetch()
    }
    catch {
      toast.error(t('page.profile.toast.start-failed'))
    }
  }, [startMutation, userId, t, refetch])

  const finishDay = useCallback(async () => {
    try {
      await finishMutation.mutateAsync({ userId })
      toast.success(t('page.profile.toast.finished'))
      await refetch()
    }
    catch {
      toast.error(t('page.profile.toast.finish-failed'))
    }
  }, [finishMutation, userId, t, refetch])

  const planDay = useCallback(async (workDate: string) => {
    try {
      await planMutation.mutateAsync({ userId, workDate })
      toast.success(t('page.profile.toast.planned'))
      await refetch()
    }
    catch {
      toast.error(t('page.profile.toast.plan-failed'))
    }
  }, [planMutation, userId, t, refetch])

  const unplanDay = useCallback(async (workDate: string) => {
    try {
      await unplanMutation.mutateAsync({ userId, workDate })
      toast.success(t('page.profile.toast.unplanned'))
      await refetch()
      setDaySheetOpen(false)
    }
    catch {
      toast.error(t('page.profile.toast.unplan-failed'))
    }
  }, [unplanMutation, userId, t, refetch])

  const saveProfile = useCallback(async (values: ProfileFormValues) => {
    const payload: EditUserProfileRequest = {
      userId,
      hiredAt: values.hiredAt ? new Date(values.hiredAt) : null,
      defaultSchedule: values.scheduleEnabled
        ? { start: values.scheduleStart, end: values.scheduleEnd }
        : null,
      utcOffset: '+03:00',
      salary: {
        amountMinor: toMinor(Number(values.salaryAmountMajor) || 0),
        currencyId: values.currencyId || undefined,
        mode: values.salaryMode,
        periodDays: values.salaryMode === 'calendar_period'
          ? Number(values.periodDays) || 30
          : undefined,
        periodShifts: values.salaryMode === 'worked_shifts_period'
          ? Number(values.periodShifts) || 30
          : undefined,
        minWorkedShiftsToAccrue: Number(values.minWorkedShiftsToAccrue) || 0,
        periodAnchor: values.periodAnchor,
      },
      earlyBonus: {
        enabled: values.earlyEnabled,
        amountMinor: toMinor(Number(values.earlyAmountMajor) || 0),
        graceMinutes: 0,
      },
      latePenalty: {
        enabled: values.lateEnabled,
        amountMinor: toMinor(Number(values.lateAmountMajor) || 0),
        graceMinutes: 0,
      },
    }

    try {
      await editMutation.mutateAsync(payload)
      toast.success(t('page.profile.toast.saved'))
      setSettingsOpen(false)
      await refetch()
    }
    catch {
      toast.error(t('page.profile.toast.save-failed'))
    }
  }, [userId, editMutation, t, refetch])

  const createAdjustment = useCallback(async (values: { amountMajor: number, comment: string, workDate: string }) => {
    try {
      await adjustmentMutation.mutateAsync({
        userId,
        workDate: values.workDate,
        minorAmount: toMinor(values.amountMajor),
        currencyId: summary?.profile.salary.currencyId,
        comment: values.comment,
      })
      toast.success(t('page.profile.toast.adjustment-saved'))
      setAdjustmentOpen(false)
      await refetch()
    }
    catch {
      toast.error(t('page.profile.toast.adjustment-failed'))
    }
  }, [adjustmentMutation, userId, summary?.profile.salary.currencyId, t, refetch])

  const value = useMemo<ProfileContextValue>(() => ({
    userId,
    isOwnProfile,
    year,
    month,
    setYear,
    setMonth,
    summary,
    currencySymbol,
    isLoading: isLoading && !summary,
    isFetchingMonth: isFetching && Boolean(isPlaceholderData),
    canEdit,
    canPlan,
    canStart,
    selectedDay,
    selectedShift,
    daySheetOpen,
    openDaySheet,
    closeDaySheet,
    settingsOpen,
    setSettingsOpen,
    adjustmentOpen,
    setAdjustmentOpen,
    startDay,
    finishDay,
    planDay,
    unplanDay,
    saveProfile,
    createAdjustment,
    isMutating: editMutation.isPending
      || startMutation.isPending
      || finishMutation.isPending
      || planMutation.isPending
      || unplanMutation.isPending
      || adjustmentMutation.isPending,
  }), [
    userId,
    isOwnProfile,
    year,
    month,
    summary,
    currencySymbol,
    isLoading,
    isFetching,
    isPlaceholderData,
    canEdit,
    canPlan,
    canStart,
    selectedDay,
    selectedShift,
    daySheetOpen,
    openDaySheet,
    closeDaySheet,
    settingsOpen,
    adjustmentOpen,
    startDay,
    finishDay,
    planDay,
    unplanDay,
    saveProfile,
    createAdjustment,
    editMutation.isPending,
    startMutation.isPending,
    finishMutation.isPending,
    planMutation.isPending,
    unplanMutation.isPending,
    adjustmentMutation.isPending,
  ])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext)
  if (!ctx)
    throw new Error('useProfileContext must be used within ProfileProvider')
  return ctx
}
