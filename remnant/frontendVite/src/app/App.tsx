import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router';
import { DashboardPage, LoginPage, ProductsPage, LanguagesPage } from '../view/containers/';
import Layout from '../view/components/Layout';
import { HelmetProvider } from 'react-helmet-async';
import { App as AppAntd, ConfigProvider } from 'antd';

function App() {
  const theme = {
    token: {
      colorPrimary: '#262626',
      colorPrimaryBg: '#a6a6a6',
      borderRadius: 4,
      wireframe: false
    }
  };

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ConfigProvider theme={theme}>
          <AppAntd>
            <Routes>
              <Route path='/' element={<Layout />}>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/' element={<DashboardPage />} />
                <Route path='/products' element={<ProductsPage />} />

                <Route path='/settings/languages' element={<LanguagesPage />} />
                <Route path='*' element={<DashboardPage />} />
              </Route>
            </Routes>
          </AppAntd>
        </ConfigProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
