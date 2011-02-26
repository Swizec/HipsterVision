
var http = require('http'),
redis = require('redis').createClient();

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

    var timeout = function () {
	push_message();
	timeouter.removeListener("timeout-poll", timeout)
    }

    redis.on("message", push_message);
    timeouter.on("timeout-poll", timeout)
});


redis.on("subscribe", function (channel, count) {
    server.listen(8125, '127.0.0.1');
});

redis.subscribe("instagram-updates");