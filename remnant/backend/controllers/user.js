const userModel = require('../models/user.js');
const { generateAccessToken, generateRefreshToken } = require('./auth.js');
const { getLanguages } = require('./language.js');
const { getCurrencies } = require('./currency.js')

const createUser = async ({ name, login, password, sites, stocks, cashregisters, role, access }) => {

    // sites = sites.map(item => ({ _id: item })); 

    // stocks = stocks.map(item => ({ _id: item }));

    // cashregisters = cashregisters.map(item => ({ _id: item }));

    // access = access.map(item => item.value) 

    // const userName = await userModel.findOne({ name });

    // const userLogin = await userModel.findOne({ login });

    // if (userName) return 'failed name';

    // if (userLogin) return 'failed login';

    // const createdUser = userModel.create({ 
    //     name, 
    //     login, 
    //     password, 
    //     sites, 
    //     cashregisters, 
    //     role,
    //     stocks,
    //     access
    // });
    // if (createdUser) {
    //     return 'ok';
    // } else {
    //     return 'failed';
    // }
}

const getUsers = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];
    let query = {};

    if (_id) {
        query._id = _id;
    }

    const users = await userModel.find(query);

    if (users) {
        status = 'success';
        data = users;
    }


    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const loginUser = async ({ login, password }) => { 
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const user = await userModel.findOne({ login });

    if (!user) {
        status = 'failed';
        info = ['userNotExist'];
    } else if (user?.password !== password) {
        status = 'failed';
        info = ['wrongPassword'];
    } else {
        const { _id, name, role,access, stocks, sites, cashregisters } = user;

        const accessToken = generateAccessToken(login);

        const refreshToken = generateRefreshToken(login);

        const languagesData = await getLanguages({ filter: { active: true } });

        const currenciesData = await getCurrencies({ filter: { active: true } });

        status = 'success';
        data = {
            _id,
            login,
            name, 
            role,
            access, 
            stocks, 
            sites, 
            cashregisters,
            tokens: { access: accessToken, refresh: refreshToken },
            languages: {
                all: languagesData.data.languages,
                main: languagesData.data.languages.find(item => item.main === true),
            },
            currencies: {
                all: currenciesData.data.currencies,
                main: currenciesData.data.currencies.find(item => item.main === true),
            }
        };
    }

    function delay(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    await delay(1000);

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const removeUser = async ({ name }) => {
    // const user = await userModel.deleteOne({ name })
    // console.log(user)
    // if (user) {
    //     return 'ok';
    // } else {
    //     return 'failed';
    // }
}

const editUser = async (payload) => {

    // payload.new.sites = payload.new.sites.map(item => ({ _id: item }));
    // payload.new.stocks = payload.new.stocks.map(item => ({ _id: item }));
    // payload.new.cashregisters = payload.new.cashregisters.map(item => ({ _id: item }));

    // payload.old.sites = payload.old.sites.map(item => ({ _id: item }));
    // payload.old.stocks = payload.old.stocks.map(item => ({ _id: item }));
    // payload.old.cashregisters = payload.old.cashregisters.map(item => ({ _id: item }));
    // console.log(payload.new.access[0], 123)
    // if (payload.new.access[0].value === undefined) {
    //     payload.new.access = payload.new.access.map(item => item) 
    // } else {
    //     payload.new.access = payload.new.access.map(item => item.value) 
    // }

    // console.log(payload)

    // const editedUser = await userModel.findOneAndUpdate({ _id: payload.old._id }, payload.new);

    // console.log(editedUser)
    // return { status: 'ok', payload: editedUser }
}

module.exports = {
    getUsers,
    loginUser,
    createUser,
    removeUser,
    editUser,
    loginUser,
  };
