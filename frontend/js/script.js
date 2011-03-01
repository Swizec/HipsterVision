/* Author: 

*/

// from 
// http://www.bloggingdeveloper.com/post/JavaScript-QueryString-ParseGet-QueryString-with-Client-Side-JavaScript.aspx
function getQuerystring(key, default_)
{
  if (default_==null) default_=""; 
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
  var qs = regex.exec(window.location.href);
  if(qs == null)
    return default_;
  else
    return qs[1];
}

$(document).ready(function () {
    var long_poll = function () {
	window.log("polling ...");
	$.get('/publish/', function (data) {

	    if (data != '') {
		$("#main").append('<img src="'+data+'" />');
	    }

	    long_poll();
	});
    }

    //long_poll();

    var query = getQuerystring('search', '');

    if (query != '') {
	find_pics(query);
    }
});

function find_pics(query) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({address: query},
		     function (result, status) {
			 if (status == 'OK') {
			     $("#search input[type='text']").val(result[0].formatted_address);
			     
			     $.get('/search/?search='+result[0].geometry.location, display_images);
			 }else{
			     alert('Fuck! Something went wrong talking to google');
			 }
		     });
}

function display_images(images) {
    var images = $.parseJSON(images);
    var $target = $("#display");
    var $proto = $("#proto-image");

    var d = new Date();
    d.setTime(images[0].created_time*1000);



    for (var i = 0; i < images.length; i++) {
	var d = new Date();
	d.setTime(images[i].created_time*1000);
	$proto.clone().attr('class', 'image').appendTo($target).find('img').attr('src', images[i].images.low_resolution.url).siblings('label').html('<strong>'+images[i].user.username+'</strong> <time datetime="'+(d.toUTCString())+'" class="timeago"></time>');
    }

    $('time.timeago').timeago();
}



