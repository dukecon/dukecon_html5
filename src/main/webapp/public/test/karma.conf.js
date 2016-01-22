module.exports = function(config) {
    config.set({
        basePath: '.',
        dir: 'coverage/',
        frameworks: ['jasmine'],
        plugins : ['karma-coverage', 'karma-jasmine', 'karma-chrome-launcher'],
        files: [
            'jasmine/jasmine.js',
            'jasmine/jasmine-html.js',
            'jasmine/boot.js',
            'jasmine/mock-ajax.js',
            '../js/jquery-2.1.4.min.js',
            '../js/knockout-min-3.3.0.js',
            '../js/underscore-min.js',
            '../js/dukecondb.js',
            '../js/dukecon.js',
            '../js/offline.js',
            '../js/talklist.js',
            '../js/ui.js',
            'spec/*.js'
        ],
        browsers: ['Chrome'],
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: { '../js/*.js': ['coverage'] }
    });
};
