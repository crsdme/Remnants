import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import './utils/i18n';
import {
  BrowserRouter
} from "react-router-dom";

import { configureStore } from './redux/configureStore';
import { PersistGate } from 'redux-persist/integration/react';

const initialState = {};
const store = configureStore(initialState);
const persistor = persistStore(store);
 
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <BrowserRouter>
      <PersistGate loading={null} persistor={persistor}>
        <Provider store={store}>
          <App />
        </Provider>
      </PersistGate>
    </BrowserRouter>
);