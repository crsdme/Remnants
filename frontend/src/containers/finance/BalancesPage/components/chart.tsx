import type {
  ChartConfig,
} from '@/components/ui/chart'
import * as React from 'react'

import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui'
import { useBalanceContext } from '../context'

export const description = 'An interactive area chart'

export function ChartAreaInteractive() {
  const { t, i18n } = useTranslation()
  const { balances, currencies } = useBalanceContext()

  const dataForChart = React.useMemo(() => {
    return balances.map((snap: any) => {
      const row: Record<string, any> = { createdAt: snap.createdAt }
      for (const t of snap.totalBalances ?? []) {
        row[t.currencyId] = t.amount ?? 0
      }

      for (const c of currencies ?? []) {
        if (row[c.id] == null)
          row[c.id] = 0
      }
      return row
    })
  }, [balances, currencies])

  const chartConfig: ChartConfig = React.useMemo(() => {
    const cfg: ChartConfig = {}
    currencies.forEach((c, idx) => {
      const colorVarIndex = (idx % 10) + 1
      cfg[c.id] = {
        label: c.names?.[i18n.language],
        color: `var(--chart-${colorVarIndex})`,
      }
    })
    return cfg
  }, [currencies])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{t('page.balances.chart.title')}</CardTitle>
          <CardDescription>
            {t('page.balances.chart.description')}
          </CardDescription>
        </div>
        {/* <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select> */}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={dataForChart}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="createdAt"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(i18n.language, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={(
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(i18n.language, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }}
                  indicator="dot"
                />
              )}
            />
            {currencies.map((c, idx) => {
              const colorVarIndex = (idx % 5) + 1
              return (
                <Area
                  key={c.id}
                  dataKey={c.id}
                  type="linear"
                  fill={`var(--chart-${colorVarIndex})`}
                  stroke={`var(--chart-${colorVarIndex})`}
                //   stackId="total"
                />
              )
            })}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
