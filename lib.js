
var settings = require('./settings.js'),
    instagram = require('instagram').createClient(settings.client_id,
						  settings.client_secret);

exports.search = function (query, before, callback) {
    var callback = callback || function () {};

    if (query == '!popular') {
	instagram.media.popular(callback);
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
		callback(images, error, {tags: tags, pagination: pagination});
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

	instagram.media.search(options, callback);
    }
}