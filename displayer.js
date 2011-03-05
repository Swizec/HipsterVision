
var http = require('http'),
    fs = require('fs'),
    redis = require('redis').createClient(),
    parrot = require('parrot');


var server = http.createServer(function (req, res) {
    res.writeHead(200);

    redis.get('HV:last-search', function (err, data) {
	if (data != null) {
	    var data = JSON.parse(data);
	    var images = data['result']['images'];
	    var search_query = data['query'];
	}else{
	    var images = [];
	    var search_query = '';
	}
	//console.log(images);
	
	fs.readFile('frontend/index.html', function(err, data) {
	    res.write(parrot.render(data,
				    {cache: 0,
				     sandbox: {images: images,
					       search_query: search_query}}));
	    res.end();
	});
    });
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');
