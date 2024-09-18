import {
    THEME_SUCCESS,
    THEME_CHANGE_LANGUAGE,
    THEME_CHANGE_SIDEBAR
} from '../types';

const themeSuccess = (data, errors, warnigns, info) => {
  const action = {
    type: THEME_SUCCESS,
    payload: { data, errors, warnigns, info }
  };

  return action;
}

const themeChangeLanguage = (data, errors, warnigns, info) => {
  const action = {
    type: THEME_CHANGE_LANGUAGE,
    payload: { data, errors, warnigns, info }
  };

  return action;
}

const themeChangeSidebar = (data, errors, warnigns, info) => {
  const action = {
    type: THEME_CHANGE_SIDEBAR,
    payload: { data, errors, warnigns, info }
  };

  return action;
}



export { themeSuccess, themeChangeLanguage, themeChangeSidebar };