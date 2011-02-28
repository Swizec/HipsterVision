
var https = require('https'),
http = require('http'),
querystring = require('querystring'),
urllib = require('url'),
redis = require('redis').createClient();

CLIENT_ID = 'd1ca75d66977495db80ff240d54eb6d4';
CLIENT_SECRET = '74adf5ff7a26481c810b5cf8cb7f1e8b';

exports.subscribe = function (latitude, longitude, radius) {
    /*curl -F 'client_id=CLIENT-ID' \
      -F 'client_secret=CLIENT-SECRET' \
      -F 'object=geography' \
      -F 'aspect=media' \
      -F 'lat=35.657872' \
      -F 'lng=139.70232' \
      -F 'radius=1000' \
      -F 'callback_url=http://YOUR-CALLBACK/URL' \
      https://api.instagram.com/v1/subscriptions/
    */

    var body = querystring.stringify({'client_id': CLIENT_ID,
				      'client_secret': CLIENT_SECRET,
				      'verify_token': 'token-of-verification',
				      'object': 'geography',
				      'aspect': 'media',
				      'lat': latitude,
				      'lng': longitude,
				      'radius': radius,
				      'callback_url': 'http://hipstervision.org/notify/'});

    var options = {
	host: 'api.instagram.com',
	port: 443,
	path: '/v1/subscriptions/',
	method: 'POST',
	headers: {'Content-Length': body.length},
    };

    var req = https.request(options, function(res) {
	console.log("statusCode: ", res.statusCode);
	console.log("headers: ", res.headers);

	res.on('data', function(d) {
	    process.stdout.write(d);
	});
    });
    req.write(body);
    
    req.end();

    req.on('error', function(e) {
	console.error(e);
    });
};

var publish_images = function (input_data, recursion) {
    var recursion = recursion || 0;
    console.log(input_data);

    for (var i = 0; i < input_data.length; i++) {
	var time = input_data[i]['time'];

	var options = { 
	    host: 'api.instagram.com',
	    path: '/v1/media/search?lat=37.7793&lng=-122.4192&distance=5000&client_id='+CLIENT_ID+'&max_timestamp='+(time+1)+'&min_timestamp='+(time-1) }

	console.log('https://api.instagram.com/'+options.path);

	https.get(options, function (res) {
	    var data = "";
	    res.on("data", function (chunk) { data+= chunk });
	    res.on("end", function () {
		console.log("got images");
		var images = JSON.parse(data)['data'];

		console.log(images.length);

		var published = false;
		for (var j = 0; j < images.length; j++) {
		    var image = images[j];
		
		    console.log(image['created_time']+" "+time);

		    if (image['created_time'] == time) {
			console.log("PUBLISHING");
			console.log(image['images']['low_resolution']['url']);
			redis.publish("instagram-updates", image['images']['low_resolution']['url']);

			published = true;
			break;
		    }
		}

		if (!published && recursion < 5) {
		    console.log(input_data[i]);
		    setTimeout(function () {publish_images([input_data[i]], recursion+1)},
			       10000);
		}
	    });
	}).on("error", function (e) {
	    console.error(e);
	});
    }
}

var get_callback = function (req, res) {
    var query = urllib.parse(req.url, true);

    res.writeHead(200);
    res.write(query.query['hub.challenge']);
    res.end();
}

var post_callback = function (req, res) {
    var data = '';
    req.on('data', function (buff) {
	data += buff;
    });
    req.on('end', function () {
	console.log(data);

	publish_images(JSON.parse(data));

	res.writeHead(200);
	res.end();
    });
}

exports.listener = http.createServer(function (req, res) {
    if (req.method == 'GET') {
	get_callback(req, res);
    }else{
	post_callback(req, res);
    }
});

exports.listener.listen(8124, '127.0.0.1', function () {
    var cities = [{'lat': 46.055556, 'lon': 14.508333}, // ljubljana
		  {'lat': 37.7793, 'lon': -122.4192}, // san francisco
		  //		  {'lat': , 'lon': },
		  //		  {'lat': , 'lon': },
		  //		  {'lat': , 'lon': },
		  //		  {'lat': , 'lon': },
		  //		  {'lat': , 'lon': },];
		 ];
    for (var i = 0; i < cities.length; i++) {
	exports.subscribe(cities[i].lat, cities[i].lon, 5000);
    }
});
