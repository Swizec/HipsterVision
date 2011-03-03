
var http = require('http'),
    querystring = require('querystring'),
    urllib = require('url'),
    settings = require('./settings.js'),
    instagram = require('instagram').createClient(settings.client_id,
						  settings.client_secret);


var server = http.createServer(function (req, res) {
    var respond = function (images, error) {
	var body = JSON.stringify({images: images}); 
	res.writeHead(200, {
	    'Content-Type': 'application/json'
	});
	res.write(body);
	res.end();
    }

    var perform_search = function (query, before) {
	if (query != '!popular') {
	    var geocode = JSON.parse(query.replace('(', '[').replace(')', ']'));
	    
	    var options = {lat: geocode[0],
			   lng: geocode[1],
			   distance: 5000};
	    if (before != null) {
		options.max_timestamp = before;
	    }

	    instagram.media.search(options, respond);
	}else{
	    instagram.media.popular(respond);
	}
    }

    if (req.method == 'POST') {
	var raw = '';
	req.on('data', function (chunk) {
	    raw += chunk;
	});
	req.on('end', function () {
	    var query = querystring.parse(raw);

	    perform_search(query['search'], query['before']);
	});
    }else{
	var query = querystring.parse(urllib.parse(req.url)['query']);

	perform_search(query['search'], query['before']);
    }
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');
