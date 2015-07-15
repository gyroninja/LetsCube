var colors = require("colors");
var express = require("express");

var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http)

app.use(express.static(__dirname + "/public"));

io.on("connection", function(socket) {

  socket.emit("message", "Hello World!");
});

http.listen(5250, function() {

  console.log("Listening on " + "*:3000".green);
});
