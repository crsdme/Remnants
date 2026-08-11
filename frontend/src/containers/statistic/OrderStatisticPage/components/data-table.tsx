import type { StatisticMoneyDTO, StatisticsDTO } from '@remnant/shared'
import type { ChartConfig } from '@/components/ui/chart'
import type { SupportedLanguage } from '@/utils/constants'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { useCashregisterAccountOptions, useCashregisterOptions } from '@/api/hooks'
import { PermissionGate } from '@/components'
import { DateRangePicker } from '@/components/'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useOrderStatisticContext } from '../context'

function formatMoneyList(
  amounts: StatisticMoneyDTO[] | undefined,
  language: SupportedLanguage,
  empty = '—',
) {
  if (!amounts?.length)
    return empty

  return amounts
    .filter(item => item.total !== 0)
    .map(item => `${item.total} ${item.currency.symbols?.[language] ?? item.currency.symbols?.en ?? ''}`)
    .join(' · ') || empty
}

function pickPrimaryCurrencyId(statistics: StatisticsDTO): string | null {
  const totals = new Map<string, number>()
  for (const row of statistics.orders.amount) {
    totals.set(row.currency.id, (totals.get(row.currency.id) ?? 0) + Math.abs(row.total))
  }
  for (const row of statistics.payments.income.amount) {
    totals.set(row.currency.id, (totals.get(row.currency.id) ?? 0) + Math.abs(row.total))
  }
  let best: string | null = null
  let bestValue = -1
  for (const [id, value] of totals) {
    if (value > bestValue) {
      best = id
      bestValue = value
    }
  }
  return best
}

function moneyForCurrency(amounts: StatisticMoneyDTO[], currencyId: string | null) {
  if (!currencyId)
    return 0
  return amounts.find(a => a.currency.id === currencyId)?.total ?? 0
}

export function DataTable() {
  const { language, t } = useLocale()
  const { isLoading, isFetching, form, onSubmit, statistics } = useOrderStatisticContext()

  const loadCashregisterOptions = useCashregisterOptions({})
  const loadCashregisterAccountOptions = useCashregisterAccountOptions({})

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => { void form.handleSubmit(onSubmit)(e) }}
          className="mt-4"
        >
          <div className="flex flex-wrap items-end gap-2 w-full">
            <FormField
              name="cashregister"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex-1 min-w-45">
                  <FormLabel>{t('page.order-statistic.form.cashregister')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadCashregisterOptions}
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || isFetching}
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('cashregisterAccount', [])
                      }}
                      name="cashregister"
                      clearable
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
                <FormItem className="flex-1 min-w-45">
                  <FormLabel>{t('page.order-statistic.form.cashregister-account')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadCashregisterAccountOptions}
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || isFetching}
                      onChange={field.onChange}
                      name="cashregisterAccount"
                      clearable
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
                <FormItem className="flex-1 min-w-55">
                  <FormLabel>{t('page.order-statistic.form.date')}</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value}
                      onSelect={field.onChange}
                      disabled={isLoading || isFetching}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormControl>
                <Button type="submit" disabled={isLoading || isFetching} loading={isLoading || isFetching}>
                  {t('button.send')}
                </Button>
              </FormControl>
            </FormItem>
          </div>
        </form>
      </Form>

      <div className="mt-4 space-y-4">
        <OrderStatisticCards statistics={statistics} />
        <IncomeExpenseCards statistics={statistics} />
        <StatisticSeriesChart statistics={statistics} />
        <ProductsStatisticTable statistics={statistics} />
      </div>
    </>
  )
}

function OrderStatisticCards({ statistics }: { statistics: StatisticsDTO }) {
  const { language, t } = useLocale()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('page.order-statistic.total-amount')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatMoneyList(statistics.orders.amount, language)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {t('page.order-statistic.orders_count', { count: statistics.orders.count })}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('page.order-statistic.paid')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatMoneyList(statistics.orders.paid.amount, language)}
          </CardTitle>
          <CardAction>
            <Badge variant="success">
              {t('page.order-statistic.orders_count', { count: statistics.orders.paid.count })}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('page.order-statistic.unpaid')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatMoneyList(statistics.orders.unpaid.amount, language)}
          </CardTitle>
          <CardAction>
            <Badge variant="destructive">
              {t('page.order-statistic.orders_count', { count: statistics.orders.unpaid.count })}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}

function IncomeExpenseCards({ statistics }: { statistics: StatisticsDTO }) {
  const { language, t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('page.order-statistic.income')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatMoneyList(statistics.payments.income.amount, language)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {t('page.order-statistic.payments_count', { count: statistics.payments.income.count })}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('page.order-statistic.expenses')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatMoneyList(statistics.payments.expense.amount, language)}
            </CardTitle>
            <CardAction>
              <Badge variant="destructive">
                {t('page.order-statistic.expenses_count', { count: statistics.payments.expense.count })}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t('page.order-statistic.profit')}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatMoneyList(statistics.payments.profit.amount, language)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {t('page.order-statistic.cash-profit-hint')}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>

        <PermissionGate permission={['order.profit', 'orderStatistic.profit']}>
          {statistics.payments.margin && (
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>{t('page.order-statistic.margin')}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatMoneyList(statistics.payments.margin.amount, language)}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    {t('page.order-statistic.margin-hint')}
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          )}
        </PermissionGate>
      </div>

      {statistics.payments.expense.categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statistics.payments.expense.categories.map(({ category, count, currencies }) => (
            <Card className="@container/card" key={category.id}>
              <CardHeader>
                <CardDescription>{category.names[language] ?? category.names.en}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatMoneyList(currencies, language)}
                </CardTitle>
                <CardAction>
                  <Badge variant="destructive">
                    {t('page.order-statistic.expenses_count', { count })}
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StatisticSeriesChart({ statistics }: { statistics: StatisticsDTO }) {
  const { language, t } = useLocale()
  const currencyId = pickPrimaryCurrencyId(statistics)

  const chartData = statistics.series.map(point => ({
    date: point.date,
    turnover: moneyForCurrency(point.turnover, currencyId),
    income: moneyForCurrency(point.income, currencyId),
    expenses: moneyForCurrency(point.expenses, currencyId),
    profit: moneyForCurrency(point.profit, currencyId),
  }))

  const currencySymbol = statistics.orders.amount.find(a => a.currency.id === currencyId)?.currency.symbols?.[language]
    ?? statistics.payments.income.amount.find(a => a.currency.id === currencyId)?.currency.symbols?.[language]
    ?? ''

  const chartConfig: ChartConfig = {
    turnover: { label: t('page.order-statistic.chart.turnover'), color: 'var(--chart-1)' },
    income: { label: t('page.order-statistic.chart.income'), color: 'var(--chart-2)' },
    expenses: { label: t('page.order-statistic.chart.expenses'), color: 'var(--chart-3)' },
    profit: { label: t('page.order-statistic.chart.profit'), color: 'var(--chart-4)' },
  }

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{t('page.order-statistic.chart.title')}</CardTitle>
          <CardDescription>
            {currencySymbol
              ? t('page.order-statistic.chart.description-currency', { currency: currencySymbol })
              : t('page.order-statistic.chart.description')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-70 w-full">
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(language, {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={(
                <ChartTooltipContent
                  labelFormatter={value =>
                    new Date(value).toLocaleDateString(language, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  indicator="dot"
                />
              )}
            />
            <Area dataKey="turnover" type="monotone" fill="var(--color-turnover)" stroke="var(--color-turnover)" fillOpacity={0.2} />
            <Area dataKey="income" type="monotone" fill="var(--color-income)" stroke="var(--color-income)" fillOpacity={0.15} />
            <Area dataKey="expenses" type="monotone" fill="var(--color-expenses)" stroke="var(--color-expenses)" fillOpacity={0.15} />
            <Area dataKey="profit" type="monotone" fill="var(--color-profit)" stroke="var(--color-profit)" fillOpacity={0.2} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function ProductsStatisticTable({ statistics }: { statistics: StatisticsDTO }) {
  const { language, t } = useLocale()
  const items = statistics.products.items

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('page.order-statistic.products.title')}</CardTitle>
        <CardDescription>
          {t('page.order-statistic.products.description', { count: statistics.products.count })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0
          ? (
              <p className="text-sm text-muted-foreground">{t('page.order-statistic.products.empty')}</p>
            )
          : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('page.order-statistic.products.table.name')}</TableHead>
                      <TableHead className="text-right">{t('page.order-statistic.products.table.quantity')}</TableHead>
                      <TableHead className="text-right">{t('page.order-statistic.products.table.amount')}</TableHead>
                      <PermissionGate permission={['order.profit', 'orderStatistic.profit']}>
                        <TableHead className="text-right">{t('page.order-statistic.products.table.profit')}</TableHead>
                      </PermissionGate>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(row => (
                      <TableRow key={row.product.id}>
                        <TableCell className="font-medium">
                          {row.product.names[language] ?? row.product.names.en ?? row.product.id}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoneyList(row.amount, language)}
                        </TableCell>
                        <PermissionGate permission={['order.profit', 'orderStatistic.profit']}>
                          <TableCell className="text-right tabular-nums">
                            {formatMoneyList(row.profit, language)}
                          </TableCell>
                        </PermissionGate>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
      </CardContent>
    </Card>
  )
}
