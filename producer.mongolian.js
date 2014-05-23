/*
 * Requires node-mongolian to be installed locally.
 * Run command: node producer.mongolian.js
 */

var Mongolian = require("mongolian");

// Create a server instance with default host and port
var db = new Mongolian("mongo://localhost:27017/default");
var buffer = db.collection("buffer")

var COUNT = 100000;

var start = new Date();
for (var i = 0; i < COUNT; i++) {
  buffer.insert({ "event": "fast", "timestamp": new Date() });
}

console.log('total:', COUNT);
console.log('msg/s:', COUNT / (new Date().getTime() - start.getTime()) * 1000);
