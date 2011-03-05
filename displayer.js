
var http = require('http'),
    fs = require('fs'),
    redis = require('redis').createClient(),
    parrot = require('parrot');


var server = http.createServer(function (req, res) {
    res.writeHead(200);

    redis.get('HV:last-search', function (err, data) {
	var images = JSON.parse(data)['result']['images'];

	//console.log(images);
	
	fs.readFile('frontend/index.html', function(err, data) {
	    res.write(parrot.render(data,
				    {cache: 0,
				     sandbox: {images: images}}));
	    res.end();
	});
    });
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');