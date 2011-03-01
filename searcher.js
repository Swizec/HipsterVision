
var http = require('http'),
    querystring = require('querystring'),
    urllib = require('url'),
    instagram = require('instagram').createClient('d1ca75d66977495db80ff240d54eb6d4',
						  '74adf5ff7a26481c810b5cf8cb7f1e8b');


var server = http.createServer(function (req, res) {
    var perform_search = function (query) {
	var geocode = JSON.parse(query.replace('(', '[').replace(')', ']'));

	instagram.media.search({lat: geocode[0],
				lng: geocode[1],
				distance: 5000},
			       function (images, error) {
				   res.writeHead(200);
				   res.write(JSON.stringify(images));
				   res.end();
			       });
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