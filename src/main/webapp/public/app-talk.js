require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['js/modules/talk', 'js/modules/dukecon', 'js/modules/widgets'], function(talk, dukecon) {
    dukecon.initializeApp();
    talk.initializeTalks();
});
