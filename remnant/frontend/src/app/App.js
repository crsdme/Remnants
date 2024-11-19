import React, { useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import { useSelector } from 'react-redux';
import { ConfigProvider, App } from 'antd';
import './App.css';
import request from '../utils/requests';


import Layout from '../view/containers/Layout';
import PageNotFound from '../view/containers/PageNotFound';
import LoginPage from '../view/containers/LoginPage';

import DashboardPage from '../view/containers/DashboardPage';

import ProductsPage from '../view/containers/ProductsPage';
import CategoriesPage from '../view/containers/CategoriesPage';
import AttributesPage from '../view/containers/AttributesPage';
import BarcodesPage from '../view/containers/BarcodesPage';

import LanguagesPage from '../view/containers/LanguagesPage';
import CurrenciesPage from '../view/containers/CurrenciesPage';

import ProfilePage from '../view/containers/ProfilePage';

function MyApp() {

  const { tokens, profile, status: authStatus } = useSelector((state) => state.auth);
  const params = { userId: profile._id, tokens }

  const [attributes, setAttributes] = useState([]);
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

  const getAttributes = async () => {
    const { status, data } = await request.getAttributes({}, params);
    if (status === 'success') setAttributes(data.customFields);
    console.log(data)
  }

  useEffect(() => {
    getAttributes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      }}>
        <Routes>
          { authStatus === 'auth' ?
            <Route path="/" element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/" element={<DashboardPage />} />


              <Route path="/products" element={<ProductsPage props={{attributes: attributes}} />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/attributes" element={<AttributesPage />} />
              <Route path="/barcodes" element={<BarcodesPage />} />

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