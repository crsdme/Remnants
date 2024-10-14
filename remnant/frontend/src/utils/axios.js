import axios from 'axios';
import { configureStore } from '../redux/configureStore.js';

const axiosCustomInstance = ({ refresh, access }) => {
    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_BACK_URL,
        headers: { Authorization: `Bearer ${access}` },
    });

    axiosInstance.interceptors.response.use(
        response => response,
        async (error) => {
            try {
                if (error.response.status === 404) return { data: { status: 'failed' } };
                const res = await axios.post(process.env.REACT_APP_BACK_URL + '/auth/check/token', { token: refresh });
                access = res.data.payload;
                console.log(res.data.payload)
                configureStore().dispatch({ type: 'SAGA_AUTH_UPDATE_TOKENS', token: res.data.payload });
                error.config.headers['Authorization'] = 'Bearer ' + access;
                
                return axiosInstance.request(error.config);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    configureStore().dispatch({ type: 'SAGA_AUTH_LOGOUT' });
                }

                return { data: { status: 'failed', data: null, warnings: [], errors: [err.response.status] } }
            }
        }
    );

    return axiosInstance;
};

export default axiosCustomInstance;
