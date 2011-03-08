
var http = require('http'),
    urllib = require('url'),
    querystring = require('querystring'),
    fs = require('fs'),
    redis = require('redis').createClient(),
    settings = require('./settings.js'),
    instagram = require('instagram').createClient(settings.client_id, settings.client_secret),
    parrot = require('parrot');


var server = http.createServer(function (req, res) {
    var query = querystring.parse(urllib.parse(req.url)['query']);

    var serve = function (images, search_query, special_image) {
	console.log('serve');
	res.writeHead(200);
	fs.readFile('frontend/index.html', function(err, data) {
	    res.write(parrot.render(data,
				    {cache: 0,
				     sandbox: {images: images,
					       search_query: search_query,
					       search_query_url: search_query.replace('#', '%23'),
					       special_image: special_image || false}}));
	    res.end();
	});
    }

    if (req.url.substring(0, 5) == '/pic/') {
	var id = req.url.split('/')[2];
	// caching mechanism
	var get_image = function (callback) {
	    redis.get('HV:image:'+id, function (err, image) {
		if (image == null) {
		    instagram.media.id(id, function (image, error) {
			redis.set('HV:image:'+id, JSON.stringify(image));
			redis.expire('HV:image:'+id, 3600); // 1h
			callback(image);
		    });
		}else{
		    callback(image);
		}
	    });
	}

	get_image(function (image) {
	    redis.expire('HV:imgquery:'+id, 18000); // 5 more hours
	    redis.get('HV:imgquery:'+id, function (err, query) {
		query = query || '';
		serve([], query, image);
	    });
	});
    }else{
	if (query['search']) {
	    serve([], '');
	}else{
	    redis.get('HV:last-search', function (err, data) {
		var images = [];
		var search_query = '';
		
		if (data != null) {
		    var data = JSON.parse(data);
		    images = data['result']['images'];
		    search_query = data['query'];
		}
		
		serve(images, search_query);
	    });
	}
    }
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');
