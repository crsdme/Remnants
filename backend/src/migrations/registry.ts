import type { Migration } from './types'
import { migration001CurrencyPaymentEpsilon } from './scripts/001_currency_payment_epsilon'
import { migration002Products } from './scripts/002_products'
import { migration003OrdersAndItems } from './scripts/003_orders_and_items'
import { migration004PaymentsAndMoneyTransactions } from './scripts/004_payments_and_money_transactions'
import { migration005Expenses } from './scripts/005_expenses'
import { migration006Procurements } from './scripts/006_procurements'
import { migration007Cashregisters } from './scripts/007_cashregisters'
import { migration008WarehousesQuantitiesInventories } from './scripts/008_warehouses_quantities_inventories'
import { migration009CatalogRefs } from './scripts/009_catalog_refs'
import { migration010UsersAndAccess } from './scripts/010_users_and_access'
import { migration011UsersSeq } from './scripts/011_users_seq'
import { migration012Indexes } from './scripts/012_indexes'
import { migration013DropOrderPaymentStatus } from './scripts/013_drop_order_payment_status'
import { migration014ExchangeRateObjectIds } from './scripts/014_exchange_rate_objectid_to_uuid'
import { migration015OrderStatusIsDisplayed } from './scripts/015_order_status_is_displayed'
import { migration016InventoryItemObjectIds } from './scripts/016_inventory_item_objectid_to_uuid'
import { migration017InventoryDropAwaitingReceived } from './scripts/017_inventory_drop_awaiting_received'
import { migration018OrderStatusIncludeInStatistics } from './scripts/018_order_status_include_in_statistics'
import { migration019OrderItemObjectIds } from './scripts/019_order_item_objectid_to_uuid'
import { migration020InventorySeqCounterSync } from './scripts/020_inventory_seq_counter_sync'
import { migration021SyncEntrySiteLinkUnique } from './scripts/021_sync_entry_site_link_unique'

export const migrations: Migration[] = [
  migration001CurrencyPaymentEpsilon,
  migration002Products,
  migration003OrdersAndItems,
  migration004PaymentsAndMoneyTransactions,
  migration005Expenses,
  migration006Procurements,
  migration007Cashregisters,
  migration008WarehousesQuantitiesInventories,
  migration009CatalogRefs,
  migration010UsersAndAccess,
  migration011UsersSeq,
  migration012Indexes,
  migration013DropOrderPaymentStatus,
  migration014ExchangeRateObjectIds,
  migration015OrderStatusIsDisplayed,
  migration016InventoryItemObjectIds,
  migration017InventoryDropAwaitingReceived,
  migration018OrderStatusIncludeInStatistics,
  migration019OrderItemObjectIds,
  migration020InventorySeqCounterSync,
  migration021SyncEntrySiteLinkUnique,
]
