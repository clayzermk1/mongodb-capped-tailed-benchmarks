# MongoDB Capped Collection / Tailed Cursor Benchmarks #

Note: In these tests I do not measure/record memory or CPU utilization. I do monitor them visually using GNOME's `System Monitor`, but that's it. I am only concerned with the performance of the various methods/drivers/etc.

## Environment ##

VirtualBox VM running Debian 7.5 amd64 w/ kernel 3.2.0-4-amd64  
CPU: 6 cores of Intel(R) Xeon(R) CPU W3670 @ 3.20GHz  
Memory: 6129524 kB (6 GiB)  
MongoDB: 2.6.1 from MongoDB repo, locally installed and listening on localhost

Python: 2.7.3 from Debian repo  
pymongo: 2.7 installed using easy_install

g++: 4.7.2 from Debian repo  
Boost: 1.49 from Debian repo  
SCons: 2.1.0.r5357 from Debian repo  
mongo-cxx-driver: "legacy" 0.8.0 from git (May 13, 2014 - c764415ecd4902c80f4880980e618a83d9e1bb92)

Node.js: 0.11.13 installed using [n](https://github.com/visionmedia/n)  
bson: 0.2.7  
node-mongodb-native: 1.4.3

Ruby: 1.9.3p194 (2012-04-20 revision 35410) [x86_64-linux] from Debian repo  
bson gem: 1.10.1  
mongo gem: 1.10.1

### ulimit ###

Per the [MongoDB manual](http://docs.mongodb.org/manual/reference/ulimit/#recommended-settings) I've increased the limits in `/etc/security/limits.d/mongod.conf` to 64000 each.

```
# /etc/security/limits.d/mongod.conf

mongodb soft nofile 64000
mongodb hard nofile 64000
mongodb soft nproc 64000
mongodb hard nproc 64000
```

The `mongod` process limits report `-n` at 64000 and `-u` at 32000.
```cat /proc/`ps aux | grep mongod | awk '/^mongodb/ { print $2 }'`/limits```

```
Limit                     Soft Limit           Hard Limit           Units
Max cpu time              unlimited            unlimited            seconds
Max file size             unlimited            unlimited            bytes
Max data size             unlimited            unlimited            bytes
Max stack size            8388608              unlimited            bytes
Max core file size        0                    unlimited            bytes
Max resident set          unlimited            unlimited            bytes
Max processes             32000                32000                processes
Max open files            64000                64000                files
Max locked memory         65536                65536                bytes
Max address space         unlimited            unlimited            bytes
Max file locks            unlimited            unlimited            locks
Max pending signals       47846                47846                signals
Max msgqueue size         819200               819200               bytes
Max nice priority         0                    0
Max realtime priority     0                    0
Max realtime timeout      unlimited            unlimited            us

```

## Reproduction of Results by R. Shtylman ##

Using the above environment, I was able to reproduce the [final latency pattern of the blog post](http://shtylman.com/img/post/the-tail-of-mongodb/final.png).

Albiet my performance was substantially lower than his claimed ~3900 messages/second using the Python producer (even using his exact code) and my slowest outliers were slower than his (assuming his graphs show the entire domain and range of points). I attribute this to my virtualized environment and less resources.

## Producers ##

### Connection Pool Size ###

A major difference between node-mongodb-native and pymongo with respect to latency is the default connection pool size. In node-mongodb-native the value is set to [5](http://mongodb.github.io/node-mongodb-native/api-generated/server.html). In pymongo the value is set to [100](http://api.mongodb.org/python/2.7rc0/api/pymongo/mongo_client.html#module-pymongo.mongo_client). In R. Shtylman's Python producer source, the deprecated `connection` class has an [unlimited](http://api.mongodb.org/python/2.7rc0/api/pymongo/connection.html) connection pool.

Based on [a separate blog post about connection pooling](http://blog.mongolab.com/2013/11/deep-dive-into-connection-pooling/), I set a connection pool size of 1024 for all producers.

### C++ Producer ###

I created a C++ producer just to see how fast I could go with the C++ library.

### Node.js Producer ###

I created a Node.js producer using the `node-mongodb-native` driver.

### Node.js Clustered Producer ###

I created a `cluster`ed version of the Node.js producer to see if I could get some increased performance.

### Node.js Mongolian Producer ###

While investigating the odd results of my Node.js producer, I decided to try other MongoDB Node.js drivers to see if I could pin down the cause of the behavior. The Mongolian driver was a hand-rolled MongoDB wire level protocol driver; it is no longer maintained.

### Python Producer ###

I made several changes to the original:

* I changed from `Connection` to `MongoClient` per the documentation (`Connection` is deprecated).
* I opted for UTC `datetime` objects instead of epoch ticks (mostly to match my JS Date objects).
* I was able to double performance from ~660 messages/second to ~1300 messages/second by removing the sleep with no visible impact on latency.
* I close the database connection when everything is done.

### Ruby Producer ###

I created a Ruby producer because the documentation for `node-mongodb-native` said that it had been ported from the `mongodb-ruby-driver` and I wanted to see if it exhibited the same odd behavior as the Node.js producer.

## Consumer ##

I made some minor changes to the original C++ consumer:

* Automatically stop receiving when 100000 messages have been received.
* Use of `jsTime()` instead of `timeval`s

## Graphs ##

I graph the generated CSV files using the included GNU Plot script.

## Results ##

All of the drivers produce a consistent latency vs count graph depicting a more-or-less constant latency with the exception of the Node.js drivers which depict a linear or logarithmic increase in latency with an increase in count.

I am absolutely puzzled by the `node-mongodb-native` driver's latency measurements. They appear to be hitting some sort of internal stack (opposed to a buffer) which causes their latency values to grow very drastically and produces some visually novel visualizations (especially between iterations).

On occasion, the single-threaded Node.js producter will create a graph that loosely resembles the rest of the drivers, but this behavior is inconsistent.

I would greatly appreciate any help diagnosing and explaining this phenomenon! :beers:
