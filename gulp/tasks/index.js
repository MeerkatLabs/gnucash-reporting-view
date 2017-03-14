/**
 * Inject the Vendors into the index.html as a development environment task.
 */

var config = require('../config'),
    gulp = require('gulp'),
    path = require('path'),
    order = require('gulp-order'),
    inject = require('gulp-inject');

var VENDOR_JS_INJECTION_TAG = '<!-- inject:vendor_js -->',
    VENDOR_CSS_INJECTION_TAG = '<!-- inject:vendor_css -->';

gulp.task('index', ['build', 'build_test', 'sass'], injectIndexSources);
gulp.task('inject', injectIndexSources);

function injectIndexSources() {
    var target = gulp.src(config.products.html.index);

    var sourceList;
    if (config.environment.production) {
        sourceList = [];
        sourceList.push(path.join(config.paths.destination, config.products.js.app));
        sourceList.push(path.join(config.paths.destination, config.products.js.testApp));
    } else {
        sourceList = config.sources.js.all.concat(config.sources.js.testAll);
        sourceList.push(path.join(config.paths.temp, config.sources.js.templates));
        sourceList.push(path.join(config.paths.temp, config.sources.js.templatesTest));
    }

    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(sourceList, {read: false})
        .pipe(order(config.ordering.js, {base: ''}));

    var vendorSources = gulp.src(config.sources.js.vendor, {read:false});

    var cssSources = gulp.src(path.join(config.paths.destination, '**/*.css'), {read: false});

    var vendorCssSources = gulp.src(config.sources.css.vendor, {read:false});

    return target.pipe(inject(sources, {relative: true}))
        .pipe(inject(vendorSources, {relative: true, starttag: VENDOR_JS_INJECTION_TAG}))
        .pipe(inject(cssSources, {relative: true}))
        .pipe(inject(vendorCssSources, {relative: true, starttag: VENDOR_CSS_INJECTION_TAG}))
        .pipe(gulp.dest(config.paths.project));

}

