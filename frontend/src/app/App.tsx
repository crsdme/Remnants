import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import { LogoIcon } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { usePermission } from '@/utils/hooks/usePermission/usePermission'

import {
  BarcodesPage,
  CashregisterAccountsPage,
  CashregistersPage,
  CategoriesPage,
  CurrenciesPage,
  DashboardPage,
  ErrorPage,
  LanguagesPage,
  LoginPage,
  MainSettingsPage,
  MoneyTransactionsPage,
  OrderSourcesPage,
  OrderStatusesPage,
  ProductPropertiesGroupsPage,
  ProductPropertiesPage,
  ProductsPage,
  SettingsLayout,
  TestPage,
  UnitsPage,
  UserRolesPage,
  UsersPage,
  WarehousesPage,
  WarehouseTransactionsPage,
} from '../containers'

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
        <Route path="/" element={authContenxt.state.isAuthenticated ? <Layout /> : <LoginPage />}>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/test"
            element={(<ProtectedRoute children={<TestPage />} permissions={['user.page']} />)}
          />

          <Route
            path="/categories"
            element={<ProtectedRoute children={<CategoriesPage />} permissions={['category.page']} />}
          />
          <Route
            path="/products"
            element={<ProtectedRoute children={<ProductsPage />} permissions={['product.page']} />}
          />
          <Route
            path="/product-properties-groups"
            element={<ProtectedRoute children={<ProductPropertiesGroupsPage />} permissions={['product-properties-groups.page']} />}
          />
          <Route
            path="/product-properties"
            element={<ProtectedRoute children={<ProductPropertiesPage />} permissions={['product-properties.page']} />}
          />

          <Route
            path="/users"
            element={(<ProtectedRoute children={<UsersPage />} permissions={['user.page']} />)}
          />
          <Route
            path="/users/roles"
            element={<ProtectedRoute children={<UserRolesPage />} permissions={['userRole.page']} />}
          />

          <Route
            path="/cashregisters"
            element={<ProtectedRoute children={<CashregistersPage />} permissions={['cashregister.page']} />}
          />
          <Route
            path="/cashregister-accounts"
            element={<ProtectedRoute children={<CashregisterAccountsPage />} permissions={['cashregister-account.page']} />}
          />
          <Route
            path="/money-transactions"
            element={<ProtectedRoute children={<MoneyTransactionsPage />} permissions={['money-transaction.page']} />}
          />

          <Route
            path="/settings"
            element={<ProtectedRoute children={<SettingsLayout />} permissions={['settings.page']} />}
          >
            <Route
              path="/settings"
              element={<ProtectedRoute children={<MainSettingsPage />} permissions={['settings.page']} />}
            />
          </Route>

          <Route
            path="/settings/currencies"
            element={<ProtectedRoute children={<CurrenciesPage />} permissions={['currency.page']} />}
          />
          <Route
            path="/settings/languages"
            element={<ProtectedRoute children={<LanguagesPage />} permissions={['language.page']} />}
          />
          <Route
            path="/settings/units"
            element={<ProtectedRoute children={<UnitsPage />} permissions={['unit.page']} />}
          />
          <Route
            path="/order-statuses"
            element={<ProtectedRoute children={<OrderStatusesPage />} permissions={['order-status.page']} />}
          />
          <Route
            path="/order-sources"
            element={<ProtectedRoute children={<OrderSourcesPage />} permissions={['order-source.page']} />}
          />

          <Route
            path="/warehouses"
            element={<ProtectedRoute children={<WarehousesPage />} permissions={['warehouse.page']} />}
          />
          <Route
            path="/warehouse-transactions"
            element={<ProtectedRoute children={<WarehouseTransactionsPage />} permissions={['warehouse-transaction.page']} />}
          />
          <Route
            path="/barcodes"
            element={<ProtectedRoute children={<BarcodesPage />} permissions={['barcode.page']} />}
          />

          <Route path="*" element={<ErrorPage status={404} />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<ErrorPage status={404} />} />
      </Routes>
    </BrowserRouter>
  )
}

export function ProtectedRoute({ children, permissions }) {
  const hasAccess = usePermission(permissions)

  if (!hasAccess)
    return <ErrorPage status={403} />

  return children
}
