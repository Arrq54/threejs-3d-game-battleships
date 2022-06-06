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
        if (activeUsers.length < 2)
            activeUsers.push(username)
        console.log(activeUsers)
    })

    socket.on('shipsReady', (data) => {
        const index = activeUsers.indexOf(data.username)
        if (index == -1)
            console.log('zdupcylo sie')
        else {
            activeUsers.splice(index, 1)
            activeUsers.push(data)
        }
    })

    socket.on('shot', (data) => {
        let playerToGetShot = activeUsers.find(item => item.username != data.from)
        let answer;
        let hitShip;
        if (playerToGetShot.board[data.y][data.x] != 0) {
            answer = "hit"
            hitShip = playerToGetShot.board[data.y][data.x]
        }
        else answer = 'miss'


        playerToGetShot.board[data.y][data.x] = 'X'


        let destroyed = false;
        if (hitShip == 1) destroyed = true

        let dataResponse = [
            {
                for: playerToGetShot.username,
                type: 'board',
                board: playerToGetShot.board,
                cordinates: {
                    x: data.x,
                    y: data.y
                }
            },
            {
                for: data.from,
                type: 'answer',
                answer: answer,
                cordinates: {
                    x: data.x,
                    y: data.y
                },
                destroyed: destroyed
            }
        ]
        io.emit('shotAnswer', dataResponse)

    })
});

app.use(express.static('static'))
server.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})
