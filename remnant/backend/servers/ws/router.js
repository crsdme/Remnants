const querystring = require('querystring');
const { pathToRegexp } = require('path-to-regexp');


const routers = [];

// eslint-disable-next-line func-names
const Router = function () {
  this.routes = [];
  this.register = (url, ...mwList) => {
    this.routes.push({ url, mwList });
  };
};

const registerRouter = (prefix, router) => {
  routers.push({ prefix, router });
};

const findRouteInRouter = (router, path) => {

  const { prefix } = router;
  const { routes } = router.router; // Вложенный роутер это непосредственно екземпляр роутера

  // поиск нужного пути в роутере. Некрасиво, но работает.
  const result = routes.reduce((acc, val) => {
    if (acc) {
      return acc;
    }

    const keys = [];
    const fullPath = `${prefix}${val.url}`;
    const regexp = pathToRegexp(fullPath, keys);
    const data = regexp.exec(path);

    // если не найдено соответствия
    if (!data) {
      return acc;
    }

    // если найдено - приводим к удобному виду
    const params = {};
    keys.map((item, idx) => {
      const { name } = item;
      const val = data[idx + 1];
      params[name] = val;
    });

    return { mwList: val.mwList, params };
  }, null);

  return result;
}

const findRouterByPrefix = (path) => {
  const result = routers.find((val) => {
    const { prefix } = val;
    const rexp = new RegExp(`^${prefix}`);
    const check = rexp.test(path);
    return check;
  });

  return result;
}

const mwChainRun = (req, cb, mwList) => {
  // если колбека для ответа нет, чтобы небыло ошибки, пустую функцию кладу
  let reqCb = null;
  if (!cb) {
    reqCb = () => {};
  } else {
    reqCb = cb;
  }


  let curMwIdx = null;
  const next = () => {

    if (curMwIdx === null) {
      curMwIdx = 0;
    } else {
      curMwIdx += 1;
    }

    if (curMwIdx >= mwList.length) {
      return;
    }

    mwList[curMwIdx](req, reqCb, next);
  }

  next();
}

const applyRouter = (socket) => {
  socket.onAny((eventName, payload, cb) => {
    // разделяем путь и аналог гет параметров
    const [path, queryraw] = eventName.split('&');
    // ищем подходящий по префиксу модуль роутов
    const router = findRouterByPrefix(path);

    // если ненайден нужный роутер
    if (!router) {
      return;
    }

    const route = findRouteInRouter(router, path);


    // если ненайден нужный роут
    if (!route) {
      return;
    }

    // обрабатываем аналог гет параметров
    const query = querystring.parse(queryraw);

    // шаблон реквеста
    const req = {
      socket,
      query: query || {},
      params: route.params || {},
      body: payload || {}, // пейлоад аналог бади
      handshake: socket.handshake,
    };

    // обрабатываем мидлвейры
    const { mwList } = route;
    mwChainRun(req, cb, mwList);
  });
};


// console.log('===============');
// console.log('handshake', socket.handshake);
// console.log('id', socket.id);
// console.log('rooms', socket.rooms);
// console.log(socket);
// console.log('===============');
// socket.onAny((eventName, ...args) => {
//   console.log(eventName, args);
// })


module.exports = {
  Router,
  registerRouter,
  applyRouter,
};
