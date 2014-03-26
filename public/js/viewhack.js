///////////////////////////
//
// INITIALIZATION
//

// Scrolling animations
var scrollTimer;
var scroller;
var autoReelTimeout;

// Layout miscellany
var reelTarget;
var reelclipWidth;
var featureHeight;
var menuSpot;

// Reels
var loadedReels = {};
var subReels = {};
var renderedReels = {};
var currentReel = '';

// Device mode
var isPhone = false;

$(document).ready(function() {

	// Check if we're in 1 column mode
	isPhone = (window.innerWidth < 481);

	loadMasonryGutterResets();
	preloadReels();

	// Load carousel images
	if (!isPhone) {
		for (var i = 0; i < featureImages.length; i++) {
			$('#carousel_item' + i).css( {
				'background-image' : 'url(' + featureImages[i] + ')'
			});
		}
	}

	// Resize sections to window height
	renderLayout();
	$(window).resize(function() {
		renderLayout();
	});

	// Start carousels
	$('.carousel').carousel({ interval: 6000 });

	if (!isPhone) {
		// Start scrollspy
		$('body').scrollspy();
		// This code is to make sure that Scrollspy only 
		// lights up one (first) reel when on reels page, 
		// not all reels.
		$("#reel-picker li").on("activate", function() {
			if ($("#reel-picker .active").size() > 1) {
				$("#reel-picker .active").removeClass('active');
				if (currentReel == '') {
					// Show first reel if reels scrolled to rather than clicked
					autoReelTimeout = setTimeout(function(){
						if (scroller.blockIndex == 1) {
							activateReel( $('#reel-picker li:first-child a') );
							clearTimeout(autoReelTimeout);
						}
					}, 1300);
				} else {
					activateReel( $("[data-token='" + currentReel + "']") );
				}
			}
		});	
	}

	// Set click actions on internal nav
	addActionsToMainNav();

	// Initialize scrolling animations
	defineScrollRules();
	checkScrolls();
	$(window).scroll(checkScrolls);

});

///////////////////////////
//
// LAYOUT AND SCROLLING
//

function renderLayout() {

	isPhone = (window.innerWidth < 481);

	if (!isPhone) {

		// Figure out where the picker goes
		reelTarget = $('#reels').offset().top;

		// Set page height
		$('.pageContent').css('min-height', Math.round(window.innerHeight));

		// Get size for masonry columns
		reelclipWidth = Math.round( ($('#reels-container').width() - 20) / 3) - 12;

		// Set carousel height
		featureHeight = Math.round(window.innerHeight - $('#features').position().top) - 150;
		$('#features, #features .carousel-inner, #features .item, #features a.screener').css({height: featureHeight });

		// Set menu placement for home page
		menuSpot 		= Math.round($('#features').position().top + featureHeight);
		mainMenuSpot 	= menuSpot - 20 - $('#reel-picker').height();
		globalMenuSpot 	= menuSpot + 20;
		$('ul#reel-picker').css({ top: mainMenuSpot });
		$('ul#global').css({top: globalMenuSpot });

		setDetentTimer();

	} else {
		reelclipWidth = $('#reels-container').width() - 2;
	}

	// Start isotope
	$('#reels-container').isotope({
		masonry: {
			columnWidth: reelclipWidth + 10,
			gutterWidth: 10
		}
	});

}

function defineScrollRules() {

	if (!isPhone) {

	    // Initialize scrollorama
	    scroller = $.scrollorama({
	        blocks: 'section',
	        enablePin: false
	    });

	    // Move menus up...
	    scroller
		    .animate('ul#reel-picker', {
				duration: reelTarget,
				property: 'top',
				start: mainMenuSpot,
				end: 120,
				easing: 'easeOutQuad'
		    })
		    .animate('ul#global', {
				duration: reelTarget,
				property: 'top',
				start: globalMenuSpot,
				end: 300,
				easing: 'easeOutQuad'
		    });

	}

}

// Every time scroll detected, do things on scroll 
// not covered by Scrollorama rules
function checkScrolls() {

	if (!isPhone) {

		// Hide footer shadow on the home page
		if ($(window).scrollTop() < 100) {
			$('#footer').fadeOut();
		} else {
			$('#footer').fadeIn();
		}

		// Do parallax
		buildParallax();

		// Wait a bit, then check if we need a detent
		setDetentTimer();

	}

}

// The next two funcs "clean up" scroll to center on page if needed

// Delay a bit to make sure done scrolling...
function setDetentTimer() {
	clearTimeout(scrollTimer);
	scrollTimer = setTimeout(findDetent, 600);
}

// ... then clean up the scroll
function findDetent() {

	clearTimeout(scrollTimer);

	if (!isPhone) {

		var currentScroll 	= $('body').scrollTop();
		var detentLimit 	= parseInt( $('#home').outerHeight() * 0.5 );
		var thisSection		= $($('section').get(scroller.blockIndex)).find('.pageContent').get(0);
		var nextSection 	= $($('section').get(scroller.blockIndex + 1)).find('.pageContent').get(0);

		if (Math.abs(currentScroll - $(thisSection).offset().top) > 3)  {

			// Is there a section after the current one?
			if ($(nextSection).length) {
				// Is current scroll position very close to that next section?
				if ( Math.abs(currentScroll - $(nextSection).offset().top ) < detentLimit) {
					doScroll('#' + $(nextSection).attr('id'), 300);
					return true;
				}
			}

			// Is the current page a non-long page?
			if (Math.abs($(thisSection).outerHeight() - window.innerHeight) < 5) {
				doScroll('#' + $(thisSection).attr('id'), 300);
				return true;
			}


		}
		
	}

}

// Scroll to a specific item
function doScroll(where, timing) {

	clearTimeout(scrollTimer);

	$('body').scrollTo(where, timing, {
		easing: 'swing', 
		axis: 'y'
	});

}

// Shift backgrounds of interstitials as you scroll.
function buildParallax() {
	$('.interstitial').each(function(){
		$(this).css('background-position', '50% ' + parallaxOffsetCalc(this, 3) + 'px, 0 ' + parallaxOffsetCalc(this, 10) + 'px');
	});
	
}

// Find top offset of the image to minimize image wrap
function parallaxOffsetCalc(offsetTop, rate) {
	return parseInt( ( $(offsetTop).offset().top - $('body').scrollTop() ) / rate  );
}

// Make things happen when you click the main nav (reels)
function addActionsToMainNav() {
	$('.scrollnav').click(function(e){
		if (isPhone) {
			if ($(this).hasClass('pagenav')) {
				window.location.href = $(this).attr('data-url');
				return false;
			}
		} else {
			// Trigger reels
			if ($(this).hasClass('pagenav')) {
				activateReel( $(this) );
			}
			var dest = $(this).attr('href');
			doScroll(dest, 1500);
			return false;
		}
	});
}

// Load isotope reel. Broken out on its own so it can 
// be triggered by scrolling.
function activateReel(reelLink) {
	$('#reel-picker .active').removeClass('active');
	$(reelLink).parent('li').addClass('active');
	currentReel = reelLink.attr('data-token');
	loadReelContent( currentReel );
}



//////////////////////////////////
//
// LOAD REELS AND RENDER GALLERY
//

// Pull the reels from JSON feeds into JS arrays
function preloadReels() {
	if (!isPhone) {
		$('.pagenav').each(function(reel){
			var token = $(this).attr('data-token');
			loadedReels[token] = [];

			var which_feed = '/feeds/' + token + '.json'

			// Serve up staging server feeds dynamically
			if (document.URL.indexOf('localhost') !== -1 || document.URL.indexOf('staging') !== -1) {
				which_feed = '/reel.json?token=' + token;
			}

			$.getJSON(which_feed, function(reel) {
				$.each(reel['data']['list'], function(key,item) {
					
					// Summarize credits into one field
					var all_credits = '';
					var duotone_credit = '';
					$.each(item['metadata'], function(k,v) {
						if (v['label'] == 'duotone') {
							duotone_credit = v['tags'][0]['label'];
						} else if (v['label'] != 'Year') {
							all_credits += v['label'];
							all_credits += ': ';
							all_credits += v['tags'][0]['label'];
							all_credits += "<br>";
						}
					});
					all_credits = all_credits.replace(/( &middot; )$/, '');
					all_credits = all_credits.replace('"', '&quot;');

					// Grab subreel data, in form of 'Subreel_Film_3_Doc'
					// (Number is position, last part is value)
					var subreel_classes = [];
					$.each(item['keywords'], function(k,v) {
						if (v['label'].match(/subreel/i)) {
							var subreelData = v['label'].split('_');
							if (!subReels[token]) {
								subReels[token] = [];
							}
							subReels[token][parseInt(subreelData[2]) - 1] = subreelData[3];
							subreel_classes.push('subreel-' + subreelData[3].replace(/[^a-zA-Z0-9]/g,"-"));
						}
					});

					loadedReels[token].push({
						thumburl: 		item['media']['large']['url'], 
						thumbwidth: 	item['media']['large']['width'],
						thumbheight: 	item['media']['large']['height'],
						videourl: 		item['media']['primary']['url'],
						videowidth: 	item['media']['primary']['width'],
						videoheight: 	item['media']['primary']['height'],
						title: 			item['title'],
						description: 	item['description'],
						duotone_credit: duotone_credit,
						subreel: 		subreel_classes.join(' '),
						credit: 		all_credits 
					});
				});
			});
		});
	}
}

// Turn a reel JSON into a set of thumbnails, with actions.
function loadReelContent(token) {
	if(loadedReels[token]) {
		// Render reel content
		if (!renderedReels[token]) {
			renderedReels[token] = true;
			var items = [];
			var clipindex = 0;
			$.each(loadedReels[token], function(key, item){
				items.push('<div class="reelclip span3 token-' + token + ' ' + item['subreel'] + '">');
				items.push('<a href="' + item['videourl'] + '" data-clipindex="' + clipindex + '">');
				items.push('<img src="' + item['thumburl'] + '" alt="' + item['title'] + '">');
				items.push('</a>');
				items.push('<div class="reelclip-caption">');
				items.push('<a href="' + item['videourl'] + '" data-clipindex="' + clipindex + '">');
				var title_parts = getTitleParts(item['title']);
				items.push(title_parts[0]);
				if (title_parts[1]) {
					items.push('<span>' + title_parts[1] + '</span>');
				}
				items.push('</a>');
				items.push('</div></div>');
				clipindex += 1;
			});
			$('#reels-container').isotope( 'insert', $(items.join('')) );
			// Add modal video link behavior to new thumbnails
			addVideoLinks();
		}

		// Are there categories/subreels?
		if (subReels[token] && $('#reel-picker .active').hasClass('latest') == false) {
			// 'Show all' button
			$('#subreels').html('');
			$('#subreels').append('<button id="subreel-button-all" class="btn btn-default active" type="button">All</button>');
			$('#subreel-button-all').click(function(){
				$('#subreels-container .active').removeClass('active');
				$(this).addClass('active');
				$('#reels-container').isotope({ filter: '.token-' + token });
			});
			// Buttons for each subreel
			$.each(subReels[token], function(key, item){
				if (item) {
					var item_class = item.replace(/[^a-zA-Z0-9]/g,"-")
					$('#subreels').append('<button id="subreel-button-' + item_class + '" class="btn btn-default" type="button">' + item + '</button>');
					$('#subreel-button-' + item_class).click(function(){
						$('#subreels-container .active').removeClass('active');
						$(this).addClass('active');
						$('#reels-container').isotope({ filter: '.subreel-' + item_class + '.token-' + token });
					});
				}
			});
			$('#subreels-container').show();
		} else {
			$('#subreels-container').hide();
		}
		$('#reels-container').isotope({ filter: '.token-' + token });
	}
}

// Split out the parts of the title into title and client 
function getTitleParts(title) {
	var title_parts;
	if (title.match(/\[/)) {
		title_parts = title.replace(']', '').split('[');
	} else {
		title_parts = title.split('"');
	}
	return title_parts;
}

// Launch video player when thumbnails clicked
function addVideoLinks() {

	// Set up autoplay
	flowplayer(function (api, root) {
	  api.bind("ready", function () {
	  	api.play();	 
	  });
	});

	// Launch player on click
	$('.reelclip a').click(function(){
		renderPlayer($(this));
		return false;
	});
}

function renderPlayer(which_clip){
	var clipIndex = parseInt($(which_clip).attr('data-clipindex'));
	var clipdata = loadedReels[currentReel][clipIndex];
	// Next and previous clips
	var next_clip = $('.token-' + currentReel +  ' a[data-clipindex="' + (clipIndex + 1) + '"]').first();
	var prev_clip = $('.token-' + currentReel +  ' a[data-clipindex="' + (clipIndex - 1) + '"]').first();

	// Player html
	var playerHTML = '<div class="player-container">';
	playerHTML += '<div class="player"></div>';
	playerHTML += '<div class="player-title-container">';
	playerHTML += '<a href="#" class="player-close"></a>';
	var title_parts = getTitleParts(clipdata['title']);
	playerHTML += '<div class="player-title">' + title_parts[0] + '</div>';
	if (title_parts[1].length > 0) {
		playerHTML += '<div class="player-subtitle">' + title_parts[1] + '</div>';
	}
	if (clipdata['credit'].length > 0) {
		playerHTML += '<div class="player-credits">' + clipdata['credit'] + '</div>';
	}
	if (clipdata['duotone_credit'].length > 0) {
		playerHTML += '<div class="player-credits">duotone: ' + clipdata['duotone_credit'] + '</div>';
	}
	if (clipdata['description']) {
		playerHTML += '<div class="player-description">' + clipdata['description'] + '</div>';
	}
	playerHTML += '</div>';
	playerHTML += '</div>';
	if (next_clip.length > 0 || prev_clip.length > 0) {
		playerHTML += '<div class="player-nextprev">';
		if (prev_clip.length > 0) {
			playerHTML += '<a href="#" class="player-prev">Previous</a>';
		}
		if (next_clip.length > 0 && prev_clip.length > 0) {
			playerHTML += " &middot; "
		}
		if (next_clip.length > 0) {
			playerHTML += '<a href="#" class="player-next">Next</a>';
		}
		playerHTML += '</div>';
	}

	$.colorbox({
		html: playerHTML,
		innerHeight: '70%',
		innerWidth: '100%',
		onComplete: function() {
			$(".player").flowplayer({ 
				key: "$495596516396314",
				swf: "/assets/flowplayer.swf",
				analytics: 'UA-36607875-1',
				native_fullscreen: true,
				playlist: [
					[
						{mp4 : clipdata['videourl']}
					]
				],
				adaptiveRatio: true
			}).ready(function(){
				// Adjust width to fit perfectly if clip is bigger than
				// allotted space
				var ph = $(".player").outerHeight();
				var pw = $(".player").outerWidth();
				var ch = $('#cboxLoadedContent').innerHeight();
				if (ph > ch) {
					var new_w = parseFloat(pw) * (parseFloat(ch) / parseFloat(ph));
					$('.player').css({
						width: new_w
					});
				}
			});
			flowplayer($(".player")).play(0);
		}
	});

	$('.player-close').click(function(){
		$.colorbox.close();
		return false;
	});

	$('.player-next').click(function(){
		renderPlayer($(next_clip));
		return false;
	});

	$('.player-prev').click(function(){
		renderPlayer($(prev_clip));
		return false;
	});

    return false;
}

///////////////////////////
//
// ISOTOPE/MASONRY ADD-ONS
//

function loadMasonryGutterResets() {
// modified Isotope methods for gutters in masonry
  $.Isotope.prototype._getMasonryGutterColumns = function() {
    var gutter = this.options.masonry && this.options.masonry.gutterWidth || 0;
        containerWidth = this.element.width();
  
    this.masonry.columnWidth = this.options.masonry && this.options.masonry.columnWidth ||
                  // or use the size of the first item
                  this.$filteredAtoms.outerWidth(true) ||
                  // if there's no items, use size of container
                  containerWidth;

    this.masonry.columnWidth += gutter;

    this.masonry.cols = Math.floor( ( containerWidth + gutter ) / this.masonry.columnWidth );
    this.masonry.cols = Math.max( this.masonry.cols, 1 );
  };

  $.Isotope.prototype._masonryReset = function() {
    // layout-specific props
    this.masonry = {};
    // FIXME shouldn't have to call this again
    this._getMasonryGutterColumns();
    var i = this.masonry.cols;
    this.masonry.colYs = [];
    while (i--) {
      this.masonry.colYs.push( 0 );
    }
  };

  $.Isotope.prototype._masonryResizeChanged = function() {
    var prevSegments = this.masonry.cols;
    // update cols/rows
    this._getMasonryGutterColumns();
    // return if updated cols/rows is not equal to previous
    return ( this.masonry.cols !== prevSegments );
  };
 }
