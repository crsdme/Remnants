import {
    AUTH_IN_PROGRESS,
    AUTH_SUCCESS,
    AUTH_FAILED,
    AUTH_LOGOUT
} from '../types';

  
const authInProgress = () => {
  const action = {
    type: AUTH_IN_PROGRESS,
  };

  return action;
}

const authSuccess = (data, errors, warnigns, info) => {
  const action = {
    type: AUTH_SUCCESS,
    payload: { data, errors, warnigns, info }
  };

  return action;
}

const authFailed = (errors, warnings, info) => {
  const action = {
    type: AUTH_FAILED,
    payload: { errors, warnings, info }
  };

  return action;
}

const authLogout = (data, errors, warnings, info) => {
  const action = {
    type: AUTH_LOGOUT,
    payload: { data, errors, warnings, info }
  };

  return action;
}

export { authSuccess, authFailed, authInProgress, authLogout };