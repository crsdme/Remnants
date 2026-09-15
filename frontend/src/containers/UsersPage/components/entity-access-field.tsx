import type {
  CashregisterAccessEntryDTO,
  CashregisterCapability,
  CashregisterPopulatedDTO,
  WarehouseAccessEntryDTO,
  WarehouseCapability,
  WarehouseDTO,
} from '@remnant/shared'
import {
  CASHREGISTER_CAPABILITIES,
  WAREHOUSE_CAPABILITIES,
} from '@remnant/shared'
import { ChevronDown, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCashregisterOptions, useCashregisterQuery, useWarehouseOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib'

interface WarehouseAccessFieldProps {
  value: WarehouseAccessEntryDTO[]
  onChange: (next: WarehouseAccessEntryDTO[]) => void
  disabled?: boolean
}

interface CashregisterAccessFieldProps {
  value: CashregisterAccessEntryDTO[]
  onChange: (next: CashregisterAccessEntryDTO[]) => void
  disabled?: boolean
}

export function WarehouseAccessField({ value, onChange, disabled }: WarehouseAccessFieldProps) {
  const { t, language } = useLocale()
  const loadWarehouseOptions = useWarehouseOptions()
  const [pendingId, setPendingId] = useState('')
  const selectedIds = useMemo(() => new Set(value.map(entry => entry.id)), [value])

  const add = (id: string) => {
    if (!id || selectedIds.has(id))
      return
    onChange([...value, { id, capabilities: ['viewStock'] }])
    setPendingId('')
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-2">
      <AsyncSelectNew
        value={pendingId}
        onChange={(id) => {
          const next = typeof id === 'string' ? id : ''
          if (next)
            add(next)
        }}
        loadOptions={async (params) => {
          const options = await loadWarehouseOptions(params)
          return options.filter(option => !selectedIds.has(option.id))
        }}
        renderOption={(e: WarehouseDTO) => e.names[language]}
        getDisplayValue={(e: WarehouseDTO) => e.names[language]}
        getOptionValue={(e: WarehouseDTO) => e.id}
        disabled={disabled}
        clearable
        placeholder={t('page.users.form.access.add.warehouses')}
      />

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('page.users.form.access.empty.warehouses')}</p>
      )}

      <div className="space-y-2">
        {value.map(entry => (
          <WarehouseRow
            key={entry.id}
            entry={entry}
            disabled={disabled}
            onRemove={() => onChange(value.filter(item => item.id !== entry.id))}
            onChangeCaps={(capabilities) => {
              onChange(value.map(item => item.id === entry.id ? { ...item, capabilities } : item))
            }}
          />
        ))}
      </div>
    </div>
  )
}

function WarehouseRow({
  entry,
  disabled,
  onRemove,
  onChangeCaps,
}: {
  entry: WarehouseAccessEntryDTO
  disabled?: boolean
  onRemove: () => void
  onChangeCaps: (capabilities: WarehouseCapability[]) => void
}) {
  const { t, language } = useLocale()
  const loadWarehouseOptions = useWarehouseOptions()
  const [title, setTitle] = useState(entry.id)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    let cancelled = false
    void loadWarehouseOptions({ selectedValue: [entry.id] }).then((options) => {
      if (cancelled)
        return
      const found = options.find(option => option.id === entry.id)
      if (found)
        setTitle(found.names[language] ?? entry.id)
    })
    return () => {
      cancelled = true
    }
  }, [entry.id, language, loadWarehouseOptions])

  const summary = entry.capabilities
    .map(cap => t(`page.users.form.access.capabilities.warehouses.${cap}`))
    .join(' · ')

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full min-w-0 max-w-full border rounded-lg overflow-hidden">
      <div className="flex min-w-0 items-center gap-1 pr-1">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-3 py-2.5 text-left hover:bg-muted/50 rounded-lg">
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', !open && '-rotate-90')} />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{title}</p>
            {!open && (
              <p className="text-xs text-muted-foreground truncate">{summary}</p>
            )}
          </div>
        </CollapsibleTrigger>
        <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled={disabled} onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CollapsibleContent className="border-t px-3 py-2">
        <div className="grid grid-cols-1 gap-1.5">
          {WAREHOUSE_CAPABILITIES.map(capability => (
            <CapabilityCheckbox
              key={capability}
              label={t(`page.users.form.access.capabilities.warehouses.${capability}`)}
              checked={entry.capabilities.includes(capability)}
              disabled={disabled}
              onToggle={() => {
                const set = new Set(entry.capabilities)
                if (set.has(capability))
                  set.delete(capability)
                else
                  set.add(capability)
                onChangeCaps([...set] as WarehouseCapability[])
              }}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function CashregisterAccessField({ value, onChange, disabled }: CashregisterAccessFieldProps) {
  const { t, language } = useLocale()
  const loadCashregisterOptions = useCashregisterOptions()
  const [pendingId, setPendingId] = useState('')
  const selectedIds = useMemo(() => new Set(value.map(entry => entry.id)), [value])

  const { cashregisters } = useCashregisterQuery(
    { pagination: { full: true } },
  )

  const add = useCallback((id: string) => {
    if (!id || selectedIds.has(id))
      return
    const register = cashregisters.find(item => item.id === id)
    const accounts = (register?.accounts ?? []).map(account => ({
      id: account.id,
      capabilities: ['viewBalance'] as CashregisterCapability[],
    }))
    if (accounts.length === 0)
      return
    onChange([...value, { id, accounts }])
    setPendingId('')
  }, [cashregisters, onChange, selectedIds, value])

  return (
    <div className="w-full min-w-0 max-w-full space-y-2">
      <AsyncSelectNew
        value={pendingId}
        onChange={(id) => {
          const next = typeof id === 'string' ? id : ''
          if (next)
            add(next)
        }}
        loadOptions={async (params) => {
          const options = await loadCashregisterOptions(params)
          return options.filter(option => !selectedIds.has(option.id))
        }}
        renderOption={(e: CashregisterPopulatedDTO) => e.names[language]}
        getDisplayValue={(e: CashregisterPopulatedDTO) => e.names[language]}
        getOptionValue={(e: CashregisterPopulatedDTO) => e.id}
        disabled={disabled}
        clearable
        placeholder={t('page.users.form.access.add.cashregisters')}
      />

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('page.users.form.access.empty.cashregisters')}</p>
      )}

      <div className="space-y-2">
        {value.map(entry => (
          <CashregisterRow
            key={entry.id}
            entry={entry}
            register={cashregisters.find(item => item.id === entry.id)}
            disabled={disabled}
            onRemove={() => onChange(value.filter(item => item.id !== entry.id))}
            onChange={(next) => {
              onChange(value.map(item => item.id === entry.id ? next : item))
            }}
          />
        ))}
      </div>
    </div>
  )
}

function CashregisterRow({
  entry,
  register,
  disabled,
  onRemove,
  onChange,
}: {
  entry: CashregisterAccessEntryDTO
  register?: CashregisterPopulatedDTO
  disabled?: boolean
  onRemove: () => void
  onChange: (next: CashregisterAccessEntryDTO) => void
}) {
  const { t, language } = useLocale()
  const [open, setOpen] = useState(true)
  const title = register?.names[language] ?? entry.id
  const accountNames = useMemo(() => {
    const map = new Map((register?.accounts ?? []).map(account => [account.id, account.names[language] ?? account.id]))
    return map
  }, [language, register?.accounts])

  const summary = t('page.users.form.access.accountsCount', { count: entry.accounts.length })

  const toggleAccount = (accountId: string, checked: boolean) => {
    if (checked) {
      onChange({
        ...entry,
        accounts: [...entry.accounts, { id: accountId, capabilities: ['viewBalance'] }],
      })
      return
    }
    onChange({
      ...entry,
      accounts: entry.accounts.filter(account => account.id !== accountId),
    })
  }

  const setAccountCaps = (accountId: string, capabilities: CashregisterCapability[]) => {
    onChange({
      ...entry,
      accounts: entry.accounts.map(account =>
        account.id === accountId ? { ...account, capabilities } : account),
    })
  }

  const availableAccounts = register?.accounts ?? []

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full min-w-0 max-w-full border rounded-lg overflow-hidden">
      <div className="flex min-w-0 items-center gap-1 pr-1">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-3 py-2.5 text-left hover:bg-muted/50 rounded-lg">
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', !open && '-rotate-90')} />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{summary}</p>
          </div>
        </CollapsibleTrigger>
        <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled={disabled} onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CollapsibleContent className="border-t px-3 py-2 space-y-2">
        {availableAccounts.length === 0 && (
          <p className="text-xs text-muted-foreground">{t('page.users.form.access.empty.accounts')}</p>
        )}
        {availableAccounts.map((account) => {
          const accessAccount = entry.accounts.find(item => item.id === account.id)
          const enabled = Boolean(accessAccount)

          return (
            <div key={account.id} className="min-w-0 rounded-md border bg-muted/20 px-2.5 py-2 space-y-2">
              <label className="flex min-w-0 items-center gap-2">
                <Checkbox
                  checked={enabled}
                  disabled={disabled}
                  onCheckedChange={checked => toggleAccount(account.id, checked === true)}
                />
                <span className="text-sm font-medium truncate">
                  {accountNames.get(account.id) ?? account.id}
                </span>
              </label>

              {enabled && accessAccount && (
                <div className="pl-6 grid grid-cols-1 gap-1.5">
                  {CASHREGISTER_CAPABILITIES.map(capability => (
                    <CapabilityCheckbox
                      key={capability}
                      label={t(`page.users.form.access.capabilities.cashregisters.${capability}`)}
                      checked={accessAccount.capabilities.includes(capability)}
                      disabled={disabled}
                      onToggle={() => {
                        const set = new Set(accessAccount.capabilities)
                        if (set.has(capability))
                          set.delete(capability)
                        else
                          set.add(capability)
                        setAccountCaps(account.id, [...set] as CashregisterCapability[])
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}

function CapabilityCheckbox({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex min-w-0 items-start gap-2 text-sm leading-tight">
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={onToggle} className="mt-0.5 shrink-0" />
      <span className="font-normal break-words">{label}</span>
    </label>
  )
}

/** @deprecated use WarehouseAccessField / CashregisterAccessField */
export function EntityAccessField(props: {
  kind: 'warehouses' | 'cashregisters'
  value: any[]
  onChange: (next: any[]) => void
  disabled?: boolean
}) {
  if (props.kind === 'warehouses') {
    return (
      <WarehouseAccessField
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
      />
    )
  }

  return (
    <CashregisterAccessField
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled}
    />
  )
}
