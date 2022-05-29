//EXPRESS SERVER
var express = require("express")
var app = express()
const PORT = 3000;
var path = require("path")
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/static/index.html")
})


app.use(express.static('static'))
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})
