import { useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useForwardedRef } from '@/utils/lib/use-forwarded-ref'
import { cn } from '@/utils/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  name?: string
  className?: string
}

function ColorPicker({ ref: forwardedRef, disabled, value, onChange, onBlur, name, className, ...props }: ColorPickerProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  const ref = useForwardedRef(forwardedRef)
  const [open, setOpen] = useState(false)

  const parsedValue = useMemo(() => {
    return value || '#FFFFFF'
  }, [value])

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
        <Button
          {...props}
          className={cn('block', className)}
          name={name}
          onClick={() => {
            setOpen(true)
          }}
          size="icon"
          style={{
            backgroundColor: parsedValue,
          }}
          variant="outline"
        >
          <div />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <HexColorPicker color={parsedValue} onChange={onChange} />
        <Input
          maxLength={7}
          onChange={(e) => {
            onChange(e?.currentTarget?.value)
          }}
          ref={ref}
          value={parsedValue}
          className="mt-2"
        />
      </PopoverContent>
    </Popover>
  )
}
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker }
