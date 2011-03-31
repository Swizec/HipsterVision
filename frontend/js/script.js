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
    
    if (query == '') {
	if (window.location.toString().indexOf('/pic/') > -1) {
	    mpmetrics.track('Pic page');
	}else{
	    mpmetrics.track('Frontpage');
	}
    }

    if (query != '') {
	mpmetrics.track('Search page');
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
	$("div.image").css({display: "none"});

	mpmetrics.track('Clicked about');

    }, function () {
	$("#container").removeClass('flip');
	$("div.image").css({display: "inline-block"});
    });

    $("a.image").live('click', function (event) {
	var $this = $(this);
	event.preventDefault();

	mpmetrics.track('Clicked image', {
	    'position': $this.attr('id').split('-')[1]
	}, function () {
	alert("measured");	  
 window.location.href = '/pic/'+$this.attr('img_id');
	});
    });
    
    $('time').timeago();

    $('.popular').click(function (event) {
	event.preventDefault();
	var url = $(this).attr('href');
	mpmetrics.track('Popular', {}, function () {
	    window.location = url;
	});
    });

    $('form').submit(function (event) {
	event.preventDefault();
	mpmetrics.track('Search', {
	    'query': $('form input[type="text"]').val()
	}, function () {
	    window.location = '/?search='+encodeURIComponent($('form input[type="text"]').val());
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

    $('.tags a').live('click', function (event) {
	event.preventDefault();
	var url = $(this).attr('href');
	mpmetrics.track('Clicked suggestion', {}, function () {
	    window.location = url;
	});
    });

    FB.init({appId: '115797901829229', status: true, cookie: true,
             xfbml: true});
    FB.Event.subscribe('edge.create', function(response) {
	mpmetrics.track('FB pic like');
    });

    $(".image .liek a").live('click', function () {
	mpmetrics.track('Tweet pic');
    });

    $(".last_search_ref").click(function(event) {
	event.preventDefault();
	var url = $(this).attr('href');
	mpmetrics.track("Last search ref", {}, function () {
	    window.location = url;
	});
    });

    $(".subscribe").click(function (event) {
	event.preventDefault();

	var txt = 'Enter your twitter nick:<br /><input type="text" id="nick" name="nick" placeholder="for example @hipstervision" />';
	
	var subscribe = function (v,m,f){
	    if(v != undefined) {
		now.subscribe(f.nick);
	    }
	}

	$.prompt(txt,{
	    callback: subscribe,
	    buttons: { Subscribe: 'Subscribe' }
	});


	//now.subscribe('swizec', function () {
	//	alert("called back!");
	//});
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
	$("#search input[type='text']").val(query);
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

	var $image = $proto.clone()
	    .attr('class', 'image')
	    .attr('id', 'image-'+(image_id+i))
	    .attr('img_id', images[i].id)
	    .appendTo($target);

	$image.find('img').attr('src', images[i].images.low_resolution.url);
        $image.find('label.likes .num').html(images[i].likes.count);
	$image.find('label.likes').append('<a href="http://twitter.com/share" class="twitter-share-button" data-url="http://hipstervision.org/pic/'+images[i].id+'" data-text="Found a cool pic on hipstervision :D" data-count="none" data-via="hipstervision">Tweet</a>');
	$image.find('label.likes').append('<fb:like href="http://hipstervision.org/pic/'+images[i].id+'" class="fblike" layout="button_count" show_faces="false" width="100"></fb:like>');

	var $caption = $image.find('label.caption');
	$caption.find('strong').html(images[i].user.username);
	$caption.find('time').attr('datetime', isodatetime(d));
	$caption.append((images[i].caption != null) ? '<br/>'+images[i].caption.text : '');

	FB.XFBML.parse($image.find('label.likes')[0]);
	make_twitter();

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
