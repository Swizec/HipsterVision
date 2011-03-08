
var http = require('http'),
    querystring = require('querystring'),
    urllib = require('url'),
    settings = require('./settings.js'),
    redis = require('redis').createClient(),
    instagram = require('instagram').createClient(settings.client_id,
						  settings.client_secret);


var server = http.createServer(function (req, res) {
    var query = querystring.parse(urllib.parse(req.url)['query']);

    var respond = function (images, error, tags) {
	if (tags != null) {
	    var result = {images: images, tags: tags.tags, pagination: tags.pagination}
	}else{
	    var result = {images: images};
	}
	
	if (!query['before'] && images.length > 0) {
	    redis.set('HV:last-search', JSON.stringify({query: query['orig_query'],
							result: result}));
	}

	for (var i=0; i<images.length; i++) {
	    redis.set('HV:imgquery:'+images[i].id, query['orig_query'], function (err) {
		redis.expire('HV:imgquery:'+images[i].id, 18000); // 5 hours
	    });
	}

	res.writeHead(200, {
	    'Content-Type': 'application/json'
	});
	res.write(JSON.stringify(result));
	res.end();
    }

    var perform_search = function (query, before) {
	if (query == '!popular') {
	    instagram.media.popular(respond);
	}else if (query.charAt(0) == '#') {
	    instagram.tags.search(query.replace('#', ''), function (tags, error) {
		var options = {};
		if (before != null) {
		    options.min_id = before.split(':')[1];
		}
		var tag = query.replace('#', '');
		if (tags.length > 0) {
		   tag = tags[0].name;
		}
		instagram.tags.media(tag, options, function (images, error, pagination) {
		    respond(images, error, {tags: tags, pagination: pagination});
		});
	    });
	}else{
	    var geocode = JSON.parse(query.replace('(', '[').replace(')', ']'));
	    
	    var options = {lat: geocode[0],
			   lng: geocode[1],
			   distance: 5000};
	    if (before != null) {
		options.max_timestamp = before.split(':')[0];
	    }

	    instagram.media.search(options, respond);
	}
    }

    if (req.method == 'GET') {
	perform_search(query['search'], query['before']);
    }else{
	res.writeHead(200);
	res.write('We like searches via GET');
	res.end();
    }
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');
