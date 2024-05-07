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
  msgForm.addEventListener('submit', handleMsgSubmit);
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const nicknameInput = form.querySelector('#nickname');
  const roomNameInput = form.querySelector('#room-name');
  nicknameValue = nicknameInput.value;
  roomNameValue = roomNameInput.value;
  socket.emit('enter_room', nicknameValue, roomNameValue, showRoom);
  roomName = roomNameValue;
  nicknameInput.value = '';
  roomNameInput.value = '';
};

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined!`);
});
socket.on('bye', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} left! ㅠㅠ`);
});

socket.on('new_message', addMessage);
socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li);
  });
});
