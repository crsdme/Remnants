import update from 'react-addons-update';
import { 
  AUTH_FAILED, 
  AUTH_IN_PROGRESS, 
  AUTH_SUCCESS,
  AUTH_LOGOUT,
  AUTH_UPDATE_TOKENS
} from '../types';

export const initialState = {
  profile: { 
    _id: null,
    name: null,
    login: null,
  },
  access: {
    cashregisters: null,
    stocks: null,
    sites: null
  },
  tokens: { 
    access: null, 
    refresh: null 
  },
  status: 'guest', // guest, in_progress, auth
  errors: null, 
  warnigns: null, 
  info: null,
};

/* eslint-disable default-case, no-param-reassign */
const reducer = (state = initialState, { payload, type }) => {
  switch (type) {

    case AUTH_FAILED:
      return update(state, {
        status:  { $set: 'guest' },
        errors: { $set: payload.errors },
        warnings: { $set: payload.warnings },
        info: { $set: payload.info },
      });

    case AUTH_IN_PROGRESS:
      return update(state, {
        status:  { $set: 'inProgress' },
      });       
      break;

    case AUTH_SUCCESS:
      return update(state, {
        profile: {
          _id: { $set: payload.data._id },
          name: { $set: payload.data.name },
          login: { $set: payload.data.login },
        },
        access: {
          cashregisters: { $set: payload.data.cashregisters },
          stocks: { $set: payload.data.stocks },
          sites: { $set: payload.data.sites },
        },
        tokens: {
          access: { $set: payload.data.tokens.access },
          refresh: { $set: payload.data.tokens.refresh }
        },
        status: { $set: 'auth' },
        errors: { $set: null },
        warnings: { $set: null },
        info: { $set: null },
      });
      break;

      case AUTH_UPDATE_TOKENS:
        return update(state, {
          tokens: {
            access: { $set: payload.data.tokens.access }
          },
        });

      case AUTH_LOGOUT:
        return update(state, {
          profile: {
            _id: { $set: null },
            name: { $set: null },
            login: { $set: null },
          },
          access: {
            cashregisters: { $set: null },
            stocks: { $set: null },
            sites: { $set: null },
          },
          tokens: {
            access: { $set: null },
            refresh: { $set: null }
          },
          status: { $set: 'guest' },
          errors: { $set: null },
          warnings: { $set: null },
          info: { $set: null },
        });
        break;
  }

    return state;
  };

export default reducer;
