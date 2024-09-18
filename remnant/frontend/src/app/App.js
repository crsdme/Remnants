import { Routes, Route } from "react-router-dom";
import { useSelector } from 'react-redux';
import { ConfigProvider, App } from 'antd';
import './App.css';

import Layout from '../view/containers/Layout';
import PageNotFound from '../view/containers/PageNotFound';
import LoginPage from '../view/containers/LoginPage';
import DashboardPage from '../view/containers/DashboardPage';
import ProductsPage from '../view/containers/ProductsPage';
import LanguagesPage from '../view/containers/LanguagesPage';
import CurrenciesPage from '../view/containers/CurrenciesPage';
// import UsersPage from '../view/containers/UsersPage';
import ProfilePage from '../view/containers/ProfilePage';
// import LogsPage from '../view/containers/LogsPage';
// import CategoriesPage from '../view/containers/CategoriesPage';

function MyApp() {

  let authStatus = useSelector((state) => state.auth.status);

  // let interfaceTheme = useSelector((state) => state.theme.theme);

  // function hasRole(allowedRoles) {
  //   let sameValueFlag = false;
  //   for (const value of userRole) {
  //     if (allowedRoles.includes(value)) {
  //       sameValueFlag = true;
  //     }
  //   }
  //   return sameValueFlag;
  // }
  
  // const CustomRoute = ({ path, allowedRoles, element }) => {
  //   const hasAccess = hasRole(allowedRoles);
  
  //   return hasAccess ? (
  //     element
  //   ) : (
  //     console.log('502')
  //   );
  // };

  return (
    <App>
      <ConfigProvider theme={{
        zIndex: {
          appBar: 1251,
          modal: 1250,
        },
        token: {
          "colorPrimary": "#2f54eb",
          "fontSize": 12,
          "borderRadius": 5,
          "wireframe": true,
          "fontFamily": 'Poppins',
          "colorLinkHover": 'black'
        },
        // algorithm: interfaceTheme === 'dark' ? theme.darkAlgorithm : null,
      }}>
        <Routes>
          { authStatus === 'auth' ?
            <Route path="/" element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              {/*
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/categories" element={<CategoriesPage />} /> */}

              <Route path="/settings/currencies" element={<CurrenciesPage />} />
              <Route path="/settings/languages" element={<LanguagesPage />} />
              <Route path="/profile/:_id" element={<ProfilePage />} />
              <Route path="*" element={<PageNotFound loginStatus="guest" />} />
            </Route>
          :
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<LoginPage />} />
              <Route path="*" element={<PageNotFound loginStatus="guest" />} />
            </>
          }

        </Routes>
      </ConfigProvider>
    </App>
  );
}

export default MyApp;