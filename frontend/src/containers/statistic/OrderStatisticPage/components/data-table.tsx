import { useTranslation } from 'react-i18next'
import { useCashregisterAccountOptions, useCashregisterOptions } from '@/api/hooks'
import { DateRangePicker } from '@/components/'

import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Separator,
} from '@/components/ui'
import { useOrderStatisticContext } from '../context'

export function DataTable() {
  const { i18n, t } = useTranslation()
  const { isLoading, isFetching, form, onSubmit, statistics } = useOrderStatisticContext()

  const loadCashregisterOptions = useCashregisterOptions({})

  const loadCashregisterAccountOptions = useCashregisterAccountOptions({})

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          <div className="flex items-end gap-2 w-full">
            <FormField
              name="cashregister"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.order-statistic.form.cashregister')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadCashregisterOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || isFetching}
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('cashregisterAccount', '')
                        form.setValue('currency', '')
                      }}
                      name="cashregister"
                      clearable
                      selectFirstOption
                      multi
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="cashregisterAccount"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.order-statistic.form.cashregister-account')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadCashregisterAccountOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || isFetching}
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('currency', '')
                      }}
                      name="cashregisterAccount"
                      clearable
                      selectFirstOption
                      multi
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="date"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.order-statistic.form.date')}</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      {...field}
                      onSelect={field.onChange}
                      disabled={isLoading || isFetching}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex-1">
              <FormControl>
                <Button type="submit" disabled={isLoading || isFetching} loading={isLoading || isFetching}>
                  {t('button.send')}
                </Button>
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </form>
      </Form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('page.order-statistic.total-amount')}</CardTitle>
            <Badge>
              {statistics.ordersCount}
              {' '}
              {t('page.order-statistic.orders')}
            </Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            { statistics.ordersAmount.map((item) => {
              return (
                <span className="text-2xl font-bold mr-4" key={item.currency}>{`${item.total} ${item.currency.symbols[i18n.language]}`}</span>
              )
            }) }
            {/* <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% с прошлого месяца
            </p> */}
          </CardContent>
        </Card>
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('page.order-statistic.paid')}</CardTitle>
            <Badge>
              {statistics.paidCount}
              {' '}
              {t('page.order-statistic.orders')}
            </Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            { statistics.paidAmount.map((item) => {
              return (
                <span className="text-2xl font-bold mr-4 text-green-600" key={item.currency}>{`${item.total} ${item.currency.symbols[i18n.language]}`}</span>
              )
            }) }
            {/* <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% с прошлого месяца
            </p> */}
          </CardContent>
        </Card>
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('page.order-statistic.unpaid')}</CardTitle>
            <Badge>
              {statistics.unpaidCount}
              {' '}
              {t('page.order-statistic.orders')}
            </Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            { statistics.unpaidAmount.map((item) => {
              return (
                <span className="text-2xl font-bold mr-4 text-red-600" key={item.currency}>{`${item.total} ${item.currency.symbols[i18n.language]}`}</span>
              )
            }) }
            {/* <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% с прошлого месяца
            </p> */}
          </CardContent>
        </Card>
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('page.order-statistic.average-check')}</CardTitle>
            <Badge>
              {statistics.ordersCount}
              {' '}
              {t('page.order-statistic.orders')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageCheck}</div>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('page.order-statistic.expenses')}</CardTitle>
            <Badge>
              {statistics.expensesCount}
              {' '}
              {t('page.order-statistic.expenses')}
            </Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            { statistics.expensesTotal.map((item) => {
              return (
                <span className="text-2xl font-bold mr-4" key={item.currency}>{`${item.total} ${item.currency.symbols[i18n.language]}`}</span>
              )
            }) }
          </CardContent>
        </Card>
        { statistics.expenses.map((expense) => {
          return (
            <Card className="gap-0" key={expense.category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{expense.category.names[i18n.language]}</CardTitle>
                <Badge>
                  {expense.count}
                  {' '}
                  {t('page.order-statistic.expenses')}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                { expense.currencies.map((item) => {
                  return (
                    <span className="text-2xl font-bold mr-4" key={item.currency}>{`${item.total} ${item.currency.symbols[i18n.language]}`}</span>
                  )
                }) }
              </CardContent>
            </Card>
          )
        }) }
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('page.order-statistic.income')}</CardTitle>
            <Badge>
              {statistics.incomeCount}
              {' '}
              {t('page.order-statistic.orders')}
            </Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            { statistics.income.map((item) => {
              return (
                <span className="text-2xl font-bold mr-4" key={item.currency}>{`${item.total} ${item.currency.symbols[i18n.language]}`}</span>
              )
            }) }
            {/* <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% с прошлого месяца
            </p> */}
          </CardContent>
        </Card>
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('page.order-statistic.profit')}</CardTitle>
            <Badge>{`${statistics.incomeCount} ${t('page.order-statistic.orders')} - ${statistics.expensesCount} ${t('page.order-statistic.expenses')}`}</Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            { statistics.profit.map((item) => {
              return (
                <span className="text-2xl font-bold mr-4" key={item.currency}>{`${item.total} ${item.currency.symbols[i18n.language]}`}</span>
              )
            }) }
            {/* <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% с прошлого месяца
            </p> */}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        { statistics.productAttributes.map((attribute) => {
          return (
            <Card className="gap-0" key={attribute.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{attribute.name[i18n.language]}</CardTitle>
                { attribute?.count > 0 && (
                  <Badge>{`${attribute.count} ${t('page.order-statistic.products')}`}</Badge>
                )}
              </CardHeader>
              <CardContent className="flex items-center gap-2 flex-wrap">
                {attribute.type === 'number' && (
                  <>
                    <span className="text-2xl font-bold mr-4">{`${attribute.number.sum}`}</span>
                    {/* <p className="text-xs text-muted-foreground">{`${t('page.order-statistic.all')}: ${attribute.number.count}`}</p> */}
                  </>
                )}
                {attribute.type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{`${t('table.yesno.true')} (${attribute.boolean?.true})`}</Badge>
                    <Badge variant="destructive">{`${t('table.yesno.false')} (${attribute.boolean?.false})`}</Badge>
                  </div>
                )}
                {attribute.type === 'select' && (
                  attribute.options.map(option => (
                    <Badge key={option.id}>{`${option.name[i18n.language]} (${option.count})`}</Badge>
                  ))
                )}
                {attribute.type === 'multiSelect' && (
                  attribute.options.map(option => (
                    <Badge key={option.id}>{`${option.name[i18n.language]} (${option.count})`}</Badge>
                  ))
                )}
                {attribute.type === 'color' && (
                  attribute.options.map(option => (
                    <Badge key={option.id}>{`${option.name[i18n.language]} (${option.count})`}</Badge>
                  ))
                )}
              </CardContent>
            </Card>
          )
        }) }
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        { statistics.productCategories.map((category) => {
          return (
            <Card className="gap-0" key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.names[i18n.language]}</CardTitle>
                { category?.man > 0 && (
                  <Badge>{`${category.count} ${t('page.order-statistic.products')}`}</Badge>
                )}
              </CardHeader>
              <CardContent className="flex items-center gap-2 flex-wrap">
                { category.units.map(unit => (
                  <span className="text-2xl font-bold mr-4" key={unit.id}>{`${unit.quantity} ${unit.symbols[i18n.language]}`}</span>
                )) }
              </CardContent>
            </Card>
          )
        }) }
      </div>
    </>
  )
}
