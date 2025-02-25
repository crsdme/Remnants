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



const createProduct = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const formData = new FormData();

    for (const name in value) {
        if (!value[name]) continue;
        formData.append(name, name === 'names' || name === 'attributes' ? JSON.stringify(value[name]) : value[name]);
    }

    value.uploadList.forEach(item => {
        formData.append("files", item);
    });

    formData.append("userId", userId);

    const { data } = await axiosInstance.post('products/create', formData);

    if (data.status === 'success') message.success(t('product.created'));

    if (data.status === 'failed') notification.error({ message: t('product.not.created'), description: JSON.stringify(data) });

    return data;
}

const editProduct = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const formData = new FormData();

    value.uploadList.forEach(item => {
        formData.append("files", item);
    });

    value.uploadList = value.uploadList.map(item => ({ ...item, thumbUrl: null }));

    value.fileList = value.fileList.map(item => ({ ...item, thumbUrl: null }));

    for (const name in value) {
        if (!value[name]) continue;
        formData.append(name, name === 'names' || name === 'attributes' || name === 'customFields' || name === 'fileList' ? JSON.stringify(value[name]) : value[name]);
    }

    formData.append("userId", userId);

    const { data } = await axiosInstance.post('products/edit', formData);

    if (data.status === 'success') message.success(t('product.edited'));

    if (data.status === 'failed') notification.error({ message: t('product.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeProduct = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('products/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('product.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('product.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getProducts = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('products/get', { ...value, userId });

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

    if (data.status === 'failed') notification.error({ message: t('categories.wasnFounded'), description: JSON.stringify(data) });

    return data;
}




const createAttribute = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields/create', { ...value, userId });

    if (data.status === 'success') message.success(t('custom-field.created'));

    if (data.status === 'failed') notification.error({ message: t('custom-field.not.created'), description: JSON.stringify(data) });

    return data;
}

const editAttribute = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('custom-field.edited'));

    if (data.status === 'failed') notification.error({ message: t('custom-field.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeAttribute = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('custom-field.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('custom-field.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getAttributes = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('custom-fields.wasnFounded'), description: JSON.stringify(data) });

    return data;
}



const createAttributeOption = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields-option/create', { ...value, userId });

    if (data.status === 'success') message.success(t('custom-field-option.created'));

    if (data.status === 'failed') notification.error({ message: t('custom-field-option.not.created'), description: JSON.stringify(data) });

    return data;
}

const removeAttributeOption = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields-option/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('custom-field-option.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('custom-field-option.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getAttributeOptions = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields-option/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('custom-fields-option.wasnFounded'), description: JSON.stringify(data) });

    return data;
}









const createCustomFieldGroup = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields-group/create', { ...value, userId });

    if (data.status === 'success') message.success(t('custom-field-group.created'));

    if (data.status === 'failed') notification.error({ message: t('custom-field-group.not.created'), description: JSON.stringify(data) });

    return data;
}

const editCustomFieldGroup = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields-group/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('custom-field-group.edited'));

    if (data.status === 'failed') notification.error({ message: t('custom-field-group.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeCustomFieldGroup = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields-group/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('custom-field-group.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('custom-field-group.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getCustomFieldGroups = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('custom-fields-group/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('custom-fields-group.wasnFounded'), description: JSON.stringify(data) });

    return data;
}










const createStock = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('stocks/create', { ...value, userId });

    if (data.status === 'success') message.success(t('stocks.created'));

    if (data.status === 'failed') notification.error({ message: t('stocks.not.created'), description: JSON.stringify(data) });

    return data;
}

const editStock = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('stocks/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('stocks.edited'));

    if (data.status === 'failed') notification.error({ message: t('stocks.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeStock = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('stocks/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('stocks.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('stocks.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getStocks = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('stocks/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('stocks.wasnFounded'), description: JSON.stringify(data) });

    return data;
}








const createUnit = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('units/create', { ...value, userId });

    if (data.status === 'success') message.success(t('units.created'));

    if (data.status === 'failed') notification.error({ message: t('units.not.created'), description: JSON.stringify(data) });

    return data;
}

const editUnit = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('units/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('units.edited'));

    if (data.status === 'failed') notification.error({ message: t('units.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeUnit = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('units/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('units.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('units.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getUnits = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('units/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('units.wasnFounded'), description: JSON.stringify(data) });

    return data;
}






const createPurchase = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('purchases/create', { ...value, userId });

    if (data.status === 'success') message.success(t('purchases.created'));

    if (data.status === 'failed') notification.error({ message: t('purchases.not.created'), description: JSON.stringify(data) });

    return data;
}

const editPurchase = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('purchases/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('purchases.edited'));

    if (data.status === 'failed') notification.error({ message: t('purchases.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removePurchase = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('purchases/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('purchases.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('purchases.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getPurchases = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('purchases/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('purchases.wasnFounded'), description: JSON.stringify(data) });

    return data;
}

const getPurchaseProducts = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('purchases/get/products', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('purchases.products.wasnFounded'), description: JSON.stringify(data) });

    return data;
}





const createOrderStatus = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-statuses/create', { ...value, userId });

    if (data.status === 'success') message.success(t('order.status.created'));

    if (data.status === 'failed') notification.error({ message: t('order.status.not.created'), description: JSON.stringify(data) });

    return data;
}

const editOrderStatus = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-statuses/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('order.status.edited'));

    if (data.status === 'failed') notification.error({ message: t('order.status.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeOrderStatus = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-statuses/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('order.status.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('order.status.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getOrderStatuses = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-statuses/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('order.status.wasnFounded'), description: JSON.stringify(data) });

    return data;
}






const createOrder = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('orders/create', { ...value, userId });

    if (data.status === 'success') message.success(t('orders.created'));

    if (data.status === 'failed') notification.error({ message: t('orders.not.created'), description: JSON.stringify(data) });

    return data;
}

const editOrder = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('orders/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('orders.edited'));

    if (data.status === 'failed') notification.error({ message: t('orders.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeOrder = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('orders/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('orders.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('orders.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getOrders = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('orders/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('orders.wasnFounded'), description: JSON.stringify(data) });

    return data;
}








const createSource = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('sources/create', { ...value, userId });

    if (data.status === 'success') message.success(t('sources.created'));

    if (data.status === 'failed') notification.error({ message: t('sources.not.created'), description: JSON.stringify(data) });

    return data;
}

const editSource = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('sources/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('sources.edited'));

    if (data.status === 'failed') notification.error({ message: t('sources.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeSource = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('sources/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('sources.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('sources.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getSources = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('sources/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('sources.wasnFounded'), description: JSON.stringify(data) });

    return data;
}





const createDeliveryService = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('delivery-services/create', { ...value, userId });

    if (data.status === 'success') message.success(t('delivery-services.created'));

    if (data.status === 'failed') notification.error({ message: t('delivery-services.not.created'), description: JSON.stringify(data) });

    return data;
}

const editDeliveryService = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('delivery-services/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('delivery-services.edited'));

    if (data.status === 'failed') notification.error({ message: t('delivery-services.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeDeliveryService = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('delivery-services/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('delivery-services.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('delivery-services.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getDeliveryServices = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('delivery-services/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('delivery-services.wasnFounded'), description: JSON.stringify(data) });

    return data;
}




const createClient = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('clients/create', { ...value, userId });

    if (data.status === 'success') message.success(t('clients.created'));

    if (data.status === 'failed') notification.error({ message: t('clients.not.created'), description: JSON.stringify(data) });

    return data;
}

const editClient = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('clients/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('clients.edited'));

    if (data.status === 'failed') notification.error({ message: t('clients.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeClient = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('clients/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('clients.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('clients.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getClients = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('clients/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('clients.wasnFounded'), description: JSON.stringify(data) });

    return data;
}



const createCashRegisterAccount = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregister-accounts/create', { ...value, userId });

    if (data.status === 'success') message.success(t('cashregisters.accountscreated'));

    if (data.status === 'failed') notification.error({ message: t('cashregisters.accountsnot.created'), description: JSON.stringify(data) });

    return data;
}

const editCashRegisterAccount = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregister-accounts/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('cashregisters.accountsedited'));

    if (data.status === 'failed') notification.error({ message: t('cashregisters.accountsnot.edited'), description: JSON.stringify(data) });

    return data;
}

const removeCashRegisterAccount = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregister-accounts/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('cashregisters.accountsremoved'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('cashregisters.accountsnot.removed'), description: JSON.stringify(data) });

    return data;
}

const getCashRegisterAccounts = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregister-accounts/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('cashregisters.accountswasnFounded'), description: JSON.stringify(data) });

    return data;
}




const createCashRegister = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregisters/create', { ...value, userId });

    if (data.status === 'success') message.success(t('cashregisters.created'));

    if (data.status === 'failed') notification.error({ message: t('cashregisters.not.created'), description: JSON.stringify(data) });

    return data;
}

const editCashRegister = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregisters/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('cashregisters.edited'));

    if (data.status === 'failed') notification.error({ message: t('cashregisters.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeCashRegister = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregisters/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('cashregisters.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('cashregisters.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getCashRegisters = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('cashregisters/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('cashregisters.wasnFounded'), description: JSON.stringify(data) });

    return data;
}



const createOrderPayment = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-payments/create', { ...value, userId });

    if (data.status === 'success') message.success(t('order-payment.created'));

    if (data.status === 'failed') notification.error({ message: t('order-payment.not.created'), description: JSON.stringify(data) });

    return data;
}

const editOrderPayment = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-payments/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('order-payment.edited'));

    if (data.status === 'failed') notification.error({ message: t('order-payment.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeOrderPayment = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-payments/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('order-payment.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('order-payment.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getOrderPayments = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('order-payments/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('order-payment.wasnFounded'), description: JSON.stringify(data) });

    return data;
}



const getMoneyTransactions = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('money-transactions/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('money-transactions.wasnFounded'), description: JSON.stringify(data) });

    return data;
}



const getProductTransactions = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('product-transactions/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('product-transactions.wasnFounded'), description: JSON.stringify(data) });

    return data;
}






const createBarcode = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('barcodes/create', { ...value, userId });

    if (data.status === 'success') message.success(t('barcode.created'));

    if (data.status === 'failed') notification.error({ message: t('barcode.not.created'), description: JSON.stringify(data) });

    return data;
}

const editBarcode = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('barcodes/edit', { ...value, userId });

    if (data.status === 'success') message.success(t('barcode.edited'));

    if (data.status === 'failed') notification.error({ message: t('barcode.not.edited'), description: JSON.stringify(data) });

    return data;
}

const removeBarcode = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('barcodes/remove', { ...value, userId });

    if (data.status === 'success' && data.data.deletedCount !== 0) message.success(t('barcode.removed'));

    if (data.status === 'failed' || data.data.deletedCount === 0) notification.error({ message: t('barcode.not.removed'), description: JSON.stringify(data) });

    return data;
}

const getBarcodes = async (value, { userId, tokens }) => {
    const axiosInstance = axiosCustomInstance(tokens);

    const { data } = await axiosInstance.post('barcodes/get', { ...value, userId });

    if (data.status === 'failed') notification.error({ message: t('barcodes.wasnFounded'), description: JSON.stringify(data) });

    return data;
}


// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getProductTransactions,
    getMoneyTransactions,
    getOrderPayments,
    editOrderPayment,
    removeOrderPayment,
    createOrderPayment,
    createCashRegisterAccount,
    removeCashRegisterAccount,
    editCashRegisterAccount,
    getCashRegisterAccounts,
    createCashRegister,
    removeCashRegister,
    editCashRegister,
    getCashRegisters,
    createClient,
    editClient,
    removeClient,
    getClients,
    getDeliveryServices, 
    removeDeliveryService,
    createDeliveryService,
    editDeliveryService,
    getSources,
    editSource,
    removeSource,
    createSource,
    getOrders,
    removeOrder,
    editOrder,
    createOrder,
    getOrderStatuses,
    removeOrderStatus,
    createOrderStatus,
    editOrderStatus,
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
    createProduct,
    removeProduct,
    editProduct,
    createCurrency,
    editCurrency,
    removeCurrency,
    getCurrencies,
    getAttributes,
    editAttribute,
    removeAttribute,
    createAttribute,
    createAttributeOption,
    removeAttributeOption,
    getAttributeOptions,
    createCustomFieldGroup,
    createPurchase,
    editPurchase,
    removePurchase,
    getPurchaseProducts,
    getPurchases,
    editCustomFieldGroup,
    removeCustomFieldGroup,
    getCustomFieldGroups,
    getBarcodes,
    createBarcode,
    removeBarcode,
    editBarcode,
    getStocks,
    removeStock,
    createStock,
    editStock,
    getUnits,
    removeUnit,
    editUnit,
    createUnit
};