//EXPRESS SERVER
var express = require("express")
var app = express()
const PORT = 3000;
var path = require("path")
app.use(express.json());
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const destroy = require("destroy");
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
    })
    socket.on('shipsReady', (data) => {
        const index = activeUsers.indexOf(data.username)
        if (index == -1)
            console.log('zdupcylo sie')
        else {
            activeUsers.splice(index, 1)
            activeUsers.push(data)
        }
        if (!activeUsers.some(item => typeof (item) == 'string') && activeUsers.length == 2) {
            console.log("STARTING")
            io.emit('gameStart', {
                turn: activeUsers[Math.round(Math.random())]
            })
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
        else if (hitShip == 4) {
            let sum = 0
            playerToGetShot.board.forEach(item => {
                item.forEach(element => {
                    if (element == 4) sum++
                })
            })
            if (sum == 0) destroyed = true
        }
        else if (hitShip == 3) {
            let sum = 0
            playerToGetShot.board.forEach(item => {
                item.forEach(element => {
                    if (element == 3) sum++
                })
            })
            if (sum == 0) destroyed = true
        }
        else if (hitShip == 9) {
            let sum = 0
            playerToGetShot.board.forEach(item => {
                item.forEach(element => {
                    if (element == 9) sum++
                })
            })
            if (sum == 0) destroyed = true
        }
        else if (hitShip == 2) {
            if (playerToGetShot.board[data.y - 1][data.x] != 2 &&
                playerToGetShot.board[data.y + 1][data.x] != 2 &&
                playerToGetShot.board[data.y][data.x + 1] != 2 &&
                playerToGetShot.board[data.y][data.x - 1] != 2) destroyed = true
        }
        let dataResponse = [
            {
                for: playerToGetShot.username,
                type: 'board',
                board: playerToGetShot.board,
                cordinates: {
                    x: data.x,
                    y: data.y
                },
                answer: answer,
                destroyed: destroyed,
                ship: hitShip
            },
            {
                for: data.from,
                type: 'answer',
                answer: answer,
                cordinates: {
                    x: data.x,
                    y: data.y
                },
                destroyed: destroyed,
                ship: hitShip
            }
        ]
        io.emit('shotAnswer', dataResponse)
        let winCondition = true;
        playerToGetShot.board.forEach(item => {
            if (item.some(element => element != "X" && element != 0)) winCondition = false
        })
        if (winCondition) io.emit('gameEnd', { winner: data.from })
    })
});

app.use(express.static('static'))
server.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})
