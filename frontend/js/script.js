/* Author: 

*/

$(document).ready(function () {
    var long_poll = function () {
	$.get('/publish/', function (data) {
	    $("#main").append("<div>"+data+"</div>");
	    long_poll();
	});
    }
	   
});









