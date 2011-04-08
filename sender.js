
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

var rescore = function (callback) {
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


new cron.CronJob('0 * * * * *', function(){
    redis.zrange('HV:subscriptions', 0, 0, function (err, subscription) {
	poll(subscription);
	rescore();
    }); 
});