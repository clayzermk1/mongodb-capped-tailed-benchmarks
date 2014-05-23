/*
 * Modified final source from http://shtylman.com/post/the-tail-of-mongodb/.
 * You must compile the MongoDB C++ driver locally before compiling.
 * Build command: g++ consumer.cpp -pthread -lmongoclient -lboost_thread-mt -lboost_filesystem -lboost_program_options -lboost_system -L./mongo-client-install/lib/ -I./mongo-client-install/include/ -o consumer
 * Run command: ./consumer > results.csv
 */

#include <cstdlib>
#include <iostream>
#include "mongo/client/dbclient.h"

using namespace mongo;

int main(int argc, char* argv[]) {
    DBClientConnection conn;
    conn.connect("localhost");

    // { $natural : 1 } means in forward capped collection insertion order
    Query query = QUERY( "timestamp" << GT << jsTime() ).sort("$natural");

    std::cout << "loc,val" << std::endl;
    uint32_t i = 0;
    const uint32_t COUNT = 100000;
    while( i < COUNT ) {
        std::auto_ptr<DBClientCursor> c = conn.query("default.buffer", query, 0, 0, 0, QueryOption_CursorTailable | QueryOption_AwaitData);
        while( i < COUNT ) {
            if( !c->more() ) {
                if( c->isDead() ) {
                    // this sleep is important for collections that start out with no data
                    sleepsecs(1);
                    break;
                }
                continue;
            }

            const BSONObj& o = c->next();
            const Date_t msgTime = o["timestamp"].Date();
            std::cout << i++ << "," << jsTime().millis - msgTime.millis << std::endl;
        }

        // prepare to requery from where we left off
        query = QUERY( "timestamp" << GT << jsTime() ).sort("$natural");
    }

    return 0;
}
