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

var oldest_timestamp = (new Date()).getTime();

$(document).ready(function () {
    var query = getQuerystring('search', '');
    
    mpmetrics.track('Loaded page');

    if (query != '') {
	$("#search").addClass('small');
	$("#more").css({display: 'block'})
	    .waypoint(infinite_scroll, 
		      {offset: function () {
			  return $.waypoints('viewportHeight') - $(this).outerHeight() + 612;}
		      });
	find_pics(query);
    }

    $(".about").toggle(function () {
	$("#container").addClass('flip');
	$(".image").css({display: "none"});

	mpmetrics.track('Clicked about');

    }, function () {
	$("#container").removeClass('flip');
	$(".image").css({display: "inline-block"});
    });

    $(".image").live('click', function () {
        var $this = $(this);
	if ($this.hasClass('flip')) {
	    $this.removeClass('flip');
	}else{
	    mpmetrics.track('Clicked image', {
		'position': $this.attr('id').split('-')[1]
	    });
   	    $(this).addClass('flip');
	}
    });
    
    $('time').timeago();

    $('.popular').click(function (event) {
	mpmetrics.track('Popular');
    });

    $('form').submit(function () {
	mpmetrics.track('Search', {
	    'query': $('form input[type="text"]').val()
	});
    });
});

function find_pics(query, before) {
    var do_search = function (query) {
	var data = {search: query};
	
	if (before != null) {
	    data['before'] = before;
	}

	$.ajax({url: '/search/',
		dataType: 'json',
		data: data,
		success: function (data) { display_images(data); },
		error: function (jqXHR, err) { error("Something fishy with the server :("); }});			     
    }

    if (query == '') { return 0; };

    if (query != '!popular') {
	var geocoder = new google.maps.Geocoder();

	$("title").html("We're having new age fun with a vintage feel in "+query+"!");

	geocoder.geocode({address: query},
			 function (result, status) {
			     if (status == 'OK') {
				 $("#search input[type='text']").val(result[0].formatted_address);

				 do_search(result[0].geometry.location+"");
			     }else{
				alert("eh!?");
				 error("Google won't talk to us :/");
			     }
			 });
    }else{
	alert("popular!");
	do_search(query);
    }
}


function display_images(images) {
    var images = images.images;
    var $target = $("#display");
    var $proto = $("#proto-image");

    if (images.length < 1) {
	error("No hipsters in "+$("#search input[type='text']").val()+" :'(");
    }

    var display_image = function (i) {
	if (typeof(images[i]) == 'undefined') {
	     if (i < images.length-1) {
           setTimeout(function () { display_image(i+1) }, 50);
        }else{
           $.waypoints('refresh');
        }
	    return;
	}
	
	var d = new Date();
	d.setTime(images[i].created_time*1000);
	oldest_timestamp = images[i].created_time;

	var $image = $proto.clone().attr('class', 'image').attr('id', 'image-'+i);
	$image.appendTo($target);

	$image.find('img').attr('src', images[i].images.low_resolution.url);
        $image.find('label.likes .num').html(images[i].likes.count);
	$image.find('label.caption').html('<strong>'+images[i].user.username+'</strong><time datetime="'+(isodatetime(d))+'" class="timeago"></time>'+((images[i].caption != null) ? '<br/>'+images[i].caption.text : ''));
	
	var $comments = $image.find('.back ul');
	for (var j = 0; j < images[i].comments.data.length; j++) {
	    $comments.append('<li><strong>'+images[i].comments.data[j].from.username+'</strong> '+images[i].comments.data[j].text+'</li>');
	}
	
	$image.find('time').timeago();
	if (i < images.length-1) { 
           setTimeout(function () { display_image(i+1) }, 50);
	}else{
	   $.waypoints('refresh');
	}

	$image.find('time').timeago();
    }

    display_image(0);
}

function infinite_scroll(event, direction) {
    if (direction === 'down') {
	find_pics($("form input[type='text']").val(), oldest_timestamp);
	mpmetrics.track('Infinite scroll');
    }
}


function error(msg) {
    $("#error").html(msg).css({display: 'block'});
    $("#more").css({display: 'none'});
}
