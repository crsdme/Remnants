const notificationModel = require('../models/notification.js');
const wsServer = require('../servers/ws');
const dayjs = require('dayjs');

const createNotification = async ({ type, title, description, number, link, user, viewed, timeLeft }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdNotification = await notificationModel.create({ type, title, description, number, link, user, viewed, timeLeft });

    wsServer.getIo().emit('/updateNotifications', { status: true }); 

    if (createdNotification) {
        status = 'success';
        data = createdNotification;
    } else {
        status = 'failed';
    } 

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const getNotifications = async ({ filter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];
    let query = {};

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 3, allPages: false });

    const { user } = filter;

    if (user) {
        query.user = user;
    }

    let notificationsQuery = notificationModel.find(query)
    .sort({ createdAt: -1 }); 

    let notificationsCount = await notificationModel.count(query);

    let notificationsNotViewed = await notificationModel.count({ ...query, viewed: false });

    if (allPages === false || !allPages) {
        notificationsQuery = notificationsQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    const notifications = await notificationsQuery.exec();

    viewNotifications(notifications)

    if (notifications) {
        status = 'success';
        data = { notifications, notificationsCount, notificationsNotViewed };
    } else {
        status = 'failed';
    }

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const viewNotifications = async (notifications) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const notificationsId = notifications.filter(item => !item.viewed).map(item => item._id);
    
    if (notificationsId.length > 0) {
        data = await notificationModel.updateMany({ _id: { $in: notificationsId } }, { viewed: true, viewedAt: dayjs() });
    }


    if (data) {
        status = 'success';
    } else {
        status = 'failed';
    }

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    }; 
}

module.exports = {
    createNotification,
    getNotifications,
    viewNotifications,
  };
