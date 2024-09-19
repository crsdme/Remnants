import update from 'react-addons-update';
import { 
  THEME_SUCCESS,
  THEME_CHANGE_LANGUAGE,
  THEME_CHANGE_SIDEBAR
} from '../types';

export const initialState = {
  selectedLanguage: 'ru',
  languages: {
    all: null,
    main: null,
  },
  sidebarStatus: false,
  currencies: {
    all: null,
    main: null,
  },
};

/* eslint-disable default-case, no-param-reassign */
const reducer = (state = initialState, { payload, type }) => {
  switch (type) {

    case THEME_SUCCESS:
      return update(state, {
        languages: { $set: payload.data.languages },
        currencies: { 
          all: { $set: payload.data.currencies.all },
          main: { $set: payload.data.currencies.main },
        },
      });
      break;

    case THEME_CHANGE_LANGUAGE:
      return update(state, {
        selectedLanguage: { $set: payload.data },
      });
      break;

    case THEME_CHANGE_SIDEBAR:
      return update(state, {
        sidebarStatus: { $set: payload.data },
      });
      break;
  }

    return state;
  };

export default reducer;
