const socketio = require('socket.io');
const { options } = require('../../config').server.ws;

const { registerRouter, applyRouter } = require('./router');
// const chatRoute = require('../../routes/ws/chat');

let io = null;

const getIo = () => {
  if (io === null) {
    throw new Error('Cannot access io before initialization');
  } 
  return io; 
}

const run = async (server) => {
  io = socketio(server, options); 

  // registerRouter('/chat', chatRoute);
  io.on('connection', (socket) => {
    applyRouter(socket)
    console.log(socket.id, 'connected')
    socket.conn.on("close", (reason) => {
      console.log(socket.id, 'disconnected')
    });
  });

};

module.exports = { run, getIo };
// module.exports.run = run;
// module.exports.getIo = getIo;
