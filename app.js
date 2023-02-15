const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");
var { expressjwt: jwt } = require("express-jwt");

const app = express();


const userRoute = require("./routes/user");

//DB Connection
const URL = "mongodb://localhost:27017/chatApp";
mongoose.connect(URL)
    .then(() => {
        console.log("DB Connected");
    })
    .catch(() => {
        console.log("DB not connected");
    });



//middleware
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));


//coustom routes
app.use("/api", userRoute);

//home route
app.get("/", (req, res) => {
    res.status(200).json({
        msg : "This is home page"
    });
});


const PORT = 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is Start at ${PORT}`);
});


let clientSocketIds = [];
let connectedUsers= [];

const getSocketByUserId = (userId) =>{
    let socket = '';
    for(let i = 0; i<clientSocketIds.length; i++) {
        if(clientSocketIds[i].userId == userId) {
            socket = clientSocketIds[i].socket;
            break;
        }
    }
    return socket;
}

var io = socket(server);
io.on('connection', socket => {
    console.log('conected')
    socket.on('disconnect', () => {
        console.log("disconnected")
        connectedUsers = connectedUsers.filter(item => item.socketId != socket.id);
        io.emit('updateUserList', connectedUsers)
    });

    socket.on('loggedin', function(user) {
        clientSocketIds.push({socket: socket, userId:  user.user_id});
        connectedUsers = connectedUsers.filter(item => item.user_id != user.user_id);
        connectedUsers.push({...user, socketId: socket.id})
        io.emit('updateUserList', connectedUsers)
    });

    socket.on('create', function(data) {
        console.log("create room")
        socket.join(data.room);
        let withSocket = getSocketByUserId(data.withUserId);
        socket.broadcast.to(withSocket.id).emit("invite",{room:data})
    });
    socket.on('joinRoom', function(data) {
        socket.join(data.room.room);
    });

    socket.on('message', function(data) {
        socket.broadcast.to(data.room).emit('message', data);
    })
});


