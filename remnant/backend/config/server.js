// Найтройки веб сервера

const path = require('path');

// Normalize a port into a number, string, or false.
const normalizePort = (val) => {
  if (typeof val === 'undefined') {
    return false;
  }

  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    throw new Error(`Port ${val} incorect`);
  }

  if (port >= 0) {
    // port number
    return port;
  }

  throw new Error(`Port ${val} incorect`);
};

// если порт передали в process.env.PORT - нормализируй и используй, иначе порт по умолчанию
const httpPort = normalizePort(process.env.PORT) || 3001;

module.exports = {
  http: {
    staticDir: path.join(__dirname, '../public'),
    port: httpPort,
  },
  ws: {
    origins: [
      `http://localhost:${httpPort}`,
      `*`,
    ],
  },
};
