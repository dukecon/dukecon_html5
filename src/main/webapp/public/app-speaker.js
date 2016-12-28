require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['js/modules/speaker', 'js/modules/dukecon', 'js/modules/widgets'], function(speaker, dukecon) {
    dukecon.initializeApp();
    speaker.initializeSpeakers();
    hideLoading(10, "dukeConSpeaker");
});
