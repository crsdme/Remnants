import type { Migration } from '../types'
import { ensureIndexes } from '../helpers'

/**
 * Ensure query indexes for high-traffic and frequently filtered collections.
 * createIndex is idempotent — safe to re-run / re-apply on fresh DBs.
 */
export const migration012Indexes: Migration = {
  id: '012',
  name: 'ensure_query_indexes',
  async up({ db, log }) {
    // ── Products & catalog ──────────────────────────────────────────────
    await ensureIndexes(db.collection('products'), [
      { key: { removed: 1, seq: 1 } },
      { key: { categoryIds: 1 } },
      { key: { barcodeIds: 1 } },
      { key: { currencyId: 1 } },
      { key: { unitId: 1 } },
      { key: { productPropertiesGroupId: 1 } },
      { key: { names: 1 } },
      { key: { minorPrice: 1 } },
      { key: { minorPurchasePrice: 1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('barcodes'), [
      { key: { code: 1 } },
      { key: { 'products._id': 1 } },
      { key: { removed: 1, active: 1 } },
    ], log)

    await ensureIndexes(db.collection('quantities'), [
      { key: { productId: 1, warehouseId: 1 } },
      { key: { warehouseId: 1 } },
    ], log)

    await ensureIndexes(db.collection('categories'), [
      { key: { parentId: 1 } },
      { key: { removed: 1, active: 1 } },
      { key: { priority: 1 } },
      { key: { seq: 1 } },
    ], log)

    await ensureIndexes(db.collection('product-properties'), [
      { key: { removed: 1, active: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('product-property-groups'), [
      { key: { removed: 1, active: 1 } },
    ], log)

    await ensureIndexes(db.collection('product-property-options'), [
      { key: { productPropertyId: 1 } },
      { key: { removed: 1, active: 1 } },
    ], log)

    await ensureIndexes(db.collection('units'), [
      { key: { removed: 1, active: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('currencies'), [
      { key: { removed: 1, active: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('exchange-rates'), [
      { key: { fromCurrencyId: 1, toCurrencyId: 1 } },
    ], log)

    // ── Orders ──────────────────────────────────────────────────────────
    await ensureIndexes(db.collection('orders'), [
      { key: { removed: 1, seq: -1 } },
      { key: { warehouseId: 1, removed: 1 } },
      { key: { orderStatusId: 1, removed: 1 } },
      { key: { orderSourceId: 1, removed: 1 } },
      { key: { clientId: 1 } },
      { key: { orderPaymentStatus: 1, removed: 1 } },
      { key: { createdBy: 1 } },
      { key: { createdAt: -1 } },
      { key: { seq: 1 } },
    ], log)

    await ensureIndexes(db.collection('order-items'), [
      { key: { orderId: 1, removed: 1 } },
      { key: { productId: 1 } },
    ], log)

    await ensureIndexes(db.collection('order-payments'), [
      { key: { orderId: 1, removed: 1 } },
      { key: { cashregisterId: 1 } },
      { key: { cashregisterAccountId: 1 } },
      { key: { transactionId: 1 } },
      { key: { paymentDate: -1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('order-statuses'), [
      { key: { removed: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('order-sources'), [
      { key: { removed: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('delivery-services'), [
      { key: { removed: 1, active: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('clients'), [
      { key: { removed: 1, seq: 1 } },
      { key: { phones: 1 } },
      { key: { emails: 1 } },
      { key: { createdAt: -1 } },
    ], log)

    // ── Finance ─────────────────────────────────────────────────────────
    await ensureIndexes(db.collection('money-transactions'), [
      { key: { cashregisterId: 1, createdAt: -1 } },
      { key: { accountId: 1, createdAt: -1 } },
      { key: { sourceModel: 1, sourceId: 1 } },
      { key: { type: 1, createdAt: -1 } },
      { key: { transferId: 1 } },
      { key: { seq: 1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('expenses'), [
      { key: { removed: 1, seq: -1 } },
      { key: { cashregisterId: 1 } },
      { key: { cashregisterAccountId: 1 } },
      { key: { categoryIds: 1 } },
      { key: { sourceModel: 1, sourceId: 1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('expense-categories'), [
      { key: { removed: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('cashregisters'), [
      { key: { removed: 1, active: 1 } },
      { key: { accountIds: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('cashregister-accounts'), [
      { key: { removed: 1, active: 1 } },
      { key: { currencyIds: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('procurements'), [
      { key: { status: 1 } },
      { key: { paymentStatus: 1 } },
      { key: { supplierId: 1 } },
      { key: { seq: 1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('procurement-items'), [
      { key: { procurementId: 1 } },
      { key: { productId: 1 } },
    ], log)

    // ── Warehouse ───────────────────────────────────────────────────────
    await ensureIndexes(db.collection('warehouses'), [
      { key: { removed: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('warehouse-transactions'), [
      { key: { removed: 1, seq: -1 } },
      { key: { status: 1, removed: 1 } },
      { key: { fromWarehouseId: 1 } },
      { key: { toWarehouseId: 1 } },
      { key: { createdAt: -1 } },
      { key: { seq: 1 } },
    ], log)

    await ensureIndexes(db.collection('warehouse-transaction-items'), [
      { key: { transactionId: 1 } },
      { key: { productId: 1 } },
    ], log)

    await ensureIndexes(db.collection('warehouse-transaction-logs'), [
      { key: { productId: 1, warehouseId: 1, createdAt: 1 } },
      { key: { refType: 1, refId: 1 } },
      { key: { userId: 1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('inventories'), [
      { key: { removed: 1, seq: -1 } },
      { key: { warehouseId: 1, removed: 1 } },
      { key: { status: 1 } },
      { key: { categoryIds: 1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('inventory-items'), [
      { key: { inventoryId: 1 } },
      { key: { productId: 1 } },
    ], log)

    // ── Users & access ──────────────────────────────────────────────────
    await ensureIndexes(db.collection('users'), [
      { key: { login: 1 }, options: { unique: true, partialFilterExpression: { removed: false } } },
      { key: { roleId: 1 } },
      { key: { removed: 1, active: 1 } },
      { key: { seq: 1 } },
    ], log)

    await ensureIndexes(db.collection('user-accesses'), [
      { key: { userId: 1 }, options: { unique: true } },
    ], log)

    await ensureIndexes(db.collection('user-roles'), [
      { key: { removed: 1, active: 1 } },
      { key: { priority: 1 } },
    ], log)

    // ── Sync / audit / settings / sites ──────────────────────────────────
    await ensureIndexes(db.collection('sync-entries'), [
      { key: { sourceType: 1, sourceId: 1 } },
      { key: { siteId: 1 } },
      { key: { externalId: 1 } },
      { key: { status: 1 } },
    ], log)

    await ensureIndexes(db.collection('audit-logs'), [
      { key: { resourceType: 1, resourceId: 1, createdAt: -1 } },
      { key: { createdBy: 1, createdAt: -1 } },
      { key: { action: 1, createdAt: -1 } },
      { key: { createdAt: -1 } },
    ], log)

    await ensureIndexes(db.collection('settings'), [
      { key: { key: 1 } },
      { key: { scope: 1, key: 1 } },
    ], log)

    await ensureIndexes(db.collection('sites'), [
      { key: { removed: 1 } },
      { key: { key: 1 } },
      { key: { priority: 1 } },
    ], log)

    await ensureIndexes(db.collection('languages'), [
      { key: { code: 1 } },
      { key: { removed: 1, active: 1 } },
    ], log)

    log('  all query indexes ensured')
  },
}
