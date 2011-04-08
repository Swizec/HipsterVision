
var http = require('http'),
    querystring = require('querystring'),
    urllib = require('url'),
    settings = require('./settings.js'),
    redis = require('redis').createClient(),
    async = require('async'),
    instagram = require('instagram').createClient(settings.client_id,
						  settings.client_secret),
    lib = require('./lib.js');


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

	async.forEach(images, 
		      function (image, callback) {
			  redis.set('HV:imgquery:'+image.id, query['orig_query'], function (err) {
			      redis.expire('HV:imgquery:'+image.id, 18000); // 5 hours
			  });
		      },
		      function (err) {});

	res.writeHead(200, {
	    'Content-Type': 'application/json'
	});
	res.write(JSON.stringify(result));
	res.end();
    }

    var perform_search = function (query, before) {
	lib.search(query, before, respond);
    }

    if (req.method == 'GET') {
	lib.search(query['search'], query['before'], respond);
    }else{
	res.writeHead(200);
	res.write('We like searches via GET');
	res.end();
    }
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');
