# Plot count vs latency on a nice graph
# Run command: gnuplot graph.gnuplot

set term png
set output "results.png"
set datafile separator ","

set title "Count vs Latency"
set xlabel "Count"
set ylabel "Latency (ms)"
set xrange [0:100000]
#set yrange [0:10]
set grid
set timestamp

# Use this line for plotting a single CSV
#plot "results.csv" using 1:2 with dots

# Use these line for plotting a combined graph of all CSVs
set yrange [0.9:30000]
set logscale y
set key out vert
set key right center
# Use this line for laptop.ubuntu results
#plot "./nodejs/results.laptop.ubuntu.nodejs.csv" using 1:2 with dots title "node", "./nodejs.cluster/results.laptop.ubuntu.nodejs.cluster.csv" using 1:2 with dots title "node cluster", "./python/results.laptop.ubuntu.python.csv" using 1:2 with dots title "python"
# Use this line for vm.debian results
plot "./nodejs/results.vm.debian.nodejs.csv" using 1:2 with dots title "node", "./nodejs.cluster/results.vm.debian.nodejs.cluster.csv" using 1:2 with dots title "node cluster", "./python/results.vm.debian.python.csv" using 1:2 with dots title "python"

quit
