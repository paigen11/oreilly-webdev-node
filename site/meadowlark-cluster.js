const cluster = require('cluster');

function startWorker() {
  const worker = cluster.fork();
  console.log(`CLUSTER: Worker ${worker.id} started`);
}

// isMaster and isWorker determine which context the JS is running in
// master's run directly with node meadowlark-cluster.js
// worker is when Node's cluster system executes it with cluster.fork()
if (cluster.isMaster) {
  require('os').cpus().forEach(startWorker);

  // log any workers that disconnect; if a worker disconnects, it
  // should then exit, so we'll wait for the exit event to spawn
  // a new worker to replace it
  cluster.on('disconnect', (worker) =>
    console.log(`CLUSTER: Worker ${worker.id} disconnected from the cluster.`),
  );

  // when a worker dies (exits) create a worker to replace it
  cluster.on('exit', (worker, code, signal) => {
    console.log(
      `CLUSTER: Worker ${worker.id} died with exit code ${code} (${signal})`,
    );
    startWorker();
  });
} else {
  const port = process.env.PORT || 3000;
  // start the app on worker by simply importing meadowlark.js as a module and immediately invoking with IIFY syntax; see meadowlark.js
  require('./meadowlark.js')(port);
}
