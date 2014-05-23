/*
 * You must compile the MongoDB C++ driver locally before compiling.
 * Build command: g++ producer.cpp -pthread -lmongoclient -lboost_thread-mt -lboost_filesystem -lboost_program_options -lboost_system -L./mongo-client-install/lib/ -I./mongo-client-install/include/ -o producer
 * Run command: ./producer
 */

#include <cstdlib>
#include <iostream>
#include "mongo/client/dbclient.h"

using namespace mongo;

int main(int argc, char* argv[]) {
    DBClientConnection conn;
    conn.connect("localhost");

    const uint32_t COUNT = 100000;

    const Date_t start = jsTime();
    for(uint32_t i = 0; i < COUNT; i++) {
        conn.insert("default.buffer", BSON( "event" << "fast" << "timestamp" << jsTime() ), 0);
    }

    std::cout << "total: " << COUNT << std::endl;
    std::cout << "msg/s: " << (float)COUNT / (float)(jsTime().millis - start.millis) * 1000.0 << std::endl;

    return 0;
}
