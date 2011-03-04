
var http = require('http'),
    querystring = require('querystring'),
    urllib = require('url'),
    settings = require('./settings.js'),
    instagram = require('instagram').createClient(settings.client_id,
						  settings.client_secret);


var server = http.createServer(function (req, res) {
    var respond = function (images, error, tags) {
	if (tags != null) {
	    var body = JSON.stringify({images: images, tags: tags}); 
	}else{
	    var body = JSON.stringify({images: images}); 
	}
	res.writeHead(200, {
	    'Content-Type': 'application/json'
	});
	res.write(body);
	res.end();
    }

    var perform_search = function (query, before) {
	if (query == '!popular') {
	    instagram.media.popular(respond);
	}else if (query.charAt(0) == '#') {
	    instagram.tags.search(query.replace('#', ''), function (tags, error) {
		instagram.tags.media(tags[0].name, function (images, error) {
		    respond(images, error, tags);
		});
	    });
	}else{
	    var geocode = JSON.parse(query.replace('(', '[').replace(')', ']'));
	    
	    var options = {lat: geocode[0],
			   lng: geocode[1],
			   distance: 5000};
	    if (before != null) {
		options.max_timestamp = before;
	    }

	    instagram.media.search(options, respond);
	}
    }

    if (req.method == 'GET') {
	var query = querystring.parse(urllib.parse(req.url)['query']);

	perform_search(query['search'], query['before']);
    }else{
	res.writeHead(200);
	res.write('We like searches via GET');
	res.end();
    }
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');
