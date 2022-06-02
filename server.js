//EXPRESS SERVER
var express = require("express")
var app = express()
const PORT = 3000;
var path = require("path")
app.use(express.json());
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let activeUsers = []

app.use(express.urlencoded({
    extended: true
}));
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/static/index.html")
})
io.on('connection', (socket) => {

    io.emit('test', "socket io dziala");

    socket.on('loginSuccess', (username) => {
        activeUsers.push(username)
    })

});

app.use(express.static('static'))
server.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})
