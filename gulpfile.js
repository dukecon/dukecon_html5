var browserSync = require('browser-sync');
var gulp = require('gulp');
var zip = require('gulp-zip');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
//var uglify = require('gulp-uglify');
//var concat = require('gulp-concat');
var del = require('del');
var maven = require('gulp-maven-deploy');
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
            baseDir: [dest + '/public', src],
            middleware: [proxy, historyApiFallback()]
        },
        files: [
            dest + '/public/**/*'
        ]
    },
    sass: {
        src: [src + '/**/*.scss'],
        includePaths: [],
        dest: dest + '/public'
    },
    assets: {
        src: [src + '/**/*', '!' + src + '/**/*.scss'],
        dest: dest + '/public'
    }
};

gulp.task('default', ['watch']);

// BUILD
gulp.task('build', function () {
    return runSequence(
        ['clean'],
        ['sass', 'assets'],
        ['zip']
    );
});

// WATCH
gulp.task('watch', ['browserSync'], function () {
    gulp.watch(config.sass.src, ['sass']);
    gulp.watch(config.assets.src, ['assets']);
});

// BROWSER SYNC
gulp.task('browserSync', ['build'], function () {
    browserSync(config.browserSync);
});

// SASS
gulp.task('sass', function () {
    return gulp.src(config.sass.src)
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: config.sass.includePaths}).on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.sass.dest));
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

// MAVEN
gulp.task('deploy', function() {
    gulp.src('.')
        .pipe(maven.deploy({
            'config': {
                'groupId': 'org.dukecon',
                'type': 'zip',
                'version': pkg.version,
                'buildDir': 'target',
                'repositories': [
                    {
                        'id': 'dukecon',
                        'url': 'http://dev.dukecon.org/nexus/content/groups/public'
                    }
                ]
            }
        }))
});

gulp.task('deploy-local', function(){
    gulp.src('.')
        .pipe(maven.install({
            'config': {
                'groupId': 'org.dukecon',
                'type': 'zip',
                'version': pkg.version,
                'buildDir': 'target'
            }
        }))
});
