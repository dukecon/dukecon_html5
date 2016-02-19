module.exports = function(config) {
    config.set({
        basePath: '../',
        dir: '../test/coverage/',
        frameworks: ['jasmine'],
        plugins : ['karma-coverage', 'karma-jasmine', 'karma-chrome-launcher'],
        files: [
            'test/jasmine/jasmine.js',
            'test/jasmine/jasmine-html.js',
            'test/jasmine/boot.js',
            'test/jasmine/mock-ajax.js',
            'js/require.js',
            'js/jquery-2.1.4.min.js',
            'js/knockout-min-3.3.0.js',
            'js/underscore-min.js',
            'js/modules/dukecondb.js',
            'js/modules/dukeconsettings.js',
			'js/modules/dukecon.js',
            'js/modules/offline.js',
            'js/modules/talklist.js',
            'js/ui.js',
            'test/spec/dukeconSettingsSpec.js',
            'test/spec/dukeconSynchSpec.js',
            'test/spec/dukeconDbSpec.js'
        ],
        shim: {
            jasmine: {
                exports: 'jasmine'
            },
            'jasmine-html': {
                deps: ['jasmine'],
                exports: 'jasmine-html'
            }
        },
        browsers: ['Chrome'],
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: { '*.js': ['coverage'] }
    });
};
