import type { SalaryMode } from '@remnant/shared'
import type { ProfileFormValues } from '../context'
import { useEffect, useState } from 'react'
import { useCurrencyOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Switch,
} from '@/components/ui'
import { fromMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useProfileContext } from '../context'

export function ProfileSettingsSheet() {
  const { t, language } = useLocale()
  const {
    summary,
    canEdit,
    settingsOpen,
    setSettingsOpen,
    saveProfile,
    isMutating,
  } = useProfileContext()

  const loadCurrencyOptions = useCurrencyOptions()
  const [form, setForm] = useState<ProfileFormValues | null>(null)

  useEffect(() => {
    if (!summary || !settingsOpen)
      return
    const profile = summary.profile
    setForm({
      hiredAt: profile.hiredAt ? new Date(profile.hiredAt).toISOString().slice(0, 10) : '',
      scheduleEnabled: Boolean(profile.defaultSchedule),
      scheduleStart: profile.defaultSchedule?.start ?? '11:00',
      scheduleEnd: profile.defaultSchedule?.end ?? '20:00',
      salaryAmountMajor: fromMinor(Number(profile.salary.amountMinor) || 0),
      currencyId: profile.salary.currencyId ?? '',
      salaryMode: profile.salary.mode,
      periodDays: String(profile.salary.periodDays ?? 30),
      periodShifts: String(profile.salary.periodShifts ?? 30),
      minWorkedShiftsToAccrue: String(profile.salary.minWorkedShiftsToAccrue ?? 0),
      periodAnchor: profile.salary.periodAnchor ?? 'hiredAt',
      earlyEnabled: profile.earlyBonus.enabled,
      earlyAmountMajor: fromMinor(Number(profile.earlyBonus.amountMinor) || 0),
      lateEnabled: profile.latePenalty.enabled,
      lateAmountMajor: fromMinor(Number(profile.latePenalty.amountMinor) || 0),
    })
  }, [summary, settingsOpen])

  return (
    <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>{t('page.profile.settings.title')}</SheetTitle>
          <SheetDescription>{t('page.profile.settings.description')}</SheetDescription>
        </SheetHeader>

        {form && (
          <div className="w-full space-y-5 px-4 pb-4">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">{t('page.profile.settings.section.general')}</h3>
              <div className="space-y-2">
                <Label>{t('page.profile.form.hiredAt')}</Label>
                <Input
                  type="date"
                  value={form.hiredAt}
                  disabled={!canEdit || isMutating}
                  onChange={e => setForm({ ...form, hiredAt: e.target.value })}
                />
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-4">
                <div className="space-y-1 pr-4">
                  <Label>{t('page.profile.form.scheduleEnabled')}</Label>
                  <p className="text-xs text-muted-foreground">{t('page.profile.form.scheduleHint')}</p>
                </div>
                <Switch
                  checked={form.scheduleEnabled}
                  disabled={!canEdit || isMutating}
                  onCheckedChange={checked => setForm({ ...form, scheduleEnabled: checked })}
                />
              </div>
              {form.scheduleEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t('page.profile.form.scheduleStart')}</Label>
                    <Input
                      value={form.scheduleStart}
                      placeholder="11:00"
                      disabled={!canEdit || isMutating}
                      onChange={e => setForm({ ...form, scheduleStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('page.profile.form.scheduleEnd')}</Label>
                    <Input
                      value={form.scheduleEnd}
                      placeholder="20:00"
                      disabled={!canEdit || isMutating}
                      onChange={e => setForm({ ...form, scheduleEnd: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">{t('page.profile.settings.section.salary')}</h3>
              <div className="space-y-2">
                <Label>{t('page.profile.form.salaryMode')}</Label>
                <Select
                  value={form.salaryMode}
                  disabled={!canEdit || isMutating}
                  onValueChange={value => setForm({ ...form, salaryMode: value as SalaryMode })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.profile.form.salaryMode')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_shift">{t('page.profile.salaryMode.per_shift')}</SelectItem>
                    <SelectItem value="calendar_period">{t('page.profile.salaryMode.calendar_period')}</SelectItem>
                    <SelectItem value="worked_shifts_period">{t('page.profile.salaryMode.worked_shifts_period')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('page.profile.form.salaryAmount')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.salaryAmountMajor}
                    disabled={!canEdit || isMutating}
                    onChange={e => setForm({ ...form, salaryAmountMajor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('page.profile.form.currency')}</Label>
                  <AsyncSelectNew
                    value={form.currencyId}
                    loadOptions={loadCurrencyOptions}
                    renderOption={e => e.symbols?.[language] || e.names[language]}
                    getDisplayValue={e => e.symbols?.[language] || e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={!canEdit || isMutating}
                    onChange={value => setForm({ ...form, currencyId: Array.isArray(value) ? (value[0] ?? '') : (value ?? '') })}
                    name="currencyId"
                    clearable
                    isForm={false}
                  />
                </div>
              </div>

              {form.salaryMode === 'calendar_period' && (
                <>
                  <div className="space-y-2">
                    <Label>{t('page.profile.form.periodDays')}</Label>
                    <Input
                      type="number"
                      value={form.periodDays}
                      disabled={!canEdit || isMutating}
                      onChange={e => setForm({ ...form, periodDays: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('page.profile.form.minWorkedShifts')}</Label>
                    <Input
                      type="number"
                      value={form.minWorkedShiftsToAccrue}
                      disabled={!canEdit || isMutating}
                      onChange={e => setForm({ ...form, minWorkedShiftsToAccrue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('page.profile.form.periodAnchor')}</Label>
                    <Select
                      value={form.periodAnchor}
                      disabled={!canEdit || isMutating}
                      onValueChange={value => setForm({ ...form, periodAnchor: value as 'hiredAt' | 'monthStart' })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('page.profile.form.periodAnchor')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hiredAt">{t('page.profile.periodAnchor.hiredAt')}</SelectItem>
                        <SelectItem value="monthStart">{t('page.profile.periodAnchor.monthStart')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {form.salaryMode === 'worked_shifts_period' && (
                <div className="space-y-2">
                  <Label>{t('page.profile.form.periodShifts')}</Label>
                  <Input
                    type="number"
                    value={form.periodShifts}
                    disabled={!canEdit || isMutating}
                    onChange={e => setForm({ ...form, periodShifts: e.target.value })}
                  />
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">{t('page.profile.settings.section.bonuses')}</h3>
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between gap-4">
                  <Label>{t('page.profile.form.earlyEnabled')}</Label>
                  <Switch
                    checked={form.earlyEnabled}
                    disabled={!canEdit || isMutating}
                    onCheckedChange={checked => setForm({ ...form, earlyEnabled: checked })}
                  />
                </div>
                {form.earlyEnabled && (
                  <div className="space-y-2">
                    <Label>{t('page.profile.form.earlyAmount')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.earlyAmountMajor}
                      disabled={!canEdit || isMutating}
                      onChange={e => setForm({ ...form, earlyAmountMajor: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 border-t pt-3">
                  <Label>{t('page.profile.form.lateEnabled')}</Label>
                  <Switch
                    checked={form.lateEnabled}
                    disabled={!canEdit || isMutating}
                    onCheckedChange={checked => setForm({ ...form, lateEnabled: checked })}
                  />
                </div>
                {form.lateEnabled && (
                  <div className="space-y-2">
                    <Label>{t('page.profile.form.lateAmount')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.lateAmountMajor}
                      disabled={!canEdit || isMutating}
                      onChange={e => setForm({ ...form, lateAmountMajor: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isMutating}
                onClick={() => setSettingsOpen(false)}
              >
                {t('button.cancel')}
              </Button>
              <Button
                type="button"
                disabled={!canEdit || isMutating}
                loading={isMutating}
                onClick={() => void saveProfile(form)}
              >
                {t('button.submit')}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
