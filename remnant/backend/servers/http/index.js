const path = require('path');
const createError = require('http-errors');
const cors = require('cors');
const express = require('express');
const { staticDir } = require('../../config').server.http;

// Мидлвейры
// const helmet = require('helmet');

const indexRouter = require('../../routes/http/index');
const languagesRouter = require('../../routes/http/languages');
const authRouter = require('../../routes/http/auth');
const usersRouter = require('../../routes/http/users');
const productsRouter = require('../../routes/http/products');

const categoryRouter = require('../../routes/http/categories');
const barcodeRouter = require('../../routes/http/barcodes');
const currencyRouter = require('../../routes/http/currencies');
const deliveryServiceRouter = require('../../routes/http/delivery-services');
const stocksRouter = require('../../routes/http/stocks');
const unitsRouter = require('../../routes/http/units');
const purchasesRouter = require('../../routes/http/purchases');
const sourcesRouter = require('../../routes/http/sources');
const customFieldRouter = require('../../routes/http/custom-field');
const orderStatusRouter = require('../../routes/http/order-statuses');
const customFieldGroupRouter = require('../../routes/http/custom-field-group');
const customFieldOptionRouter = require('../../routes/http/custom-field-option');
const app = express();

// app.use(logger); // логер. Там внутри pino

app.use(cors());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });
// app.use(helmet()); // хелмет фильтрует вредные заголовки и кривые запросы. Смотри доку хелмета для подробностей.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(staticDir));

// Роуты

// это специальный мидлвейр, который выключает роуты. Используеться раннером чтобы роуты не стали доступны раньше времени.
let isRoutesEnabled = false;
app.use((req, res, next) => {
  if (isRoutesEnabled) {
    next();
    return;
  }

  next(createError(503)); // код 503 это "сервис временно недоступен", другими словами - сервер живой, но занят чем-то другим, постучите позже.
});

// Routes prefix
app.use('/', indexRouter);
app.use('/languages', languagesRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/stocks', stocksRouter);
app.use('/products', productsRouter);
app.use('/categories', categoryRouter);
app.use('/purchases', purchasesRouter);
app.use('/units', unitsRouter);
app.use('/currencies', currencyRouter);
app.use('/delivery-services', deliveryServiceRouter);
app.use('/sources', sourcesRouter);
app.use('/custom-fields', customFieldRouter);
app.use('/order-statuses', orderStatusRouter);
app.use('/custom-fields-group', customFieldGroupRouter);
app.use('/custom-fields-option', customFieldOptionRouter);
app.use('/barcodes', barcodeRouter);
// app.use('/strategy/local', localStrategyRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler. Don`t remove 'next' attribute
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.status !== 404) {
    console.log(err);
  }

  res.status(err.status || 500);
  res.end();
});

// Включатель роутов
const enableRoutes = () => {
  if (isRoutesEnabled === true) {
    console.log('Routes already enabled');
    return;
  }

  isRoutesEnabled = true;
};

module.exports = app;
module.exports.enableRoutes = enableRoutes;
