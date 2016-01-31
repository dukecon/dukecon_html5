var browserSync = require('browser-sync');
var gulp = require('gulp');
var zip = require('gulp-zip');
//var uglify = require('gulp-uglify');
//var concat = require('gulp-concat');
var del = require('del');
var proxyMiddleware = require('http-proxy-middleware');
var historyApiFallback = require('connect-history-api-fallback');
var runSequence = require('run-sequence');
var argv = require('yargs').argv;
var pkg = require('./package.json');

var dest = './target',
    src = './src/main/webapp/public';


var backendurl = (argv.backendurl === undefined || argv.backendurl == '') ?
    (argv.local === undefined) ? 'https://dev.dukecon.org/latest' : 'http://localhost:8080' :
    argv.backendurl;

// proxy all spring-boot service requests to a server
var proxy = proxyMiddleware('/rest', {
    target: backendurl,
    changeOrigin: true
});

var config = {
    browserSync: {
        server: {
            // We're serving the src folder as well
            // for sourcemap linking
            baseDir: [dest, src],
            middleware: [proxy, historyApiFallback()]
        },
        files: [
            dest + '/public/**/*'
        ]
    },
    assets: {
        src: src + '/**/*',
        dest: dest + '/public'
    }
};

// BUILD
gulp.task('build', function () {
    return runSequence(
        ['clean'],
        ['assets'],
        ['zip']
    );
});

// WATCH
gulp.task('watch', ['browserSync'], function () {
    gulp.watch(config.assets.src, ['assets']);
});

// BROWSER SYNC
gulp.task('browserSync', ['build'], function () {
    browserSync(config.browserSync);
});

// ASSETS
gulp.task('assets', function () {
    return gulp.src(config.assets.src)
        .pipe(gulp.dest(config.assets.dest));
});

// ZIP
gulp.task('zip', function () {
    var build = process.env.BUILD_NUMBER || '';
    build = ((build) ? '-' : '') + build;
    return gulp.src(
        [dest + '/public/**/*'],
        {base: 'target'})
        .pipe(zip(dest + '/' + pkg.name + build + '.zip'))
        .pipe(gulp.dest('.'));
});

gulp.task('clean', function () {
    return del([dest]);
});
