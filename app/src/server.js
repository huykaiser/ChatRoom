const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessages } = require("./utils/create-messages");
const { getUserList, addUser, removeUser, findUser } = require('./utils/users');

const publicPathDirectory = path.join(__dirname, '../public');
app.use(express.static(publicPathDirectory));

const server = http.createServer(app);
const io = socketio(server);

// listen event connection from client
io.on("connection", (socket) => {
    // console.log("new client connect");
    // gui cho client vua ket noi vao
    // socket.emit("send message from server to client", createMessages("Welcome to Node-Chat"));

    // // gui cho cac clien con lai
    // socket.broadcast.emit("send message from server to client", createMessages(`a new client just joined`));

    socket.on("join room form client to server", ({ room, username })=>{
        socket.join(room);

        // say hello
        // gui cho client vua ket noi vao
        socket.emit("send message from server to client", createMessages(`Welcome to the room ${ room }`, "Admin"));

        // gui cho cac clien con lai
        socket.broadcast
            .to(room)
            .emit("send message from server to client", createMessages(`client ${ username } just joined the room ${ room }`, "Admin"));

        // chat
        socket.on("send message from client to server", (messageText, callback)=>{
            const filter = new Filter();
            if(filter.isProfane(messageText)){
                return callback("messageText is not available because of profane language");
            }

            const id = socket.id;
            const user = findUser(id);
            
            io.to(room).emit("send message from server to client", createMessages(messageText, user.username));
            callback();
        });

        // handle share location
        socket.on("share location from client to server", ({ latitude, longitude })=>{
            const linklocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const id = socket.id;
            const user = findUser(id);
            io.to(room).emit("share location from server to client", createMessages(linklocation, user.username));
        });

        // handle userList
        const newUser = {
            id: socket.id,
            username,
            room
        };

        addUser(newUser);
        io.to(room).emit("send user list from server to client", getUserList(room));

        // disconnect
        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.to(room).emit("send user list from server to client", getUserList(room));
            console.log("client left server");
        });
    });
});

const port = 4567;
server.listen(port, () => {
    console.log(`app run on http://localhost:${port}`);
});

