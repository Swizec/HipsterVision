/* Author: 

*/

$(document).ready(function () {
    var long_poll = function () {
	window.log("polling ...");
	$.get('/publish/', function (data) {
	    $("#main").append("<div>"+data+"</div>");
	    long_poll();
	});
    }

    long_poll();
});









