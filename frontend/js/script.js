/* Author: 

*/

$(document).ready(function () {
    var long_poll = function () {
	window.log("polling ...");
	$.get('/publish/', function (data) {

	    $("#main").append('<img src="'+data+'" />');

	    long_poll();
	});
    }

    long_poll();
});









