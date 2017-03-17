require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
	"domReady": "js/domReady",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['js/modules/talklist', 'js/modules/dukecon', 'js/modules/widgets', 'js/modules/dukecloak', 'domReady!'], function(talk, dukecon) {
    dukecon.initializeApp();
    talk.initializeTalkList();
    dukecon.cookiesConfirmed(readCookie('dukecon.cookiesConfirmed') !== '1');
});
