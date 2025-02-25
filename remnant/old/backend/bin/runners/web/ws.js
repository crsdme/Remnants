// модуль запускает WS сервер
const { run } = require('../../../servers/ws');

module.exports = async (server) => {
  await run(server);
  console.log(' - - ws server listening');
};
