/*
 * Requires node-mongodb-native to be installed locally.
 * Run command: node producer.cluster.js
 */

var cluster = require('cluster'),
    MongoClient = require('mongodb').MongoClient;

var numCpus = require('os').cpus().length;
var COUNT = 100000; // must match consumer
var count = 0;

if (cluster.isMaster) {
  // Fork workers.
  var start = new Date();
  for (var i = 0; i < numCpus; i++) {
    cluster.fork().on('message', function (msg) {
      count ++;
      if (count === COUNT) {
        end = new Date();
        console.log('total:', count);
        console.log('msg/s:', count / (new Date().getTime() - start.getTime()) * 1000);
        cluster.disconnect();
      }
    });
  }

  cluster.on('disconnect', function (worker) {
    console.log('worker', worker.process.pid, 'exited gracefully/was killed/disconnected manually');
  });

  cluster.on('exit', function (worker, code, signal) {
    console.log('worker', worker.process.pid, 'died');
    if (Object.keys(cluster.workers).length === 0) {
      process.exit();
    }
  });

  process.on('exit', function () {
    console.log('exiting from master');
  });

  process.on('SIGINT', function () {
    process.exit();
  });
} else {
  MongoClient.connect('mongodb://localhost:27017/default', { "server": { "poolSize": 1024 }}, function (err, db) {
    if (err) throw err;

    db.collection('buffer', function (err, buffer) {
      if (err) throw err;

      var doInsert = function () {
        buffer.insert({ "event": "fast", "timestamp": new Date() }, function (err) {
          if (err) throw err;
          count ++;
          process.send({ "count": count });
          if (count === Math.ceil(COUNT / numCpus)) {
            process.exit();
          }
        });
      };

      for (var i = 0; i <= Math.ceil(COUNT / numCpus); i++) {
        if (i % 32 === 0) {
          process.nextTick(doInsert);
        }
        else {
          doInsert();
        }
      }

      process.on('exit', function () {
        db.close();
      });

      process.on('SIGINT', function () {
        process.exit();
      });
    });
  });
}
