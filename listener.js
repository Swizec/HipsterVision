
var https = require('https'),
querystring = require('querystring'),
urllib = require('url');

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
				     'object': 'geography',
				     'aspect': 'media',
				     'lat': latitude,
				     'lng': longitude,
				     'radius': radius,
				      'callback_url': 'http://hipstervision.org/notify'});

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



exports.subscribe(46.03, 14.30, 5000);