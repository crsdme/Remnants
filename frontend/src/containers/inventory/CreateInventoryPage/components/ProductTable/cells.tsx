import { Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, Button, Input, Separator } from '@/components/ui'

export function EditableCell({ product, field, onChange, className, disabled }: {
  product: any
  onChange: (value: number) => void
  field: string
  className?: string
  disabled?: boolean
}) {
  const [localValue, setLocalValue] = useState(product[field])

  useEffect(() => {
    setLocalValue(product[field])
  }, [product[field]])

  return (
    <Input
      value={localValue}
      className={`pr-10 w-30 ${className}`}
      onChange={(e) => {
        const val = Number.parseFloat(e.target.value)
        setLocalValue(Number.isNaN(val) ? 0 : val)
      }}
      onBlur={() => {
        onChange(localValue)
      }}
      disabled={disabled}
    />
  )
}

export function EditableQuantityCell({ isReceiving, changeQuantity, item, isLoading, disabled, handleChange, removeProduct }) {
  const { i18n, t } = useTranslation()
  const hasMismatch = item.receivedQuantity !== item.quantity

  return (
    <div className="flex gap-2 justify-end">
      {isReceiving && (
        <Badge variant={hasMismatch ? 'destructive' : 'success'}>
          {hasMismatch ? t('table.mismatch') : t('table.match')}
        </Badge>
      )}
      <div className="flex gap-2">
        {!isReceiving && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeQuantity(item, { quantity: item.quantity - 1 })}
            disabled={isLoading || isReceiving || disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
        <div className="relative min-w-5">
          {/* <Input
            placeholder={t('component.product-select-table.quantity.placeholder')}
            value={item.quantity}
            className="pr-10 w-20"
            disabled={true}
            onChange={event => handleChange(item.id, 'quantity', Number.parseInt(event.target.value))}
          /> */}
          <EditableCell
            product={item}
            onChange={val => handleChange(item.id, 'quantity', val)}
            field="selectedQuantity"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <p>{item.unit.symbols[i18n.language]}</p>
          </div>
        </div>
        {!isReceiving && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeQuantity(item, { quantity: item.quantity + 1 })}
            disabled={isLoading || isReceiving || disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isReceiving && (
        <>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeQuantity(item, { receivedQuantity: item.receivedQuantity - 1 })}
              disabled={isLoading || disabled}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative min-w-5">
              <Input
                placeholder={t('component.product-select-table.quantity.placeholder')}
                value={item.receivedQuantity}
                className="pr-10 w-20"
                disabled={true}
                onChange={event => handleChange(item.id, 'receivedQuantity', Number.parseInt(event.target.value))}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <p>{item.unit.symbols[i18n.language]}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeQuantity(item, { receivedQuantity: item.receivedQuantity + 1 })}
              disabled={isLoading || disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
      <Button
        onClick={() => removeProduct(item)}
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        disabled={isLoading || disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
