import http from 'http';
import SocketIo from 'socket.io';
// import WebSocket from 'ws';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log('Listening on http://localhost:3000');
// app.listen(3000, handleListen);

const server = http.createServer(app);
const io = SocketIo(server);

io.on('connection', (socket) => {
  socket['nickname'] = 'Anon';
  socket.onAny((e) => {
    console.log(`Socket Event : ${e}`);
  });
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname);
  });
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname)
    );
  });
});

// const wss = new WebSocket.Server({ server });

// const sockets = [];

// wss.on('connection', (socket) => {
//   sockets.push(socket);
//   socket['nickname'] = 'Anon';
//   console.log('Connected to Browser!');
//   socket.on('close', () => {
//     console.log('Disconnected from Browser! ❌');
//   });
//   socket.on('message', (msg) => {
//     const message = JSON.parse(msg.toString());
//     switch (message.type) {
//       case 'new_message':
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//         break;
//       case 'nickname':
//         socket['nickname'] = message.payload;
//         break;
//       default:
//         break;
//     }
//   });
// });

server.listen(3000, handleListen);
