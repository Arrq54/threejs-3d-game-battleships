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
const { MongoClient } = require('mongodb');
const { connected } = require("process");
let activeUsers = []
const uri = "mongodb+srv://BattleshipClient:IKCVjDQ1k4BvBfcP@atlascluster.c3c3b.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);
app.use(express.urlencoded({
    extended: true
}));
let databaseData = {};
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/static/index.html")
})
io.on('connection', (socket) => {
    socket.on('getDatabaseContent', () => {
        io.emit('databasedata', databaseData)
    })

    socket.on('resetUsers', () => {
        activeUsers = []
    })
    io.emit('test', "socket io dziala");
    socket.on('loginSuccess', (username) => {
        let success = false;
        let msg = "";
        if (activeUsers.length < 2) {
            if (!activeUsers.includes(username)) {
                activeUsers.push(username)
                success = true;
            } else {
                msg = "User with this username already exists!"
            }
        } else {
            msg = "There are already two players in the game!"
        }
        let data = {
            success: success,
            errorMessage: msg
        }
        io.emit('loginStatus', data)
    })
    socket.on('shipsReady', (data) => {
        const index = activeUsers.indexOf(data.username)
        if (index == -1)
            console.log('ERROR')
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
        playerToGetShot.board[data.y][data.x] = 'X' + hitShip
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
            if ((playerToGetShot.board[data.y - 1] == undefined || playerToGetShot.board[data.y - 1][data.x] != 2) &&
                (playerToGetShot.board[data.y + 1] == undefined || playerToGetShot.board[data.y + 1][data.x] != 2) &&
                (playerToGetShot.board[data.y] == undefined || playerToGetShot.board[data.y][data.x + 1] != 2) &&
                (playerToGetShot.board[data.y] == undefined || playerToGetShot.board[data.y][data.x - 1] != 2)
            ) destroyed = true
        }
        let rotation = null;
        if (destroyed) {
            let oar = playerToGetShot.board
            console.log(oar)
            let y = data.y
            let x = data.x
            if (oar[y][x - 1] != undefined && oar[y][x - 1].toString().includes(hitShip)) rotation = '-x'
            else if (oar[y][x + 1] != undefined && oar[y][x + 1].toString().includes(hitShip)) rotation = 'x'
            else if (oar[y + 1] != undefined && oar[y + 1][x] != undefined && oar[y + 1][x].toString().includes(hitShip)) rotation = 'y'
            else if (oar[y - 1] != undefined && oar[y - 1][x] != undefined && oar[y - 1][x].toString().includes(hitShip)) rotation = '-y'
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
                ship: hitShip,
                rotation: rotation,
                bugfix: playerToGetShot.board
            }
        ]
        io.emit('shotAnswer', dataResponse)
        let winCondition = true;
        playerToGetShot.board.forEach(item => {
            if (item.some(element => !element.toString().includes('X') && element != 0)) winCondition = false
        })
        if (winCondition) io.emit('gameEnd', { winner: data.from })
    })
});

app.use(express.static('static'))
server.listen(PORT, async function () {
    console.log("start serwera na porcie " + PORT)
    await client.connect();
    client.db("battleships_data").collection("startup_info").find({}).toArray((err, items) => {
        databaseData = JSON.parse(items[0].data)
        client.db("battleships_data").collection("idleShipsLocations").find({}).toArray((err, items) => {
            let temp = [];
            items.map(item => {
                temp.push(item.data)
            })
            databaseData.idleShips = temp;
        })
    })
})
