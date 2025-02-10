import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import {
  DashboardPage,
  LoginPage,
  LanguagesPage,
  UnitsPage,
  CategoriesPage
} from '../view/containers/';
import Layout from '../view/components/Layout';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from 'antd';
// import { useRefreshToken } from '@/utils/api/hooks';
import { useAuthContext } from '@/utils/contexts';

function AppMain() {
  const theme = {
    token: {
      colorPrimary: '#262626',
      colorPrimaryBg: '#a6a6a6',
      borderRadius: 4,
      wireframe: false
    }
  };

  const authContenxt = useAuthContext();

  if (!authContenxt.state.isAuthChecked) {
    return <>Loading ...</>;
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ConfigProvider theme={theme}>
          <Routes>
            <Route
              path='/'
              element={authContenxt.state.isAuthenticated ? <Layout /> : <LoginPage />}
            >
              <Route path='/' element={<DashboardPage />} />

              <Route path='/categories' element={<CategoriesPage />} />

              <Route path='/settings/languages' element={<LanguagesPage />} />
              <Route path='/settings/units' element={<UnitsPage />} />

              <Route path='*' element={<DashboardPage />} />
            </Route>
            <Route path='/login' element={<LoginPage />} />
            <Route path='*' element={<DashboardPage />} />
          </Routes>
        </ConfigProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default AppMain;
