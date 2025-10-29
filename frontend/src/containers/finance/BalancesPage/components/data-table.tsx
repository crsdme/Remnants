import { ChartAreaInteractive } from './chart'

export function DataTable() {
  return (
    <>
      {/* <Form {...form}>
        <form onSubmit={form.handleSubmit(submitBalanceForm)} className="mt-4">
          <div className="flex items-end gap-2 w-full">
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex-1">
              <FormControl>
                <Button type="submit" disabled={isLoading} loading={isLoading}>
                  {t('button.send')}
                </Button>
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </form>
      </Form> */}
      <ChartAreaInteractive />
    </>
  )
}
