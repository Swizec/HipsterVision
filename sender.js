
var twitter = require('twitter'),
    cron = require('cron'),
    daemon = require('daemon');

var twit = new twitter(require('./settings').twitter);

//twit.post('/statuses/update.json', {status: "This is a test tweet"}, function (data) {
//    console.log(data);
//});

damon.start();

new cron.CronJob('* * * * * *', function(){
    console.log('You will see this message every second');
});