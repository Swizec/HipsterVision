
var twitter = require('twitter'),
    cron = require('cron'),
    redis = require('redis').createClient(),
    async = require('async'),
    lib = require('./lib.js'),
    settings = require('./settings.js'),
    Bitly = require('bitly').Bitly,
    daemon = require('daemon');

var twit = new twitter(require('./settings').twitter);
var bitly = new Bitly(settings.bitly.name, settings.bitly.key);

daemon.start();

var notify = function (query, N) {
    redis.smembers('HV:subscription:'+query, function (err, subscribers) {
	async.forEach(subscribers, function (subscriber, callback) {
	    subscriber = JSON.parse(subscriber);
	    var url = 'http://hipstervision.org/?search='+encodeURIComponent(subscriber.label)+'&utm_source=notification';
	    bitly.shorten(url, function (url) {
		url = url.data.url;
		twit.post('/statuses/update.json', 
			  {status: '@'+subscriber.user+' there\'s '+N+' shiny new images for '+subscriber.label+' '+url},
			  function (data) {
			      callback();
			  });
	    });
	}, function (err) {});
    });
}

var poll = function (query) {
	query = query[0];
    lib.search(query, null, function (images, error) {
	redis.get('HV:subscription:oldtime:'+query, function (err, oldtime) {
	    async.filter(images, function (image, callback) {
		callback(image.created_time > oldtime);
	    }, function (images) {
		if (images.length > 0) {
		    redis.set('HV:subscription:oldtime:'+query, images[0].created_time);
		    notify(query, images.length);
		}
	    });
	    
	});
    });
}

var rescore = function (callback) {
	var callback = callback || function () {}
    redis.zrange('HV:subscriptions', 0, -1, 'withscores', function (err, subscriptions) {
        var first = {key: subscriptions.shift(),
                     score: subscriptions.shift()};
        var score, key;

        for (var i=0; i<subscriptions.length;) {
            key = subscriptions[i++];
            score = subscriptions[i++];
            redis.zadd('HV:subscriptions', score-1, key);
        }

        redis.zadd('HV:subscriptions', Math.ceil(subscriptions.length/2), first.key, function (err) {
            callback();
        });
    });
}


var do_cron = function () {
   redis.zrange('HV:subscriptions', 0, 0, function (err, subscription) {
        poll(subscription);
        rescore();
    });
}

new cron.CronJob('0 * * * * *', do_cron);
