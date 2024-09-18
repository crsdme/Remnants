const languageModel = require('../models/language.js');
const { generateAccessToken, generateRefreshToken } = require('./auth.js');
const { createNotification } = require('./notification.js');
const wsServer = require('../servers/ws');

const createLanguage = async ({ name, code, main, active, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (!main) {
        main = false
    }

    if (!active) {
        active = false
    }

    const createdLanguage = await languageModel.create({ name, code, main, active });

    if (createdLanguage) {
        status = 'success';
        data = createdLanguage;

        await createNotification({
            type: 'alert',
            title: 'notification.title.newLanguage',
            description: 'notification.description.newLanguage',
            number: 1,
            link: '/settings/languages/',
            user: userId,
        })

        wsServer.getIo().emit('/updateLanguages', { status: true }); 
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

const editLanguage = async ({ _id, name, code, main, active }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (!main) {
        main = false
    }

    if (!active) {
        active = false
    }

    const editedLanguage = await languageModel.updateOne({ _id }, { name, code, main, active });

    if (editedLanguage) {
        status = 'success';
        data = editedLanguage;

        wsServer.getIo().emit('/updateLanguages', { status: true }); 
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

const getLanguages = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    let languagesQuery = languageModel.find(filter);

    let languagesCount = await languageModel.count();

    if (allPages === false || !allPages) {
        languagesQuery = languagesQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    const languages = await languagesQuery.exec();

    if (languages) {
        status = 'success';
        data = { languages, languagesCount };
    } else {
        status = 'failed';
    }

    // function delay(milliseconds) {
    //     return new Promise(resolve => setTimeout(resolve, milliseconds));
    // }

    // await delay(1000);

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const removeLanguage = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    console.log(_id)
    const removedLanguage = await languageModel.deleteOne({ _id });

    if (removedLanguage) {
        status = 'success';
        data = removedLanguage;

        wsServer.getIo().emit('/updateLanguages', { status: true }); 
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
    createLanguage,
    getLanguages,
    removeLanguage,
    editLanguage,
  };
