import { useCashregisterAccountOptions, useCashregisterOptions } from '@/api/hooks'

import { DateRangePicker } from '@/components/'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useOrderStatisticContext } from '../context'

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
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
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
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
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
      <OrderStatisticCard statistics={statistics} t={t} language={language} />
      <ExpensesStatisticCard statistics={statistics} t={t} language={language} />
      <IncomeStatisticCard statistics={statistics} t={t} language={language} />
      {/* <AttributesStatisticCard statistics={statistics} t={t} i18n={i18n} />
      <CategoriesStatisticCard statistics={statistics} t={t} i18n={i18n} /> */}
    </>
  )
}

function OrderStatisticCard({ statistics, t, language }: { statistics: any, t: any, language: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('page.order-statistic.total-amount')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
            {statistics.orders.amount.map((item: any) => {
              if (item.total === 0)
                return null

              return (
                <span key={item.currency}>
                  {`${item.total} ${item.currency.symbols[language]}`}
                </span>
              )
            })}
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
          <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
            {statistics.orders.paid.amount.map((item: any) => {
              if (item.total === 0)
                return ''

              return (
                <span key={item.currency}>
                  {`${item.total} ${item.currency.symbols[language]}`}
                </span>
              )
            })}
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
          <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
            {statistics.orders.unpaid.amount.map((item: any) => {
              if (item.total === 0)
                return ''

              return (
                <span key={item.currency}>
                  {`${item.total} ${item.currency.symbols[language]}`}
                </span>
              )
            })}
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

function ExpensesStatisticCard({ statistics, t, language }: { statistics: any, t: any, language: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('page.order-statistic.expenses')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
            {statistics.payments.expense.categories.map((item: any) => {
              if (item.total === 0)
                return ''

              return (
                <span key={item.currency}>
                  {`${item.total} ${item.currency.symbols[language]}`}
                </span>
              )
            })}
          </CardTitle>
          <CardAction>
            <Badge variant="destructive">
              {t('page.order-statistic.expenses_count', { count: statistics.payments.expense.count })}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>

      {statistics.payments.expense.categories.map(({ category, count, currencies }: any) => {
        return (
          <Card className="@container/card" key={category.id}>
            <CardHeader>
              <CardDescription>{category.names[language]}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
                {currencies.map((item: any) => {
                  if (item.total === 0)
                    return ''

                  return (
                    <span key={item.currency}>
                      {`${item.total} ${item.currency.symbols[language]}`}
                    </span>
                  )
                })}
              </CardTitle>
              <CardAction>
                <Badge variant="destructive">
                  {t('page.order-statistic.expenses_count', { count })}
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}

function IncomeStatisticCard({ statistics, t, language }: { statistics: any, t: any, language: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t('page.order-statistic.income')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
            {statistics.payments.income.amount.map((item: any) => {
              if (item.total === 0)
                return null

              return (
                <span key={item.currency}>
                  {`${item.total} ${item.currency.symbols[language]}`}
                </span>
              )
            })}
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
          <CardDescription>{t('page.order-statistic.profit')}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
            {statistics.payments.profit.amount.map((item: any) => {
              if (item.total === 0)
                return null

              return (
                <span key={item.currency}>
                  {`${item.total} ${item.currency.symbols[language]}`}
                </span>
              )
            })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {t('page.order-statistic.payments_count', { count: statistics.payments.profit.count })}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}

// function AttributesStatisticCard({ statistics, t, i18n }: { statistics: any, t: any, i18n: any }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
//       { statistics.products.attributes.map((attribute) => {
//         return (
//           <Card className="@container/card" key={attribute.id}>
//             <CardHeader>
//               <CardDescription>{attribute.name[i18n.language]}</CardDescription>
//               <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
//                 {attribute.type === 'number' && (
//                   <>
//                     <span className="text-3xl font-bold mr-4">{`${attribute.number.sum}`}</span>
//                   </>
//                 )}
//                 {attribute.type === 'boolean' && (
//                   <div className="flex items-center gap-2">
//                     <Badge variant="success">{`${t('table.yesno.true')} (${attribute.boolean?.true})`}</Badge>
//                     <Badge variant="destructive">{`${t('table.yesno.false')} (${attribute.boolean?.false})`}</Badge>
//                   </div>
//                 )}
//                 {attribute.type === 'select' && (
//                   attribute.options.map(option => (
//                     <Badge variant="secondary" key={option.id}>{`${option.name[i18n.language]} (${option.count})`}</Badge>
//                   ))
//                 )}
//                 {attribute.type === 'multiSelect' && (
//                   attribute.options.map(option => (
//                     <Badge variant="secondary" key={option.id}>{`${option.name[i18n.language]} (${option.count})`}</Badge>
//                   ))
//                 )}
//                 {attribute.type === 'color' && (
//                   attribute.options.map(option => (
//                     <Badge variant="secondary" key={option.id}>{`${option.name[i18n.language]} (${option.count})`}</Badge>
//                   ))
//                 )}
//               </CardTitle>
//               <CardAction>
//                 <Badge variant="outline">
//                   {t('page.order-statistic.products_count', { count: attribute.count })}
//                 </Badge>
//               </CardAction>
//             </CardHeader>
//           </Card>
//         )
//       }) }
//     </div>
//   )
// }

// function CategoriesStatisticCard({ statistics, t, i18n }: { statistics: any, t: any, i18n: any }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
//       { statistics.products.categories.map((category) => {
//         return (
//           <Card className="@container/card" key={category.id}>
//             <CardHeader>
//               <CardDescription>{category.names[i18n.language]}</CardDescription>
//               <CardTitle className="text-2xl font-semibold tabular-nums flex flex-wrap gap-4 @[250px]/card:text-3xl">
//                 { category.units.map(({ id, symbols, quantity }) => (
//                   <span className="text-3xl font-bold mr-4" key={id}>{`${quantity} ${symbols[i18n.language]}`}</span>
//                 )) }
//               </CardTitle>
//               <CardAction>
//                 <Badge variant="outline">
//                   {t('page.order-statistic.products_count', { count: category.count })}
//                 </Badge>
//               </CardAction>
//             </CardHeader>
//           </Card>
//         )
//       }) }
//     </div>
//   )
// }
