const mongoose = require('mongoose');

// тянем настройки с конфига
const { uri, options } = require('../../config').db;

mongoose.set("strictQuery", false);

// если произойдет ошибка коннекта, она вызовет исключение и сработает reject
mongoose.connect(uri, options);

const db = mongoose.connection;

module.exports = db; 
