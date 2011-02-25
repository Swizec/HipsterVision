
var http = require('http'),
redis = require('redis').createClient();

var server = http.createServer(function (req, res) {
    var push_message = function (channel, message) {
	res.writeHead(200);
	res.write(message);
	res.end();
    }

    redis.on("message", push_message);
});


redis.on("subscribe", function (channel, count) {
    server.listen(8125, '127.0.0.1');
});

redis.subscribe("instagram-updates");