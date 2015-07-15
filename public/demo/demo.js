/*
 * twisty_demo.js
 * 
 * Demonstration and testing harness for WSOH.
 * 
 * TOOD
 * - Fix document.getElementById(...) calls.
        // TODO I can imagine that some users of twisty.js would want to be able to have a Heise-style
        // inspection, where you are only allowed to do inspection moves during inspection, rather than
        // just starting the timer when they do a turn. This will require somehow being able to cancel/prevent a move?
        // TODO clicking on canvas doesn't seem to focus window in firefox
        // TODO clicking and dragging is weird when the mouse leaves the window
        // TODO keydown doesn't repeat on firefox
 * 
 */

"use strict";

var cache = window.applicationCache;
function updateReadyCache() {
  window.applicationCache.swapCache();
  location.reload(true); // For now
}

function pad(n, minLength) {
  var str = '' + n;
  while (str.length < minLength) {
    str = '0' + str;
  }
  return str;
}

var twistyScene;

$(document).ready(function() {

  var webgl = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
  // Try WebGL  
  if (webgl) {
    $('#renderer_WebGL').attr('checked', true)
  }

  /*
   * Caching Stuff.
   */

  cache.addEventListener('updateready', updateReadyCache, false);

  log("Document ready.");

  var currentCubeSize = parseInt($("#cubeDimension").val());
  reloadCube();

  $("#cubeDimension").bind("input", reDimensionCube);
  $("#allow_dragging").bind("change", reloadCube);
  $("#hint_stickers").bind("change", reloadCube);

  twistyScene.setSpeed(1);

  $("#parsed_alg").bind("click", function() {
    var algo = alg.cube.fromString($("#parse_alg").val());
    var moves = alg.cube.toMoves(algo);
    twistyScene.queueMoves(moves);
    twistyScene.play.start();
  });

  twistyScene.setCameraPosition(0);

  function reDimensionCube() {
    var dim = parseInt($("#cubeDimension").val());
    if (!dim) {
      dim = 3;
    }
    dim = Math.min(Math.max(dim, 1), 16);
    if (dim != currentCubeSize) {
      currentCubeSize = dim;
      reloadCube();
    }
  }

  // From alg.garron.us
  function escapeAlg(algstr){return algstr.replace(/\n/g, '%0A').replace(/-/g, '%2D').replace(/\'/g, '-').replace(/ /g, '_');}

  function reloadCube() {
    log("Current cube size: " + currentCubeSize);

    var renderer = THREE["WebGLRenderer"]; //TODO: Unsafe

    twistyScene = new twisty.scene({
      renderer: renderer,
      allowDragging: $("#allow_dragging").is(':checked'),
      speed: 1,
      stats: true
    });
    $("#twistyContainer").empty();
    $("#twistyContainer").append($(twistyScene.getDomElement()));

    twistyScene.initializePuzzle({
      "type": "cube",
      "dimension": currentCubeSize,
      "stage": "Full",
      "doubleSided": "true",
      "cubies": "true",
      "hintStickers": $("#hint_stickers").is(':checked'),
      "stickerBorder": "true"
    });
    $("#cubeDimension").blur(); 
    twistyScene.resize();
  }

  /*
   * Socket IO stuff
   */

  var socket = io();

  socket.on("message", function(msg) {
    log(msg);
  });

  socket.on("alg", function(msg) {
    log("Recieved Alg: " + JSON.stringify(msg));
    var type = msg.type;
    var algo = alg.cube.fromString(msg.alg);
    var moves = alg.cube.toMoves(algo);
    if (type === "scramble") {
      twistyScene.setSpeed(100);
    }
    else if (type === "move") {
      twistyScene.setSpeed(1);
    }
    twistyScene.queueMoves(moves);
    twistyScene.play.start();
  });

  $(window).resize(twistyScene.resize);
});

/*
 * Convenience Logging
 */

var logCounter = 0;

function log(obj) {
  if(typeof(console) !== "undefined" && console.log) {
    //console.log(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = (logCounter++) + ". " + obj + "<hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

function err(obj) {
  if(typeof(console) !== "undefined" && console.error) {
    console.error(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = "<div class='err'>" + (logCounter++) + ". " + obj + "</div><hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}
