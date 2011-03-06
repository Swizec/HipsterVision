var spawn = require('child_process').spawn,
    daemon = require('daemon'),
    fs = require('fs');

var start = function () {
    daemon.start();

    var start_worker = function (port) {
	var child = spawn('node', ['displayer.js', port], {cwd: '/home/swizec/Documents/random-coding/HipsterVision'});
	child.on("exit", function (code) {
	    start_worker(port);
	});
    }

    for (var port = 8114; port < 8123; port++) {
	start_worker(port);
    }
}

var status = function () {
    console.log("No status reporting yet, try ps aux | grep node");
}

var stop = function () {
    process.kill(parseInt(fs.readFileSync(settings.lockFile)));
}

var restart = function () {
    stop();
    start();
}

if (process.argv.length < 3) {
    console.log("Usage: node foreman.js start|stop|status|restart");
}else{
    var task = process.argv[2].toLowerCase();
    
    if (task == 'start') start()
    else if (task == 'status') status()
    else if (task == 'restart') restart()
    else stop();
}
