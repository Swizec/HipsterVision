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

var pagination_data = {'timestamp': (new Date()).getTime(),
		       'id': 0,
		       'tag_index': 0};

$(document).ready(function () {
    var query = getQuerystring('search', '');
    
    mpmetrics.track('Loaded page');

    if (query != '') {
	$("#frontpageresult").css({display: 'none'});

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

    $('form input[type="text"]').focus(function () {
	var $this = $(this);
	$("#tips").css({display: 'block', 
			top: ($this.offset().top+$(this).height()-10)+"px", 
			left: ($this.offset().left-5)+"px", 
			width: ($this.outerWidth()-12)+"px"});
    }).blur(function () {
	$("#tips").css({display: 'none'});
    });

    $('.tags a').live('click', function () {
	mpmetrics.track('Clicked suggestion');
    });
});

function find_pics(query, before) {
    var do_search = function (query) {
	var data = {search: query,
		    orig_query: $("input[type='text']").val()};
	
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
query = decodeURIComponent(query);
    if (query == '!popular') {
	do_search(query);
    }else if (query.charAt(0) == '#') {
	$("#search input[type='text']").val(query);
	do_search(query);
    }else{
	var geocoder = new google.maps.Geocoder();

	$("title").html("We're having new age fun with a vintage feel in "+query+"!");

	geocoder.geocode({address: query},
			 function (result, status) {
			     if (status == 'OK') {
				 $("#search input[type='text']").val(result[0].formatted_address);

				 do_search(result[0].geometry.location+"");
			     }else{
				 error("Google won't talk to us :/");
			     }
			 });
    }
}


function display_images(images) {
    if (typeof(images.pagination) != 'undefined') {
	pagination_data.id = images.pagination.next_max_id || -1;
    }
    if (typeof(images.tags) != 'undefined') {
	pagination_data.tags = images.tags;
	var $tags = $(".tags").html('Try: ');
	for (var i=1; i<images.tags.length && i < 10; i++) {
	   $tags.append('<a href="?search=%23'+images.tags[i].name+'">#'+images.tags[i].name+'</a>');
	}
    }

    var images = images.images;
    var $target = $("#display");
    var $proto = $("#proto-image");

    if (images.length < 1) {
	error("No hipsters in "+$("#search input[type='text']").val()+" :'(");
    }

    var tail = function (i) {
	if (i < images.length-1) {
	    setTimeout(function () { display_image(i+1) }, 50);
        }else{
	    $.waypoints('refresh');
        }
    }

    var image_id = $(".image").size();

    var display_image = function (i) {
	if (typeof(images[i]) == 'undefined') {
	    tail(i);
	    return;
	}
	
	var d = new Date();
	d.setTime(images[i].created_time*1000);

	pagination_data.timestamp = images[i].created_time;

	var $image = $proto.clone().attr('class', 'image').attr('id', 'image-'+(image_id+i));
	$image.appendTo($target);

	$image.find('img').attr('src', images[i].images.low_resolution.url);
        $image.find('label.likes .num').html(images[i].likes.count);

	var $caption = $image.find('label.caption');
	$caption.find('strong').html(images[i].user.username);
	$caption.find('time').attr('datetime', isodatetime(d));
	$caption.append((images[i].caption != null) ? '<br/>'+images[i].caption.text : '');

	var $comments = $image.find('.back ul');
	for (var j = 0; j < images[i].comments.data.length; j++) {
	    $comments.append('<li><strong>'+images[i].comments.data[j].from.username+'</strong> '+images[i].comments.data[j].text+'</li>');
	}
	
	$image.find('time').timeago();
	tail(i);
    }

    display_image(0);
}

function infinite_scroll(event, direction) {
    if ($("#more").offset().top < 500) return;
    if (direction === 'down') {
	log('Scrolling!');
	var before = pagination_data.timestamp+":"+pagination_data.id;
	if (pagination_data.id > -1) {
	    var query = (pagination_data.tag_index > 0) ? '#'+pagination_data.tags[pagination_data.tag_index] : getQuerystring('search', '');
	    find_pics(query, before);
	}else{
	    pagination_data.tag_index += 1;
	    find_pics('#'+pagination_data.tags[pagination_data.tag_index].name, before);
	}
	mpmetrics.track('Infinite scroll');
    }
}


function error(msg) {
    $("#error").html(msg).css({display: 'block'});
    $("#more").css({display: 'none'});
}
