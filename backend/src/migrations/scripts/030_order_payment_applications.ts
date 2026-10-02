import type { Document, Filter } from 'mongodb'
import type { Migration } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { backfillSeq } from '../helpers'

export const migration030OrderPaymentApplications: Migration = {
  id: '030',
  name: 'order_payments_to_applications_and_seq',
  async up({ db, log }) {
    const apps = db.collection('payment-applications')
    const txs = db.collection('money-transactions')
    const orders = db.collection('orders')
    const orderPayments = db.collection('order-payments')

    const payments = await orderPayments.find({ removed: { $ne: true } } as Filter<Document>).toArray()
    const orderIds = [...new Set(payments.map(row => String(row.orderId ?? '')).filter(Boolean))]
    const orderDocs = orderIds.length > 0
      ? await orders.find({ _id: { $in: orderIds } } as Filter<Document>, { projection: { _id: 1, clientId: 1 } }).toArray()
      : []
    const clientByOrder = new Map(orderDocs.map(row => [String(row._id), String(row.clientId ?? '')]))

    const usedTxIds = new Set<string>()
    const docs: Record<string, unknown>[] = []

    for (const payment of payments) {
      const orderId = String(payment.orderId ?? '')
      const clientId = clientByOrder.get(orderId) ?? ''
      if (!orderId || !clientId)
        continue

      const currencyId = String(payment.currencyId ?? '')
      const minorAmount = Number(payment.minorAmount) || 0
      const transactionId = typeof payment.transactionId === 'string' && payment.transactionId.length > 0
        ? payment.transactionId
        : null

      let moneyTransactionId = transactionId
      if (moneyTransactionId === null || usedTxIds.has(moneyTransactionId)) {
        const match = await txs.findOne({
          sourceModel: 'order',
          sourceId: orderId,
          currencyId,
          minorAmount,
          direction: 'in',
          cancelled: { $ne: true },
          _id: { $nin: [...usedTxIds] },
        } as Filter<Document>)
        moneyTransactionId = match ? String(match._id) : null
      }

      if (moneyTransactionId === null)
        continue

      usedTxIds.add(moneyTransactionId)
      docs.push({
        _id: uuidv4(),
        partyType: 'client',
        partyId: clientId,
        documentType: 'order',
        documentId: orderId,
        moneyTransactionId,
        currencyId,
        minorAmount,
        comment: typeof payment.comment === 'string' ? payment.comment : '',
        cancelled: false,
        cancelledBy: null,
        cancelledAt: null,
        createdBy: payment.createdBy ?? null,
        createdAt: payment.createdAt instanceof Date ? payment.createdAt : new Date(),
        updatedAt: payment.updatedAt instanceof Date ? payment.updatedAt : new Date(),
      })
    }

    if (docs.length > 0)
      await apps.insertMany(docs)
    log(`  created ${docs.length} order payment applications`)

    const retargetOrders = await orders.find({
      clientId: { $exists: true, $nin: [null, ''] },
    } as Filter<Document>, { projection: { _id: 1, clientId: 1 } }).toArray()

    let retargeted = 0
    for (const order of retargetOrders) {
      const result = await txs.updateMany(
        { sourceModel: 'order', sourceId: String(order._id) } as Filter<Document>,
        { $set: { sourceModel: 'client', sourceId: String(order.clientId) } },
      )
      retargeted += result.modifiedCount
    }
    log(`  retargeted ${retargeted} order cash rows to clients`)

    await backfillSeq(db, 'payment-applications', 'payment-applications', log)
  },
}
