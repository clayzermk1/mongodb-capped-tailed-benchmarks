# Requires that the mongo gem be installed on the system.
# Run command: ruby producer.rb

require 'mongo'
include Mongo

# connecting to the database
client = MongoClient.new("localhost", 27017, :pool_size => 1024)
db     = client['default']
coll   = db['buffer']

COUNT = 100000

# inserting documents
start = Time.new
COUNT.times { |i| coll.insert({ :event => 'fast', :timestamp => Time.new }) }

client.close

puts "total: " + COUNT.to_s
puts "msg/s: " + (COUNT.to_f / (Time.new - start).to_f).to_s
