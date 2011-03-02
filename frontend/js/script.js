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
	$("#search").addClass('small');
	find_pics(query);
    }

    $(".about").toggle(function () {
	$("#container").addClass('flip');
	$(".image").css({display: "none"});
    }, function () {
	$("#container").removeClass('flip');
	$(".image").css({display: "inline-block"});
    });

    $(".image").toggle(function () {
	$(this).addClass('flip');
    }, function () {
	$(this).addClass('flip');
    });

    $('time').timeago();
});

function find_pics(query) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({address: query},
		     function (result, status) {
			 if (status == 'OK') {
			     $("#search input[type='text']").val(result[0].formatted_address);
	console.log(result[0].geometry.location+"");
	$.ajax({url: '/search/',
		dataType: 'json',
		data: {search: result[0].geometry.location+""},
		success: function (data) { display_images(data); },
		error: function (jqXHR, err) { error("Something fishy with the server :("); }});			     

			 }else{
			     error("Google won't talk to us :/");
			 }
		     });
}

// random find on internets and fixd a bit
function isodatetime(today) {
    var today = today || new Date();
    var year = today.getYear();
    if (year < 2000) // Y2K Fix, Isaac Powell
	year = year + 1900; // http://onyx.idbsu.edu/~ipowell
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var hour = today.getHours();
    var hourUTC = today.getUTCHours();
    var diff = hour - hourUTC;
    var hourdifference = Math.abs(diff);
    var minute = today.getMinutes();
    var minuteUTC = today.getUTCMinutes();
    var minutedifference;
    var second = today.getSeconds();
    var timezone;
    if (minute != minuteUTC && minuteUTC < 30 && diff < 0) { hourdifference--; }
    if (minute != minuteUTC && minuteUTC > 30 && diff > 0) { hourdifference--; }
    if (minute != minuteUTC) {
	minutedifference = ":30";
    }
    else {
	minutedifference = ":00";
    }
    if (hourdifference < 10) { 
	timezone = "0" + hourdifference + minutedifference;
    }
    else {
	timezone = "" + hourdifference + minutedifference;
    }
    if (diff < 0) {
	timezone = "-" + timezone;
    }
    else {
	timezone = "+" + timezone;
    }
    if (month <= 9) month = "0" + month;
    if (day <= 9) day = "0" + day;
    if (hour <= 9) hour = "0" + hour;
    if (minute <= 9) minute = "0" + minute;
    if (second <= 9) second = "0" + second;
    time = year + "-" + month + "-" + day + "T"
	+ hour + ":" + minute + ":" + second;
    return time;
}

function display_images(images) {
    var images = images.images;
    var $target = $("#display");
    var $proto = $("#proto-image");

    if (images.length < 1) {
	error("No hipsters in "+$("#search input[type='text']").val()+" :'(");
    }

    for (var i = 0; i < images.length; i++) {
	var d = new Date();
	d.setTime(images[i].created_time*1000);
	var $image = $proto.clone().attr('class', 'image').attr('id', 'image-'+i).appendTo($target);

	$image.find('img').attr('src', images[i].images.low_resolution.url);
	$image.siblings('label').html('<strong>'+images[i].user.username+'</strong> <time datetime="'+(isodatetime(d))+'" class="timeago"></time>'+((images[i].caption != null) ? '<br/>'+images[i].caption.text : ''));
	
	var $comments = $image.find('.back ul');
	for (var j = 0; j < images[i].comments.data; j++) {
	    $comments.append('<li><strong>'+images[i].comments.data[j].from.username+'</strong> '+images[i].comments.data[j].text+'</li>');
	}
    }

    $('time').timeago();
}


function error(msg) {
    $("#error").html(msg).css({display: 'block'});
}
