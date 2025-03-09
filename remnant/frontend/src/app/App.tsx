import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router';
import {
  DashboardPage,
  LoginPage,
  LanguagesPage,
  UnitsPage,
  CategoriesPage,
  ProductsPage,
  CurrenciesPage
} from '../view/containers/';
import Layout from '../view/components/Layout';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthContext } from '@/utils/contexts';
import LogoIcon from '@/view/components/ui/icons/logoIcon';

function AppMain() {
  const authContenxt = useAuthContext();

  if (!authContenxt.state.isAuthChecked) {
    return (
      <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
        <div className='flex items-center justify-center w-full max-w-sm gap-3'>
          <div className='flex h-10 w-10 items-center justify-center'>
            <LogoIcon />
          </div>
          <p className='flex items-center gap-2 self-center font-medium text-2xl'>Remnant</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={authContenxt.state.isAuthenticated ? <Layout /> : <LoginPage />}>
            <Route path='/' element={<DashboardPage />} />

            <Route path='/products' element={<ProductsPage />} />
            <Route path='/categories' element={<CategoriesPage />} />

            <Route path='/settings/languages' element={<LanguagesPage />} />
            <Route path='/settings/currencies' element={<CurrenciesPage />} />
            <Route path='/settings/units' element={<UnitsPage />} />

            <Route path='*' element={<DashboardPage />} />
          </Route>
          <Route path='/login' element={<LoginPage />} />
          <Route path='*' element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default AppMain;
