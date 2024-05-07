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

const publicRooms = () => {
  const sids = io.sockets.adapter.sids;
  const rooms = io.sockets.adapter.rooms;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

const countRoom = (roomName) => {
  return io.sockets.adapter.rooms.get(roomName)?.size;
};

io.on('connection', (socket) => {
  io.sockets.emit('room_change', publicRooms());
  socket.onAny((e) => {
    console.log(io.sockets.adapter);
    console.log(`Socket Event : ${e}`);
  });
  socket.on('enter_room', (nickname, roomName, done) => {
    socket.join(roomName);
    done();
    socket['nickname'] = nickname;
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    io.sockets.emit('room_change', publicRooms());
  });
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomName) =>
      socket.to(roomName).emit('bye', socket.nickname, countRoom(roomName) - 1)
    );
  });
  socket.on('disconnect', () => {
    io.sockets.emit('room_change', publicRooms());
  });
});

server.listen(3000, handleListen);
