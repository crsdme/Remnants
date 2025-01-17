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
import CustomFiledGroupPage from '../view/containers/CustomFiledGroupPage';
import BarcodesPage from '../view/containers/BarcodesPage';

import LanguagesPage from '../view/containers/LanguagesPage';
import CurrenciesPage from '../view/containers/CurrenciesPage';
import StocksPage from '../view/containers/StocksPage';
import UnitsPage from '../view/containers/UnitsPage';
import SourcesPage from '../view/containers/SourcesPage';
import OrderStatusPage from '../view/containers/OrderStatusPage';
import DeliveryServicesPage from '../view/containers/DeliveryServicesPage';

import OrdersPage from '../view/containers/OrdersPage';
import OrderPage from '../view/containers/OrderPage';

import ProcurementsPage from '../view/containers/ProcurementsPage';
import PurchasesPage from '../view/containers/PurchasesPage';

import ProfilePage from '../view/containers/ProfilePage';

function MyApp() {

  const { tokens, profile, status: authStatus } = useSelector((state) => state.auth);
  const params = { userId: profile._id, tokens }

  const [attributes, setAttributes] = useState([]);
  const [customFieldGroups, setCustomFieldGroups] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [units, setUnits] = useState([]);
  const [sources, setSources] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [deliveryServices, setDeliveryServices] = useState([]);
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
  }

  const getStocks = async () => {
    const { status, data } = await request.getStocks({}, params);
    if (status === 'success') setStocks(data.stocks);
  }

  const getCustomFieldGroups = async () => {
    const { status, data } = await request.getCustomFieldGroups({}, params);
    if (status === 'success') setCustomFieldGroups(data.customFieldsGroups);
  }

  const getUnits = async () => {
    const { status, data } = await request.getUnits({}, params);
    if (status === 'success') setUnits(data.units);
  }

  const getOrdersStatuses = async () => {
    const { status, data } = await request.getOrderStatuses({}, params);
    if (status === 'success') setOrderStatuses(data.orderStatuses);
  }

  const getSources = async () => {
    const { status, data } = await request.getSources({}, params);
    if (status === 'success') setSources(data.sources);
  }

  const getDeliveryServices = async () => {
    const { status, data } = await request.getDeliveryServices({}, params);
    if (status === 'success') setDeliveryServices(data.deliveryServices);
  }

  useEffect(() => {
    getAttributes();
    getCustomFieldGroups();
    getStocks();
    getUnits();
    getOrdersStatuses();
    getSources();
    getDeliveryServices();
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


              <Route path="/products" element={<ProductsPage props={{ attributes: attributes, customFieldGroups: customFieldGroups, stocks: stocks, units: units }} />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/attributes" element={<AttributesPage />} />
              <Route path="/custom-field/groups" element={<CustomFiledGroupPage props={{ customFields: attributes }} />} />
              <Route path="/barcodes" element={<BarcodesPage />} />

              <Route path="/orders" element={<OrdersPage props={{ orderStatuses: orderStatuses }} />} />
              <Route path="/order/:id" element={<OrderPage props={{ orderStatuses: orderStatuses }} />} /> {/* TYPES: EDIT, ACCEPT, VIEW */}
              <Route path="/order" element={<OrderPage props={{ sources: sources, stocks: stocks, units: units, orderStatuses: orderStatuses, deliveryServices: deliveryServices }} />} />

              <Route path="/procurements" element={<ProcurementsPage />} />
              <Route path="/purchases" element={<PurchasesPage props={{ stocks: stocks }} />} />

              <Route path="/settings/currencies" element={<CurrenciesPage />} />
              <Route path="/settings/languages" element={<LanguagesPage />} />
              <Route path="/settings/stocks" element={<StocksPage />} />
              <Route path="/settings/sources" element={<SourcesPage />} />
              <Route path="/settings/units" element={<UnitsPage />} />
              <Route path="/settings/delivery/services" element={<DeliveryServicesPage />} />
              <Route path="/settings/orders/statuses" element={<OrderStatusPage />} />
              
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