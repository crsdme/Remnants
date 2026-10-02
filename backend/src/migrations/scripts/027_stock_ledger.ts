import type { Document, Filter } from 'mongodb'
import type { Migration } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const migration027StockLedger: Migration = {
  id: '027',
  name: 'stock_ledger_opening_lots',
  async up({ db, log }) {
    const quantities = db.collection('quantities')
    const products = db.collection('products')
    const lots = db.collection('stock-lots')
    const moves = db.collection('stock-moves')

    const existingLots = await lots.countDocuments()
    if (existingLots > 0) {
      log('  stock-lots already present, skip')
      return
    }

    const rows = await quantities.find({ count: { $gt: 0 } }).toArray()
    if (!rows.length) {
      log('  no positive quantities')
      return
    }

    const productIds = [...new Set(rows.map(row => String(row.productId)))]
    const productDocs = await products
      .find({ _id: { $in: productIds } } as unknown as Filter<Document>, { projection: { _id: 1, minorPurchasePrice: 1, purchaseCurrencyId: 1 } })
      .toArray()
    const productById = new Map(productDocs.map(doc => [String(doc._id), doc]))

    const now = new Date()
    const lotDocs: Record<string, unknown>[] = []
    const moveDocs: Record<string, unknown>[] = []

    for (const row of rows) {
      const product = productById.get(String(row.productId))
      if (product === undefined || product.purchaseCurrencyId === undefined)
        continue

      const moveId = uuidv4()
      const lotId = uuidv4()
      const receivedAt = row.createdAt instanceof Date ? row.createdAt : now
      const count = Number(row.count) || 0
      if (count <= 0)
        continue

      const minorUnitCost = Number(product.minorPurchasePrice) || 0

      lotDocs.push({
        _id: lotId,
        productId: String(row.productId),
        warehouseId: String(row.warehouseId),
        originalCount: count,
        remainingCount: count,
        minorUnitCost,
        currencyId: String(product.purchaseCurrencyId),
        receivedAt,
        sourceMoveId: moveId,
        createdAt: now,
        updatedAt: now,
      })

      moveDocs.push({
        _id: moveId,
        productId: String(row.productId),
        fromKind: 'adjustment',
        toKind: 'warehouse',
        fromWarehouseId: null,
        toWarehouseId: String(row.warehouseId),
        quantity: count,
        openQuantity: 0,
        layers: [{
          lotId,
          quantity: count,
          minorUnitCost,
          currencyId: String(product.purchaseCurrencyId),
          receivedAt,
        }],
        documentType: 'migration',
        documentId: String(row._id),
        documentItemId: null,
        userId: null,
        cancelled: false,
        cancelledAt: null,
        cancelledBy: null,
        createdAt: now,
        updatedAt: now,
      })
    }

    if (lotDocs.length)
      await lots.insertMany(lotDocs)
    if (moveDocs.length)
      await moves.insertMany(moveDocs)

    log(`  opening lots: ${lotDocs.length}, moves: ${moveDocs.length}`)
  },
}
