import axios from 'axios';
import { configureStore } from '../redux/configureStore.js';

const axiosCustomInstance = ({ refresh, access }) => {
    let logoutFlag = false;
    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_BACK_URL,
        headers: { Authorization: `Bearer ${access}` },
    });

    axiosInstance.interceptors.response.use(
        response => response,
        async (error) => {
            try {
                if (error.response && error.response.status === 404) return { data: { status: 'failed' } };
                const res = await axios.post(process.env.REACT_APP_BACK_URL + 'auth/check/token', { token: refresh });
                access = res.data.payload;
                configureStore().dispatch({ type: 'SAGA_AUTH_UPDATE_TOKEN', token: res.data.payload });
                logoutFlag = false;
                error.config.headers['Authorization'] = 'Bearer ' + access;
                
                return axiosInstance.request(error.config);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    logoutFlag = true;
                    configureStore().dispatch({ type: 'SAGA_AUTH_LOGOUT' });
                }

                return { data: { status: 'failed', data: null, warnings: [], errors: [err.response.status] } }
            }
        }
    );

    return axiosInstance;
};


// 1: Backend is down

export default axiosCustomInstance;
