require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
        "domReady": "js/domReady",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['knockout', 'js/modules/dukecon' ,'js/modules/widgets', 'domReady!'], function(ko, dukecon) {
    dukecon.initializeApp();
    //Initialize knockout
    ko.applyBindings(new function() {
        //nothing to do
    });
    hideLoading(10, "dukeConStaticContent");
});
