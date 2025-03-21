import { BrowserRouter, Route, Routes } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

import { CurrenciesPage, DashboardPage, LoginPage } from '../view/containers/';
import Layout from '../view/components/Layout';

import LogoIcon from '@/view/components/ui/icons/logoIcon';
import { useAuthContext } from '@/utils/contexts';
import '@/app/App.css';

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

            <Route path='/settings/currencies' element={<CurrenciesPage />} />

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
