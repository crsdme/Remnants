import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LogoIcon from '@/components/ui/icons/logoIcon'

import { useAuthContext } from '@/utils/contexts'

import Layout from '../components/Layout'
import {
  CategoriesPage,
  CurrenciesPage,
  DashboardPage,
  LanguagesPage,
  LoginPage,
  TestPage,
  UnitsPage,
  UsersPage,
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
          <Route path="/test" element={<TestPage />} />

          <Route path="/categories" element={<CategoriesPage />} />

          <Route path="/users" element={<UsersPage />} />

          <Route path="/settings/currencies" element={<CurrenciesPage />} />
          <Route path="/settings/languages" element={<LanguagesPage />} />
          <Route path="/settings/units" element={<UnitsPage />} />

          <Route path="*" element={<DashboardPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
