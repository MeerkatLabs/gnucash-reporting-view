/**
 * Combine all of the html files into a template cache.
 */

var gulp = require('gulp'),
    templateCache = require('gulp-angular-templatecache'),
    order = require('gulp-order'),
    config = require('../config');

gulp.task('templates_test', buildTemplateTestJS);

function buildTemplateTestJS() {
    return gulp.src(config.sources.html.testAll)
        .pipe(order(config.ordering.html))
        .pipe(templateCache(config.sources.js.templatesTest, {module: config.names.angular.testModuleName}))
        .pipe(gulp.dest(config.paths.temp));
}