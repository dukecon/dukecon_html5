require.config({
    // to set the default folder
    baseUrl: 'js/modules',
    // paths: maps ids with paths (no extension)
    paths: {
        'jquery': "js/jquery-2.1.4.min",
        'underscore': "js/underscore-min",
        'knockout': "js/knockout-min-3.3.0",
        'jasmine' : 'test/jasmine/jasmine',
        'jasmine-html' : 'test/jasmine/jasmine-html',
        'boot' : 'test/jasmine/boot',
        'mock-ajax' : 'test/jasmine/mock-ajax',
    },
});

var jasmineEnv = jasmine.getEnv();
jasmineEnv.updateInterval = 1000;
var specs = [
    'test/spec/dukeconSettingsSpec',
    'test/spec/dukeconSynchSpec',
    'test/spec/dukeconDbSpec',
    'test/spec/dukeconDateUtilsSpec',
    'test/spec/talklistFilterSpec',
    'test/spec/talklistSpec'
];


var currentWindowOnload = window.onload;

window.onload = function() {
    require(specs, function () {
        if (currentWindowOnload) {
            currentWindowOnload();
        }
    });
};


