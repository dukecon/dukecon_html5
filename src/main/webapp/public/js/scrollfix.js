var duke_cachestatus;
var duke_status;

// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
	window.applicationCache.addEventListener('updateready', function(e) {
		duke_cachestatus = 'updateready';
		duke_status = window.applicationCache.status;
	}, false);
	window.applicationCache.addEventListener("error", function(e) {
		duke_cachestatus = 'error';
	});
	window.applicationCache.addEventListener("cached", function(e) {
		duke_cachestatus = 'cached';
	});
	window.applicationCache.addEventListener("noupdate", function(e) {
		duke_cachestatus = 'noupdate';
	});
}, false);

////////////////////////////////
// fixscroll.js:
// call loadP and unloadP when body loads/unloads and scroll position will not move
function getScrollXY() {
    var x = 0, y = 0;
    if( typeof( window.pageYOffset ) == 'number' ) {
        // Netscape
        x = window.pageXOffset;
        y = window.pageYOffset;
    } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
        // DOM
        x = document.body.scrollLeft;
        y = document.body.scrollTop;
    } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
        // IE6 standards compliant mode
        x = document.documentElement.scrollLeft;
        y = document.documentElement.scrollTop;
    }
    return [x, y];
}
           
function setScrollXY(x, y) {
    window.scrollTo(x, y);
}
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

var closeCookieDisclaimer = function () {
	createCookie('dukecon.cookiesConfirmed', '1', 1);
	document.getElementById('cookies').style.display = "none";
};

function loadP(pageref){
	x=readCookie(pageref+'x');
	y=readCookie(pageref+'y');
	setScrollXY(x,y)
}
function unloadP(pageref){
	s=getScrollXY()
	createCookie(pageref+'x',s[0],0.1);
	createCookie(pageref+'y',s[1],0.1);
}

var hideLoading = function (delayMs) {
	var loadingDiv = $('#loading'), contentDiv = $('.content');
	// tried knockout-event-catching (ko.bindingHandlers...) but it doesn't work, so adding a minimal timeout here to avoid watching the screen render
	setTimeout(function () {
		contentDiv.removeClass('hidden');
		if (!loadingDiv.hasClass('hidden')) {
			loadingDiv.addClass('hidden');
		}
	}, delayMs ? delayMs : 5);
};