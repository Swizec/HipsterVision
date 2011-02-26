
var http = require('http'),
redis = require('redis').createClient(),
EventEmitter = require('events').EventEmitter;

var server = http.createServer(function (req, res) {
    var push_message = function (channel, message) {
	res.writeHead(200);
	res.write(message);
	res.end();
    }

    redis.on("message", push_message);
    setTimeout(function () { push_message('', '') },
	       29000);
});


redis.on("subscribe", function (channel, count) {
    server.listen(8125, '127.0.0.1');
});

redis.subscribe("instagram-updates");
