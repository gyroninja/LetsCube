var alg = require("alg");
var colors = require("colors");
var express = require("express");
var prompt = require("prompt");
var scrambo = new (require("scrambo"))();

var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

console.log(scrambo.get(1).toString());

var currentState = scrambo.get(1).toString();

app.use(express.static(__dirname + "/public"));

io.on("connection", function(socket) {

  socket.emit("message", "Hello World!");

  socket.emit("alg", {type: "scramble", alg: currentState});
});

http.listen(5250, function() {

  console.log("Listening on " + "*:3000".green);

  prompt.start();

  sendAlg();

  function sendAlg() {

    prompt.get(["alg"], function (err, result) {

      currentState = alg.cube.simplify(currentState + " " + result.alg);

      console.log("Current State: " + currentState.red);

      io.emit("alg", {type: "move", alg: result.alg});

      sendAlg();
    });
  }
});

