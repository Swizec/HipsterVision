
var http = require('http'),
    querystring = require('querystring'),
    urllib = require('url');


var server = http.createServer(function (req, res) {
    var perform_search = function (query) {
	var geocode = JSON.parse(query.replace('(', '[').replace(')', ']'));
	res.writeHead(200);
	res.write("lat: "+geocode[0]+", lng: "+geocode[1]+"\n");
	res.end();
    }

    if (req.method == 'POST') {
	var raw = '';
	req.on('data', function (chunk) {
	    raw += chunk;
	});
	req.on('end', function () {
	    var query = querystring.parse(raw)['search'];
	    perform_search(query)
	});
    }else{
	var query = querystring.parse(urllib.parse(req.url)['query'])['search'];
	perform_search(query);
    }
});

server.listen(8124, '127.0.0.1');