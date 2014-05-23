/*
 * Requires node-mongodb-native to be installed locally.
 * Run command: node producer.js
 */

var cluster = require('cluster'),
    MongoClient = require('mongodb').MongoClient;

var COUNT = 100000; // must match consumer
var count = 0;

MongoClient.connect('mongodb://localhost:27017/default', { "server": { "poolSize": 1024 }}, function (err, db) {
  if (err) throw err;
  db.collection('buffer', function (err, buffer) {
    if (err) throw err;

    var start = new Date();
    Array.apply(null, {length: COUNT}).forEach(function (i) {
      buffer.insert({ "event": "fast", "timestamp": new Date() }, function (err) {
        if (err) throw err;
        count ++;
        if (count === COUNT) {
          console.log('total:', count);
          console.log('msg/s:', count / (new Date().getTime() - start.getTime()) * 1000);
          process.exit();
        }
      });
    });
    /*for (var i = 0; i <= COUNT; i++) {
      buffer.insert({ "event": "fast", "timestamp": new Date() }, function (err) {
        if (err) throw err;
        count ++;
        if (count === COUNT) {
          console.log('total:', count);
          console.log('msg/s:', count / (new Date().getTime() - start.getTime()) * 1000);
          process.exit();
        }
      });
    }*/

    process.on('exit', function () {
      db.close();
    });

    process.on('SIGINT', function () {
      process.exit();
    });
  });
});
