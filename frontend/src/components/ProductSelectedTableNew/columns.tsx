import { Check, Minus, Plus, Trash2, X } from 'lucide-react'
import { ImageGallery } from '@/components'
import { Badge, Button, Separator } from '@/components/ui'
import { AsyncSelectNew } from '../AsyncSelectNew'
import { EditableCell } from './cells'

export function makeActionColumn({ t }) {
  return {
    id: 'action',
    size: 85,
    meta: { title: t('component.productTable.table.actions'), enableHiding: false },
    cell: ({ row, table }) => {
      const { tableDisabled, onRemoveRow } = table.options.meta || {}
      const item = row.original

      return (
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => onRemoveRow?.(item)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={tableDisabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  }
}

export function makeImagesColumn({ t }) {
  return {
    id: 'images',
    size: 100,
    meta: {
      title: t('component.productTable.table.images'),
      defaultVisible: true,
    },
    cell: ({ row }) => {
      const images = row.original.images.map((image, index) => ({
        id: index,
        src: image.path,
        alt: image.originalname,
      }))
      return (<ImageGallery images={images} size={60} />)
    },
  }
}

export function makeNameColumn({ t, i18n }) {
  return {
    id: 'names',
    size: 150,
    meta: {
      title: t('component.productTable.table.names'),
      filterable: true,
      filterType: 'text',
      sortable: true,
      defaultVisible: true,
    },
    header: () => t('component.productTable.table.names'),
    accessorFn: row => row.names?.[i18n.language] || row.names?.en,
  }
}

export function makePurchasePriceColumn({ t, i18n, field = 'purchasePrice', currencyField = 'purchaseCurrency' }) {
  return {
    id: field,
    size: 150,
    meta: {
      title: t(`component.productTable.table.${field}`),
      filterable: true,
      filterType: 'number',
      sortable: true,
    },
    header: () => t(`component.productTable.table.${field}`),
    accessorFn: row => `${row[field]} ${row[currencyField].symbols[i18n.language]}`,
  }
}

export function makeProfitColumn({ t, i18n }) {
  return {
    id: 'profit',
    size: 150,
    meta: {
      title: t('component.productTable.table.profit'),
      filterable: true,
      filterType: 'number',
      sortable: true,
    },
    header: () => t('component.productTable.table.profit'),
    footer: ({ table }) => {
      const { rows } = table.getRowModel()
      const totalsByCurrency = rows.reduce((acc, r) => {
        const p = r.original
        const symbol = p?.selectedCurrency?.symbols?.[i18n.language] || p?.currency?.symbols?.[i18n.language]
        if (!symbol)
          return acc
        const rowTotal = (p.quantity ?? 0) * (p.profit ?? 0)
        acc[symbol] = (acc[symbol] ?? 0) + rowTotal
        return acc
      }, {})

      return (
        <div className="flex flex-wrap gap-2">
          {Object.entries(totalsByCurrency).map(([symbol, sum]) => (
            <Badge key={symbol}>{`${sum} ${symbol}`}</Badge>
          ))}
        </div>
      )
    },
    accessorFn: row => `${row.profit} ${row.selectedCurrency.symbols[i18n.language]}`,
  }
}

export function makeSelectedPriceColumn({ t, i18n, currencies, loadCurrencyOptions, field = 'selectedPrice', currencyField = 'selectedCurrency' }) {
  return {
    id: field,
    meta: {
      title: t(`component.productTable.table.${field}`),
      filterable: true,
      filterType: 'number',
      sortable: true,
    },
    header: () => t(`component.productTable.table.${field}`),
    footer: ({ table }) => {
      const { rows } = table.getRowModel()

      const totalsByCurrency = rows.reduce((acc: Record<string, number>, r: any) => {
        const p = r.original
        const symbol = p?.[currencyField]?.symbols?.[i18n.language]

        if (!symbol)
          return acc

        const rowTotal = (p.quantity ?? 0) * (p[field] ?? 0)

        acc[symbol] = (acc[symbol] ?? 0) + rowTotal
        return acc
      }, {})

      const badges = Object.entries(totalsByCurrency).map(([symbol, sum]) => (
        <Badge key={symbol}>
          {`${sum} ${symbol}`}
        </Badge>
      ))

      return badges.length
        ? <div className="flex flex-wrap gap-2">{badges}</div>
        : null
    },
    cell: ({ row, table }) => {
      const { handleChange, tableDisabled } = table.options.meta || {}

      const product = row.original
      return (
        <div className="flex gap-2">
          <EditableCell
            product={product}
            onChange={value => handleChange?.({
              productId: product.id,
              field,
              value,
              isDebounced: true,
            })}
            field={field}
            className="w-20 pr-2"
            disabled={tableDisabled}
          />
          <AsyncSelectNew
            loadOptions={loadCurrencyOptions}
            value={[product[currencyField].id]}
            renderOption={(e: any) => `${e.symbols[i18n.language]}`}
            getDisplayValue={(e: any) => `${e.symbols[i18n.language]}`}
            getOptionValue={(e: any) => e.id}
            disabled={tableDisabled}
            onChange={val => handleChange?.({
              productId: product.id,
              field: currencyField,
              value: currencies.find(c => c.id === val),
            })}
            triggerClassName="w-15"
            placeholder="..."
            isForm={false}
          />
        </div>
      )
    },
  }
}

export function makeQuantityColumn({ t, i18n, field = 'quantity', received = false }) {
  return received
    ? {
        id: 'receivedQuantity',
        meta: {
          title: t('component.productTable.table.receivedQuantity'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('component.productTable.table.receivedQuantity'),
        cell: ({ row, table }) => {
          const { handleChange, tableDisabled } = table.options.meta || {}
          const product = row.original
          const hasMismatch = product.receivedQuantity !== product.quantity

          return (
            <div className="flex items-center gap-2">
              <Badge variant={hasMismatch ? 'destructive' : 'success'}>
                {hasMismatch ? <X /> : <Check />}
              </Badge>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleChange?.({
                      productId: product.id,
                      field: 'receivedQuantity',
                      value: product.receivedQuantity - 1,
                    })}
                  disabled={tableDisabled}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="relative min-w-5">
                  <EditableCell
                    product={product}
                    onChange={value =>
                      handleChange?.({
                        productId: product.id,
                        field: 'receivedQuantity',
                        value,
                        isDebounced: true,
                      })}
                    field="receivedQuantity"
                    className="w-20"
                    disabled={tableDisabled}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <p>{product.unit.symbols[i18n.language]}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleChange?.({
                      productId: product.id,
                      field: 'receivedQuantity',
                      value: product.receivedQuantity + 1,
                    })}
                  disabled={tableDisabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        },
      }
    : {
        id: field,
        size: 150,
        meta: {
          title: t('component.productTable.table.selectedQuantity'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('component.productTable.table.selectedQuantity'),
        footer: ({ table }) => {
          const { rows } = table.getRowModel()
          const totalsByUnit = rows.reduce((acc, r) => {
            const p = r.original
            const unit = p?.unit?.symbols?.[i18n.language]
            if (!unit)
              return acc
            const rowTotal = (p.quantity ?? 0)
            acc[unit] = (acc[unit] ?? 0) + rowTotal
            return acc
          }, {})

          return (
            <div className="flex flex-wrap gap-2">
              {Object.entries(totalsByUnit).map(([unit, sum]) => (
                <Badge key={unit}>{`${sum} ${unit}`}</Badge>
              ))}
            </div>
          )
        },
        cell: ({ row, table }) => {
          const { handleChange, tableDisabled } = table.options.meta || {}
          const item = row.original

          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleChange?.({
                    productId: item.id,
                    field: 'quantity',
                    value: item.quantity - 1,
                  })}
                disabled={tableDisabled}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="relative min-w-5">
                <EditableCell
                  product={item}
                  onChange={val =>
                    handleChange?.({
                      productId: item.id,
                      field: 'quantity',
                      value: val,
                      isDebounced: true,
                    })}
                  field="quantity"
                  className="w-20"
                  disabled={tableDisabled}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <p>{item.unit.symbols[i18n.language]}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleChange?.({
                    productId: item.id,
                    field: 'quantity',
                    value: item.quantity + 1,
                  })}
                disabled={tableDisabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      }
}
