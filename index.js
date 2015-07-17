var alg = require("alg");
var colors = require("colors");
var express = require("express");
var prompt = require("prompt");
var scrambo = new (require("scrambo"))();

var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var port = 5250;

var currentState = scrambo.get(1).toString();

app.use(express.static(__dirname + "/public"));

io.on("connection", function(socket) {

  socket.emit("message", "Hello World!");
  socket.emit("alg", {type: "scramble", alg: currentState});

  socket.on("moves", function(msg) {

    try {

      alg.cube.fromString(msg); //Validate input here

      sendAlg(msg);
    }

    catch (err) {

      // Bad Input
    }
  })
});

http.listen(port, function() {

  console.log("Listening on " + ("*:" + port).green);

  prompt.start();

  getAlg();
});

function getAlg() {

  prompt.get(["alg"], function (err, result) {

    sendAlg(result.alg);

    getAlg();
  });
}

function sendAlg(algo) {

  currentState = alg.cube.simplify(currentState + " " + algo);

  console.log("Current State: " + currentState.red);

  io.emit("alg", {type: "move", alg: algo});
}