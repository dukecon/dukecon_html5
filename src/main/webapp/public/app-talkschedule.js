require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
		"domReady": "js/domReady",
        "knockout": "js/knockout-min-3.3.0",
        "moment": "js/moment-with-locales-2.11.2",
        "vis": "js/vis"
    }
});

require(['js/modules/schedule', 'js/modules/dukecon', 'js/modules/widgets', 'js/modules/dukecloak', 'domReady!'], function(schedule, dukecon) {
    dukecon.initializeApp();
    schedule.initialize();
    dukecon.cookiesConfirmed(readCookie('dukecon.cookiesConfirmed') !== '1');
});
