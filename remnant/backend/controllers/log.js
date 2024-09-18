const logModel = require('../models/log.js');

const createLog = async ({ type, route, ip, userId, params }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdLog = await logModel.create({ type, route, ip, userId, params });

    if (createdLog) {
        status = 'success';
        data = createdLog;
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

const getLogs = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = pagination;

    let logsQuery = logModel.find().populate({
        path: 'userId',
        select: '-password -login -access -stocks -sites -cashregisters'
    })
    .sort({ createdAt: -1 });

    let logsCount = await logModel.count();

    if (allPages === false || !allPages) {
        logsQuery = logsQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    const logs = await logsQuery.exec();

    if (logs) {
        status = 'success';
        data = { logs, logsCount };
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
    createLog,
    getLogs,
  };
