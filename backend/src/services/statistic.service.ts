import type * as StatisticTypes from '../types/statistic.type'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as OrderService from './order.service'

export async function get(payload: StatisticTypes.getStatisticParams): Promise<StatisticTypes.getStatisticResult> {
  const {
    date = {
      from: new Date(),
      to: new Date(),
    },
    warehouse = '',
    deliveryService = '',
    orderSource = '',
  } = payload.filters || {}

  const { orders, ordersCount } = await OrderService.get({
    filters: {
      createdAt: date,
      warehouse,
      deliveryService,
      orderSource,
    },
  })

  console.log(orders, ordersCount)

  const orderItems = await OrderService.getItems({
    filters: {
      order: orders.map(order => order.id),
      showFullData: true,
    },
  })

  // console.log(orderItems)

  const totalProfit = orderItems.orderItems.reduce((acc: number, item: any) => acc + item.profit * item.quantity, 0)
  const totalPurchasePrice = orderItems.orderItems.reduce((acc: number, item: any) => acc + item.purchasePrice * item.quantity, 0)
  const totalPrice = orderItems.orderItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)

  const statistics = [
    {
      id: 'all',
      profit: totalProfit,
      purchasePrice: totalPurchasePrice,
      price: totalPrice,
    },
  ]

  // console.log(totalProfit, totalPurchasePrice, totalPrice)

  // const filterRules = {
  //   date: { type: 'dateRange' },
  //   warehouse: { type: 'string' },
  //   deliveryService: { type: 'string' },
  //   orderSource: { type: 'string' },
  // } as const

  // const query = buildQuery({
  //   filters: { date, warehouse, deliveryService, orderSource },
  //   rules: filterRules,
  // })
  // const sorters = buildSortQuery(payload.sorters || {}, { date: 1 })

  // const pipeline = [
  //   {
  //     $match: query,
  //   },
  //   {
  //     $sort: sorters,
  //   },
  //   {
  //     $facet: {
  //       statistics: [
  //         { $skip: (current - 1) * pageSize },
  //         { $limit: pageSize },
  //       ],
  //       totalCount: [
  //         { $count: 'count' },
  //       ],
  //     },
  //   },
  // ]

  // const statisticsRaw = await OrderModel.aggregate(pipeline).exec()

  // const statistics = statisticsRaw[0].statistics
  // const statisticsCount = statisticsRaw[0].totalCount[0]?.count || 0

  return {
    status: 'success',
    code: 'STATISTICS_FETCHED',
    message: 'Statistics fetched',
    statistics,
  }
}
