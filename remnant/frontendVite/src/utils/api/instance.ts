import axios from 'axios';
import { backendUrl } from '../constants';

export const api = axios.create({
  baseURL: `${backendUrl}api/`
  // headers: { Authorization: `Bearer ${access}` },
});

api.interceptors.response.use(
  (response) => ({ ...response, ...response.data }),
  async () => {
    try {
      // if (error.response.status === 404) return { data: { status: 'failed' } };
      // const res = await axios.post(process.env.REACT_APP_BACK_URL + '/auth/check/token', {
      //   token: refresh
      // });
      // access = res.data.payload;
      // console.log(res.data.payload);
      // configureStore().dispatch({ type: 'SAGA_AUTH_UPDATE_TOKENS', token: res.data.payload });
      // error.config.headers['Authorization'] = 'Bearer ' + access;
      // return axiosInstance.request(error.config);
    } catch (err) {
      console.log(err);
      // if (err.response && err.response.status === 403) {
      //   configureStore().dispatch({ type: 'SAGA_AUTH_LOGOUT' });
      // }

      // return {
      //   data: { status: 'failed', data: null, warnings: [], errors: [err.response.status] }
      // };
    }
  }
);
