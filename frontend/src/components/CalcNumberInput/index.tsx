/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui'
import { cn } from '@/utils/lib/utils'
import { evaluateExpression, formatNumberValue } from './evaluate'

export interface CalcNumberInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'defaultValue'
> {
  value?: number | null
  onValueChange?: (value: number) => void
  /** When false, negative results are rejected and the previous value is restored. Default: true */
  allowNegative?: boolean
}

function toDisplayValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value))
    return ''
  return formatNumberValue(value)
}

function isAllowedDraft(next: string): boolean {
  for (const ch of next) {
    if (
      (ch >= '0' && ch <= '9')
      || ch === ' '
      || ch === '+'
      || ch === '-'
      || ch === '*'
      || ch === '/'
      || ch === '('
      || ch === ')'
      || ch === '.'
      || ch === ','
      || ch === '−'
      || ch === '–'
      || ch === '—'
    ) {
      continue
    }
    return false
  }
  return true
}

function CalcNumberInput({
  value,
  onValueChange,
  allowNegative = true,
  className,
  onBlur,
  onKeyDown,
  onFocus,
  disabled,
  ...props
}: CalcNumberInputProps) {
  const [draft, setDraft] = useState(() => toDisplayValue(value))
  const [focused, setFocused] = useState(false)
  // Keeps the committed result while a parent (e.g. debounced) catches up
  const pendingRef = useRef<number | null>(null)

  useEffect(() => {
    if (focused)
      return

    if (pendingRef.current !== null) {
      if (value === pendingRef.current)
        pendingRef.current = null
      else
        return
    }

    setDraft(toDisplayValue(value))
  }, [value, focused])

  function commit(raw: string) {
    const result = evaluateExpression(raw)

    if (result === null || (!allowNegative && result < 0)) {
      pendingRef.current = null
      setDraft(toDisplayValue(value))
      return
    }

    const next = formatNumberValue(result)
    setDraft(next)

    if (value !== result) {
      pendingRef.current = result
      onValueChange?.(result)
    }
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="text"
      autoComplete="off"
      disabled={disabled}
      value={draft}
      className={cn(className)}
      onFocus={(event) => {
        setFocused(true)
        // Select all so typing "-5" replaces the old value instead of becoming "200-5"
        event.target.select()
        onFocus?.(event)
      }}
      onChange={(event) => {
        const next = event.target.value
        if (next === '' || isAllowedDraft(next))
          setDraft(next)
      }}
      onBlur={(event) => {
        commit(draft)
        setFocused(false)
        onBlur?.(event)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          commit(draft)
          event.currentTarget.blur()
        }
        onKeyDown?.(event)
      }}
    />
  )
}

export { CalcNumberInput }
