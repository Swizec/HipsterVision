/* Author: 

*/

$(document).ready(function () {
    var long_poll = function () {
	window.log("polling ...");
	$.get('/publish/', function (data) {
	    var data = $.parseJSON(data);
	    
	    for (var i = 0; i<data.length; i++) {
		$.get("https://api.instagram.com/v1/media/search?lat=37.7793&lng=-122.4192&client_id=d1ca75d66977495db80ff240d54eb6d4&distance=5000&max_timestamp="+data[i]['time']+"&min_timestamp="+(data[i]['time']-50),
		      function (data) {
			  var images = $.parseJSON(data);
			  var image = images[images.length-i-1];
			  
			  $("#main").append('<img src="'+image['data']['images']['low_resolution']['url']+'" />');
		      });
	    }

	    long_poll();
	});
    }

    long_poll();
});









