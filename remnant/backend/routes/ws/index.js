
const { Router } = require('../../servers/ws/router');
const wsServer = require('../../servers/ws');
// const ss = require('socket.io-stream');

const router = new Router();


// router.register('/init', (req, cb) => {

//   wsServer.getIo().to(req.socket.id).emit('/updateData', { message: 'The matrix has you!', manager: 'Antonio' }); 

//   cb({ status: 'ok', payload: { theme: { header: '#272727', type: '1', mainColor: '#272727' } } });
// });

// router.register('/first', (req, cb) => {

//   wsServer.getIo().to(req.socket.id).emit('/message/new', { message: 'The matrix has you!', manager: 'Antonio' }); 

//   cb({ status: 'ok', payload: { theme: { header: '#272727', type: '1', mainColor: '#272727' } } });
// });


module.exports = router;
