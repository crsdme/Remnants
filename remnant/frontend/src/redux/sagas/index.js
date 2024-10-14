import { takeLatest } from 'redux-saga/effects';
import { put, call } from 'redux-saga/effects';
import requests from '../../utils/requests';
import i18n from 'i18next';

// ACTIONS

import { authSuccess, authFailed, authInProgress, authLogout, authUpdateTokens } from '../actions/auth';

import { themeSuccess, themeChangeLanguage, themeChangeSidebar } from '../actions/theme';


// SAGA LIST

function* login(action) {
  yield put(authInProgress());

  const loginRequest = yield call(() => requests.userLogin(action.payload));

  const { status, data, errors, warnings, info } = loginRequest;
  
  if (status === 'failed') {
    yield put(authFailed(errors, warnings, info));
  } else if (status === 'success') {
    yield put(authSuccess(data, errors, warnings, info));
    yield put(themeSuccess(data, errors, warnings, info));
  }

  return { status: 'success' };
}

function* logout(action) {
  yield put(authLogout(action.profile));

  return { status: 'success' };
}

function* updateTokens(action) {
  yield put(authUpdateTokens(action.token));

  return { status: 'success' };
}

function* changeLanguage(action) {  
  yield put(themeChangeLanguage(action.payload, [], [], [] ));
  i18n.changeLanguage(action.payload);

  return { status: 'success' };
}

function* changeSidebar(action) {  
  yield put(themeChangeSidebar(action.payload, [], [], [] ));

  return { status: 'success' };
}

function* mySaga() {
  yield takeLatest("SAGA_AUTH_LOGIN", login);
  yield takeLatest("SAGA_AUTH_LOGOUT", logout);
  yield takeLatest("SAGA_AUTH_UPDATE_TOKENS", updateTokens);
  yield takeLatest("SAGA_THEME_LANGUAGE", changeLanguage);
  yield takeLatest("SAGA_THEME_SIDEBAR", changeSidebar);
}

export default mySaga;
