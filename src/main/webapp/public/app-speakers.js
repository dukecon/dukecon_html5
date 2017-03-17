require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
		"domReady": "js/domReady",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['js/modules/speakers', 'js/modules/dukecon', 'js/modules/widgets', 'domReady!'], function(speakers, dukecon) {
    dukecon.initializeApp();
    speakers.initializeSpeakers();
});
