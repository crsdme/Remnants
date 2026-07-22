import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import { LogoIcon } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { usePermission } from '@/utils/hooks/usePermission/usePermission'

import * as Pages from '../containers'

import '@/app/App.css'

export default function App() {
  const authContenxt = useAuthContext()

  if (!authContenxt.state.isAuthChecked) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex items-center justify-center w-full max-w-sm gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <LogoIcon />
          </div>
          <p className="flex items-center gap-2 self-center font-medium text-2xl">Remnant</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authContenxt.state.isAuthenticated ? <Layout /> : <Pages.LoginPage />}>
          <Route path="/" element={<Pages.DashboardPage />} />

          <Route
            path="/test"
            element={(<ProtectedRoute children={<Pages.TestPage />} permissions={['user.page']} />)}
          />

          <Route
            path="/orders"
            element={<ProtectedRoute children={<Pages.OrdersPage />} permissions={['order.page']} />}
          />
          <Route
            path="/orders/create"
            element={<ProtectedRoute children={<Pages.CreateOrderPage />} permissions={['order.page']} />}
          />
          <Route
            path="/orders/edit/:seq"
            element={<ProtectedRoute children={<Pages.EditOrderPage />} permissions={['order.page']} />}
          />
          <Route
            path="/orders/view/:seq"
            element={<ProtectedRoute children={<Pages.ViewOrderPage />} permissions={['order.page']} />}
          />

          <Route
            path="/categories"
            element={<ProtectedRoute children={<Pages.CategoriesPage />} permissions={['category.page']} />}
          />
          <Route
            path="/products"
            element={<ProtectedRoute children={<Pages.ProductsPage />} permissions={['product.page']} />}
          />
          <Route
            path="/product-properties-groups"
            element={<ProtectedRoute children={<Pages.ProductPropertiesGroupsPage />} permissions={['productPropertyGroup.page']} />}
          />
          <Route
            path="/product-properties"
            element={<ProtectedRoute children={<Pages.ProductPropertiesPage />} permissions={['productProperty.page']} />}
          />

          <Route
            path="/clients"
            element={<ProtectedRoute children={<Pages.ClientsPage />} permissions={['client.page']} />}
          />
          <Route
            path="/users"
            element={(<ProtectedRoute children={<Pages.UsersPage />} permissions={['user.page']} />)}
          />
          <Route
            path="/users/roles"
            element={<ProtectedRoute children={<Pages.UserRolesPage />} permissions={['userRole.page']} />}
          />

          <Route
            path="/cashregisters"
            element={<ProtectedRoute children={<Pages.CashregistersPage />} permissions={['cashregister.page']} />}
          />
          <Route
            path="/cashregister-accounts"
            element={<ProtectedRoute children={<Pages.CashregisterAccountsPage />} permissions={['cashregisterAccount.page']} />}
          />
          <Route
            path="/money-transactions"
            element={<ProtectedRoute children={<Pages.MoneyTransactionsPage />} permissions={['moneyTransaction.page']} />}
          />
          <Route
            path="/balances"
            element={<ProtectedRoute children={<Pages.BalancesPage />} permissions={['balance.page']} />}
          />

          <Route
            path="/expenses"
            element={<ProtectedRoute children={<Pages.ExpensesPage />} permissions={['expense.page']} />}
          />
          <Route
            path="/settings/expense-categories"
            element={<ProtectedRoute children={<Pages.ExpenseCategoriesPage />} permissions={['expenseCategory.page']} />}
          />
          <Route
            path="/suppliers"
            element={<ProtectedRoute children={<Pages.SuppliersPage />} permissions={['supplier.page']} />}
          />
          <Route
            path="/procurements"
            element={<ProtectedRoute children={<Pages.ProcurementsPage />} permissions={['procurement.page']} />}
          />
          <Route
            path="/procurements/pay/:procurementSeq"
            element={<ProtectedRoute children={<Pages.PayProcurementPage />} permissions={['procurement.page']} />}
          />

          <Route
            path="/procurements/create"
            element={<ProtectedRoute children={<Pages.CreateProcurementPage />} permissions={['procurement.page']} />}
          />

          <Route
            path="/settings"
            element={<ProtectedRoute children={<Pages.SettingsLayout />} permissions={['settings.page']} />}
          >
            <Route
              path="/settings"
              element={<ProtectedRoute children={<Pages.MainSettingsPage />} permissions={['settings.page']} />}
            />
          </Route>

          <Route
            path="/settings/currencies"
            element={<ProtectedRoute children={<Pages.CurrenciesPage />} permissions={['currency.page']} />}
          />
          <Route
            path="/settings/audit-logs"
            element={<ProtectedRoute children={<Pages.AuditLogsPage />} permissions={['auditLog.page']} />}
          />
          <Route
            path="/settings/languages"
            element={<ProtectedRoute children={<Pages.LanguagesPage />} permissions={['language.page']} />}
          />
          <Route
            path="/settings/units"
            element={<ProtectedRoute children={<Pages.UnitsPage />} permissions={['unit.page']} />}
          />
          <Route
            path="/settings/delivery-services"
            element={<ProtectedRoute children={<Pages.DeliveryServicesPage />} permissions={['deliveryService.page']} />}
          />
          <Route
            path="/settings/order-statuses"
            element={<ProtectedRoute children={<Pages.OrderStatusesPage />} permissions={['orderStatus.page']} />}
          />
          <Route
            path="/settings/order-sources"
            element={<ProtectedRoute children={<Pages.OrderSourcesPage />} permissions={['orderSource.page']} />}
          />
          <Route
            path="/settings/automations"
            element={<ProtectedRoute children={<Pages.AutomationsPage />} permissions={['automation.page']} />}
          />
          <Route
            path="/settings/sites"
            element={<ProtectedRoute children={<Pages.SitesPage />} permissions={['site.page']} />}
          />

          <Route
            path="/warehouses"
            element={<ProtectedRoute children={<Pages.WarehousesPage />} permissions={['warehouse.page']} />}
          />
          <Route
            path="/warehouse-transactions"
            element={<ProtectedRoute children={<Pages.WarehouseTransactionsPage />} permissions={['warehouseTransaction.page']} />}
          />
          <Route
            path="/warehouse-transactions/create"
            element={<ProtectedRoute children={<Pages.WarehouseTransactionCreatePage />} permissions={['warehouseTransaction.create']} />}
          />
          <Route
            path="/warehouse-transactions/receive/:seq"
            element={<ProtectedRoute children={<Pages.WarehouseTransactionReceivePage />} permissions={['warehouseTransaction.receive']} />}
          />
          <Route
            path="/barcodes"
            element={<ProtectedRoute children={<Pages.BarcodesPage />} permissions={['barcode.page']} />}
          />
          <Route
            path="/barcodes/create"
            element={<ProtectedRoute children={<Pages.CreateBarcodePage />} permissions={['barcode.create']} />}
          />
          <Route
            path="/barcodes/edit/:id"
            element={<ProtectedRoute children={<Pages.EditBarcodePage />} permissions={['barcode.edit']} />}
          />

          <Route
            path="/inventories"
            element={<ProtectedRoute children={<Pages.InventoriesPage />} permissions={['inventory.page']} />}
          />
          <Route
            path="/inventories/create"
            element={<ProtectedRoute children={<Pages.CreateInventoryPage />} permissions={['inventory.create']} />}
          />
          <Route
            path="/inventories/view/:seq"
            element={<ProtectedRoute children={<Pages.ViewInventoryPage />} permissions={['inventory.page']} />}
          />

          <Route
            path="/statistics/orders"
            element={<ProtectedRoute children={<Pages.OrderStatisticPage />} permissions={['orderStatistic.page']} />}
          />

          <Route path="*" element={<Pages.ErrorPage status={404} />} />
        </Route>
        <Route path="/login" element={<Pages.LoginPage />} />
        <Route path="*" element={<Pages.ErrorPage status={404} />} />
      </Routes>
    </BrowserRouter>
  )
}

export function ProtectedRoute({ children, permissions }: { children: any, permissions: string[] }) {
  const hasAccess = usePermission(permissions)

  if (!hasAccess)
    return <Pages.ErrorPage status={403} />

  return children
}
