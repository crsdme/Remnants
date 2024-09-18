// ранер отвечающий за коннект к бд

// сам раннер
const init = () => new Promise((resolve) => {
  // eslint-disable-next-line global-require
  const db = require('../../storages/db');

  db.once('error', (err) => {
    // тут ловятся ошибки возникающие в процессе работы бд
    console.log('BD ERR:', err);
  });

  db.once('open', () => {
    // двигает дальше процесс раннинга.
    // у монгуса есть кеш запросов. Порядок не важен, но во избежания странных ситуаций, он настроен так же, как и другие ранеры.
    // console.log('Connected to DB');
    resolve(db);
  });

  db.once('close', () => {
    // уведомление для логов
    console.log('Close connected to DB');
  });
});

module.exports = init;
