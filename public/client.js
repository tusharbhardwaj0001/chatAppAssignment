const { io } = require("socket.io-client");
const socket = io("http://localhost:5000");





const sendMessage = (req, res) => {
    let loggedInUser = req.profile.userName;
    let message = req.body.msg;
    let room = req.body.room;
    socket.emit('message', {room: room, message:message, from: loggedInUser});
}


const createRoom = (id) => {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    let room = Date.now() + Math.random();
    room = room.toString().replace(".","_");
    socket.emit('create', {room: room, userId:loggedInUser.userId, withUserId:id});
    openChatWindow(room);
}


socket.on('updateUserList', function(userList) {
    let loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    $('#user-list').html('<ul></ul>');
    userList.forEach(item => {
        if(loggedInUser.user_id != item.user_id){
            $('#user-list ul').append(`<li data-id="${item.user_id}" onclick="createRoom('${item.user_id}')">${item.user_full_name}</li>`)
        }
    });

});

socket.on('invite', function(data) {
    socket.emit("joinRoom",data)
});

socket.on('message', function(msg) {
    sendMyMessage(msg.room, msg.from, msg.message)
});


socket.on("connect", () => {
    console.log(socket.connected); // true
    socket.emit("message", "joines chat room" );
});