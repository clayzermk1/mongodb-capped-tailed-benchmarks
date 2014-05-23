#!/usr/bin/python

# Modified final source from http://shtylman.com/post/the-tail-of-mongodb/.
# Requires that pymongo be installed on the system.
# Run command: python producer.py

import time
import datetime
from pymongo import MongoClient

c = MongoClient(max_pool_size=1024)
#c.write_concern['w'] = 0
db = c.default
coll = db.buffer

COUNT = 100000

start = datetime.datetime.utcnow()
for i in range(0, COUNT):
    coll.insert({ "event": "fast", "timestamp": datetime.datetime.utcnow() })
    #time.sleep(0.0001)

c.close()

print("total: ", COUNT)
print("msg/s: ", COUNT/(datetime.datetime.utcnow() - start).total_seconds())
