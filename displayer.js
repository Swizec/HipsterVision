
var http = require('http'),
    fs = require('fs'),
    redis = require('redis').createClient(),
    settings = require('./settings.js'),
    instagram = require('instagram').createClient(settings.client_id, settings.client_secret),
    parrot = require('parrot');


var server = http.createServer(function (req, res) {
    var serve = function (images, search_query, special_image) {
	res.writeHead(200);
	fs.readFile('frontend/index.html', function(err, data) {
	    res.write(parrot.render(data,
				    {cache: 0,
				     sandbox: {images: images,
					       search_query: search_query,
					       special_image: special_image}}));
	    res.end();
	});
    }

    if (req.url.substring(0, 5) == '/pic/') {
	var id = req.url.split('/')[2];
	redis.get('HV:image:'+id, function (err, data) {
	    if (data == null) {
		instagram.media.id(id, function (image, error) {
		    redis.set('HV:image:'+id, JSON.stringify(image));
		    redis.expire('HV:imgquery:'+id, 3600);

		    redis.get('HV:imgquery:'+id, function (err, data) {
			serve([], data || '', image);
		    });
		});
	    }else{
		serve([], '', JSON.parse(data));
	    }
	});
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
});

var port = process.argv[2];
server.listen(port, '127.0.0.1');
