
var http = require('http'),
    querystring = require('querystring'),
    urllib = require('url');


var server = http.createServer(function (req, res) {
    var query = ''

    var respond = function () {
	res.writeHead(200);
	res.write("You searched for: "+query+"\n");
	res.end();
    }

    if (req.method == 'POST') {
	var raw = '';
	req.on('data', function (chunk) {
	    raw += chunk;
	});
	req.on('end', function () {
	    query = querystring.parse(raw)['search'];
	    respond()
	});
    }else{
	query = querystring.parse(urllib.parse(req.url)['query'])['search'];
	respond();
    }
});

server.listen(8124, '127.0.0.1');