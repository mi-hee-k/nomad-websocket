const socket = io();

const welcome = document.querySelector('#welcome');
const room = document.querySelector('#room');
const form = welcome.querySelector('form');

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
};

const handleMsgSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
};

const handleNicknameSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector('#name input');
  socket.emit('nickname', input.value);
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMsgSubmit);
  nameForm.addEventListener('submit', handleNicknameSubmit);
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector('input');
  socket.emit('enter_room', input.value, showRoom);
  roomName = input.value;
  input.value = '';
};

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user) => addMessage(`${user} joined!`));
socket.on('bye', (user) => addMessage(`${user} left! ㅠㅠ`));
// socket.on('new_message', (msg) => addMessage(msg));
socket.on('new_message', addMessage);
