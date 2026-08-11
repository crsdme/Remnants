import type { Migration } from '../types'
import { backfillSeq, renameFields, setDefaultWhereMissing } from '../helpers'

/** Catalog entities: sites, sync, categories, properties, barcodes, delivery-services, clients. */
export const migration009CatalogRefs: Migration = {
  id: '009',
  name: 'catalog_refs',
  async up({ db, log }) {
    await renameFields(db.collection('sites'), {
      warehouses: 'warehouseIds',
    }, log)

    await renameFields(db.collection('sync-entries'), {
      site: 'siteId',
    }, log)

    await renameFields(db.collection('categories'), {
      parent: 'parentId',
    }, log)
    await backfillSeq(db, 'categories', 'categories', log)

    await renameFields(db.collection('product-properties'), {
      options: 'optionIds',
    }, log)

    await renameFields(db.collection('product-property-groups'), {
      productProperties: 'productPropertyIds',
    }, log)

    await renameFields(db.collection('product-property-options'), {
      productProperty: 'productPropertyId',
    }, log)

    await setDefaultWhereMissing(db.collection('delivery-services'), 'active', true, log)

    await backfillSeq(db, 'clients', 'clients', log)

    // barcodes.products[].quantity → unitsPerScan
    const barcodes = db.collection('barcodes')
    const docs = await barcodes.find({
      'products.quantity': { $exists: true },
    }).toArray()

    if (docs.length) {
      const ops = docs.map((doc) => {
        const products = Array.isArray(doc.products)
          ? doc.products.map((p: Record<string, unknown>) => {
              const { quantity, unitsPerScan, ...rest } = p
              return {
                ...rest,
                unitsPerScan: unitsPerScan ?? quantity ?? 1,
              }
            })
          : doc.products

        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { products } },
          },
        }
      })
      await barcodes.bulkWrite(ops, { ordered: false })
      log(`  barcodes products.quantity → unitsPerScan: ${ops.length}`)
    }
  },
}
