import type { Document, Filter } from 'mongodb'
import type { Migration } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const migration029PaymentApplications: Migration = {
  id: '029',
  name: 'payment_applications_from_non_cash_allocations',
  async up({ db, log }) {
    const txs = db.collection('money-transactions')
    const apps = db.collection('payment-applications')
    const procurements = db.collection('procurements')

    const fakes = await txs.find({ affectsBalance: false } as unknown as Filter<Document>).toArray()
    if (fakes.length === 0) {
      log('  no non-cash allocation rows')
    }
    else {
      const parentIds = [...new Set(fakes.map(row => String(row.transferId ?? '')).filter(Boolean))]
      const parents = parentIds.length > 0
        ? await txs.find({ _id: { $in: parentIds } } as unknown as Filter<Document>, { projection: { _id: 1, sourceId: 1, sourceModel: 1 } }).toArray()
        : []
      const parentById = new Map(parents.map(row => [String(row._id), row]))

      const procurementIds = [...new Set(fakes.map(row => String(row.sourceId ?? '')).filter(Boolean))]
      const procurementDocs = procurementIds.length > 0
        ? await procurements.find({ _id: { $in: procurementIds } } as unknown as Filter<Document>, { projection: { _id: 1, supplierId: 1 } }).toArray()
        : []
      const supplierByProcurement = new Map(procurementDocs.map(row => [String(row._id), String(row.supplierId ?? '')]))

      const docs: Record<string, unknown>[] = []
      const removeIds: string[] = []

      for (const row of fakes) {
        const transferId = typeof row.transferId === 'string' && row.transferId.length > 0 ? row.transferId : null
        if (transferId === null)
          continue

        const parent = parentById.get(transferId)
        const documentId = String(row.sourceId ?? '')
        const partyId = parent?.sourceModel === 'supplier'
          ? String(parent.sourceId ?? '')
          : supplierByProcurement.get(documentId) ?? ''
        if (!partyId || !documentId)
          continue

        docs.push({
          _id: uuidv4(),
          partyType: 'supplier',
          partyId,
          documentType: 'procurement',
          documentId,
          moneyTransactionId: transferId,
          currencyId: row.currencyId,
          minorAmount: Number(row.minorAmount) || 0,
          comment: typeof row.description === 'string' ? row.description : '',
          cancelled: row.cancelled === true,
          cancelledBy: row.cancelledBy ?? null,
          cancelledAt: row.cancelledAt ?? null,
          createdBy: row.createdBy ?? null,
          createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(),
          updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(),
        })
        removeIds.push(String(row._id))
      }

      if (docs.length > 0)
        await apps.insertMany(docs)
      if (removeIds.length > 0)
        await txs.deleteMany({ _id: { $in: removeIds } } as unknown as Filter<Document>)

      log(`  converted ${docs.length} allocation rows`)
    }

    await txs.updateMany({}, { $unset: { affectsBalance: 1 } })
    log('  dropped affectsBalance')
  },
}
