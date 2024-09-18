import axiosCustomInstance from './axios';
import { message, notification } from 'antd';
import i18next from 'i18next';

const { t } = i18next;


const userLogin = async (value) => {
    const axiosInstance = axiosCustomInstance({ refresh: null, access: null });

    const { data } = await axiosInstance.post('auth/login', { ...value });

    if (data.status === 'success') message.success(t('loginPage.wasLogined'));

    if (data.status === 'failed') notification.error({ message: t('loginPage.wasnLogined'), description: JSON.stringify(data) });

    return data;
}




const getProducts = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('products/get', { ...value, userId });
    console.log(data)
    if (data.status === 'success') message.success(t('product.founded'));

    if (data.status === 'failed') notification.error({ message: t('product.wasnFounded'), description: JSON.stringify(data) });

    return data;
}





const createCurrency = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('currencies/create', { ...value, userId });

    if (data.status === 'success') message.success(t('currency.created'));

    if (data.status === 'failed') notification.error({ message: t('currency.not.created'), description: JSON.stringify(data) });

    return data;
}

const editCurrency = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('currencies/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('currency.edited'));

    if (data.status === 'failed') notification.error({ message: t('currency.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeCurrency = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('currencies/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('currencies.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('currencies.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getCurrencies = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('currencies/get', { ...value, userId });
    
    if (data.status === 'failed') notification.error({ message: t(' '), description: JSON.stringify(data) });

    return data;
}










const createLanguage = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('languages/create', { ...value, userId });

    if (data.status === 'success') message.success(t('languageWasCreated'));

    if (data.status === 'failed') notification.error({ message: t('languageWasnCreated'), description: JSON.stringify(data) });

    return data;
}

const editLanguage = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('languages/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('languageWasEdited'));

    if (data.status === 'failed') notification.error({ message: t('languageWasnEdited'), description: JSON.stringify(data) });

    return data;
}

const removeLanguage = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('languages/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('languageWasRemoved'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('languageWasnRemoved'), description: JSON.stringify(data) });

    return data;
}

const getLanguages = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('languages/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('languageWasnGeted'), description: JSON.stringify(data) });

    return data;
}



const getUser = async (value, { userId, tokens }) => {  
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('users/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('usersWasnGeted'), description: JSON.stringify(data) });

    return data;
}

const authUser = async (value) => {
    const axiosInstance = axiosCustomInstance({ refresh: null, access: null });

    const { data } = await axiosInstance.post('auth/login', value);

    if (data.status === 'failed') notification.error({ message: t('cantLogin'), description: JSON.stringify(data) });

    return data;
}

const getLogs = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('logs/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('logsWasnGeted'), description: JSON.stringify(data) });

    return data;
}

const getNotifications = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('notifications/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('notificationsWasnGeted'), description: JSON.stringify(data) });

    return data;
}



const createCategory = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('categories/create', { ...value, userId });

    if (data.status === 'success') message.success(t('category.created'));

    if (data.status === 'failed') notification.error({ message: t('category.not.created'), description: JSON.stringify(data) });

    return data;
}

const editCategory = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('categories/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('category.edited'));

    if (data.status === 'failed') notification.error({ message: t('category.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeCategory = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('categories/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('category.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('category.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getCategories = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('categories/get', { ...value, userId });

    console.log(data)

    if (data.status === 'failed') notification.error({ message: t(' '), description: JSON.stringify(data) });

    return data;
}


export default {
    createLanguage,
    getLanguages,
    removeLanguage,
    editLanguage,
    getUser,
    authUser,
    getLogs,
    getNotifications,
    createCategory,
    editCategory,
    removeCategory,
    getCategories,
    userLogin,
    getProducts,
    createCurrency,
    editCurrency,
    removeCurrency,
    getCurrencies
};