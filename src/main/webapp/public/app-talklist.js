require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['js/modules/talklist', 'js/modules/dukecon', 'js/modules/languageutils', 'js/modules/widgets', 'js/modules/dukecloak'], function(talk, dukecon, languageUtils) {
    languageUtils.init();
    talk.initializeTalkList();
    dukecon.cookiesConfirmed(readCookie('dukecon.cookiesConfirmed') !== '1');
});
