
var http = require('http'),
redis = require('redis').createClient(),
EventEmitter = require('events').EventEmitter;

var timeouter = new EventEmitter();

setInterval(function () {
    timeouter.emit("timeout-poll");
}, 20000);

var server = http.createServer(function (req, res) {
    var push_message = function (channel, message) {
	res.writeHead(200);
	res.write(message);
	res.end();
    }

    redis.on("message", push_message);
    timeouter.on("timeout-poll", function () {
	res.writeHead(200);
	res.end();
    })
});


redis.on("subscribe", function (channel, count) {
    server.listen(8125, '127.0.0.1');
});

redis.subscribe("instagram-updates");
