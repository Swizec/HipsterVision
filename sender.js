
var twitter = require('twitter'),
    cron = require('cron'),
    redis = require('redis').createClient(),
    async = require('async'),
    daemon = require('daemon');

var twit = new twitter(require('./settings').twitter);

//twit.post('/statuses/update.json', {status: "This is a test tweet"}, function (data) {
//    console.log(data);
//});

damon.start();

var poll = function (subscription) {
    
}

var rescore = function () {
    redis.zrange('HV:subscriptions', 0, -1, function (err, subscriptions) {
	var first = subscriptions.shift();
	async.forEach(subscriptions, function (subscription, callback) {
	    redis.zadd('HV:subscriptions', subscription.
		       
		      }, function (err) {
		      });
	});
    });
}

new cron.CronJob('0 * * * * *', function(){
    redis.zrange('HV:subscriptions', 0, 0, function (err, subscription) {
	poll(subscription);
	rescore();
    }); 
});