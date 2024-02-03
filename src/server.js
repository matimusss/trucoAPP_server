const { Server, Origins } = require('boardgame.io/server');
const { Truco } = require('./Game');

// Manejo de uncaughtException
process.on('uncaughtException', function (err) {
  console.error('Caught exception:', err);
  // Puedes realizar acciones adicionales aquí si es necesario.
});

const server = Server({
  games: [Truco],
  origins: [
'http://trucortc.onrender.com',
'http://trucortc.onrender.com:3000',
'https://trucortc.onrender.com',
'https://trucortc.onrender.com:3000',
'3.134.238.10',
'3.129.111.220',
'52.15.118.168',
'http://3.134.238.10',
'http://3.129.111.220',
'http://52.15.118.168',
'https://3.134.238.10',
'https://3.129.111.220',
'https://52.15.118.168',
'http://3.134.238.10:3000',
'http://3.129.111.220:3000',
'http://52.15.118.168:3000',
'https://3.134.238.10:3000',
'https://3.129.111.220:3000',
'https://52.15.118.168:3000',
'3.134.238.10:3000',
'3.129.111.220:3000',
'52.15.118.168:3000'
],

});

server.run(8000, () => {
  console.log('Server is running on port 8000');
});
