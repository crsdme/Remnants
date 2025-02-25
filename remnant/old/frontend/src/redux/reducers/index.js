/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux';

import authReducer from '../reducers/auth';

import themeReducer from '../reducers/theme';

export default function createReducer(injectedReducers = {}) {
  const rootReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
    ...injectedReducers,
  });

  return rootReducer;
}
